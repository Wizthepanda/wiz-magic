import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { XP_CONFIG, LEVEL_THRESHOLDS, calculateLevel } from '@/lib/xp-system';

interface XPData {
  currentXP: number;
  level: number;
  dailyXpEarned: number;
  lastXpReset: Date;
}

interface ProgressBarData {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  xpInCurrentLevel: number;
  xpNeededForLevel: number;
}

export const useWizXPSystem = () => {
  const { user } = useAuth();
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time XP data listener - listens to currentXP + level snapshot in Firestore
  useEffect(() => {
    if (!user?.uid) {
      setXpData(null);
      setLoading(false);
      return;
    }

    console.log('🎯 Setting up real-time XP listener for user:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          
          // Initialize XP data if missing
          if (!userData.currentXP && userData.currentXP !== 0) {
            const today = new Date();
            const initialData: XPData = {
              currentXP: 0,
              level: 1,
              dailyXpEarned: 0,
              lastXpReset: today
            };
            
            // Update Firestore with initial data
            updateDoc(userRef, {
              currentXP: 0,
              level: 1,
              dailyXpEarned: 0,
              lastXpReset: serverTimestamp()
            }).catch(console.error);
            
            setXpData(initialData);
          } else {
            setXpData({
              currentXP: userData.currentXP || 0,
              level: userData.level || 1,
              dailyXpEarned: userData.dailyXpEarned || 0,
              lastXpReset: userData.lastXpReset?.toDate() || new Date()
            });
          }
        } else {
          // Create user document with initial XP data
          const today = new Date();
          const initialData: XPData = {
            currentXP: 0,
            level: 1,
            dailyXpEarned: 0,
            lastXpReset: today
          };
          
          updateDoc(userRef, {
            currentXP: 0,
            level: 1,
            dailyXpEarned: 0,
            lastXpReset: serverTimestamp()
          }, { merge: true }).catch(console.error);
          
          setXpData(initialData);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Error listening to XP data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Check if daily reset is needed
  const checkDailyReset = useCallback(async () => {
    if (!user?.uid || !xpData) return;

    const now = new Date();
    const lastReset = xpData.lastXpReset;
    
    // Check if it's a new day (UTC-based)
    const shouldReset = !lastReset || 
      lastReset.toDateString() !== now.toDateString();

    if (shouldReset) {
      console.log('🗓️ Performing daily XP reset for user:', user.uid);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        dailyXpEarned: 0,
        lastXpReset: serverTimestamp()
      });
    }
  }, [user?.uid, xpData]);

  // Award XP for watch time (+1 XP per 10s active watch time)
  const awardWatchTimeXP = useCallback(async (
    videoId: string,
    watchTimeSeconds: number,
    completionRate: number = 0
  ): Promise<number> => {
    if (!user?.uid || !xpData) return 0;
    
    await checkDailyReset();

    // Enforce daily XP cap
    if (xpData.dailyXpEarned >= XP_CONFIG.DAILY_XP_CAP) {
      console.log('⏰ Daily XP cap reached');
      return 0;
    }

    // Calculate base XP (+1 XP per 10 seconds)
    let xpToAward = Math.floor(watchTimeSeconds / 10);
    
    // +10% XP bonus for full video completion
    if (completionRate >= XP_CONFIG.COMPLETION_THRESHOLD) {
      xpToAward += Math.floor(xpToAward * XP_CONFIG.COMPLETION_BONUS_RATE);
    }

    // Apply daily cap
    const remainingCap = XP_CONFIG.DAILY_XP_CAP - xpData.dailyXpEarned;
    xpToAward = Math.min(xpToAward, remainingCap);

    if (xpToAward <= 0) return 0;

    const newCurrentXP = xpData.currentXP + xpToAward;
    const newLevel = calculateLevel(newCurrentXP).level;
    const leveledUp = newLevel > xpData.level;

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      currentXP: newCurrentXP,
      level: newLevel,
      dailyXpEarned: xpData.dailyXpEarned + xpToAward
    });

    // Log level up for analytics + airdrop triggers
    if (leveledUp) {
      const levelUpsRef = doc(db, `users/${user.uid}/levelUps`, `level_${newLevel}`);
      await updateDoc(levelUpsRef, {
        level: newLevel,
        timestamp: serverTimestamp(),
        previousLevel: xpData.level,
        totalXP: newCurrentXP
      }, { merge: true });

      console.log(`🎉 Level up! User ${user.uid} reached level ${newLevel}`);
      
      // Dispatch level up event
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: { userId: user.uid, newLevel, oldLevel: xpData.level }
      }));
    }

    console.log(`🎬 Awarded ${xpToAward} XP for ${watchTimeSeconds}s watch time`);
    return xpToAward;
  }, [user?.uid, xpData, checkDailyReset]);

  // Award XP for shares (+20 XP per share)
  const awardShareXP = useCallback(async (videoId: string): Promise<number> => {
    if (!user?.uid || !xpData) return 0;

    await checkDailyReset();

    const xpToAward = XP_CONFIG.SHARE_XP;
    const newCurrentXP = xpData.currentXP + xpToAward;
    const newLevel = calculateLevel(newCurrentXP).level;
    const leveledUp = newLevel > xpData.level;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      currentXP: newCurrentXP,
      level: newLevel
    });

    // Log level up for analytics + airdrop triggers
    if (leveledUp) {
      const levelUpsRef = doc(db, `users/${user.uid}/levelUps`, `level_${newLevel}`);
      await updateDoc(levelUpsRef, {
        level: newLevel,
        timestamp: serverTimestamp(),
        previousLevel: xpData.level,
        totalXP: newCurrentXP
      }, { merge: true });

      console.log(`🎉 Level up! User ${user.uid} reached level ${newLevel}`);
      
      // Dispatch level up event
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: { userId: user.uid, newLevel, oldLevel: xpData.level }
      }));
    }

    console.log(`📤 Awarded ${xpToAward} XP for sharing ${videoId}`);
    return xpToAward;
  }, [user?.uid, xpData, checkDailyReset]);

  // Award XP for referrals (+50 XP per referral)
  const awardReferralXP = useCallback(async (newUserId: string): Promise<number> => {
    if (!user?.uid || !xpData) return 0;

    await checkDailyReset();

    const xpToAward = XP_CONFIG.REFERRAL_XP;
    const newCurrentXP = xpData.currentXP + xpToAward;
    const newLevel = calculateLevel(newCurrentXP).level;
    const leveledUp = newLevel > xpData.level;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      currentXP: newCurrentXP,
      level: newLevel
    });

    // Log level up for analytics + airdrop triggers
    if (leveledUp) {
      const levelUpsRef = doc(db, `users/${user.uid}/levelUps`, `level_${newLevel}`);
      await updateDoc(levelUpsRef, {
        level: newLevel,
        timestamp: serverTimestamp(),
        previousLevel: xpData.level,
        totalXP: newCurrentXP,
        referredUser: newUserId
      }, { merge: true });

      console.log(`🎉 Level up! User ${user.uid} reached level ${newLevel}`);
      
      // Dispatch level up event
      window.dispatchEvent(new CustomEvent('levelUp', {
        detail: { userId: user.uid, newLevel, oldLevel: xpData.level }
      }));
    }

    console.log(`👥 Awarded ${xpToAward} XP for referring ${newUserId}`);
    return xpToAward;
  }, [user?.uid, xpData, checkDailyReset]);

  // Auto-award badges at levels 3, 5, 7, and 10
  const checkBadgeAwards = useCallback(async (level: number) => {
    if (!user?.uid) return;

    const badgeLevels = [3, 5, 7, 10];
    if (badgeLevels.includes(level)) {
      const badgeRef = doc(db, `users/${user.uid}/badges`, `level_${level}_badge`);
      await updateDoc(badgeRef, {
        level,
        earnedAt: serverTimestamp(),
        type: 'level_milestone',
        name: `Level ${level} Master`,
        description: `Reached level ${level}!`
      }, { merge: true });

      console.log(`🏆 Badge awarded for reaching level ${level}`);
    }
  }, [user?.uid]);

  // Get progress bar data - computed from currentXP and level
  const getProgressBarData = useCallback((): ProgressBarData | null => {
    if (!xpData) return null;

    const levelData = calculateLevel(xpData.currentXP);
    
    return {
      level: levelData.level,
      currentXP: xpData.currentXP,
      xpForCurrentLevel: levelData.xpForCurrentLevel,
      xpForNextLevel: levelData.xpForNextLevel,
      progressPercent: levelData.progressPercent,
      xpInCurrentLevel: levelData.currentLevelXP,
      xpNeededForLevel: levelData.nextLevelXP
    };
  }, [xpData]);

  // Check if user can earn more XP today
  const canEarnMoreXP = xpData ? xpData.dailyXpEarned < XP_CONFIG.DAILY_XP_CAP : true;
  const dailyProgress = xpData ? (xpData.dailyXpEarned / XP_CONFIG.DAILY_XP_CAP) * 100 : 0;

  return {
    // Raw data
    xpData,
    loading,
    error,

    // Computed values
    progressBarData: getProgressBarData(),
    canEarnMoreXP,
    dailyProgress,
    dailyXPRemaining: xpData ? XP_CONFIG.DAILY_XP_CAP - xpData.dailyXpEarned : XP_CONFIG.DAILY_XP_CAP,

    // Actions
    awardWatchTimeXP,
    awardShareXP,
    awardReferralXP,
    checkBadgeAwards,
    checkDailyReset,

    // Utilities
    calculateLevel
  };
};