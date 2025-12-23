# Deployment script for ASPERA (Windows PowerShell)

param(
    [string]$Environment = "dev",
    [string]$Region = "us-east-1",
    [string]$Profile = "default"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ASPERA Deployment Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Green
Write-Host "Region: $Region" -ForegroundColor Green
Write-Host "Profile: $Profile" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "Error: AWS CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Check SAM CLI
if (-not (Get-Command sam -ErrorAction SilentlyContinue)) {
    Write-Host "Error: SAM CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Step 1: Install Python dependencies
Write-Host "`nStep 1: Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt -t src/layers/python/lib/python3.11/site-packages/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing dependencies" -ForegroundColor Red
    exit 1
}

# Step 2: Build SAM application
Write-Host "`nStep 2: Building SAM application..." -ForegroundColor Yellow
Set-Location infrastructure

sam build `
    --use-container `
    --region $Region `
    --profile $Profile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building application" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Step 3: Deploy
Write-Host "`nStep 3: Deploying to AWS..." -ForegroundColor Yellow
sam deploy `
    --stack-name "aspera-$Environment" `
    --parameter-overrides "Environment=$Environment" `
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND `
    --region $Region `
    --profile $Profile `
    --no-fail-on-empty-changeset `
    --resolve-s3

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error deploying application" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Step 4: Get outputs
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nGetting stack outputs..." -ForegroundColor Yellow

aws cloudformation describe-stacks `
    --stack-name "aspera-$Environment" `
    --region $Region `
    --profile $Profile `
    --query 'Stacks[0].Outputs' `
    --output table

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Upload documents to the S3 bucket" -ForegroundColor White
Write-Host "2. Monitor Step Functions execution" -ForegroundColor White
Write-Host "3. View results in DynamoDB table" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Cyan
