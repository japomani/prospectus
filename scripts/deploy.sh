#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Build frontend"
cd "$ROOT/frontend"
npm ci
npm run build

echo "==> Build Go API"
cd "$ROOT/backend"
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap ./cmd/api
chmod +x bootstrap

echo "==> SAM deploy (requires AWS credentials)"
cd "$ROOT/backend"
sam build
sam deploy --guided

echo "==> Upload frontend to S3"
BUCKET=$(aws cloudformation describe-stacks --stack-name delphinium-prospectus --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text 2>/dev/null || echo "")
if [ -n "$BUCKET" ]; then
  aws s3 sync "$ROOT/frontend/dist/" "s3://$BUCKET/" --delete
  DIST_ID=$(aws cloudformation describe-stack-resources --stack-name delphinium-prospectus --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId" --output text 2>/dev/null || echo "")
  if [ -n "$DIST_ID" ]; then
    aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
  fi
fi

echo "Done."
