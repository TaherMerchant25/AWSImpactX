# ASPERA Architecture Guide

## System Overview

ASPERA (AI-Powered Due Diligence Pipeline) is a serverless multi-agentic AI system that automates the analysis of investment documents, contracts, and proposals.

## Architecture Layers

### 1. Intelligent Ingestion Layer

**Components:**
- S3 Bucket (Deal-Flow)
- Amazon EventBridge
- Amazon Textract
- Document Processor Lambda

**Flow:**
1. Documents uploaded to S3 trigger EventBridge event
2. S3 Event Handler validates document
3. Document Processor invokes Textract for OCR
4. Structured JSON output saved to S3
5. Event published for next stage

**Key Features:**
- Automatic document validation
- Multi-format support (PDF, DOCX, XLSX)
- Table and form extraction
- Metadata enrichment

### 2. Hierarchical Knowledge Layer (RAG)

**Components:**
- Knowledge Graph Builder
- Vector Store Manager
- Amazon OpenSearch Serverless
- Neo4j (optional)

**Flow:**
1. Extract entities and relationships from structured data
2. Build hierarchical knowledge graph
3. Generate embeddings using Bedrock Titan
4. Index into OpenSearch for semantic search
5. Store graph in Neo4j for relationship queries

**Key Features:**
- Entity extraction (companies, people, financials)
- Relationship mapping
- Vector embeddings for RAG
- Semantic search capabilities

### 3. Cognitive Risk Engine & MCP Hub

**Components:**
- MCP Hub (Model Context Protocol)
- Cognitive Risk Engine
- Amazon Bedrock (Claude 3.5 Sonnet)
- Multi-Agent Orchestra

**MCP Hub:**
- Universal tool access layer
- Provides tools: database, API, Lambda, calculations
- Context management across agents
- Tool invocation history

**Cognitive Risk Engine:**
- Orchestrates multiple AI agents
- Chain of Thought reasoning
- Task dependency management
- Result synthesis

**Agent Types:**
1. **Consistency Agent** - Data validation
2. **Greenwashing Detector** - ESG claim verification
3. **Compliance Agent** - Regulatory compliance
4. **Math Agent** - Financial calculations
5. **Risk Analysis Agent** - Comprehensive risk assessment

### 4. User Experience Layer

**Components:**
- React Dashboard (planned)
- AWS Amplify
- Amazon Translate
- Report Generator

**Features:**
- Risk heatmap visualization
- Interactive findings explorer
- Multi-language support
- Export capabilities

## Data Flow

```
Document Upload (S3)
    ↓
EventBridge Trigger
    ↓
Textract OCR & Extraction
    ↓
Structured Data (JSON)
    ↓
[Parallel Processing]
    ├─→ Knowledge Graph Building
    └─→ Vector Embedding & Indexing
    ↓
Multi-Agent Analysis
    ├─→ Consistency Check
    ├─→ Greenwashing Detection
    ├─→ Compliance Verification
    ├─→ Financial Analysis
    └─→ Risk Assessment
    ↓
Synthesis (Chain of Thought)
    ↓
Final Recommendation
    ↓
Report Generation
    ↓
Results Storage (DynamoDB)
```

## Agent Communication

### Chain of Thought Flow

1. **Task Graph Creation**
   - Define agent priorities
   - Establish dependencies
   - Allocate resources

2. **Sequential Execution**
   - Execute agents in priority order
   - Pass context between agents
   - Accumulate findings

3. **Synthesis**
   - LLM-based synthesis of all findings
   - Identify critical risks
   - Assess interdependencies

4. **Recommendation**
   - Go/No-Go decision
   - Risk heatmap generation
   - Confidence scoring

### MCP Protocol

**Tool Registration:**
```python
mcp_hub.register_tool(Tool(
    name="query_database",
    type=ToolType.DATABASE,
    description="Query application database",
    parameters={...},
    handler=handler_function
))
```

**Tool Invocation:**
```python
result = mcp_hub.invoke_tool(
    "query_database",
    parameters={"query": "SELECT * FROM metrics"},
    context={"agent": "risk_analysis"}
)
```

**Context Management:**
```python
# Create shared context
context_id = context_manager.create_context(
    "doc_123",
    {"document": "proposal.pdf"}
)

# Update context from agent
context_manager.update_context(
    context_id,
    {"findings": [...]}
)

# Retrieve context
context = context_manager.get_context(context_id)
```

## AWS Services Integration

### Lambda Functions
- **Cold Start Optimization**: Use Provisioned Concurrency
- **Memory**: 2048-3008 MB for agent functions
- **Timeout**: 900 seconds (15 min) for complex analysis
- **Layers**: Shared dependencies in Lambda layers

### Step Functions
- **Orchestration**: State machine coordinates pipeline
- **Error Handling**: Catch blocks for each step
- **Parallel Processing**: Knowledge graph + vector indexing
- **Retry Logic**: Exponential backoff

### OpenSearch Serverless
- **Index**: Vector search with HNSW algorithm
- **Dimension**: 1536 (Titan embeddings)
- **Space Type**: L2 distance
- **Capacity**: Auto-scaling based on load

### DynamoDB
- **Results Table**: Analysis outputs
- **Context Table**: Agent shared memory
- **Billing**: Pay-per-request
- **TTL**: Auto-expire old contexts

### Bedrock
- **Model**: Claude 3.5 Sonnet
- **Temperature**: 0.1 (deterministic)
- **Max Tokens**: 4096
- **Use Cases**: 
  - Agent reasoning
  - Synthesis
  - Complex analysis

## Scalability

### Horizontal Scaling
- Lambda auto-scales with load
- OpenSearch auto-scales capacity
- DynamoDB auto-scales throughput
- Step Functions handles concurrent executions

### Performance Optimization
- Parallel knowledge processing
- Batch document processing
- Caching frequently accessed data
- Async agent execution where possible

### Cost Optimization
- Serverless architecture (pay per use)
- S3 Intelligent-Tiering
- DynamoDB on-demand pricing
- Right-sized Lambda memory

## Security Architecture

### Data Protection
- S3 bucket encryption (AES-256)
- DynamoDB encryption at rest
- TLS for data in transit
- KMS for key management

### Access Control
- IAM roles with least privilege
- Resource-based policies
- VPC endpoints for private access
- Security groups and NACLs

### Compliance
- CloudTrail logging
- AWS Config rules
- VPC Flow Logs
- GuardDuty threat detection

### Audit Trail
- Document processing history
- Agent decision logs
- Tool invocation records
- User access logs

## Monitoring & Observability

### Metrics
- Lambda invocations and errors
- Step Functions execution status
- DynamoDB read/write capacity
- OpenSearch query latency
- Agent analysis duration

### Logging
- Structured logging (JSON)
- Log levels: DEBUG, INFO, WARN, ERROR
- Correlation IDs across services
- Retention policies

### Alerting
- CloudWatch Alarms
- SNS notifications
- PagerDuty integration
- Automated remediation

### Tracing
- AWS X-Ray integration
- Request tracing across services
- Performance bottleneck identification
- Dependency mapping

## Extension Points

### Adding New Agents
```python
class CustomAgent(BaseAgent):
    def analyze(self, document_data, context, previous_results):
        # Custom analysis logic
        return {
            'agent_type': 'custom',
            'findings': [...],
            'confidence': 0.9
        }

# Register with engine
cognitive_engine.register_agent(AgentType.CUSTOM, CustomAgent(mcp_hub))
```

### Adding New Tools
```python
mcp_hub.register_tool(Tool(
    name="custom_tool",
    type=ToolType.API,
    description="Custom integration",
    parameters={...},
    handler=custom_handler
))
```

### Custom Workflows
Modify Step Functions state machine to add:
- Pre-processing steps
- Additional validation
- Custom notifications
- Integration with external systems
