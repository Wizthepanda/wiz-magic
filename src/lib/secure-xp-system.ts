/**
 * Secure XP System - Production-ready XP tracking with Firestore transactions
 * Handles watch-to-earn XP, completion tracking, and duplicate prevention
 */

import { db } from './firebase';
import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  getDoc,
  collection
} from 'firebase/firestore';

// XP Configuration Constants
export const XP_RULES = {
  XP_PER_10_SECONDS: 1,      // +1 XP every 10 seconds watched
  COMPLETION_BONUS_RATE: 0.1, // +10% bonus for completing video  
  DAILY_XP_CAP: 360,          // Maximum XP per day
  MAX_XP_PER_UPDATE: 500,     // Security: max XP per single update
} as const;

interface XPResult {
  success: boolean;
  xpAwarded: number;
  newLevel: number;
  leveledUp: boolean;
  alreadyCompleted?: boolean;
  error?: string;
}

interface VideoProgress {
  videoId: string;
  userId: string;
  watchTimeSeconds: number;
  totalDurationSeconds: number;
  isCompleted: boolean;
  lastXpUpdate: number; // Track last XP update time to prevent rapid spam
}

/**
 * Calculate level from XP using predefined thresholds
 */
function calculateLevel(currentXP: number): number {
  const thresholds = [0, 100, 300, 800, 1600, 3000, 6000, 12000, 24000, 50000, 100000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (currentXP >= thresholds[i]) {
      return Math.min(i + 1, 10); // Max level 10
    }
  }
  return 1;
}

/**
 * Check if enough time has passed since last XP update (anti-spam)
 */
function canUpdateXP(lastUpdate: number): boolean {
  const now = Date.now();
  const MIN_UPDATE_INTERVAL = 5000; // 5 seconds minimum between updates
  return (now - lastUpdate) >= MIN_UPDATE_INTERVAL;
}

/**
 * Main XP award function with secure transaction logic
 * Awards +1 XP per 10 seconds watched, marks completion at 100%, prevents duplicates
 */
export async function awardXpForWatch(
  userId: string,
  videoId: string, 
  watchTimeInSeconds: number,
  videoDurationSeconds: number
): Promise<XPResult> {
  
  console.log(`🎯 Processing XP award: User ${userId}, Video ${videoId}, Watch time: ${watchTimeInSeconds}s`);
  
  try {
    // Input validation
    if (!userId || !videoId || watchTimeInSeconds < 0 || videoDurationSeconds <= 0) {
      console.error('❌ Invalid parameters provided');
      return {
        success: false,
        xpAwarded: 0,
        newLevel: 1,
        leveledUp: false,
        error: 'Invalid parameters'
      };
    }

    // Calculate completion percentage
    const completionPercentage = Math.min(watchTimeInSeconds / videoDurationSeconds, 1.0);
    const isFullyCompleted = completionPercentage >= 1.0;

    return await runTransaction(db, async (transaction) => {
      // Get user document
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = userDoc.data();
      const currentXP = userData.currentXP || 0;
      const currentLevel = userData.level || 1;
      let dailyXpEarned = userData.dailyXpEarned || 0;
      const lastXpReset = userData.lastXpReset?.toDate();

      // Check if daily reset is needed
      const now = new Date();
      const shouldResetDaily = !lastXpReset || 
        lastXpReset.toDateString() !== now.toDateString();
      
      if (shouldResetDaily) {
        dailyXpEarned = 0;
      }

      // Get video progress document
      const videoProgressRef = doc(db, 'users', userId, 'videos', videoId);
      const videoProgressDoc = await transaction.get(videoProgressRef);
      
      let videoProgress: VideoProgress;
      const lastUpdate = Date.now();
      
      if (videoProgressDoc.exists()) {
        const data = videoProgressDoc.data();
        videoProgress = {
          videoId,
          userId,
          watchTimeSeconds: data.watchTimeSeconds || 0,
          totalDurationSeconds: videoDurationSeconds,
          isCompleted: data.isCompleted || false,
          lastXpUpdate: data.lastXpUpdate || 0
        };

        // Check if already completed (prevent duplicate XP)
        if (videoProgress.isCompleted && isFullyCompleted) {
          console.log(`⚠️ Video ${videoId} already completed by user ${userId}`);
          return {
            success: false,
            xpAwarded: 0,
            newLevel: currentLevel,
            leveledUp: false,
            alreadyCompleted: true
          };
        }

        // Anti-spam: Check minimum time between updates
        if (!canUpdateXP(videoProgress.lastXpUpdate)) {
          console.log(`⚠️ XP update too frequent for ${videoId}`);
          return {
            success: false,
            xpAwarded: 0,
            newLevel: currentLevel,
            leveledUp: false,
            error: 'Update too frequent'
          };
        }
      } else {
        // First time watching this video
        videoProgress = {
          videoId,
          userId,
          watchTimeSeconds: 0,
          totalDurationSeconds: videoDurationSeconds,
          isCompleted: false,
          lastXpUpdate: 0
        };
      }

      // Calculate XP to award based on new watch time
      const previousWatchTime = videoProgress.watchTimeSeconds;
      const newWatchTime = Math.max(watchTimeInSeconds, previousWatchTime);
      const additionalWatchTime = newWatchTime - previousWatchTime;
      
      // Award +1 XP per 10 seconds of NEW watch time
      const baseXP = Math.floor(additionalWatchTime / 10);
      let totalXPToAward = baseXP;

      // Completion bonus: +10% if completing for first time
      let completionBonus = 0;
      const nowCompleting = isFullyCompleted && !videoProgress.isCompleted;
      if (nowCompleting) {
        completionBonus = Math.floor(baseXP * XP_RULES.COMPLETION_BONUS_RATE);
        totalXPToAward += completionBonus;
        console.log(`🎉 Video completion bonus: +${completionBonus} XP`);
      }

      // Apply daily XP cap
      if (totalXPToAward > 0) {
        const remainingDailyXP = XP_RULES.DAILY_XP_CAP - dailyXpEarned;
        if (remainingDailyXP <= 0) {
          console.log(`⚠️ Daily XP cap reached for user ${userId}`);
          return {
            success: false,
            xpAwarded: 0,
            newLevel: currentLevel,
            leveledUp: false,
            error: 'Daily XP cap reached'
          };
        }
        totalXPToAward = Math.min(totalXPToAward, remainingDailyXP);
      }

      // Security check: prevent excessive XP awards
      if (totalXPToAward > XP_RULES.MAX_XP_PER_UPDATE) {
        console.error(`❌ Excessive XP award attempted: ${totalXPToAward}`);
        return {
          success: false,
          xpAwarded: 0,
          newLevel: currentLevel,
          leveledUp: false,
          error: 'Excessive XP amount'
        };
      }

      // Skip if no XP to award
      if (totalXPToAward <= 0) {
        // Still update video progress even if no XP awarded
        transaction.update(videoProgressRef, {
          watchTimeSeconds: newWatchTime,
          isCompleted: isFullyCompleted,
          lastUpdated: serverTimestamp(),
          lastXpUpdate: lastUpdate
        });

        return {
          success: false,
          xpAwarded: 0,
          newLevel: currentLevel,
          leveledUp: false,
          error: 'No XP to award'
        };
      }

      // Calculate new user stats
      const newCurrentXP = currentXP + totalXPToAward;
      const newLevel = calculateLevel(newCurrentXP);
      const leveledUp = newLevel > currentLevel;
      const newDailyXP = shouldResetDaily ? totalXPToAward : dailyXpEarned + totalXPToAward;

      // Update user document
      const userUpdate: any = {
        currentXP: newCurrentXP,
        level: newLevel,
        dailyXpEarned: newDailyXP,
        lastActivity: serverTimestamp()
      };

      if (shouldResetDaily) {
        userUpdate.lastXpReset = serverTimestamp();
      }

      transaction.update(userRef, userUpdate);

      // Update video progress
      transaction.update(videoProgressRef, {
        watchTimeSeconds: newWatchTime,
        totalDurationSeconds: videoDurationSeconds,
        isCompleted: isFullyCompleted,
        lastUpdated: serverTimestamp(),
        lastXpUpdate: lastUpdate,
        xpEarned: (videoProgressDoc.exists() ? videoProgressDoc.data().xpEarned || 0 : 0) + totalXPToAward
      });

      // Log completion if video just completed
      if (nowCompleting) {
        const completionRef = doc(collection(db, 'users', userId, 'completedVideos'));
        transaction.set(completionRef, {
          videoId,
          completedAt: serverTimestamp(),
          xpAwarded: totalXPToAward,
          watchTime: newWatchTime,
          duration: videoDurationSeconds
        });

        // Add to completed videos array for backward compatibility
        const completedVideos = userData.completedVideos || [];
        if (!completedVideos.includes(videoId)) {
          transaction.update(userRef, {
            completedVideos: [...completedVideos, videoId]
          });
        }
      }

      // Log level-up if it occurred
      if (leveledUp) {
        const levelUpRef = doc(collection(db, 'users', userId, 'levelUps'));
        transaction.set(levelUpRef, {
          previousLevel: currentLevel,
          newLevel: newLevel,
          totalXP: newCurrentXP,
          timestamp: serverTimestamp(),
          videoId,
          source: 'watch_time'
        });
        
        console.log(`🎉 Level up! User ${userId}: Level ${currentLevel} → ${newLevel}`);
      }

      console.log(`✅ XP awarded successfully: ${totalXPToAward} XP to user ${userId} (${baseXP} base + ${completionBonus} bonus)`);

      return {
        success: true,
        xpAwarded: totalXPToAward,
        newLevel,
        leveledUp,
        alreadyCompleted: false
      };
    });

  } catch (error) {
    console.error('❌ Error awarding XP:', error);
    return {
      success: false,
      xpAwarded: 0,
      newLevel: 1,
      leveledUp: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get current video progress for a user
 */
export async function getVideoProgress(userId: string, videoId: string): Promise<VideoProgress | null> {
  try {
    const videoProgressRef = doc(db, 'users', userId, 'videos', videoId);
    const videoProgressDoc = await getDoc(videoProgressRef);
    
    if (!videoProgressDoc.exists()) {
      return null;
    }

    const data = videoProgressDoc.data();
    return {
      videoId,
      userId,
      watchTimeSeconds: data.watchTimeSeconds || 0,
      totalDurationSeconds: data.totalDurationSeconds || 0,
      isCompleted: data.isCompleted || false,
      lastXpUpdate: data.lastXpUpdate || 0
    };
  } catch (error) {
    console.error('Error getting video progress:', error);
    return null;
  }
}

/**
 * Check if a video is completed by a user
 */
export async function isVideoCompleted(userId: string, videoId: string): Promise<boolean> {
  try {
    const progress = await getVideoProgress(userId, videoId);
    return progress?.isCompleted || false;
  } catch (error) {
    console.error('Error checking video completion:', error);
    return false;
  }
}