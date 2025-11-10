# OAuth Redirect URI Fix - Error 400

## Problem
Getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google.

## Root Cause
The redirect URIs in your Google Cloud Console OAuth client don't include all the domains where your app is hosted.

## Solution: Add Authorized Redirect URIs

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project: **wiz-magic-platform**
3. Find your OAuth 2.0 Client ID: `543256047502-4fdauu19uj3t63kf5saclcg597niecsh`

### Step 2: Add These Redirect URIs

Click on your OAuth client and add ALL of the following redirect URIs:

```
https://wiz-magic-platform.firebaseapp.com/__/auth/handler
https://wiz-magic-platform.web.app/__/auth/handler
https://wizup.live/__/auth/handler
https://www.wizup.live/__/auth/handler
https://wizxp.com/__/auth/handler
https://www.wizxp.com/__/auth/handler
http://localhost/__/auth/handler
http://localhost:5173/__/auth/handler
http://127.0.0.1:5173/__/auth/handler
```

### Step 3: Add Authorized JavaScript Origins

Also add these to "Authorized JavaScript origins":

```
https://wiz-magic-platform.firebaseapp.com
https://wiz-magic-platform.web.app
https://wizup.live
https://www.wizup.live
https://wizxp.com
https://www.wizxp.com
http://localhost:5173
http://127.0.0.1:5173
```

### Step 4: Save and Wait
- Click **Save**
- Wait 5-10 minutes for changes to propagate
- Clear your browser cache or use Incognito mode
- Try signing in again

## Current Configuration
- Auth Domain: `wiz-magic-platform.firebaseapp.com`
- Client ID: `543256047502-4fdauu19uj3t63kf5saclcg597niecsh.apps.googleusercontent.com`
- Hosting URL: `https://wiz-magic-platform.web.app`
- Custom Domain: `https://wizup.live`

## Verification
After adding the URIs, you should be able to sign in from any of these domains without the redirect_uri_mismatch error.
