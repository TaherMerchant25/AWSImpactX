"""
Intelligent Ingestion Layer - S3 Event Handler
Manages S3 bucket events and triggers document processing pipeline
"""
import json
import os
from typing import Dict, Any
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.typing import LambdaContext
import boto3

logger = Logger()
tracer = Tracer()

eventbridge_client = boto3.client('events')
s3_client = boto3.client('s3')


class S3EventHandler:
    """Handles S3 events and routes to appropriate processors"""
    
    SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.txt']
    
    def __init__(self):
        self.event_bus_name = os.environ.get('EVENT_BUS_NAME', 'default')
        
    @tracer.capture_method
    def validate_document(self, bucket: str, key: str) -> bool:
        """Validate if document should be processed"""
        
        # Check file extension
        if not any(key.lower().endswith(ext) for ext in self.SUPPORTED_EXTENSIONS):
            logger.warning(f"Unsupported file type: {key}")
            return False
            
        # Check file size (max 10MB for Textract)
        try:
            response = s3_client.head_object(Bucket=bucket, Key=key)
            file_size = response['ContentLength']
            
            if file_size > 10 * 1024 * 1024:  # 10MB
                logger.warning(f"File too large: {file_size} bytes")
                return False
                
            return True
            
        except Exception as e:
            logger.error(f"Error validating document: {e}")
            return False
    
    @tracer.capture_method
    def publish_ingestion_event(self, bucket: str, key: str, metadata: Dict[str, Any]):
        """Publish event to EventBridge for document processing"""
        
        event_detail = {
            'bucket': bucket,
            'key': key,
            'metadata': metadata,
            'stage': 'ingestion'
        }
        
        response = eventbridge_client.put_events(
            Entries=[{
                'Source': 'aspera.s3',
                'DetailType': 'DocumentUploaded',
                'Detail': json.dumps(event_detail),
                'EventBusName': self.event_bus_name
            }]
        )
        
        logger.info(f"Published ingestion event for {key}")
        return response
    
    @tracer.capture_method
    def extract_metadata(self, bucket: str, key: str) -> Dict[str, Any]:
        """Extract metadata from S3 object"""
        
        try:
            response = s3_client.head_object(Bucket=bucket, Key=key)
            
            return {
                'file_name': key.split('/')[-1],
                'file_size': response['ContentLength'],
                'content_type': response.get('ContentType', 'unknown'),
                'last_modified': response['LastModified'].isoformat(),
                'etag': response['ETag'],
                'custom_metadata': response.get('Metadata', {})
            }
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {e}")
            return {}


@logger.inject_lambda_context
@tracer.capture_lambda_handler
def lambda_handler(event: Dict[str, Any], context: LambdaContext) -> Dict[str, Any]:
    """
    Lambda handler for S3 events
    Validates and routes documents to processing pipeline
    """
    
    handler = S3EventHandler()
    processed_count = 0
    
    try:
        for record in event.get('Records', []):
            # Parse S3 event
            event_name = record.get('eventName', '')
            
            # Only process object created events
            if not event_name.startswith('ObjectCreated'):
                continue
                
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            
            logger.info(f"Received S3 event for: {bucket}/{key}")
            
            # Validate document
            if not handler.validate_document(bucket, key):
                logger.warning(f"Document validation failed: {key}")
                continue
            
            # Extract metadata
            metadata = handler.extract_metadata(bucket, key)
            
            # Publish to EventBridge for processing
            handler.publish_ingestion_event(bucket, key, metadata)
            processed_count += 1
            
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Processed {processed_count} documents',
                'processed_count': processed_count
            })
        }
        
    except Exception as e:
        logger.exception("Error handling S3 events")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
