# Firebase Domain Setup for wizup.live

## Current Issues

### 1. CORS Error for Google Sign-In
```
Access to script at 'https://accounts.google.com/gsi/client' from origin 'https://wizup.live' 
has been blocked by CORS policy
```

### 2. Firestore Permission Error
```
FirebaseError: Missing or insufficient permissions
```

---

## Fix #1: Add wizup.live to Firebase Authorized Domains

### Steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/wiz-magic-platform

2. **Navigate to Authentication**
   - Click "Authentication" in left sidebar
   - Click "Settings" tab
   - Scroll to "Authorized domains"

3. **Add wizup.live**
   - Click "Add domain"
   - Enter: `wizup.live`
   - Click "Add"

4. **Verify Current Domains**
   Should include:
   - `wiz-magic-platform.firebaseapp.com`
   - `wiz-magic-platform.web.app`
   - `wizup.live` (add this)
   - `wizxp.com` (if using)
   - `localhost` (for development)

---

## Fix #2: Update Firestore Security Rules

### Current Issue
The app is trying to fetch creators from Firestore but getting permission denied.

### Option A: Allow Public Read (Recommended for Public Content)

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public read for creators (anyone can view)
    match /creators/{creatorId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
    
    // Public read for featured content
    match /featuredCreators/{docId} {
      allow read: if true;
      allow write: if false; // Only admins via console
    }
    
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Unlocked creators subcollection
      match /unlockedCreators/{creatorId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Only Cloud Functions can write
      }
    }
    
    // Communities
    match /communities/{communityId} {
      allow read: if true; // Public read
      allow write: if request.auth != null;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Option B: Require Authentication

If you want to require sign-in to view creators:

```javascript
match /creators/{creatorId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == resource.data.uid;
}
```

### Deploy Rules

```bash
firebase deploy --only firestore:rules
```

---

## Fix #3: Add Placeholder Creator Data

Since Firestore is empty, add some placeholder data:

### Via Firebase Console

1. Go to Firestore Database
2. Create collection: `creators`
3. Add documents with this structure:

```javascript
{
  id: "amara-wellness",
  name: "Amara Wellness Coach",
  tagline: "Transform your life with mindful practices",
  avatarUrl: "/Amara Wellness Coach.png",
  bannerUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
  zapCost: 500,
  features: [
    "Private Group Chat",
    "Weekly Live Sessions",
    "Premium Content Library",
    "Early Access"
  ],
  verified: true,
  category: "wellness",
  subscriberCount: 1250
}
```

### Via Script

Create `scripts/seed-creators.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const creators = [
  {
    id: "amara-wellness",
    name: "Amara Wellness Coach",
    tagline: "Transform your life with mindful practices",
    avatarUrl: "/Amara Wellness Coach.png",
    zapCost: 500,
    features: ["Private Group Chat", "Weekly Live Sessions"],
  },
  // ... more creators
];

async function seedCreators() {
  for (const creator of creators) {
    await setDoc(doc(db, 'creators', creator.id), creator);
    console.log(`✅ Added creator: ${creator.name}`);
  }
}

seedCreators();
```

Run:
```bash
node scripts/seed-creators.js
```

---

## Fix #4: Google OAuth Configuration

### Add OAuth Client ID

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Select project: `wiz-magic-platform`

2. **Navigate to APIs & Services > Credentials**

3. **Edit OAuth 2.0 Client ID**
   - Find your Web client
   - Add to "Authorized JavaScript origins":
     - `https://wizup.live`
     - `https://www.wizup.live`
   - Add to "Authorized redirect URIs":
     - `https://wizup.live/__/auth/handler`
     - `https://www.wizup.live/__/auth/handler`

4. **Save Changes**

---

## Verification Checklist

After making these changes:

- [ ] wizup.live added to Firebase Authorized Domains
- [ ] Firestore rules updated and deployed
- [ ] Creator data added to Firestore
- [ ] Google OAuth client updated with wizup.live
- [ ] Test sign-in on wizup.live
- [ ] Test creator data loading
- [ ] Verify no CORS errors in console
- [ ] Verify no permission errors in console

---

## Testing

### 1. Test Authentication
```javascript
// In browser console on wizup.live
firebase.auth().currentUser
```

### 2. Test Firestore Read
```javascript
// In browser console
const db = firebase.firestore();
db.collection('creators').get().then(snapshot => {
  console.log('Creators:', snapshot.size);
  snapshot.forEach(doc => console.log(doc.data()));
});
```

### 3. Test Creator Full Screen View
1. Visit https://wizup.live
2. Scroll to "Unlock Premium Content"
3. Click "View Details" on any card
4. Verify full-screen view opens
5. Verify no console errors

---

## Quick Commands

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy

# Check current project
firebase projects:list

# View Firestore data
firebase firestore:get creators
```

---

## Support

If issues persist:

1. Check Firebase Console logs
2. Check browser Network tab for failed requests
3. Verify `.env` file has correct values
4. Clear browser cache and hard reload
5. Test in incognito mode

---

**Last Updated:** November 7, 2025

