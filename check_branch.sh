#!/bin/bash

echo "╔════════════════════════════════════════╗"
echo "║   Branch Verification Script          ║"
echo "╚════════════════════════════════════════╝"
echo ""

echo "Current Branch:"
git branch --show-current
echo ""

echo "Checking for new files..."
echo ""

if [ -d "src/components/homepage" ]; then
    echo "✅ Homepage components found:"
    ls src/components/homepage/ | sed 's/^/   /'
else
    echo "❌ Homepage components NOT found!"
    echo "   You are on the WRONG branch!"
fi

echo ""

if [ -f "src/pages/About.tsx" ]; then
    echo "✅ Static pages found:"
    ls src/pages/*.tsx | grep -E "(About|Careers|Partners|Cookie|Gdpr|Help)" | sed 's|src/pages/||' | sed 's/^/   /'
else
    echo "❌ Static pages NOT found!"
    echo "   You are on the WRONG branch!"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   If files are missing, switch branch: ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "git checkout claude/check-implementation-status-011CUpWsxJD3UkajLT2QrGnz"
echo ""
