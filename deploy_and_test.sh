#!/bin/bash
set -e

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Wait for localstack to be ready
echo "Waiting for LocalStack to be ready..."
while ! curl -s http://localhost:4566/_localstack/health | grep -q "\"lambda\": \"available\"\|\"lambda\": \"running\""; do
    sleep 2
done
echo "LocalStack is ready!"

# Delete function if it already exists to ensure clean deployment
echo "Cleaning up existing function if any..."
./venv/bin/python3 ./venv/bin/aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda delete-function --function-name calculatorFunction 2>/dev/null || true

# Create Lambda function
echo "Creating Lambda function..."
./venv/bin/python3 ./venv/bin/aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda create-function \
    --function-name calculatorFunction \
    --runtime python3.9 \
    --role arn:aws:iam::000000000000:role/lambda-role \
    --handler calculator.lambda_handler \
    --zip-file fileb://calculator.zip

# Wait for lambda to be fully active
echo "Waiting for Lambda function to be active..."
while true; do
    STATE=$(./venv/bin/python3 ./venv/bin/aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda get-function --function-name calculatorFunction --query 'Configuration.State' --output text 2>/dev/null || echo "Pending")
    if [ "$STATE" == "Active" ]; then
        break
    fi
    echo "Current state: $STATE. Waiting..."
    sleep 2
done

# Invoke Lambda function
echo "Invoking Lambda function..."
./venv/bin/python3 ./venv/bin/aws --endpoint-url=http://localhost:4566 --region us-east-1 lambda invoke \
    --function-name calculatorFunction \
    --payload '{"operation": "add", "a": 10, "b": 5}' \
    output.json

# View output
echo "Lambda output:"
cat output.json
echo ""
