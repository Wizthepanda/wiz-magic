import { db } from './firebase';
import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  collection,
  onSnapshot,
  DocumentReference,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';

// Level calculation helper - exact thresholds as specified
export function calculateLevel(xp: number): number {
  const thresholds = [
    0, 100, 300, 800, 1600, 3000,
    6000, 12000, 24000, 50000, 100000
  ];
  
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i;
    else break;
  }
  return level;
}

// Get level thresholds for progress calculation
export function getLevelThresholds() {
  return [0, 100, 300, 800, 1600, 3000, 6000, 12000, 24000, 50000, 100000];
}

// XP Award Logic (frontend → Firestore) - exact implementation as specified
export async function awardXP(uid: string, amount: number, reason: string): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  const userRef = doc(db, "users", uid);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      if (!snap.exists()) throw new Error("User not found");

      const data = snap.data();
      const today = new Date().toISOString().split("T")[0];

      let dailyXpEarned = data.dailyXpEarned || 0;
      let lastReset = data.lastReset || today;

      // Reset daily XP if it's a new day
      if (lastReset !== today) {
        dailyXpEarned = 0;
        lastReset = today;
      }

      // Apply daily cap (360 XP max per day)
      const allowedXP = Math.min(amount, 360 - dailyXpEarned);
      if (allowedXP <= 0) {
        return { success: false, xpAwarded: 0, newLevel: data.level || 1, leveledUp: false };
      }

      const currentXP = data.currentXP || 0;
      const newXP = currentXP + allowedXP;
      const currentLevel = data.level || 1;

      // Update user document
      transaction.update(userRef, {
        currentXP: newXP,
        dailyXpEarned: dailyXpEarned + allowedXP,
        lastReset: lastReset,
      });

      // Handle level-up logging
      const newLevel = calculateLevel(newXP);
      let leveledUp = false;

      if (newLevel > currentLevel) {
        leveledUp = true;
        transaction.update(userRef, { level: newLevel });
        
        // Create levelUp log in subcollection
        const levelLogRef = doc(collection(userRef, "levelUps"));
        transaction.set(levelLogRef, {
          level: newLevel,
          previousLevel: currentLevel,
          timestamp: serverTimestamp(),
          reason: reason,
          totalXP: newXP
        });

        // Award badges at milestone levels (3, 5, 7, 10)
        if ([3, 5, 7, 10].includes(newLevel)) {
          const badgeRef = doc(collection(userRef, "badges"));
          transaction.set(badgeRef, {
            level: newLevel,
            name: getBadgeName(newLevel),
            earnedAt: serverTimestamp(),
            type: 'level_milestone'
          });
        }
      }

      return { success: true, xpAwarded: allowedXP, newLevel, leveledUp };
    });

    console.log(`✅ Awarded ${result.xpAwarded} XP to ${uid} (${reason})`);
    
    // Dispatch level-up event for UI
    if (result.leveledUp && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: { userId: uid, newLevel: result.newLevel, reason }
      }));
    }

    return result;
  } catch (error) {
    console.error('❌ Error awarding XP:', error);
    return { success: false, xpAwarded: 0, newLevel: 1, leveledUp: false };
  }
}

// Minimal XP award function - removes stale preconditions + ensures numbers
async function awardXPMinimal(userId: string, xp: number): Promise<void> {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, {
      currentXP: increment(xp),
      dailyXpEarned: increment(xp),
      lastReset: new Date().toISOString().split("T")[0],
    });
    console.log(`✅ Awarded ${xp} XP to ${userId}`);
  } catch (e) {
    console.error("🔥 Failed to award XP:", e);
  }
}

// Award XP once per fully completed video - FIXED IMPLEMENTATION
export async function awardXpOnce(userId: string, videoId: string, earnedXp: number): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean; prevXP: number; totalXP: number }> {
  const userRef = doc(db, "users", userId);
  const completedVideoRef = doc(db, "users", userId, "completedVideos", videoId);

  try {
    // Check if video already completed first (separate from transaction)
    const completedVideoDoc = await getDoc(completedVideoRef);
    if (completedVideoDoc.exists()) {
      console.warn(`⚠️ Video ${videoId} already completed - no XP awarded`);
      return { success: false, xpAwarded: 0, newLevel: 1, leveledUp: false, prevXP: 0, totalXP: 0 };
    }

    // Get current user data
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User not found");

    const userData = userDoc.data();
    const prevXP = userData.currentXP || 0;
    const oldLevel = calculateLevel(prevXP);

    // Award XP using minimal function (no preconditions)
    await awardXPMinimal(userId, earnedXp);

    // Mark video as completed (using setDoc to create if doesn't exist)
    await setDoc(completedVideoRef, {
      completedAt: serverTimestamp(),
      xpAwarded: true,
      xpAmount: earnedXp
    });

    // Calculate new totals for return value
    const newTotalXP = prevXP + earnedXp;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Dispatch event → UI reacts instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("xpUpdated", {
        detail: { 
          earnedXp, 
          prevXP, 
          totalXp: newTotalXP, 
          leveledUp, 
          newLevel, 
          oldLevel 
        }
      }));
    }

    console.log(`✅ Awarded ${earnedXp} XP for video ${videoId} (Total: ${newTotalXP})`);
    return { 
      success: true, 
      xpAwarded: earnedXp, 
      newLevel, 
      leveledUp, 
      prevXP, 
      totalXP: newTotalXP 
    };

  } catch (error) {
    console.error('❌ Error awarding XP once:', error);
    return { success: false, xpAwarded: 0, newLevel: 1, leveledUp: false, prevXP: 0, totalXP: 0 };
  }
}

// Specific XP award functions following exact rules
export async function awardWatchTimeXP(uid: string, watchTimeSeconds: number): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  // +1 XP per 10s active watch time
  const xpAmount = Math.floor(watchTimeSeconds / 10);
  return await awardXP(uid, xpAmount, 'watch_time');
}

export async function awardCompletionBonusXP(uid: string, baseWatchXP: number): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  // +10% XP bonus for video completion
  const bonusXP = Math.floor(baseWatchXP * 0.1);
  return await awardXP(uid, bonusXP, 'completion_bonus');
}

export async function awardShareXP(uid: string): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  // +20 XP per share (no daily cap)
  return await awardXP(uid, 20, 'share');
}

export async function awardReferralXP(uid: string): Promise<{ success: boolean; xpAwarded: number; newLevel: number; leveledUp: boolean }> {
  // +50 XP per referral (no daily cap)
  return await awardXP(uid, 50, 'referral');
}

// Badge names for milestone levels
function getBadgeName(level: number): string {
  const badgeNames: { [key: number]: string } = {
    3: 'Rising Wizard',
    5: 'Skilled Mage', 
    7: 'Elite Sorcerer',
    10: 'Archmage Supreme'
  };
  return badgeNames[level] || `Level ${level} Badge`;
}

// Progress Bar Sync (live updates) - exact implementation as specified
export function subscribeToUserXP(uid: string, callback: (data: {
  currentXP: number;
  level: number;
  progress: number;
  nextThreshold: number;
  prevThreshold: number;
  dailyXpEarned: number;
  canEarnMoreXP: boolean;
}) => void): () => void {
  const userRef = doc(db, "users", uid);
  const thresholds = getLevelThresholds();

  return onSnapshot(userRef, (snap) => {
    if (!snap.exists()) {
      // Initialize user if doesn't exist
      callback({
        currentXP: 0,
        level: 1,
        progress: 0,
        nextThreshold: thresholds[1],
        prevThreshold: thresholds[0],
        dailyXpEarned: 0,
        canEarnMoreXP: true
      });
      return;
    }

    const { currentXP = 0, level = 1, dailyXpEarned = 0 } = snap.data();
    const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];
    const prevThreshold = thresholds[level - 1] || 0;
    
    // Calculate progress percentage within current level
    const progress = ((currentXP - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
    const canEarnMoreXP = dailyXpEarned < 360;

    callback({
      currentXP,
      level,
      progress: Math.min(100, Math.max(0, progress)),
      nextThreshold,
      prevThreshold,
      dailyXpEarned,
      canEarnMoreXP
    });
  });
}

// Initialize user XP data if it doesn't exist
// Track which users are being initialized to prevent duplicates
const initializingUsers = new Set<string>();

export async function initializeUserXP(uid: string, displayName?: string, email?: string): Promise<void> {
  // Prevent duplicate initializations
  if (initializingUsers.has(uid)) {
    console.log(`⏳ User ${uid} is already being initialized, skipping...`);
    return;
  }
  
  initializingUsers.add(uid);
  const userRef = doc(db, "users", uid);
  
  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      
      if (!snap.exists()) {
        const today = new Date().toISOString().split("T")[0];
        transaction.set(userRef, {
          currentXP: 0,
          level: 1,
          dailyXpEarned: 0,
          lastReset: today,
          displayName: displayName || 'WIZ User',
          email: email || '',
          createdAt: serverTimestamp(),
          // Add additional fields for compatibility
          totalXP: 0,
          youtubeConnected: false
        });
        console.log(`🎯 Initialized XP data for user ${uid}`);
      } else {
        // Ensure required fields exist on existing users
        const data = snap.data();
        const today = new Date().toISOString().split("T")[0];
        const updates: any = {};
        
        if (typeof data.currentXP === 'undefined') updates.currentXP = data.totalXP || 0;
        if (typeof data.level === 'undefined') updates.level = 1;
        if (typeof data.dailyXpEarned === 'undefined') updates.dailyXpEarned = 0;
        if (typeof data.lastReset === 'undefined') updates.lastReset = today;
        
        if (Object.keys(updates).length > 0) {
          transaction.update(userRef, updates);
          console.log(`🔄 Updated user ${uid} with missing fields:`, updates);
        }
      }
    });
  } catch (error) {
    console.error('Error initializing user XP:', error);
  } finally {
    // Remove from initializing set when done
    initializingUsers.delete(uid);
  }
}