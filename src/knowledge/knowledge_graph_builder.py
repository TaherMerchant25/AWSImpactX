"""
Hierarchical Knowledge Graph Builder
Creates and maintains knowledge graph from extracted documents
"""
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
from aws_lambda_powertools import Logger, Tracer
import boto3

logger = Logger()
tracer = Tracer()


class EntityType(Enum):
    """Types of entities in the knowledge graph"""
    COMPANY = "Company"
    PERSON = "Person"
    CONTRACT = "Contract"
    RISK = "Risk"
    COMPLIANCE = "Compliance"
    FINANCIAL = "Financial"
    ESG = "ESG"
    TECHNOLOGY = "Technology"
    GEOGRAPHY = "Geography"


class RelationType(Enum):
    """Types of relationships in the knowledge graph"""
    INVOLVES = "INVOLVES"
    HAS_RISK = "HAS_RISK"
    REQUIRES_COMPLIANCE = "REQUIRES_COMPLIANCE"
    CONTAINS_FINANCIAL = "CONTAINS_FINANCIAL"
    RELATED_TO = "RELATED_TO"
    LOCATED_IN = "LOCATED_IN"
    EMPLOYS = "EMPLOYS"
    OWNS = "OWNS"
    PARTNERS_WITH = "PARTNERS_WITH"


@dataclass
class Entity:
    """Represents an entity in the knowledge graph"""
    id: str
    type: EntityType
    name: str
    properties: Dict[str, Any]
    confidence: float


@dataclass
class Relationship:
    """Represents a relationship between entities"""
    source_id: str
    target_id: str
    type: RelationType
    properties: Dict[str, Any]
    confidence: float


class KnowledgeGraphBuilder:
    """Builds hierarchical knowledge graph from document data"""
    
    def __init__(self, neo4j_client=None):
        self.neo4j_client = neo4j_client
        self.entities: Dict[str, Entity] = {}
        self.relationships: List[Relationship] = []
        
    @tracer.capture_method
    def extract_entities(self, document_data: Dict[str, Any]) -> List[Entity]:
        """Extract entities from structured document data"""
        
        entities = []
        text_content = document_data.get('text_content', [])
        forms = document_data.get('forms', [])
        tables = document_data.get('tables', [])
        
        # Extract from text using NER patterns
        entities.extend(self._extract_from_text(text_content))
        
        # Extract from forms (structured key-value pairs)
        entities.extend(self._extract_from_forms(forms))
        
        # Extract from tables
        entities.extend(self._extract_from_tables(tables))
        
        # Deduplicate entities
        entities = self._deduplicate_entities(entities)
        
        return entities
    
    def _extract_from_text(self, text_content: List[Dict]) -> List[Entity]:
        """Extract entities using pattern matching and NER"""
        
        entities = []
        full_text = " ".join([t['text'] for t in text_content])
        
        # Company patterns
        company_patterns = [
            r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\s+(?:Inc\.|LLC|Corp\.|Ltd\.|Limited)\b',
        ]
        
        # Financial patterns
        financial_patterns = [
            r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:million|billion|M|B)?',
        ]
        
        # Risk keywords
        risk_keywords = ['risk', 'threat', 'vulnerability', 'exposure', 'liability']
        
        # This is a simplified version - in production, use spaCy or AWS Comprehend
        # for proper Named Entity Recognition
        
        return entities
    
    def _extract_from_forms(self, forms: List[Dict]) -> List[Entity]:
        """Extract entities from form fields"""
        
        entities = []
        
        for form_field in forms:
            key = form_field.get('key', '').lower()
            value = form_field.get('value', '')
            
            if not value:
                continue
                
            # Company name
            if 'company' in key or 'organization' in key:
                entities.append(Entity(
                    id=f"company_{hash(value)}",
                    type=EntityType.COMPANY,
                    name=value,
                    properties={'source': 'form'},
                    confidence=0.9
                ))
                
            # Person name
            elif any(term in key for term in ['name', 'contact', 'representative']):
                entities.append(Entity(
                    id=f"person_{hash(value)}",
                    type=EntityType.PERSON,
                    name=value,
                    properties={'source': 'form'},
                    confidence=0.85
                ))
                
            # Financial data
            elif any(term in key for term in ['amount', 'value', 'price', 'cost']):
                entities.append(Entity(
                    id=f"financial_{hash(value)}",
                    type=EntityType.FINANCIAL,
                    name=key,
                    properties={'value': value, 'source': 'form'},
                    confidence=0.95
                ))
        
        return entities
    
    def _extract_from_tables(self, tables: List[Dict]) -> List[Entity]:
        """Extract entities from table data"""
        
        entities = []
        
        for table in tables:
            data = table.get('data', [])
            
            if not data or len(data) < 2:
                continue
                
            # Assume first row is header
            headers = [str(h).lower() for h in data[0]]
            
            for row in data[1:]:
                for idx, value in enumerate(row):
                    if idx >= len(headers):
                        continue
                        
                    header = headers[idx]
                    
                    # Financial metrics
                    if any(term in header for term in ['revenue', 'cost', 'profit', 'expense']):
                        entities.append(Entity(
                            id=f"financial_{hash(f'{header}_{value}')}",
                            type=EntityType.FINANCIAL,
                            name=header,
                            properties={'value': value, 'source': 'table'},
                            confidence=0.9
                        ))
        
        return entities
    
    def _deduplicate_entities(self, entities: List[Entity]) -> List[Entity]:
        """Remove duplicate entities based on similarity"""
        
        unique_entities = {}
        
        for entity in entities:
            # Simple deduplication by ID
            if entity.id not in unique_entities:
                unique_entities[entity.id] = entity
            else:
                # Keep entity with higher confidence
                if entity.confidence > unique_entities[entity.id].confidence:
                    unique_entities[entity.id] = entity
        
        return list(unique_entities.values())
    
    @tracer.capture_method
    def extract_relationships(self, entities: List[Entity], document_data: Dict[str, Any]) -> List[Relationship]:
        """Extract relationships between entities"""
        
        relationships = []
        
        # Build entity lookup
        entity_map = {e.id: e for e in entities}
        
        # Extract co-occurrence relationships
        relationships.extend(self._extract_cooccurrence_relationships(entities, document_data))
        
        # Extract semantic relationships
        relationships.extend(self._extract_semantic_relationships(entities, document_data))
        
        return relationships
    
    def _extract_cooccurrence_relationships(self, entities: List[Entity], 
                                           document_data: Dict[str, Any]) -> List[Relationship]:
        """Extract relationships based on entity co-occurrence"""
        
        relationships = []
        
        # Simple co-occurrence in same section
        for i, entity1 in enumerate(entities):
            for entity2 in entities[i+1:]:
                # Determine relationship type based on entity types
                rel_type = self._infer_relationship_type(entity1, entity2)
                
                if rel_type:
                    relationships.append(Relationship(
                        source_id=entity1.id,
                        target_id=entity2.id,
                        type=rel_type,
                        properties={'method': 'cooccurrence'},
                        confidence=0.7
                    ))
        
        return relationships
    
    def _extract_semantic_relationships(self, entities: List[Entity], 
                                       document_data: Dict[str, Any]) -> List[Relationship]:
        """Extract relationships based on semantic analysis"""
        
        relationships = []
        
        # This would use LLM or NLP to extract semantic relationships
        # Simplified version here
        
        return relationships
    
    def _infer_relationship_type(self, entity1: Entity, entity2: Entity) -> Optional[RelationType]:
        """Infer relationship type between two entities"""
        
        type_pairs = {
            (EntityType.COMPANY, EntityType.RISK): RelationType.HAS_RISK,
            (EntityType.COMPANY, EntityType.FINANCIAL): RelationType.CONTAINS_FINANCIAL,
            (EntityType.COMPANY, EntityType.COMPLIANCE): RelationType.REQUIRES_COMPLIANCE,
            (EntityType.COMPANY, EntityType.PERSON): RelationType.EMPLOYS,
            (EntityType.CONTRACT, EntityType.COMPANY): RelationType.INVOLVES,
            (EntityType.CONTRACT, EntityType.RISK): RelationType.HAS_RISK,
        }
        
        return type_pairs.get((entity1.type, entity2.type))
    
    @tracer.capture_method
    def build_graph(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Build complete knowledge graph from document"""
        
        logger.info("Building knowledge graph")
        
        # Extract entities
        entities = self.extract_entities(document_data)
        logger.info(f"Extracted {len(entities)} entities")
        
        # Extract relationships
        relationships = self.extract_relationships(entities, document_data)
        logger.info(f"Extracted {len(relationships)} relationships")
        
        # Store in graph database
        if self.neo4j_client:
            self._persist_to_neo4j(entities, relationships)
        
        return {
            'entities': [self._entity_to_dict(e) for e in entities],
            'relationships': [self._relationship_to_dict(r) for r in relationships],
            'metadata': {
                'entity_count': len(entities),
                'relationship_count': len(relationships)
            }
        }
    
    def _entity_to_dict(self, entity: Entity) -> Dict[str, Any]:
        """Convert entity to dictionary"""
        return {
            'id': entity.id,
            'type': entity.type.value,
            'name': entity.name,
            'properties': entity.properties,
            'confidence': entity.confidence
        }
    
    def _relationship_to_dict(self, rel: Relationship) -> Dict[str, Any]:
        """Convert relationship to dictionary"""
        return {
            'source_id': rel.source_id,
            'target_id': rel.target_id,
            'type': rel.type.value,
            'properties': rel.properties,
            'confidence': rel.confidence
        }
    
    def _persist_to_neo4j(self, entities: List[Entity], relationships: List[Relationship]):
        """Persist graph to Neo4j database"""
        
        if not self.neo4j_client:
            return
            
        # Create entities
        for entity in entities:
            query = f"""
            MERGE (n:{entity.type.value} {{id: $id}})
            SET n.name = $name,
                n.confidence = $confidence,
                n.properties = $properties
            """
            self.neo4j_client.run(query, 
                                 id=entity.id, 
                                 name=entity.name,
                                 confidence=entity.confidence,
                                 properties=json.dumps(entity.properties))
        
        # Create relationships
        for rel in relationships:
            query = f"""
            MATCH (a {{id: $source_id}})
            MATCH (b {{id: $target_id}})
            MERGE (a)-[r:{rel.type.value}]->(b)
            SET r.confidence = $confidence,
                r.properties = $properties
            """
            self.neo4j_client.run(query,
                                 source_id=rel.source_id,
                                 target_id=rel.target_id,
                                 confidence=rel.confidence,
                                 properties=json.dumps(rel.properties))
