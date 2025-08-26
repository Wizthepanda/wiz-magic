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
    const jobId = `sync_${creator.userId}_${Date.now()}`;\n    
    console.log(`🔄 Syncing videos for creator: ${creator.channelName} (${creator.channelId})`);\n
    const job: SyncJob = {\n      id: jobId,\n      creatorId: creator.userId,\n      channelId: creator.channelId,\n      lastSyncDate: new Date(),\n      status: 'running',\n      videosFound: 0,\n      videosAdded: 0,\n      createdAt: new Date()\n    };\n\n    try {\n      // Check if sync is needed (has it been more than SYNC_INTERVAL since last sync?)\n      const lastSyncTime = creator.lastSyncDate?.getTime() || 0;\n      const currentTime = Date.now();\n      \n      if (currentTime - lastSyncTime < this.SYNC_INTERVAL) {\n        console.log(`⏭️ Skipping sync for ${creator.channelName} - too recent (last sync: ${creator.lastSyncDate})`);\n        job.status = 'completed';\n        return job;\n      }\n\n      // Check if creator has valid YouTube tokens\n      if (!creator.youtubeAccessToken) {\n        throw new Error('No YouTube access token available for creator');\n      }\n\n      // Check if token is expired\n      if (creator.tokenExpiresAt && creator.tokenExpiresAt < new Date()) {\n        // TODO: Implement token refresh logic\n        console.warn(`⚠️ YouTube token expired for creator ${creator.channelName}`);\n        throw new Error('YouTube access token expired');\n      }\n\n      // Set access token and fetch recent videos\n      youTubeAPI.setAccessToken(creator.youtubeAccessToken);\n      const recentVideos = await youTubeAPI.getRecentVideos(this.MAX_VIDEOS_PER_SYNC);\n      \n      job.videosFound = recentVideos.length;\n\n      // Filter out videos we already have\n      const newVideos = await this.filterNewVideos(recentVideos, creator.userId);\n      \n      if (newVideos.length === 0) {\n        console.log(`✅ No new videos found for ${creator.channelName}`);\n        job.status = 'completed';\n        job.videosAdded = 0;\n        \n        // Update last sync date\n        await CreatorService.syncVideosFromYouTube(creator.channelId, creator.userId);\n        \n        return job;\n      }\n\n      // Auto-categorize and prepare videos for WIZ\n      const categorizedVideos = newVideos.map(video => ({\n        id: video.id,\n        videoId: video.id,\n        title: video.title,\n        description: video.description,\n        thumbnail: video.thumbnail,\n        duration: video.duration,\n        publishedAt: video.publishedAt,\n        views: video.views,\n        categoryTags: [this.autoDetectCategory(video.title + ' ' + video.description)],\n        creatorId: creator.userId,\n        channelId: creator.channelId,\n        status: 'active' as const,\n        isFeatured: this.shouldAutoFeature(video, creator), // Auto-feature based on criteria\n        originalYouTubeUrl: `https://www.youtube.com/watch?v=${video.id}`\n      }));\n\n      // Save videos to database\n      if (categorizedVideos.some(v => v.isFeatured)) {\n        // If any videos are auto-featured, publish to Discover\n        await CreatorService.publishVideosToDiscover(categorizedVideos.filter(v => v.isFeatured));\n      } else {\n        // Otherwise, just save as creator videos\n        await CreatorService.saveCreatorVideos(categorizedVideos);\n      }\n\n      job.status = 'completed';\n      job.videosAdded = newVideos.length;\n      \n      console.log(`✅ Synced ${newVideos.length} new videos for ${creator.channelName}`);\n      \n      // Update creator's last sync date\n      await CreatorService.syncVideosFromYouTube(creator.channelId, creator.userId);\n      \n      return job;\n      \n    } catch (error) {\n      console.error(`❌ Sync failed for creator ${creator.channelName}:`, error);\n      job.status = 'failed';\n      job.error = error instanceof Error ? error.message : 'Unknown error';\n      return job;\n    }\n  }\n\n  /**\n   * Filter out videos that already exist in our database\n   */\n  private static async filterNewVideos(videos: YouTubeVideo[], creatorId: string): Promise<YouTubeVideo[]> {\n    try {\n      const existingVideosQuery = query(\n        collection(db, 'creatorVideos'),\n        where('creatorId', '==', creatorId),\n        where('status', '==', 'active')\n      );\n\n      const existingVideosSnapshot = await getDocs(existingVideosQuery);\n      const existingVideoIds = new Set<string>();\n      \n      existingVideosSnapshot.forEach(doc => {\n        existingVideoIds.add(doc.data().videoId);\n      });\n\n      return videos.filter(video => !existingVideoIds.has(video.id));\n      \n    } catch (error) {\n      console.error('Error filtering new videos:', error);\n      return videos; // Return all videos if filtering fails\n    }\n  }\n\n  /**\n   * Auto-detect category based on video content\n   */\n  private static autoDetectCategory(content: string): string {\n    const lowerContent = content.toLowerCase();\n    \n    // Gaming keywords\n    if (lowerContent.match(/\\b(game|gaming|gameplay|gamer|esports|minecraft|fortnite|cod|fps|rpg|mmorpg)\\b/)) {\n      return 'gaming';\n    }\n    \n    // AI/ML keywords\n    if (lowerContent.match(/\\b(ai|artificial intelligence|machine learning|ml|chatgpt|openai|neural network|deep learning|python|tensorflow|pytorch)\\b/)) {\n      return 'ai';\n    }\n    \n    // Tech keywords\n    if (lowerContent.match(/\\b(programming|coding|developer|software|web development|react|javascript|typescript|tutorial|tech|technology)\\b/)) {\n      return 'tech';\n    }\n    \n    // Music keywords\n    if (lowerContent.match(/\\b(music|song|album|artist|musician|guitar|piano|beats|remix|cover|acoustic)\\b/)) {\n      return 'music';\n    }\n    \n    // Health/Fitness keywords\n    if (lowerContent.match(/\\b(health|fitness|workout|exercise|nutrition|diet|wellness|yoga|meditation|gym)\\b/)) {\n      return 'health';\n    }\n    \n    // Finance keywords\n    if (lowerContent.match(/\\b(money|finance|investment|crypto|bitcoin|stocks|trading|business|entrepreneur|passive income)\\b/)) {\n      return 'money';\n    }\n    \n    // Podcast keywords\n    if (lowerContent.match(/\\b(podcast|interview|discussion|talk|conversation|episode|host|guest)\\b/)) {\n      return 'podcast';\n    }\n    \n    // Default to tech\n    return 'tech';\n  }\n\n  /**\n   * Determine if a video should be auto-featured based on performance criteria\n   */\n  private static shouldAutoFeature(video: YouTubeVideo, creator: CreatorProfile): boolean {\n    // Auto-feature criteria (can be customized per creator preferences):\n    \n    // 1. All videos are auto-featured for new creators (first 30 days)\n    const creatorAge = Date.now() - creator.createdAt.getTime();\n    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;\n    \n    if (creatorAge < thirtyDaysMs) {\n      return true;\n    }\n    \n    // 2. Videos with high view counts (relative to channel size)\n    const viewCount = parseInt(video.views.replace(/[^0-9]/g, '')) || 0;\n    const subscriberCount = parseInt(creator.subscriberCount?.replace(/[^0-9]/g, '') || '0') || 1000;\n    \n    // If views > 10% of subscriber count, auto-feature\n    if (viewCount > subscriberCount * 0.1) {\n      return true;\n    }\n    \n    // 3. Recent uploads (within last 7 days) are auto-featured\n    const videoDate = new Date(video.publishedAt);\n    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);\n    \n    if (videoDate > sevenDaysAgo) {\n      return true;\n    }\n    \n    // 4. Videos longer than 10 minutes (typically higher quality content)\n    const durationParts = video.duration.split(':');\n    const minutes = parseInt(durationParts[0]) || 0;\n    const seconds = parseInt(durationParts[1]) || 0;\n    const totalMinutes = minutes + (seconds / 60);\n    \n    if (totalMinutes >= 10) {\n      return true;\n    }\n    \n    // Default: don't auto-feature, let creator manually select\n    return false;\n  }\n\n  /**\n   * Get sync history for a creator\n   */\n  static async getSyncHistory(creatorId: string): Promise<SyncJob[]> {\n    try {\n      // In a real implementation, this would query a syncJobs collection\n      // For now, return mock data\n      return [];\n    } catch (error) {\n      console.error('Error getting sync history:', error);\n      return [];\n    }\n  }\n\n  /**\n   * Schedule next sync (would be implemented with a task scheduler like cron)\n   */\n  static scheduleNextSync(): void {\n    // In a production environment, this would integrate with:\n    // - Vercel Cron Jobs\n    // - Firebase Functions scheduled functions\n    // - AWS Lambda scheduled functions\n    // - Or a background job queue like Bull/Agenda\n    \n    console.log('📅 Next sync scheduled for:', new Date(Date.now() + this.SYNC_INTERVAL));\n    \n    // For demonstration, we could set up a simple timeout\n    // setTimeout(() => {\n    //   this.runDailySync();\n    // }, this.SYNC_INTERVAL);\n  }\n}\n\n// Export for use in other parts of the application\nexport { SyncService };