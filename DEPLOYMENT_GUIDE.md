# WIZ Platform XP System - Production Deployment Guide

This guide covers the deployment of the enhanced XP system with YouTube API integration for the WIZ platform.

## Overview

The enhanced XP system includes:
- ✅ On-platform tracking via embed heartbeat (existing)
- ✅ Off-platform tracking via YouTube Data API v3
- ✅ Daily XP caps (360 XP/day)
- ✅ XP deduplication between tracking sources
- ✅ Level progression (exponential: 100 → 250 → 500 → 1000...)
- ✅ Cloud Functions for automated daily sync
- ✅ Comprehensive analytics and dashboard

## Prerequisites

### 1. Firebase Configuration
- Firebase Blaze plan activated ✅
- Firebase Authentication enabled
- Firestore database configured
- Cloud Functions enabled

### 2. YouTube API Setup
```bash
# 1. Enable YouTube Data API v3 in Google Cloud Console
# 2. Create API credentials
# 3. Add YouTube API key to Firebase environment
firebase functions:config:set youtube.api_key="YOUR_YOUTUBE_API_KEY"
```

### 3. Environment Variables
Add to your `.env` file:
```env
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Deployment Steps

### Step 1: Deploy Firestore Rules
```bash
# Deploy updated security rules
firebase deploy --only firestore:rules
```

### Step 2: Build and Deploy Cloud Functions
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy functions
cd ..
firebase deploy --only functions

# Verify deployment
firebase functions:log
```

### Step 3: Deploy Frontend Updates
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Step 4: Verify Environment Variables
```bash
# Check Cloud Functions config
firebase functions:config:get

# Should show:
# {
#   "youtube": {
#     "api_key": "your_key_here"
#   }
# }
```

## Testing the System

### 1. Manual Testing Checklist

#### Embed Video Tracking ✅
- [ ] Play embedded video on platform
- [ ] Verify XP heartbeat every 10 seconds
- [ ] Test daily XP cap (360 XP)
- [ ] Test completion bonus (>90% completion)
- [ ] Verify tab focus requirement

#### YouTube API Integration 🆕
- [ ] Connect YouTube account via Google OAuth
- [ ] Verify `startTrackingDate` recorded
- [ ] Manually sync YouTube history
- [ ] Verify only creator videos counted
- [ ] Test deduplication with embed tracking

#### Cloud Functions 🆕
- [ ] Test `syncYouTubeHistory` callable function
- [ ] Test `initializeYouTubeTracking` function
- [ ] Verify `dailyYouTubeSync` scheduled function
- [ ] Check function logs for errors

#### Dashboard & Analytics 🆕
- [ ] View XP breakdown by source
- [ ] Check YouTube integration status
- [ ] Verify recent activity logs
- [ ] Test manual sync button

### 2. Automated Testing

Run the test script:
```bash
# Build and test functions locally
cd functions
npm run build
npm run test

# Test with Firebase emulator
firebase emulators:start --only functions,firestore
```

### 3. Performance Testing
```bash
# Test with multiple concurrent users
# Monitor Cloud Function performance
# Check Firestore read/write operations
# Verify daily sync performance with large user base
```

## Production Configuration

### 1. Cloud Function Settings
```typescript
// Production settings in functions/src/youtube-xp-functions.ts
export const dailyYouTubeSync = onSchedule({
  schedule: '0 2 * * *', // 2 AM UTC daily
  timeZone: 'UTC',
  memory: '2GB',          // Increased for large user base
  timeoutSeconds: 540,    // 9 minutes max
});
```

### 2. Rate Limiting
- YouTube API: 10,000 requests/day (per project)
- Firestore: 20,000 reads/day free tier
- Cloud Functions: 2M invocations/month free

### 3. Cost Optimization
```typescript
// Batch processing users to reduce costs
const BATCH_SIZE = 10; // Process 10 users at a time
const MAX_RESULTS = 25; // Reduced from 50 for scheduled function
```

## Monitoring & Alerts

### 1. Cloud Function Monitoring
```bash
# Monitor function executions
gcloud functions logs read --limit=50 --filter="resource.type=cloud_function"

# Set up alerts for function failures
gcloud alpha monitoring policies create --policy-from-file=monitoring-policy.yaml
```

### 2. Firestore Monitoring
- Monitor read/write operations
- Track collection sizes
- Set alerts for quota limits

### 3. YouTube API Monitoring
- Track API quota usage
- Monitor for API errors
- Set alerts for quota limits

## Security Considerations

### 1. Firestore Rules ✅
- XP data protected from client manipulation
- YouTube tokens stored securely
- User isolation enforced

### 2. Cloud Functions Security
- Authentication required for all callable functions
- Input validation implemented
- Rate limiting considerations

### 3. API Key Security
- YouTube API key restricted to specific services
- Cloud Function environment variables encrypted
- No client-side API key exposure

## Troubleshooting

### Common Issues

#### 1. YouTube Token Expired
```typescript
// Users will see "Token Expired" badge in dashboard
// Solution: Re-authenticate with YouTube
```

#### 2. Daily Sync Failures
```bash
# Check function logs
firebase functions:log --only dailyYouTubeSync

# Common causes:
# - YouTube API quota exceeded
# - User token expired
# - Network timeouts
```

#### 3. XP Deduplication Issues
```typescript
// Check both collections for duplicates:
// - watchSessions (embed tracking)
// - youtubeWatchHistory (API tracking)
```

#### 4. Performance Issues
- Monitor Firestore operations
- Check function memory usage
- Optimize batch sizes

### Debug Commands
```bash
# Test individual user sync
firebase functions:call syncYouTubeHistory --data='{"userId":"USER_ID"}'

# Check user tracking data
# In Firestore console: /userTrackingData/{userId}

# Verify XP logs
# In Firestore console: /xpLogs (filtered by userId)
```

## Rollback Plan

If issues occur:

### 1. Disable YouTube Integration
```typescript
// In youtube-xp-functions.ts, add early return:
export const dailyYouTubeSync = onSchedule(async () => {
  console.log('YouTube sync temporarily disabled');
  return;
});
```

### 2. Revert Firestore Rules
```bash
# Revert to previous rules version
firebase deploy --only firestore:rules --project=your-project
```

### 3. Frontend Rollback
```typescript
// Hide YouTube integration UI
const YOUTUBE_INTEGRATION_ENABLED = false;
```

## Post-Deployment Verification

### 1. Verify All Systems
- [ ] Existing XP system still working
- [ ] New YouTube integration functional
- [ ] Daily caps enforced
- [ ] Analytics dashboard displaying correctly
- [ ] No duplicate XP awards

### 2. User Communication
```markdown
📢 **New Feature: YouTube Integration**

Your YouTube watch history now contributes to your WIZ XP! 

🎯 **What's New:**
- Connect your YouTube account in Settings
- Earn XP from watching WIZ creator videos on YouTube
- Automatic daily sync
- No double-counting between platforms

🚀 **Getting Started:**
1. Go to Settings → YouTube Integration
2. Click "Connect YouTube"
3. Your watch history will sync automatically
```

### 3. Monitor First 24 Hours
- Watch Cloud Function execution logs
- Monitor Firestore operations
- Check for any user-reported issues
- Verify daily sync runs successfully

## Success Metrics

### 1. Technical Metrics
- Cloud Function success rate > 95%
- Daily sync completion rate > 90%
- Zero duplicate XP awards
- Average sync time < 30 seconds per user

### 2. User Engagement Metrics
- YouTube connection rate
- Off-platform XP contribution
- User retention improvement
- Daily active user increase

### 3. System Health
- Firestore read/write efficiency
- Cloud Function cost optimization
- YouTube API quota utilization
- Zero security incidents

---

## Need Help?

For deployment issues:
1. Check Firebase console logs
2. Review Firestore rules
3. Verify environment variables
4. Test with Firebase emulator locally

## Update Notes

This deployment adds significant functionality while maintaining backward compatibility with the existing XP system. All existing features continue to work as before, with enhanced tracking and analytics capabilities.