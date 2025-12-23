"""
Vector Store Manager for RAG
Manages embeddings and semantic search using Amazon OpenSearch
"""
import json
import os
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from aws_lambda_powertools import Logger, Tracer
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

logger = Logger()
tracer = Tracer()


@dataclass
class DocumentChunk:
    """Represents a chunk of document for embedding"""
    id: str
    text: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None


class VectorStoreManager:
    """Manages vector embeddings and semantic search"""
    
    def __init__(self):
        self.region = os.environ.get('AWS_REGION', 'us-east-1')
        self.opensearch_endpoint = os.environ.get('OPENSEARCH_ENDPOINT')
        self.index_name = os.environ.get('OPENSEARCH_INDEX', 'documents')
        self.bedrock_client = boto3.client('bedrock-runtime', region_name=self.region)
        
        # Initialize OpenSearch client
        credentials = boto3.Session().get_credentials()
        awsauth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            self.region,
            'es',
            session_token=credentials.token
        )
        
        self.opensearch_client = OpenSearch(
            hosts=[{'host': self.opensearch_endpoint, 'port': 443}],
            http_auth=awsauth,
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection
        )
        
        self._ensure_index_exists()
    
    def _ensure_index_exists(self):
        """Create OpenSearch index if it doesn't exist"""
        
        if self.opensearch_client.indices.exists(index=self.index_name):
            return
            
        index_body = {
            'settings': {
                'index': {
                    'knn': True,
                    'knn.algo_param.ef_search': 512
                }
            },
            'mappings': {
                'properties': {
                    'text': {'type': 'text'},
                    'embedding': {
                        'type': 'knn_vector',
                        'dimension': 1536,
                        'method': {
                            'name': 'hnsw',
                            'space_type': 'l2',
                            'engine': 'nmslib',
                            'parameters': {
                                'ef_construction': 512,
                                'm': 16
                            }
                        }
                    },
                    'metadata': {'type': 'object'},
                    'document_id': {'type': 'keyword'},
                    'chunk_id': {'type': 'keyword'},
                    'timestamp': {'type': 'date'}
                }
            }
        }
        
        self.opensearch_client.indices.create(
            index=self.index_name,
            body=index_body
        )
        logger.info(f"Created OpenSearch index: {self.index_name}")
    
    @tracer.capture_method
    def chunk_document(self, document_data: Dict[str, Any], 
                      chunk_size: int = 1000, 
                      chunk_overlap: int = 200) -> List[DocumentChunk]:
        """Chunk document into smaller pieces for embedding"""
        
        chunks = []
        text_content = document_data.get('text_content', [])
        
        # Combine text content
        full_text = " ".join([t['text'] for t in text_content])
        
        # Simple chunking with overlap
        start = 0
        chunk_id = 0
        
        while start < len(full_text):
            end = start + chunk_size
            chunk_text = full_text[start:end]
            
            chunks.append(DocumentChunk(
                id=f"{document_data.get('metadata', {}).get('document_id', 'unknown')}_{chunk_id}",
                text=chunk_text,
                metadata={
                    'document_id': document_data.get('metadata', {}).get('document_id'),
                    'chunk_index': chunk_id,
                    'start_pos': start,
                    'end_pos': end
                }
            ))
            
            start = end - chunk_overlap
            chunk_id += 1
        
        logger.info(f"Created {len(chunks)} chunks from document")
        return chunks
    
    @tracer.capture_method
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding using Amazon Bedrock"""
        
        try:
            # Use Titan Embeddings model
            response = self.bedrock_client.invoke_model(
                modelId='amazon.titan-embed-text-v1',
                body=json.dumps({
                    'inputText': text
                })
            )
            
            response_body = json.loads(response['body'].read())
            embedding = response_body.get('embedding', [])
            
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    @tracer.capture_method
    def index_chunks(self, chunks: List[DocumentChunk]) -> Dict[str, Any]:
        """Index document chunks with embeddings into OpenSearch"""
        
        indexed_count = 0
        
        for chunk in chunks:
            # Generate embedding
            chunk.embedding = self.generate_embedding(chunk.text)
            
            # Index in OpenSearch
            doc = {
                'text': chunk.text,
                'embedding': chunk.embedding,
                'metadata': chunk.metadata,
                'document_id': chunk.metadata.get('document_id'),
                'chunk_id': chunk.id,
                'timestamp': boto3.Session().client('sts').get_caller_identity()
            }
            
            try:
                self.opensearch_client.index(
                    index=self.index_name,
                    id=chunk.id,
                    body=doc
                )
                indexed_count += 1
                
            except Exception as e:
                logger.error(f"Error indexing chunk {chunk.id}: {e}")
        
        logger.info(f"Indexed {indexed_count} chunks")
        
        return {
            'indexed_count': indexed_count,
            'total_chunks': len(chunks)
        }
    
    @tracer.capture_method
    def semantic_search(self, query: str, k: int = 5, 
                       filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Perform semantic search using vector similarity"""
        
        # Generate query embedding
        query_embedding = self.generate_embedding(query)
        
        # Build OpenSearch query
        search_query = {
            'size': k,
            'query': {
                'knn': {
                    'embedding': {
                        'vector': query_embedding,
                        'k': k
                    }
                }
            }
        }
        
        # Add filters if provided
        if filters:
            search_query['query'] = {
                'bool': {
                    'must': [
                        {'knn': {'embedding': {'vector': query_embedding, 'k': k}}}
                    ],
                    'filter': [
                        {'term': {key: value}} for key, value in filters.items()
                    ]
                }
            }
        
        # Execute search
        try:
            response = self.opensearch_client.search(
                index=self.index_name,
                body=search_query
            )
            
            results = []
            for hit in response['hits']['hits']:
                results.append({
                    'chunk_id': hit['_id'],
                    'text': hit['_source']['text'],
                    'metadata': hit['_source']['metadata'],
                    'score': hit['_score']
                })
            
            logger.info(f"Found {len(results)} results for query")
            return results
            
        except Exception as e:
            logger.error(f"Error performing semantic search: {e}")
            raise
    
    @tracer.capture_method
    def hybrid_search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Perform hybrid search combining semantic and keyword search"""
        
        # Generate query embedding
        query_embedding = self.generate_embedding(query)
        
        # Hybrid query
        search_query = {
            'size': k,
            'query': {
                'bool': {
                    'should': [
                        {
                            'knn': {
                                'embedding': {
                                    'vector': query_embedding,
                                    'k': k
                                }
                            }
                        },
                        {
                            'match': {
                                'text': {
                                    'query': query,
                                    'boost': 0.5
                                }
                            }
                        }
                    ]
                }
            }
        }
        
        try:
            response = self.opensearch_client.search(
                index=self.index_name,
                body=search_query
            )
            
            results = []
            for hit in response['hits']['hits']:
                results.append({
                    'chunk_id': hit['_id'],
                    'text': hit['_source']['text'],
                    'metadata': hit['_source']['metadata'],
                    'score': hit['_score']
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error performing hybrid search: {e}")
            raise
    
    @tracer.capture_method
    def get_context_for_query(self, query: str, max_chunks: int = 5) -> str:
        """Retrieve relevant context for RAG"""
        
        results = self.hybrid_search(query, k=max_chunks)
        
        # Combine results into context
        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(f"[Source {i}]:\n{result['text']}\n")
        
        return "\n".join(context_parts)
