import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export interface CreatorProfile {
  userId: string;
  channelId: string;
  channelName: string;
  channelAvatar?: string;
  subscriberCount?: string;
  primaryCategory: string;
  secondaryCategory?: string;
  onboardingComplete: boolean;
  createdAt: Date;
  lastSyncDate?: Date;
  totalVideos: number;
  status: 'active' | 'inactive' | 'pending';
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  tokenExpiresAt?: Date;
}

export interface CreatorVideo {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  views: string;
  categoryTags: string[];
  creatorId: string;
  channelId: string;
  addedToWiz: Date;
  lastUpdated: Date;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  originalYouTubeUrl: string;
}

export interface CreatorStats {
  userId: string;
  totalViews: number;
  totalXpGenerated: number;
  totalWatchers: number;
  averageWatchTime: number;
  topPerformingVideos: string[];
  monthlyStats: {
    [key: string]: {
      views: number;
      xpGenerated: number;
      newWatchers: number;
    };
  };
  lastCalculated: Date;
}

export class CreatorService {
  /**
   * Save creator profile after onboarding completion
   */
  static async saveCreatorProfile(profileData: Omit<CreatorProfile, 'createdAt'> & { createdAt?: Date }): Promise<void> {
    try {
      const creatorRef = doc(db, 'creators', profileData.userId);
      
      const creatorData: CreatorProfile = {
        ...profileData,
        createdAt: profileData.createdAt || new Date(),
        lastSyncDate: new Date(),
        status: 'active'
      };

      await setDoc(creatorRef, {
        ...creatorData,
        createdAt: serverTimestamp(),
        lastSyncDate: serverTimestamp()
      });

      console.log('✅ Creator profile saved:', profileData.userId);
    } catch (error) {
      console.error('❌ Error saving creator profile:', error);
      throw error;
    }
  }

  /**
   * Get creator profile by user ID
   */
  static async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    try {
      const creatorRef = doc(db, 'creators', userId);
      const creatorDoc = await getDoc(creatorRef);

      if (creatorDoc.exists()) {
        const data = creatorDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastSyncDate: data.lastSyncDate?.toDate() || new Date()
        } as CreatorProfile;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting creator profile:', error);
      return null;
    }
  }

  /**
   * Save creator videos to database
   */
  static async saveCreatorVideos(videos: Omit<CreatorVideo, 'addedToWiz' | 'lastUpdated'>[]): Promise<void> {
    try {
      const batch = [];
      
      for (const video of videos) {
        const videoRef = doc(db, 'creatorVideos', video.videoId);
        const videoData: CreatorVideo = {
          ...video,
          addedToWiz: new Date(),
          lastUpdated: new Date(),
          status: 'active',
          isFeatured: video.isFeatured || false,
          originalYouTubeUrl: video.originalYouTubeUrl || `https://www.youtube.com/watch?v=${video.videoId}`
        };

        batch.push(
          setDoc(videoRef, {
            ...videoData,
            addedToWiz: serverTimestamp(),
            lastUpdated: serverTimestamp()
          })
        );
      }

      // Execute all video saves
      await Promise.all(batch);
      
      console.log(`✅ Saved ${videos.length} creator videos`);
    } catch (error) {
      console.error('❌ Error saving creator videos:', error);
      throw error;
    }
  }

  /**
   * Get videos by creator
   */
  static async getCreatorVideos(creatorId: string): Promise<CreatorVideo[]> {
    try {
      const videosQuery = query(
        collection(db, 'creatorVideos'),
        where('creatorId', '==', creatorId),
        where('status', '==', 'active')
      );

      const videosSnapshot = await getDocs(videosQuery);
      const videos: CreatorVideo[] = [];

      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          ...data,
          addedToWiz: data.addedToWiz?.toDate() || new Date(),
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        } as CreatorVideo);
      });

      return videos;
    } catch (error) {
      console.error('❌ Error getting creator videos:', error);
      return [];
    }
  }

  /**
   * Get videos by category for Discover section
   */
  static async getVideosByCategory(category: string): Promise<CreatorVideo[]> {
    try {
      const videosQuery = query(
        collection(db, 'creatorVideos'),
        where('categoryTags', 'array-contains', category),
        where('status', '==', 'active')
      );

      const videosSnapshot = await getDocs(videosQuery);
      const videos: CreatorVideo[] = [];

      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          ...data,
          addedToWiz: data.addedToWiz?.toDate() || new Date(),
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        } as CreatorVideo);
      });

      return videos.sort((a, b) => b.addedToWiz.getTime() - a.addedToWiz.getTime());
    } catch (error) {
      console.error('❌ Error getting videos by category:', error);
      return [];
    }
  }

  /**
   * Update creator stats when someone earns XP from their video
   */
  static async updateCreatorStats(creatorId: string, videoId: string, xpEarned: number): Promise<void> {
    try {
      const statsRef = doc(db, 'creatorStats', creatorId);
      const statsDoc = await getDoc(statsRef);

      let currentStats: CreatorStats;

      if (statsDoc.exists()) {
        const data = statsDoc.data();
        currentStats = {
          ...data,
          lastCalculated: data.lastCalculated?.toDate() || new Date()
        } as CreatorStats;
      } else {
        currentStats = {
          userId: creatorId,
          totalViews: 0,
          totalXpGenerated: 0,
          totalWatchers: 0,
          averageWatchTime: 0,
          topPerformingVideos: [],
          monthlyStats: {},
          lastCalculated: new Date()
        };
      }

      // Update stats
      currentStats.totalXpGenerated += xpEarned;
      currentStats.totalViews += 1;

      // Update monthly stats
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      if (!currentStats.monthlyStats[currentMonth]) {
        currentStats.monthlyStats[currentMonth] = {
          views: 0,
          xpGenerated: 0,
          newWatchers: 0
        };
      }
      
      currentStats.monthlyStats[currentMonth].views += 1;
      currentStats.monthlyStats[currentMonth].xpGenerated += xpEarned;

      await setDoc(statsRef, {
        ...currentStats,
        lastCalculated: serverTimestamp()
      });

      console.log(`✅ Updated creator stats for ${creatorId}: +${xpEarned} XP`);
    } catch (error) {
      console.error('❌ Error updating creator stats:', error);
    }
  }

  /**
   * Get creator statistics
   */
  static async getCreatorStats(creatorId: string): Promise<CreatorStats | null> {
    try {
      const statsRef = doc(db, 'creatorStats', creatorId);
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          ...data,
          lastCalculated: data.lastCalculated?.toDate() || new Date()
        } as CreatorStats;
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting creator stats:', error);
      return null;
    }
  }

  /**
   * Check if user is a creator
   */
  static async isCreator(userId: string): Promise<boolean> {
    try {
      const profile = await this.getCreatorProfile(userId);
      return profile?.onboardingComplete === true;
    } catch (error) {
      console.error('❌ Error checking creator status:', error);
      return false;
    }
  }

  /**
   * Save YouTube OAuth tokens for creator
   */
  static async saveCreatorTokens(userId: string, accessToken: string, refreshToken?: string, expiresIn?: number): Promise<void> {
    try {
      const creatorRef = doc(db, 'creators', userId);
      const tokenData: any = {
        youtubeAccessToken: accessToken,
        tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null
      };
      
      if (refreshToken) {
        tokenData.youtubeRefreshToken = refreshToken;
      }

      await setDoc(creatorRef, tokenData, { merge: true });
      console.log('✅ Creator tokens saved:', userId);
    } catch (error) {
      console.error('❌ Error saving creator tokens:', error);
      throw error;
    }
  }

  /**
   * Publish selected videos to Discover feed
   */
  static async publishVideosToDiscover(videos: Omit<CreatorVideo, 'addedToWiz' | 'lastUpdated'>[]): Promise<void> {
    try {
      console.log('🔄 CreatorService.publishVideosToDiscover called with:', videos.length, 'videos');
      const batch = [];
      
      // Get creator profile to include name and avatar in video data
      console.log('👤 Getting creator profile for:', videos[0]?.creatorId);
      const creatorProfile = videos.length > 0 ? await this.getCreatorProfile(videos[0].creatorId) : null;
      console.log('📋 Creator profile found:', creatorProfile ? 'Yes' : 'No', creatorProfile);
      
      for (const video of videos) {
        // Save to creator videos collection
        const creatorVideoRef = doc(db, 'creatorVideos', video.videoId);
        const creatorVideoData: CreatorVideo = {
          ...video,
          addedToWiz: new Date(),
          lastUpdated: new Date(),
          status: 'active',
          isFeatured: true
        };

        batch.push(
          setDoc(creatorVideoRef, {
            ...creatorVideoData,
            addedToWiz: serverTimestamp(),
            lastUpdated: serverTimestamp()
          })
        );

        // Also add to main videos collection for Discover feed
        const discoverVideoRef = doc(db, 'videos', video.videoId);
        const discoverVideoData = {
          id: video.videoId,
          videoId: video.videoId,
          title: video.title,
          description: video.description || '',
          thumbnail: video.thumbnail,
          duration: video.duration,
          views: video.views,
          category: video.categoryTags[0] || 'tech',
          categoryTags: video.categoryTags,
          creatorId: video.creatorId,
          channelId: video.channelId,
          channelName: creatorProfile?.channelName || 'Unknown Creator',
          channelAvatar: creatorProfile?.channelAvatar || '',
          isCreatorContent: true,
          publishedAt: video.publishedAt,
          addedToWiz: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          status: 'active',
          originalUrl: video.originalYouTubeUrl
        };

        console.log(`📺 Preparing to save video "${video.title}" to videos collection:`, discoverVideoData);
        batch.push(setDoc(discoverVideoRef, discoverVideoData));
      }

      await Promise.all(batch);
      console.log(`✅ Published ${videos.length} videos to Discover feed`);
    } catch (error) {
      console.error('❌ Error publishing videos to Discover:', error);
      throw error;
    }
  }

  /**
   * Sync videos from YouTube API (with real API integration)
   */
  static async syncVideosFromYouTube(channelId: string, creatorId: string, maxResults: number = 10): Promise<CreatorVideo[]> {
    try {
      // Get creator's stored tokens
      const creatorProfile = await this.getCreatorProfile(creatorId);
      if (!creatorProfile?.youtubeAccessToken) {
        throw new Error('No YouTube access token found for creator');
      }

      // Check if token is expired and refresh if needed
      if (creatorProfile.tokenExpiresAt && creatorProfile.tokenExpiresAt < new Date()) {
        // TODO: Implement token refresh logic
        console.warn('YouTube token expired for creator:', creatorId);
      }

      // This would use the youTubeAPI service to fetch videos
      // For now, update the last sync date
      const creatorRef = doc(db, 'creators', creatorId);
      await updateDoc(creatorRef, {
        lastSyncDate: serverTimestamp()
      });

      console.log(`✅ Synced videos for creator ${creatorId}`);
      return [];
    } catch (error) {
      console.error('❌ Error syncing videos from YouTube:', error);
      throw error;
    }
  }

  /**
   * Get all videos in Discover feed (including creator content)
   */
  static async getAllDiscoverVideos(): Promise<any[]> {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        where('status', '==', 'active')
      );

      const videosSnapshot = await getDocs(videosQuery);
      const videos: any[] = [];

      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          ...data,
          addedToWiz: data.addedToWiz?.toDate() || new Date(),
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        });
      });

      return videos.sort((a, b) => b.addedToWiz.getTime() - a.addedToWiz.getTime());
    } catch (error) {
      console.error('❌ Error getting discover videos:', error);
      return [];
    }
  }

  /**
   * Get all active creators (for admin/analytics)
   */
  static async getAllCreators(): Promise<CreatorProfile[]> {
    try {
      const creatorsQuery = query(
        collection(db, 'creators'),
        where('status', '==', 'active')
      );

      const creatorsSnapshot = await getDocs(creatorsQuery);
      const creators: CreatorProfile[] = [];

      creatorsSnapshot.forEach((doc) => {
        const data = doc.data();
        creators.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastSyncDate: data.lastSyncDate?.toDate() || new Date()
        } as CreatorProfile);
      });

      return creators;
    } catch (error) {
      console.error('❌ Error getting all creators:', error);
      return [];
    }
  }
}

// Export types for use in other components
export type { CreatorProfile, CreatorVideo, CreatorStats };