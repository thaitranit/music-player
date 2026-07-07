#!/bin/bash

# Build and test the production setup locally

echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 To test production locally:"
echo "  NODE_ENV=production node server/server.js"
echo ""
echo "Then visit: http://localhost:5000"
