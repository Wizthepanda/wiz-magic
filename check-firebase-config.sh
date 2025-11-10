#!/bin/bash

# Firebase Auth Configuration Checker
# Verifies that environment variables are set correctly

echo "🔍 Checking Firebase Configuration..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "   Create one based on env.example:"
    echo "   cp env.example .env"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"
echo ""

# Function to check env var
check_env_var() {
    local var_name=$1
    local expected_pattern=$2
    local description=$3
    
    if grep -q "^${var_name}=" .env; then
        local value=$(grep "^${var_name}=" .env | cut -d '=' -f2-)
        
        if [ -z "$value" ] || [ "$value" = "your_api_key_here" ] || [[ "$value" == your_* ]]; then
            echo -e "${YELLOW}⚠️  ${var_name} is set but needs a real value${NC}"
            echo "   Current: $value"
            echo "   Description: $description"
        else
            if [ -n "$expected_pattern" ] && [[ ! "$value" =~ $expected_pattern ]]; then
                echo -e "${RED}❌ ${var_name} format looks incorrect${NC}"
                echo "   Current: $value"
                echo "   Expected pattern: $expected_pattern"
            else
                echo -e "${GREEN}✅ ${var_name} is set${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ ${var_name} is missing${NC}"
        echo "   Description: $description"
    fi
    echo ""
}

# Check critical Firebase variables
echo "📋 Checking Firebase Configuration:"
echo "=================================="
check_env_var "VITE_FIREBASE_API_KEY" "" "Firebase API Key"
check_env_var "VITE_FIREBASE_AUTH_DOMAIN" "firebaseapp.com" "Should be wiz-magic-platform.firebaseapp.com"
check_env_var "VITE_FIREBASE_PROJECT_ID" "wiz-magic-platform" "Should be wiz-magic-platform"
check_env_var "VITE_FIREBASE_STORAGE_BUCKET" "appspot.com" "Firebase Storage Bucket"
check_env_var "VITE_FIREBASE_MESSAGING_SENDER_ID" "" "Firebase Messaging Sender ID"
check_env_var "VITE_FIREBASE_APP_ID" "" "Firebase App ID"

echo "📋 Checking Google OAuth Configuration:"
echo "======================================="
check_env_var "VITE_GOOGLE_CLIENT_ID" "apps.googleusercontent.com" "Google OAuth Client ID"

echo "📋 Checking YouTube API Configuration:"
echo "======================================"
check_env_var "VITE_YOUTUBE_API_KEY" "" "YouTube Data API Key"

# Check auth domain specifically
echo ""
echo "🔐 Auth Domain Check:"
echo "===================="
if grep -q "^VITE_FIREBASE_AUTH_DOMAIN=" .env; then
    AUTH_DOMAIN=$(grep "^VITE_FIREBASE_AUTH_DOMAIN=" .env | cut -d '=' -f2-)
    
    if [[ "$AUTH_DOMAIN" == *"firebaseapp.com"* ]]; then
        echo -e "${GREEN}✅ Auth domain is correctly set to Firebase project domain${NC}"
        echo "   Value: $AUTH_DOMAIN"
    else
        echo -e "${RED}❌ Auth domain should be your Firebase project domain!${NC}"
        echo "   Current: $AUTH_DOMAIN"
        echo "   Expected: wiz-magic-platform.firebaseapp.com"
        echo ""
        echo "   This is likely causing your OAuth errors!"
    fi
else
    echo -e "${RED}❌ VITE_FIREBASE_AUTH_DOMAIN is not set${NC}"
fi

echo ""
echo "📝 Summary:"
echo "=========="
echo "If any checks failed, update your .env file with the correct values."
echo "After updating, rebuild your app: npm run build"
echo ""
echo "For detailed fix instructions, see: FIREBASE_AUTH_FIX.md"

