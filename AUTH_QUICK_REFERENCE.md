# 🚀 Auth Refactor - Quick Reference

## 📦 What Was Built

### New Files Created
1. `src/lib/youtube-connection-service.ts` - YouTube connection logic
2. `src/components/wiz/ConnectYouTubeButton.tsx` - UI component
3. `AUTH_REFACTOR_GUIDE.md` - Full documentation
4. `AUTH_REFACTOR_SUMMARY.md` - Implementation summary
5. `AUTH_QUICK_REFERENCE.md` - This file

### Modified Files
1. `src/lib/firebase.ts` - Added `youtubeAuthProvider`
2. `src/hooks/useAuth.ts` - Refactored `signInWithGoogle()` and `connectYouTube()`

---

## 🎯 Two-Minute Integration Guide

### Step 1: Update Login Button

**Find:**
```tsx
<Button onClick={() => signInWithGoogle(true)}>
  <Youtube className="w-4 h-4 mr-2" />
  Login with YouTube
</Button>
```

**Replace with:**
```tsx
<Button onClick={() => signInWithGoogle()}>
  <svg className="w-4 h-4 mr-2">...</svg> {/* Google icon */}
  Login with Google
</Button>
```

### Step 2: Add YouTube Connection to Profile

```tsx
// In src/components/wiz/profile/OverviewTab.tsx
import { ConnectYouTubeButton } from '@/components/wiz/ConnectYouTubeButton';

export const OverviewTab = () => {
  return (
    <div className="space-y-6">
      {/* Existing content */}

      {/* Add this */}
      <ConnectYouTubeButton variant="card" showChannelInfo={true} />
    </div>
  );
};
```

### Step 3: Add to Creator Profile

```tsx
// In src/components/wiz/creator/CreatorPrivateProfile.tsx
import { ConnectYouTubeButton } from '@/components/wiz/ConnectYouTubeButton';

// Add after header, before KPI strip
<div className="container mx-auto px-4 mb-6">
  <ConnectYouTubeButton variant="card" showChannelInfo={true} />
</div>
```

### Step 4: Add to Create Tab

```tsx
// In src/components/wiz/WizCreatePage.tsx or similar
import { ConnectYouTubeButton } from '@/components/wiz/ConnectYouTubeButton';
import { useAuth } from '@/hooks/useAuth';

const { user } = useAuth();

// Add at top if not connected
{!user?.youtubeConnected && (
  <Card className="mb-6 bg-blue-50 border-blue-200">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Connect YouTube to Upload</h3>
          <p className="text-sm text-slate-600">
            Link your channel to import videos
          </p>
        </div>
        <ConnectYouTubeButton variant="button" />
      </div>
    </CardContent>
  </Card>
)}
```

---

## 💻 Code Snippets

### Check YouTube Connection Status

```typescript
import YouTubeConnectionService from '@/lib/youtube-connection-service';

const status = await YouTubeConnectionService.getConnectionStatus(userId);
if (status.connected) {
  console.log('Channel:', status.channelTitle);
}
```

### Connect YouTube

```typescript
const { connectYouTube } = useAuth();
await connectYouTube(); // Uses redirect flow
```

### Disconnect YouTube

```typescript
import YouTubeConnectionService from '@/lib/youtube-connection-service';

await YouTubeConnectionService.disconnectYouTube(userId);
```

### Get Valid YouTube Token

```typescript
import YouTubeConnectionService from '@/lib/youtube-connection-service';

// Auto-refreshes if needed
const token = await YouTubeConnectionService.getValidAccessToken(userId);
```

---

## 🔧 Component Variants

### Button Variant
```tsx
<ConnectYouTubeButton variant="button" size="md" />
```

### Card Variant (Recommended)
```tsx
<ConnectYouTubeButton
  variant="card"
  showChannelInfo={true}
  onConnectionChange={(connected) => {
    // Handle connection change
  }}
/>
```

### Inline Variant
```tsx
<ConnectYouTubeButton variant="inline" />
```

---

## 📋 Testing Checklist

Quick test to verify everything works:

### Login Test
- [ ] Click "Login with Google"
- [ ] Google login popup appears
- [ ] NO YouTube permissions requested
- [ ] Redirect to dashboard after login

### YouTube Connection Test
- [ ] Go to Profile tab
- [ ] See "Connect YouTube" button
- [ ] Click button
- [ ] YouTube OAuth popup appears
- [ ] Channel info appears after connection

### Disconnection Test
- [ ] Click "Disconnect" on YouTube card
- [ ] YouTube data removed
- [ ] Still logged in with Google
- [ ] Can reconnect again

---

## 🚨 Common Issues

### Issue: Build error "Module not found: YouTubeConnectionService"
**Fix:** Make sure file is at `src/lib/youtube-connection-service.ts`

### Issue: "Cannot read property 'uid' of null"
**Fix:** Ensure user is logged in before calling `connectYouTube()`

### Issue: YouTube OAuth not triggering
**Fix:** Check `VITE_USE_YOUTUBE_API=true` in `.env`

### Issue: Token expired
**Fix:** Service auto-refreshes. If persistent, disconnect and reconnect.

---

## 📊 Before vs After

### Before
```typescript
// User HAD to connect YouTube to login
await signInWithGoogle(true); // Forces YouTube scope
```

### After
```typescript
// Step 1: Login with Google (no YouTube needed)
await signInWithGoogle();

// Step 2: OPTIONAL - Connect YouTube later
await connectYouTube();
```

---

## 🎨 UI Changes Summary

### Login Page
- **Old**: "Login with YouTube" + YouTube icon
- **New**: "Login with Google" + Google icon

### Profile Tab
- **Old**: Nothing
- **New**: YouTube connection card

### Creator Profile
- **Old**: Forced YouTube connection
- **New**: Optional YouTube connection card

### Create Tab
- **Old**: YouTube required
- **New**: Optional "Connect YouTube" prompt

---

## 🔐 Security Notes

✅ Google auth tokens: Managed by Firebase
✅ YouTube tokens: Stored in Firestore (encrypted)
✅ Access tokens: Auto-refresh before expiry
✅ Refresh tokens: Server-side only
✅ LocalStorage: Only access token (short-lived)

---

## 📞 Need Help?

1. **Read**: `AUTH_REFACTOR_GUIDE.md` for full documentation
2. **Check**: Console logs for detailed error messages
3. **Test**: In development before deploying
4. **Debug**: Use browser DevTools Network tab for OAuth flow

---

## ✅ Deployment Checklist

- [ ] Test login flow in development
- [ ] Test YouTube connection
- [ ] Test disconnection
- [ ] Update all "Login with YouTube" buttons
- [ ] Add ConnectYouTubeButton to 3 pages
- [ ] Run `npm run build`
- [ ] Deploy to Firebase
- [ ] Test in production
- [ ] Monitor Firebase logs

---

**All set!** 🎉

The refactor is complete and ready for integration. Follow the steps above to integrate into your UI components.

For detailed implementation guidance, see `AUTH_REFACTOR_GUIDE.md`.
