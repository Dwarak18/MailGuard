#!/bin/bash

# MailGuard Render Deployment Helper
# Usage: ./scripts/deploy-render.sh

set -e

echo "🚀 MailGuard Render Deployment Helper"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Run this from the MailGuard root directory"
    exit 1
fi

# Check if backend has required files
if [ ! -f "backend/package.json" ] || [ ! -f "backend/src/server.ts" ]; then
    echo "❌ Error: Backend files missing"
    exit 1
fi

echo "✅ Project structure validated"

# Test build locally
echo "🔨 Testing build locally..."
cd backend

if [ ! -f "package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "📦 Installing dependencies..."
    npm ci
fi

echo "🏗️  Building TypeScript..."
npm run build

if [ ! -f "dist/server.js" ]; then
    echo "❌ Build failed - dist/server.js not found"
    exit 1
fi

echo "✅ Build successful"

# Test TypeScript
echo "🔍 Type checking..."
npm run type-check
echo "✅ Type check passed"

cd ..

# Show deployment info
echo ""
echo "🎉 Ready for Render deployment!"
echo ""
echo "📋 Deployment Options:"
echo ""
echo "1️⃣  One-click deploy:"
echo "   https://render.com/deploy?repo=https://github.com/Dwarak18/MailGuard"
echo ""
echo "2️⃣  Manual setup:"
echo "   - Go to https://dashboard.render.com"
echo "   - New Web Service"
echo "   - Connect GitHub → MailGuard"
echo "   - Build: cd backend && npm ci && npm run build"
echo "   - Start: cd backend && npm start"
echo ""
echo "3️⃣  Environment variables to set:"
echo "   NODE_ENV=production"
echo "   CORS_ORIGIN=https://gmail.com,https://outlook.live.com,chrome-extension://*"
echo ""
echo "✅ All files ready for deployment!"

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "⚠️  Note: You have uncommitted changes"
    echo "   Consider committing before deploying"
    git status --short
fi

echo ""
echo "🔗 Useful links:"
echo "   Render Dashboard: https://dashboard.render.com"
echo "   Documentation: ./RENDER_DEPLOYMENT.md"
echo "   Deployment config: ./render.yaml"