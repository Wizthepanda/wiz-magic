// YouTube Profile Synchronization Service
// Handles daily syncing of YouTube profile data to keep WIZ profiles up-to-date

import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { youTubeAPI } from './youtube-api';
import { isYouTubeAPIEnabled, logFeatureFlag } from './feature-flags';

export interface YouTubeProfileSyncResult {
  success: boolean;
  updatedFields: string[];
  error?: string;
}

export class YouTubeProfileSyncService {
  /**
   * Sync YouTube profile data for a specific user
   */
  static async syncUserProfile(userId: string, accessToken?: string): Promise<YouTubeProfileSyncResult> {
    if (!isYouTubeAPIEnabled()) {
      logFeatureFlag('YouTube Profile Sync', false, 'API disabled');
      return { success: false, updatedFields: [], error: 'YouTube API disabled' };
    }

    try {
      // Get user document
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      if (!userData?.youtubeConnected) {
        return { success: false, updatedFields: [], error: 'User not connected to YouTube' };
      }

      // Check if sync is needed (only sync once per day)
      const lastSynced = userData.youtubeProfile?.lastSynced?.toDate();
      const now = new Date();
      const daysSinceSync = lastSynced ? Math.floor((now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      if (daysSinceSync < 1) {
        console.log(`⏭️ Skipping sync for user ${userId} - already synced today`);
        return { success: true, updatedFields: [], error: 'Already synced today' };
      }

      // Set access token if provided
      if (accessToken) {
        youTubeAPI.setAccessToken(accessToken);
      }

      if (!youTubeAPI.isAuthenticated()) {
        return { success: false, updatedFields: [], error: 'No YouTube access token available' };
      }

      console.log(`🔄 Syncing YouTube profile for user ${userId}...`);

      // Fetch current channel information
      const channelInfo = await youTubeAPI.getChannelInfo();
      
      // Compare with existing data to track what changed
      const existingProfile = userData.youtubeProfile;
      const updatedFields: string[] = [];
      
      const newProfile = {
        channelId: channelInfo.id,
        channelTitle: channelInfo.name,
        description: channelInfo.description || '',
        thumbnailUrl: channelInfo.avatar,
        subscriberCount: channelInfo.subscriberCount,
        customUrl: channelInfo.customUrl,
        bannerImageUrl: channelInfo.bannerImageUrl,
        lastSynced: new Date(),
      };

      // Track what changed
      if (!existingProfile || existingProfile.channelTitle !== newProfile.channelTitle) {
        updatedFields.push('channelTitle');
      }
      if (!existingProfile || existingProfile.description !== newProfile.description) {
        updatedFields.push('description');
      }
      if (!existingProfile || existingProfile.thumbnailUrl !== newProfile.thumbnailUrl) {
        updatedFields.push('thumbnailUrl');
      }
      if (!existingProfile || existingProfile.subscriberCount !== newProfile.subscriberCount) {
        updatedFields.push('subscriberCount');
      }
      if (!existingProfile || existingProfile.bannerImageUrl !== newProfile.bannerImageUrl) {
        updatedFields.push('bannerImageUrl');
      }

      // Prepare update data - only update WIZ-compatible fields, don't overwrite native WIZ data
      const updateData: Record<string, unknown> = {
        youtubeProfile: newProfile,
      };

      // ALWAYS update photoURL with YouTube avatar (users want their YouTube profile pic)
        updateData.photoURL = newProfile.thumbnailUrl;
        updatedFields.push('photoURL');

      // NEVER update displayName - keep WIZUP username if user has set one
      // The UI will show: username (if set) || displayName || YouTube channel name
      // This preserves user identity while showing YouTube avatar
      console.log('✨ Preserving WIZUP username, updating YouTube avatar only');

      // Update user document
      await updateDoc(doc(db, 'users', userId), updateData);

      console.log(`✅ YouTube profile synced for user ${userId}:`, updatedFields);

      return {
        success: true,
        updatedFields,
      };

    } catch (error) {
      console.error(`❌ Failed to sync YouTube profile for user ${userId}:`, error);
      return {
        success: false,
        updatedFields: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Sync YouTube profiles for all connected users (for scheduled jobs)
   */
  static async syncAllConnectedUsers(): Promise<{ total: number; successful: number; failed: number }> {
    if (!isYouTubeAPIEnabled()) {
      logFeatureFlag('Bulk YouTube Profile Sync', false, 'API disabled');
      return { total: 0, successful: 0, failed: 0 };
    }

    try {
      console.log('🔄 Starting bulk YouTube profile sync...');

      // Get all users with YouTube connected
      const usersQuery = query(
        collection(db, 'users'), 
        where('youtubeConnected', '==', true)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const total = usersSnapshot.size;
      let successful = 0;
      let failed = 0;

      console.log(`📊 Found ${total} users with YouTube connected`);

      // Sync each user (with rate limiting to avoid API quotas)
      for (const userDoc of usersSnapshot.docs) {
        try {
          const result = await this.syncUserProfile(userDoc.id);
          if (result.success) {
            successful++;
            if (result.updatedFields.length > 0) {
              console.log(`✅ Synced ${userDoc.id}: ${result.updatedFields.join(', ')}`);
            }
          } else {
            failed++;
            console.warn(`⚠️ Failed to sync ${userDoc.id}: ${result.error}`);
          }
          
          // Rate limiting: wait 100ms between requests to respect API limits
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          failed++;
          console.error(`❌ Error syncing user ${userDoc.id}:`, error);
        }
      }

      console.log(`🎉 Bulk sync completed: ${successful}/${total} successful, ${failed} failed`);

      return { total, successful, failed };

    } catch (error) {
      console.error('❌ Error in bulk YouTube profile sync:', error);
      return { total: 0, successful: 0, failed: 0 };
    }
  }

  /**
   * Check if a user's profile needs syncing
   */
  static async needsSync(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      if (!userData?.youtubeConnected || !userData?.youtubeProfile) {
        return true; // Needs initial sync
      }

      const lastSynced = userData.youtubeProfile.lastSynced?.toDate();
      if (!lastSynced) {
        return true; // Never synced
      }

      const now = new Date();
      const daysSinceSync = Math.floor((now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysSinceSync >= 1; // Sync daily

    } catch (error) {
      console.error('Error checking sync status:', error);
      return true; // Err on the side of syncing
    }
  }
}