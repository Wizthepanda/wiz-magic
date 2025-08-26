# 🚀 Quick YouTube API Setup (5 Minutes)

Your Create page is ready! You just need YouTube API credentials to connect your channel.

## Step 1: Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. **Select your project** or create a new one

## Step 2: Enable YouTube Data API
1. Go to: **APIs & Services > Library**
2. Search: **"YouTube Data API v3"**
3. Click **Enable**

## Step 3: Create OAuth 2.0 Credentials
1. Go to: **APIs & Services > Credentials**
2. Click: **"+ CREATE CREDENTIALS"**
3. Select: **"OAuth 2.0 Client IDs"**
4. Application type: **Web application**
5. **Authorized origins**:
   ```
   http://localhost:8080
   https://wiz-magic-platform.web.app
   ```
6. **Copy the Client ID** (looks like: `123456789-abcdef.googleusercontent.com`)

## Step 4: Create API Key
1. In **Credentials**, click **"+ CREATE CREDENTIALS"**
2. Select: **"API key"**
3. **Copy the API Key** (looks like: `AIzaSyABC123...`)

## Step 5: Update Your Environment
Edit your `.env.local` file:

```env
VITE_YOUTUBE_CLIENT_ID=your-client-id-here.googleusercontent.com
VITE_YOUTUBE_API_KEY=your-api-key-here
```

## Step 6: Restart & Test
```bash
npm run dev
```

**Then click "Connect YouTube Channel"** and it will connect to your real YouTube channel!

---

## 🎯 What Happens Next:
- **Real OAuth flow** with Google
- **Your actual channel** name and subscriber count
- **Your real videos** (up to 20 most recent)
- **Publish to WIZ Discover** for XP earning

The Create page is fully ready - it just needs your API credentials!