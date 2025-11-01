#!/bin/bash

# 🔍 WIZUP Domain Setup Verification Script
# Checks if both wizup.live and wizxp.com are properly configured

echo "🔍 WIZUP Domain Setup Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check DNS Resolution
echo "📡 Checking DNS Resolution..."
echo ""

echo "1️⃣  wizup.live:"
if nslookup wizup.live > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS resolves successfully${NC}"
    nslookup wizup.live | grep -A 2 "Name:"
else
    echo -e "${RED}❌ DNS resolution failed${NC}"
fi
echo ""

echo "2️⃣  wizxp.com:"
if nslookup wizxp.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS resolves successfully${NC}"
    nslookup wizxp.com | grep -A 2 "Name:"
else
    echo -e "${RED}❌ DNS resolution failed${NC}"
fi
echo ""

# Check HTTP/HTTPS Connectivity
echo "🌐 Checking HTTP/HTTPS Connectivity..."
echo ""

echo "3️⃣  https://wizup.live"
if curl -s -o /dev/null -w "%{http_code}" https://wizup.live | grep -q "200"; then
    echo -e "${GREEN}✅ Site is accessible (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Site is not accessible${NC}"
fi
echo ""

echo "4️⃣  https://wizxp.com"
if curl -s -o /dev/null -w "%{http_code}" https://wizxp.com | grep -q "200"; then
    echo -e "${GREEN}✅ Site is accessible (HTTP 200)${NC}"
else
    echo -e "${RED}❌ Site is not accessible${NC}"
fi
echo ""

# Check for Favicon
echo "🖼️  Checking Favicon..."
echo ""

if [ -f "public/favicon.ico" ]; then
    echo -e "${GREEN}✅ favicon.ico exists in public/${NC}"
else
    echo -e "${YELLOW}⚠️  favicon.ico not found (will cause CORS warning)${NC}"
fi

if [ -f "public/WIZ Favicon.png" ]; then
    echo -e "${GREEN}✅ WIZ Favicon.png exists${NC}"
else
    echo -e "${RED}❌ WIZ Favicon.png not found${NC}"
fi
echo ""

# Check Environment Variables
echo "⚙️  Checking Environment Variables..."
echo ""

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"

    if grep -q "VITE_FIREBASE_API_KEY" .env; then
        echo -e "${GREEN}✅ VITE_FIREBASE_API_KEY is set${NC}"
    else
        echo -e "${RED}❌ VITE_FIREBASE_API_KEY missing${NC}"
    fi

    if grep -q "VITE_GOOGLE_CLIENT_ID" .env; then
        echo -e "${GREEN}✅ VITE_GOOGLE_CLIENT_ID is set${NC}"
    else
        echo -e "${RED}❌ VITE_GOOGLE_CLIENT_ID missing${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
fi
echo ""

# Check Firebase Configuration
echo "🔥 Checking Firebase Configuration..."
echo ""

if [ -f "firebase.json" ]; then
    echo -e "${GREEN}✅ firebase.json exists${NC}"
else
    echo -e "${RED}❌ firebase.json not found${NC}"
fi

if [ -f ".firebaserc" ]; then
    echo -e "${GREEN}✅ .firebaserc exists${NC}"
    PROJECT=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
    echo "   Project: $PROJECT"
else
    echo -e "${RED}❌ .firebaserc not found${NC}"
fi
echo ""

# Check Source Files
echo "📁 Checking Key Source Files..."
echo ""

if [ -f "src/lib/firebase.ts" ]; then
    echo -e "${GREEN}✅ src/lib/firebase.ts exists${NC}"
    if grep -q "getAuthDomain" src/lib/firebase.ts; then
        echo -e "${GREEN}✅ Dynamic auth domain function found${NC}"
    fi
    if grep -q "wizup.live" src/lib/firebase.ts; then
        echo -e "${GREEN}✅ wizup.live domain configured${NC}"
    fi
    if grep -q "wizxp.com" src/lib/firebase.ts; then
        echo -e "${GREEN}✅ wizxp.com domain configured${NC}"
    fi
else
    echo -e "${RED}❌ src/lib/firebase.ts not found${NC}"
fi
echo ""

# Summary
echo "=================================="
echo "📋 Summary & Next Steps"
echo "=================================="
echo ""
echo "✅ If all checks passed:"
echo "   1. Verify Firebase Console → Authorized domains"
echo "   2. Verify Google Cloud Console → OAuth credentials"
echo "   3. Run: npm run build"
echo "   4. Run: firebase deploy --only hosting"
echo "   5. Test: https://wizup.live (incognito)"
echo "   6. Test: https://wizxp.com (incognito)"
echo ""
echo "❌ If checks failed:"
echo "   - Review DOMAIN_SETUP_GUIDE.md for detailed instructions"
echo "   - Check DNS configuration with your domain provider"
echo "   - Ensure Firebase Hosting custom domains are verified"
echo ""
echo "📖 Full Guide: ./DOMAIN_SETUP_GUIDE.md"
echo ""
