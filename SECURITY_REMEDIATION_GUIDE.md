# 🔒 CRITICAL: API Key Exposure - Remediation Guide

## ⚠️ IMMEDIATE THREAT ASSESSMENT

**Status**: 🚨 **CRITICAL - Exposed Firebase API Key**

**Exposed Credential**:
```
API Key: AIzaSyCD6kuuaobXR1fCEbPwrwIy6FDwZtRmeV8
Location: src/lib/seedZapRewardTiers.ts (line 14)
Commit: 66f99d0b652cedc32e0e3c35251c20128c1935d3
Repository: https://github.com/Wizthepanda/wiz-magic (PUBLIC)
```

**Risk Level**: MEDIUM-HIGH
- Firebase Web API keys are somewhat restricted by default (domain restrictions)
- However, key can be used to access Firebase services from any domain until restrictions are applied
- Malicious actors can potentially abuse quotas, make unauthorized requests, or enumerate project details

---

## 🚀 IMMEDIATE ACTION PLAN (Complete in Next 30 Minutes)

### ✅ PHASE 1: Stop the Bleeding (5 minutes)

#### Step 1: Rotate the Exposed API Key

**Navigate to Google Cloud Console**:
1. Go to: https://console.cloud.google.com/apis/credentials?project=wiz-magic-platform
2. Look for **API Keys** section
3. Find the key: `AIzaSyCD6kuuaobXR1fCEbPwrwIy6FDwZtRmeV8`

**Option A: Regenerate the Key (RECOMMENDED)**:
1. Click on the exposed API key
2. Click **"Regenerate Key"** button
3. Copy the NEW API key (e.g., `AIzaSy...NEW_KEY_HERE`)
4. Click **"Save"**

**Option B: Delete and Create New**:
1. Click **"+ CREATE CREDENTIALS"** → **"API key"**
2. Copy the new key immediately
3. Delete the old exposed key

**IMMEDIATELY UPDATE YOUR .env FILE**:
```bash
# In your local .env file, replace the old key with the new one:
VITE_FIREBASE_API_KEY=AIzaSy...YOUR_NEW_KEY_HERE
VITE_YOUTUBE_API_KEY=AIzaSy...YOUR_NEW_KEY_HERE
```

---

#### Step 2: Apply API Key Restrictions (CRITICAL)

**While still in Google Cloud Console API Keys page**:

1. Click on your **NEW API key**
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add these allowed referrers:
     ```
     https://wizup.live/*
     https://www.wizup.live/*
     https://wizxp.com/*
     https://www.wizxp.com/*
     https://wiz-magic-platform.web.app/*
     https://wiz-magic-platform.firebaseapp.com/*
     http://localhost:5173/*
     http://localhost:8080/*
     http://localhost:5000/*
     ```

3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Enable ONLY these APIs:
     - ✅ Cloud Firestore API
     - ✅ Firebase Authentication API
     - ✅ Firebase Storage API
     - ✅ YouTube Data API v3 (if using YouTube features)
     - ✅ Identity Toolkit API

4. Click **"Save"**

**Why this matters**: Even if someone gets your key, they can only use it from your authorized domains and for specific APIs.

---

#### Step 3: Update Local Environment (2 minutes)

```bash
# 1. Update your .env file with the new API key (you already did this in Step 1)

# 2. Verify the change
cat .env | grep VITE_FIREBASE_API_KEY

# 3. Test locally (IMPORTANT - make sure app still works!)
npm run dev
```

**Open browser to http://localhost:5173 and verify**:
- ✅ App loads without errors
- ✅ Can authenticate with Google
- ✅ No console errors about Firebase config

---

### ✅ PHASE 2: Clean Up Git History (15 minutes)

#### ⚠️ WARNING: This will rewrite Git history! Coordinate with your team first.

**Option A: Remove Sensitive Data from All Commits (using BFG Repo-Cleaner)**

**Install BFG**:
```bash
# macOS
brew install bfg

# Or download from: https://rtyley.github.io/bfg-repo-cleaner/
```

**Create a file with secrets to remove**:
```bash
cd /Users/Ira/Desktop/Wiz\ Magic
echo 'AIzaSyCD6kuuaobXR1fCEbPwrwIy6FDwZtRmeV8' > secrets.txt
```

**Run BFG to remove the exposed key from all commits**:
```bash
# Clone a fresh copy of your repo (for safety)
cd /Users/Ira/Desktop
git clone --mirror git@github.com:Wizthepanda/wiz-magic.git

# Run BFG to remove the secret
bfg --replace-text secrets.txt wiz-magic.git

# Garbage collect to permanently remove the data
cd wiz-magic.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push the cleaned repository
git push --force
```

**Option B: Simpler Approach - Accept the exposure and move forward**

Since Firebase Web API keys are meant to be somewhat public (they appear in JavaScript), and you've now:
1. ✅ Rotated the key (old key is invalid)
2. ✅ Applied restrictions (new key only works from your domains)
3. ✅ Fixed the code to use env variables

**You can choose to**:
- Leave the old (now invalid) key in Git history
- Focus on preventing future exposures
- Add a commit message explaining the key was rotated

**I RECOMMEND Option B** because:
- The old key is now invalid anyway
- Rewriting history is risky
- Future prevention is more important than hiding old mistakes

---

### ✅ PHASE 3: Commit Your Fixes (5 minutes)

```bash
cd /Users/Ira/Desktop/Wiz\ Magic

# Check what changed
git status
git diff src/lib/seedZapRewardTiers.ts

# Stage the fixed file
git add src/lib/seedZapRewardTiers.ts

# Commit with a clear security message
git commit -m "🔒 Security: Remove hardcoded API key from seedZapRewardTiers.ts

- Replace hardcoded Firebase credentials with environment variables
- Add validation to ensure required env vars are present
- Previous API key has been rotated and invalidated in Google Cloud Console
- New API key has domain restrictions and API restrictions applied

Security Best Practice: Never commit API keys, tokens, or credentials to Git"

# Push to GitHub
git push origin branch-29
```

---

## 🛡️ PREVENTION: Ensure This NEVER Happens Again

### ✅ Step 4: Install Pre-Commit Hook (Automated Protection)

I'll create this for you in the next step, but here's what it does:
- Scans every commit for potential secrets (API keys, tokens, passwords)
- Blocks the commit if secrets are detected
- Works automatically - you don't need to remember anything

---

### ✅ Step 5: Enable GitHub Secret Scanning Alerts

**Go to your GitHub repository settings**:
1. https://github.com/Wizthepanda/wiz-magic/settings/security_analysis
2. Enable **"Secret scanning"**
3. Enable **"Push protection"** (prevents commits with secrets from being pushed)

**This provides an extra safety net** - even if you bypass the pre-commit hook, GitHub will block the push.

---

### ✅ Step 6: Add Automated Validation Script

I'll create a script that:
- Checks all files for hardcoded credentials
- Validates .env.example exists (template without real secrets)
- Ensures .gitignore includes .env files
- Can be run manually or in CI/CD

---

## 📋 VERIFICATION CHECKLIST

After completing all steps above, verify:

- [ ] Old API key rotated/deleted in Google Cloud Console
- [ ] New API key added to local `.env` file
- [ ] New API key has HTTP referrer restrictions applied
- [ ] New API key has API restrictions applied
- [ ] `src/lib/seedZapRewardTiers.ts` now uses `process.env.VITE_FIREBASE_API_KEY`
- [ ] Local dev server runs successfully with new key
- [ ] Can authenticate with Google using new configuration
- [ ] Changes committed to Git with clear security message
- [ ] Changes pushed to GitHub
- [ ] Pre-commit hook installed (next step)
- [ ] GitHub secret scanning enabled
- [ ] No hardcoded credentials remain in codebase

---

## 🎯 WHAT YOU'VE LEARNED

### Why This Happened:
1. **Developer Convenience**: It's faster to hardcode values while testing
2. **Lack of Awareness**: Didn't realize the file would be committed
3. **No Safety Nets**: No pre-commit hooks or linting to catch the mistake

### Why It's Dangerous:
1. **Public Access**: Anyone can see your API key on GitHub
2. **Quota Abuse**: Attackers can make requests using your quota
3. **Cost Implications**: Could run up unexpected Firebase bills
4. **Data Access**: Depending on security rules, might access your data

### How We Fixed It:
1. ✅ **Rotated** the compromised key immediately
2. ✅ **Restricted** the new key to your domains only
3. ✅ **Removed** hardcoded credentials from code
4. ✅ **Validated** environment variables at runtime
5. ✅ **Automated** future prevention with tools

---

## 📚 Security Best Practices Going Forward

### ✅ DO:
- ✅ Always use environment variables for secrets
- ✅ Keep `.env` in `.gitignore` (already configured)
- ✅ Create `.env.example` with fake/template values
- ✅ Use pre-commit hooks to scan for secrets
- ✅ Enable GitHub secret scanning and push protection
- ✅ Apply API key restrictions in Google Cloud Console
- ✅ Regularly audit your codebase for hardcoded credentials
- ✅ Use different API keys for dev/staging/production

### ❌ DON'T:
- ❌ Never hardcode API keys, tokens, or passwords
- ❌ Never commit `.env` files to Git
- ❌ Never share API keys in chat/email/slack
- ❌ Never use production credentials in development
- ❌ Never skip security warnings from tools
- ❌ Never ignore secret scanning alerts from GitHub

---

## 🆘 EMERGENCY CONTACTS

**If you suspect ongoing abuse of the exposed key**:
1. Check Firebase Console → Usage: https://console.firebase.google.com/project/wiz-magic-platform/usage
2. Check Google Cloud Console → Billing: https://console.cloud.google.com/billing
3. Set up billing alerts to notify you of unexpected costs
4. Consider temporarily disabling the Firebase project if under attack

**Firebase Support**: https://firebase.google.com/support

---

## 📊 TIMELINE: What Just Happened

1. **Initial Exposure**: Committed hardcoded API key in `seedZapRewardTiers.ts`
2. **Detection**: Google's automated scanning detected the key on GitHub
3. **Alert**: You received email/notification from Google Security
4. **Response Time**: Addressing within minutes/hours ✅ GOOD!
5. **Remediation**: Following this guide to fix and prevent

**Your quick response is excellent!** Most breaches are much worse when keys stay exposed for days/weeks.

---

## ✅ FINAL NOTES

This guide will get you back to a secure state. The next files I create will:
1. **Pre-commit hook** - Automatically scans commits for secrets
2. **Validation script** - Checks entire codebase for credentials
3. **Updated security documentation** - Best practices reference

**You're doing great by addressing this immediately!** 🎉

---

**Current Status**: Ready to execute Phase 1, 2, and 3 above. Then we'll implement the prevention measures.

Let's start with Phase 1, Step 1 - rotating that API key in Google Cloud Console! 🚀
