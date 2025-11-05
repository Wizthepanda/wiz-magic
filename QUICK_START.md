# 🚀 WIZUP Quick Start Guide

Get your WIZUP platform running in **5 simple steps**!

---

## Prerequisites

- Node.js 18+ installed
- Firebase project created (`wiz-magic-platform`)
- Firebase CLI installed: `npm install -g firebase-tools`

---

## 🎯 5-Step Deployment

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Automated Deployment Script
```bash
./deploy.sh
```

This script will automatically:
- ✅ Build your project
- ✅ Deploy Firestore security rules
- ✅ Deploy Firestore indexes
- ✅ Deploy to Firebase Hosting

### Step 3: Populate Sample Data

**Option A: Via Firebase Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `wiz-magic-platform`
3. Navigate to **Firestore Database**
4. Add collections using the sample data below

**Quick Sample Data:**

**Collection: `users`**
```javascript
// Document ID: creator-1
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

// Add 3-5 more creators (see scripts/seedFirebase.js for examples)
```

**Collection: `videos`**
```javascript
// Auto-generate ID
{
  "title": "React 18 Complete Guide",
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

// Add 5-8 videos (see scripts/seedFirebase.js for examples)
```

**Collection: `communities`**
```javascript
// Auto-generate ID
{
  "name": "Tech Innovators Hub",
  "banner": "https://picsum.photos/seed/techcom/1200/300",
  "category": "Technology",
  "memberCount": 15420,
  "description": "A thriving community of developers and tech enthusiasts",
  "isActive": true
}

// Add 3-5 communities
```

**Collection: `rewards`**
```javascript
// Auto-generate ID
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

// Add Silver (5000 XP) and Gold (15000 XP) tiers
```

**Option B: Using Seed Script** (Advanced)

See full instructions in `DEPLOYMENT_GUIDE.md`

### Step 4: Verify Deployment

Visit your site: **https://wiz-magic-platform.web.app**

Check:
- [ ] Homepage loads with all sections
- [ ] Featured Creators display (if data added)
- [ ] Rewards Showcase displays tiers
- [ ] Discover Preview shows videos
- [ ] Community Highlights shows communities
- [ ] Footer has all links
- [ ] All static pages work (/about, /careers, etc.)

### Step 5: Test Everything

```bash
# Run locally for testing
npm run dev
```

Visit `http://localhost:5173` and verify:
- All homepage sections load
- Navigation works
- Animations are smooth
- No console errors

---

## 🎉 You're Done!

Your WIZUP platform is now live with:
- ✅ Dynamic Firebase content
- ✅ Featured creators and videos
- ✅ Community highlights
- ✅ Reward tiers
- ✅ Comprehensive footer
- ✅ All legal pages

---

## 🔧 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Firebase Deploy Fails
```bash
firebase login
firebase use wiz-magic-platform
./deploy.sh
```

### No Data Showing
1. Check Firestore rules are deployed
2. Verify data exists in Firebase Console
3. Check browser console for errors
4. Ensure collection names match exactly

### Permission Denied Errors
- Update Firestore rules: `firebase deploy --only firestore:rules`
- Verify rules allow public read for: users, videos, communities, rewards

---

## 📚 More Help

- **Complete Guide:** See `DEPLOYMENT_GUIDE.md`
- **Technical Details:** See `IMPLEMENTATION_COMPLETE.md`
- **Sample Data:** Check `scripts/seedFirebase.js`
- **Support:** wizuplive@gmail.com

---

## 🚀 Next Steps

1. **Customize Content:** Add your own creators, videos, communities
2. **Brand It:** Update colors, logos, copy
3. **Add Features:** User auth, video player, XP earning
4. **Scale:** Add more content and users
5. **Monitor:** Check Firebase Analytics

---

**Happy Building! 🎊**

Built with ❤️ for the WIZUP Alpha
