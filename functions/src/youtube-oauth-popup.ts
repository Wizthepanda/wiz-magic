/**
 * YouTube OAuth Popup Flow Functions
 *
 * Seamless popup-based OAuth with PKCE and state validation.
 * These functions support the popup flow with no page redirects.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

// In-memory cache for state (use Firestore for production across instances)
const stateCache = new Map<string, {
  userId: string;
  codeVerifier: string;
  expiresAt: number;
}>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateCache.entries()) {
    if (data.expiresAt < now) {
      stateCache.delete(state);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate PKCE code verifier and challenge
 */
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * POST /api/oauth/youtube/init
 *
 * Initialize OAuth flow - generate state, PKCE, and return Google OAuth URL
 */
export const initializeYouTubeOAuth = onRequest({
  cors: true,
  region: 'us-central1',
}, async (request, response) => {
  // CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  try {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Get user ID from request (you may want to verify auth token here)
    const userId = request.body.userId || 'anonymous';

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Generate PKCE
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Store state with 10-minute expiry
    stateCache.set(state, {
      userId,
      codeVerifier,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log('📋 OAuth init - State generated:', state.substring(0, 8) + '...');

    // Get environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.OAUTH_REDIRECT_URI || `${process.env.APP_URL || 'https://wizxp.com'}/oauth-callback.html`;

    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID not configured');
    }

    // Build Google OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    response.json({
      url: authUrl.toString(),
      state,
    });

  } catch (error) {
    console.error('❌ OAuth init error:', error);
    response.status(500).json({
      error: 'Failed to initialize OAuth',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/oauth/youtube/exchange
 *
 * Exchange authorization code for tokens
 */
export const exchangeYouTubeCode = onRequest({
  cors: true,
  region: 'us-central1',
}, async (request, response) => {
  // CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  try {
    if (request.method !== 'POST') {
      response.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { code, state } = request.body;

    if (!code || !state) {
      response.status(400).json({ error: 'Missing code or state' });
      return;
    }

    console.log('🔍 Validating state:', state.substring(0, 8) + '...');

    // Validate state
    const stateData = stateCache.get(state);
    if (!stateData) {
      response.status(400).json({ error: 'Invalid or expired state' });
      return;
    }

    if (stateData.expiresAt < Date.now()) {
      stateCache.delete(state);
      response.status(400).json({ error: 'State expired' });
      return;
    }

    // Remove state from cache (one-time use)
    stateCache.delete(state);

    console.log('✅ State validated, exchanging code for tokens...');

    // Exchange code for tokens with PKCE verifier
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.OAUTH_REDIRECT_URI || `${process.env.APP_URL || 'https://wizxp.com'}/oauth-callback.html`;

    if (!clientId || !clientSecret) {
      throw new Error('OAuth credentials not configured');
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: stateData.codeVerifier, // PKCE
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorText);
      response.status(400).json({
        success: false,
        error: 'Token exchange failed',
        details: errorText,
      });
      return;
    }

    const tokens = await tokenResponse.json();

    console.log('✅ Tokens received, fetching channel info...');

    // Fetch YouTube channel info
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!channelResponse.ok) {
      console.error('❌ Failed to fetch channel info');
      response.status(400).json({
        success: false,
        error: 'Failed to fetch channel info',
      });
      return;
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    if (!channel) {
      response.status(404).json({
        success: false,
        error: 'No YouTube channel found',
      });
      return;
    }

    console.log('✅ Channel info fetched:', channel.snippet.title);

    // Format subscriber count
    const subscriberCount = parseInt(channel.statistics.subscriberCount);
    let formattedSubs = subscriberCount.toString();
    if (subscriberCount >= 1000000) {
      formattedSubs = (subscriberCount / 1000000).toFixed(1) + 'M';
    } else if (subscriberCount >= 1000) {
      formattedSubs = (subscriberCount / 1000).toFixed(1) + 'K';
    }

    // Store tokens in Firestore (you should encrypt these in production)
    const db = getFirestore();
    const userId = stateData.userId;

    await db.collection('youtubeTokens').doc(userId).set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      scope: tokens.scope,
      channelId: channel.id,
      channelTitle: channel.snippet.title,
      channelAvatar: channel.snippet.thumbnails.default.url,
      subscriberCount: formattedSubs,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Update user document
    await db.collection('users').doc(userId).update({
      youtubeConnected: true,
      youtubeChannelId: channel.id,
      youtubeProfile: {
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        thumbnailUrl: channel.snippet.thumbnails.default.url,
        subscriberCount: formattedSubs,
        bannerImageUrl: channel.snippet.thumbnails.high?.url || '',
        lastSynced: new Date(),
      },
    });

    console.log('💾 Tokens and channel data stored');

    response.json({
      success: true,
      channelId: channel.id,
      channelTitle: channel.snippet.title,
      channelAvatar: channel.snippet.thumbnails.default.url,
      subscriberCount: formattedSubs,
    });

  } catch (error) {
    console.error('❌ Exchange error:', error);
    response.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/youtube/videos
 *
 * Fetch user's YouTube videos (server-side)
 */
export const fetchYouTubeVideos = onRequest({
  cors: true,
  region: 'us-central1',
}, async (request, response) => {
  // CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  try {
    if (request.method !== 'GET') {
      response.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Get user ID from query or auth (implement your auth check)
    const userId = request.query.userId as string || 'anonymous';
    const maxResults = Math.min(parseInt(request.query.maxResults as string) || 50, 50);
    const pageToken = request.query.pageToken as string;

    // Get stored tokens
    const db = getFirestore();
    const tokenDoc = await db.collection('youtubeTokens').doc(userId).get();

    if (!tokenDoc.exists) {
      response.status(401).json({ error: 'YouTube not connected' });
      return;
    }

    const tokenData = tokenDoc.data()!;
    const accessToken = tokenData.accessToken;

    // Get uploads playlist ID
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!channelResponse.ok) {
      response.status(401).json({ error: 'Failed to fetch channel' });
      return;
    }

    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      response.json({ videos: [], totalResults: 0 });
      return;
    }

    // Fetch videos from uploads playlist
    const playlistUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    playlistUrl.searchParams.set('part', 'snippet,contentDetails');
    playlistUrl.searchParams.set('playlistId', uploadsPlaylistId);
    playlistUrl.searchParams.set('maxResults', maxResults.toString());
    if (pageToken) playlistUrl.searchParams.set('pageToken', pageToken);

    const playlistResponse = await fetch(playlistUrl.toString(), {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!playlistResponse.ok) {
      response.status(500).json({ error: 'Failed to fetch videos' });
      return;
    }

    const playlistData = await playlistResponse.json();
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId);

    // Get video details
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'snippet,contentDetails,statistics');
    videosUrl.searchParams.set('id', videoIds.join(','));

    const videosResponse = await fetch(videosUrl.toString(), {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!videosResponse.ok) {
      response.status(500).json({ error: 'Failed to fetch video details' });
      return;
    }

    const videosData = await videosResponse.json();

    const videos = videosData.items.map((video: any) => ({
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
      tags: video.snippet.tags || [],
      categoryId: video.snippet.categoryId,
    }));

    response.json({
      videos,
      nextPageToken: playlistData.nextPageToken,
      totalResults: playlistData.pageInfo.totalResults,
    });

  } catch (error) {
    console.error('❌ Fetch videos error:', error);
    response.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/youtube/status
 *
 * Check YouTube connection status
 */
export const checkYouTubeStatus = onRequest({
  cors: true,
  region: 'us-central1',
}, async (request, response) => {
  // CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  try {
    const userId = request.query.userId as string || 'anonymous';

    const db = getFirestore();
    const tokenDoc = await db.collection('youtubeTokens').doc(userId).get();

    if (!tokenDoc.exists) {
      response.json({ connected: false });
      return;
    }

    const data = tokenDoc.data()!;

    response.json({
      connected: true,
      channelId: data.channelId,
      channelTitle: data.channelTitle,
      channelAvatar: data.channelAvatar,
      subscriberCount: data.subscriberCount,
      lastSynced: data.updatedAt?.toDate().toISOString(),
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});
