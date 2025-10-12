# Seamless YouTube OAuth Implementation Guide

🚀 Complete implementation of popup-based YouTube OAuth with zero routing redirects, React Query integration, and server-side token management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [File Structure](#file-structure)
- [Frontend Implementation](#frontend-implementation)
- [Backend Implementation](#backend-implementation)
- [Security](#security)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

This implementation provides a **ChatGPT-style seamless authentication experience** where:

✅ **Main window never navigates** - User stays on Create page throughout
✅ **Popup-based OAuth** - Centered 600x700 popup for authorization
✅ **postMessage communication** - Secure popup → main window messaging
✅ **React Query integration** - Instant data fetching with cache invalidation
✅ **Server-side tokens** - No localStorage, httpOnly cookies only
✅ **Skeleton loaders** - Smooth animated loading states
✅ **PKCE security** - Full OAuth 2.0 best practices
✅ **Error handling** - Graceful popup blockers, timeouts, and retry logic

---

## Features

### User Experience

- **Instant connection** - No page reloads or navigation
- **Smart popup positioning** - Centered on screen
- **Real-time feedback** - Toast notifications for success/error
- **Auto-retry** - Graceful handling of popup blockers
- **Timeout protection** - 60-second limit with clear messaging
- **Beautiful skeletons** - Animated shimmer loaders during fetch

### Security

- **PKCE flow** - Proof Key for Code Exchange
- **State validation** - CSRF protection
- **httpOnly cookies** - Tokens never in JavaScript
- **Server-side exchange** - Client never sees tokens
- **Encrypted storage** - AES-256-GCM encryption
- **Auto token refresh** - Silent refresh via googleapis

### Developer Experience

- **TypeScript** - Full type safety
- **React Query** - Declarative data fetching
- **Tailwind CSS** - Beautiful, responsive UI
- **Framer Motion** - Smooth animations
- **Modular architecture** - Easy to integrate
- **Comprehensive docs** - Backend examples included

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React App                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ SeamlessCreatePage.tsx                                   │  │
│  │                                                          │  │
│  │  - useYouTubeConnect() hook                             │  │
│  │  - useYouTubeVideos() query                             │  │
│  │  - VideoGridSkeleton components                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ useYouTubeConnect Hook                                   │  │
│  │                                                          │  │
│  │  1. openPopup() → fetch /api/oauth/youtube/init        │  │
│  │  2. Open centered popup with OAuth URL                  │  │
│  │  3. Listen for postMessage from popup                   │  │
│  │  4. Invalidate React Query cache                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
           ┌───────────────────────────────┐
           │  OAuth Popup Window           │
           │  (oauth-callback.html)        │
           │                               │
           │  1. User authorizes on Google │
           │  2. Google redirects back     │
           │  3. POST /api/oauth/youtube/  │
           │     exchange                  │
           │  4. postMessage to opener     │
           │  5. Close popup               │
           └───────────────────────────────┘
                           │
                           ▼
           ┌───────────────────────────────┐
           │  Backend API                  │
           │                               │
           │  /api/oauth/youtube/init      │
           │  /api/oauth/youtube/exchange  │
           │  /api/youtube/videos          │
           │  /api/youtube/status          │
           │                               │
           │  - PKCE generation            │
           │  - State validation           │
           │  - Token exchange             │
           │  - Encrypted token storage    │
           │  - httpOnly cookie session    │
           └───────────────────────────────┘
```

---

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
npm install @tanstack/react-query framer-motion

# Backend (Node.js example)
npm install googleapis express express-session
```

### 2. Add Frontend Files

Copy these files to your project:

```
src/
├── hooks/
│   └── useYouTubeConnect.ts          ← Popup OAuth hook
├── lib/
│   └── api/
│       └── youtube-api-client.ts     ← React Query integration
└── components/
    ├── ui/
    │   └── video-grid-skeleton.tsx   ← Skeleton loaders
    └── wiz/
        └── SeamlessCreatePage.tsx    ← Example implementation

public/
└── oauth-callback.html               ← Popup callback page
```

### 3. Setup Backend

See [`YOUTUBE_OAUTH_BACKEND.md`](./YOUTUBE_OAUTH_BACKEND.md) for complete backend implementation.

**Quick endpoint checklist:**
- ✅ `POST /api/oauth/youtube/init` - Generate OAuth URL
- ✅ `POST /api/oauth/youtube/exchange` - Exchange code for tokens
- ✅ `GET /api/youtube/videos` - Fetch user's videos
- ✅ `GET /api/youtube/status` - Check connection status

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   ```
   https://yourdomain.com/oauth-callback.html
   ```
4. Add scopes:
   ```
   https://www.googleapis.com/auth/youtube.readonly
   https://www.googleapis.com/auth/userinfo.profile
   ```

### 5. Use in Your App

```tsx
import { SeamlessCreatePage } from '@/components/wiz/SeamlessCreatePage';

function App() {
  return <SeamlessCreatePage />;
}
```

---

## File Structure

### Frontend Files

#### `src/hooks/useYouTubeConnect.ts`

**Purpose:** Manages popup-based OAuth flow with postMessage communication.

**Key Features:**
- Opens centered popup
- Handles postMessage from callback
- Manages connection state
- Integrates with React Query
- Graceful error handling

**Usage:**
```tsx
const { openPopup, isConnecting, isConnected } = useYouTubeConnect();

<button onClick={openPopup} disabled={isConnecting}>
  Connect YouTube
</button>
```

---

#### `src/lib/api/youtube-api-client.ts`

**Purpose:** Server-proxied YouTube API client with React Query hooks.

**Key Features:**
- All requests via backend (no client-side tokens)
- React Query hooks for automatic caching
- TypeScript types for all responses
- Automatic refetch on connection

**Usage:**
```tsx
const { data: videos, isLoading } = useYouTubeVideos({
  maxResults: 50,
  enabled: connected,
});
```

---

#### `src/components/ui/video-grid-skeleton.tsx`

**Purpose:** Beautiful animated skeleton loaders for video grids.

**Key Features:**
- Shimmer animation effect
- Multiple layouts (grid, list, header)
- Framer Motion animations
- Dark mode support

**Usage:**
```tsx
{isLoading ? (
  <VideoGridSkeleton count={12} />
) : (
  <VideoGrid videos={videos} />
)}
```

---

#### `public/oauth-callback.html`

**Purpose:** OAuth redirect handler that lives in popup window.

**Flow:**
1. Receives authorization code from Google
2. Exchanges code via backend
3. Sends result to opener via postMessage
4. Closes popup automatically

**Security:**
- Origin validation
- No token exposure to client
- Auto-cleanup on error

---

#### `src/components/wiz/SeamlessCreatePage.tsx`

**Purpose:** Complete example implementation of Create page.

**Features:**
- Popup OAuth integration
- Video selection UI
- Skeleton loaders
- Publish workflow
- Responsive design

---

## Frontend Implementation

### Step 1: Setup React Query Provider

```tsx
// main.tsx or App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

### Step 2: Implement OAuth Flow

```tsx
import { useYouTubeConnect } from '@/hooks/useYouTubeConnect';
import { useYouTubeVideos } from '@/lib/api/youtube-api-client';
import { VideoGridSkeleton } from '@/components/ui/video-grid-skeleton';

function CreatePage() {
  const { openPopup, isConnecting } = useYouTubeConnect();
  const { data, isLoading } = useYouTubeVideos();

  return (
    <div>
      <button onClick={openPopup} disabled={isConnecting}>
        Connect YouTube
      </button>

      {isLoading ? (
        <VideoGridSkeleton count={12} />
      ) : (
        <div>
          {data?.videos.map(video => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Handle Connection State

```tsx
const { data: status } = useYouTubeConnectionStatus();

{status?.connected ? (
  <ConnectedView />
) : (
  <ConnectButton onClick={openPopup} />
)}
```

---

## Backend Implementation

See [`YOUTUBE_OAUTH_BACKEND.md`](./YOUTUBE_OAUTH_BACKEND.md) for complete implementation.

### Quick Reference

**Initialize OAuth:**
```javascript
app.post('/api/oauth/youtube/init', async (req, res) => {
  const state = generateState();
  const { codeVerifier, codeChallenge } = generatePKCE();

  stateCache.set(state, { userId, codeVerifier });

  const authUrl = oauth2Client.generateAuthUrl({
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  res.json({ url: authUrl, state });
});
```

**Exchange Code:**
```javascript
app.post('/api/oauth/youtube/exchange', async (req, res) => {
  const { code, state } = req.body;

  // Validate state
  const stateData = stateCache.get(state);
  if (!stateData) return res.status(400).json({ error: 'Invalid state' });

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken({
    code,
    code_verifier: stateData.codeVerifier,
  });

  // Store encrypted tokens in database
  await db.tokens.upsert({ userId, tokens: encrypt(tokens) });

  // Get channel info
  const channel = await getChannelInfo(tokens.access_token);

  res.json({ success: true, ...channel });
});
```

**Fetch Videos:**
```javascript
app.get('/api/youtube/videos', async (req, res) => {
  const userId = req.session.userId;
  const tokens = await db.tokens.findOne({ userId });

  oauth2Client.setCredentials(decrypt(tokens));

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const videos = await youtube.playlistItems.list({ ... });

  res.json({ videos });
});
```

---

## Security

### Token Storage

**NEVER store in client:**
```javascript
❌ localStorage.setItem('token', ...)
❌ sessionStorage.setItem('token', ...)
❌ document.cookie = 'token=...'
```

**ALWAYS store on server:**
```javascript
✅ Database with AES-256-GCM encryption
✅ httpOnly cookies for session
✅ Secure server memory cache
```

### PKCE Implementation

```javascript
// Generate code verifier
const codeVerifier = crypto.randomBytes(32).toString('base64url');

// Generate code challenge
const codeChallenge = crypto
  .createHash('sha256')
  .update(codeVerifier)
  .digest('base64url');

// Send challenge in auth URL
const authUrl = `...&code_challenge=${codeChallenge}&code_challenge_method=S256`;

// Send verifier in exchange
const tokens = await oauth2Client.getToken({
  code,
  code_verifier: codeVerifier,
});
```

### State Validation

```javascript
// Generate & store
const state = crypto.randomBytes(32).toString('hex');
stateCache.set(state, { userId, expiresAt: Date.now() + 600000 });

// Validate on callback
const stateData = stateCache.get(state);
if (!stateData || stateData.expiresAt < Date.now()) {
  throw new Error('Invalid or expired state');
}
```

### Origin Validation

```javascript
// In oauth-callback.html
window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) {
    console.warn('Untrusted origin:', e.origin);
    return;
  }
  // Process message
});
```

---

## Testing

### Manual Test Checklist

#### Happy Path
- [ ] Click "Connect YouTube" → popup opens centered
- [ ] Main window stays on Create page
- [ ] Authorize in popup → popup closes
- [ ] Success toast appears
- [ ] Videos load without page reload
- [ ] Skeleton loaders show during fetch
- [ ] Can select/deselect videos
- [ ] Can publish selected videos

#### Error Scenarios
- [ ] User closes popup → cancellation message
- [ ] Popup blocked → helpful error message
- [ ] User denies consent → error handled gracefully
- [ ] Network error → retry option shown
- [ ] Invalid state → clear error message
- [ ] Expired state → user can retry
- [ ] Timeout (60s) → timeout message shown

#### Security
- [ ] No tokens in localStorage
- [ ] No tokens in sessionStorage
- [ ] No tokens in client cookies
- [ ] Session persists across refresh
- [ ] Tokens refresh automatically
- [ ] State validated correctly
- [ ] PKCE flow works

### Automated Testing

```typescript
// Test popup opening
it('opens popup when connect clicked', async () => {
  const { getByText } = render(<CreatePage />);
  const button = getByText('Connect YouTube');

  fireEvent.click(button);

  expect(window.open).toHaveBeenCalledWith(
    expect.stringContaining('accounts.google.com'),
    'youtube-oauth-popup',
    expect.stringContaining('width=600')
  );
});

// Test message handling
it('handles postMessage from popup', async () => {
  const { getByText } = render(<CreatePage />);

  window.postMessage({
    type: 'YOUTUBE_CONNECTED',
    success: true,
    channelId: 'UC123',
  }, window.location.origin);

  await waitFor(() => {
    expect(getByText(/connected/i)).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Popup Blocked

**Symptom:** Popup doesn't open

**Solution:**
```tsx
if (!popupRef.current || popupRef.current.closed) {
  toast({
    title: "Popup Blocked",
    description: "Please allow popups for this site and try again.",
  });
}
```

**User Action:** Enable popups in browser settings

---

### No Videos Loading

**Symptom:** Videos array is empty

**Checklist:**
1. ✅ Check YouTube API quota (10,000 units/day)
2. ✅ Verify user has published videos
3. ✅ Check token hasn't expired
4. ✅ Verify scope includes `youtube.readonly`
5. ✅ Check backend logs for API errors

---

### Token Expired

**Symptom:** 401 errors on API calls

**Solution:** Automatic refresh with googleapis:
```javascript
oauth2Client.on('tokens', async (tokens) => {
  // Auto-refresh triggered
  await db.tokens.update({ userId, tokens });
});
```

---

### State Invalid

**Symptom:** "Invalid or expired state" error

**Causes:**
- State expired (>10 minutes)
- User refreshed popup
- State cache cleared

**Solution:** User clicks "Connect" again

---

### CORS Errors

**Symptom:** Network errors in console

**Solution:** Backend CORS config:
```javascript
app.use(cors({
  origin: process.env.APP_URL,
  credentials: true,
}));
```

---

## Environment Variables

```bash
# .env (Backend)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
APP_URL=https://yourdomain.com
ENCRYPTION_KEY=your_64_char_hex_encryption_key
SESSION_SECRET=your_session_secret
DATABASE_URL=postgresql://...

# .env (Frontend - if needed)
VITE_API_URL=https://api.yourdomain.com
```

---

## Migration from Redirect Flow

If you're migrating from redirect-based OAuth:

### Before (Redirect)
```tsx
// Main window navigates away
window.location.href = oauthUrl;

// User returns after auth
useEffect(() => {
  const code = new URLSearchParams(location.search).get('code');
  if (code) {
    exchangeCode(code);
  }
}, []);
```

### After (Popup)
```tsx
// Main window stays put
const { openPopup } = useYouTubeConnect();

<button onClick={openPopup}>Connect</button>

// postMessage handles result automatically
// No page reload, no URL params, no navigation
```

---

## Performance Optimization

### React Query Caching

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Prefetching

```tsx
// Prefetch on hover
const prefetchVideos = () => {
  queryClient.prefetchQuery(['youtubeVideos'], fetchYouTubeVideos);
};

<button onMouseEnter={prefetchVideos} onClick={openPopup}>
  Connect YouTube
</button>
```

### Pagination

```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['youtubeVideos'],
  queryFn: ({ pageParam }) => fetchYouTubeVideos({ pageToken: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPageToken,
});
```

---

## Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [OAuth 2.0 for Client-side Web Apps](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Backend Implementation Guide](./YOUTUBE_OAUTH_BACKEND.md)

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review backend logs for errors
3. Verify Google Console configuration
4. Check browser console for client errors
5. Test with different browsers

---

**Generated with Claude Code**

🚀 Happy coding!
