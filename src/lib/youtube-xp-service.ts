/**
 * YouTube API XP Service - Handles off-platform XP tracking via YouTube Data API v3
 * Integrates with existing XP system for comprehensive tracking
 */

import { db } from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  orderBy,
  limit
} from 'firebase/firestore';
import { XPSystem } from './xp-system';

// YouTube API Configuration
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// XP Calculation Constants
const XP_RULES = {
  WATCH_TIME_XP_RATE: 0.1, // +1 XP per 10 seconds
  COMPLETION_BONUS_RATE: 0.1, // +10% bonus for completion
  DAILY_XP_CAP: 360,
  SHARE_XP: 20,
  REFERRAL_XP: 50,
};

// Firestore Schema Interfaces
export interface UserTrackingData {
  userId: string;
  startTrackingDate: Date;
  youtubeConnected: boolean;
  youtubeTokens?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
  };
  lastYouTubeSyncDate?: Date;
  preferences: {
    trackYouTubeHistory: boolean;
    trackOffPlatform: boolean;
  };
}

export interface YouTubeWatchHistoryEntry {
  id: string;
  userId: string;
  videoId: string;
  watchedAt: Date;
  duration: number; // Total video duration in seconds
  estimatedWatchTime: number; // Estimated watch time in seconds
  completionRate: number; // 0-1 representing % completed
  source: 'youtube_api' | 'embed_heartbeat';
  xpAwarded: number;
  processedAt: Date;
  creatorId?: string; // If video belongs to a tracked creator
}

export interface XPLogEntry {
  id: string;
  userId: string;
  source: 'watch_time' | 'completion_bonus' | 'share' | 'referral' | 'youtube_api';
  xpAmount: number;
  videoId?: string;
  creatorId?: string;
  timestamp: Date;
  details: {
    watchTime?: number;
    completionRate?: number;
    dailyXPBeforeAward: number;
    dailyXPAfterAward: number;
  };
}

export interface CreatorVideoMapping {
  creatorId: string;
  channelId: string;
  videoIds: string[];
  lastUpdated: Date;
}

export class YouTubeXPService {
  /**
   * Initialize user tracking when they connect Google Auth
   */
  static async initializeUserTracking(userId: string): Promise<void> {
    try {
      const trackingRef = doc(db, 'userTrackingData', userId);
      const existingDoc = await getDoc(trackingRef);
      
      if (!existingDoc.exists()) {
        const trackingData: UserTrackingData = {
          userId,
          startTrackingDate: new Date(),
          youtubeConnected: false,
          preferences: {
            trackYouTubeHistory: true,
            trackOffPlatform: true,
          },
        };
        
        await setDoc(trackingRef, {
          ...trackingData,
          startTrackingDate: serverTimestamp(),
        });
        
        console.log(`✅ Initialized tracking for user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error initializing user tracking:', error);
      throw error;
    }
  }

  /**
   * Save YouTube OAuth tokens after successful authentication
   */
  static async saveYouTubeTokens(
    userId: string, 
    accessToken: string, 
    refreshToken?: string, 
    expiresIn?: number
  ): Promise<void> {
    try {
      const trackingRef = doc(db, 'userTrackingData', userId);
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : new Date(Date.now() + 3600000);
      
      await updateDoc(trackingRef, {
        youtubeConnected: true,
        youtubeTokens: {
          accessToken,
          refreshToken,
          expiresAt,
        },
      });
      
      console.log(`✅ Saved YouTube tokens for user ${userId}`);
    } catch (error) {
      console.error('❌ Error saving YouTube tokens:', error);
      throw error;
    }
  }

  /**
   * Get creator video mappings to determine which videos belong to tracked creators
   */
  static async getCreatorVideoMappings(): Promise<Map<string, string>> {
    try {
      const creatorsQuery = query(collection(db, 'creators'));
      const creatorsSnapshot = await getDocs(creatorsQuery);
      
      const videoToCreatorMap = new Map<string, string>();
      
      for (const creatorDoc of creatorsSnapshot.docs) {
        const creatorData = creatorDoc.data();
        const creatorId = creatorDoc.id;
        
        // Get videos for this creator
        const videosQuery = query(
          collection(db, 'creatorVideos'),
          where('creatorId', '==', creatorId)
        );
        
        const videosSnapshot = await getDocs(videosQuery);
        videosSnapshot.forEach(videoDoc => {
          const videoData = videoDoc.data();
          videoToCreatorMap.set(videoData.videoId, creatorId);
        });
      }
      
      console.log(`📊 Loaded ${videoToCreatorMap.size} creator video mappings`);
      return videoToCreatorMap;
    } catch (error) {
      console.error('❌ Error getting creator video mappings:', error);
      return new Map();
    }
  }

  /**
   * Fetch YouTube watch history via API (requires valid access token)
   */
  static async fetchYouTubeWatchHistory(userId: string, maxResults: number = 50): Promise<YouTubeWatchHistoryEntry[]> {
    try {
      const trackingRef = doc(db, 'userTrackingData', userId);
      const trackingDoc = await getDoc(trackingRef);
      
      if (!trackingDoc.exists()) {
        throw new Error('User tracking data not found');
      }
      
      const trackingData = trackingDoc.data() as UserTrackingData;
      
      if (!trackingData.youtubeTokens?.accessToken) {
        throw new Error('No YouTube access token available');
      }
      
      // Check if token is expired
      if (trackingData.youtubeTokens.expiresAt < new Date()) {
        throw new Error('YouTube token expired - need to refresh');
      }
      
      // Fetch watch history from YouTube API using History List endpoint
      const historyResponse = await fetch(
        `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=HL&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${trackingData.youtubeTokens.accessToken}`,
          },
        }
      );
      
      if (!historyResponse.ok) {
        throw new Error(`YouTube API error: ${historyResponse.status}`);
      }
      
      const historyData = await historyResponse.json();
      const startTrackingDate = trackingData.startTrackingDate.toDate?.() || trackingData.startTrackingDate;
      const creatorVideoMap = await this.getCreatorVideoMappings();
      
      const watchEntries: YouTubeWatchHistoryEntry[] = [];
      
      for (const item of historyData.items || []) {
        const videoId = item.snippet?.resourceId?.videoId;
        const publishedAt = new Date(item.snippet?.publishedAt);
        
        // Only include videos watched after startTrackingDate
        if (publishedAt < startTrackingDate) continue;
        
        // Only include videos from tracked creators
        const creatorId = creatorVideoMap.get(videoId);
        if (!creatorId) continue;
        
        // Get video details to estimate watch time
        const videoDetailsResponse = await fetch(
          `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (videoDetailsResponse.ok) {
          const videoDetails = await videoDetailsResponse.json();
          const duration = this.parseYouTubeDuration(videoDetails.items?.[0]?.contentDetails?.duration || 'PT0S');
          
          // Estimate watch time (for API history, assume 70% completion on average)
          const estimatedWatchTime = Math.floor(duration * 0.7);
          const completionRate = 0.7;
          
          watchEntries.push({
            id: `${userId}_${videoId}_${publishedAt.getTime()}`,
            userId,
            videoId,
            watchedAt: publishedAt,
            duration,
            estimatedWatchTime,
            completionRate,
            source: 'youtube_api',
            xpAwarded: 0, // Will be calculated when processing
            processedAt: new Date(),
            creatorId,
          });
        }
      }
      
      console.log(`📺 Fetched ${watchEntries.length} YouTube watch history entries for user ${userId}`);
      return watchEntries;
    } catch (error) {
      console.error('❌ Error fetching YouTube watch history:', error);
      return [];
    }
  }

  /**
   * Parse YouTube duration format (PT4M13S) to seconds
   */
  static parseYouTubeDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Process YouTube watch history and award XP (with deduplication)
   */
  static async processYouTubeWatchHistory(userId: string, watchEntries: YouTubeWatchHistoryEntry[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Get existing processed entries to avoid duplicates
      const existingEntriesQuery = query(
        collection(db, 'youtubeWatchHistory'),
        where('userId', '==', userId),
        orderBy('watchedAt', 'desc'),
        limit(1000)
      );
      
      const existingEntriesSnapshot = await getDocs(existingEntriesQuery);
      const existingVideoIds = new Set<string>();
      
      existingEntriesSnapshot.forEach(doc => {
        const data = doc.data();
        existingVideoIds.add(`${data.videoId}_${data.watchedAt.toMillis()}`);
      });
      
      let totalXPAwarded = 0;
      
      for (const entry of watchEntries) {
        const entryKey = `${entry.videoId}_${entry.watchedAt.getTime()}`;
        
        // Skip if already processed
        if (existingVideoIds.has(entryKey)) {
          console.log(`⏭️ Skipping duplicate entry: ${entryKey}`);
          continue;
        }
        
        // Calculate XP for this entry
        const baseXP = Math.floor(entry.estimatedWatchTime * XP_RULES.WATCH_TIME_XP_RATE);
        let totalXP = baseXP;
        
        // Apply completion bonus if >90% watched
        if (entry.completionRate >= 0.9) {
          totalXP += Math.floor(baseXP * XP_RULES.COMPLETION_BONUS_RATE);
        }
        
        entry.xpAwarded = totalXP;
        totalXPAwarded += totalXP;
        
        // Save watch history entry
        const historyRef = doc(db, 'youtubeWatchHistory', entry.id);
        batch.set(historyRef, {
          ...entry,
          watchedAt: serverTimestamp(),
          processedAt: serverTimestamp(),
        });
        
        // Create XP log entry
        const xpLogRef = doc(db, 'xpLogs', `${entry.id}_xp`);
        const xpLogEntry: XPLogEntry = {
          id: `${entry.id}_xp`,
          userId,
          source: 'youtube_api',
          xpAmount: totalXP,
          videoId: entry.videoId,
          creatorId: entry.creatorId,
          timestamp: entry.watchedAt,
          details: {
            watchTime: entry.estimatedWatchTime,
            completionRate: entry.completionRate,
            dailyXPBeforeAward: 0, // Will be updated by XP system
            dailyXPAfterAward: 0,
          },
        };
        
        batch.set(xpLogRef, {
          ...xpLogEntry,
          timestamp: serverTimestamp(),
        });
      }
      
      // Commit batch
      await batch.commit();
      
      // Award XP through existing system (with daily caps)
      if (totalXPAwarded > 0) {
        await this.awardBatchXP(userId, totalXPAwarded, 'youtube_api');
      }
      
      console.log(`✅ Processed ${watchEntries.length} YouTube entries, awarded ${totalXPAwarded} XP`);
    } catch (error) {
      console.error('❌ Error processing YouTube watch history:', error);
      throw error;
    }
  }

  /**
   * Award XP in batches while respecting daily caps
   */
  static async awardBatchXP(userId: string, totalXP: number, source: string): Promise<void> {
    try {
      const xpData = await XPSystem.getUserXP(userId) || await XPSystem.initializeUserXP(userId);
      
      // Check daily cap
      const remainingCap = XP_RULES.DAILY_XP_CAP - xpData.dailyXP;
      const xpToAward = Math.min(totalXP, remainingCap);
      
      if (xpToAward <= 0) {
        console.log(`⏰ Daily XP cap reached for ${userId}, skipping ${totalXP} XP from ${source}`);
        return;
      }
      
      // Use existing XP system to award XP (maintains consistency)
      const newTotalXP = xpData.totalXP + xpToAward;
      const newLevel = XPSystem.calculateLevel(newTotalXP).level;
      
      const xpRef = doc(db, 'userXP', userId);
      await updateDoc(xpRef, {
        totalXP: newTotalXP,
        level: newLevel,
        dailyXP: xpData.dailyXP + xpToAward,
        lastXPUpdate: serverTimestamp(),
        'lifetimeStats.totalWatchTime': xpData.lifetimeStats.totalWatchTime + Math.floor(totalXP / XP_RULES.WATCH_TIME_XP_RATE),
      });
      
      // Dispatch events
      XPSystem.dispatchXPUpdateEvent(userId, newTotalXP, xpToAward);
      
      if (newLevel > xpData.level) {
        XPSystem.dispatchLevelUpEvent(userId, newLevel, xpData.level);
      }
      
      console.log(`✅ Awarded ${xpToAward} XP to ${userId} from ${source} (${totalXP - xpToAward} capped)`);
    } catch (error) {
      console.error('❌ Error awarding batch XP:', error);
      throw error;
    }
  }

  /**
   * Check for duplicate XP between embed tracking and YouTube API
   */
  static async deduplicateXP(userId: string, videoId: string, timestamp: Date): Promise<boolean> {
    try {
      const oneDayBefore = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
      const oneDayAfter = new Date(timestamp.getTime() + 24 * 60 * 60 * 1000);
      
      // Check existing watch sessions for this video within 24 hours
      const sessionsQuery = query(
        collection(db, 'watchSessions'),
        where('userId', '==', userId),
        where('videoId', '==', videoId),
        where('startTime', '>=', oneDayBefore),
        where('startTime', '<=', oneDayAfter)
      );
      
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      if (sessionsSnapshot.size > 0) {
        console.log(`🔄 Found duplicate: ${videoId} already tracked via embed for user ${userId}`);
        return true; // Duplicate found
      }
      
      return false; // No duplicate
    } catch (error) {
      console.error('❌ Error checking for duplicates:', error);
      return false;
    }
  }

  /**
   * Sync YouTube watch history for a user (called by Cloud Function)
   */
  static async syncUserYouTubeHistory(userId: string): Promise<number> {
    try {
      console.log(`🔄 Starting YouTube sync for user ${userId}`);
      
      const watchEntries = await this.fetchYouTubeWatchHistory(userId);
      
      if (watchEntries.length === 0) {
        return 0;
      }
      
      // Filter out duplicates
      const deduplicatedEntries = [];
      for (const entry of watchEntries) {
        const isDuplicate = await this.deduplicateXP(userId, entry.videoId, entry.watchedAt);
        if (!isDuplicate) {
          deduplicatedEntries.push(entry);
        }
      }
      
      if (deduplicatedEntries.length > 0) {
        await this.processYouTubeWatchHistory(userId, deduplicatedEntries);
      }
      
      // Update last sync date
      const trackingRef = doc(db, 'userTrackingData', userId);
      await updateDoc(trackingRef, {
        lastYouTubeSyncDate: serverTimestamp(),
      });
      
      console.log(`✅ Completed YouTube sync for ${userId}: ${deduplicatedEntries.length} new entries`);
      return deduplicatedEntries.length;
    } catch (error) {
      console.error(`❌ Error syncing YouTube history for ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Get user's XP log history for analytics
   */
  static async getUserXPLogs(userId: string, limit: number = 100): Promise<XPLogEntry[]> {
    try {
      const logsQuery = query(
        collection(db, 'xpLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const logsSnapshot = await getDocs(logsQuery);
      const logs: XPLogEntry[] = [];
      
      logsSnapshot.forEach(doc => {
        const data = doc.data();
        logs.push({
          ...data,
          timestamp: data.timestamp.toDate(),
        } as XPLogEntry);
      });
      
      return logs;
    } catch (error) {
      console.error('❌ Error getting user XP logs:', error);
      return [];
    }
  }
}