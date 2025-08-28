/**
 * Production-ready XP Award Transaction System
 * Handles XP awarding with atomic transactions, daily caps, and retry logic
 */

import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  FieldValue,
  collection,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Level thresholds (unchangeable)
const LEVEL_THRESHOLDS = {
  1: 100, 2: 300, 3: 800, 4: 1600, 5: 3000,
  6: 6000, 7: 12000, 8: 24000, 9: 50000, 10: 100000
};

// Daily XP cap
const DAILY_XP_CAP = 360;

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 100, // ms
  maxDelay: 2000  // ms
};

/**
 * Calculate level from current XP
 */
function calculateLevel(xp) {
  let level = 1;
  for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xp >= threshold) {
      level = parseInt(lvl) + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 10); // Cap at level 10
}

/**
 * Get badge name for milestone levels
 */
function getBadgeName(level) {
  const badges = {
    3: 'Rising Wizard',
    5: 'Skilled Mage',
    7: 'Elite Sorcerer',
    10: 'Archmage Supreme'
  };
  return badges[level] || `Level ${level} Badge`;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Exponential backoff delay
 */
function getBackoffDelay(attempt) {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is transient and should be retried
 */
function isTransientError(error) {
  const transientCodes = ['aborted', 'unavailable', 'deadline-exceeded', 'internal'];
  return transientCodes.includes(error.code);
}

/**
 * Award XP once per completed video with full transaction safety
 * 
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID  
 * @param {number} requestedXp - Requested XP amount
 * @param {string} reason - Reason for XP award ('video_completion', 'share', 'referral')
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Result object
 */
export async function awardXpOnce(userId, videoId, requestedXp, reason = 'video_completion', metadata = {}) {
  console.log(`🎯 awardXpOnce start uid=${userId} videoId=${videoId} requestedXp=${requestedXp} reason=${reason}`);

  if (!userId || !videoId || requestedXp <= 0) {
    console.error('❌ awardXpOnce: Invalid parameters');
    return { success: false, reason: 'invalid_parameters', awardedXp: 0, newTotalXp: 0 };
  }

  // Apply +10% bonus for video completion if base XP exists
  let finalXp = requestedXp;
  if (reason === 'video_completion' && requestedXp > 0) {
    const bonus = Math.floor(requestedXp * 0.1);
    finalXp = requestedXp + bonus;
    console.log(`📈 Applied 10% completion bonus: ${requestedXp} + ${bonus} = ${finalXp}`);
  }

  let lastError = null;
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      if (attempt > 0) {
        const delay = getBackoffDelay(attempt - 1);
        console.log(`🔄 Retry attempt ${attempt + 1}/${RETRY_CONFIG.maxAttempts} after ${delay}ms`);
        await sleep(delay);
      }

      const result = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', userId);
        const completedVideoRef = doc(db, 'users', userId, 'completedVideos', videoId);
        
        // 1. Read user and completed video docs
        const [userDoc, completedVideoDoc] = await Promise.all([
          transaction.get(userRef),
          transaction.get(completedVideoRef)
        ]);

        // 2. If completed doc exists → return (no-op)
        if (completedVideoDoc.exists()) {
          console.log(`⚠️ Video ${videoId} already completed - no XP awarded`);
          return { success: false, reason: 'already_completed', awardedXp: 0, newTotalXp: 0 };
        }

        // 3. Get user data and compute daily cap
        const userData = userDoc.exists() ? userDoc.data() : {};
        const currentXp = userData.currentXP || 0;
        const currentLevel = calculateLevel(currentXp);
        const dailyXpEarned = userData.dailyXpEarned || 0;
        const lastReset = userData.lastReset || '';
        const today = getTodayString();

        // Reset daily XP if it's a new day
        const effectiveDailyXp = (lastReset === today) ? dailyXpEarned : 0;
        const remainingDailyCap = Math.max(0, DAILY_XP_CAP - effectiveDailyXp);

        // 4. Compute allowedXp = min(requestedXp, remainingDailyCap)
        let allowedXp = Math.min(finalXp, remainingDailyCap);
        
        // Skip share/referral daily caps per requirements
        if (reason === 'share' || reason === 'referral') {
          allowedXp = finalXp;
        }

        if (allowedXp <= 0) {
          console.log(`🚫 Daily XP cap reached: ${effectiveDailyXp}/${DAILY_XP_CAP}`);
          return { success: false, reason: 'daily_cap_reached', awardedXp: 0, newTotalXp: currentXp };
        }

        // 5. Update user document atomically
        const updateData = {
          currentXP: FieldValue.increment(allowedXp),
          lastReset: today
        };

        // Only increment dailyXpEarned for capped XP types
        if (reason !== 'share' && reason !== 'referral') {
          updateData.dailyXpEarned = lastReset === today 
            ? FieldValue.increment(allowedXp)
            : allowedXp; // Reset to allowedXp if new day
        }

        transaction.update(userRef, updateData);

        // 6. Write completion record
        transaction.set(completedVideoRef, {
          completedAt: serverTimestamp(),
          xpAwarded: allowedXp,
          bonusApplied: reason === 'video_completion' && finalXp > requestedXp,
          reason,
          metadata
        });

        // 7. Check for level up and handle badges
        const newTotalXp = currentXp + allowedXp;
        const newLevel = calculateLevel(newTotalXp);
        const levelUp = newLevel > currentLevel;

        if (levelUp) {
          console.log(`🎉 Level up detected: ${currentLevel} → ${newLevel}`);
          
          // Create level up log
          const levelUpRef = doc(collection(db, 'users', userId, 'levelUps'));
          transaction.set(levelUpRef, {
            oldLevel: currentLevel,
            newLevel: newLevel,
            totalXp: newTotalXp,
            timestamp: serverTimestamp(),
            triggeredBy: reason
          });

          // Award badges for milestone levels (3, 5, 7, 10)
          if ([3, 5, 7, 10].includes(newLevel)) {
            const badgeRef = doc(collection(db, 'users', userId, 'badges'));
            transaction.set(badgeRef, {
              level: newLevel,
              name: getBadgeName(newLevel),
              earnedAt: serverTimestamp(),
              type: 'level_milestone'
            });
          }
        }

        return {
          success: true,
          awardedXp: allowedXp,
          newTotalXp,
          prevTotalXp: currentXp,
          levelUp,
          newLevel,
          oldLevel: currentLevel
        };
      });

      // Log success
      if (result.success) {
        console.log(`✅ awardXpOnce success awarded=${result.awardedXp} newTotal=${result.newTotalXp}`);
        if (result.levelUp) {
          console.log(`🆙 levelUp detected old=${result.oldLevel} new=${result.newLevel}`);
        }
      }

      return result;

    } catch (error) {
      lastError = error;
      console.error(`❌ awardXpOnce attempt ${attempt + 1} failed:`, error.code, error.message);

      // Don't retry non-transient errors
      if (!isTransientError(error)) {
        break;
      }
    }
  }

  // All retries exhausted
  console.error(`🔥 awardXpOnce failed after ${RETRY_CONFIG.maxAttempts} attempts:`, lastError);
  
  // Log to error tracking service if available
  if (window.Sentry) {
    window.Sentry.captureException(lastError, {
      tags: { userId, videoId, requestedXp, reason },
      level: 'error'
    });
  }

  return {
    success: false,
    reason: 'transaction_failed',
    awardedXp: 0,
    newTotalXp: 0,
    error: lastError?.code || 'unknown_error'
  };
}

/**
 * Convenience functions for specific XP types
 */
export async function awardVideoCompletionXp(userId, videoId, baseXp = 10, watchTimeSeconds = 0) {
  const metadata = { watchTimeSeconds, baseXp };
  return awardXpOnce(userId, videoId, baseXp, 'video_completion', metadata);
}

export async function awardShareXp(userId, sharedVideoId) {
  const shareId = `share_${sharedVideoId}_${Date.now()}`;
  return awardXpOnce(userId, shareId, 20, 'share', { sharedVideoId });
}

export async function awardReferralXp(userId, referredUserId) {
  const referralId = `referral_${referredUserId}`;
  return awardXpOnce(userId, referralId, 50, 'referral', { referredUserId });
}

export { LEVEL_THRESHOLDS, DAILY_XP_CAP, calculateLevel };