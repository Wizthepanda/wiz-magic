# Creator Profile Testing Guide

## Profile Switching Logic

The WIZ platform now has proper role-based profile switching between **Viewer Profile** and **Creator Private Dashboard**.

### Requirements for Creator Profile Access

To access the Creator Private Dashboard, users must meet **BOTH** criteria:

1. **✅ Connected YouTube Account** - Must have `youtubeConnected: true` in Firebase
2. **✅ Created Content** - Must have one of:
   - `hasCreatedContent: true`
   - `coursesCreated > 0` 
   - `videosUploaded > 0`
   - `role: 'creator'` (explicit)

### Testing Profile Switching

#### Test Case 1: New User (Viewer Profile)
- No YouTube connection
- No content created
- **Result**: Shows Viewer Private Profile

#### Test Case 2: Connected YouTube Only (Viewer Profile)
- Has YouTube connection (`youtubeConnected: true`)
- No content created yet
- **Result**: Shows Viewer Private Profile (missing content requirement)

#### Test Case 3: Creator Profile Eligible (Creator Dashboard)
- Has YouTube connection (`youtubeConnected: true`)
- Has created content (`hasCreatedContent: true`)
- **Result**: Shows Creator Private Dashboard

### Firebase Data Structure for Testing

To manually test, update a user document in Firebase:

```javascript
// Viewer Profile (default)
{
  "uid": "user123",
  "displayName": "Test User",
  "email": "test@example.com",
  // No additional fields = Viewer Profile
}

// Creator Profile (full access)
{
  "uid": "user123",
  "displayName": "Test Creator",
  "email": "creator@example.com",
  "youtubeConnected": true,
  "hasCreatedContent": true,
  "role": "creator",
  "youtubeProfile": {
    "channelId": "UC123",
    "channelName": "Test Creator Channel",
    "subscriberCount": "1.2K"
  },
  "coursesCreated": 0,
  "videosUploaded": 3,
  "totalEarnings": 0
}
```

### Real Data Integration

The Creator Profile now fetches real data from Firebase collections:

- **Content**: `collection('content').where('creatorId', '==', userId)`
- **Courses**: `collection('courses').where('creatorId', '==', userId)`
- **Analytics**: `collection('creatorAnalytics').doc(userId)`
- **Profile**: `collection('creatorProfiles').doc(userId)`

### Mock Data Removed

All mock data has been replaced with Firebase queries:
- ✅ ContentGrid now fetches real content
- ✅ CourseList now fetches real courses  
- ✅ SyncButton now works with real profile data
- ✅ Stats hooks fetch from Firebase collections

### Debug Logging

Watch the console for profile switching logs:
- `👤 User type detected: CREATOR/VIEWER`
- `🔄 Profile: CREATOR/VIEWER for [username]`
- `✅ Creator Dashboard: [user] (has connected YouTube + created content)`
- `👤 Viewer Profile: [user] (no YouTube connection or content creation)`

### Next Steps

1. Connect YouTube through Create page
2. Upload/create actual content
3. Profile automatically switches to Creator Dashboard
4. All data comes from real Firebase collections

The system now properly enforces creator requirements while maintaining clean separation between viewer and creator experiences.