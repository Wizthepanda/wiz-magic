# 🔑 Google Cloud Console Setup - Step-by-Step Walkthrough

## Complete OAuth Configuration for wizup.live + wizxp.com

---

## 📍 Starting Point

You're currently viewing your OAuth 2.0 Client in Google Cloud Console.

**Your screen should show**:
- Client ID for Web application
- Authorized JavaScript origins (5 entries already)
- Authorized redirect URIs (4 entries already)

---

## ✅ PART 1: Add Missing JavaScript Origins (4 URLs)

### **Step 1: Scroll to "Authorized JavaScript origins"**

You should see this section with 5 existing URIs:
```
✓ https://localhost
✓ https://localhost:5000
✓ https://wiz-magic-platform.web.app
✓ https://wizxp.com
✓ https://wizup.live
```

### **Step 2: Click "+ Add URI" Button**

Look for the blue "+ Add URI" button below the existing origins.

### **Step 3: Add First New Origin**

A new text field will appear. Type **exactly**:
```
https://www.wizxp.com
```

**Press Enter** or click outside the field to confirm.

### **Step 4: Click "+ Add URI" Again**

Add the second new origin:
```
https://www.wizup.live
```

**Press Enter** to confirm.

### **Step 5: Click "+ Add URI" Again**

Add the third new origin (for Vite dev server):
```
http://localhost:5173
```

**Press Enter** to confirm.

### **Step 6: Click "+ Add URI" One More Time**

Add the fourth new origin (alternate port):
```
http://localhost:8080
```

**Press Enter** to confirm.

### ✅ **JavaScript Origins Complete!**

You should now have **9 total origins**:
```
1. https://localhost
2. https://localhost:5000
3. https://wiz-magic-platform.web.app
4. https://wizxp.com
5. https://wizup.live
6. https://www.wizxp.com      ← NEW
7. https://www.wizup.live      ← NEW
8. http://localhost:5173       ← NEW
9. http://localhost:8080       ← NEW
```

---

## ✅ PART 2: Add Missing Redirect URIs (4 URLs)

### **Step 7: Scroll Down to "Authorized redirect URIs"**

You should see this section with 4 existing URIs:
```
✓ https://wiz-magic-platform.web.app/__/auth/handler
✓ https://wizxp.com/__/auth/handler
✓ https://localhost:5000/__/auth/handler
✓ https://wizup.live/__/auth/handler
```

### **Step 8: Click "+ Add URI" Button**

Look for the blue "+ Add URI" button below the existing redirect URIs.

### **Step 9: Add First New Redirect URI**

Type **exactly** (pay attention to the `/__/auth/handler` ending):
```
https://www.wizxp.com/__/auth/handler
```

**Press Enter** to confirm.

### **Step 10: Click "+ Add URI" Again**

Add the second redirect URI:
```
https://www.wizup.live/__/auth/handler
```

**Press Enter** to confirm.

### **Step 11: Click "+ Add URI" Again**

Add the third redirect URI (Vite dev server):
```
http://localhost:5173/__/auth/handler
```

**Press Enter** to confirm.

### **Step 12: Click "+ Add URI" One Last Time**

Add the fourth redirect URI:
```
http://localhost:8080/__/auth/handler
```

**Press Enter** to confirm.

### ✅ **Redirect URIs Complete!**

You should now have **8 total redirect URIs**:
```
1. https://wiz-magic-platform.web.app/__/auth/handler
2. https://wizxp.com/__/auth/handler
3. https://localhost:5000/__/auth/handler
4. https://wizup.live/__/auth/handler
5. https://www.wizxp.com/__/auth/handler      ← NEW
6. https://www.wizup.live/__/auth/handler     ← NEW
7. http://localhost:5173/__/auth/handler      ← NEW
8. http://localhost:8080/__/auth/handler      ← NEW
```

---

## 💾 PART 3: Save Your Changes

### **Step 13: Scroll to Bottom of Page**

Look for the **"Save"** button at the bottom right.

### **Step 14: Click "Save"**

**IMPORTANT**: You MUST click Save or changes won't take effect!

### **Step 15: Wait for Confirmation**

You should see a success message like:
```
✓ OAuth 2.0 Client ID saved successfully
```

---

## ⏳ PART 4: Wait for Propagation (CRITICAL!)

### **Step 16: Wait 5-10 Minutes**

Google OAuth changes take time to propagate to all servers.

**Set a timer for 10 minutes** before testing.

**Why?** If you test immediately, you might still get errors even though configuration is correct.

**During this time, you can**:
- ☕ Get coffee
- 📧 Check emails
- 📖 Review NEXT_STEPS.md
- ✅ Double-check your entries in the console

---

## 🧪 PART 5: Testing (After 10 Minute Wait)

### **Test 1: wizup.live (Main Domain)**

1. **Open incognito/private window** (Cmd+Shift+N on Mac, Ctrl+Shift+N on Windows)
2. Navigate to: `https://wizup.live`
3. You should see the WIZUP homepage
4. **Open browser console** (F12 or Cmd+Option+I)
5. Click the **"Enter"** button (top-right)
6. **Check console output**:
   ```javascript
   🌐 Auth Domain: Using wizup.live for OAuth flow
   🔥 Firebase Auth Configuration
     🌐 Current Hostname: wizup.live
     🔐 Selected Auth Domain: wizup.live
     🎯 OAuth Redirect URI: https://wizup.live/__/auth/handler
   ```
7. **Google OAuth popup should open**
8. Select your Google account
9. Grant permissions
10. **Should redirect to**: `https://wizup.live/discover`

**Expected Result**: ✅ Success! Dashboard loads.

---

### **Test 2: www.wizup.live (WWW Subdomain)**

1. **Open NEW incognito window** (close previous one)
2. Navigate to: `https://www.wizup.live`
3. Click "Enter" button
4. **Check console** - should show:
   ```javascript
   🌐 Current Hostname: www.wizup.live
   🔐 Selected Auth Domain: wizup.live
   ```
5. Authenticate
6. **Should redirect to**: `https://www.wizup.live/discover`

**Expected Result**: ✅ Success!

---

### **Test 3: wizxp.com (Alternate Domain)**

1. **Open NEW incognito window**
2. Navigate to: `https://wizxp.com`
3. Click "Enter" button
4. **Check console** - should show:
   ```javascript
   🌐 Current Hostname: wizxp.com
   🔐 Selected Auth Domain: wizxp.com
   ```
5. Authenticate
6. **Should redirect to**: `https://wizxp.com/discover`

**Expected Result**: ✅ Success!

---

### **Test 4: www.wizxp.com (WWW Subdomain)**

1. **Open NEW incognito window**
2. Navigate to: `https://www.wizxp.com`
3. Click "Enter" button
4. **Check console** - should show:
   ```javascript
   🌐 Current Hostname: www.wizxp.com
   🔐 Selected Auth Domain: wizxp.com
   ```
5. Authenticate
6. **Should redirect to**: `https://www.wizxp.com/discover`

**Expected Result**: ✅ Success!

---

## ✅ Verification Checklist

After each test, verify:

### **In Browser Console**:
- ✅ No errors related to OAuth
- ✅ No "redirect_uri_mismatch" error
- ✅ Correct auth domain logged
- ✅ User authenticated message appears

### **In Firebase Console**:
1. Go to: https://console.firebase.google.com/project/wiz-magic-platform/authentication/users
2. Click **"Users"** tab
3. ✅ Should see new user(s) listed with:
   - Email address
   - Sign-in provider: Google
   - Created timestamp

### **In Firestore Database**:
1. Go to: https://console.firebase.google.com/project/wiz-magic-platform/firestore
2. Navigate to **"users"** collection
3. ✅ Should see user document(s) with structure:
   ```json
   {
     "uid": "user-id-here",
     "email": "your@email.com",
     "displayName": "Your Name",
     "photoURL": "https://...",
     "level": 1,
     "totalXP": 0,
     "youtubeConnected": false,
     "createdAt": Timestamp,
     "lastLogin": Timestamp,
     "stats": {
       "videosWatched": 0,
       "totalWatchTime": 0
     },
     "engagement": {
       "watchCount": 0,
       "likeCount": 0,
       "commentCount": 0
     }
   }
   ```

---

## 🚨 Troubleshooting

### **Error: "redirect_uri_mismatch"**

**Symptom**: Google shows error page saying redirect URI is not authorized.

**Solutions**:
1. Double-check you added the exact URLs (including `https://` and `/__/auth/handler`)
2. Make sure you clicked **Save** button
3. Wait full 10 minutes for propagation
4. Try clearing browser cache and retry

---

### **Error: OAuth popup doesn't open**

**Symptom**: Nothing happens when clicking "Enter"

**Solutions**:
1. Check if popup was blocked (look for browser notification)
2. Code has automatic fallback to redirect method
3. Check browser console for JavaScript errors

---

### **Error: Redirects to wrong URL**

**Symptom**: After auth, redirects to `wizxp.com` instead of `wizup.live` (or vice versa)

**Why**: Dynamic domain detection is working - it uses the domain you visited.

**This is correct behavior!** If user visits `wizup.live`, they should stay on `wizup.live`.

---

### **Error: User not created in Firestore**

**Symptom**: Authentication works but no user in Firestore

**Solutions**:
1. Check Firestore security rules
2. Check browser console for Firestore errors
3. Verify `setupUserData()` function ran (should see log in console)

---

## 📊 Summary of URLs Added

### **JavaScript Origins** (4 new):
```diff
+ https://www.wizxp.com
+ https://www.wizup.live
+ http://localhost:5173
+ http://localhost:8080
```

### **Redirect URIs** (4 new):
```diff
+ https://www.wizxp.com/__/auth/handler
+ https://www.wizup.live/__/auth/handler
+ http://localhost:5173/__/auth/handler
+ http://localhost:8080/__/auth/handler
```

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] All 9 JavaScript origins added
- [ ] All 8 redirect URIs added
- [ ] Clicked "Save" button
- [ ] Waited 10 minutes
- [ ] Tested wizup.live - works ✅
- [ ] Tested www.wizup.live - works ✅
- [ ] Tested wizxp.com - works ✅
- [ ] Tested www.wizxp.com - works ✅
- [ ] User created in Firebase Authentication
- [ ] User document created in Firestore
- [ ] No console errors

---

## 🎉 Success!

If all tests pass, your dual-domain OAuth setup is **COMPLETE**!

Users can now sign in from:
- ✅ https://wizup.live
- ✅ https://www.wizup.live
- ✅ https://wizxp.com
- ✅ https://www.wizxp.com

And developers can test from:
- ✅ http://localhost:5173 (Vite)
- ✅ http://localhost:8080 (alternate)

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for specific error messages
2. Verify all URLs match exactly (case-sensitive!)
3. Ensure you waited full 10 minutes after saving
4. Try different browser (Chrome, Firefox, Safari)
5. Test in incognito mode (clears all cache/cookies)

---

**You're ready to complete the setup! Follow each step carefully and test thoroughly. 🚀**
