# 🚀 Community Profile V3 - Quick Start Guide

## What Changed?

The Community Profile Page has been completely redesigned from the ground up with 5 major new features:

### 1. Reddit-Style Feed → Replace Static Posts
- Users can create, upvote, downvote, and comment on posts
- Creators can pin important announcements
- Real-time updates via Firestore

### 2. Discord-Style Member List → See Who's Online
- Live member list with online status indicators
- Click any member to instantly DM them
- Role badges (Creator, Moderator)
- Level rings for high-level users

### 3. Message Pop-In → Instant DMs Without Page Navigation
- Floating chat window in bottom-right
- Minimize/maximize functionality
- Real-time message delivery
- Works from anywhere in the community

### 4. Invite Modal → One-Click Community Growth
- Shareable link with tracking
- Copy to clipboard
- Share via Email, WhatsApp, Twitter, Facebook, LinkedIn
- Beautiful animated modal

### 5. Cleaner Banner → Auto-Contrast Detection
- Removed creator card from banner (now in sidebar only)
- Text color automatically adapts to banner brightness
- Focus on community identity, not creator

---

## Files Created

### New Components
- `src/components/wiz/community/CommunityDashboardV3.tsx` - Main container
- `src/components/wiz/community/HeroBannerV3.tsx` - Banner with auto-contrast
- `src/components/wiz/community/CommunityFeedV3.tsx` - Reddit-style feed
- `src/components/wiz/community/MemberListV3.tsx` - Discord-style member list
- `src/components/wiz/community/EnhancedCreatorSidebarV3.tsx` - Simplified sidebar
- `src/components/wiz/community/MessagePopIn.tsx` - DM overlay
- `src/components/wiz/community/InviteModal.tsx` - Share modal

### Modified Components
- `src/components/wiz/community/CommunityTabsV2.tsx` - Added `feedComponent` prop
- `src/pages/CommunityDashboardPageV2.tsx` - Now imports V3 instead of V2

---

## Firestore Collections Needed

Before using the new features, create these collections in Firebase Console:

### 1. community_posts
```
Fields:
- communityId (string)
- authorId (string)
- authorName (string)
- authorAvatar (string, optional)
- authorLevel (number, optional)
- content (string)
- mediaUrl (string, optional)
- mediaType (string: 'image' | 'video', optional)
- upvotes (number)
- downvotes (number)
- commentCount (number)
- isPinned (boolean)
- createdAt (timestamp)
```

### 2. community_comments
```
Fields:
- postId (string)
- authorId (string)
- authorName (string)
- authorAvatar (string, optional)
- content (string)
- createdAt (timestamp)
```

### 3. community_members
```
Fields:
- communityId (string)
- userId (string)
- userName (string)
- userAvatar (string, optional)
- userLevel (number)
- role (string: 'creator' | 'moderator' | 'member')
- joinedAt (timestamp)
```

### 4. direct_messages
```
Fields:
- senderId (string)
- receiverId (string)
- content (string)
- participants (array of strings: [senderId, receiverId])
- createdAt (timestamp)
- read (boolean)
```

### 5. Update users collection
```
Add these fields to existing users/{userId} documents:
- isOnline (boolean)
- lastActive (timestamp)
```

---

## Testing the New Features

### Test Post Creation
1. Navigate to any community you're a member of
2. Click in the "Share something with the community..." box
3. Type a message
4. Click "Post"
5. See it appear instantly at the top of the feed

### Test Voting
1. Click the upvote (👍) button on any post
2. See the counter increment and button turn purple
3. Click it again to remove your vote
4. Try downvoting - it should switch your vote

### Test Comments
1. Click the comment (💬) button on any post
2. Type a comment in the reply box
3. Click send (✈️)
4. See it appear below the post

### Test Pinning (Creator Only)
1. As a community creator, click ⋮ (three dots) on any post
2. Select "Pin Post"
3. See it move to the top with a golden badge
4. All members will see it pinned

### Test Member List & DMs
1. Look at the sidebar on the right
2. Hover over any member
3. Click the message (💬) button that appears
4. Type a message in the pop-in window
5. Press Enter to send

### Test Invite Modal
1. Click "Invite People" button in sidebar
2. Click "Copy" to copy the invite link
3. Try sharing via Email, WhatsApp, etc.
4. See the member count stats at the bottom

---

## Common Issues & Solutions

### Posts not showing
**Check:**
1. Is the user a member of the community?
2. Are there any posts in Firestore for that communityId?
3. Open browser console - any errors?

**Fix:**
Create a test post manually in Firestore Console:
```
Collection: community_posts
Document ID: (auto-generate)
Fields:
  communityId: "your-community-id"
  authorId: "your-user-id"
  authorName: "Test User"
  content: "Hello world!"
  upvotes: 0
  downvotes: 0
  commentCount: 0
  isPinned: false
  createdAt: (use Firestore timestamp)
```

### Member list empty
**Check:**
1. Does `community_members` collection exist?
2. Are there documents with matching `communityId`?

**Fix:**
When users join a community, ensure a document is created in `community_members`:
```javascript
await addDoc(collection(db, 'community_members'), {
  communityId: community.id,
  userId: user.uid,
  userName: user.displayName,
  userAvatar: user.photoURL,
  userLevel: 1,
  role: 'member',
  joinedAt: serverTimestamp()
});
```

### DMs not working
**Check:**
1. Does `direct_messages` collection exist?
2. Is the `participants` array field set correctly?

**Fix:**
Ensure messages are created with both user IDs in participants array:
```javascript
participants: [senderId, receiverId]
```

### Invite modal not copying
**Check:**
1. Is the site running on HTTPS? (clipboard API requires it)
2. Does the browser support clipboard API?

**Fix:**
Test on a real domain (not localhost without HTTPS)

---

## Deployment Status

**Build:** ✅ Completed successfully (10.95s)
**Deploy:** ✅ Live at https://wiz-magic-platform.web.app
**Status:** 🟢 Production Ready

---

## What's Next?

1. **Add Firestore Security Rules** (see COMMUNITY_PROFILE_V3_REDESIGN.md)
2. **Populate Member List** - Ensure `community_members` is created when users join
3. **Test in Production** - Visit https://wiz-magic-platform.web.app/community/{id}
4. **Monitor Usage** - Check Firestore read/write counts
5. **Gather Feedback** - Ask users what they think!

---

## Rollback Plan (If Needed)

If V3 has issues, you can quickly rollback:

1. **Edit** `src/pages/CommunityDashboardPageV2.tsx`
2. **Change** import back to:
   ```typescript
   import { CommunityDashboardV2 } from '@/components/wiz/community/CommunityDashboardV2';
   ```
3. **Change** return statement to:
   ```typescript
   return <CommunityDashboardV2 communityId={id} />;
   ```
4. **Run** `npm run build && firebase deploy --only hosting`

V2 is still in the codebase and untouched!

---

## Need Help?

Check the full documentation:
- `COMMUNITY_PROFILE_V3_REDESIGN.md` - Complete technical specs
- Console logs - All components log their actions
- Browser DevTools → Network tab - See Firestore queries

**Last Updated:** October 20, 2025
**Status:** ✅ Deployed & Ready to Use
