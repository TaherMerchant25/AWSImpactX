# ASPERA: AI-Powered Due Diligence Pipeline

**Intelligent Document Processing Platform with Semantic Reasoning**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://www.python.org/))
- Git (optional, for Git Bash)

### Start the Platform

**Windows (PowerShell):**
```powershell
.\start.ps1
```

**Git Bash / Linux / Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Frontend Only (Quick):**
```powershell
.\start-frontend.ps1  # Windows
./start-frontend.sh   # Bash
```

Then open: **http://localhost:3000**

📖 **Full startup guide:** [STARTUP.md](STARTUP.md)

---

## Overview
ASPERA is a generative AI platform designed to ingest, digitize, and rigorously analyze complex contracts and proposals before human analyst review. The system accelerates capital deployment into high-impact sectors by automating technical and financial due diligence.

## Architecture

### 1. Intelligent Ingestion Layer
- **S3 Bucket**: Document storage and triggering
- **EventBridge**: Event-driven processing
- **Amazon Textract**: OCR and table extraction
- **Output**: Structured JSON data

### 2. Hierarchical Knowledge Layer (RAG)
- **Knowledge Graph**: Hierarchical relationships between entities
- **Vector Store**: Amazon OpenSearch Serverless for semantic search
- **Kiro Spec-Driven**: Specification-based ingestion and processing

### 3. Cognitive Risk Engine & MCP Hub
- **AI Agent Orchestra**: Lambda + Step Functions coordination
- **Amazon Bedrock**: Foundation models with Chain of Thought
- **MCP Hub**: Universal tool access protocol for agent coordination
- **Data Access**: Application databases and external APIs

### 4. User Experience Layer
- **Specialized Agents**: Consistency, Greenwashing Detection, Compliance
- **React Dashboard**: Visual interface for results
- **AWS Amplify**: Frontend hosting
- **Amazon Translate**: Multi-language support

## Components

### Agents
- **Consistency Agent**: Validates data integrity across documents
- **Greenwashing Detector**: Identifies unsubstantiated environmental claims
- **Compliance Check Agent**: Ensures regulatory adherence
- **Math Agent**: Financial calculations and modeling
- **Risk Analysis Agent**: Comprehensive risk assessment

### MCP Hub
Universal tool access layer providing:
- Database connectivity
- External API integration
- LambdaStep function orchestration
- Context management across agents

## Output
- Risk heatmap visualization
- Go/No-Go investment recommendation
- Comprehensive due diligence report

## Technology Stack
- **AWS Lambda**: Serverless compute
- **AWS Step Functions**: Workflow orchestration
- **Amazon Bedrock**: LLM foundation
- **Amazon OpenSearch**: Vector storage
- **Amazon S3**: Document storage
- **Amazon Textract**: Document processing
- **Amazon EventBridge**: Event routing
- **AWS Amplify**: Frontend hosting

## Getting Started

### Prerequisites
```bash
- AWS Account with appropriate permissions
- Python 3.11+
- Node.js 18+
- AWS CLI configured
- AWS CDK or SAM CLI
```

### Installation
```bash
pip install -r requirements.txt
npm install
```

### Deployment
```bash
# Deploy infrastructure
cdk deploy --all

# Or using SAM
sam build
sam deploy --guided
```

## Project Structure
```
├── src/
│   ├── agents/              # Multi-agent implementations
│   ├── ingestion/           # Document ingestion layer
│   ├── knowledge/           # RAG and knowledge graph
│   ├── mcp_hub/             # Model Context Protocol hub
│   ├── orchestration/       # Workflow coordination
│   └── utils/               # Shared utilities
├── infrastructure/          # AWS CDK/SAM templates
├── frontend/               # React dashboard
├── tests/                  # Unit and integration tests
└── config/                 # Configuration files
```

## License
MIT
