# 🔒 Security Best Practices - Wiz Magic Platform

## Table of Contents
1. [API Key Management](#api-key-management)
2. [Environment Variables](#environment-variables)
3. [Pre-Commit Security](#pre-commit-security)
4. [Google Cloud Console Configuration](#google-cloud-console-configuration)
5. [Automated Security Validation](#automated-security-validation)
6. [Emergency Response](#emergency-response)

---

## 🔑 API Key Management

### DO's ✅

1. **Always use environment variables**
   ```typescript
   // ✅ CORRECT
   const firebaseConfig = {
     apiKey: process.env.VITE_FIREBASE_API_KEY,
     projectId: process.env.VITE_FIREBASE_PROJECT_ID,
   };
   ```

2. **Apply restrictions in Google Cloud Console**
   - **HTTP Referrers**: Limit to your authorized domains only
   - **API Restrictions**: Enable only the APIs you need
   - Navigate to: https://console.cloud.google.com/apis/credentials

3. **Use different keys for different environments**
   - Development: `.env.development`
   - Staging: `.env.staging`
   - Production: `.env.production`

4. **Regularly rotate API keys** (every 90 days recommended)

5. **Monitor usage and set up billing alerts**
   - Check Firebase Console → Usage
   - Set up alerts in Google Cloud Console → Billing

### DON'Ts ❌

1. **Never hardcode API keys**
   ```typescript
   // ❌ WRONG - This will trigger our pre-commit hook!
   const firebaseConfig = {
     apiKey: "AIzaSy...",  // NEVER DO THIS
   };
   ```

2. **Never commit `.env` files to Git**
   - `.env` is already in `.gitignore` - keep it there!
   - Only commit `.env.example` with placeholder values

3. **Never share API keys in chat, email, or documentation**

4. **Never use production credentials in development**

5. **Never ignore security warnings from tools**

---

## 📁 Environment Variables

### File Structure

```
project-root/
├── .env                    # ❌ NEVER commit (contains real secrets)
├── .env.example            # ✅ Commit (template with placeholders)
├── .env.development        # ❌ NEVER commit (dev secrets)
├── .env.production         # ❌ NEVER commit (prod secrets)
└── .gitignore              # ✅ Ensure .env* is listed
```

### Creating Your Environment File

```bash
# Step 1: Copy the example template
cp .env.example .env

# Step 2: Edit .env with your actual credentials
# Use your text editor to replace placeholder values

# Step 3: Verify .env is in .gitignore
grep "^\.env$" .gitignore
# Should output: .env
```

### Required Environment Variables

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-key-here
VITE_FIREBASE_AUTH_DOMAIN=wiz-magic-platform.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wiz-magic-platform
VITE_FIREBASE_STORAGE_BUCKET=wiz-magic-platform.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_YOUTUBE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# YouTube API
VITE_YOUTUBE_API_KEY=your-youtube-api-key
VITE_USE_YOUTUBE_API=true
```

---

## 🔍 Pre-Commit Security

### How It Works

Every time you run `git commit`, our pre-commit hook automatically:
1. Scans all staged files for potential secrets
2. Blocks the commit if any secrets are detected
3. Shows you exactly what was found and where

### What It Detects

- Google API Keys (`AIzaSy...`)
- AWS Access Keys
- OpenAI API Keys
- GitHub Tokens
- Slack Tokens
- Hardcoded Firebase config objects
- `.env` files accidentally staged

### Testing the Pre-Commit Hook

```bash
# This should be BLOCKED (testing the hook):
echo 'const key = "AIzaSyDaPOgfD10V1oKuVCQ26d7I4_sNKq6UyYI";' > test-secret.js
git add test-secret.js
git commit -m "test"
# Should see: 🚨 COMMIT BLOCKED: Secrets detected!

# Clean up
rm test-secret.js
git reset
```

### Bypassing the Hook (Emergency Only)

If you're ABSOLUTELY CERTAIN there's a false positive:

```bash
git commit --no-verify -m "your message"
```

⚠️ **WARNING**: Only use `--no-verify` if you're 100% sure. False positives are rare!

---

## ☁️ Google Cloud Console Configuration

### API Key Restrictions

**Navigate to**: https://console.cloud.google.com/apis/credentials?project=wiz-magic-platform

#### 1. HTTP Referrer Restrictions

Limit your Firebase API key to these domains:

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

#### 2. API Restrictions

Enable ONLY these APIs:
- ✅ Cloud Firestore API
- ✅ Firebase Authentication API
- ✅ Firebase Storage API
- ✅ Identity Toolkit API
- ✅ YouTube Data API v3 (if using YouTube features)

#### 3. OAuth 2.0 Client Configuration

**Authorized JavaScript Origins**:
```
https://wizup.live
https://www.wizup.live
https://wizxp.com
https://www.wizxp.com
https://wiz-magic-platform.web.app
http://localhost:5173
http://localhost:8080
http://localhost:5000
```

**Authorized Redirect URIs**:
```
https://wizup.live/__/auth/handler
https://www.wizup.live/__/auth/handler
https://wizxp.com/__/auth/handler
https://www.wizxp.com/__/auth/handler
https://wiz-magic-platform.web.app/__/auth/handler
http://localhost:5173/__/auth/handler
http://localhost:8080/__/auth/handler
http://localhost:5000/__/auth/handler
```

---

## 🤖 Automated Security Validation

### Running the Security Scan

```bash
# Scan entire codebase for hardcoded credentials
npm run validate-security
```

### What It Checks

1. ✅ `.env` is in `.gitignore`
2. ✅ `.env.example` exists
3. ✅ No hardcoded Google API keys
4. ✅ No hardcoded Firebase configs
5. ✅ Code uses environment variables
6. ✅ Local `.env` file has required variables

### Expected Output (When Passing)

```
╔══════════════════════════════════════════════════════╗
║   ✅ Security Validation PASSED                      ║
║   No credential issues detected!                     ║
╚══════════════════════════════════════════════════════╝
```

### Integration into CI/CD

Add to your GitHub Actions workflow:

```yaml
- name: Security validation
  run: npm run validate-security
```

---

## 🚨 Emergency Response

### If an API Key is Exposed

**IMMEDIATE ACTIONS** (complete within 30 minutes):

1. **Rotate the key in Google Cloud Console**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on the exposed key
   - Click "Regenerate Key" or create a new one
   - Copy the new key

2. **Update your local `.env` file**
   ```bash
   # Edit .env and replace old key with new key
   VITE_FIREBASE_API_KEY=your-new-key-here
   ```

3. **Apply restrictions to the new key**
   - Set HTTP referrers (domain whitelist)
   - Set API restrictions (limit to required APIs)

4. **Update production environment variables**
   - Firebase Hosting: Update environment config
   - Redeploy your application

5. **Test that everything still works**
   ```bash
   npm run dev
   # Verify authentication works
   ```

### If You're Under Attack

1. **Delete the compromised API key immediately**
2. **Check Firebase Console → Usage for suspicious activity**
3. **Check Google Cloud Console → Billing for unexpected charges**
4. **Review Firestore security rules**
5. **Consider temporarily disabling the Firebase project**
6. **Contact Firebase Support**: https://firebase.google.com/support

### Preventing Future Incidents

See: [SECURITY_REMEDIATION_GUIDE.md](./SECURITY_REMEDIATION_GUIDE.md)

---

## 📚 Additional Resources

### Documentation
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/learn-more#security-best-practices)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

### Tools We Use
- **Husky**: Git hooks for pre-commit scanning
- **Custom Scripts**: `scripts/validate-security.sh`
- **GitHub Secret Scanning**: Automatic detection of pushed secrets

### Security Checklist (Weekly Review)

- [ ] Review API key usage in Google Cloud Console
- [ ] Check for any new `.env*` files that shouldn't be committed
- [ ] Run `npm run validate-security` to scan codebase
- [ ] Review Firebase security rules
- [ ] Check for any security alerts from GitHub
- [ ] Review access logs for unusual activity
- [ ] Verify billing is within expected range

---

## 🎓 Training Scenarios

### Scenario 1: New Developer Onboarding

**What they need**:
1. Copy `.env.example` to `.env`
2. Request Firebase credentials from team lead
3. Add credentials to `.env` (never commit!)
4. Run `npm run dev` to verify setup
5. Try to commit a file with a fake API key (to test the pre-commit hook)

### Scenario 2: Adding a New Service

**Steps**:
1. Create new API key in Google Cloud Console
2. Apply appropriate restrictions immediately
3. Add to `.env` file: `VITE_NEW_SERVICE_KEY=...`
4. Add to `.env.example`: `VITE_NEW_SERVICE_KEY=your-key-here`
5. Update code to use `process.env.VITE_NEW_SERVICE_KEY`
6. Run `npm run validate-security` before committing

### Scenario 3: Rotating Keys

**Every 90 days**:
1. Generate new key in Google Cloud Console
2. Apply same restrictions as old key
3. Test with new key in development
4. Update `.env` in all environments
5. Delete old key after confirming new key works
6. Document the rotation in your security log

---

## ✅ Summary

**Remember**:
1. 🔑 Environment variables for ALL secrets
2. 🚫 NEVER commit `.env` files
3. 🔒 Apply restrictions in Google Cloud Console
4. 🔍 Run security validation before deploying
5. 🚨 Respond immediately to exposure alerts
6. 📝 Keep `.env.example` up to date
7. 🔄 Rotate keys regularly

**Your safety nets**:
- ✅ Pre-commit hook blocks secret commits
- ✅ GitHub secret scanning alerts you
- ✅ Validation script checks entire codebase
- ✅ API restrictions limit damage if exposed

**Stay secure!** 🛡️
