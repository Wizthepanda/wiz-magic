#!/bin/bash

# 🚀 WIZUP Complete Deployment Script
# This script handles the full deployment process

set -e  # Exit on error

echo "🚀 Starting WIZUP Deployment Process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build the project
echo -e "${BLUE}📦 Step 1: Building the project...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
else
    echo -e "${RED}❌ Build failed. Please fix errors and try again.${NC}"
    exit 1
fi

# Step 2: Check if Firebase CLI is available
echo -e "${BLUE}🔧 Step 2: Checking Firebase CLI...${NC}"
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✅ Firebase CLI found${NC}"

    # Step 3: Deploy Firestore rules
    echo ""
    echo -e "${BLUE}🔒 Step 3: Deploying Firestore rules...${NC}"
    firebase deploy --only firestore:rules

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Firestore rules deployed${NC}"
    else
        echo -e "${YELLOW}⚠️  Firestore rules deployment failed (you may need to do this manually)${NC}"
    fi

    # Step 4: Deploy Firestore indexes
    echo ""
    echo -e "${BLUE}📊 Step 4: Deploying Firestore indexes...${NC}"
    firebase deploy --only firestore:indexes

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Firestore indexes deployed${NC}"
    else
        echo -e "${YELLOW}⚠️  Firestore indexes deployment failed (you may need to do this manually)${NC}"
    fi

    # Step 5: Deploy hosting
    echo ""
    echo -e "${BLUE}🌐 Step 5: Deploying to Firebase Hosting...${NC}"
    firebase deploy --only hosting

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ ✅ ✅ Deployment Complete! ✅ ✅ ✅${NC}"
        echo ""
        echo -e "${GREEN}🎉 Your WIZUP platform is now live!${NC}"
        echo ""
        echo -e "${BLUE}🔗 Your site: https://wiz-magic-platform.web.app${NC}"
        echo ""
        echo -e "${YELLOW}📝 Next Steps:${NC}"
        echo "1. Visit Firebase Console: https://console.firebase.google.com/"
        echo "2. Populate sample data following DEPLOYMENT_GUIDE.md"
        echo "3. Test all homepage sections"
        echo "4. Verify all static pages load correctly"
        echo ""
    else
        echo -e "${RED}❌ Hosting deployment failed${NC}"
        exit 1
    fi

else
    echo -e "${YELLOW}⚠️  Firebase CLI not found${NC}"
    echo ""
    echo -e "${BLUE}📦 Build completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}To complete deployment:${NC}"
    echo "1. Install Firebase CLI: npm install -g firebase-tools"
    echo "2. Login to Firebase: firebase login"
    echo "3. Run this script again: ./deploy.sh"
    echo ""
    echo -e "${BLUE}Alternative: Manual Deployment${NC}"
    echo "1. Go to Firebase Console"
    echo "2. Upload the 'dist' folder to Firebase Hosting"
    echo "3. Update Firestore rules manually (see firestore.rules)"
    echo "4. Create Firestore indexes (see firestore.indexes.json)"
    echo ""
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}     WIZUP Deployment Summary     ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✅ Project built successfully"
echo "📦 Build output: dist/"
echo ""
echo "📚 Documentation:"
echo "  - DEPLOYMENT_GUIDE.md (complete guide)"
echo "  - IMPLEMENTATION_COMPLETE.md (technical details)"
echo ""
echo "🔥 Firebase Configuration:"
echo "  - Rules: firestore.rules"
echo "  - Indexes: firestore.indexes.json"
echo ""
echo "📊 Sample Data:"
echo "  - Seed script: scripts/seedFirebase.js"
echo "  - JSON data: scripts/sampleData.json"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
