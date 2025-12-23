"""
Intelligent Ingestion Layer - Document Processor
Handles S3 events, triggers Textract, and produces structured JSON output
"""
import json
import os
import boto3
from typing import Dict, Any, List
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger()
tracer = Tracer()

s3_client = boto3.client('s3')
textract_client = boto3.client('textract')
eventbridge_client = boto3.client('events')


class DocumentProcessor:
    """Processes documents from S3 and extracts structured data"""
    
    def __init__(self):
        self.textract_client = textract_client
        self.s3_client = s3_client
        self.output_bucket = os.environ.get('OUTPUT_BUCKET')
        
    @tracer.capture_method
    def extract_text_and_tables(self, bucket: str, key: str) -> Dict[str, Any]:
        """
        Extract text and tables from document using Amazon Textract
        """
        logger.info(f"Starting Textract analysis for {bucket}/{key}")
        
        response = self.textract_client.analyze_document(
            Document={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': key
                }
            },
            FeatureTypes=['TABLES', 'FORMS', 'LAYOUT']
        )
        
        return self._parse_textract_response(response)
    
    def _parse_textract_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Textract response into structured format"""
        
        blocks = response.get('Blocks', [])
        
        # Extract text content
        text_content = []
        tables = []
        forms = []
        
        # Build relationship maps
        block_map = {block['Id']: block for block in blocks}
        
        for block in blocks:
            if block['BlockType'] == 'LINE':
                text_content.append({
                    'text': block.get('Text', ''),
                    'confidence': block.get('Confidence', 0),
                    'geometry': block.get('Geometry', {})
                })
                
            elif block['BlockType'] == 'TABLE':
                table = self._extract_table(block, block_map)
                if table:
                    tables.append(table)
                    
            elif block['BlockType'] == 'KEY_VALUE_SET':
                if block.get('EntityTypes') == ['KEY']:
                    form_field = self._extract_form_field(block, block_map)
                    if form_field:
                        forms.append(form_field)
        
        return {
            'text_content': text_content,
            'tables': tables,
            'forms': forms,
            'page_count': len([b for b in blocks if b['BlockType'] == 'PAGE']),
            'metadata': {
                'document_type': self._infer_document_type(text_content),
                'extraction_confidence': self._calculate_avg_confidence(blocks)
            }
        }
    
    def _extract_table(self, table_block: Dict, block_map: Dict) -> Dict[str, Any]:
        """Extract table structure and content"""
        
        if 'Relationships' not in table_block:
            return None
            
        rows = {}
        
        for relationship in table_block['Relationships']:
            if relationship['Type'] == 'CHILD':
                for cell_id in relationship['Ids']:
                    cell = block_map.get(cell_id)
                    if cell and cell['BlockType'] == 'CELL':
                        row_index = cell.get('RowIndex', 0)
                        col_index = cell.get('ColumnIndex', 0)
                        
                        if row_index not in rows:
                            rows[row_index] = {}
                            
                        rows[row_index][col_index] = self._get_cell_text(cell, block_map)
        
        # Convert to ordered list
        table_data = []
        for row_idx in sorted(rows.keys()):
            row_data = []
            for col_idx in sorted(rows[row_idx].keys()):
                row_data.append(rows[row_idx][col_idx])
            table_data.append(row_data)
            
        return {
            'rows': len(rows),
            'columns': max(len(row) for row in rows.values()) if rows else 0,
            'data': table_data
        }
    
    def _get_cell_text(self, cell: Dict, block_map: Dict) -> str:
        """Extract text from table cell"""
        
        text = ""
        if 'Relationships' in cell:
            for relationship in cell['Relationships']:
                if relationship['Type'] == 'CHILD':
                    for child_id in relationship['Ids']:
                        word = block_map.get(child_id)
                        if word and word['BlockType'] == 'WORD':
                            text += word.get('Text', '') + " "
        return text.strip()
    
    def _extract_form_field(self, key_block: Dict, block_map: Dict) -> Dict[str, str]:
        """Extract key-value pairs from forms"""
        
        key_text = ""
        value_text = ""
        
        # Extract key text
        if 'Relationships' in key_block:
            for relationship in key_block['Relationships']:
                if relationship['Type'] == 'CHILD':
                    for child_id in relationship['Ids']:
                        word = block_map.get(child_id)
                        if word and word['BlockType'] == 'WORD':
                            key_text += word.get('Text', '') + " "
                            
                elif relationship['Type'] == 'VALUE':
                    for value_id in relationship['Ids']:
                        value_block = block_map.get(value_id)
                        if value_block and 'Relationships' in value_block:
                            for value_rel in value_block['Relationships']:
                                if value_rel['Type'] == 'CHILD':
                                    for child_id in value_rel['Ids']:
                                        word = block_map.get(child_id)
                                        if word and word['BlockType'] == 'WORD':
                                            value_text += word.get('Text', '') + " "
        
        return {
            'key': key_text.strip(),
            'value': value_text.strip()
        }
    
    def _infer_document_type(self, text_content: List[Dict]) -> str:
        """Infer document type from content"""
        
        full_text = " ".join([t['text'].lower() for t in text_content[:50]])
        
        if any(keyword in full_text for keyword in ['contract', 'agreement', 'parties']):
            return 'CONTRACT'
        elif any(keyword in full_text for keyword in ['proposal', 'project', 'scope']):
            return 'PROPOSAL'
        elif any(keyword in full_text for keyword in ['financial', 'balance sheet', 'income statement']):
            return 'FINANCIAL'
        elif any(keyword in full_text for keyword in ['compliance', 'regulatory', 'policy']):
            return 'COMPLIANCE'
        else:
            return 'GENERAL'
    
    def _calculate_avg_confidence(self, blocks: List[Dict]) -> float:
        """Calculate average confidence score"""
        
        confidences = [b.get('Confidence', 0) for b in blocks if 'Confidence' in b]
        return sum(confidences) / len(confidences) if confidences else 0.0
    
    @tracer.capture_method
    def save_structured_output(self, data: Dict[str, Any], original_key: str) -> str:
        """Save structured JSON output to S3"""
        
        output_key = f"structured/{original_key.replace('.pdf', '.json')}"
        
        self.s3_client.put_object(
            Bucket=self.output_bucket,
            Key=output_key,
            Body=json.dumps(data, indent=2),
            ContentType='application/json'
        )
        
        logger.info(f"Saved structured output to {self.output_bucket}/{output_key}")
        return output_key
    
    @tracer.capture_method
    def publish_completion_event(self, bucket: str, key: str, structured_key: str):
        """Publish event to EventBridge for downstream processing"""
        
        event = {
            'Source': 'aspera.ingestion',
            'DetailType': 'DocumentProcessed',
            'Detail': json.dumps({
                'original_bucket': bucket,
                'original_key': key,
                'structured_key': structured_key,
                'timestamp': str(boto3.Session().client('sts').get_caller_identity())
            })
        }
        
        eventbridge_client.put_events(Entries=[event])
        logger.info("Published document processed event")


@logger.inject_lambda_context
@tracer.capture_lambda_handler
def lambda_handler(event: Dict[str, Any], context: LambdaContext) -> Dict[str, Any]:
    """
    Lambda handler for S3 event processing
    Triggered by EventBridge when documents are uploaded to S3
    """
    
    processor = DocumentProcessor()
    
    try:
        # Parse S3 event
        for record in event.get('Records', []):
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            
            logger.info(f"Processing document: {bucket}/{key}")
            
            # Extract structured data
            structured_data = processor.extract_text_and_tables(bucket, key)
            
            # Save to S3
            output_key = processor.save_structured_output(structured_data, key)
            
            # Publish event for next stage
            processor.publish_completion_event(bucket, key, output_key)
            
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Documents processed successfully'})
        }
        
    except Exception as e:
        logger.exception("Error processing document")
        raise e
