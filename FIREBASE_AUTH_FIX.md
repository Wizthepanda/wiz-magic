# 🔧 Firebase Auth Error Fix for wizup.live

## Problem Summary

The error you're seeing is caused by Firebase Auth rejecting `wizup.live` as the `authDomain`. This happens because:

1. **Firebase expects the project's default auth domain** (`wiz-magic-platform.firebaseapp.com`)
2. Custom domains like `wizup.live` need to be configured as **authorized domains** in Firebase Console
3. The OAuth redirect flow uses Firebase's auth handler, which must match the configured authDomain

## Error Details

```
Error at fe (index-CYtspJBa.js:117:660)
at Ct (index-CYtspJBa.js:126:497)
at Ty (index-CYtspJBa.js:894:12647)
```

This is a Firebase initialization error occurring when the app tries to use `wizup.live` as the authDomain.

---

## ✅ Solution: 3-Step Fix

### Step 1: Update Environment Variables

Your `.env` file should have:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=wiz-magic-platform.firebaseapp.com  # ← CRITICAL: Use Firebase project domain
VITE_FIREBASE_PROJECT_ID=wiz-magic-platform
VITE_FIREBASE_STORAGE_BUCKET=wiz-magic-platform.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# YouTube API
VITE_YOUTUBE_API_KEY=your_actual_youtube_api_key
```

**Key Point:** `VITE_FIREBASE_AUTH_DOMAIN` should be `wiz-magic-platform.firebaseapp.com`, NOT `wizup.live`.

---

### Step 2: Configure Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wiz-magic-platform**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add these domains:

```
✅ wiz-magic-platform.firebaseapp.com (should already be there)
✅ wizup.live
✅ www.wizup.live
✅ wizxp.com
✅ www.wizxp.com
✅ localhost
```

5. Click **Add domain** for each one
6. Click **Save**

---

### Step 3: Configure Google Cloud Console OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your **OAuth 2.0 Client ID** (Web application)
5. Click **Edit** (pencil icon)

#### Authorized JavaScript origins:
```
https://wizup.live
https://www.wizup.live
https://wizxp.com
https://www.wizxp.com
https://wiz-magic-platform.firebaseapp.com
http://localhost:5173
```

#### Authorized redirect URIs:
```
https://wiz-magic-platform.firebaseapp.com/__/auth/handler  ← CRITICAL
https://wizup.live/__/auth/handler
https://www.wizup.live/__/auth/handler
https://wizxp.com/__/auth/handler
https://www.wizxp.com/__/auth/handler
http://localhost:5173/__/auth/handler
```

**Important:** The first redirect URI must be your Firebase project's auth handler!

6. Click **Save**
7. Wait 5-10 minutes for changes to propagate

---

## How the Fix Works

### Before (Broken):
```
User on wizup.live → Firebase tries to use wizup.live as authDomain
→ OAuth redirect goes to https://wizup.live/__/auth/handler
→ Firebase rejects because wizup.live is not the project's auth domain
→ ERROR ❌
```

### After (Fixed):
```
User on wizup.live → Firebase uses wiz-magic-platform.firebaseapp.com as authDomain
→ OAuth redirect goes to https://wiz-magic-platform.firebaseapp.com/__/auth/handler
→ Firebase accepts and processes auth
→ User redirected back to wizup.live/discover
→ SUCCESS ✅
```

---

## Code Changes Made

I've updated `src/lib/firebase.ts` to:

1. **Prioritize the Firebase project auth domain** from `VITE_FIREBASE_AUTH_DOMAIN`
2. **Add fallback** to `wiz-magic-platform.firebaseapp.com` if env var is missing
3. **Add better error handling** for Firebase initialization

The key change:

```typescript
const getAuthDomain = () => {
  const firebaseAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  
  if (firebaseAuthDomain) {
    console.log('🌐 Auth Domain: Using Firebase project domain:', firebaseAuthDomain);
    return firebaseAuthDomain;  // ← Uses wiz-magic-platform.firebaseapp.com
  }
  
  // Fallback logic...
};
```

---

## Testing After Fix

### 1. Rebuild the app:
```bash
npm run build
```

### 2. Deploy to wizup.live:
```bash
firebase deploy --only hosting
```

### 3. Test in incognito window:
- Go to `https://wizup.live`
- Click "Enter" or Play button
- Google OAuth popup should open
- Select your account
- Should redirect to `https://wizup.live/discover`

### 4. Check browser console:
You should see:
```
🔥 Firebase Auth Configuration
  🌐 Current Hostname: wizup.live
  🔐 Selected Auth Domain: wiz-magic-platform.firebaseapp.com  ← CORRECT!
  🎯 OAuth Redirect URI: https://wiz-magic-platform.firebaseapp.com/__/auth/handler
✅ Firebase app initialized successfully
```

---

## Common Issues

### Issue 1: "Changes not taking effect"
**Solution:** Clear browser cache and cookies, or use incognito mode

### Issue 2: "OAuth redirect mismatch"
**Solution:** Verify all redirect URIs are added in Google Cloud Console and wait 10 minutes

### Issue 3: "Still getting errors"
**Solution:** Check that `.env` file has the correct `VITE_FIREBASE_AUTH_DOMAIN` value and rebuild the app

---

## Why This Approach?

Firebase Auth requires:
1. **One canonical auth domain** per project (the `.firebaseapp.com` domain)
2. **Multiple authorized domains** where the app can be hosted
3. **OAuth redirects** always go through the canonical auth domain

This ensures:
- ✅ Consistent OAuth flow across all domains
- ✅ Proper token validation
- ✅ Secure authentication
- ✅ Works on wizup.live, wizxp.com, and localhost

---

## Summary

**Root Cause:** Using `wizup.live` as the Firebase authDomain instead of the project's default domain.

**Fix:** Set `VITE_FIREBASE_AUTH_DOMAIN=wiz-magic-platform.firebaseapp.com` in `.env` file.

**Result:** OAuth redirects go through Firebase's auth handler, then redirect back to your custom domain.

---

## Next Steps

1. ✅ Update `.env` file with correct `VITE_FIREBASE_AUTH_DOMAIN`
2. ✅ Verify Firebase Console authorized domains
3. ✅ Verify Google Cloud Console OAuth redirect URIs
4. ✅ Rebuild and redeploy
5. ✅ Test in incognito mode

If you still encounter issues after following these steps, please share:
- Browser console logs
- Network tab showing the OAuth redirect flow
- Firebase Console screenshot of authorized domains

