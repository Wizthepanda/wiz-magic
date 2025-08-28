# XP System Deployment Guide

## 🚀 Quick Deployment Checklist

- [ ] Deploy Firestore security rules
- [ ] Initialize auth singleton in main app
- [ ] Replace old XP components with new ones
- [ ] Test video player integration
- [ ] Verify daily XP reset logic
- [ ] Monitor error rates post-deployment

## 📁 File Structure Overview

```
src/
├── lib/
│   ├── authSingleton.js          # Single auth state manager
│   ├── xp/
│   │   ├── awardXpTransaction.js # Core transaction logic
│   │   └── awardXpClient.js      # Client wrapper with events
├── components/
│   ├── XPProgress.jsx            # Real-time XP display component
│   └── wiz/
│       └── wiz-video-player.tsx  # Updated video player
└── firestore.rules               # Updated security rules
```

## 🔧 Step-by-Step Deployment

### 1. Deploy Firestore Security Rules

```bash
# Deploy the new security rules first
firebase deploy --only firestore:rules

# Verify deployment in Firebase Console
# Go to Firestore → Rules → Check active ruleset
```

**Critical**: Deploy rules BEFORE deploying code to prevent security gaps.

### 2. Initialize Auth Singleton

Update your main App component or index file:

```javascript
// In src/App.tsx or src/main.tsx
import authSingleton from './lib/authSingleton';

// Initialize auth singleton on app start
useEffect(() => {
  authSingleton.initialize();
  
  return () => {
    authSingleton.destroy(); // Cleanup on app unmount
  };
}, []);
```

### 3. Replace Legacy XP Components

#### Remove Old Imports
```javascript
// ❌ Remove these imports
import { useXp } from '@/context/XpContext';
import { useXPSystem } from '@/hooks/useXPSystem';
import { useWatchTracker } from '@/hooks/useWatchTracker';

// ✅ Replace with these
import { awardVideoCompletion, awardShare, awardReferral } from '@/lib/xp/awardXpClient';
import XPProgress from '@/components/XPProgress';
```

#### Update Components
```javascript
// ❌ Old way
const { awardWatchXP } = useXPSystem();
await awardWatchXP(videoId, watchTime, true);

// ✅ New way  
import { awardVideoCompletion } from '@/lib/xp/awardXpClient';
await awardVideoCompletion(videoId, baseXp, watchTimeSeconds);
```

### 4. Update Video Player Components

Replace existing video player XP logic:

```typescript
// ❌ Remove old XP tracking
const watchTracker = useWatchTracker(videoId);

// ✅ Use new direct integration
import { awardVideoCompletion } from '@/lib/xp/awardXpClient';

const handleVideoEnd = async () => {
  const watchXP = Math.floor(totalWatchTime / 10); // +1 XP per 10s
  await awardVideoCompletion(videoId, watchXP, totalWatchTime);
};
```

### 5. Add XP Progress Components

Replace existing XP displays:

```jsx
// ❌ Remove old XP displays
<UserXPDisplay />
<XPProgressBar />

// ✅ Replace with new component
<XPProgress className="mb-4" showDetails={true} />
```

### 6. Update Share Button Integration

```typescript
// ❌ Old share XP
const { awardShareXP } = useXp();

// ✅ New share XP
import { awardShare } from '@/lib/xp/awardXpClient';

const handleShare = async () => {
  // ... share logic
  await awardShare(videoId);
};
```

## 🔄 Migration Steps for Existing Users

### Database Migration (Optional)

If you need to migrate existing XP data:

```javascript
// Optional: Migrate old totalXP to currentXP
async function migrateUserXP(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    if (data.totalXP && !data.currentXP) {
      await updateDoc(userRef, {
        currentXP: data.totalXP,
        level: calculateLevel(data.totalXP),
        dailyXpEarned: 0,
        lastReset: new Date().toISOString().split('T')[0]
      });
    }
  }
}
```

### Clear Old Local Storage (if applicable)

```javascript
// Clear old XP-related localStorage
localStorage.removeItem('userXP');
localStorage.removeItem('dailyXP');
// Keep: 'wiz_xp_offline_queue' (used by new system)
```

## ⚡ Production Environment Setup

### Environment Variables

```bash
# .env.production
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_APP_DOMAIN=wiz-magic-platform.web.app
```

### Firebase Configuration

Ensure your Firebase project has:

```javascript
// firebase.js
const firebaseConfig = {
  // ... your config
  // Ensure these services are enabled:
  // - Authentication
  // - Firestore
  // - Hosting (for proper origins)
};
```

### YouTube API Setup

Update YouTube player origins:

```javascript
// In video player config
config: {
  youtube: {
    playerVars: {
      origin: 'https://wiz-magic-platform.web.app' // Your production domain
    }
  }
}
```

## 📊 Monitoring & Analytics

### Error Tracking

Add error monitoring:

```javascript
// In awardXpClient.js - already included
if (window.Sentry) {
  window.Sentry.captureException(error, {
    tags: { feature: 'xp-system' }
  });
}
```

### Performance Monitoring

Track XP award performance:

```javascript
// Monitor XP transaction times
console.time('xp-award');
await awardVideoCompletion(videoId, xp);
console.timeEnd('xp-award'); // Should be < 500ms
```

### User Analytics

Track XP system usage:

```javascript
// Optional: Track XP events in analytics
window.addEventListener('xpUpdated', (event) => {
  analytics.track('XP Awarded', {
    amount: event.detail.earnedXp,
    totalXp: event.detail.totalXp,
    levelUp: event.detail.levelUp
  });
});
```

## 🔍 Health Checks

### Post-Deployment Verification

```bash
# 1. Check Firestore rules are active
curl -X GET "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default)/documents/users/test" \
  -H "Authorization: Bearer $(gcloud auth print-access-token)"

# 2. Verify XP transactions work
# Open browser console on your site:
# - Sign in as test user
# - Award test XP: awardVideoCompletion('test', 10)
# - Check Firestore for new documents

# 3. Monitor error rates
# Check Firebase Console → Firestore → Usage
# Should see increased reads/writes, minimal errors
```

### Critical Metrics to Monitor

- **Transaction Success Rate**: > 99.5%
- **Daily Cap Enforcement**: 100% (no users exceed 360 XP/day)
- **Duplicate XP Prevention**: 0% duplicate awards
- **UI Response Time**: < 100ms for instant feedback
- **Offline Queue Processing**: < 2s when back online

## 🚨 Rollback Plan

If issues occur, you can quickly rollback:

### 1. Revert Components
```bash
git revert <deployment-commit-hash>
```

### 2. Rollback Firestore Rules
```bash
# Deploy previous rules version
firebase deploy --only firestore:rules
# Or use Firebase Console → Rules → Previous versions
```

### 3. Disable New XP Features
```javascript
// Quick disable flag
const USE_NEW_XP_SYSTEM = false;

if (USE_NEW_XP_SYSTEM) {
  await awardVideoCompletion(videoId, xp);
} else {
  // Fallback to old system
  await legacyAwardXP(videoId, xp);
}
```

## 🎯 Success Criteria

Deployment is successful when:

- ✅ All existing users can continue earning XP
- ✅ No duplicate XP awards occur
- ✅ Daily XP caps are enforced
- ✅ UI updates happen within 100ms
- ✅ Error rate stays under 0.1%
- ✅ Video completion tracking works correctly
- ✅ Level-ups and badges are awarded properly

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: "failed-precondition" errors
**Solution**: Check Firestore rules, ensure proper transaction structure

**Issue**: XP not appearing in UI
**Solution**: Verify event listeners are registered, check auth state

**Issue**: Duplicate XP awards
**Solution**: Check completedVideos subcollection, verify transaction logic

### Debug Tools

```javascript
// Enable detailed logging
localStorage.setItem('DEBUG_XP', 'true');

// Check system status
console.log('Auth:', authSingleton.getCurrentUser());
console.log('Queue:', getOfflineQueueStatus());

// Monitor live events
window.addEventListener('xpUpdated', console.log);
window.addEventListener('levelUp', console.log);
```

## 📈 Future Enhancements

After successful deployment, consider:

- **Cloud Functions**: Automated daily XP reset
- **Leaderboards**: Real-time XP rankings  
- **Streak System**: Consecutive day bonuses
- **XP Multipliers**: Temporary boost events
- **Advanced Analytics**: XP earning patterns

---

**Deployment Status**: Ready for Production ✅
**Last Updated**: 2025-08-27
**Version**: 1.0.0