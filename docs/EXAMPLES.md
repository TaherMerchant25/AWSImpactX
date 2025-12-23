# ASPERA Usage Examples

## Basic Usage

### 1. Upload a Document

```python
import boto3

s3 = boto3.client('s3')

# Upload document
s3.upload_file(
    'proposal.pdf',
    'aspera-deal-flow-dev',
    'proposals/proposal.pdf'
)

print("Document uploaded - analysis will start automatically")
```

### 2. Monitor Analysis

```python
import boto3
import time

sf = boto3.client('stepfunctions')

# Get latest execution
executions = sf.list_executions(
    stateMachineArn='arn:aws:states:...:stateMachine:aspera-pipeline-dev',
    maxResults=1
)

execution_arn = executions['executions'][0]['executionArn']

# Poll for completion
while True:
    status = sf.describe_execution(executionArn=execution_arn)
    
    if status['status'] in ['SUCCEEDED', 'FAILED']:
        print(f"Analysis {status['status']}")
        break
    
    print("Analysis in progress...")
    time.sleep(10)
```

### 3. Retrieve Results

```python
import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('aspera-results-dev')

# Get results
response = table.get_item(
    Key={'document_id': 'your_document_id'}
)

if 'Item' in response:
    report = json.loads(response['Item']['report'])
    
    print(f"Decision: {report['executive_summary']['decision']}")
    print(f"Confidence: {report['executive_summary']['confidence_score']}")
    print(f"Risk Level: {report['executive_summary']['risk_level']}")
```

## Advanced Usage

### Custom Agent Configuration

```python
from src.mcp_hub.cognitive_risk_engine import CognitiveRiskEngine, AgentType
from src.mcp_hub.mcp_hub import MCPHub
from src.agents.consistency_agent import ConsistencyAgent

# Initialize
mcp_hub = MCPHub()
engine = CognitiveRiskEngine(mcp_hub)

# Register custom agents
engine.register_agent(AgentType.CONSISTENCY, ConsistencyAgent(mcp_hub))

# Run analysis
result = engine.orchestrate_analysis(document_data, context)
```

### Custom MCP Tools

```python
from src.mcp_hub.mcp_hub import MCPHub, Tool, ToolType

mcp_hub = MCPHub()

# Register custom tool
def custom_validation(parameters, context):
    # Custom validation logic
    return {"valid": True}

mcp_hub.register_tool(Tool(
    name="custom_validator",
    type=ToolType.CALCULATION,
    description="Custom validation logic",
    parameters={"input": {"type": "string", "required": True}},
    handler=custom_validation
))

# Use tool
result = mcp_hub.invoke_tool("custom_validator", {"input": "test"})
```

### Semantic Search

```python
from src.knowledge.vector_store_manager import VectorStoreManager

vector_store = VectorStoreManager()

# Search for relevant context
results = vector_store.semantic_search(
    query="What are the financial risks?",
    k=5,
    filters={"document_id": "abc123"}
)

for result in results:
    print(f"Score: {result['score']}")
    print(f"Text: {result['text']}")
    print("---")
```

### Knowledge Graph Queries

```python
from src.knowledge.knowledge_graph_builder import KnowledgeGraphBuilder

kg_builder = KnowledgeGraphBuilder()

# Build graph
graph = kg_builder.build_graph(document_data)

# Access entities and relationships
print(f"Entities: {len(graph['entities'])}")
print(f"Relationships: {len(graph['relationships'])}")

# Filter by type
companies = [e for e in graph['entities'] if e['type'] == 'Company']
risks = [e for e in graph['entities'] if e['type'] == 'Risk']
```

## Integration Examples

### AWS Step Functions

```python
import boto3
import json

sf = boto3.client('stepfunctions')

# Start execution
response = sf.start_execution(
    stateMachineArn='arn:aws:states:...:stateMachine:aspera-pipeline-dev',
    input=json.dumps({
        'bucket': 'aspera-deal-flow-dev',
        'key': 'proposals/investment-proposal.pdf',
        'request_id': 'custom-123',
        'metadata': {
            'deal_name': 'Project Alpha',
            'sector': 'Clean Energy'
        }
    })
)

execution_arn = response['executionArn']
print(f"Started execution: {execution_arn}")
```

### Lambda Function

```python
import json
from src.orchestration.pipeline_orchestrator import PipelineOrchestrator

def lambda_handler(event, context):
    orchestrator = PipelineOrchestrator()
    
    bucket = event['bucket']
    key = event['key']
    
    result = orchestrator.process_document(bucket, key, event)
    
    return {
        'statusCode': 200,
        'body': json.dumps(result)
    }
```

### EventBridge Integration

```python
import boto3
import json

events = boto3.client('events')

# Subscribe to analysis completion events
response = events.put_rule(
    Name='aspera-analysis-completed',
    EventPattern=json.dumps({
        'source': ['aspera.pipeline'],
        'detail-type': ['AnalysisCompleted']
    }),
    State='ENABLED'
)

# Add target (e.g., Lambda, SNS)
events.put_targets(
    Rule='aspera-analysis-completed',
    Targets=[{
        'Id': '1',
        'Arn': 'arn:aws:lambda:...:function:notify-completion'
    }]
)
```

## Testing Examples

### Unit Test for Agent

```python
import unittest
from src.agents.consistency_agent import ConsistencyAgent
from src.mcp_hub.mcp_hub import MCPHub

class TestConsistencyAgent(unittest.TestCase):
    def setUp(self):
        self.mcp_hub = MCPHub()
        self.agent = ConsistencyAgent(self.mcp_hub)
    
    def test_numerical_consistency(self):
        document_data = {
            'text_content': [
                {'text': 'Revenue is $1,000,000'},
                {'text': 'Revenue totals $1,000,000'}
            ],
            'tables': [],
            'forms': []
        }
        
        result = self.agent.analyze(document_data, {})
        
        self.assertTrue(result['success'])
        self.assertGreater(result['confidence'], 0.8)

if __name__ == '__main__':
    unittest.main()
```

### Integration Test

```python
import boto3
from moto import mock_s3, mock_dynamodb

@mock_s3
@mock_dynamodb
def test_end_to_end_pipeline():
    # Setup mocks
    s3 = boto3.client('s3')
    s3.create_bucket(Bucket='test-bucket')
    s3.put_object(
        Bucket='test-bucket',
        Key='test.pdf',
        Body=b'test content'
    )
    
    # Run pipeline
    from src.orchestration.pipeline_orchestrator import PipelineOrchestrator
    orchestrator = PipelineOrchestrator()
    
    result = orchestrator.process_document('test-bucket', 'test.pdf', {})
    
    # Verify
    assert result['status'] == 'COMPLETED'
    assert 'executive_summary' in result
```

## Batch Processing

```python
import boto3
from concurrent.futures import ThreadPoolExecutor

s3 = boto3.client('s3')
sf = boto3.client('stepfunctions')

def process_document(key):
    """Process a single document"""
    response = sf.start_execution(
        stateMachineArn='arn:aws:states:...',
        input=json.dumps({
            'bucket': 'aspera-deal-flow-dev',
            'key': key
        })
    )
    return response['executionArn']

# Get all documents
response = s3.list_objects_v2(
    Bucket='aspera-deal-flow-dev',
    Prefix='proposals/'
)

documents = [obj['Key'] for obj in response.get('Contents', [])]

# Process in parallel
with ThreadPoolExecutor(max_workers=5) as executor:
    executions = list(executor.map(process_document, documents))

print(f"Started {len(executions)} analyses")
```

## Export and Reporting

```python
import boto3
import json
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('aspera-results-dev')

# Get results
response = table.get_item(Key={'document_id': 'abc123'})
report_data = json.loads(response['Item']['report'])

# Generate PDF report
pdf = canvas.Canvas("analysis_report.pdf", pagesize=letter)
pdf.setTitle("Due Diligence Report")

# Title
pdf.setFont("Helvetica-Bold", 24)
pdf.drawString(100, 750, "Investment Analysis Report")

# Executive Summary
pdf.setFont("Helvetica-Bold", 16)
pdf.drawString(100, 700, "Executive Summary")

pdf.setFont("Helvetica", 12)
pdf.drawString(100, 680, f"Decision: {report_data['executive_summary']['decision']}")
pdf.drawString(100, 660, f"Confidence: {report_data['executive_summary']['confidence_score']:.2%}")
pdf.drawString(100, 640, f"Risk Level: {report_data['executive_summary']['risk_level']}")

pdf.save()
print("Report generated: analysis_report.pdf")
```

## Monitoring Dashboard

```python
import boto3
import time
from datetime import datetime, timedelta

cloudwatch = boto3.client('cloudwatch')

# Get metrics
response = cloudwatch.get_metric_statistics(
    Namespace='AWS/Lambda',
    MetricName='Invocations',
    Dimensions=[
        {'Name': 'FunctionName', 'Value': 'aspera-agent-orchestration-dev'}
    ],
    StartTime=datetime.now() - timedelta(hours=1),
    EndTime=datetime.now(),
    Period=300,
    Statistics=['Sum']
)

print("Lambda Invocations (last hour):")
for datapoint in response['Datapoints']:
    print(f"{datapoint['Timestamp']}: {datapoint['Sum']}")
```

## Error Handling

```python
import boto3
from botocore.exceptions import ClientError

sf = boto3.client('stepfunctions')

try:
    response = sf.start_execution(
        stateMachineArn='arn:aws:states:...',
        input=json.dumps({'bucket': 'test', 'key': 'doc.pdf'})
    )
except ClientError as e:
    if e.response['Error']['Code'] == 'ExecutionAlreadyExists':
        print("Execution already running")
    else:
        print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```
