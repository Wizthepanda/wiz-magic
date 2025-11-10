# 🚨 Quick Fix for Firebase Auth Error on wizup.live

## The Problem
Your app is trying to use `wizup.live` as the Firebase authDomain, but Firebase requires the project's default domain (`wiz-magic-platform.firebaseapp.com`) for OAuth redirects.

## The Solution (3 Steps)

### 1️⃣ Check Your Configuration
```bash
./check-firebase-config.sh
```

### 2️⃣ Update Your .env File
Make sure `VITE_FIREBASE_AUTH_DOMAIN` is set correctly:

```bash
VITE_FIREBASE_AUTH_DOMAIN=wiz-magic-platform.firebaseapp.com
```

**NOT** `wizup.live` or `wizxp.com`

### 3️⃣ Rebuild and Deploy
```bash
npm run build
firebase deploy --only hosting
```

---

## Why This Fixes It

Firebase OAuth flow:
1. User clicks "Sign in with Google" on `wizup.live`
2. OAuth redirect goes to `https://wiz-magic-platform.firebaseapp.com/__/auth/handler`
3. Firebase processes the auth
4. User is redirected back to `wizup.live/discover`

The authDomain **must** be your Firebase project domain, not your custom domain.

---

## Verify the Fix

After deploying, open browser console on `https://wizup.live` and look for:

```
🔥 Firebase Auth Configuration
  🔐 Selected Auth Domain: wiz-magic-platform.firebaseapp.com  ← Should see this!
  🎯 OAuth Redirect URI: https://wiz-magic-platform.firebaseapp.com/__/auth/handler
✅ Firebase app initialized successfully
```

---

## Still Having Issues?

1. Clear browser cache or use incognito mode
2. Wait 5-10 minutes after updating Google Cloud Console settings
3. Check `FIREBASE_AUTH_FIX.md` for detailed troubleshooting

---

## Code Changes Made

I've updated:
- ✅ `src/lib/firebase.ts` - Now prioritizes `VITE_FIREBASE_AUTH_DOMAIN` from env
- ✅ `env.example` - Added `VITE_GOOGLE_CLIENT_ID` 
- ✅ Added better error handling for Firebase initialization

The fix ensures your app uses the correct Firebase auth domain regardless of which custom domain users visit.

