#!/bin/bash
set -e

echo "🐳 Building OpenSpace Base Image..."
echo "=================================="

cd "$(dirname "$0")"

# Build the image
docker build \
    --tag openspace-base:latest \
    --tag openspace-base:$(date +%Y%m%d) \
    --label openspace.build_date=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    -f Dockerfile \
    .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    docker images | grep openspace-base
else
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 To test the image:"
echo "docker run -it --rm -p 8080:80 openspace-base:latest"
