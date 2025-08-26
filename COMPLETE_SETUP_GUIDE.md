# 🎬 Complete YouTube API Setup Guide

## 🎯 Current Status
✅ **Create page is working** - Import errors fixed  
✅ **Real OAuth flow implemented** - No more mock data  
✅ **Error handling active** - Shows proper configuration warnings  
⚠️ **Needs API credentials** - To connect real YouTube channels  

## 📋 Step-by-Step Setup (10 minutes)

### Step 1: Google Cloud Console Setup
1. **Go to:** https://console.cloud.google.com/
2. **Create new project** or select existing one
3. **Project name:** `WIZ YouTube Integration` (or any name)

### Step 2: Enable YouTube Data API v3
1. **Navigate to:** APIs & Services → Library
2. **Search:** "YouTube Data API v3"
3. **Click:** Enable
4. **Wait** for it to be enabled (usually instant)

### Step 3: Configure OAuth Consent Screen
1. **Go to:** APIs & Services → OAuth consent screen
2. **Select:** External (for testing with any Google account)
3. **Fill required fields:**
   - App name: `WIZ Creator Platform`
   - User support email: Your email
   - Developer email: Your email
4. **Add scopes:** 
   - `../auth/youtube.readonly`
5. **Save and continue**

### Step 4: Create OAuth 2.0 Client ID
1. **Go to:** APIs & Services → Credentials
2. **Click:** + CREATE CREDENTIALS
3. **Select:** OAuth 2.0 Client IDs
4. **Application type:** Web application
5. **Name:** `WIZ YouTube OAuth`
6. **Authorized JavaScript origins:**
   ```
   http://localhost:8080
   https://wiz-magic-platform.web.app
   ```
7. **Authorized redirect URIs:** (Leave empty for implicit flow)
8. **Click:** Create
9. **Copy the Client ID** - looks like: `123456789-abc123.googleusercontent.com`

### Step 5: Create API Key
1. **In Credentials section:** + CREATE CREDENTIALS
2. **Select:** API key
3. **Copy the API key** - looks like: `AIzaSyABC123DEF456...`
4. **Click:** Restrict key
5. **API restrictions:** YouTube Data API v3
6. **Save**

### Step 6: Update Environment Variables
**Edit your `.env.local` file:**
```env
# YouTube API Configuration
VITE_YOUTUBE_CLIENT_ID=your-client-id-here.googleusercontent.com
VITE_YOUTUBE_API_KEY=your-api-key-here

# Example format:
# VITE_YOUTUBE_CLIENT_ID=123456789-abc123def456.googleusercontent.com
# VITE_YOUTUBE_API_KEY=AIzaSyABC123DEF456GHI789JKL012MNO345PQR
```

### Step 7: Restart Development Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🚀 Testing Your Setup

### After Restart:
1. **Go to Create page** - Warning message should be gone
2. **Click "Connect YouTube Channel"** 
3. **Should open Google OAuth popup**
4. **Grant permissions** to read your YouTube data
5. **See your real channel** name and subscriber count
6. **Load your real videos** from your channel

## 🔧 Troubleshooting

### Common Issues:

**Error 403 (Forbidden):**
- Check API key is correct
- Ensure YouTube Data API v3 is enabled
- Verify API key restrictions

**OAuth Error:**
- Check Client ID is correct
- Verify authorized origins are set
- Make sure OAuth consent screen is configured

**No videos loading:**
- Ensure your YouTube channel has videos
- Check that videos are public
- Verify you have the correct scopes

## 🎯 What You'll See Working:

### Before Setup:
- ⚠️ Warning about missing API configuration
- ❌ Connection fails with error message

### After Setup:
- ✅ Real Google OAuth popup
- ✅ Your actual YouTube channel name
- ✅ Your real subscriber count
- ✅ Up to 20 of your recent videos
- ✅ Real thumbnails and metadata
- ✅ Publish to WIZ Discover feed

## 📞 Need Help?

If you run into issues:
1. **Check console logs** for specific error messages
2. **Verify all credentials** are correctly copied
3. **Ensure no extra spaces** in environment variables
4. **Try refreshing** the page after restart

---

## 🌟 Once Working:

Your Create page will:
- Connect to YOUR YouTube channel
- Show YOUR real videos  
- Let you select which ones to feature
- Publish them to WIZ for XP earning
- **No more template data!**

The system is ready - it just needs your API credentials to make the connection!