# XP System Integration Test Plan

## Quick Test Commands

```bash
# 1. Deploy Firestore rules
firebase deploy --only firestore:rules

# 2. Test in browser console
# Open your web app, sign in, then run these in the browser console:

# Test video completion XP
import { awardVideoCompletion } from '/src/lib/xp/awardXpClient.js';
await awardVideoCompletion('test_video_123', 10, 45);

# Test share XP
import { awardShare } from '/src/lib/xp/awardXpClient.js';
await awardShare('shared_video_456');

# Test referral XP
import { awardReferral } from '/src/lib/xp/awardXpClient.js';
await awardReferral('referred_user_789');
```

## Expected Test Results

### 1. Video Completion Test
```javascript
// Console output should show:
✅ awardXpOnce success awarded=11 newTotal=11
⚡ window xpUpdated fired: {earnedXp: 11, totalXp: 11, levelUp: false}
🍞 Toast [success]: +11 XP earned!

// Firestore should have:
// /users/{uid} → currentXP: 11, dailyXpEarned: 11
// /users/{uid}/completedVideos/test_video_123 → {completedAt, xpAwarded: 11, bonusApplied: true}
```

### 2. Share Test
```javascript
// Console output:
✅ awardXpOnce success awarded=20 newTotal=31
⚡ window xpUpdated fired: {earnedXp: 20, totalXp: 31, levelUp: false}
🍞 Toast [success]: +20 XP for sharing!

// Firestore: currentXP: 31, dailyXpEarned: 11 (shares don't count toward daily cap)
```

### 3. Daily Cap Test
```javascript
// Award 360 XP in video completions, then try one more:
// Expected: XP awarded stops at daily limit
🚫 Daily XP cap reached: 360/360
🍞 Toast [warning]: Daily XP limit reached! Come back tomorrow
```

### 4. Level Up Test
```javascript
// Award enough XP to reach 100 (Level 2):
// Expected console output:
🎉 Level up detected: 1 → 2
🆙 levelUp event fired: old=1 new=2
🍞 Toast [success]: 🎉 Level up! You're now level 2!

// Firestore should create /users/{uid}/levelUps/{logId}
```

### 5. Offline Queue Test
```javascript
// 1. Go offline (disable network in DevTools)
// 2. Try awarding XP: should be queued
📱 Offline - adding to queue
💾 Added to offline queue: {type: 'video_completion', ...}
🍞 Toast [info]: XP will be awarded when back online

// 3. Go back online
🌐 Back online - processing XP queue
🔄 Processing offline queue: 1 items
✅ Offline queue item processed
```

## Testing Checklist

### ✅ Core Transaction Logic
- [ ] XP awarded exactly once per video (no duplicates)
- [ ] Daily cap enforced (360 XP max)
- [ ] 10% completion bonus applied correctly
- [ ] Share/referral XP bypasses daily cap
- [ ] Level-up detection and badge creation
- [ ] Retry logic handles transient errors

### ✅ UI Integration
- [ ] XPProgress component updates in real-time
- [ ] Video player shows instant XP feedback
- [ ] Toast notifications appear correctly
- [ ] Level-up animations trigger
- [ ] Progress bars update smoothly

### ✅ Firebase Security
- [ ] Users can only modify their own XP data
- [ ] completedVideos subcollection is create-only
- [ ] badges subcollection is read-only for clients
- [ ] Firestore rules prevent XP manipulation

### ✅ Error Handling
- [ ] Network failures queue XP for later
- [ ] Invalid parameters return proper errors
- [ ] Auth state changes handled gracefully
- [ ] Transaction conflicts retry automatically

### ✅ Performance
- [ ] Auth singleton prevents duplicate listeners
- [ ] onSnapshot efficiently tracks user changes
- [ ] Event dispatch system doesn't leak memory
- [ ] Offline queue processes without blocking UI

## Manual UI Test Steps

### 1. Video Player Integration
1. Open a video in the WIZ player
2. Watch for at least 80% completion
3. Verify instant XP animation appears
4. Check XPProgress component updates immediately
5. Confirm Firestore document matches UI state

### 2. Cross-Tab Consistency
1. Open app in 2 browser tabs
2. Award XP in tab 1
3. Verify tab 2 XP progress updates automatically
4. Both tabs should show same XP total

### 3. Auth Flow Testing
1. Sign out, then back in
2. Verify XP data loads correctly
3. Check no duplicate auth listeners in console
4. Confirm XP awards only work when authenticated

## Debug Commands

```javascript
// Check auth singleton state
import authSingleton from '/src/lib/authSingleton.js';
console.log('Auth:', authSingleton.getCurrentUser());

// Check offline queue
import { getOfflineQueueStatus } from '/src/lib/xp/awardXpClient.js';
console.log('Queue:', getOfflineQueueStatus());

// Check user XP data
import { doc, getDoc } from 'firebase/firestore';
import { db } from '/src/lib/firebase.js';
const userDoc = await getDoc(doc(db, 'users', 'YOUR_UID'));
console.log('User data:', userDoc.data());

// Listen to live XP events
window.addEventListener('xpUpdated', (e) => console.log('XP Event:', e.detail));
window.addEventListener('levelUp', (e) => console.log('Level Up:', e.detail));
```

## Performance Benchmarks

### Expected Response Times
- **XP Award Transaction**: < 500ms (95th percentile)
- **UI Update After XP**: < 100ms (instant feedback)
- **Firestore Sync**: < 1000ms (real-time updates)
- **Offline Queue Processing**: < 2000ms (batch operations)

### Memory Usage
- Auth singleton: ~1KB persistent
- XP event listeners: ~2KB per component
- Offline queue: ~5KB per 100 queued items

## Troubleshooting

### XP Not Awarded
1. Check browser console for errors
2. Verify user is authenticated
3. Check Firestore security rules
4. Confirm video wasn't already completed

### UI Not Updating
1. Check event listener registration
2. Verify onSnapshot is active
3. Clear browser cache
4. Check network connectivity

### Transaction Failures
1. Look for 'failed-precondition' errors
2. Check retry attempts in console
3. Verify Firestore permissions
4. Test with smaller XP amounts

## Production Deployment

```bash
# 1. Deploy security rules
firebase deploy --only firestore:rules

# 2. Verify rules in Firebase Console
# 3. Test with production data
# 4. Monitor error rates in Sentry/logging
# 5. Check daily XP reset functionality
```

## Success Criteria

The XP system is ready for production when:
- ✅ All integration tests pass
- ✅ No duplicate XP awards in 100+ test completions
- ✅ Daily cap enforced consistently
- ✅ UI updates within 100ms of XP events  
- ✅ Offline queue processes without data loss
- ✅ Level-ups trigger correctly at thresholds
- ✅ Security rules prevent client manipulation
- ✅ Memory usage stays under 10MB per session