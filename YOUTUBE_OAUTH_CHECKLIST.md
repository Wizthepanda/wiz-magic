# YouTube OAuth Implementation Checklist

Complete checklist for implementing seamless popup-based YouTube OAuth.

## ✅ Technical Implementation Checklist

### Frontend Setup

- [ ] **Install dependencies**
  ```bash
  npm install @tanstack/react-query framer-motion
  ```

- [ ] **Add React Query Provider**
  - [ ] Wrap app with `QueryClientProvider`
  - [ ] Configure default query options
  - [ ] Set up devtools (optional)

- [ ] **Copy frontend files**
  - [ ] `src/hooks/useYouTubeConnect.ts`
  - [ ] `src/lib/api/youtube-api-client.ts`
  - [ ] `src/components/ui/video-grid-skeleton.tsx`
  - [ ] `src/components/wiz/SeamlessCreatePage.tsx`
  - [ ] `public/oauth-callback.html`

- [ ] **Update imports**
  - [ ] Verify all import paths match your project structure
  - [ ] Update `@/` aliases if needed
  - [ ] Check toast hook import (`useToast`)

### Backend Setup

- [ ] **Install server dependencies**
  ```bash
  npm install googleapis express express-session
  ```

- [ ] **Create database schema**
  - [ ] Users table with `youtubeConnected` flag
  - [ ] YouTube tokens table (encrypted storage)
  - [ ] Session store (Redis recommended)

- [ ] **Implement API endpoints**
  - [ ] `POST /api/oauth/youtube/init`
  - [ ] `POST /api/oauth/youtube/exchange`
  - [ ] `GET /api/youtube/videos`
  - [ ] `GET /api/youtube/status`
  - [ ] `GET /api/youtube/channel`
  - [ ] `POST /api/youtube/disconnect`

- [ ] **Setup encryption**
  - [ ] Generate encryption key (AES-256-GCM)
  - [ ] Implement `encrypt()` function
  - [ ] Implement `decrypt()` function
  - [ ] Store key in environment variables

- [ ] **Configure session management**
  - [ ] Setup session middleware
  - [ ] Configure httpOnly cookies
  - [ ] Set secure flag (HTTPS only in production)
  - [ ] Set sameSite policy

- [ ] **Implement PKCE**
  - [ ] Generate code verifier
  - [ ] Calculate code challenge (SHA-256)
  - [ ] Store verifier with state
  - [ ] Send verifier in token exchange

- [ ] **State management**
  - [ ] Generate cryptographically random state
  - [ ] Store state in cache (10-minute expiry)
  - [ ] Validate state on callback
  - [ ] Implement cleanup for expired states

### Google Cloud Console

- [ ] **Create OAuth 2.0 credentials**
  - [ ] Go to Google Cloud Console
  - [ ] Enable YouTube Data API v3
  - [ ] Create OAuth 2.0 Client ID
  - [ ] Select "Web application"
  - [ ] Note Client ID and Secret

- [ ] **Configure authorized redirect URIs**
  - [ ] Add `https://yourdomain.com/oauth-callback.html`
  - [ ] Add localhost for development (if needed)
  - [ ] Save configuration

- [ ] **Configure OAuth consent screen**
  - [ ] Set application name
  - [ ] Add logo (optional)
  - [ ] Add privacy policy URL
  - [ ] Add terms of service URL

- [ ] **Add OAuth scopes**
  - [ ] `https://www.googleapis.com/auth/youtube.readonly`
  - [ ] `https://www.googleapis.com/auth/userinfo.profile`

### Environment Configuration

- [ ] **Backend environment variables**
  ```bash
  GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your_client_secret
  APP_URL=https://yourdomain.com
  ENCRYPTION_KEY=your_64_char_hex_key
  SESSION_SECRET=your_session_secret
  DATABASE_URL=postgresql://...
  ```

- [ ] **Generate encryption key**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] **Frontend environment variables (if needed)**
  ```bash
  VITE_API_URL=https://api.yourdomain.com
  ```

### Security Checklist

- [ ] **Token storage**
  - [ ] ❌ NOT in localStorage
  - [ ] ❌ NOT in sessionStorage
  - [ ] ❌ NOT in client-side cookies
  - [ ] ✅ Encrypted in database
  - [ ] ✅ httpOnly cookies for session
  - [ ] ✅ Secure server memory cache

- [ ] **PKCE implementation**
  - [ ] Code verifier generation
  - [ ] Code challenge calculation (SHA-256)
  - [ ] Challenge sent in auth URL
  - [ ] Verifier sent in token exchange

- [ ] **State validation**
  - [ ] Cryptographically random generation
  - [ ] Stored with expiry (10 minutes)
  - [ ] Validated on callback
  - [ ] One-time use (deleted after validation)

- [ ] **Origin validation**
  - [ ] postMessage origin check in callback
  - [ ] CORS configured on backend
  - [ ] Whitelist only your domain

- [ ] **Session security**
  - [ ] httpOnly flag enabled
  - [ ] secure flag enabled (production)
  - [ ] sameSite=lax or strict
  - [ ] Reasonable maxAge (7 days max)

- [ ] **Token encryption**
  - [ ] AES-256-GCM algorithm
  - [ ] Unique IV per encryption
  - [ ] Auth tag validation
  - [ ] Secure key storage

### UI/UX Implementation

- [ ] **Connection flow**
  - [ ] "Connect YouTube" button visible when not connected
  - [ ] Button opens centered popup (600x700)
  - [ ] Loading state during connection
  - [ ] Success toast on connection
  - [ ] Error toast on failure

- [ ] **Skeleton loaders**
  - [ ] Video grid skeleton during fetch
  - [ ] Channel header skeleton
  - [ ] Shimmer animation effect
  - [ ] Responsive grid layout

- [ ] **Video selection**
  - [ ] Grid layout with thumbnails
  - [ ] Selection indicator (checkmark)
  - [ ] Selected count display
  - [ ] 30 video limit enforcement
  - [ ] Deselection support

- [ ] **Error states**
  - [ ] Popup blocked message
  - [ ] Connection failed message
  - [ ] Timeout message
  - [ ] No videos found state
  - [ ] Network error handling

- [ ] **Connected state**
  - [ ] Channel info display
  - [ ] Connected badge
  - [ ] Subscriber count
  - [ ] Video count
  - [ ] Disconnect option

### Testing

#### Manual Testing

- [ ] **Happy path**
  - [ ] Click "Connect YouTube" → popup opens
  - [ ] Main window stays on page (no navigation)
  - [ ] Authorize in popup
  - [ ] Popup closes automatically
  - [ ] Success toast appears
  - [ ] Videos load without page reload
  - [ ] Skeleton loaders show during load
  - [ ] Can select/deselect videos
  - [ ] Can publish videos

- [ ] **Error scenarios**
  - [ ] User closes popup → cancellation message
  - [ ] Popup blocked → helpful error with instructions
  - [ ] User denies consent → error toast shown
  - [ ] Network error during init → error message
  - [ ] Network error during exchange → error message
  - [ ] Invalid state → clear error message
  - [ ] Expired state → user can retry
  - [ ] Timeout (60s) → timeout message

- [ ] **Edge cases**
  - [ ] Multiple rapid clicks on connect button
  - [ ] Popup already open when clicking again
  - [ ] Browser back button during process
  - [ ] Page refresh during popup open
  - [ ] Multiple tabs with same app open

#### Security Testing

- [ ] **Client-side**
  - [ ] No tokens in localStorage (check devtools)
  - [ ] No tokens in sessionStorage (check devtools)
  - [ ] No tokens in client cookies (check devtools)
  - [ ] No tokens in React state (check React devtools)
  - [ ] No tokens in network response bodies

- [ ] **Server-side**
  - [ ] Tokens encrypted in database
  - [ ] Session cookies have httpOnly flag
  - [ ] Session cookies have secure flag (prod)
  - [ ] State validation rejects invalid states
  - [ ] State validation rejects expired states
  - [ ] PKCE verifier required for exchange

- [ ] **Network**
  - [ ] HTTPS enforced in production
  - [ ] CORS configured correctly
  - [ ] No sensitive data in URLs
  - [ ] No sensitive data in logs

#### Automated Testing

- [ ] **Unit tests**
  - [ ] useYouTubeConnect hook tests
  - [ ] API client function tests
  - [ ] Encryption/decryption tests
  - [ ] PKCE generation tests
  - [ ] State validation tests

- [ ] **Integration tests**
  - [ ] Full OAuth flow (mocked)
  - [ ] postMessage communication
  - [ ] React Query cache invalidation
  - [ ] Error handling flows

- [ ] **E2E tests**
  - [ ] Complete user journey
  - [ ] Popup opening and closing
  - [ ] Video fetching and display
  - [ ] Error scenarios

### Performance

- [ ] **React Query optimization**
  - [ ] Appropriate staleTime values
  - [ ] Appropriate cacheTime values
  - [ ] Selective refetching configured
  - [ ] Query keys structured correctly

- [ ] **API optimization**
  - [ ] Pagination implemented
  - [ ] Reasonable page sizes (20-50 items)
  - [ ] Caching headers set
  - [ ] Rate limiting configured

- [ ] **Frontend optimization**
  - [ ] Lazy loading for video grid
  - [ ] Image optimization (thumbnails)
  - [ ] Code splitting
  - [ ] Bundle size monitoring

### Deployment

- [ ] **Environment setup**
  - [ ] Production environment variables set
  - [ ] SSL certificate installed
  - [ ] Domain configured
  - [ ] HTTPS enforced

- [ ] **Database**
  - [ ] Migrations run
  - [ ] Indexes created
  - [ ] Backup configured
  - [ ] Connection pooling setup

- [ ] **Monitoring**
  - [ ] Error tracking (Sentry, etc.)
  - [ ] Performance monitoring
  - [ ] API quota monitoring (YouTube)
  - [ ] Token refresh success rate

- [ ] **Logging**
  - [ ] OAuth flow logging (no tokens)
  - [ ] API call logging
  - [ ] Error logging
  - [ ] Audit trail for token operations

### Documentation

- [ ] **User documentation**
  - [ ] How to connect YouTube
  - [ ] Privacy policy updated
  - [ ] Terms of service updated
  - [ ] FAQ section

- [ ] **Developer documentation**
  - [ ] API endpoint docs
  - [ ] Setup instructions
  - [ ] Architecture overview
  - [ ] Security notes

### Maintenance

- [ ] **Monitoring alerts**
  - [ ] High error rate alert
  - [ ] Token refresh failures
  - [ ] API quota warnings
  - [ ] Database connection issues

- [ ] **Regular tasks**
  - [ ] Review OAuth logs weekly
  - [ ] Monitor API quota usage
  - [ ] Check token expiry patterns
  - [ ] Review security practices

- [ ] **Updates**
  - [ ] Keep googleapis package updated
  - [ ] Monitor Google OAuth changes
  - [ ] Review YouTube API changelog
  - [ ] Update dependencies regularly

## 📋 Pre-Launch Checklist

### Critical Items

- [ ] All security items ✅
- [ ] Production environment variables set
- [ ] HTTPS enforced
- [ ] Error handling tested
- [ ] Session management working
- [ ] Token encryption verified
- [ ] CORS configured
- [ ] Rate limiting enabled

### Nice to Have

- [ ] Analytics tracking
- [ ] A/B testing setup
- [ ] Feature flags
- [ ] Rollback plan
- [ ] Load testing
- [ ] Stress testing

## 🚀 Post-Launch Checklist

- [ ] Monitor error rates (first 24 hours)
- [ ] Check OAuth success rate
- [ ] Verify token refresh working
- [ ] Monitor API quota usage
- [ ] Collect user feedback
- [ ] Review security logs
- [ ] Performance metrics baseline

## 📚 Resources

- [SEAMLESS_YOUTUBE_OAUTH_GUIDE.md](./SEAMLESS_YOUTUBE_OAUTH_GUIDE.md) - Complete implementation guide
- [YOUTUBE_OAUTH_BACKEND.md](./YOUTUBE_OAUTH_BACKEND.md) - Backend code examples
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [PKCE RFC](https://datatracker.ietf.org/doc/html/rfc7636)

---

**Last Updated:** 2025-01-15

**Generated with Claude Code**
