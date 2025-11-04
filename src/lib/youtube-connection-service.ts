/**
 * YouTube Connection Service
 *
 * Handles OPTIONAL YouTube channel connection for Google-authenticated users.
 * This service allows users to link their YouTube channel to their existing
 * WIZXP account after they've already logged in with Google Auth.
 *
 * Key Features:
 * - Link YouTube channel to existing user account
 * - Store YouTube tokens separately from Google auth tokens
 * - Sync YouTube channel data (subscribers, videos, analytics)
 * - Refresh YouTube tokens automatically
 * - Disconnect YouTube without affecting Google login
 *
 * Usage:
 * - User Profile: Optional "Connect YouTube" button
 * - Creator Profile: Optional "Sync YouTube Channel" button
 * - Create Tab: Optional "Connect to upload" button
 */

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  OAuthCredential,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, youtubeAuthProvider, db } from './firebase';
import { youTubeAPI } from './youtube-api';
import { isYouTubeAPIEnabled } from './feature-flags';

export interface YouTubeConnectionStatus {
  connected: boolean;
  channelId?: string;
  channelTitle?: string;
  subscriberCount?: string;
  lastSynced?: Date;
  tokenExpiry?: Date;
}

export interface YouTubeTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string;
}

export class YouTubeConnectionService {

  /**
   * Connect YouTube channel to existing authenticated user
   * Opens OAuth flow to request YouTube readonly permission
   *
   * @param userId - The current authenticated user's UID
   * @param usePopup - Whether to use popup (true) or redirect (false) flow
   * @returns Promise<boolean> - Success status
   */
  static async connectYouTubeChannel(
    userId: string,
    usePopup: boolean = false
  ): Promise<boolean> {
    if (!isYouTubeAPIEnabled()) {
      console.warn('⚠️ YouTube API is disabled');
      return false;
    }

    try {
      console.log('🎬 Initiating YouTube connection for user:', userId, 'using', usePopup ? 'POPUP' : 'REDIRECT');

      // Store connection attempt metadata
      localStorage.setItem('wizxp_youtube_connect', 'true');
      localStorage.setItem('wizxp_connecting_user_id', userId);
      localStorage.setItem('wizxp_redirect_url', window.location.pathname + window.location.search);

      if (usePopup) {
        // ✅ Popup flow - instant, seamless (no page reload)
        console.log('🚀 Opening YouTube OAuth popup...');
        const result = await signInWithPopup(auth, youtubeAuthProvider);
        console.log('✅ Popup returned successfully');

        const success = await this.handleYouTubeAuthResult(result, userId);

        // Clean up flags on success
        if (success) {
          localStorage.removeItem('wizxp_youtube_connect');
          localStorage.removeItem('wizxp_connecting_user_id');
          localStorage.removeItem('wizxp_redirect_url');
        }

        return success;
      } else {
        // Redirect flow - fallback for popup blockers
        console.log('🔄 Using redirect flow (fallback)');
        await signInWithRedirect(auth, youtubeAuthProvider);
        // Result will be handled in useAuth hook's handleRedirectResult
        return true;
      }
    } catch (error: any) {
      console.error('❌ YouTube connection failed:', error);

      // Clean up flags on error
      localStorage.removeItem('wizxp_youtube_connect');
      localStorage.removeItem('wizxp_connecting_user_id');

      // If popup was blocked, provide helpful message
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site and try again.');
      }
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Connection cancelled. Please try again.');
      }

      throw error;
    }
  }

  /**
   * Handle YouTube OAuth result and store tokens
   * Called after successful YouTube authentication
   *
   * @param result - OAuth result from Firebase
   * @param userId - User ID to link YouTube data to
   * @returns Promise<boolean> - Success status
   */
  private static async handleYouTubeAuthResult(
    result: any,
    userId: string
  ): Promise<boolean> {
    try {
      // Get credential using GoogleAuthProvider.credentialFromResult
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        console.error('❌ No access token in YouTube auth result');
        console.log('📋 Result structure:', {
          hasCredential: !!credential,
          hasUser: !!result.user,
          credentialType: credential?.providerId,
          scopes: credential ? Object.keys(credential) : []
        });
        return false;
      }

      console.log('✅ Got YouTube access token');

      // Store YouTube tokens separately
      await this.storeYouTubeTokens(userId, {
        accessToken,
        refreshToken: (credential as any).refreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        scope: credential.providerId || 'youtube.readonly'
      });

      // Set access token on YouTube API instance before fetching channel data
      youTubeAPI.setAccessToken(accessToken, undefined, Date.now() + 3600 * 1000);

      // Fetch and store YouTube channel data
      const channelInfo = await youTubeAPI.getChannelInfo();

      if (channelInfo) {
        await this.storeYouTubeChannelData(userId, channelInfo, accessToken);
        console.log('✅ YouTube channel connected:', channelInfo.name);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error handling YouTube auth result:', error);
      return false;
    }
  }

  /**
   * Store YouTube tokens in Firestore and localStorage
   * Keeps tokens separate from Google auth tokens
   *
   * @param userId - User ID
   * @param tokens - YouTube OAuth tokens
   */
  private static async storeYouTubeTokens(
    userId: string,
    tokens: YouTubeTokens
  ): Promise<void> {
    try {
      // Store in Firestore (encrypted on server)
      await updateDoc(doc(db, 'users', userId), {
        youtubeTokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || null,
          expiresAt: tokens.expiresAt,
          scope: tokens.scope,
          lastUpdated: new Date()
        }
      });

      // Store access token in localStorage for API calls
      localStorage.setItem('youtube_access_token', tokens.accessToken);
      localStorage.setItem('youtube_token_expiry', tokens.expiresAt.toISOString());

      console.log('💾 YouTube tokens stored successfully');
    } catch (error) {
      console.error('❌ Failed to store YouTube tokens:', error);
      throw error;
    }
  }

  /**
   * Store YouTube channel data in user's Firestore document
   * Links YouTube profile to existing Google account
   *
   * @param userId - User ID
   * @param channelInfo - Channel data from YouTube API
   * @param accessToken - YouTube access token
   */
  private static async storeYouTubeChannelData(
    userId: string,
    channelInfo: any,
    accessToken: string
  ): Promise<void> {
    try {
      const youtubeProfile = {
        channelId: channelInfo.id,
        channelTitle: channelInfo.name,
        description: channelInfo.description || '',
        thumbnailUrl: channelInfo.avatar || '',
        subscriberCount: channelInfo.subscriberCount || '0',
        customUrl: channelInfo.customUrl || '',
        bannerImageUrl: channelInfo.bannerImageUrl || '',
        lastSynced: new Date(),
      };

      // Update YouTube profile data and avatar, but preserve WIZUP username
      await updateDoc(doc(db, 'users', userId), {
        youtubeConnected: true,
        youtubeProfile,
        youtubeAccessToken: accessToken,
        lastYouTubeSync: new Date(),
        // Update photoURL with YouTube avatar (users want their YouTube profile pic shown)
        photoURL: channelInfo.avatar || '',
        // Note: We deliberately do NOT update displayName or username here
        // to preserve the user's WIZUP identity
      });

      console.log('💾 YouTube channel data stored (preserved WIZUP username)');
    } catch (error) {
      console.error('❌ Failed to store YouTube channel data:', error);
      throw error;
    }
  }

  /**
   * Get current YouTube connection status for a user
   *
   * @param userId - User ID to check
   * @returns Promise<YouTubeConnectionStatus>
   */
  static async getConnectionStatus(
    userId: string
  ): Promise<YouTubeConnectionStatus> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      if (!userData?.youtubeConnected) {
        return { connected: false };
      }

      return {
        connected: true,
        channelId: userData.youtubeProfile?.channelId,
        channelTitle: userData.youtubeProfile?.channelTitle,
        subscriberCount: userData.youtubeProfile?.subscriberCount,
        lastSynced: userData.youtubeProfile?.lastSynced?.toDate(),
        tokenExpiry: userData.youtubeTokens?.expiresAt?.toDate()
      };
    } catch (error) {
      console.error('❌ Error getting YouTube connection status:', error);
      return { connected: false };
    }
  }

  /**
   * Disconnect YouTube from user account
   * Removes YouTube tokens and data but keeps Google auth intact
   *
   * @param userId - User ID
   * @returns Promise<boolean> - Success status
   */
  static async disconnectYouTube(userId: string): Promise<boolean> {
    try {
      console.log('🔌 Disconnecting YouTube for user:', userId);

      // Remove YouTube data from Firestore
      await updateDoc(doc(db, 'users', userId), {
        youtubeConnected: false,
        youtubeProfile: null,
        youtubeTokens: null,
        youtubeAccessToken: null,
        lastYouTubeSync: null
      });

      // Remove from localStorage
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('youtube_token_expiry');

      console.log('✅ YouTube disconnected successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to disconnect YouTube:', error);
      return false;
    }
  }

  /**
   * Refresh YouTube access token using refresh token
   * Called automatically when token is about to expire
   *
   * @param userId - User ID
   * @returns Promise<string | null> - New access token or null if failed
   */
  static async refreshYouTubeToken(userId: string): Promise<string | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      const refreshToken = userData?.youtubeTokens?.refreshToken;

      if (!refreshToken) {
        console.warn('⚠️ No refresh token available');
        return null;
      }

      // Call Cloud Function to refresh token (keeps client_secret secure)
      const response = await fetch(
        'https://us-central1-wiz-magic-platform.cloudfunctions.net/refreshYouTubeToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, refreshToken })
        }
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { accessToken, expiresAt } = await response.json();

      // Update stored tokens
      await this.storeYouTubeTokens(userId, {
        accessToken,
        refreshToken,
        expiresAt: new Date(expiresAt),
        scope: 'youtube.readonly'
      });

      console.log('✅ YouTube token refreshed');
      return accessToken;
    } catch (error) {
      console.error('❌ Failed to refresh YouTube token:', error);
      return null;
    }
  }

  /**
   * Check if YouTube token needs refresh
   * Returns true if token expires in less than 5 minutes
   *
   * @param userId - User ID
   * @returns Promise<boolean>
   */
  static async needsTokenRefresh(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      const expiresAt = userData?.youtubeTokens?.expiresAt?.toDate();

      if (!expiresAt) return false;

      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      return expiresAt < fiveMinutesFromNow;
    } catch (error) {
      console.error('❌ Error checking token expiry:', error);
      return false;
    }
  }

  /**
   * Get valid YouTube access token
   * Automatically refreshes if needed
   *
   * @param userId - User ID
   * @returns Promise<string | null> - Valid access token or null
   */
  static async getValidAccessToken(userId: string): Promise<string | null> {
    try {
      // Check if needs refresh
      const needsRefresh = await this.needsTokenRefresh(userId);

      if (needsRefresh) {
        console.log('🔄 YouTube token needs refresh');
        return await this.refreshYouTubeToken(userId);
      }

      // Get current token
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      return userData?.youtubeTokens?.accessToken || null;
    } catch (error) {
      console.error('❌ Error getting valid access token:', error);
      return null;
    }
  }
}

export default YouTubeConnectionService;
