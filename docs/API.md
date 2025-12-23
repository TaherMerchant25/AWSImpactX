# ASPERA API Documentation

## Overview

ASPERA provides REST APIs for document submission, analysis monitoring, and result retrieval.

## Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/prod
```

## Authentication

All API requests require AWS Signature Version 4 authentication.

```bash
# Using AWS CLI
aws --profile default \
    --region us-east-1 \
    apigateway ...
```

## Endpoints

### 1. Submit Document for Analysis

**POST** `/documents/analyze`

Submit a document for due diligence analysis.

**Request:**
```json
{
  "document_url": "s3://bucket/key",
  "metadata": {
    "deal_name": "Project Alpha",
    "sector": "Clean Energy",
    "deal_size": 50000000,
    "priority": "high"
  },
  "options": {
    "agents": ["consistency", "greenwashing", "compliance", "math", "risk"],
    "detailed_report": true
  }
}
```

**Response:**
```json
{
  "request_id": "abc123",
  "status": "PROCESSING",
  "execution_arn": "arn:aws:states:...",
  "estimated_completion": "2024-01-15T10:30:00Z"
}
```

### 2. Get Analysis Status

**GET** `/documents/{request_id}/status`

Check the status of a document analysis.

**Response:**
```json
{
  "request_id": "abc123",
  "status": "COMPLETED",
  "progress": {
    "current_stage": "Report Generation",
    "completion_percentage": 95
  },
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T10:25:00Z"
}
```

**Status Values:**
- `SUBMITTED` - Document uploaded
- `PROCESSING` - Analysis in progress
- `COMPLETED` - Analysis finished
- `FAILED` - Error occurred

### 3. Get Analysis Results

**GET** `/documents/{request_id}/results`

Retrieve the complete analysis results.

**Response:**
```json
{
  "document_id": "abc123",
  "timestamp": "2024-01-15T10:25:00Z",
  "executive_summary": {
    "decision": "CONDITIONAL",
    "rationale": "Found 2 medium risks requiring mitigation",
    "confidence_score": 0.85,
    "risk_level": "MEDIUM",
    "critical_risks_count": 0,
    "compliance_status": "Compliant"
  },
  "recommendation": {
    "decision": "CONDITIONAL",
    "rationale": "Analysis indicates manageable risk profile with mitigation",
    "confidence_score": 0.85,
    "risk_heatmap": {
      "categories": {
        "financial": "MEDIUM",
        "compliance": "LOW",
        "operational": "MEDIUM",
        "esg": "MEDIUM",
        "market": "LOW"
      }
    }
  },
  "agent_findings": {
    "consistency": {
      "total_findings": 3,
      "critical_findings": 0,
      "reasoning": "Document demonstrates strong internal consistency..."
    },
    "greenwashing": {
      "total_findings": 2,
      "critical_findings": 0,
      "reasoning": "Found 5 environmental claims, 2 lack substantiation..."
    },
    "compliance": {
      "total_findings": 1,
      "critical_findings": 0,
      "reasoning": "Reviewed against SEC requirements. Score: 92/100"
    },
    "math": {
      "total_findings": 0,
      "critical_findings": 0,
      "reasoning": "Analyzed 12 financial metrics. No calculation errors."
    },
    "risk_analysis": {
      "total_findings": 8,
      "critical_findings": 0,
      "reasoning": "Identified 8 risk factors across categories..."
    }
  },
  "knowledge_graph_summary": {
    "entities": 45,
    "relationships": 78
  }
}
```

### 4. Get Detailed Findings

**GET** `/documents/{request_id}/findings?agent={agent_type}`

Get detailed findings from a specific agent.

**Query Parameters:**
- `agent` - Agent type: consistency, greenwashing, compliance, math, risk

**Response:**
```json
{
  "agent_type": "greenwashing",
  "findings": [
    {
      "severity": "MEDIUM",
      "category": "esg",
      "title": "Unsubstantiated Carbon Neutral Claim",
      "description": "Environmental claim lacks sufficient evidence...",
      "evidence": [
        "Claim: 'We are carbon neutral'",
        "No certification mentioned",
        "No quantitative data provided"
      ],
      "confidence": 0.85,
      "recommendations": [
        "Provide certification from recognized standards body",
        "Include quantitative metrics"
      ]
    }
  ],
  "confidence": 0.82,
  "reasoning": "Found 5 environmental claims..."
}
```

### 5. Search Knowledge Graph

**GET** `/knowledge/search?query={query}&entity_type={type}`

Search the knowledge graph for entities and relationships.

**Query Parameters:**
- `query` - Search term
- `entity_type` - (optional) Filter by type: Company, Person, Risk, etc.
- `limit` - (optional) Max results (default: 10)

**Response:**
```json
{
  "results": [
    {
      "entity_id": "company_123",
      "type": "Company",
      "name": "Acme Corp",
      "properties": {
        "sector": "Technology",
        "revenue": 50000000
      },
      "relationships": [
        {
          "type": "HAS_RISK",
          "target": "risk_456",
          "target_name": "Market Volatility"
        }
      ]
    }
  ],
  "total": 1
}
```

### 6. Semantic Search

**POST** `/knowledge/semantic-search`

Perform semantic search across document corpus.

**Request:**
```json
{
  "query": "What are the main financial risks?",
  "filters": {
    "document_id": "abc123"
  },
  "k": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "chunk_id": "abc123_chunk_42",
      "text": "The primary financial risks include...",
      "metadata": {
        "document_id": "abc123",
        "chunk_index": 42
      },
      "score": 0.92
    }
  ]
}
```

### 7. Export Report

**GET** `/documents/{request_id}/export?format={format}`

Export analysis report in various formats.

**Query Parameters:**
- `format` - Export format: json, pdf, html

**Response:**
- JSON: Direct JSON response
- PDF: Binary PDF download
- HTML: HTML document

### 8. List Recent Analyses

**GET** `/documents?limit={limit}&status={status}`

List recent document analyses.

**Query Parameters:**
- `limit` - Max results (default: 20)
- `status` - Filter by status
- `from_date` - Start date (ISO 8601)
- `to_date` - End date (ISO 8601)

**Response:**
```json
{
  "documents": [
    {
      "request_id": "abc123",
      "document_name": "proposal.pdf",
      "submitted_at": "2024-01-15T10:00:00Z",
      "status": "COMPLETED",
      "decision": "CONDITIONAL",
      "confidence_score": 0.85
    }
  ],
  "total": 1,
  "next_token": null
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid document format",
    "details": {
      "field": "document_url",
      "reason": "URL must start with s3://"
    }
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid request
- `UNAUTHORIZED` (401) - Authentication failed
- `NOT_FOUND` (404) - Resource not found
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error

## Rate Limits

- **Submissions**: 100 per hour per account
- **Status Checks**: 1000 per hour
- **Results Retrieval**: 500 per hour
- **Search**: 200 per hour

## Webhooks

Configure webhooks to receive notifications when analysis completes.

**POST** `/webhooks`

```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["analysis.completed", "analysis.failed"],
  "secret": "your_secret_key"
}
```

**Webhook Payload:**
```json
{
  "event": "analysis.completed",
  "timestamp": "2024-01-15T10:25:00Z",
  "data": {
    "request_id": "abc123",
    "decision": "CONDITIONAL",
    "confidence_score": 0.85
  }
}
```

## SDK Examples

### Python

```python
import boto3
import json

# Initialize client
sf_client = boto3.client('stepfunctions')
dynamodb = boto3.resource('dynamodb')

# Submit document
response = sf_client.start_execution(
    stateMachineArn='arn:aws:states:...',
    input=json.dumps({
        'bucket': 'aspera-deal-flow',
        'key': 'proposal.pdf'
    })
)

# Get results
table = dynamodb.Table('aspera-results-dev')
result = table.get_item(
    Key={'document_id': 'abc123'}
)
```

### JavaScript

```javascript
const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions();

// Submit document
const params = {
  stateMachineArn: 'arn:aws:states:...',
  input: JSON.stringify({
    bucket: 'aspera-deal-flow',
    key: 'proposal.pdf'
  })
};

const result = await stepfunctions.startExecution(params).promise();
```

### cURL

```bash
# Submit document (using pre-signed URL)
aws stepfunctions start-execution \
  --state-machine-arn arn:aws:states:... \
  --input '{"bucket":"aspera-deal-flow","key":"proposal.pdf"}'

# Get results
aws dynamodb get-item \
  --table-name aspera-results-dev \
  --key '{"document_id":{"S":"abc123"}}'
```

## Best Practices

1. **Polling**: Use exponential backoff when checking status
2. **Webhooks**: Prefer webhooks over polling for production
3. **Caching**: Cache results to reduce API calls
4. **Pagination**: Use tokens for large result sets
5. **Error Handling**: Implement retry logic with exponential backoff
