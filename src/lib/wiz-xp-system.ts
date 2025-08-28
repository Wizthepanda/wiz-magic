/**
 * WIZ XP System with Milder Progression Curve
 * Implements balanced leveling experience with meaningful milestones
 */

import { db } from './firebase';
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
  writeBatch,
  addDoc
} from 'firebase/firestore';

// XP Configuration - Production Rules
export const WIZ_XP_CONFIG = {
  // Earning Rules
  WATCH_TIME_XP_RATE: 0.1, // +1 XP per 10 seconds
  COMPLETION_BONUS_RATE: 0.1, // +10% XP bonus for completion
  SHARE_XP: 20, // +20 XP per share
  REFERRAL_XP: 50, // +50 XP per referral
  DAILY_XP_CAP: 360, // Maximum XP per day
  
  // Activity Limits
  MAX_DAILY_SHARES: 5, // Maximum shares per day for XP
  MIN_WATCH_TIME: 5, // Minimum seconds to earn XP
  COMPLETION_THRESHOLD: 0.9, // 90% completion for bonus
  
  // Anti-cheat
  HEARTBEAT_INTERVAL: 10000, // 10 seconds between pings
  FOCUS_REQUIRED: true, // Tab must be focused
  MAX_SESSION_TIME: 7200, // 2 hours max per session
};

// New Milder Level Thresholds
export const WIZ_LEVEL_THRESHOLDS = [
  { level: 1, totalXP: 0, requiredXP: 0 },      // Starting level
  { level: 2, totalXP: 100, requiredXP: 100 },   // L1: 100 XP
  { level: 3, totalXP: 300, requiredXP: 200 },   // L2: +200 XP = 300 total
  { level: 4, totalXP: 800, requiredXP: 500 },   // L3: +500 XP = 800 total
  { level: 5, totalXP: 1600, requiredXP: 800 },  // L4: +800 XP = 1,600 total
  { level: 6, totalXP: 3000, requiredXP: 1400 }, // L5: +1,400 XP = 3,000 total
  { level: 7, totalXP: 6000, requiredXP: 3000 }, // L6: +3,000 XP = 6,000 total
  { level: 8, totalXP: 12000, requiredXP: 6000 }, // L7: +6,000 XP = 12,000 total
  { level: 9, totalXP: 24000, requiredXP: 12000 }, // L8: +12,000 XP = 24,000 total
  { level: 10, totalXP: 50000, requiredXP: 26000 }, // L9: +26,000 XP = 50,000 total
  { level: 11, totalXP: 100000, requiredXP: 50000 }, // L10: +50,000 XP = 100,000 total
];

// Badge Levels
export const BADGE_LEVELS = [3, 5, 7, 10];

// Badge Definitions
export const WIZ_BADGES = {
  3: {
    name: "Rising Wizard",
    description: "Reached Level 3",
    icon: "🌟",
    color: "#10B981", // Green
    rarity: "common"
  },
  5: {
    name: "Skilled Wizard",
    description: "Reached Level 5", 
    icon: "💎",
    color: "#3B82F6", // Blue
    rarity: "uncommon"
  },
  7: {
    name: "Master Wizard",
    description: "Reached Level 7",
    icon: "👑",
    color: "#8B5CF6", // Purple  
    rarity: "rare"
  },
  10: {
    name: "Grand Wizard",
    description: "Reached Level 10",
    icon: "🔮",
    color: "#F59E0B", // Gold
    rarity: "legendary"
  }
};

// Interfaces
export interface WizXPData {
  userId: string;
  currentXP: number;
  level: number;
  dailyXP: number;
  dailyXpEarned: number; // Track against 360 cap
  dailyShares: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  lastXPUpdate: Date;
  badges: string[]; // Array of earned badge IDs
  lifetimeStats: {
    totalWatchTime: number;
    totalVideosWatched: number;
    totalShares: number;
    totalReferrals: number;
    totalVideosCompleted: number;
  };
}

export interface LevelUpData {
  userId: string;
  fromLevel: number;
  toLevel: number;
  timestamp: Date;
  totalXP: number;
  badgeEarned?: string;
  triggerEvent: 'watch' | 'share' | 'referral' | 'bonus';
}

export interface XPProgressInfo {
  currentLevel: number;
  currentXP: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  nextLevelXP: number;
  progressPercent: number;
  totalXPForCurrentLevel: number;
  totalXPForNextLevel: number;
}

export class WizXPSystem {
  /**
   * Calculate level and progress from current XP
   */
  static calculateLevel(currentXP: number): XPProgressInfo {
    let currentLevel = 1;
    
    // Find current level
    for (let i = WIZ_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (currentXP >= WIZ_LEVEL_THRESHOLDS[i].totalXP) {
        currentLevel = WIZ_LEVEL_THRESHOLDS[i].level;
        break;
      }
    }
    
    // Get level bounds
    const currentLevelData = WIZ_LEVEL_THRESHOLDS.find(l => l.level === currentLevel);
    const nextLevelData = WIZ_LEVEL_THRESHOLDS.find(l => l.level === currentLevel + 1);
    
    const totalXPForCurrentLevel = currentLevelData?.totalXP || 0;
    const totalXPForNextLevel = nextLevelData?.totalXP || currentXP + 1000; // Fallback
    
    const xpInCurrentLevel = currentXP - totalXPForCurrentLevel;
    const xpNeededForNext = totalXPForNextLevel - currentXP;
    const nextLevelXP = totalXPForNextLevel - totalXPForCurrentLevel;
    
    const progressPercent = nextLevelXP > 0 ? (xpInCurrentLevel / nextLevelXP) * 100 : 100;
    
    return {
      currentLevel,
      currentXP,
      xpInCurrentLevel,
      xpNeededForNext: Math.max(0, xpNeededForNext),
      nextLevelXP,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      totalXPForCurrentLevel,
      totalXPForNextLevel,
    };
  }
  
  /**
   * Initialize user XP data with new schema
   */
  static async initializeUserXP(userId: string): Promise<WizXPData> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const today = new Date().toISOString().split('T')[0];
        const initialData: WizXPData = {
          userId,
          currentXP: 0,
          level: 1,
          dailyXP: 0,
          dailyXpEarned: 0,
          dailyShares: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: today,
          lastXPUpdate: new Date(),
          badges: [],
          lifetimeStats: {
            totalWatchTime: 0,
            totalVideosWatched: 0,
            totalShares: 0,
            totalReferrals: 0,
            totalVideosCompleted: 0
          }
        };
        
        await setDoc(userRef, {
          ...initialData,
          lastXPUpdate: serverTimestamp()
        });
        
        console.log(`✅ Initialized WIZ XP for user: ${userId}`);
        return initialData;
      }
      
      const userData = userDoc.data();
      
      // Ensure all new fields exist (migration support)
      const xpData: WizXPData = {
        userId,
        currentXP: userData.currentXP || userData.totalXP || 0,
        level: userData.level || 1,
        dailyXP: userData.dailyXP || 0,
        dailyXpEarned: userData.dailyXpEarned || userData.dailyXP || 0,
        dailyShares: userData.dailyShares || 0,
        currentStreak: userData.currentStreak || 0,
        longestStreak: userData.longestStreak || 0,
        lastActiveDate: userData.lastActiveDate || new Date().toISOString().split('T')[0],
        lastXPUpdate: userData.lastXPUpdate?.toDate() || new Date(),
        badges: userData.badges || [],
        lifetimeStats: {
          totalWatchTime: userData.lifetimeStats?.totalWatchTime || 0,
          totalVideosWatched: userData.lifetimeStats?.totalVideosWatched || 0,
          totalShares: userData.lifetimeStats?.totalShares || 0,
          totalReferrals: userData.lifetimeStats?.totalReferrals || 0,
          totalVideosCompleted: userData.lifetimeStats?.totalVideosCompleted || 0,
        }
      };
      
      // Update document if migration needed
      if (!userData.currentXP || !userData.dailyXpEarned || !userData.badges) {
        await updateDoc(userRef, {
          currentXP: xpData.currentXP,
          dailyXpEarned: xpData.dailyXpEarned,
          badges: xpData.badges,
          lastXPUpdate: serverTimestamp()
        });
        console.log(`🔄 Migrated XP data for user: ${userId}`);
      }
      
      return xpData;
    } catch (error) {
      console.error('❌ Error initializing user XP:', error);
      throw error;
    }
  }
  
  /**
   * Get user XP data
   */
  static async getUserXP(userId: string): Promise<WizXPData | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return await this.initializeUserXP(userId);
      }
      
      return await this.initializeUserXP(userId); // Always ensure proper structure
    } catch (error) {
      console.error('❌ Error getting user XP:', error);
      return null;
    }
  }
  
  /**
   * Check and reset daily counters if new day
   */
  static async checkDailyReset(userId: string): Promise<WizXPData> {
    try {
      const xpData = await this.getUserXP(userId) || await this.initializeUserXP(userId);
      const today = new Date().toISOString().split('T')[0];
      
      if (xpData.lastActiveDate !== today) {
        // Check if was active yesterday for streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = 0;
        if (xpData.lastActiveDate === yesterdayStr && xpData.dailyXpEarned > 0) {
          newStreak = xpData.currentStreak + 1;
        } else if (xpData.dailyXpEarned > 0) {
          newStreak = 1; // Start new streak
        }
        
        const updatedData = {
          ...xpData,
          dailyXP: 0,
          dailyXpEarned: 0,
          dailyShares: 0,
          currentStreak: newStreak,
          longestStreak: Math.max(xpData.longestStreak, newStreak),
          lastActiveDate: today,
        };
        
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          dailyXP: 0,
          dailyXpEarned: 0,
          dailyShares: 0,
          currentStreak: newStreak,
          longestStreak: Math.max(xpData.longestStreak, newStreak),
          lastActiveDate: today,
          lastXPUpdate: serverTimestamp()
        });
        
        console.log(`🗓️ Daily reset for ${userId}, streak: ${newStreak}`);
        return updatedData;
      }
      
      return xpData;
    } catch (error) {
      console.error('❌ Error checking daily reset:', error);
      throw error;
    }
  }
  
  /**
   * Award XP with all rules and caps
   */
  static async awardXP(
    userId: string,
    xpAmount: number,
    source: 'watch' | 'completion' | 'share' | 'referral',
    metadata?: { videoId?: string; watchTime?: number; [key: string]: any }
  ): Promise<{ success: boolean; xpAwarded: number; levelUp?: LevelUpData; badgeEarned?: string }> {
    try {
      const xpData = await this.checkDailyReset(userId);
      
      // Check daily cap
      if (xpData.dailyXpEarned >= WIZ_XP_CONFIG.DAILY_XP_CAP) {
        console.log(`⏰ Daily XP cap reached for ${userId}`);
        return { success: true, xpAwarded: 0 };
      }
      
      // Apply daily cap
      const remainingCap = WIZ_XP_CONFIG.DAILY_XP_CAP - xpData.dailyXpEarned;
      const actualXP = Math.min(xpAmount, remainingCap);
      
      if (actualXP <= 0) {
        return { success: true, xpAwarded: 0 };
      }
      
      // Calculate new totals
      const newCurrentXP = xpData.currentXP + actualXP;
      const oldProgress = this.calculateLevel(xpData.currentXP);
      const newProgress = this.calculateLevel(newCurrentXP);
      
      const leveledUp = newProgress.currentLevel > oldProgress.currentLevel;
      
      // Update user data
      const userRef = doc(db, 'users', userId);
      const updateData: any = {
        currentXP: newCurrentXP,
        level: newProgress.currentLevel,
        dailyXP: increment(actualXP),
        dailyXpEarned: increment(actualXP),
        lastXPUpdate: serverTimestamp(),
      };
      
      // Update lifetime stats
      if (source === 'watch' && metadata?.watchTime) {
        updateData['lifetimeStats.totalWatchTime'] = increment(metadata.watchTime);
        updateData['lifetimeStats.totalVideosWatched'] = increment(1);
      } else if (source === 'completion') {
        updateData['lifetimeStats.totalVideosCompleted'] = increment(1);
      } else if (source === 'share') {
        updateData['lifetimeStats.totalShares'] = increment(1);
        updateData.dailyShares = increment(1);
      } else if (source === 'referral') {
        updateData['lifetimeStats.totalReferrals'] = increment(1);
      }
      
      await updateDoc(userRef, updateData);
      
      let levelUpData: LevelUpData | undefined;
      let badgeEarned: string | undefined;
      
      // Handle level up
      if (leveledUp) {
        levelUpData = {
          userId,
          fromLevel: oldProgress.currentLevel,
          toLevel: newProgress.currentLevel,
          timestamp: new Date(),
          totalXP: newCurrentXP,
          triggerEvent: source,
          ...metadata
        };
        
        // Check for badge
        if (BADGE_LEVELS.includes(newProgress.currentLevel)) {
          badgeEarned = `level_${newProgress.currentLevel}`;
          
          // Add badge to user
          await updateDoc(userRef, {
            badges: [...xpData.badges, badgeEarned]
          });
          
          levelUpData.badgeEarned = badgeEarned;
        }
        
        // Log level up
        await addDoc(collection(db, 'levelUps'), {
          ...levelUpData,
          timestamp: serverTimestamp()
        });
        
        console.log(`🎉 Level up! ${userId}: ${oldProgress.currentLevel} → ${newProgress.currentLevel}`);
        
        // Dispatch level up event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('wizLevelUp', {
            detail: levelUpData
          }));
        }
      }
      
      // Dispatch XP update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wizXPUpdate', {
          detail: { 
            userId, 
            xpGained: actualXP, 
            newTotal: newCurrentXP,
            newLevel: newProgress.currentLevel,
            source 
          }
        }));
      }
      
      console.log(`✨ Awarded ${actualXP} XP to ${userId} from ${source}`);
      
      return { 
        success: true, 
        xpAwarded: actualXP, 
        levelUp: levelUpData,
        badgeEarned 
      };
      
    } catch (error) {
      console.error('❌ Error awarding XP:', error);
      return { success: false, xpAwarded: 0 };
    }
  }
  
  /**
   * Award watch time XP
   */
  static async awardWatchXP(
    userId: string,
    videoId: string,
    watchTimeSeconds: number,
    completionRate: number
  ): Promise<{ success: boolean; xpAwarded: number; levelUp?: LevelUpData }> {
    if (watchTimeSeconds < WIZ_XP_CONFIG.MIN_WATCH_TIME) {
      return { success: true, xpAwarded: 0 };
    }
    
    // Base XP from watch time
    let totalXP = Math.floor(watchTimeSeconds * WIZ_XP_CONFIG.WATCH_TIME_XP_RATE);
    
    // Award watch XP
    const watchResult = await this.awardXP(userId, totalXP, 'watch', {
      videoId,
      watchTime: watchTimeSeconds,
      completionRate
    });
    
    // Award completion bonus if applicable
    if (completionRate >= WIZ_XP_CONFIG.COMPLETION_THRESHOLD) {
      const bonusXP = Math.floor(totalXP * WIZ_XP_CONFIG.COMPLETION_BONUS_RATE);
      const bonusResult = await this.awardXP(userId, bonusXP, 'completion', {
        videoId,
        baseXP: totalXP
      });
      
      return {
        success: true,
        xpAwarded: watchResult.xpAwarded + bonusResult.xpAwarded,
        levelUp: watchResult.levelUp || bonusResult.levelUp
      };
    }
    
    return watchResult;
  }
  
  /**
   * Award share XP
   */
  static async awardShareXP(userId: string, videoId: string) {
    const xpData = await this.checkDailyReset(userId);
    
    if (xpData.dailyShares >= WIZ_XP_CONFIG.MAX_DAILY_SHARES) {
      console.log(`📤 Daily share limit reached for ${userId}`);
      return { success: true, xpAwarded: 0 };
    }
    
    return await this.awardXP(userId, WIZ_XP_CONFIG.SHARE_XP, 'share', { videoId });
  }
  
  /**
   * Award referral XP
   */
  static async awardReferralXP(referrerUserId: string, newUserId: string) {
    return await this.awardXP(referrerUserId, WIZ_XP_CONFIG.REFERRAL_XP, 'referral', {
      referredUserId: newUserId
    });
  }
  
  /**
   * Get user badges
   */
  static async getUserBadges(userId: string): Promise<Array<{ id: string; badge: any }>> {
    try {
      const xpData = await this.getUserXP(userId);
      if (!xpData) return [];
      
      return xpData.badges.map(badgeId => ({
        id: badgeId,
        badge: WIZ_BADGES[badgeId.replace('level_', '') as keyof typeof WIZ_BADGES]
      })).filter(item => item.badge);
    } catch (error) {
      console.error('❌ Error getting user badges:', error);
      return [];
    }
  }
  
  /**
   * Get level up history for analytics
   */
  static async getUserLevelUps(userId: string): Promise<LevelUpData[]> {
    try {
      const levelUpsQuery = query(
        collection(db, 'levelUps'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(levelUpsQuery);
      const levelUps: LevelUpData[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        levelUps.push({
          ...data,
          timestamp: data.timestamp.toDate()
        } as LevelUpData);
      });
      
      return levelUps.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('❌ Error getting level ups:', error);
      return [];
    }
  }
  
  /**
   * Get XP leaderboard
   */
  static async getLeaderboard(limit: number = 50): Promise<Array<{ userId: string; currentXP: number; level: number }>> {
    try {
      // Note: For large scale, consider using a separate leaderboard collection
      // This is a simple implementation
      const usersQuery = query(
        collection(db, 'users'),
        where('currentXP', '>', 0)
      );
      
      const snapshot = await getDocs(usersQuery);
      const users: Array<{ userId: string; currentXP: number; level: number }> = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.currentXP > 0) {
          users.push({
            userId: doc.id,
            currentXP: data.currentXP,
            level: data.level
          });
        }
      });
      
      return users
        .sort((a, b) => b.currentXP - a.currentXP)
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      return [];
    }
  }
}