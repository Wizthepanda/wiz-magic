#!/bin/bash

# 🔒 Security Validation Script
# Run this to scan your entire codebase for hardcoded credentials

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo "${BLUE}║   🔒 Security Validation - Credential Scan          ║${NC}"
echo "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

ISSUES_FOUND=0

# Check 1: Ensure .env is in .gitignore
echo "${BLUE}[1/6]${NC} Checking .gitignore configuration..."
if grep -q "^\.env$" .gitignore; then
  echo "${GREEN}✅ .env is in .gitignore${NC}"
else
  echo "${RED}❌ .env is NOT in .gitignore${NC}"
  echo "   Add this line to .gitignore:"
  echo "   ${YELLOW}.env${NC}"
  ISSUES_FOUND=1
fi
echo ""

# Check 2: Ensure .env.example exists
echo "${BLUE}[2/6]${NC} Checking for .env.example template..."
if [ -f ".env.example" ]; then
  echo "${GREEN}✅ .env.example exists${NC}"
else
  echo "${YELLOW}⚠️  .env.example not found${NC}"
  echo "   Create a template with placeholder values"
  ISSUES_FOUND=1
fi
echo ""

# Check 3: Scan for Google API keys
echo "${BLUE}[3/6]${NC} Scanning for Google API keys..."
GOOGLE_API_KEYS=$(grep -r "AIzaSy[0-9A-Za-z_-]\{33\}" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --include="*.json" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.git \
  . 2>/dev/null || true)

if [ -z "$GOOGLE_API_KEYS" ]; then
  echo "${GREEN}✅ No hardcoded Google API keys found${NC}"
else
  echo "${RED}❌ Google API keys detected:${NC}"
  echo "$GOOGLE_API_KEYS" | sed 's/^/   /'
  ISSUES_FOUND=1
fi
echo ""

# Check 4: Scan for Firebase config objects with hardcoded apiKey
echo "${BLUE}[4/6]${NC} Scanning for hardcoded Firebase configs..."
FIREBASE_CONFIGS=$(grep -r "apiKey.*:.*['\"][A-Za-z0-9_-]\{30,\}['\"]" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.git \
  . 2>/dev/null || true)

if [ -z "$FIREBASE_CONFIGS" ]; then
  echo "${GREEN}✅ No hardcoded Firebase configs found${NC}"
else
  echo "${RED}❌ Hardcoded Firebase configs detected:${NC}"
  echo "$FIREBASE_CONFIGS" | sed 's/^/   /'
  ISSUES_FOUND=1
fi
echo ""

# Check 5: Ensure environment variables are used
echo "${BLUE}[5/6]${NC} Checking if code uses environment variables..."
if grep -rq "process\.env\.VITE_FIREBASE_API_KEY\|import\.meta\.env\.VITE_FIREBASE_API_KEY" \
  --include="*.ts" \
  --include="*.tsx" \
  --include="*.js" \
  --include="*.jsx" \
  --exclude-dir=node_modules \
  src/; then
  echo "${GREEN}✅ Code uses environment variables for Firebase config${NC}"
else
  echo "${YELLOW}⚠️  Unable to detect environment variable usage${NC}"
  echo "   Ensure you're using process.env.VITE_FIREBASE_API_KEY"
fi
echo ""

# Check 6: Verify .env file exists locally
echo "${BLUE}[6/6]${NC} Checking local .env file..."
if [ -f ".env" ]; then
  echo "${GREEN}✅ .env file exists${NC}"

  # Check if it contains required variables
  REQUIRED_VARS=(
    "VITE_FIREBASE_API_KEY"
    "VITE_FIREBASE_PROJECT_ID"
    "VITE_FIREBASE_AUTH_DOMAIN"
  )

  for VAR in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${VAR}=" .env; then
      echo "${GREEN}  ✅ $VAR is set${NC}"
    else
      echo "${RED}  ❌ $VAR is missing${NC}"
      ISSUES_FOUND=1
    fi
  done
else
  echo "${RED}❌ .env file not found${NC}"
  echo "   Create .env file with your Firebase credentials"
  ISSUES_FOUND=1
fi
echo ""

# Summary
echo "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
if [ $ISSUES_FOUND -eq 0 ]; then
  echo "${GREEN}║   ✅ Security Validation PASSED                      ║${NC}"
  echo "${GREEN}║   No credential issues detected!                     ║${NC}"
else
  echo "${RED}║   ❌ Security Validation FAILED                      ║${NC}"
  echo "${RED}║   Please fix the issues above                        ║${NC}"
fi
echo "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  exit 0
else
  exit 1
fi
