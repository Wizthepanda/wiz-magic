# 🚀 Username Sync - Quick Reference Guide

## ✨ What Changed?

### Before (❌ Old Behavior)
```
User connects YouTube → Shows Google's displayName everywhere
❌ "John Smith" (from Google account)
❌ No control over displayed name
```

### After (✅ New Behavior)
```
User connects YouTube → Shows WIZUP username + YouTube avatar
✅ "@wizardmaster" (WIZUP username)
✅ YouTube profile picture
✅ User controls their identity
```

---

## 🎯 How to Use in Your Components

### Option 1: Use Utility Functions (Recommended)
```typescript
import { useAuth, getUserDisplayName, getUserAvatar } from '@/hooks/useAuth';

export const MyComponent = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <img src={getUserAvatar(user)} alt={getUserDisplayName(user)} />
      <h3>{getUserDisplayName(user)}</h3>
    </div>
  );
};
```

### Option 2: Direct Access
```typescript
import { useAuth } from '@/hooks/useAuth';

export const MyComponent = () => {
  const { user } = useAuth();
  
  // Display name priority: username > displayName > youtubeProfile.channelTitle
  const displayName = user?.username || user?.displayName || user?.youtubeProfile?.channelTitle || 'User';
  
  // Avatar priority: YouTube avatar > photoURL
  const avatar = user?.youtubeProfile?.thumbnailUrl || user?.photoURL || '';
  
  return (
    <div>
      <img src={avatar} alt={displayName} />
      <h3>{displayName}</h3>
    </div>
  );
};
```

---

## 📊 Priority Logic

### Display Name
```
1. user.username           ⭐ WIZUP username (e.g., "@wizardmaster")
   ↓ (if not set)
2. user.displayName        → Google account name
   ↓ (if not set)
3. user.youtubeProfile?.channelTitle → YouTube channel name
   ↓ (if not set)
4. "User"                  → Fallback
```

### Avatar
```
1. user.youtubeProfile?.thumbnailUrl ⭐ YouTube profile picture
   ↓ (if not connected)
2. user.photoURL           → User's photo from Google/upload
   ↓ (if not set)
3. ""                      → Empty (component shows default avatar)
```

---

## 🔧 Common Patterns

### Avatar with Fallback Component
```typescript
<Avatar>
  <AvatarImage src={getUserAvatar(user)} />
  <AvatarFallback>
    {getUserDisplayName(user).charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>
```

### Storing User Data in Firestore
```typescript
import { getUserDisplayName, getUserAvatar } from '@/hooks/useAuth';

await addDoc(collection(db, 'posts'), {
  authorId: user.uid,
  authorName: getUserDisplayName(user),  // ✅ Uses WIZUP username
  authorAvatar: getUserAvatar(user),     // ✅ Uses YouTube avatar
  content: postContent,
  createdAt: serverTimestamp(),
});
```

### Profile Display Card
```typescript
<div className="profile-card">
  <img 
    src={getUserAvatar(user) || '/default-avatar.png'} 
    alt={getUserDisplayName(user)}
    className="w-16 h-16 rounded-full"
  />
  <div>
    <h3>{getUserDisplayName(user)}</h3>
    {user?.youtubeProfile && (
      <p className="text-sm text-gray-500">
        YouTube: {user.youtubeProfile.channelTitle}
      </p>
    )}
  </div>
</div>
```

---

## 🎨 Updated Components

### ✅ Already Updated
- `CreatorHeader` - Shows WIZUP username in Creator Studio
- `WizProfileBar` - Top navigation profile display
- `CommunityFeedV3` - Community posts and comments

### 📝 Components You Might Want to Update
If you see `user.displayName` or `user.photoURL` in these files, consider updating:
- `src/components/wiz/CreationHub.tsx`
- `src/components/wiz/profile/EditProfileTab.tsx`
- `src/components/wiz/DynamicProfilePage.tsx`
- Any custom components you've created

**How to Update:**
1. Import utility functions: `import { getUserDisplayName, getUserAvatar } from '@/hooks/useAuth';`
2. Replace `user.displayName` with `getUserDisplayName(user)`
3. Replace `user.photoURL` with `getUserAvatar(user)`

---

## 🧪 Testing Checklist

### Test Scenario 1: New User
- [ ] Sign up with Google
- [ ] User sees Google displayName initially ✓
- [ ] Go to Profile → Edit Profile
- [ ] Set WIZUP username (e.g., "@coolwizard")
- [ ] Username now appears everywhere ✓

### Test Scenario 2: YouTube Connection
- [ ] Connect YouTube channel
- [ ] WIZUP username preserved ✓
- [ ] YouTube avatar now shows ✓
- [ ] Check: Profile bar, Creator Studio, Community posts ✓

### Test Scenario 3: User Without Username
- [ ] Sign in (no WIZUP username set)
- [ ] Should see Google displayName ✓
- [ ] Connect YouTube
- [ ] Should see Google displayName + YouTube avatar ✓

### Test Scenario 4: Firestore Verification
- [ ] Open Firebase Console → Firestore → users/{uid}
- [ ] Verify `username` field exists (if set)
- [ ] Verify `youtubeProfile.thumbnailUrl` exists (if connected)
- [ ] Verify `photoURL` updated to YouTube avatar ✓

---

## 🐛 Troubleshooting

### Q: Username not showing?
**A:** Check if user has set a WIZUP username in their profile. If not, it falls back to displayName.

### Q: Still seeing Google name?
**A:** 
1. Verify component is using `getUserDisplayName(user)` instead of `user.displayName`
2. Check if user has actually set a WIZUP username
3. Clear cache and reload

### Q: YouTube avatar not showing?
**A:**
1. Verify YouTube connection completed successfully
2. Check Firestore: `users/{uid}.youtubeProfile.thumbnailUrl` should exist
3. Verify component uses `getUserAvatar(user)`

### Q: How to debug?
```typescript
const { user } = useAuth();

console.log('Debug User Profile:', {
  username: user?.username,
  displayName: user?.displayName,
  photoURL: user?.photoURL,
  youtubeChannelTitle: user?.youtubeProfile?.channelTitle,
  youtubeThumbnail: user?.youtubeProfile?.thumbnailUrl,
  computed: {
    displayName: getUserDisplayName(user),
    avatar: getUserAvatar(user),
  }
});
```

---

## 📚 Related Files

### Core Auth System
- `src/hooks/useAuth.ts` - Main auth hook with utility functions
- `src/lib/firebase.ts` - Firebase configuration

### YouTube Integration
- `src/lib/youtube-connection-service.ts` - Handles YouTube OAuth
- `src/lib/youtube-profile-sync.ts` - Syncs YouTube profile data
- `src/lib/youtube-api.ts` - YouTube API wrapper

### Components
- `src/components/wiz/creator/components/Header.tsx` - Creator header
- `src/components/wiz/WizProfileBar.tsx` - Profile bar
- `src/components/wiz/community/CommunityFeedV3.tsx` - Community feed

---

## 💡 Pro Tips

### Tip 1: Use Utility Functions Everywhere
```typescript
// ❌ Don't do this
<h3>{user?.displayName || 'User'}</h3>
<img src={user?.photoURL || '/default.png'} />

// ✅ Do this instead
<h3>{getUserDisplayName(user)}</h3>
<img src={getUserAvatar(user) || '/default.png'} />
```

### Tip 2: Type Safety
```typescript
import { WizUser } from '@/hooks/useAuth';

// Component accepts WizUser for type safety
interface Props {
  user: WizUser;
}
```

### Tip 3: Memoization for Performance
```typescript
import { useMemo } from 'react';

const displayName = useMemo(() => getUserDisplayName(user), [user]);
const avatar = useMemo(() => getUserAvatar(user), [user]);
```

### Tip 4: Show YouTube Badge
```typescript
{user?.youtubeConnected && (
  <Badge className="bg-red-500">
    <Youtube className="w-3 h-3 mr-1" />
    YouTube Creator
  </Badge>
)}
```

---

## 🎯 Quick Migration Guide

If you have existing components using `user.displayName`:

1. **Find all usages:**
   ```bash
   grep -r "user\.displayName" src/components/
   grep -r "user\.photoURL" src/components/
   ```

2. **Update imports:**
   ```typescript
   // Add to top of file
   import { getUserDisplayName, getUserAvatar } from '@/hooks/useAuth';
   ```

3. **Replace calls:**
   - `user.displayName` → `getUserDisplayName(user)`
   - `user.photoURL` → `getUserAvatar(user)`

4. **Test thoroughly:**
   - Test with user who has WIZUP username
   - Test with user who doesn't have WIZUP username
   - Test with YouTube connected
   - Test without YouTube connected

---

## ✨ Summary

**Two simple functions solve everything:**
```typescript
getUserDisplayName(user) // Returns the best display name
getUserAvatar(user)      // Returns the best avatar URL
```

Use them consistently across your app for a unified user experience! 🚀

---

**Last Updated**: November 4, 2025  
**Status**: ✅ Production Ready

