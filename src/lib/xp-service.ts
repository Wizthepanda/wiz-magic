import { db } from './firebase';
import { 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc, 
  increment, 
  serverTimestamp,
  runTransaction,
  collection,
  addDoc
} from 'firebase/firestore';

// Level Thresholds - Fixed as per requirements
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
} as const;

// XP Earning Rules - Fixed as per requirements
export const XP_CONFIG = {
  WATCH_TIME_XP_RATE: 0.1, // +1 XP per 10 seconds (0.1 XP per second)
  DAILY_XP_CAP: 360, // Maximum XP per day
  COMPLETION_BONUS_RATE: 0.1, // +10% XP bonus for full video completion
  SHARE_XP: 20, // +20 XP per share
  REFERRAL_XP: 50, // +50 XP per referral
} as const;

interface UserXPData {
  currentXP: number;
  level: number;
  dailyXpEarned: number;
  lastXpReset: Date;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

/**
 * Calculate level from current XP using exact thresholds
 */
export function calculateLevel(currentXP: number): { level: number; xpForCurrentLevel: number; xpForNextLevel: number } {
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
  
  return {
    level,
    xpForCurrentLevel,
    xpForNextLevel
  };
}

/**
 * Initialize user XP data if it doesn't exist
 */
export async function initializeUserXP(userId: string, displayName?: string, email?: string, avatarUrl?: string): Promise<UserXPData> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const initialData: UserXPData = {
      currentXP: 0,
      level: 1,
      dailyXpEarned: 0,
      lastXpReset: new Date(),
      displayName: displayName || 'WIZ User',
      email: email || '',
      avatarUrl: avatarUrl || ''
    };
    
    await setDoc(userRef, {
      ...initialData,
      lastXpReset: serverTimestamp()
    });
    
    console.log(`🎯 Initialized XP data for user ${userId}`);
    return initialData;
  }
  
  const data = userDoc.data();
  return {
    currentXP: data.currentXP || 0,
    level: data.level || 1,
    dailyXpEarned: data.dailyXpEarned || 0,
    lastXpReset: data.lastXpReset?.toDate() || new Date(),
    displayName: data.displayName || displayName || 'WIZ User',
    email: data.email || email || '',
    avatarUrl: data.avatarUrl || avatarUrl || ''
  };
}

/**
 * Check if daily reset is needed and perform it
 */
async function checkDailyReset(userId: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return false;
  
  const data = userDoc.data();
  const lastReset = data.lastXpReset?.toDate();
  const now = new Date();
  
  // Check if it's a new day (UTC-based)
  const shouldReset = !lastReset || lastReset.toDateString() !== now.toDateString();
  
  if (shouldReset) {
    await updateDoc(userRef, {
      dailyXpEarned: 0,
      lastXpReset: serverTimestamp()
    });
    console.log(`🗓️ Daily XP reset performed for user ${userId}`);
    return true;
  }
  
  return false;
}

/**
 * Award XP with daily cap enforcement and level-up detection
 */
export async function awardXP(
  userId: string,
  amount: number,
  source: 'watch_time' | 'completion_bonus' | 'share' | 'referral',
  metadata?: Record<string, any>
): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean; reason?: string }> {
  try {
    console.log(`🎯 Attempting to award ${amount} XP to user ${userId} from ${source}`);
    
    // Use transaction to ensure consistency
    const result = await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists()) {
        // Initialize user if doesn't exist
        await initializeUserXP(userId);
        const newUserDoc = await transaction.get(userRef);
        if (!newUserDoc.exists()) {
          throw new Error('Failed to initialize user');
        }
      }
      
      const userData = userDoc.data() || {};
      const currentXP = userData.currentXP || 0;
      const currentLevel = userData.level || 1;
      let dailyXpEarned = userData.dailyXpEarned || 0;
      const lastReset = userData.lastXpReset?.toDate();
      const now = new Date();
      
      // Check if daily reset is needed
      const shouldReset = !lastReset || lastReset.toDateString() !== now.toDateString();
      if (shouldReset) {
        dailyXpEarned = 0;
      }
      
      // Apply daily cap for watch time and completion bonus
      let actualAmount = amount;
      if (source === 'watch_time' || source === 'completion_bonus') {
        const remainingCap = XP_CONFIG.DAILY_XP_CAP - dailyXpEarned;
        if (remainingCap <= 0) {
          return { success: false, xpAwarded: 0, newLevel: currentLevel, leveledUp: false, reason: 'Daily XP cap reached' };
        }
        actualAmount = Math.min(amount, remainingCap);
      }
      
      if (actualAmount <= 0) {
        return { success: false, xpAwarded: 0, newLevel: currentLevel, leveledUp: false, reason: 'No XP to award' };
      }
      
      // Calculate new values
      const newCurrentXP = currentXP + actualAmount;
      const newLevelData = calculateLevel(newCurrentXP);
      const leveledUp = newLevelData.level > currentLevel;
      const newDailyXpEarned = shouldReset ? actualAmount : dailyXpEarned + actualAmount;
      
      // Update user document
      const updateData: any = {
        currentXP: newCurrentXP,
        level: newLevelData.level,
        dailyXpEarned: newDailyXpEarned
      };
      
      if (shouldReset) {
        updateData.lastXpReset = serverTimestamp();
      }
      
      transaction.update(userRef, updateData);
      
      // Log level-up if it occurred
      if (leveledUp) {
        const levelUpRef = doc(collection(db, `users/${userId}/levelUps`));
        transaction.set(levelUpRef, {
          level: newLevelData.level,
          previousLevel: currentLevel,
          totalXP: newCurrentXP,
          timestamp: serverTimestamp(),
          source,
          metadata: metadata || {}
        });
        
        // Award badges at milestone levels
        const badgeLevels = [3, 5, 7, 10];
        if (badgeLevels.includes(newLevelData.level)) {
          const badgeRef = doc(collection(db, `users/${userId}/badges`));
          transaction.set(badgeRef, {
            level: newLevelData.level,
            name: getBadgeName(newLevelData.level),
            description: getBadgeDescription(newLevelData.level),
            earnedAt: serverTimestamp(),
            type: 'level_milestone'
          });
        }
        
        console.log(`🎉 Level up! User ${userId}: Level ${currentLevel} → ${newLevelData.level}`);
      }
      
      return {
        success: true,
        xpAwarded: actualAmount,
        newLevel: newLevelData.level,
        leveledUp,
        reason: `Awarded ${actualAmount} XP from ${source}`
      };
    });
    
    // Dispatch level-up event for UI
    if (result.leveledUp && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: { 
          userId, 
          newLevel: result.newLevel, 
          oldLevel: result.newLevel - 1,
          source,
          metadata 
        }
      }));
    }
    
    console.log(`✅ XP award successful: ${result.xpAwarded} XP awarded to ${userId}`);
    return result;
    
  } catch (error) {
    console.error('❌ Error awarding XP:', error);
    return {
      success: false,
      xpAwarded: 0,
      newLevel: 1,
      leveledUp: false,
      reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Award XP for watch time (+1 XP per 10 seconds)
 */
export async function awardWatchTimeXP(
  userId: string,
  watchTimeSeconds: number,
  completedVideo: boolean = false,
  videoId?: string
): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  // Calculate base XP (+1 XP per 10 seconds)
  const baseXP = Math.floor(watchTimeSeconds / 10);
  
  if (baseXP <= 0) {
    return { success: false, xpAwarded: 0, newLevel: 1, leveledUp: false };
  }
  
  // Award base watch time XP
  const watchResult = await awardXP(userId, baseXP, 'watch_time', {
    watchTimeSeconds,
    videoId,
    completedVideo
  });
  
  // Award completion bonus if video was fully completed (+10%)
  if (completedVideo && watchResult.success) {
    const bonusXP = Math.floor(baseXP * XP_CONFIG.COMPLETION_BONUS_RATE);
    if (bonusXP > 0) {
      const bonusResult = await awardXP(userId, bonusXP, 'completion_bonus', {
        baseXP,
        videoId
      });
      
      return {
        success: true,
        xpAwarded: watchResult.xpAwarded + bonusResult.xpAwarded,
        newLevel: bonusResult.newLevel,
        leveledUp: watchResult.leveledUp || bonusResult.leveledUp
      };
    }
  }
  
  return watchResult;
}

/**
 * Award XP for sharing (+20 XP per share)
 */
export async function awardShareXP(userId: string, videoId?: string): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  return await awardXP(userId, XP_CONFIG.SHARE_XP, 'share', { videoId });
}

/**
 * Award XP for referrals (+50 XP per referral)
 */
export async function awardReferralXP(userId: string, referredUserId: string): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  return await awardXP(userId, XP_CONFIG.REFERRAL_XP, 'referral', { referredUserId });
}

/**
 * Get badge name for level
 */
function getBadgeName(level: number): string {
  switch (level) {
    case 3: return 'Rising Wizard';
    case 5: return 'Skilled Mage';
    case 7: return 'Elite Sorcerer';
    case 10: return 'Archmage Supreme';
    default: return `Level ${level} Badge`;
  }
}

/**
 * Get badge description for level
 */
function getBadgeDescription(level: number): string {
  switch (level) {
    case 3: return 'Reached Level 3! You\'re getting the hang of this magic.';
    case 5: return 'Reached Level 5! Your magical abilities are growing strong.';
    case 7: return 'Reached Level 7! You wield magic with exceptional skill.';
    case 10: return 'Reached MAX Level! You are a master of all magical arts.';
    default: return `Reached Level ${level}!`;
  }
}

/**
 * Get user's current XP data
 */
export async function getUserXPData(userId: string): Promise<UserXPData | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const data = userDoc.data();
    return {
      currentXP: data.currentXP || 0,
      level: data.level || 1,
      dailyXpEarned: data.dailyXpEarned || 0,
      lastXpReset: data.lastXpReset?.toDate() || new Date(),
      displayName: data.displayName || 'WIZ User',
      email: data.email || '',
      avatarUrl: data.avatarUrl || ''
    };
  } catch (error) {
    console.error('Error getting user XP data:', error);
    return null;
  }
}