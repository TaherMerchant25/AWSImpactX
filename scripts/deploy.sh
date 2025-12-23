#!/usr/bin/env bash
# Deployment script for ASPERA

set -e

ENVIRONMENT=${1:-dev}
AWS_REGION=${2:-us-east-1}
AWS_PROFILE=${3:-default}

echo "========================================="
echo "ASPERA Deployment Script"
echo "========================================="
echo "Environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"
echo "Profile: $AWS_PROFILE"
echo "========================================="

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI not found. Please install it first."
    exit 1
fi

# Check SAM CLI
if ! command -v sam &> /dev/null; then
    echo "Error: SAM CLI not found. Please install it first."
    exit 1
fi

# Step 1: Install Python dependencies
echo "Step 1: Installing Python dependencies..."
pip install -r requirements.txt -t src/layers/python/lib/python3.11/site-packages/

# Step 2: Build SAM application
echo "Step 2: Building SAM application..."
cd infrastructure
sam build \
    --use-container \
    --region $AWS_REGION \
    --profile $AWS_PROFILE

# Step 3: Deploy
echo "Step 3: Deploying to AWS..."
sam deploy \
    --stack-name aspera-$ENVIRONMENT \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    --no-fail-on-empty-changeset \
    --resolve-s3

cd ..

# Step 4: Get outputs
echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="
echo ""
echo "Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name aspera-$ENVIRONMENT \
    --region $AWS_REGION \
    --profile $AWS_PROFILE \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "========================================="
echo "Next Steps:"
echo "1. Upload documents to the S3 bucket"
echo "2. Monitor Step Functions execution"
echo "3. View results in DynamoDB table"
echo "========================================="
