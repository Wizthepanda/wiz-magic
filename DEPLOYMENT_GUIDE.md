# 🚀 WIZUP Deployment & Setup Guide

This guide will help you deploy the updated WIZUP platform with real content integration.

---

## 📋 Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Populating Sample Data](#populating-sample-data)
3. [Deployment](#deployment)
4. [Verification](#verification)

---

## 🔥 Firebase Setup

### 1. Configure Firestore Security Rules

Before deploying, you need to update your Firestore security rules to allow the app to read data.

**Go to Firebase Console → Firestore Database → Rules**

Replace with these rules (for development/alpha):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if true; // Public read for creator profiles
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Videos collection
    match /videos/{videoId} {
      allow read: if true; // Public read for published videos
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.token.admin == true);
    }

    // Communities collection
    match /communities/{communityId} {
      allow read: if true; // Public read
      allow write: if request.auth != null;
    }

    // Rewards collection
    match /rewards/{rewardId} {
      allow read: if true; // Public read
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

**Note:** For production, tighten these rules based on your security requirements.

### 2. Create Firestore Indexes

Some queries require composite indexes. Create these in Firestore:

**Go to Firebase Console → Firestore Database → Indexes**

Create the following composite indexes:

1. **Videos Collection:**
   - Fields: `status` (Ascending) + `createdAt` (Descending)

2. **Users Collection:**
   - Fields: `creatorProfile` (Ascending) + `subscriberCount` (Descending)

3. **Communities Collection:**
   - Fields: `isActive` (Ascending) + `memberCount` (Descending)

4. **Rewards Collection:**
   - Fields: `requiredXP` (Descending)

---

## 📊 Populating Sample Data

### Option 1: Firebase Console (Recommended for First Time)

1. **Go to Firebase Console → Firestore Database**

2. **Create Collections and Documents:**

#### Create `users` Collection:

For each creator, click "Add document" with these IDs and data:

**Document ID:** `creator-1`
```json
{
  "uid": "creator-1",
  "displayName": "TechMaster Alex",
  "email": "alex@example.com",
  "photoURL": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "creatorProfile": true,
  "bio": "Teaching web development and coding best practices",
  "category": "Technology",
  "subscriberCount": 50000
}
```

**Document ID:** `creator-2`
```json
{
  "uid": "creator-2",
  "displayName": "Design Guru Sarah",
  "email": "sarah@example.com",
  "photoURL": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "creatorProfile": true,
  "bio": "UI/UX design principles and modern design trends",
  "category": "Design",
  "subscriberCount": 35000
}
```

**Repeat for creators 3-8** (data in `/scripts/seedFirebase.js`)

#### Create `videos` Collection:

Click "Add document" and use auto-ID, add these fields:

```json
{
  "title": "React 18 Complete Guide: Build Modern Web Apps",
  "thumbnail": "https://picsum.photos/seed/react18/640/360",
  "userId": "creator-1",
  "creatorName": "TechMaster Alex",
  "creatorAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "category": "Technology",
  "subcategory": "Web Development",
  "status": "published",
  "views": 15000,
  "duration": 3600,
  "xpReward": 100
}
```

**Add 6-8 videos** with different content (examples in seedFirebase.js)

#### Create `communities` Collection:

Auto-ID documents with:

```json
{
  "name": "Tech Innovators Hub",
  "banner": "https://picsum.photos/seed/techcom/1200/300",
  "category": "Technology",
  "memberCount": 15420,
  "description": "A thriving community of developers, engineers, and tech enthusiasts",
  "isActive": true
}
```

**Add 3-5 communities** (examples in seedFirebase.js)

#### Create `rewards` Collection:

Auto-ID documents with:

```json
{
  "tierName": "Bronze Wizard",
  "requiredXP": 1000,
  "icon": "star",
  "description": "Start your journey with exclusive beginner benefits",
  "benefits": [
    "Access to community forums",
    "Basic badge on profile",
    "Weekly learning tips",
    "5% bonus XP on all videos"
  ],
  "color": "#CD7F32"
}
```

**Add 3 reward tiers** (Bronze, Silver, Gold - examples in seedFirebase.js)

### Option 2: Using Seed Script (Requires Firebase Admin Setup)

If you want to use the seed script, you need to:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Save as `serviceAccountKey.json` in project root
4. Update `seedFirebase.js` to use Admin SDK
5. Run `npm run seed`

---

## 🚀 Deployment

### Deploy to Firebase Hosting

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   npm run deploy:hosting
   ```

   Or for full deployment (hosting + functions if any):
   ```bash
   npm run deploy
   ```

3. **Your site will be live at:**
   ```
   https://wiz-magic-platform.web.app
   ```

### Alternative: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow prompts to link project and deploy**

### Alternative: Deploy to Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

---

## ✅ Verification

After deployment, verify everything is working:

### 1. Homepage Checks

Visit your deployed URL and check:

- [ ] Hero section loads with animations
- [ ] Featured Creators section displays real creators from Firebase
- [ ] Rewards Showcase shows reward tiers
- [ ] Discover Preview displays videos
- [ ] Community Highlights shows communities
- [ ] Footer has all links (Company, Resources, Legal, Connect)

### 2. Static Pages

Navigate to each page and verify:

- [ ] `/about` - About page loads
- [ ] `/careers` - Careers page loads
- [ ] `/partners` - Partners page loads
- [ ] `/cookie-policy` - Cookie Policy loads
- [ ] `/gdpr-compliance` - GDPR page loads
- [ ] `/help` - Help page loads

### 3. Data Loading

Open browser DevTools → Console and check:

- [ ] No Firebase permission errors
- [ ] React Query successfully fetches data
- [ ] Loading states show skeleton components
- [ ] Fallback UI displays if no data exists

### 4. Performance

Run Lighthouse audit:
- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 80
- [ ] SEO score > 80

---

## 🐛 Troubleshooting

### Issue: "Permission Denied" errors

**Solution:** Check Firestore security rules are updated (see Firebase Setup)

### Issue: No data showing on homepage

**Solution:**
1. Verify data exists in Firestore collections
2. Check browser console for errors
3. Verify collection names match (`users`, `videos`, `communities`, `rewards`)

### Issue: Build fails

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Routes show 404 on refresh

**Solution:** Configure hosting redirect rules:

**firebase.json:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Firebase configuration in `.env` or `src/lib/firebase.ts`
3. Ensure all dependencies are installed: `npm install`
4. Review Firestore rules and indexes

---

## 🎉 Success!

Once everything is verified, your WIZUP platform is live with:
- ✅ Dynamic content from Firebase
- ✅ Real creator profiles
- ✅ Video discovery
- ✅ Community highlights
- ✅ Reward tiers
- ✅ Comprehensive footer
- ✅ All static pages

Congratulations! 🚀
