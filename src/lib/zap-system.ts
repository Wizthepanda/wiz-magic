/**
 * WIZ ZAP & Leveling System
 * Comprehensive ZAP tracking and leveling system for Wizards
 */

import { db, auth } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

// ZAP System Constants - Production-Ready
export const ZAP_CONFIG = {
  WATCH_TIME_ZAP_RATE: 0.1, // +1 ZAP per 10 seconds (0.1 ZAP per second)
  DAILY_ZAP_CAP: 360, // Maximum ZAPs per day from watch time
  COMPLETION_BONUS_RATE: 0.1, // +10% bonus for full video completion
  COMPLETION_THRESHOLD: 0.9, // Must watch 90% of video for bonus
  SHARE_ZAP: 20, // +20 ZAPs per share
  REFERRAL_ZAP: 50, // +50 ZAPs per referral
  DAILY_RESET_HOUR: 0, // Hour to reset daily counters (0 = midnight UTC)
  ANTI_CHEAT_PING_INTERVAL: 10000, // 10 seconds between heartbeat pings
  FOCUS_REQUIRED: true, // Require tab focus to award ZAPs
  STREAK_THRESHOLD: 3, // Videos needed for streak bonus
  DAILY_STREAK_ZAP: 25, // +25 ZAPs for daily streak
  MAX_DAILY_SHARES: 5, // Maximum shares per day for ZAPs
  BOOSTED_MULTIPLIER: 1.5, // 1.5x multiplier for boosted videos
};

// ZAP Level Thresholds - Exact requirements
export const LEVEL_THRESHOLDS = {
  1: 100,
  2: 300,
  3: 800,
  4: 1600,
  5: 3000,
  6: 6000,
  7: 12000,
  8: 24000,
  9: 50000,
  10: 100000,
};

// Calculate level from total ZAPs using exact thresholds
export const calculateLevel = (currentZAPs: number) => {
  let level = 1;

  // Find current level based on thresholds
  // Each threshold represents the minimum ZAPs needed to reach that level
  for (let i = 10; i >= 1; i--) {
    if (currentZAPs >= LEVEL_THRESHOLDS[i as keyof typeof LEVEL_THRESHOLDS]) {
      level = i + 1; // If you have enough ZAPs for level i, you're at level i+1
      break;
    }
  }

  // Handle edge case - ensure level is within valid range
  if (level > 10) level = 10;
  if (level < 1) level = 1;

  // Calculate ZAPs for current and next levels
  const zapsForCurrentLevel = level === 1 ? 0 : LEVEL_THRESHOLDS[(level - 1) as keyof typeof LEVEL_THRESHOLDS];
  const zapsForNextLevel = level === 10 ? LEVEL_THRESHOLDS[10] : LEVEL_THRESHOLDS[level as keyof typeof LEVEL_THRESHOLDS];

  // Calculate progress within current level
  const currentLevelZAPs = currentZAPs - zapsForCurrentLevel;
  const nextLevelZAPs = zapsForNextLevel - zapsForCurrentLevel;
  const progressPercent = nextLevelZAPs > 0 ? (currentLevelZAPs / nextLevelZAPs) * 100 : 100;

  return {
    level,
    currentLevelZAPs,
    nextLevelZAPs,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    totalZAPs: currentZAPs,
    zapsToNextLevel: Math.max(0, nextLevelZAPs - currentLevelZAPs),
    zapsForCurrentLevel,
    zapsForNextLevel
  };
};

// Calculate potential ZAPs for a video based on duration
export const calculateVideoZAPs = (durationString: string, isBoosted: boolean = false): number => {
  // Parse duration string to seconds
  const parseDuration = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // H:MM:SS
    }
    return 0;
  };

  const videoDurationSeconds = parseDuration(durationString);
  if (videoDurationSeconds <= 0) return 0;

  // Calculate base ZAPs from watch time
  let baseZAPs = videoDurationSeconds * ZAP_CONFIG.WATCH_TIME_ZAP_RATE;

  // Add completion bonus (10%)
  baseZAPs += baseZAPs * ZAP_CONFIG.COMPLETION_BONUS_RATE;

  // Apply boosted multiplier if applicable
  if (isBoosted) {
    baseZAPs *= ZAP_CONFIG.BOOSTED_MULTIPLIER;
  }

  return Math.floor(baseZAPs);
};

// Firestore Schema Interfaces
export interface ZAPData {
  userId: string;
  totalZAPs: number;
  level: number;
  dailyZAPs: number;
  dailyShares: number;
  dailyVideosWatched: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  lastZAPUpdate: Date;
  completedVideos: string[]; // Array of video IDs that have been completed for ZAPs
  lifetimeStats: {
    totalWatchTime: number;
    totalShares: number;
    totalReferrals: number;
    totalVideosCompleted: number;
  };
}

export interface WatchSession {
  userId: string;
  videoId: string;
  sessionId: string;
  startTime: Date;
  lastPing: Date;
  totalWatchTime: number;
  zapsEarned: number;
  isActive: boolean;
  tabFocused: boolean;
  isBoosted: boolean;
  completionRate: number;
}

export interface DailyZAPLog {
  userId: string;
  date: string; // YYYY-MM-DD
  watchTimeZAPs: number;
  completionBonusZAPs: number;
  shareZAPs: number;
  streakBonusZAPs: number;
  referralZAPs: number;
  totalDailyZAPs: number;
  videosWatched: number;
  shares: number;
  referrals: number;
}

export class ZAPSystem {
  /**
   * Check for duplicate ZAPs between different tracking sources
   */
  static async checkForDuplicateZAPs(
    userId: string,
    videoId: string,
    timestamp: Date,
    source: 'embed' | 'youtube_api'
  ): Promise<boolean> {
    try {
      const oneDayBefore = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
      const oneDayAfter = new Date(timestamp.getTime() + 24 * 60 * 60 * 1000);

      // Check for opposite source within 24 hour window
      const oppositeSource = source === 'embed' ? 'youtube_api' : 'embed';

      if (oppositeSource === 'youtube_api') {
        // Check YouTube watch history
        const youtubeQuery = query(
          collection(db, 'youtubeWatchHistory'),
          where('userId', '==', userId),
          where('videoId', '==', videoId),
          where('watchedAt', '>=', oneDayBefore),
          where('watchedAt', '<=', oneDayAfter)
        );

        const youtubeSnapshot = await getDocs(youtubeQuery);
        return youtubeSnapshot.size > 0;
      } else {
        // Check embed watch sessions
        const embedQuery = query(
          collection(db, 'watchSessions'),
          where('userId', '==', userId),
          where('videoId', '==', videoId),
          where('startTime', '>=', oneDayBefore),
          where('startTime', '<=', oneDayAfter)
        );

        const embedSnapshot = await getDocs(embedQuery);
        return embedSnapshot.size > 0;
      }
    } catch (error) {
      console.error('Error checking for duplicate ZAPs:', error);
      return false;
    }
  }

  /**
   * Initialize user ZAP data
   */
  static async initializeUserZAPs(userId: string): Promise<ZAPData> {
    try {
      const zapRef = doc(db, 'userZAPs', userId);
      const zapDoc = await getDoc(zapRef);

      if (!zapDoc.exists()) {
        const today = new Date().toISOString().split('T')[0];
        const initialZAPData: ZAPData = {
          userId,
          totalZAPs: 0,
          level: 1,
          dailyZAPs: 0,
          dailyShares: 0,
          dailyVideosWatched: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: today,
          lastZAPUpdate: new Date(),
          completedVideos: [],
          lifetimeStats: {
            totalWatchTime: 0,
            totalShares: 0,
            totalReferrals: 0,
            totalVideosCompleted: 0
          }
        };

        await setDoc(zapRef, {
          ...initialZAPData,
          lastZAPUpdate: serverTimestamp()
        });

        console.log(`⚡ ZAP System: Initialized user ${userId}`);
        return initialZAPData;
      }

      const data = zapDoc.data() as ZAPData;
      return {
        ...data,
        lastZAPUpdate: data.lastZAPUpdate || new Date()
      };
    } catch (error) {
      console.error('Error initializing user ZAPs:', error);
      throw error;
    }
  }

  /**
   * Get user ZAP data
   */
  static async getUserZAPs(userId: string): Promise<ZAPData | null> {
    try {
      const zapRef = doc(db, 'userZAPs', userId);
      const zapDoc = await getDoc(zapRef);

      if (zapDoc.exists()) {
        const data = zapDoc.data() as ZAPData;
        return {
          ...data,
          lastZAPUpdate: data.lastZAPUpdate || new Date()
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user ZAPs:', error);
      return null;
    }
  }

  /**
   * Sync user level based on totalZAPs (fixes level mismatches)
   */
  static async syncUserLevel(userId: string, correctLevel: number): Promise<void> {
    try {
      const zapRef = doc(db, 'userZAPs', userId);
      await updateDoc(zapRef, {
        level: correctLevel
      });
      console.log(`✅ Synced level for user ${userId} to Level ${correctLevel}`);
    } catch (error) {
      console.error('Error syncing user level:', error);
    }
  }

  /**
   * Reset daily counters if it's a new day
   */
  static async checkAndResetDailyCounters(userId: string): Promise<ZAPData> {
    try {
      const zapData = await this.getUserZAPs(userId) || await this.initializeUserZAPs(userId);
      const today = new Date().toISOString().split('T')[0];

      if (zapData.lastActivityDate !== today) {
        // New day - reset daily counters
        const wasActiveYesterday = zapData.dailyVideosWatched >= ZAP_CONFIG.STREAK_THRESHOLD;
        const newStreak = wasActiveYesterday ? zapData.currentStreak + 1 : 0;

        const updatedData: Partial<ZAPData> = {
          dailyZAPs: 0,
          dailyShares: 0,
          dailyVideosWatched: 0,
          currentStreak: newStreak,
          longestStreak: Math.max(zapData.longestStreak, newStreak),
          lastActivityDate: today
        };

        const zapRef = doc(db, 'userZAPs', userId);
        await updateDoc(zapRef, {
          ...updatedData,
          lastZAPUpdate: serverTimestamp()
        });

        console.log(`🗓️ ZAP System: Reset daily counters for ${userId}, streak: ${newStreak}`);
        return { ...zapData, ...updatedData };
      }

      return zapData;
    } catch (error) {
      console.error('Error checking daily counters:', error);
      throw error;
    }
  }

  /**
   * Check if user has already completed this video for ZAPs
   */
  static async hasVideoBeenCompleted(userId: string, videoId: string): Promise<boolean> {
    try {
      const zapData = await this.getUserZAPs(userId);
      if (!zapData || !zapData.completedVideos) return false;
      return zapData.completedVideos.includes(videoId);
    } catch (error) {
      console.error('Error checking video completion:', error);
      return false;
    }
  }

  /**
   * Mark video as completed for ZAPs (one-time earning)
   */
  static async markVideoAsCompleted(userId: string, videoId: string): Promise<void> {
    try {
      const zapRef = doc(db, 'userZAPs', userId);
      const zapData = await this.getUserZAPs(userId);

      if (!zapData) return;

      // Only add if not already completed
      if (!zapData.completedVideos?.includes(videoId)) {
        const updatedCompletedVideos = [...(zapData.completedVideos || []), videoId];

        await updateDoc(zapRef, {
          completedVideos: updatedCompletedVideos,
          lastZAPUpdate: serverTimestamp()
        });

        console.log(`✅ ZAP System: Marked video ${videoId} as completed for user ${userId}`);
      }
    } catch (error) {
      console.error('Error marking video as completed:', error);
    }
  }

  /**
   * Award ZAPs for watch time with all bonuses and caps
   */
  static async awardWatchTimeZAPs(
    userId: string,
    videoId: string,
    watchTimeSeconds: number,
    completionRate: number,
    isBoosted: boolean = false
  ): Promise<number> {
    console.log(`🎯 ZAPSystem.awardWatchTimeZAPs called:`, {
      userId,
      videoId,
      watchTimeSeconds,
      completionRate,
      isBoosted
    });

    try {
      const zapData = await this.checkAndResetDailyCounters(userId);
      console.log(`📊 Current ZAP data:`, {
        totalZAPs: zapData.totalZAPs,
        dailyZAPs: zapData.dailyZAPs,
        level: zapData.level
      });

      // Check if video has already been completed for ZAPs
      const hasBeenCompleted = await this.hasVideoBeenCompleted(userId, videoId);
      console.log(`🔍 Video ${videoId} hasBeenCompleted: ${hasBeenCompleted}`);

      // Check daily ZAP cap
      if (zapData.dailyZAPs >= ZAP_CONFIG.DAILY_ZAP_CAP) {
        console.log(`⏰ ZAP System: Daily cap reached for ${userId}`);
        return 0;
      }

      // If video has been completed, only allow minimal progress ZAPs (no completion bonus)
      if (hasBeenCompleted) {
        // Allow small watch time ZAPs for rewatching but no completion bonus
        const baseZAPs = Math.floor(watchTimeSeconds * ZAP_CONFIG.WATCH_TIME_ZAP_RATE * 0.1); // 10% of normal rate
        const remainingCap = ZAP_CONFIG.DAILY_ZAP_CAP - zapData.dailyZAPs;
        const actualZAPs = Math.min(baseZAPs, remainingCap);

        if (actualZAPs > 0) {
          const zapRef = doc(db, 'userZAPs', userId);
          const newTotalZAPs = zapData.totalZAPs + actualZAPs;
          const newLevel = calculateLevel(newTotalZAPs).level;

          await updateDoc(zapRef, {
            totalZAPs: newTotalZAPs,
            level: newLevel,
            dailyZAPs: zapData.dailyZAPs + actualZAPs,
            lastZAPUpdate: serverTimestamp(),
            'lifetimeStats.totalWatchTime': increment(watchTimeSeconds)
          });

          this.dispatchZAPUpdateEvent(userId, newTotalZAPs, actualZAPs);
        }

        console.log(`🔄 ZAP System: Rewatch - Awarded ${actualZAPs} ZAPs to ${userId} for ${videoId} (already completed)`);
        return actualZAPs;
      }

      // Calculate base ZAPs from watch time (first time watching)
      let baseZAPs = Math.floor(watchTimeSeconds * ZAP_CONFIG.WATCH_TIME_ZAP_RATE);

      // Apply completion bonus if >90% watched
      const isVideoCompleted = completionRate >= ZAP_CONFIG.COMPLETION_THRESHOLD;
      if (isVideoCompleted) {
        baseZAPs += Math.floor(baseZAPs * ZAP_CONFIG.COMPLETION_BONUS_RATE);
      }

      // Apply boosted video multiplier
      if (isBoosted) {
        baseZAPs = Math.floor(baseZAPs * ZAP_CONFIG.BOOSTED_MULTIPLIER);
      }

      // Apply daily cap
      const remainingCap = ZAP_CONFIG.DAILY_ZAP_CAP - zapData.dailyZAPs;
      const actualZAPs = Math.min(baseZAPs, remainingCap);

      if (actualZAPs <= 0) return 0;

      // Update ZAP data
      const zapRef = doc(db, 'userZAPs', userId);
      const newTotalZAPs = zapData.totalZAPs + actualZAPs;
      const newLevel = calculateLevel(newTotalZAPs).level;

      const updateData: Record<string, unknown> = {
        totalZAPs: newTotalZAPs,
        level: newLevel,
        dailyZAPs: zapData.dailyZAPs + actualZAPs,
        dailyVideosWatched: increment(1),
        lastZAPUpdate: serverTimestamp(),
        'lifetimeStats.totalWatchTime': increment(watchTimeSeconds)
      };

      // Mark video as completed if threshold met
      if (isVideoCompleted) {
        updateData['lifetimeStats.totalVideosCompleted'] = increment(1);
        // Mark as completed to prevent duplicate ZAPs
        await this.markVideoAsCompleted(userId, videoId);
      }

      await updateDoc(zapRef, updateData);

      // Log daily ZAPs
      await this.logDailyZAPs(userId, 'watchTime', actualZAPs);

      // Dispatch level up event if level changed
      if (newLevel > zapData.level) {
        this.dispatchLevelUpEvent(userId, newLevel, zapData.level);
      }

      // Dispatch ZAP update event to frontend
      this.dispatchZAPUpdateEvent(userId, newTotalZAPs, actualZAPs);

      console.log(`⚡ ZAP System: Awarded ${actualZAPs} ZAPs to ${userId} for watching ${videoId}${isVideoCompleted ? ' (COMPLETED)' : ''}`);
      return actualZAPs;
    } catch (error) {
      console.error('Error awarding watch time ZAPs:', error);
      return 0;
    }
  }

  /**
   * Award ZAPs for sharing videos
   */
  static async awardShareZAPs(userId: string, videoId: string): Promise<number> {
    try {
      const zapData = await this.checkAndResetDailyCounters(userId);

      // Check daily share limit
      if (zapData.dailyShares >= ZAP_CONFIG.MAX_DAILY_SHARES) {
        console.log(`📤 ZAP System: Daily share limit reached for ${userId}`);
        return 0;
      }

      const shareZAPs = ZAP_CONFIG.SHARE_ZAP;
      const zapRef = doc(db, 'userZAPs', userId);
      const newTotalZAPs = zapData.totalZAPs + shareZAPs;
      const newLevel = calculateLevel(newTotalZAPs).level;

      await updateDoc(zapRef, {
        totalZAPs: newTotalZAPs,
        level: newLevel,
        dailyShares: zapData.dailyShares + 1,
        lastZAPUpdate: serverTimestamp(),
        'lifetimeStats.totalShares': increment(1)
      });

      // Log daily ZAPs
      await this.logDailyZAPs(userId, 'share', shareZAPs);

      if (newLevel > zapData.level) {
        this.dispatchLevelUpEvent(userId, newLevel, zapData.level);
      }

      // Dispatch ZAP update event to frontend
      this.dispatchZAPUpdateEvent(userId, newTotalZAPs, shareZAPs);

      console.log(`📤 ZAP System: Awarded ${shareZAPs} ZAPs to ${userId} for sharing ${videoId}`);
      return shareZAPs;
    } catch (error) {
      console.error('Error awarding share ZAPs:', error);
      return 0;
    }
  }

  /**
   * Award ZAPs for successful referral
   */
  static async awardReferralZAPs(referrerUserId: string, newUserId: string): Promise<number> {
    try {
      const zapData = await this.checkAndResetDailyCounters(referrerUserId);

      const referralZAPs = ZAP_CONFIG.REFERRAL_ZAP;
      const zapRef = doc(db, 'userZAPs', referrerUserId);
      const newTotalZAPs = zapData.totalZAPs + referralZAPs;
      const newLevel = calculateLevel(newTotalZAPs).level;

      await updateDoc(zapRef, {
        totalZAPs: newTotalZAPs,
        level: newLevel,
        lastZAPUpdate: serverTimestamp(),
        'lifetimeStats.totalReferrals': increment(1)
      });

      // Log daily ZAPs
      await this.logDailyZAPs(referrerUserId, 'referral', referralZAPs);

      if (newLevel > zapData.level) {
        this.dispatchLevelUpEvent(referrerUserId, newLevel, zapData.level);
      }

      // Dispatch ZAP update event to frontend
      this.dispatchZAPUpdateEvent(referrerUserId, newTotalZAPs, referralZAPs);

      console.log(`👥 ZAP System: Awarded ${referralZAPs} ZAPs to ${referrerUserId} for referring ${newUserId}`);
      return referralZAPs;
    } catch (error) {
      console.error('Error awarding referral ZAPs:', error);
      return 0;
    }
  }

  /**
   * Check and award daily streak bonus
   */
  static async checkStreakBonus(userId: string): Promise<number> {
    try {
      const zapData = await this.getUserZAPs(userId);
      if (!zapData) return 0;

      // Check if user qualifies for streak bonus (3+ videos watched today)
      if (zapData.dailyVideosWatched >= ZAP_CONFIG.STREAK_THRESHOLD && zapData.currentStreak > 0) {
        // Check if streak bonus already awarded today
        const today = new Date().toISOString().split('T')[0];
        const dailyLogRef = doc(db, 'dailyZAPs', `${userId}_${today}`);
        const dailyLog = await getDoc(dailyLogRef);

        if (!dailyLog.exists() || !dailyLog.data()?.streakBonusZAPs) {
          const streakZAPs = ZAP_CONFIG.DAILY_STREAK_ZAP;
          const zapRef = doc(db, 'userZAPs', userId);
          const newTotalZAPs = zapData.totalZAPs + streakZAPs;
          const newLevel = calculateLevel(newTotalZAPs).level;

          await updateDoc(zapRef, {
            totalZAPs: newTotalZAPs,
            level: newLevel,
            lastZAPUpdate: serverTimestamp()
          });

          // Log daily ZAPs
          await this.logDailyZAPs(userId, 'streak', streakZAPs);

          if (newLevel > zapData.level) {
            this.dispatchLevelUpEvent(userId, newLevel, zapData.level);
          }

          // Dispatch ZAP update event to frontend
          this.dispatchZAPUpdateEvent(userId, newTotalZAPs, streakZAPs);

          console.log(`🔥 ZAP System: Awarded ${streakZAPs} streak bonus ZAPs to ${userId}`);
          return streakZAPs;
        }
      }

      return 0;
    } catch (error) {
      console.error('Error checking streak bonus:', error);
      return 0;
    }
  }

  /**
   * Log daily ZAPs for analytics
   */
  private static async logDailyZAPs(
    userId: string,
    source: 'watchTime' | 'completion' | 'share' | 'referral' | 'streak',
    zapAmount: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyLogRef = doc(db, 'dailyZAPs', `${userId}_${today}`);

      const updateData: Record<string, unknown> = {
        userId,
        date: today,
        lastUpdated: serverTimestamp()
      };

      switch (source) {
        case 'watchTime':
          updateData.watchTimeZAPs = increment(zapAmount);
          updateData.videosWatched = increment(1);
          break;
        case 'completion':
          updateData.completionBonusZAPs = increment(zapAmount);
          break;
        case 'share':
          updateData.shareZAPs = increment(zapAmount);
          updateData.shares = increment(1);
          break;
        case 'referral':
          updateData.referralZAPs = increment(zapAmount);
          updateData.referrals = increment(1);
          break;
        case 'streak':
          updateData.streakBonusZAPs = increment(zapAmount);
          break;
      }

      updateData.totalDailyZAPs = increment(zapAmount);

      await setDoc(dailyLogRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error logging daily ZAPs:', error);
    }
  }

  /**
   * Dispatch level up event to frontend
   */
  private static dispatchLevelUpEvent(userId: string, newLevel: number, oldLevel: number): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('levelUp', {
        detail: { userId, newLevel, oldLevel }
      });
      window.dispatchEvent(event);
      console.log(`🎉 ZAP System: Level up! ${userId} reached level ${newLevel}`);
    }
  }

  /**
   * Dispatch ZAP update event to frontend
   */
  static dispatchZAPUpdateEvent(userId: string, totalZAPs: number, zapsGained: number): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('zapsUpdated', {
        detail: { userId, totalZAPs, zapsGained }
      });
      window.dispatchEvent(event);
      console.log(`⚡ ZAP System: ZAPs updated for ${userId}: +${zapsGained} (total: ${totalZAPs})`);
    }
  }
}