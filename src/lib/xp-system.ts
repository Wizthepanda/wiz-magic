/**
 * WIZ XP & Leveling System
 * Comprehensive experience point tracking and leveling system for Wizards
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

// XP System Constants - Production-Ready per prompt requirements
export const XP_CONFIG = {
  WATCH_TIME_XP_RATE: 0.1, // +1 XP per 10 seconds (0.1 XP per second)
  DAILY_XP_CAP: 360, // Maximum XP per day from watch time
  COMPLETION_BONUS_RATE: 0.1, // +10% bonus for full video completion
  COMPLETION_THRESHOLD: 1.0, // Must complete full video for bonus
  SHARE_XP: 20, // +20 XP per share
  REFERRAL_XP: 50, // +50 XP per referral
  DAILY_RESET_HOUR: 0, // Hour to reset daily counters (0 = midnight UTC)
  ANTI_CHEAT_PING_INTERVAL: 10000, // 10 seconds between heartbeat pings
  FOCUS_REQUIRED: true, // Require tab focus to award XP
};

// XP Level Thresholds - Exact requirements from prompt
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

// Calculate level from total XP using exact thresholds
export const calculateLevel = (currentXP: number) => {
  let level = 1;
  
  // Find current level based on thresholds
  for (let i = 10; i >= 1; i--) {
    if (currentXP >= LEVEL_THRESHOLDS[i as keyof typeof LEVEL_THRESHOLDS]) {
      level = i + 1;
      break;
    }
  }
  
  // Handle edge case for max level
  if (level > 10) level = 10;
  
  // Calculate XP for current and next levels
  const xpForCurrentLevel = level === 1 ? 0 : LEVEL_THRESHOLDS[(level - 1) as keyof typeof LEVEL_THRESHOLDS];
  const xpForNextLevel = level === 10 ? LEVEL_THRESHOLDS[10] : LEVEL_THRESHOLDS[level as keyof typeof LEVEL_THRESHOLDS];
  
  // Calculate progress within current level
  const currentLevelXP = currentXP - xpForCurrentLevel;
  const nextLevelXP = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = nextLevelXP > 0 ? (currentLevelXP / nextLevelXP) * 100 : 100;
  
  return {
    level,
    currentLevelXP,
    nextLevelXP,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    totalXP: currentXP,
    xpToNextLevel: Math.max(0, nextLevelXP - currentLevelXP),
    xpForCurrentLevel,
    xpForNextLevel
  };
};

// Firestore Schema Interfaces - per prompt requirements (/users/{uid})
export interface XPData {
  userId: string;
  currentXP: number;
  level: number;
  dailyXpEarned: number;
  lastXpReset: Date;
}

export interface WatchSession {
  userId: string;
  videoId: string;
  sessionId: string;
  startTime: Date;
  lastPing: Date;
  totalWatchTime: number;
  xpEarned: number;
  isActive: boolean;
  tabFocused: boolean;
  isBoosted: boolean;
  completionRate: number;
}

export interface DailyXPLog {
  userId: string;
  date: string; // YYYY-MM-DD
  watchTimeXP: number;
  completionBonusXP: number;
  shareXP: number;
  streakBonusXP: number;
  referralXP: number;
  totalDailyXP: number;
  videosWatched: number;
  shares: number;
  referrals: number;
}

export class XPSystem {
  /**
   * Check for duplicate XP between different tracking sources
   */
  static async checkForDuplicateXP(
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
      console.error('Error checking for duplicate XP:', error);
      return false;
    }
  }

  /**
   * Initialize user XP data
   */
  static async initializeUserXP(userId: string): Promise<XPData> {
    try {
      const xpRef = doc(db, 'userXP', userId);
      const xpDoc = await getDoc(xpRef);
      
      if (!xpDoc.exists()) {
        const today = new Date().toISOString().split('T')[0];
        const initialXPData: XPData = {
          userId,
          totalXP: 0,
          level: 1,
          dailyXP: 0,
          dailyShares: 0,
          dailyVideosWatched: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: today,
          lastXPUpdate: new Date(),
          lifetimeStats: {
            totalWatchTime: 0,
            totalShares: 0,
            totalReferrals: 0,
            totalVideosCompleted: 0
          }
        };
        
        await setDoc(xpRef, {
          ...initialXPData,
          lastXPUpdate: serverTimestamp()
        });
        
        console.log(`🎯 XP System: Initialized user ${userId}`);
        return initialXPData;
      }
      
      const data = xpDoc.data() as XPData;
      return {
        ...data,
        lastXPUpdate: data.lastXPUpdate || new Date()
      };
    } catch (error) {
      console.error('Error initializing user XP:', error);
      throw error;
    }
  }

  /**
   * Get user XP data
   */
  static async getUserXP(userId: string): Promise<XPData | null> {
    try {
      const xpRef = doc(db, 'userXP', userId);
      const xpDoc = await getDoc(xpRef);
      
      if (xpDoc.exists()) {
        const data = xpDoc.data() as XPData;
        return {
          ...data,
          lastXPUpdate: data.lastXPUpdate || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user XP:', error);
      return null;
    }
  }

  /**
   * Reset daily counters if it's a new day
   */
  static async checkAndResetDailyCounters(userId: string): Promise<XPData> {
    try {
      const xpData = await this.getUserXP(userId) || await this.initializeUserXP(userId);
      const today = new Date().toISOString().split('T')[0];
      
      if (xpData.lastActivityDate !== today) {
        // New day - reset daily counters
        const wasActiveYesterday = xpData.dailyVideosWatched >= XP_CONFIG.STREAK_THRESHOLD;
        const newStreak = wasActiveYesterday ? xpData.currentStreak + 1 : 0;
        
        const updatedData: Partial<XPData> = {
          dailyXP: 0,
          dailyShares: 0,
          dailyVideosWatched: 0,
          currentStreak: newStreak,
          longestStreak: Math.max(xpData.longestStreak, newStreak),
          lastActivityDate: today
        };
        
        const xpRef = doc(db, 'userXP', userId);
        await updateDoc(xpRef, {
          ...updatedData,
          lastXPUpdate: serverTimestamp()
        });
        
        console.log(`🗓️ XP System: Reset daily counters for ${userId}, streak: ${newStreak}`);
        return { ...xpData, ...updatedData };
      }
      
      return xpData;
    } catch (error) {
      console.error('Error checking daily counters:', error);
      throw error;
    }
  }

  /**
   * Award XP for watch time with all bonuses and caps
   */
  static async awardWatchTimeXP(
    userId: string,
    videoId: string,
    watchTimeSeconds: number,
    completionRate: number,
    isBoosted: boolean = false
  ): Promise<number> {
    try {
      const xpData = await this.checkAndResetDailyCounters(userId);
      
      // Check daily XP cap
      if (xpData.dailyXP >= XP_CONFIG.DAILY_XP_CAP) {
        console.log(`⏰ XP System: Daily cap reached for ${userId}`);
        return 0;
      }
      
      // Calculate base XP from watch time
      let baseXP = Math.floor(watchTimeSeconds * XP_CONFIG.WATCH_TIME_XP_RATE);
      
      // Apply completion bonus if >90% watched
      if (completionRate >= XP_CONFIG.COMPLETION_THRESHOLD) {
        baseXP += Math.floor(baseXP * XP_CONFIG.COMPLETION_BONUS_RATE);
      }
      
      // Apply boosted video multiplier
      if (isBoosted) {
        baseXP = Math.floor(baseXP * XP_CONFIG.BOOSTED_MULTIPLIER);
      }
      
      // Apply daily cap
      const remainingCap = XP_CONFIG.DAILY_XP_CAP - xpData.dailyXP;
      const actualXP = Math.min(baseXP, remainingCap);
      
      if (actualXP <= 0) return 0;
      
      // Update XP data
      const xpRef = doc(db, 'userXP', userId);
      const newTotalXP = xpData.totalXP + actualXP;
      const newLevel = calculateLevel(newTotalXP).level;
      
      await updateDoc(xpRef, {
        totalXP: newTotalXP,
        level: newLevel,
        dailyXP: xpData.dailyXP + actualXP,
        dailyVideosWatched: increment(1),
        lastXPUpdate: serverTimestamp(),
        'lifetimeStats.totalWatchTime': increment(watchTimeSeconds),
        'lifetimeStats.totalVideosCompleted': completionRate >= XP_CONFIG.COMPLETION_THRESHOLD ? increment(1) : increment(0)
      });
      
      // Log daily XP
      await this.logDailyXP(userId, 'watchTime', actualXP);
      
      // Dispatch level up event if level changed
      if (newLevel > xpData.level) {
        this.dispatchLevelUpEvent(userId, newLevel, xpData.level);
      }
      
      // Dispatch XP update event to frontend
      this.dispatchXPUpdateEvent(userId, newTotalXP, actualXP);
      
      console.log(`🎬 XP System: Awarded ${actualXP} XP to ${userId} for watching ${videoId}`);
      return actualXP;
    } catch (error) {
      console.error('Error awarding watch time XP:', error);
      return 0;
    }
  }

  /**
   * Award XP for sharing videos
   */
  static async awardShareXP(userId: string, videoId: string): Promise<number> {
    try {
      const xpData = await this.checkAndResetDailyCounters(userId);
      
      // Check daily share limit
      if (xpData.dailyShares >= XP_CONFIG.MAX_DAILY_SHARES) {
        console.log(`📤 XP System: Daily share limit reached for ${userId}`);
        return 0;
      }
      
      const shareXP = XP_CONFIG.SHARE_XP;
      const xpRef = doc(db, 'userXP', userId);
      const newTotalXP = xpData.totalXP + shareXP;
      const newLevel = calculateLevel(newTotalXP).level;
      
      await updateDoc(xpRef, {
        totalXP: newTotalXP,
        level: newLevel,
        dailyShares: xpData.dailyShares + 1,
        lastXPUpdate: serverTimestamp(),
        'lifetimeStats.totalShares': increment(1)
      });
      
      // Log daily XP
      await this.logDailyXP(userId, 'share', shareXP);
      
      if (newLevel > xpData.level) {
        this.dispatchLevelUpEvent(userId, newLevel, xpData.level);
      }
      
      // Dispatch XP update event to frontend
      this.dispatchXPUpdateEvent(userId, newTotalXP, shareXP);
      
      console.log(`📤 XP System: Awarded ${shareXP} XP to ${userId} for sharing ${videoId}`);
      return shareXP;
    } catch (error) {
      console.error('Error awarding share XP:', error);
      return 0;
    }
  }

  /**
   * Award XP for successful referral
   */
  static async awardReferralXP(referrerUserId: string, newUserId: string): Promise<number> {
    try {
      const xpData = await this.checkAndResetDailyCounters(referrerUserId);
      
      const referralXP = XP_CONFIG.REFERRAL_XP;
      const xpRef = doc(db, 'userXP', referrerUserId);
      const newTotalXP = xpData.totalXP + referralXP;
      const newLevel = calculateLevel(newTotalXP).level;
      
      await updateDoc(xpRef, {
        totalXP: newTotalXP,
        level: newLevel,
        lastXPUpdate: serverTimestamp(),
        'lifetimeStats.totalReferrals': increment(1)
      });
      
      // Log daily XP
      await this.logDailyXP(referrerUserId, 'referral', referralXP);
      
      if (newLevel > xpData.level) {
        this.dispatchLevelUpEvent(referrerUserId, newLevel, xpData.level);
      }
      
      // Dispatch XP update event to frontend
      this.dispatchXPUpdateEvent(referrerUserId, newTotalXP, referralXP);
      
      console.log(`👥 XP System: Awarded ${referralXP} XP to ${referrerUserId} for referring ${newUserId}`);
      return referralXP;
    } catch (error) {
      console.error('Error awarding referral XP:', error);
      return 0;
    }
  }

  /**
   * Check and award daily streak bonus
   */
  static async checkStreakBonus(userId: string): Promise<number> {
    try {
      const xpData = await this.getUserXP(userId);
      if (!xpData) return 0;
      
      // Check if user qualifies for streak bonus (3+ videos watched today)
      if (xpData.dailyVideosWatched >= XP_CONFIG.STREAK_THRESHOLD && xpData.currentStreak > 0) {
        // Check if streak bonus already awarded today
        const today = new Date().toISOString().split('T')[0];
        const dailyLogRef = doc(db, 'dailyXP', `${userId}_${today}`);
        const dailyLog = await getDoc(dailyLogRef);
        
        if (!dailyLog.exists() || !dailyLog.data()?.streakBonusXP) {
          const streakXP = XP_CONFIG.DAILY_STREAK_XP;
          const xpRef = doc(db, 'userXP', userId);
          const newTotalXP = xpData.totalXP + streakXP;
          const newLevel = calculateLevel(newTotalXP).level;
          
          await updateDoc(xpRef, {
            totalXP: newTotalXP,
            level: newLevel,
            lastXPUpdate: serverTimestamp()
          });
          
          // Log daily XP
          await this.logDailyXP(userId, 'streak', streakXP);
          
          if (newLevel > xpData.level) {
            this.dispatchLevelUpEvent(userId, newLevel, xpData.level);
          }
          
          // Dispatch XP update event to frontend
          this.dispatchXPUpdateEvent(userId, newTotalXP, streakXP);
          
          console.log(`🔥 XP System: Awarded ${streakXP} streak bonus XP to ${userId}`);
          return streakXP;
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error checking streak bonus:', error);
      return 0;
    }
  }

  /**
   * Log daily XP for analytics
   */
  private static async logDailyXP(
    userId: string, 
    source: 'watchTime' | 'completion' | 'share' | 'referral' | 'streak',
    xpAmount: number
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyLogRef = doc(db, 'dailyXP', `${userId}_${today}`);
      
      const updateData: any = {
        userId,
        date: today,
        lastUpdated: serverTimestamp()
      };
      
      switch (source) {
        case 'watchTime':
          updateData.watchTimeXP = increment(xpAmount);
          updateData.videosWatched = increment(1);
          break;
        case 'completion':
          updateData.completionBonusXP = increment(xpAmount);
          break;
        case 'share':
          updateData.shareXP = increment(xpAmount);
          updateData.shares = increment(1);
          break;
        case 'referral':
          updateData.referralXP = increment(xpAmount);
          updateData.referrals = increment(1);
          break;
        case 'streak':
          updateData.streakBonusXP = increment(xpAmount);
          break;
      }
      
      updateData.totalDailyXP = increment(xpAmount);
      
      await setDoc(dailyLogRef, updateData, { merge: true });
    } catch (error) {
      console.error('Error logging daily XP:', error);
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
      console.log(`🎉 XP System: Level up! ${userId} reached level ${newLevel}`);
    }
  }

  /**
   * Dispatch XP update event to frontend
   */
  static dispatchXPUpdateEvent(userId: string, totalXP: number, xpGained: number): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('xpUpdated', {
        detail: { userId, totalXP, xpGained }
      });
      window.dispatchEvent(event);
      console.log(`✨ XP System: XP updated for ${userId}: +${xpGained} (total: ${totalXP})`);
    }
  }
}