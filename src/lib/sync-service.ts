// Daily Sync Service for Creator Content
// Automatically syncs new videos from creator channels

import { CreatorService, CreatorProfile } from './creator-service';
import { youTubeAPI, YouTubeVideo } from './youtube-api';
import { db } from './firebase';
import { doc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export interface SyncJob {
  id: string;
  creatorId: string;
  channelId: string;
  lastSyncDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  videosFound: number;
  videosAdded: number;
  error?: string;
  createdAt: Date;
}

export class SyncService {
  private static readonly SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static readonly MAX_VIDEOS_PER_SYNC = 10;

  /**
   * Run daily sync for all active creators
   */
  static async runDailySync(): Promise<SyncJob[]> {
    console.log('🔄 Starting daily sync for all creators...');
    
    try {
      // Get all active creators
      const creators = await CreatorService.getAllCreators();
      const syncJobs: SyncJob[] = [];

      for (const creator of creators) {
        try {
          const job = await this.syncCreatorVideos(creator);
          syncJobs.push(job);
        } catch (error) {
          console.error(`❌ Failed to sync creator ${creator.userId}:`, error);
          syncJobs.push({
            id: `sync_${creator.userId}_${Date.now()}`,
            creatorId: creator.userId,
            channelId: creator.channelId,
            lastSyncDate: new Date(),
            status: 'failed',
            videosFound: 0,
            videosAdded: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            createdAt: new Date()
          });
        }
      }

      console.log(`✅ Daily sync completed. Processed ${creators.length} creators.`);
      return syncJobs;
      
    } catch (error) {
      console.error('❌ Daily sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync videos for a specific creator
   */
  static async syncCreatorVideos(creator: CreatorProfile): Promise<SyncJob> {
    const jobId = `sync_${creator.userId}_${Date.now()}`;
    
    console.log(`🔄 Syncing videos for creator: ${creator.channelName} (${creator.channelId})`);
    const job: SyncJob = {
      id: jobId,
      creatorId: creator.userId,
      channelId: creator.channelId,
      lastSyncDate: new Date(),
      status: 'running',
      videosFound: 0,
      videosAdded: 0,
      createdAt: new Date()
    };

    try {
      // Check if sync is needed (has it been more than SYNC_INTERVAL since last sync?)
      const lastSyncTime = creator.lastSyncDate?.getTime() || 0;
      const currentTime = Date.now();
      
      if (currentTime - lastSyncTime < this.SYNC_INTERVAL) {
        console.log(`⏭️ Skipping sync for ${creator.channelName} - too recent (last sync: ${creator.lastSyncDate})`);
        job.status = 'completed';
        return job;
      }

      // Check if creator has valid YouTube tokens
      if (!creator.youtubeAccessToken) {
        throw new Error('No YouTube access token available for creator');
      }

      // Check if token is expired
      if (creator.tokenExpiresAt && creator.tokenExpiresAt < new Date()) {
        // TODO: Implement token refresh logic
        console.warn(`⚠️ YouTube token expired for creator ${creator.channelName}`);
        throw new Error('YouTube access token expired');
      }

      // Set access token and fetch recent videos
      youTubeAPI.setAccessToken(creator.youtubeAccessToken);
      const recentVideos = await youTubeAPI.getRecentVideos(this.MAX_VIDEOS_PER_SYNC);
      
      job.videosFound = recentVideos.length;

      // Filter out videos we already have
      const newVideos = await this.filterNewVideos(recentVideos, creator.userId);
      
      if (newVideos.length === 0) {
        console.log(`✅ No new videos found for ${creator.channelName}`);
        job.status = 'completed';
        job.videosAdded = 0;
        
        // Update last sync date
        await CreatorService.syncVideosFromYouTube(creator.channelId, creator.userId);
        
        return job;
      }

      // Auto-categorize and prepare videos for WIZ
      const categorizedVideos = newVideos.map(video => ({
        id: video.id,
        videoId: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        duration: video.duration,
        publishedAt: video.publishedAt,
        views: video.views,
        categoryTags: [this.autoDetectCategory(video.title + ' ' + video.description)],
        creatorId: creator.userId,
        channelId: creator.channelId,
        status: 'active' as const,
        isFeatured: this.shouldAutoFeature(video, creator), // Auto-feature based on criteria
        originalYouTubeUrl: `https://www.youtube.com/watch?v=${video.id}`
      }));

      // Save videos to database
      if (categorizedVideos.some(v => v.isFeatured)) {
        // If any videos are auto-featured, publish to Discover
        await CreatorService.publishVideosToDiscover(categorizedVideos.filter(v => v.isFeatured));
      } else {
        // Otherwise, just save as creator videos
        await CreatorService.saveCreatorVideos(categorizedVideos);
      }

      job.status = 'completed';
      job.videosAdded = newVideos.length;
      
      console.log(`✅ Synced ${newVideos.length} new videos for ${creator.channelName}`);
      
      // Update creator's last sync date
      await CreatorService.syncVideosFromYouTube(creator.channelId, creator.userId);
      
      return job;
      
    } catch (error) {
      console.error(`❌ Sync failed for creator ${creator.channelName}:`, error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      return job;
    }
  }

  /**
   * Filter out videos that already exist in our database
   */
  private static async filterNewVideos(videos: YouTubeVideo[], creatorId: string): Promise<YouTubeVideo[]> {
    try {
      const existingVideosQuery = query(
        collection(db, 'creatorVideos'),
        where('creatorId', '==', creatorId),
        where('status', '==', 'active')
      );

      const existingVideosSnapshot = await getDocs(existingVideosQuery);
      const existingVideoIds = new Set<string>();
      
      existingVideosSnapshot.forEach(doc => {
        existingVideoIds.add(doc.data().videoId);
      });

      return videos.filter(video => !existingVideoIds.has(video.id));
      
    } catch (error) {
      console.error('Error filtering new videos:', error);
      return videos; // Return all videos if filtering fails
    }
  }

  /**
   * Auto-detect category based on video content
   */
  private static autoDetectCategory(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Gaming keywords
    if (lowerContent.match(/\b(game|gaming|gameplay|gamer|esports|minecraft|fortnite|cod|fps|rpg|mmorpg)\b/)) {
      return 'gaming';
    }
    
    // AI/ML keywords
    if (lowerContent.match(/\b(ai|artificial intelligence|machine learning|ml|chatgpt|openai|neural network|deep learning|python|tensorflow|pytorch)\b/)) {
      return 'ai';
    }
    
    // Tech keywords
    if (lowerContent.match(/\b(programming|coding|developer|software|web development|react|javascript|typescript|tutorial|tech|technology)\b/)) {
      return 'tech';
    }
    
    // Music keywords
    if (lowerContent.match(/\b(music|song|album|artist|musician|guitar|piano|beats|remix|cover|acoustic)\b/)) {
      return 'music';
    }
    
    // Health/Fitness keywords
    if (lowerContent.match(/\b(health|fitness|workout|exercise|nutrition|diet|wellness|yoga|meditation|gym)\b/)) {
      return 'health';
    }
    
    // Finance keywords
    if (lowerContent.match(/\b(money|finance|investment|crypto|bitcoin|stocks|trading|business|entrepreneur|passive income)\b/)) {
      return 'money';
    }
    
    // Podcast keywords
    if (lowerContent.match(/\b(podcast|interview|discussion|talk|conversation|episode|host|guest)\b/)) {
      return 'podcast';
    }
    
    // Default to tech
    return 'tech';
  }

  /**
   * Determine if a video should be auto-featured based on performance criteria
   */
  private static shouldAutoFeature(video: YouTubeVideo, creator: CreatorProfile): boolean {
    // Auto-feature criteria (can be customized per creator preferences):
    
    // 1. All videos are auto-featured for new creators (first 30 days)
    const creatorAge = Date.now() - creator.createdAt.getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    
    if (creatorAge < thirtyDaysMs) {
      return true;
    }
    
    // 2. Videos with high view counts (relative to channel size)
    const viewCount = parseInt(video.views.replace(/[^0-9]/g, '')) || 0;
    const subscriberCount = parseInt(creator.subscriberCount?.replace(/[^0-9]/g, '') || '0') || 1000;
    
    // If views > 10% of subscriber count, auto-feature
    if (viewCount > subscriberCount * 0.1) {
      return true;
    }
    
    // 3. Recent uploads (within last 7 days) are auto-featured
    const videoDate = new Date(video.publishedAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    if (videoDate > sevenDaysAgo) {
      return true;
    }
    
    // 4. Videos longer than 10 minutes (typically higher quality content)
    const durationParts = video.duration.split(':');
    const minutes = parseInt(durationParts[0]) || 0;
    const seconds = parseInt(durationParts[1]) || 0;
    const totalMinutes = minutes + (seconds / 60);
    
    if (totalMinutes >= 10) {
      return true;
    }
    
    // Default: don't auto-feature, let creator manually select
    return false;
  }

  /**
   * Get sync history for a creator
   */
  static async getSyncHistory(creatorId: string): Promise<SyncJob[]> {
    try {
      // In a real implementation, this would query a syncJobs collection
      // For now, return mock data
      return [];
    } catch (error) {
      console.error('Error getting sync history:', error);
      return [];
    }
  }

  /**
   * Schedule next sync (would be implemented with a task scheduler like cron)
   */
  static scheduleNextSync(): void {
    // In a production environment, this would integrate with:
    // - Vercel Cron Jobs
    // - Firebase Functions scheduled functions
    // - AWS Lambda scheduled functions
    // - Or a background job queue like Bull/Agenda
    
    console.log('📅 Next sync scheduled for:', new Date(Date.now() + this.SYNC_INTERVAL));
    
    // For demonstration, we could set up a simple timeout
    // setTimeout(() => {
    //   this.runDailySync();
    // }, this.SYNC_INTERVAL);
  }
}

// Export for use in other parts of the application
export { SyncService };