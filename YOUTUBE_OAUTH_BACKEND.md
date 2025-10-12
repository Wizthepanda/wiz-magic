# YouTube OAuth Backend Implementation Guide

Complete backend implementation guide for seamless popup-based YouTube OAuth flow.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Security Requirements](#security-requirements)
3. [API Endpoints](#api-endpoints)
4. [Implementation Examples](#implementation-examples)
5. [Token Management](#token-management)
6. [Testing Checklist](#testing-checklist)

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌──────────────────┐
│   React App     │         │   Your Backend  │         │  Google OAuth    │
│  (Create Page)  │         │                 │         │                  │
└────────┬────────┘         └────────┬────────┘         └────────┬─────────┘
         │                           │                           │
         │ 1. POST /api/oauth/       │                           │
         │    youtube/init           │                           │
         ├──────────────────────────>│                           │
         │                           │                           │
         │                           │ 2. Generate state + PKCE  │
         │                           │    Store in cache         │
         │                           │                           │
         │ 3. Return OAuth URL       │                           │
         │<──────────────────────────┤                           │
         │                           │                           │
         │ 4. Open popup with URL    │                           │
         │                           │                           │
┌────────▼────────┐                  │                           │
│  OAuth Popup    │  5. User redirected to Google                │
│  (New Window)   ├──────────────────────────────────────────────>│
└────────┬────────┘                  │                           │
         │                           │     6. User authorizes    │
         │                           │                           │
         │  7. Redirect to callback  │                           │
         │<──────────────────────────────────────────────────────┤
         │     with code + state     │                           │
         │                           │                           │
         │ 8. POST /api/oauth/       │                           │
         │    youtube/exchange       │                           │
         ├──────────────────────────>│                           │
         │                           │                           │
         │                           │ 9. Validate state         │
         │                           │    Exchange code for      │
         │                           │    tokens (PKCE)          │
         │                           ├──────────────────────────>│
         │                           │                           │
         │                           │ 10. Return access +       │
         │                           │     refresh tokens        │
         │                           │<──────────────────────────┤
         │                           │                           │
         │                           │ 11. Store tokens in DB    │
         │                           │     Set httpOnly cookie   │
         │                           │     Get channel info      │
         │                           │                           │
         │ 12. Return success        │                           │
         │<──────────────────────────┤                           │
         │                           │                           │
         │ 13. postMessage to main   │                           │
         │     window and close      │                           │
         ├──────────────────────────>│                           │
         │                           │                           │
┌────────▼────────┐                  │                           │
│   Main Window   │ 14. Invalidate   │                           │
│  (React Query)  │     queries      │                           │
│                 ├──────────────────>│                           │
│                 │ 15. GET /api/     │                           │
│                 │     youtube/      │                           │
│                 │     videos        │                           │
│                 │<──────────────────┤                           │
│                 │ 16. Return videos │                           │
│                 │     (using stored │                           │
│                 │     tokens)       │                           │
└─────────────────┘                  └───────────────────────────┘
```

---

## Security Requirements

### 1. **PKCE (Proof Key for Code Exchange)**

REQUIRED for public clients (web apps). Prevents authorization code interception attacks.

**Flow:**
1. Generate `code_verifier` (random 43-128 char string)
2. Create `code_challenge` = BASE64URL(SHA256(code_verifier))
3. Send `code_challenge` + `code_challenge_method=S256` in auth request
4. Send `code_verifier` in token exchange

### 2. **State Parameter**

REQUIRED for CSRF protection.

**Implementation:**
- Generate cryptographically random state (32+ chars)
- Store in server cache with 10-minute expiry
- Validate on callback

### 3. **Token Storage**

**REQUIRED: Server-side only**

❌ **NEVER** store tokens in:
- localStorage
- sessionStorage
- Client-side cookies

✅ **DO** store tokens in:
- Database (encrypted)
- Server session with httpOnly cookies
- Secure server memory cache

### 4. **httpOnly Cookies**

**Session Cookie Configuration:**
```javascript
{
  httpOnly: true,      // Cannot be accessed via JavaScript
  secure: true,        // HTTPS only (production)
  sameSite: 'lax',    // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

---

## API Endpoints

### 1. `POST /api/oauth/youtube/init`

Initialize OAuth flow - generate state, PKCE, and return Google OAuth URL.

**Request:**
```http
POST /api/oauth/youtube/init
Content-Type: application/json
Cookie: session_id=<session_token>

{}
```

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=...&state=...&code_challenge=...&code_challenge_method=S256",
  "state": "random_state_value_abc123"
}
```

**Implementation Example (Node.js + Express):**

```javascript
const crypto = require('crypto');
const { google } = require('googleapis');

// In-memory cache (use Redis in production)
const stateCache = new Map();

// PKCE helper functions
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

app.post('/api/oauth/youtube/init', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Generate PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Store state + verifier (expires in 10 minutes)
    stateCache.set(state, {
      userId,
      codeVerifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Clean up expired states
    setTimeout(() => stateCache.delete(state), 10 * 60 * 1000);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/oauth-callback.html`
    );

    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'consent', // Force consent to get refresh token
    });

    res.json({ url: authUrl, state });
  } catch (error) {
    console.error('OAuth init error:', error);
    res.status(500).json({ error: 'Failed to initialize OAuth' });
  }
});
```

---

### 2. `POST /api/oauth/youtube/exchange`

Exchange authorization code for tokens.

**Request:**
```http
POST /api/oauth/youtube/exchange
Content-Type: application/json
Cookie: session_id=<session_token>

{
  "code": "4/0AfJohXk...",
  "state": "random_state_value_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "channelId": "UCxxxxxx",
  "channelTitle": "Your Channel",
  "channelAvatar": "https://...",
  "subscriberCount": "1.2K"
}
```

**Implementation Example:**

```javascript
app.post('/api/oauth/youtube/exchange', async (req, res) => {
  try {
    const { code, state } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    // Validate state
    const stateData = stateCache.get(state);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    if (stateData.userId !== userId) {
      return res.status(403).json({ error: 'User mismatch' });
    }

    // Remove state from cache (one-time use)
    stateCache.delete(state);

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/oauth-callback.html`
    );

    // Exchange code for tokens (with PKCE verifier)
    const { tokens } = await oauth2Client.getToken({
      code,
      code_verifier: stateData.codeVerifier,
    });

    // Set credentials
    oauth2Client.setCredentials(tokens);

    // Get YouTube channel info
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
    });

    const channel = channelResponse.data.items?.[0];
    if (!channel) {
      return res.status(404).json({ error: 'No YouTube channel found' });
    }

    const channelData = {
      channelId: channel.id,
      channelTitle: channel.snippet.title,
      channelAvatar: channel.snippet.thumbnails.default.url,
      subscriberCount: formatSubscriberCount(channel.statistics.subscriberCount),
    };

    // Store tokens in database (encrypted)
    await db.youtubeTokens.upsert({
      where: { userId },
      update: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token),
        expiresAt: new Date(tokens.expiry_date),
        ...channelData,
        updatedAt: new Date(),
      },
      create: {
        userId,
        accessToken: encrypt(tokens.access_token),
        refreshToken: encrypt(tokens.refresh_token),
        expiresAt: new Date(tokens.expiry_date),
        ...channelData,
        createdAt: new Date(),
      },
    });

    // Update user record
    await db.users.update({
      where: { id: userId },
      data: {
        youtubeConnected: true,
        youtubeChannelId: channel.id,
      },
    });

    res.json({
      success: true,
      ...channelData,
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to exchange authorization code',
    });
  }
});

// Helper function
function formatSubscriberCount(count) {
  const num = parseInt(count);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

---

### 3. `GET /api/youtube/videos`

Fetch user's YouTube videos (server-side API call).

**Request:**
```http
GET /api/youtube/videos?maxResults=50&pageToken=xyz
Cookie: session_id=<session_token>
```

**Response:**
```json
{
  "videos": [
    {
      "id": "video_id_123",
      "videoId": "video_id_123",
      "title": "My Video Title",
      "description": "Video description...",
      "thumbnail": "https://i.ytimg.com/vi/...",
      "duration": "PT10M30S",
      "publishedAt": "2024-01-15T10:30:00Z",
      "views": "1234",
      "channelId": "UCxxxxxx",
      "channelTitle": "Your Channel"
    }
  ],
  "nextPageToken": "CAUQAA",
  "totalResults": 150
}
```

**Implementation Example:**

```javascript
app.get('/api/youtube/videos', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const maxResults = Math.min(parseInt(req.query.maxResults) || 50, 50);
    const pageToken = req.query.pageToken;

    // Get stored tokens
    const tokenRecord = await db.youtubeTokens.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: 'YouTube not connected' });
    }

    // Check if token needs refresh
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/oauth-callback.html`
    );

    oauth2Client.setCredentials({
      access_token: decrypt(tokenRecord.accessToken),
      refresh_token: decrypt(tokenRecord.refreshToken),
      expiry_date: tokenRecord.expiresAt.getTime(),
    });

    // Refresh token if expired (googleapis handles this automatically)
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        await db.youtubeTokens.update({
          where: { userId },
          data: {
            accessToken: encrypt(tokens.access_token),
            refreshToken: encrypt(tokens.refresh_token),
            expiresAt: new Date(tokens.expiry_date),
          },
        });
      }
    });

    // Get uploads playlist
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const channelResponse = await youtube.channels.list({
      part: ['contentDetails'],
      mine: true,
    });

    const uploadsPlaylistId =
      channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return res.json({ videos: [], totalResults: 0 });
    }

    // Get videos from uploads playlist
    const playlistResponse = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults,
      pageToken,
    });

    const videoIds = playlistResponse.data.items.map(
      (item) => item.contentDetails.videoId
    );

    // Get video details (duration, views, etc.)
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds.join(','),
    });

    const videos = videosResponse.data.items.map((video) => ({
      id: video.id,
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.medium.url,
      thumbnailHigh: video.snippet.thumbnails.high?.url,
      duration: video.contentDetails.duration,
      publishedAt: video.snippet.publishedAt,
      views: video.statistics.viewCount,
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
      tags: video.snippet.tags,
      categoryId: video.snippet.categoryId,
    }));

    res.json({
      videos,
      nextPageToken: playlistResponse.data.nextPageToken,
      totalResults: playlistResponse.data.pageInfo.totalResults,
    });
  } catch (error) {
    console.error('Fetch videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});
```

---

### 4. `GET /api/youtube/status`

Check YouTube connection status.

**Request:**
```http
GET /api/youtube/status
Cookie: session_id=<session_token>
```

**Response:**
```json
{
  "connected": true,
  "channelId": "UCxxxxxx",
  "channelTitle": "Your Channel",
  "channelAvatar": "https://...",
  "subscriberCount": "1.2K",
  "lastSynced": "2024-01-15T10:30:00Z"
}
```

**Implementation:**

```javascript
app.get('/api/youtube/status', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tokenRecord = await db.youtubeTokens.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      return res.json({ connected: false });
    }

    res.json({
      connected: true,
      channelId: tokenRecord.channelId,
      channelTitle: tokenRecord.channelTitle,
      channelAvatar: tokenRecord.channelAvatar,
      subscriberCount: tokenRecord.subscriberCount,
      lastSynced: tokenRecord.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});
```

---

### 5. `POST /api/youtube/disconnect`

Disconnect YouTube channel.

**Implementation:**

```javascript
app.post('/api/youtube/disconnect', async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Delete tokens
    await db.youtubeTokens.delete({
      where: { userId },
    });

    // Update user
    await db.users.update({
      where: { id: userId },
      data: {
        youtubeConnected: false,
        youtubeChannelId: null,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});
```

---

## Token Management

### Encryption

**Use strong encryption for tokens:**

```javascript
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encrypted) {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### Refresh Token Handling

**Automatic refresh with googleapis:**

```javascript
oauth2Client.on('tokens', async (tokens) => {
  // This fires automatically when token is refreshed
  if (tokens.refresh_token) {
    await db.youtubeTokens.update({
      where: { userId },
      data: {
        accessToken: encrypt(tokens.access_token),
        expiresAt: new Date(tokens.expiry_date),
      },
    });
    console.log('✅ Token refreshed automatically');
  }
});
```

---

## Testing Checklist

### Functional Testing

- [ ] User can click "Connect YouTube" → popup opens centered
- [ ] Main window stays on Create page (no navigation)
- [ ] User authorizes in popup → popup closes automatically
- [ ] Success toast appears in main window
- [ ] Videos load instantly without page reload
- [ ] Skeleton loaders show during fetch
- [ ] User can retry if connection fails
- [ ] Popup blocked → clear error message shown
- [ ] User closes popup → cancellation message shown
- [ ] Session persists across page refresh
- [ ] Tokens refresh automatically when expired

### Security Testing

- [ ] Tokens never visible in localStorage
- [ ] Tokens never visible in sessionStorage
- [ ] Tokens never visible in client-side cookies
- [ ] Session cookies are httpOnly
- [ ] Session cookies are secure (HTTPS)
- [ ] Session cookies have sameSite=lax
- [ ] State validation works correctly
- [ ] Expired states are rejected
- [ ] PKCE flow works correctly
- [ ] CSRF attacks prevented
- [ ] XSS attacks prevented

### Error Handling

- [ ] Network errors handled gracefully
- [ ] Invalid state errors shown to user
- [ ] Expired tokens refresh automatically
- [ ] API rate limits handled
- [ ] Server errors don't crash app
- [ ] Timeout after 60 seconds

---

## Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# App
APP_URL=https://yourdomain.com

# Encryption (generate with: node -e "console.log(crypto.randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_64_char_hex_string

# Session
SESSION_SECRET=your_session_secret

# Database
DATABASE_URL=postgresql://...
```

---

## Production Deployment Notes

1. **Use Redis for state cache** (instead of in-memory Map)
2. **Use proper session store** (Redis, database, etc.)
3. **Enable rate limiting** on OAuth endpoints
4. **Set up monitoring** for token refresh failures
5. **Implement token rotation** for refresh tokens
6. **Add request logging** (without logging tokens)
7. **Use environment-specific redirect URIs**
8. **Whitelist redirect URIs** in Google Console

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

**Generated with Claude Code**
