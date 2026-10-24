#!/bin/bash
# ==============================================================================
# Deploy React Frontend to AWS S3 + CloudFront
# ==============================================================================

# Change these to your actual AWS S3 bucket name and CloudFront Distribution ID
S3_BUCKET_NAME="my-cgpa-portal-frontend-bucket"
CLOUDFRONT_DIST_ID="E1A2B3C4D5E6F7"

echo "🚀 Step 1: Building production bundle with Vite..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check errors above."
    exit 1
fi

echo "📦 Step 2: Uploading dist/ files to AWS S3 bucket: s3://${S3_BUCKET_NAME}..."
aws s3 sync dist/ s3://${S3_BUCKET_NAME} --delete

echo "🔄 Step 3: Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id ${CLOUDFRONT_DIST_ID} \
    --paths "/*"

echo "✅ Deployment complete! Your frontend is live on CloudFront CDN."
