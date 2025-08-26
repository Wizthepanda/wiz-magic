# 🔧 OAuth Error Fix Guide

## ❌ Current Error: "The OAuth client was not found"

**Error Code:** 401: invalid_client  
**Cause:** OAuth Client ID not configured or incorrect  
**Solution:** Set up proper Google Cloud OAuth credentials  

---

## 🎯 EXACT STEPS TO FIX

### Step 1: Google Cloud Console Setup
1. **Go to:** https://console.cloud.google.com/
2. **Create project** (if needed) or select existing project
3. **Project name suggestion:** `wiz-youtube-integration`

### Step 2: Enable APIs
1. **Go to:** APIs & Services → Library
2. **Search and enable:**
   - YouTube Data API v3
   - Google Identity Services API (if available)

### Step 3: Configure OAuth Consent Screen
1. **Go to:** APIs & Services → OAuth consent screen
2. **User Type:** External (for testing with any Google account)
3. **Fill required fields:**
   ```
   App name: WIZ Creator Platform
   User support email: your-email@example.com
   Developer contact email: your-email@example.com
   ```
4. **Authorized domains:** Add `wiz-magic-platform.web.app`
5. **Scopes:** Add `https://www.googleapis.com/auth/youtube.readonly`
6. **Test users:** Add your email for testing
7. **Save and continue through all steps**

### Step 4: Create OAuth 2.0 Client ID
1. **Go to:** APIs & Services → Credentials
2. **Click:** + CREATE CREDENTIALS → OAuth 2.0 Client IDs
3. **Application type:** Web application
4. **Name:** `WIZ YouTube OAuth Client`
5. **Authorized JavaScript origins:**
   ```
   http://localhost:8080
   https://wiz-magic-platform.web.app
   ```
6. **Authorized redirect URIs:** Leave empty (we use implicit flow)
7. **Click:** Create
8. **Copy the Client ID** (format: `123456789-abcdefghijk.googleusercontent.com`)

### Step 5: Create API Key
1. **In Credentials:** + CREATE CREDENTIALS → API key
2. **Copy the API key** (format: `AIzaSyABC123...`)
3. **Click:** Restrict key
4. **Application restrictions:** HTTP referrers
5. **Website restrictions:** 
   ```
   http://localhost:8080/*
   https://wiz-magic-platform.web.app/*
   ```
6. **API restrictions:** YouTube Data API v3
7. **Save**

### Step 6: Update Local Environment
**Create/update `.env.local`:**
```env
VITE_YOUTUBE_CLIENT_ID=your-client-id-here.googleusercontent.com
VITE_YOUTUBE_API_KEY=your-api-key-here
```

**Example:**
```env
VITE_YOUTUBE_CLIENT_ID=123456789-abcdefghijklmnop.googleusercontent.com
VITE_YOUTUBE_API_KEY=AIzaSyABC123DEF456GHI789JKL012MNO345PQR
```

### Step 7: Test Local Setup
```bash
# Verify configuration
node test-youtube-setup.js

# Restart dev server
npm run dev

# Test OAuth flow
# Go to Create page → Click Connect YouTube Channel
```

---

## 🌐 For Production (wiz-magic-platform.web.app)

### Option 1: Firebase Environment Variables
```bash
firebase functions:config:set youtube.client_id="your-client-id"
firebase functions:config:set youtube.api_key="your-api-key"
```

### Option 2: Build-time Environment Variables
In your build/deployment pipeline, set:
```env
VITE_YOUTUBE_CLIENT_ID=your-client-id
VITE_YOUTUBE_API_KEY=your-api-key
```

### Option 3: Runtime Configuration
Create a public configuration file (less secure):
```javascript
// public/config.js
window.WIZ_CONFIG = {
  YOUTUBE_CLIENT_ID: 'your-client-id-here.googleusercontent.com'
  // API key should not be in public config
};
```

---

## ✅ Verification Checklist

### Before Testing:
- [ ] Google Cloud project created
- [ ] YouTube Data API v3 enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] API key created and restricted
- [ ] Authorized origins set correctly
- [ ] Environment variables updated
- [ ] Dev server restarted

### Expected Results:
- [ ] No "OAuth client not found" error
- [ ] Google OAuth popup appears
- [ ] Can grant permissions successfully
- [ ] Real YouTube channel connects
- [ ] Videos load from actual channel

---

## 🔍 Troubleshooting

### Still getting "invalid_client" error?

1. **Double-check Client ID format:**
   - Should end with `.googleusercontent.com`
   - No extra spaces or characters
   - Exactly as shown in Google Cloud Console

2. **Verify authorized origins:**
   - Must include `https://wiz-magic-platform.web.app`
   - No trailing slashes
   - Exact match required

3. **Check OAuth consent screen:**
   - Must be configured and published
   - App must be in "Testing" or "Production" status
   - User email must be added to test users (if in testing)

4. **API enablement:**
   - YouTube Data API v3 must be enabled
   - May take a few minutes to propagate

### Other common issues:

**403 Forbidden:** API key restrictions too strict
**400 Bad Request:** Malformed request (check authorized origins)
**429 Too Many Requests:** Quota exceeded (wait or request quota increase)

---

## 🚀 Quick Test Command

After setup, verify with:
```bash
# Check configuration
node test-youtube-setup.js

# Should show:
# ✅ VITE_YOUTUBE_CLIENT_ID: Configured
# ✅ VITE_YOUTUBE_API_KEY: Configured
# ✅ Ready to test YouTube connection
```

---

## 📞 Need Help?

1. Check the Google Cloud Console for any error messages
2. Verify all credentials are copied correctly (no extra spaces)
3. Ensure OAuth consent screen is properly configured
4. Try with a fresh incognito browser window

The OAuth error will be resolved once you complete these steps!