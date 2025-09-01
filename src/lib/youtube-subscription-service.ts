// YouTube Subscription Service
// Handles subscribing to YouTube channels and tracking subscription state

import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { youTubeAPI } from './youtube-api';
import { isYouTubeAPIEnabled, logFeatureFlag } from './feature-flags';

export interface SubscriptionResult {
  success: boolean;
  alreadySubscribed?: boolean;
  error?: string;
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
  subscriptionId?: string;
  subscribedAt?: Date;
}

export class YouTubeSubscriptionService {
  /**
   * Subscribe to a YouTube channel
   */
  static async subscribeToChannel(
    userId: string, 
    channelId: string, 
    accessToken?: string
  ): Promise<SubscriptionResult> {
    if (!isYouTubeAPIEnabled()) {
      logFeatureFlag('YouTube Subscription', false, 'API disabled');
      return { success: false, error: 'YouTube API disabled' };
    }

    try {
      // Set access token if provided
      if (accessToken) {
        youTubeAPI.setAccessToken(accessToken);
      }

      if (!youTubeAPI.isAuthenticated()) {
        return { success: false, error: 'No YouTube access token available' };
      }

      // Check if already subscribed to avoid duplicate API calls
      const currentStatus = await this.getSubscriptionStatus(userId, channelId);
      if (currentStatus.isSubscribed) {
        console.log(`User ${userId} already subscribed to channel ${channelId}`);
        return { success: true, alreadySubscribed: true };
      }

      console.log(`🔔 Subscribing user ${userId} to YouTube channel ${channelId}...`);

      // Subscribe via YouTube API
      const subscribeSuccess = await youTubeAPI.subscribeToChannel(channelId);
      
      if (!subscribeSuccess) {
        return { success: false, error: 'YouTube subscription failed' };
      }

      // Record subscription in Firestore for quick lookup
      const subscriptionId = `${userId}_${channelId}`;
      await setDoc(doc(db, 'youtubeSubscriptions', subscriptionId), {
        userId,
        channelId,
        subscribedAt: new Date(),
        source: 'wiz_platform',
        active: true,
      });

      // Also update user's subscribed channels array for easy querying
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      const currentSubscriptions = userData?.youtubeSubscriptions || [];
      if (!currentSubscriptions.includes(channelId)) {
        await updateDoc(userDocRef, {
          youtubeSubscriptions: [...currentSubscriptions, channelId],
        });
      }

      console.log(`✅ Successfully subscribed user ${userId} to channel ${channelId}`);
      
      return { success: true };

    } catch (error) {
      console.error(`❌ Error subscribing to channel ${channelId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check subscription status for a specific channel
   */
  static async getSubscriptionStatus(
    userId: string, 
    channelId: string
  ): Promise<SubscriptionStatus> {
    try {
      // First check our local records for performance
      const subscriptionId = `${userId}_${channelId}`;
      const subscriptionDoc = await getDoc(doc(db, 'youtubeSubscriptions', subscriptionId));
      
      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        if (data.active) {
          return {
            isSubscribed: true,
            subscriptionId,
            subscribedAt: data.subscribedAt?.toDate(),
          };
        }
      }

      // If not in local records and YouTube API is enabled, check with YouTube directly
      if (isYouTubeAPIEnabled() && youTubeAPI.isAuthenticated()) {
        const isSubscribedOnYT = await youTubeAPI.checkSubscription(channelId);
        
        if (isSubscribedOnYT) {
          // Update our local records
          await setDoc(doc(db, 'youtubeSubscriptions', subscriptionId), {
            userId,
            channelId,
            subscribedAt: new Date(),
            source: 'youtube_direct',
            active: true,
          }, { merge: true });
          
          return {
            isSubscribed: true,
            subscriptionId,
            subscribedAt: new Date(),
          };
        }
      }

      return { isSubscribed: false };

    } catch (error) {
      console.error(`Error checking subscription status for ${channelId}:`, error);
      return { isSubscribed: false };
    }
  }

  /**
   * Get all subscriptions for a user
   */
  static async getUserSubscriptions(userId: string): Promise<string[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      return userData?.youtubeSubscriptions || [];
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  }

  /**
   * Sync user's YouTube subscriptions (called after auth)
   */
  static async syncUserSubscriptions(
    userId: string, 
    accessToken?: string
  ): Promise<{ synced: number; error?: string }> {
    if (!isYouTubeAPIEnabled()) {
      return { synced: 0, error: 'YouTube API disabled' };
    }

    try {
      // Set access token if provided
      if (accessToken) {
        youTubeAPI.setAccessToken(accessToken);
      }

      if (!youTubeAPI.isAuthenticated()) {
        return { synced: 0, error: 'No access token' };
      }

      console.log(`🔄 Syncing YouTube subscriptions for user ${userId}...`);

      // Fetch user's YouTube subscriptions via API
      // Note: This would require additional YouTube API endpoint
      // For now, we'll focus on the subscription flow from WIZ UI

      return { synced: 0 };

    } catch (error) {
      console.error(`Error syncing subscriptions for ${userId}:`, error);
      return { synced: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Unsubscribe from a YouTube channel (if needed)
   */
  static async unsubscribeFromChannel(
    userId: string,
    channelId: string,
    accessToken?: string
  ): Promise<SubscriptionResult> {
    if (!isYouTubeAPIEnabled()) {
      return { success: false, error: 'YouTube API disabled' };
    }

    try {
      // Set access token if provided
      if (accessToken) {
        youTubeAPI.setAccessToken(accessToken);
      }

      // Mark as inactive in our records
      const subscriptionId = `${userId}_${channelId}`;
      await setDoc(doc(db, 'youtubeSubscriptions', subscriptionId), {
        active: false,
        unsubscribedAt: new Date(),
      }, { merge: true });

      // Remove from user's subscription list
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      const currentSubscriptions = userData?.youtubeSubscriptions || [];
      const updatedSubscriptions = currentSubscriptions.filter((id: string) => id !== channelId);
      
      await updateDoc(userDocRef, {
        youtubeSubscriptions: updatedSubscriptions,
      });

      console.log(`✅ Unsubscribed user ${userId} from channel ${channelId}`);
      
      return { success: true };

    } catch (error) {
      console.error(`Error unsubscribing from channel ${channelId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if user has subscription permissions
   */
  static async hasSubscriptionPermissions(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      return userData?.youtubeConnected && youTubeAPI.isAuthenticated();
    } catch (error) {
      console.error('Error checking subscription permissions:', error);
      return false;
    }
  }
}