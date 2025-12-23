# ASPERA Deployment Guide

## Prerequisites

### Required Tools
- AWS CLI v2
- AWS SAM CLI
- Python 3.11+
- Node.js 18+ (for frontend)
- Docker (for local testing)

### AWS Setup
```bash
# Configure AWS credentials
aws configure

# Set required environment variables
export AWS_ACCOUNT_ID=your_account_id
export AWS_REGION=us-east-1
```

## Deployment Steps

### 1. Clone and Setup

```bash
cd d:\Downloads\Code_Autonomous\AWS

# Install Python dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration
```

### 2. Deploy Infrastructure

#### Using PowerShell (Windows)
```powershell
.\scripts\deploy.ps1 -Environment dev -Region us-east-1 -Profile default
```

#### Using Bash (Linux/Mac)
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh dev us-east-1 default
```

### 3. Verify Deployment

```bash
# Check Stack Status
aws cloudformation describe-stacks \
    --stack-name aspera-dev \
    --query 'Stacks[0].StackStatus'

# Get Outputs
aws cloudformation describe-stacks \
    --stack-name aspera-dev \
    --query 'Stacks[0].Outputs' \
    --output table
```

## Component Deployment

### Lambda Functions
All Lambda functions are deployed via SAM template:
- `aspera-s3-event-handler-dev`
- `aspera-document-processor-dev`
- `aspera-knowledge-graph-dev`
- `aspera-vector-indexing-dev`
- `aspera-agent-orchestration-dev`

### Step Functions
State machine: `aspera-pipeline-dev`

### S3 Buckets
- `aspera-deal-flow-dev` - Document uploads
- `aspera-structured-data-dev` - Processed data

### DynamoDB Tables
- `aspera-results-dev` - Analysis results
- `aspera-contexts-dev` - Agent contexts

### OpenSearch Serverless
- Collection: `aspera-knowledge-dev`

## Testing the Deployment

### 1. Upload Test Document

```bash
# Get bucket name
BUCKET=$(aws cloudformation describe-stacks \
    --stack-name aspera-dev \
    --query 'Stacks[0].Outputs[?OutputKey==`DealFlowBucketName`].OutputValue' \
    --output text)

# Upload a test PDF
aws s3 cp test-proposal.pdf s3://$BUCKET/proposals/
```

### 2. Monitor Execution

```bash
# Get state machine ARN
STATE_MACHINE_ARN=$(aws cloudformation describe-stacks \
    --stack-name aspera-dev \
    --query 'Stacks[0].Outputs[?OutputKey==`StateMachineArn`].OutputValue' \
    --output text)

# List executions
aws stepfunctions list-executions \
    --state-machine-arn $STATE_MACHINE_ARN

# Get execution details
aws stepfunctions describe-execution \
    --execution-arn <execution-arn>
```

### 3. View Results

```bash
# Query DynamoDB for results
aws dynamodb scan \
    --table-name aspera-results-dev \
    --limit 10
```

## Updating the Deployment

### Update Lambda Code Only
```bash
cd infrastructure
sam build
sam deploy --no-confirm-changeset
```

### Update Configuration
```bash
# Edit template.yaml or config/config.yaml
sam deploy --parameter-overrides Environment=dev
```

## Monitoring & Logging

### CloudWatch Logs
```bash
# View Lambda logs
aws logs tail /aws/lambda/aspera-agent-orchestration-dev --follow

# View Step Functions logs
aws logs tail /aws/stepfunctions/aspera-pipeline-dev --follow
```

### Metrics
- Lambda invocations
- Step Functions executions
- S3 object counts
- DynamoDB read/write units
- OpenSearch queries

## Troubleshooting

### Common Issues

#### 1. Lambda Timeout
```bash
# Increase timeout in template.yaml
Globals:
  Function:
    Timeout: 900  # 15 minutes
```

#### 2. Memory Issues
```bash
# Increase memory in template.yaml
Globals:
  Function:
    MemorySize: 3008  # MB
```

#### 3. Permission Errors
- Verify IAM roles have required permissions
- Check resource-based policies
- Review CloudWatch Logs for specific errors

#### 4. OpenSearch Connection Issues
```bash
# Verify network access
# Check security group rules
# Ensure Lambda is in VPC if OpenSearch is in VPC
```

## Cleanup

### Delete Stack
```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name aspera-dev

# Empty S3 buckets first
aws s3 rm s3://aspera-deal-flow-dev --recursive
aws s3 rm s3://aspera-structured-data-dev --recursive

# Delete buckets
aws s3 rb s3://aspera-deal-flow-dev
aws s3 rb s3://aspera-structured-data-dev
```

## Cost Optimization

### Recommended Settings for Development
- Use Serverless OpenSearch (pay per use)
- Set DynamoDB to PAY_PER_REQUEST mode
- Use S3 Intelligent-Tiering
- Set appropriate Lambda reserved concurrency

### Production Considerations
- Enable CloudWatch Logs retention policies
- Use provisioned concurrency for critical Lambda functions
- Consider Reserved Capacity for DynamoDB
- Implement caching layer (ElastiCache)
- Use AWS Cost Explorer for monitoring

## Security Best Practices

1. **Encryption**
   - Enable S3 bucket encryption
   - Use AWS KMS for sensitive data
   - Encrypt DynamoDB tables

2. **Access Control**
   - Use least privilege IAM policies
   - Enable MFA for console access
   - Implement bucket policies

3. **Monitoring**
   - Enable CloudTrail logging
   - Set up CloudWatch alarms
   - Use AWS Config for compliance

4. **Network Security**
   - Use VPC endpoints
   - Implement security groups
   - Enable VPC Flow Logs

## Support

For issues or questions:
1. Check CloudWatch Logs
2. Review Step Functions execution history
3. Verify configuration in config/config.yaml
4. Check AWS service quotas
