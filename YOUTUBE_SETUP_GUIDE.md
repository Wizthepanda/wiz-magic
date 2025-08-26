# YouTube API Setup Guide for WIZ Create Page

## 🎯 Overview
The Create page now uses **real YouTube OAuth 2.0** with Google Identity Services. No mock data - it will connect to your actual YouTube channel and fetch your real videos.

## 📋 Required Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **YouTube Data API v3**:
   - Go to APIs & Services > Library
   - Search for "YouTube Data API v3"
   - Click and Enable

### 2. Create OAuth 2.0 Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Configure consent screen first if prompted
4. Application type: **Web application**
5. Add authorized origins:
   ```
   http://localhost:8080
   https://wiz-magic-platform.web.app
   ```
6. Copy the **Client ID** (you don't need client secret for frontend OAuth)

### 3. Get API Key
1. In Credentials section, click "Create Credentials" > "API Key"
2. Restrict the key to YouTube Data API v3
3. Copy the **API Key**

### 4. Configure Environment Variables
Create a `.env.local` file in your project root:

```env
# YouTube API Configuration
VITE_YOUTUBE_CLIENT_ID=your-client-id-here.googleusercontent.com
VITE_YOUTUBE_API_KEY=your-api-key-here
```

## 🚀 How It Works Now

### Real YouTube Connection Flow:
1. **Click "Connect YouTube Channel"** 
   - Opens Google OAuth consent screen
   - User grants permission to read YouTube channel data
   - No popup windows - uses Google Identity Services

2. **Channel Recognition**
   - Fetches real channel name, avatar, subscriber count
   - Shows actual channel information in the UI

3. **Video Loading** 
   - Fetches up to 20 most recent videos from your channel
   - Real thumbnails, titles, view counts, durations
   - Auto-categorizes based on video content

4. **Publishing to WIZ**
   - Selected videos get published to WIZ Discover feed
   - Real integration with existing XP system

## 🔧 Testing Without API Keys

If you don't configure the YouTube API keys, the Create page will:
- Show a warning message about missing configuration
- Display an error when trying to connect
- **NOT** fall back to mock data (removed template behavior)

## 🎬 Current Status

✅ **Real OAuth Flow** - Uses Google Identity Services  
✅ **Real API Calls** - Fetches actual YouTube data  
✅ **No Mock Data** - Removed "WIZ Creator Channel" template  
✅ **Error Handling** - Clear messages when API not configured  
✅ **Security** - No client secrets exposed (uses implicit flow)  

## 🌐 Live URL
https://wiz-magic-platform.web.app

## 📞 Next Steps

1. **Set up YouTube API credentials** following the guide above
2. **Add environment variables** to your project
3. **Test with your actual YouTube channel**
4. **Publish real videos to WIZ Discover feed**

The Create page will now connect to your actual YouTube channel and show your real videos instead of the template data!