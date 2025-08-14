# YouTube API v3 Setup Instructions

This guide will help you set up YouTube API v3 integration for the Wiz Magic platform.

## Prerequisites

1. Google Cloud Console account
2. Firebase project (already configured)

## Step 1: Enable YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "APIs & Services" > "Library"
4. Search for "YouTube Data API v3"
5. Click on it and press "Enable"

## Step 2: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to YouTube Data API v3 for security

## Step 3: Configure OAuth 2.0

1. In "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add your domain to "Authorized JavaScript origins":
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
5. Add redirect URIs:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`

## Step 4: Update Environment Variables

Create a `.env` file in the project root with:

```env
# YouTube API
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Firebase Configuration (if not already set)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 5: Test the Integration

1. Start the development server: `npm run dev`
2. Click the "Connect YouTube" button on the homepage
3. Complete the Google OAuth flow
4. Verify that the status shows "YouTube Connected"

## Features Implemented

### Authentication Flow
- ✅ Google OAuth with YouTube scopes
- ✅ Automatic YouTube connection on sign-in
- ✅ Visual connection status indicator
- ✅ Enter key support for authentication

### View Tracking
- ✅ Real-time video progress tracking
- ✅ XP rewards based on watch completion:
  - 25 XP for 25% completion
  - 50 XP for 50% completion
  - 75 XP for 75% completion
  - 100 XP for 90%+ completion
- ✅ Engagement tracking (likes, comments)
- ✅ Firestore integration for analytics

### API Integration
- ✅ YouTube Data API v3 calls
- ✅ Video metadata retrieval
- ✅ Watch history access (with user permission)
- ✅ Duration calculation and tracking

## Troubleshooting

### Common Issues

1. **"API key not valid" error**
   - Ensure the YouTube Data API v3 is enabled
   - Check that the API key is correctly set in `.env`
   - Verify API key restrictions if any

2. **OAuth errors**
   - Check that your domain is added to authorized origins
   - Ensure redirect URIs match your deployment URLs
   - Verify that the OAuth client is properly configured

3. **YouTube scopes not granted**
   - Clear browser storage and re-authenticate
   - Check that scopes are properly requested in the code
   - Verify user granted all required permissions

### Rate Limits

YouTube API v3 has the following quotas:
- 10,000 units per day (default)
- Different operations cost different units
- Video details: 1 unit
- Channel info: 1 unit
- Playlist items: 1 unit

Monitor your usage in the Google Cloud Console.

## Security Notes

1. Keep your API keys secure and never commit them to version control
2. Use environment variables for all sensitive configuration
3. Consider implementing API key restrictions for production
4. Regularly rotate your API keys
5. Monitor API usage for unexpected spikes

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure all required APIs are enabled in Google Cloud Console
4. Test with a fresh browser session to avoid cached auth issues
