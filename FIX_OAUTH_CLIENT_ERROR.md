# 🔧 Fix "OAuth client was not found" Error

## ❌ Current Error
**Error 401: invalid_client**  
**Message:** "The OAuth client was not found"  
**Cause:** Missing or incorrect YouTube OAuth Client ID

---

## 🎯 EXACT SOLUTION (5 Minutes)

### Step 1: Google Cloud Console
**Go to:** https://console.cloud.google.com/

### Step 2: Create or Select Project
- **Create new project:** Click "Select a project" → "New Project"
- **Project name:** `wiz-youtube-oauth` (or any name)
- **Click:** Create

### Step 3: Enable YouTube Data API v3
1. **Go to:** APIs & Services → Library
2. **Search:** `YouTube Data API v3`
3. **Click:** Enable
4. **Wait for confirmation**

### Step 4: Configure OAuth Consent Screen
1. **Go to:** APIs & Services → OAuth consent screen
2. **User Type:** External
3. **Click:** Create
4. **Fill required fields:**
   - **App name:** `WIZ Creator Platform`
   - **User support email:** Your email
   - **Developer contact email:** Your email
5. **Click:** Save and Continue
6. **Scopes:** Click "Add or Remove Scopes"
7. **Add:** `https://www.googleapis.com/auth/youtube.readonly`
8. **Click:** Update → Save and Continue
9. **Test users:** Add your email
10. **Click:** Save and Continue → Back to Dashboard

### Step 5: Create OAuth 2.0 Client ID
1. **Go to:** APIs & Services → Credentials
2. **Click:** + CREATE CREDENTIALS
3. **Select:** OAuth 2.0 Client IDs
4. **Application type:** Web application
5. **Name:** `WIZ YouTube OAuth Client`
6. **Authorized JavaScript origins:**
   ```
   http://localhost:8080
   https://wiz-magic-platform.web.app
   ```
7. **Click:** Create
8. **COPY the Client ID** (looks like: `123456789-abcdefghijk.googleusercontent.com`)

### Step 6: Create API Key
1. **Still in Credentials:** + CREATE CREDENTIALS
2. **Select:** API key
3. **COPY the API Key** (looks like: `AIzaSyABC123DEF456...`)
4. **Click:** Restrict Key
5. **API restrictions:** Select "Restrict key" → YouTube Data API v3
6. **Click:** Save

### Step 7: Update Your Environment
**Edit `.env.local` in your project:**
```env
VITE_YOUTUBE_CLIENT_ID=paste-your-client-id-here.googleusercontent.com
VITE_YOUTUBE_API_KEY=paste-your-api-key-here
```

**Example:**
```env
VITE_YOUTUBE_CLIENT_ID=123456789-abcdefghijklmnop.googleusercontent.com
VITE_YOUTUBE_API_KEY=AIzaSyABC123DEF456GHI789JKL012MNO345PQR
```

### Step 8: Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 9: Test
1. **Go to Create page**
2. **Click "Connect YouTube Channel"**
3. **Should now open Google OAuth popup** (no more "client not found" error)

---

## ✅ Success Indicators

### You'll know it's working when:
- ✅ **No "OAuth client not found" error**
- ✅ **Google OAuth popup appears**
- ✅ **Can grant YouTube permissions**
- ✅ **Shows your real channel name**
- ✅ **Loads your actual videos**

---

## 🔍 Troubleshooting

### Still getting "invalid_client"?

**Check these exactly:**

1. **Client ID format:** Must end with `.googleusercontent.com`
2. **No extra spaces** in `.env.local` file
3. **Authorized origins** must include:
   - `http://localhost:8080` (for local development)
   - `https://wiz-magic-platform.web.app` (for production)
4. **OAuth consent screen** must be configured
5. **YouTube Data API v3** must be enabled

### Common mistakes:
- ❌ Using Client Secret instead of Client ID
- ❌ Extra spaces or quotes in environment variables
- ❌ Wrong authorized origins
- ❌ Skipping OAuth consent screen setup

---

## 📋 Quick Checklist

- [ ] Google Cloud project created
- [ ] YouTube Data API v3 enabled
- [ ] OAuth consent screen configured with scopes
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized origins set correctly
- [ ] API key created and restricted
- [ ] Environment variables updated in `.env.local`
- [ ] Development server restarted

---

## 🚀 After Setup

Once configured correctly:
1. **Create page** will show no configuration warnings
2. **"Connect YouTube Channel"** button will open real OAuth popup
3. **Your actual YouTube channel** will connect
4. **Your real videos** will load for selection
5. **Publishing to WIZ** will work with actual content

The error "The OAuth client was not found" will be completely resolved! 🎉