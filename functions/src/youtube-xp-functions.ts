/**
 * Firebase Cloud Functions for YouTube XP Integration
 * Handles daily YouTube watch history sync and XP processing
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

// YouTube API Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// XP Configuration (matches client-side config)
const XP_CONFIG = {
  WATCH_TIME_XP_RATE: 0.1, // +1 XP per 10 seconds
  COMPLETION_BONUS_RATE: 0.1, // +10% bonus
  DAILY_XP_CAP: 360,
  SHARE_XP: 20,
  REFERRAL_XP: 50,
};

interface YouTubeWatchEntry {
  userId: string;
  videoId: string;
  watchedAt: Date;
  duration: number;
  estimatedWatchTime: number;
  completionRate: number;
  creatorId?: string;
}

/**
 * Parse YouTube duration format (PT4M13S) to seconds
 */
function parseYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Get creator video mappings from Firestore
 */
async function getCreatorVideoMappings(): Promise<Map<string, string>> {
  try {
    const creatorsSnapshot = await db.collection('creators').get();
    const videoToCreatorMap = new Map<string, string>();
    
    for (const creatorDoc of creatorsSnapshot.docs) {
      const creatorId = creatorDoc.id;
      const videosSnapshot = await db.collection('creatorVideos')
        .where('creatorId', '==', creatorId)
        .get();
      
      videosSnapshot.forEach(videoDoc => {
        const videoData = videoDoc.data();
        videoToCreatorMap.set(videoData.videoId, creatorId);
      });
    }
    
    console.log(`Loaded ${videoToCreatorMap.size} creator video mappings`);
    return videoToCreatorMap;
  } catch (error) {
    console.error('Error getting creator video mappings:', error);
    return new Map();
  }
}

/**
 * Fetch user's YouTube watch history via API
 */
async function fetchUserYouTubeHistory(userId: string, accessToken: string, maxResults: number = 50): Promise<YouTubeWatchEntry[]> {
  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }
    
    // Get user's tracking start date
    const trackingDoc = await db.collection('userTrackingData').doc(userId).get();
    if (!trackingDoc.exists) {
      throw new Error('User tracking data not found');
    }
    
    const trackingData = trackingDoc.data()!;
    const startTrackingDate = trackingData.startTrackingDate.toDate();
    
    // Fetch watch history from YouTube API
    const historyResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=HL&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!historyResponse.ok) {
      const errorText = await historyResponse.text();
      console.error('YouTube API error:', errorText);
      throw new Error(`YouTube API error: ${historyResponse.status}`);
    }
    
    const historyData = await historyResponse.json();
    const creatorVideoMap = await getCreatorVideoMappings();
    const watchEntries: YouTubeWatchEntry[] = [];
    
    for (const item of historyData.items || []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      
      const publishedAt = new Date(item.snippet?.publishedAt);
      
      // Only include videos watched after startTrackingDate
      if (publishedAt < startTrackingDate) continue;
      
      // Only include videos from tracked creators
      const creatorId = creatorVideoMap.get(videoId);
      if (!creatorId) continue;
      
      // Get video details for duration
      try {
        const videoResponse = await fetch(
          `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (videoResponse.ok) {
          const videoDetails = await videoResponse.json();
          const duration = parseYouTubeDuration(
            videoDetails.items?.[0]?.contentDetails?.duration || 'PT0S'
          );
          
          if (duration > 0) {
            // Estimate watch time (assume 70% completion on average for API data)
            const estimatedWatchTime = Math.floor(duration * 0.7);
            
            watchEntries.push({
              userId,
              videoId,
              watchedAt: publishedAt,
              duration,
              estimatedWatchTime,
              completionRate: 0.7,
              creatorId,
            });
          }
        }
      } catch (videoError) {
        console.warn(`Failed to get video details for ${videoId}:`, videoError);
      }
    }
    
    console.log(`Fetched ${watchEntries.length} YouTube entries for user ${userId}`);
    return watchEntries;
  } catch (error) {
    console.error('Error fetching YouTube history:', error);
    throw error;
  }
}

/**
 * Check if entry already exists to prevent duplicates
 */
async function isDuplicateEntry(userId: string, videoId: string, watchedAt: Date): Promise<boolean> {
  try {
    const entryId = `${userId}_${videoId}_${watchedAt.getTime()}`;
    const existingDoc = await db.collection('youtubeWatchHistory').doc(entryId).get();
    return existingDoc.exists;
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return false;
  }
}

/**
 * Process and award XP for YouTube watch entries
 */
async function processYouTubeEntries(entries: YouTubeWatchEntry[]): Promise<number> {
  const batch = db.batch();
  let totalXPAwarded = 0;
  
  for (const entry of entries) {
    const entryId = `${entry.userId}_${entry.videoId}_${entry.watchedAt.getTime()}`;
    
    // Skip duplicates
    if (await isDuplicateEntry(entry.userId, entry.videoId, entry.watchedAt)) {
      continue;
    }
    
    // Calculate XP
    const baseXP = Math.floor(entry.estimatedWatchTime * XP_CONFIG.WATCH_TIME_XP_RATE);
    let videoXP = baseXP;
    
    // Apply completion bonus
    if (entry.completionRate >= 0.9) {
      videoXP += Math.floor(baseXP * XP_CONFIG.COMPLETION_BONUS_RATE);
    }
    
    totalXPAwarded += videoXP;
    
    // Save watch history entry
    const historyRef = db.collection('youtubeWatchHistory').doc(entryId);
    batch.set(historyRef, {
      id: entryId,
      userId: entry.userId,
      videoId: entry.videoId,
      watchedAt: entry.watchedAt,
      duration: entry.duration,
      estimatedWatchTime: entry.estimatedWatchTime,
      completionRate: entry.completionRate,
      source: 'youtube_api',
      xpAwarded: videoXP,
      creatorId: entry.creatorId,
      processedAt: FieldValue.serverTimestamp(),
    });
    
    // Create XP log
    const xpLogRef = db.collection('xpLogs').doc(`${entryId}_xp`);
    batch.set(xpLogRef, {
      id: `${entryId}_xp`,
      userId: entry.userId,
      source: 'youtube_api',
      xpAmount: videoXP,
      videoId: entry.videoId,
      creatorId: entry.creatorId,
      timestamp: entry.watchedAt,
      details: {
        watchTime: entry.estimatedWatchTime,
        completionRate: entry.completionRate,
      },
    });
  }
  
  await batch.commit();
  return totalXPAwarded;
}

/**
 * Award XP to user while respecting daily caps
 */
async function awardXPToUser(userId: string, xpAmount: number): Promise<void> {
  await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data()!;
    const xpData = userData.xpData || {
      totalXP: 0,
      currentLevel: 1,
      dailyXP: 0,
      dailyCap: XP_CONFIG.DAILY_XP_CAP,
    };
    
    // Reset daily counters if new day
    const today = new Date().toISOString().split('T')[0];
    if (xpData.lastActiveDate !== today) {
      xpData.dailyXP = 0;
      xpData.lastActiveDate = today;
    }
    
    // Apply daily cap
    const remainingCap = XP_CONFIG.DAILY_XP_CAP - xpData.dailyXP;
    const xpToAward = Math.min(xpAmount, remainingCap);
    
    if (xpToAward > 0) {
      xpData.totalXP += xpToAward;
      xpData.dailyXP += xpToAward;
      
      // Recalculate level (using same formula as client)
      let level = 1;
      let totalRequired = 100;
      while (xpData.totalXP >= totalRequired && level < 100) {
        level++;
        totalRequired = Math.floor(100 * Math.pow(2.5, level - 1));
      }
      xpData.currentLevel = level;
      
      transaction.update(userRef, {
        xpData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      
      console.log(`Awarded ${xpToAward} XP to ${userId} (${xpAmount - xpToAward} capped)`);
    }
  });
}

/**
 * Callable function to manually sync user's YouTube history
 */
export const syncYouTubeHistory = onCall(
  { 
    cors: true,
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const userId = request.auth.uid;
    
    try {
      // Get user's YouTube tokens
      const trackingDoc = await db.collection('userTrackingData').doc(userId).get();
      if (!trackingDoc.exists) {
        throw new HttpsError('not-found', 'User tracking data not found');
      }
      
      const trackingData = trackingDoc.data()!;
      if (!trackingData.youtubeTokens?.accessToken) {
        throw new HttpsError('failed-precondition', 'No YouTube access token found');
      }
      
      // Check if token is expired
      if (trackingData.youtubeTokens.expiresAt.toDate() < new Date()) {
        throw new HttpsError('failed-precondition', 'YouTube token expired');
      }
      
      // Fetch and process YouTube history
      const watchEntries = await fetchUserYouTubeHistory(
        userId, 
        trackingData.youtubeTokens.accessToken
      );
      
      const totalXP = await processYouTubeEntries(watchEntries);
      
      if (totalXP > 0) {
        await awardXPToUser(userId, totalXP);
      }
      
      // Update last sync date
      await db.collection('userTrackingData').doc(userId).update({
        lastYouTubeSyncDate: FieldValue.serverTimestamp(),
      });
      
      return {
        success: true,
        entriesProcessed: watchEntries.length,
        xpAwarded: totalXP,
      };
    } catch (error) {
      console.error('Error in syncYouTubeHistory:', error);
      throw new HttpsError('internal', 'Failed to sync YouTube history');
    }
  }
);

/**
 * Scheduled function to sync YouTube history for all active users daily
 */
export const dailyYouTubeSync = onSchedule(
  { 
    schedule: '0 2 * * *', // 2 AM UTC daily
    timeZone: 'UTC',
    memory: '2GiB',
    timeoutSeconds: 540,
  },
  async () => {
    try {
      console.log('Starting daily YouTube sync...');
      
      // Get all users with YouTube connected and recent activity
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Active in last 7 days
      
      const usersSnapshot = await db.collection('userTrackingData')
        .where('youtubeConnected', '==', true)
        .where('preferences.trackOffPlatform', '==', true)
        .get();
      
      console.log(`Found ${usersSnapshot.size} users to sync`);
      
      const results = {
        processed: 0,
        successful: 0,
        failed: 0,
        totalXPAwarded: 0,
      };
      
      // Process users in batches to avoid memory issues
      const BATCH_SIZE = 10;
      for (let i = 0; i < usersSnapshot.docs.length; i += BATCH_SIZE) {
        const batch = usersSnapshot.docs.slice(i, i + BATCH_SIZE);
        
        await Promise.all(batch.map(async (userDoc) => {
          const userId = userDoc.id;
          const userData = userDoc.data();
          
          try {
            results.processed++;
            
            // Check if token is still valid
            if (!userData.youtubeTokens?.accessToken) {
              console.log(`Skipping ${userId}: No access token`);
              return;
            }
            
            if (userData.youtubeTokens.expiresAt.toDate() < new Date()) {
              console.log(`Skipping ${userId}: Token expired`);
              return;
            }
            
            // Skip if synced recently (within last 20 hours)
            const lastSync = userData.lastYouTubeSyncDate?.toDate();
            if (lastSync && (new Date().getTime() - lastSync.getTime()) < 20 * 60 * 60 * 1000) {
              console.log(`Skipping ${userId}: Recently synced`);
              return;
            }
            
            // Fetch and process YouTube history
            const watchEntries = await fetchUserYouTubeHistory(
              userId,
              userData.youtubeTokens.accessToken,
              25 // Smaller batch for scheduled function
            );
            
            if (watchEntries.length > 0) {
              const totalXP = await processYouTubeEntries(watchEntries);
              
              if (totalXP > 0) {
                await awardXPToUser(userId, totalXP);
                results.totalXPAwarded += totalXP;
              }
              
              console.log(`Synced ${userId}: ${watchEntries.length} entries, ${totalXP} XP`);
            }
            
            // Update sync date
            await db.collection('userTrackingData').doc(userId).update({
              lastYouTubeSyncDate: FieldValue.serverTimestamp(),
            });
            
            results.successful++;
          } catch (error) {
            console.error(`Error syncing ${userId}:`, error);
            results.failed++;
          }
        }));
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Daily YouTube sync completed:', results);
    } catch (error) {
      console.error('Error in daily YouTube sync:', error);
    }
  }
);

/**
 * Initialize user tracking when they first connect YouTube
 */
export const initializeYouTubeTracking = onCall(
  { 
    cors: true,
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { accessToken, refreshToken, expiresIn } = request.data;
    const userId = request.auth.uid;
    
    try {
      const expiresAt = new Date(Date.now() + (expiresIn * 1000));
      
      await db.collection('userTrackingData').doc(userId).set({
        userId,
        startTrackingDate: FieldValue.serverTimestamp(),
        youtubeConnected: true,
        youtubeTokens: {
          accessToken,
          refreshToken: refreshToken || null,
          expiresAt,
        },
        preferences: {
          trackYouTubeHistory: true,
          trackOffPlatform: true,
        },
      }, { merge: true });
      
      console.log(`Initialized YouTube tracking for ${userId}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error initializing YouTube tracking:', error);
      throw new HttpsError('internal', 'Failed to initialize tracking');
    }
  }
);