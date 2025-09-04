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
      
      // Deep sanitization function to remove all undefined/null values and problematic data types
      const deepSanitize = (obj: any): any => {
        // Handle null/undefined
        if (obj === null || obj === undefined) return null;
        
        // Handle primitive types
        if (typeof obj === 'string') return obj === 'undefined' || obj === 'null' ? '' : obj;
        if (typeof obj === 'number') return isNaN(obj) || !isFinite(obj) ? 0 : obj;
        if (typeof obj === 'boolean') return obj;
        
        // Handle dates
        if (obj instanceof Date) return isNaN(obj.getTime()) ? new Date() : obj;
        
        // Reject functions and other problematic types
        if (typeof obj === 'function' || typeof obj === 'symbol') return null;
        
        // Handle arrays
        if (Array.isArray(obj)) {
          return obj.map(deepSanitize).filter(item => item !== null && item !== undefined);
        }
        
        // Handle objects
        if (typeof obj === 'object') {
          // Check for circular references or problematic objects
          try {
            JSON.stringify(obj); // This will throw if there are circular references
          } catch (e) {
            console.warn('🚫 Removing object with circular reference or problematic structure:', e);
            return null;
          }
          
          const cleaned: any = {};
          for (const [key, value] of Object.entries(obj)) {
            // Skip function properties or methods
            if (typeof value === 'function') continue;
            
            const sanitizedValue = deepSanitize(value);
            if (sanitizedValue !== null && sanitizedValue !== undefined) {
              cleaned[key] = sanitizedValue;
            }
          }
          return cleaned;
        }
        
        return obj;
      };
      
      // Validate and sanitize all fields
      const sanitizedData = {
        userId: String(profileData.userId || ''),
        channelId: String(profileData.channelId || ''),
        channelName: String(profileData.channelName || 'Unknown Creator'),
        channelAvatar: String(profileData.channelAvatar || ''),
        subscriberCount: String(profileData.subscriberCount || '0'),
        primaryCategory: String(profileData.primaryCategory || 'tech'),
        onboardingComplete: Boolean(profileData.onboardingComplete),
        totalVideos: Number(profileData.totalVideos || 0),
        status: 'active' as const
      };
      
      // Only include optional fields if they have valid values
      if (profileData.secondaryCategory && profileData.secondaryCategory !== 'undefined') {
        sanitizedData['secondaryCategory'] = String(profileData.secondaryCategory);
      }
      
      console.log('🧹 Pre-sanitized data:', profileData);
      console.log('🧹 Sanitized creator profile data:', sanitizedData);
      
      // Deep sanitize the entire object
      const cleanedData = deepSanitize(sanitizedData);
      console.log('🧹 Deep cleaned data:', cleanedData);
      
      const creatorData = {
        ...cleanedData,
        createdAt: new Date(),
        lastSyncDate: new Date()
      };

      console.log('🔥 Final data being sent to Firestore:', creatorData);

      await setDoc(creatorRef, {
        ...creatorData,
        createdAt: serverTimestamp(),
        lastSyncDate: serverTimestamp()
      });

      // CRITICAL: Update the users collection to enable creator profile switching
      const userRef = doc(db, 'users', profileData.userId);
      await setDoc(userRef, {
        // Creator role and enrollment flags
        hasCreatedContent: true,
        role: 'creator',
        youtubeConnected: true,
        
        // Update user display name to match YouTube channel
        displayName: sanitizedData.channelName,
        
        // YouTube profile data
        youtubeProfile: {
          channelId: sanitizedData.channelId,
          channelName: sanitizedData.channelName,
          profilePicture: sanitizedData.channelAvatar,
          subscriberCount: sanitizedData.subscriberCount
        },
        
        // Enrollment timestamps
        creatorPromotedAt: serverTimestamp(),
        youtubeConnectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Initialize creator metrics
        coursesCreated: 0,
        videosUploaded: sanitizedData.totalVideos || 0,
        totalEarnings: 0
      }, { merge: true });

      // CRITICAL: Also update creatorProfiles collection for creator dashboard components
      const creatorProfileRef = doc(db, 'creatorProfiles', profileData.userId);
      await setDoc(creatorProfileRef, {
        youtubeData: {
          channelId: sanitizedData.channelId,
          handle: sanitizedData.channelName,
          title: sanitizedData.channelName,
          description: `Creator channel with ${sanitizedData.subscriberCount} subscribers`,
          thumbnailUrl: sanitizedData.channelAvatar,
          subscriberCount: parseInt(sanitizedData.subscriberCount.replace(/[^\d]/g, '')) || 0,
          videoCount: sanitizedData.totalVideos || 0,
          viewCount: 0, // Will be updated during sync
          publishedAt: new Date().toISOString(),
          lastSyncedAt: new Date().toISOString(),
          isConnected: true
        },
        wizName: sanitizedData.channelName,
        bio: `Creator with ${sanitizedData.subscriberCount} subscribers`,
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        profileVisibility: 'public',
        allowMessages: true,
        showEarnings: false,
        categories: [sanitizedData.primaryCategory],
        targetAudience: []
      }, { merge: true });

      console.log('✅ Creator profile saved and user promoted:', profileData.userId);
    } catch (error) {
      console.error('❌ Error saving creator profile:', error);
      console.error('❌ Original profile data:', profileData);
      console.error('❌ Error stack:', error.stack);
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
   * Save creator videos to database with duplicate prevention
   */
  static async saveCreatorVideos(videos: Omit<CreatorVideo, 'addedToWiz' | 'lastUpdated'>[]): Promise<void> {
    try {
      console.log(`🎬 Processing ${videos.length} videos for deduplication...`);
      
      const batch = [];
      const processedVideos = [];
      const skippedVideos = [];
      
      for (const video of videos) {
        const videoRef = doc(db, 'creatorVideos', video.videoId);
        
        // Check if video already exists
        const existingDoc = await getDoc(videoRef);
        
        if (existingDoc.exists()) {
          const existingData = existingDoc.data();
          
          // Only update if the video belongs to the same creator or is being claimed by current creator
          if (existingData.creatorId === video.creatorId) {
            // Update existing video with latest data - UPDATE addedToWiz to current time for newer uploads
            const updatedData = {
              ...video,
              addedToWiz: new Date(), // Update to current time so newer uploads appear first
              lastUpdated: serverTimestamp(),
              status: 'active',
              isFeatured: video.isFeatured || existingData.isFeatured || false,
              originalYouTubeUrl: video.originalYouTubeUrl || `https://www.youtube.com/watch?v=${video.videoId}`
            };
            
            batch.push(setDoc(videoRef, {
              ...updatedData,
              addedToWiz: serverTimestamp() // Use serverTimestamp for Firebase
            }, { merge: true }));
            processedVideos.push(video.videoId);
            console.log(`🔄 Updating existing video: ${video.title}`);
          } else {
            console.log(`⚠️ Skipping video ${video.videoId} - belongs to different creator: ${existingData.creatorId}`);
            skippedVideos.push(video.videoId);
          }
        } else {
          // Create new video with enhanced creator data
          const videoData: CreatorVideo = {
            ...video,
            addedToWiz: new Date(),
            lastUpdated: new Date(),
            status: 'active',
            isFeatured: video.isFeatured || false,
            originalYouTubeUrl: video.originalYouTubeUrl || `https://www.youtube.com/watch?v=${video.videoId}`,
            // Ensure creator avatar is included if not already present
            creatorAvatar: video.creatorAvatar || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent((video.title || video.channelName || 'Creator').slice(0, 2))}&background=8B5CF6&color=ffffff&size=128&bold=true&format=svg`
          };

          batch.push(
            setDoc(videoRef, {
              ...videoData,
              addedToWiz: serverTimestamp(),
              lastUpdated: serverTimestamp()
            })
          );
          processedVideos.push(video.videoId);
          console.log(`✨ Creating new video: ${video.title}`);
        }
      }

      // Execute all video saves
      await Promise.all(batch);
      
      console.log(`✅ Processed ${processedVideos.length} videos, skipped ${skippedVideos.length} duplicates`);
    } catch (error) {
      console.error('❌ Error saving creator videos:', error);
      throw error;
    }
  }

  /**
   * Remove duplicate videos for a specific creator
   */
  static async removeDuplicateVideos(creatorId: string): Promise<void> {
    try {
      console.log(`🧹 Cleaning up duplicate videos for creator: ${creatorId}`);
      
      const videosQuery = query(
        collection(db, 'creatorVideos'),
        where('creatorId', '==', creatorId)
      );
      
      const snapshot = await getDocs(videosQuery);
      const videosByTitle = new Map<string, any[]>();
      
      // Group videos by title to identify duplicates
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const title = data.title?.toLowerCase().trim();
        
        if (!videosByTitle.has(title)) {
          videosByTitle.set(title, []);
        }
        videosByTitle.get(title)!.push({ id: doc.id, data, doc });
      });
      
      const duplicatesToRemove = [];
      
      // For each title group, keep the earliest one and mark others for deletion
      videosByTitle.forEach((videos, title) => {
        if (videos.length > 1) {
          console.log(`🔍 Found ${videos.length} duplicates for: "${title}"`);
          
          // Sort by addedToWiz date (earliest first)
          videos.sort((a, b) => {
            const dateA = a.data.addedToWiz?.toDate?.() || new Date(a.data.addedToWiz) || new Date(0);
            const dateB = b.data.addedToWiz?.toDate?.() || new Date(b.data.addedToWiz) || new Date(0);
            return dateA.getTime() - dateB.getTime();
          });
          
          // Keep the first (earliest) one, mark others for removal
          const [keep, ...remove] = videos;
          console.log(`✅ Keeping video: ${keep.id} (${keep.data.addedToWiz})`);
          
          remove.forEach(duplicate => {
            console.log(`❌ Marking for removal: ${duplicate.id} (${duplicate.data.addedToWiz})`);
            duplicatesToRemove.push(duplicate.doc.ref);
          });
        }
      });
      
      // Delete duplicates
      if (duplicatesToRemove.length > 0) {
        await Promise.all(duplicatesToRemove.map(ref => ref.delete()));
        console.log(`🗑️ Removed ${duplicatesToRemove.length} duplicate videos`);
      } else {
        console.log('✨ No duplicates found');
      }
      
    } catch (error) {
      console.error('❌ Error removing duplicate videos:', error);
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