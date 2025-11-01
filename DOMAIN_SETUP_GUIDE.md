# 🔐 WIZUP Domain Setup Guide - Google OAuth + Firebase Configuration

## ✅ Complete Checklist for wizup.live + wizxp.com Dual-Domain Support

This guide ensures **both domains work flawlessly** with Google OAuth and Firebase Authentication.

---

## 📋 **STEP 1: Firebase Console Configuration**

### Navigate to: [Firebase Console](https://console.firebase.google.com/)
1. Select your project: **wiz-magic-platform**
2. Go to **Authentication** → **Settings** → **Authorized domains**

### ✅ Add ALL of these domains:
```
✅ localhost
✅ 127.0.0.1
✅ wizxp.com
✅ www.wizxp.com
✅ wizup.live
✅ www.wizup.live
✅ wiz-magic-platform.web.app (Firebase default)
```

**Screenshot Location**: Firebase Console → Authentication → Settings → Authorized domains

---

## 🔑 **STEP 2: Google Cloud Console OAuth Configuration**

### Navigate to: [Google Cloud Console](https://console.cloud.google.com/)
1. Select your project (same as Firebase)
2. Go to **APIs & Services** → **Credentials**
3. Find your **OAuth 2.0 Client ID** (Web application)
4. Click **Edit** (pencil icon)

### ✅ Authorized JavaScript Origins:
Add ALL of these origins:
```
https://wizup.live
https://www.wizup.live
https://wizxp.com
https://www.wizxp.com
http://localhost:5173
http://127.0.0.1:5173
http://localhost:8080
```

### ✅ Authorized Redirect URIs:
Add ALL of these redirect URIs:
```
https://wizup.live/__/auth/handler
https://www.wizup.live/__/auth/handler
https://wizxp.com/__/auth/handler
https://www.wizxp.com/__/auth/handler
http://localhost:5173/__/auth/handler
http://127.0.0.1:5173/__/auth/handler
http://localhost:8080/__/auth/handler
```

**Important**: Click **Save** after adding all domains!

---

## 🌐 **STEP 3: DNS & Domain Configuration**

### Verify DNS Setup:
```bash
# Check wizup.live DNS
nslookup wizup.live

# Check wizxp.com DNS
nslookup wizxp.com
```

**Expected**: Both should point to Firebase Hosting or your CDN

### Firebase Hosting Custom Domain:
1. Go to **Firebase Console** → **Hosting**
2. Click **Add custom domain**
3. Add both:
   - `wizup.live`
   - `www.wizup.live`
4. Follow DNS verification steps
5. Wait for SSL certificate provisioning (automatic)

---

## 🔧 **STEP 4: Environment Variables**

### `.env` file should contain:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=wizxp.com
VITE_FIREBASE_PROJECT_ID=wiz-magic-platform
VITE_FIREBASE_STORAGE_BUCKET=wiz-magic-platform.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_YOUTUBE_CLIENT_ID=your-youtube-client-id.apps.googleusercontent.com
```

**Note**: The auth domain in `.env` is used as fallback for localhost only. Production uses dynamic domain detection.

---

## 🚀 **STEP 5: Testing Checklist**

### Test on wizup.live:
```bash
# 1. Build production bundle
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting

# 3. Open in incognito mode
https://wizup.live
```

**Expected Flow**:
1. ✅ Homepage loads with no console errors
2. ✅ Click "Enter" button → Google OAuth popup opens
3. ✅ Select Google account → Authenticates successfully
4. ✅ Redirects to `https://wizup.live/discover`
5. ✅ User profile created in Firestore (`users/{uid}`)
6. ✅ No "redirect_uri_mismatch" errors
7. ✅ No favicon CORS errors

### Test on wizxp.com:
Repeat the same steps for `https://wizxp.com`

**Expected**: Identical behavior on both domains

---

## 🐛 **Common Issues & Fixes**

### ❌ Error: "redirect_uri_mismatch"
**Cause**: Domain not authorized in Google Cloud Console
**Fix**: Add domain to **Authorized redirect URIs** (Step 2)

### ❌ Error: "auth/unauthorized-domain"
**Cause**: Domain not authorized in Firebase Console
**Fix**: Add domain to **Authorized domains** (Step 1)

### ❌ Error: Favicon CORS warning
**Cause**: Browser trying to fetch Google's favicon
**Fix**: ✅ Already fixed with multiple favicon declarations in `index.html`

### ❌ Error: "auth/internal-error"
**Cause**: Ad blocker blocking Google APIs
**Fix**: User must disable ad blocker for your domain

### ❌ Error: "auth/popup-blocked"
**Cause**: Browser blocking popup
**Fix**: Code automatically falls back to redirect method

### ❌ Error: User document not created
**Cause**: Firestore permissions or auth flow not completing
**Fix**: Check Firestore rules and verify `setupUserData()` is called

---

## 🔍 **Verification Commands**

### Check Auth Domain in Browser Console:
```javascript
// After app loads, check console for:
"🔥 Firebase Auth Configuration"
  "🌐 Current Hostname: wizup.live" (or wizxp.com)
  "🔐 Selected Auth Domain: wizup.live" (or wizxp.com)
  "🎯 OAuth Redirect URI: https://wizup.live/__/auth/handler"
```

### Check Firestore User Creation:
```javascript
// In Firebase Console → Firestore → users collection
// Should see document with structure:
{
  uid: "user-id",
  email: "user@gmail.com",
  displayName: "User Name",
  level: 1,
  totalXP: 0,
  youtubeConnected: false,
  createdAt: Timestamp,
  lastLogin: Timestamp,
  stats: { videosWatched: 0, totalWatchTime: 0 },
  engagement: { watchCount: 0, likeCount: 0, commentCount: 0 }
}
```

---

## 📊 **Current Implementation Status**

### ✅ Completed:
- [x] Dynamic auth domain detection (wizup.live + wizxp.com)
- [x] Multiple favicon formats to prevent CORS errors
- [x] Enhanced console logging for auth domain
- [x] Support for www subdomains
- [x] Automatic user profile creation in Firestore
- [x] Popup-based authentication with redirect fallback
- [x] Auto-redirect to `/discover` after login
- [x] Admin email permissions system

### 🔧 Required Manual Steps:
- [ ] Add all domains to Firebase Console → Authorized domains
- [ ] Add all origins and redirect URIs to Google Cloud Console
- [ ] Verify DNS is pointing to Firebase Hosting
- [ ] Test authentication on both wizup.live and wizxp.com
- [ ] Clear browser cache and test in incognito mode

---

## 🎯 **Expected Behavior**

### User visits https://wizup.live:
1. Dynamic domain detection selects `wizup.live` as auth domain
2. OAuth popup uses redirect URI: `https://wizup.live/__/auth/handler`
3. User authenticates with Google
4. Profile auto-creates in Firestore
5. Redirects to `https://wizup.live/discover`
6. Dashboard loads with persistent sidebar

### User visits https://wizxp.com:
Identical flow with `wizxp.com` as auth domain

---

## 📞 **Support Resources**

- **Firebase Documentation**: https://firebase.google.com/docs/auth/web/google-signin
- **Google OAuth Setup**: https://developers.google.com/identity/protocols/oauth2
- **Firebase Hosting Domains**: https://firebase.google.com/docs/hosting/custom-domain

---

## ✨ **Production Deployment**

```bash
# 1. Ensure all domains are configured (Steps 1-2)
# 2. Build production bundle
npm run build

# 3. Deploy to Firebase
firebase deploy --only hosting

# 4. Test both domains in incognito
# wizup.live → Should work ✅
# wizxp.com → Should work ✅

# 5. Monitor Firebase Console for auth events
# Authentication → Users (should see new user after signup)
```

---

## 🔒 **Security Notes**

- OAuth Client ID is safe to expose in frontend code
- Never commit `.env` file with production secrets
- Firebase security rules protect user data
- CORS errors for Google's favicon are harmless (now fixed)
- "Self-XSS" warning in console is a browser security feature (not your app)

---

**Last Updated**: November 2025
**Status**: Ready for Production Testing 🚀
