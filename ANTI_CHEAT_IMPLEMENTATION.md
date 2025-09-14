# WizXP Anti-Cheat System Implementation Guide

## 🛡️ Overview

This comprehensive anti-cheat system implements a multi-layered defense approach for your watch-to-earn platform, preventing users from gaming the XP reward system through various fraud techniques.

## 🏗️ Architecture

### Defense Layers

1. **Client-Side Instrumentation** - Comprehensive telemetry collection
2. **Signed Event Delivery** - Batched, authenticated events  
3. **Server-Side Validation** - Consistency and sequence validation
4. **Behavioral Scoring** - AI-powered fraud detection
5. **Rate Limiting** - Anti-replay and farming protection
6. **Admin Dashboard** - Manual review and monitoring

### Key Components

- `WatchSession` - Client-side session manager
- `AntiCheatVideoPlayer` - Enhanced video player with fraud detection
- Firebase Functions - Server-side validation and scoring
- Admin Dashboard - Monitoring and manual review interface

## 🚀 Quick Start Implementation

### 1. Replace Existing Video Player

Replace your current video player with the anti-cheat version:

```tsx
// Before
<LocalVideoPlayer 
  url={videoUrl} 
  onXpEarned={handleXpEarned} 
/>

// After  
<AntiCheatVideoPlayer
  url={videoUrl}
  videoId={videoId}
  videoDuration={duration}
  onXpEarned={handleXpEarned}
  showSecurityIndicator={true}
/>
```

### 2. Deploy Firebase Functions

Add the anti-cheat functions to your Firebase deployment:

```bash
# Deploy the new functions
firebase deploy --only functions:startWatchSession,functions:sendWatchEvents,functions:closeWatchSession
```

### 3. Set Environment Variables

Add session secret to your Firebase Functions environment:

```bash
firebase functions:config:set session.secret="your-very-secure-secret-key-here"
```

### 4. Update Firestore Security Rules

Add rules for the new collections:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Watch sessions - only functions can write
    match /watchSessions/{sessionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

## 🔧 Configuration

### Anti-Cheat Thresholds

Edit `/functions/src/anti-cheat-system.ts` to tune detection sensitivity:

```typescript
const ANTI_CHEAT_CONFIG = {
  // XP Settings
  XP_PER_30_SECONDS: 1,
  COMPLETION_BONUS_THRESHOLD: 0.75,
  
  // Fraud Detection
  MAX_FORWARD_SEEKS: 2,        // Max large skips before flagging
  MAX_SEEK_PERCENTAGE: 30,     // % skip considered "large"
  MAX_PLAYBACK_RATE: 1.25,     // Max speed before penalty
  
  // Scoring Thresholds
  SUSPICIOUS_SCORE: 5,         // Reduce XP at this score
  FRAUD_SCORE: 12,            // Block XP at this score
  
  // Rate Limits
  MAX_XP_PER_VIDEO_PER_DAY: 100,
  MAX_DAILY_XP: 360,
  MAX_SESSIONS_PER_HOUR: 50
};
```

## 📊 Fraud Detection Signals

### Behavioral Patterns Detected

| Signal | Weight | Description |
|--------|--------|-------------|
| Large Forward Seeks | +3 each | Skipping >30% of video |
| High Playback Rate | +4 | Speed >1.25x |
| Background Watching | +3 | Tab hidden >60s while playing |
| Rapid Sessions | +5 | >50 sessions/hour |
| Identical Patterns | +6 | Automated/scripted behavior |
| Time Manipulation | +6 | Impossible timestamps |

### Fraud Score Actions

- **0-4**: Normal operation, full XP
- **5-11**: Suspicious, 50% XP reduction  
- **12+**: Blocked, 0 XP, manual review required

## 🎮 User Experience

### Security Indicator

The player shows real-time security status:

- 🟢 **Secure** - Normal operation
- 🔵 **Monitoring** - Active session tracking
- 🟡 **Warning** - Suspicious behavior detected
- 🔴 **Blocked** - Session flagged, no XP

### Fraud Warnings

Users see helpful guidance when flagged:

- Avoid skipping large portions
- Keep video tab active and visible  
- Watch at normal playback speed
- Don't use automation tools

## 🔍 Admin Monitoring

### Dashboard Features

Access the admin dashboard at `/admin/anti-cheat`:

- **Real-time session monitoring**
- **Fraud score analytics** 
- **Manual review workflow**
- **XP award/block statistics**
- **Event timeline inspection**

### Manual Review Actions

Admins can:
- Approve flagged sessions (restore XP)
- Block sessions (prevent XP)
- View detailed event timelines
- Export fraud analytics

## 📈 Analytics & Metrics

### Key Metrics to Monitor

1. **False Positive Rate** - Legitimate users flagged
2. **Detection Accuracy** - Actual fraud caught
3. **XP Protection** - Fraudulent XP prevented
4. **User Impact** - Experience degradation

### Tuning Recommendations

Start with conservative thresholds and adjust based on data:

1. **Week 1**: Collect baseline data, no blocking
2. **Week 2**: Enable warnings, tune thresholds  
3. **Week 3**: Enable blocking, monitor false positives
4. **Week 4+**: Optimize based on patterns

## 🚨 Common Fraud Patterns

### Pattern: Video Skipper
- **Behavior**: Seeks to 90%+ immediately
- **Detection**: Large forward seeks + low watch time
- **Mitigation**: Require 75% actual watch time for completion bonus

### Pattern: Background Farmer  
- **Behavior**: Runs multiple hidden tabs
- **Detection**: Long visibility hidden periods
- **Mitigation**: Reduce XP when tab hidden >60s

### Pattern: Speed Runner
- **Behavior**: 2x+ playback speed
- **Detection**: Playback rate monitoring
- **Mitigation**: Scale XP by playback rate

### Pattern: Bot Network
- **Behavior**: Identical timing patterns across accounts
- **Detection**: Low timestamp variance
- **Mitigation**: Rate limiting + device fingerprinting

## 🔒 Security Considerations

### Session Token Security

- Tokens expire after 15 minutes
- HMAC-signed with server secret
- Validated on every request
- Rotation on suspicious activity

### Data Privacy

- Device fingerprints are anonymized
- No PII stored in session data
- GDPR-compliant data retention
- User consent for monitoring

### Performance Impact

- Minimal client-side overhead (<1% CPU)
- Batched events reduce network calls
- Efficient server-side processing
- Optional debug mode for development

## 🛠️ Development Tools

### Debug Mode

Enable detailed logging in development:

```typescript
// Shows debug panel with session stats
if (import.meta.env.DEV) {
  // Debug info displayed on player
}
```

### Testing Fraud Detection

Trigger test scenarios:

```typescript
// Simulate large seeks
player.seekTo(video.duration * 0.9);

// Simulate high speed
player.setPlaybackRate(2.0);

// Simulate background activity
document.dispatchEvent(new Event('visibilitychange'));
```

## 📋 Migration Checklist

- [ ] Deploy anti-cheat Firebase Functions
- [ ] Update video player components  
- [ ] Configure fraud detection thresholds
- [ ] Set up admin dashboard access
- [ ] Update Firestore security rules
- [ ] Test with sample sessions
- [ ] Monitor initial deployment
- [ ] Tune thresholds based on data
- [ ] Train support team on manual review
- [ ] Document user-facing changes

## 🆘 Troubleshooting

### Common Issues

**Sessions not starting**
- Check Firebase Functions deployment
- Verify authentication tokens
- Review Firestore permissions

**High false positive rate**  
- Lower fraud score thresholds
- Increase seek tolerance
- Review visibility penalties

**Users bypassing detection**
- Enable additional signals
- Implement device fingerprinting
- Add random micro-challenges

### Support Escalation

For flagged accounts:
1. Review session timeline in admin dashboard
2. Check for legitimate use patterns  
3. Manually approve if false positive
4. Document patterns for threshold tuning

## 🔮 Future Enhancements

### Phase 2 Features

- **Machine Learning Model** - Train on labeled fraud data
- **Micro-Challenges** - Random human verification  
- **Advanced Fingerprinting** - Canvas/WebGL detection
- **Cross-Session Analysis** - Account-level fraud scoring
- **Real-time Alerts** - Slack/Discord notifications

### Integration Options

- **KYC Verification** - Link to identity verification
- **Social Proof** - Cross-reference with social accounts
- **Behavioral Biometrics** - Mouse/touch pattern analysis
- **Network Analysis** - IP reputation scoring

---

## 📞 Support

For implementation questions or issues:
- Review session logs in Firebase Console
- Check admin dashboard for patterns
- Test with known good/bad sessions
- Adjust thresholds incrementally

The anti-cheat system is designed to be tunable and non-invasive while providing robust protection against common fraud patterns in watch-to-earn platforms.