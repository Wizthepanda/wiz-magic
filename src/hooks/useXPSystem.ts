import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/lib/firebase';
import { authSingleton } from '@/lib/authSingleton';

interface XPData {
  totalXP: number;
  currentLevel: number;
  progressToNext: number;
  dailyXP: number;
  dailyCap: number;
  streakCount: number;
  lastActiveDate: string;
  sharesToday: number;
  referralsCount: number;
  boostedXP: number;
}

interface XPAwardResult {
  success: boolean;
  xpAwarded: number;
  totalXP: number;
  level: number;
  progressToNext: number;
  dailyXP: number;
  streakCount: number;
  leveledUp: boolean;
  reason?: string;
}

// Shared level calculation function using Firebase Functions thresholds
const calculateLevelData = (totalXP: number) => {
  const levelThresholds = [
    { level: 1, totalXP: 0 },
    { level: 2, totalXP: 100 },
    { level: 3, totalXP: 300 },
    { level: 4, totalXP: 800 },
    { level: 5, totalXP: 1600 }
  ];
  
  // Find current level
  let level = 1;
  let currentThreshold = levelThresholds[0];
  let nextThreshold = levelThresholds[1];
  
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (totalXP >= levelThresholds[i].totalXP) {
      level = levelThresholds[i].level;
      currentThreshold = levelThresholds[i];
      nextThreshold = levelThresholds[i + 1] || { level: level + 1, totalXP: levelThresholds[i].totalXP + 1000 };
      break;
    }
  }
  
  const currentLevelXP = currentThreshold.totalXP;
  const nextLevelXP = nextThreshold.totalXP;
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const progressToNext = xpNeededForLevel > 0 ? xpInCurrentLevel / xpNeededForLevel : 1;
  
  return {
    level,
    progressToNext,
    currentLevelXP,
    nextLevelXP,
    xpInCurrentLevel,
    xpNeededForLevel
  };
};

export const useXPSystem = () => {
  const [user, setUser] = useState(authSingleton.getCurrentUser());
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logs disabled for production
  // console.log('🏗️ useXPSystem hook running with user:', user?.uid || 'NO USER', 'loading:', loading);

  // Listen to auth singleton for user changes
  useEffect(() => {
    console.log('🎯 Setting up auth singleton listener in useXPSystem');
    const unsubscribe = authSingleton.addListener((newUser) => {
      console.log('🔄 Auth singleton notified useXPSystem of user change:', newUser?.uid || 'NO USER');
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  // Firebase Cloud Functions
  const awardXPFunction = httpsCallable(functions, 'awardXP');
  const awardShareXPFunction = httpsCallable(functions, 'awardShareXP');
  const awardReferralXPFunction = httpsCallable(functions, 'awardReferralXP');

  // Real-time XP data listener
  useEffect(() => {
    console.log('🎯 useXPSystem useEffect triggered with user:', user?.uid || 'NO USER');
    
    if (!user?.uid) {
      console.log('❌ No user UID, setting xpData to null');
      setXpData(null);
      setLoading(false);
      return;
    }

    console.log('🎯 Setting up XP data listener for user:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef, 
      (doc) => {
        console.log('📡 Firebase listener callback triggered, doc exists:', doc.exists());
        if (doc.exists()) {
          const userData = doc.data();
          console.log('📊 Raw Firebase user data:', JSON.stringify({
            currentXP: userData.currentXP,
            totalXP: userData.totalXP,
            level: userData.level,
            dailyXpEarned: userData.dailyXpEarned,
            hasXpData: !!userData.xpData
          }, null, 2));
          
          // Check if using new structure (currentXP, level, etc.) or old structure (xpData)
          let xpData: XPData;
          
          if (userData.currentXP !== undefined || userData.totalXP !== undefined) {
            // New Firebase Function structure
            const currentXP = userData.currentXP || userData.totalXP || 0;
            const level = userData.level || 1;
            const dailyXP = userData.dailyXpEarned || userData.dailyXP || 0;
            
            // Calculate level progress using shared function for consistency
            let progressToNext = 0;
            try {
              const levelData = calculateLevelData(currentXP);
              progressToNext = levelData.progressToNext;
            } catch (error) {
              console.error('Error calculating progress in main listener:', error);
            }
            
            xpData = {
              totalXP: currentXP,
              currentLevel: level,
              progressToNext: progressToNext,
              dailyXP: dailyXP,
              dailyCap: userData.dailyCap || 360,
              streakCount: userData.streakCount || 0,
              lastActiveDate: userData.lastActiveDate || '',
              sharesToday: userData.sharesToday || userData.dailyShares || 0,
              referralsCount: userData.referralsCount || 0,
              boostedXP: userData.boostedXP || 0
            };
            
            console.log('📊 XP data updated from Firebase Function structure:', JSON.stringify({
              totalXP: xpData.totalXP,
              currentLevel: xpData.currentLevel,
              dailyXP: xpData.dailyXP,
              progressToNext: xpData.progressToNext,
              rawUserData: {
                currentXP: userData.currentXP,
                totalXP: userData.totalXP,
                level: userData.level,
                dailyXpEarned: userData.dailyXpEarned,
                dailyXP: userData.dailyXP
              }
            }, null, 2));
          } else if (userData.xpData) {
            // Legacy structure
            xpData = userData.xpData;
            console.log('📊 XP data updated from legacy structure:', xpData);
          } else {
            // Initialize XP data if missing
            xpData = {
              totalXP: 0,
              currentLevel: 1,
              progressToNext: 0,
              dailyXP: 0,
              dailyCap: 360,
              streakCount: 0,
              lastActiveDate: '',
              sharesToday: 0,
              referralsCount: 0,
              boostedXP: 0
            };
            console.log('📊 XP data initialized with defaults:', xpData);
          }
          
          setXpData(xpData);
          
          // Force a re-render to ensure UI updates
          setLoading(true);
          setTimeout(() => setLoading(false), 50);
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

  // Listen for force refresh events to immediately update XP data
  useEffect(() => {
    if (!user?.uid) return;

    const handleForceRefresh = (event: CustomEvent) => {
      console.log('🔄 useXPSystem received forceXPRefresh event:', event.detail);
      const { currentXP, level, dailyXpEarned } = event.detail;
      
      if (currentXP !== undefined && level !== undefined) {
        // Calculate progress using shared function for consistency
        let progressToNext = 0;
        try {
          const levelData = calculateLevelData(currentXP);
          progressToNext = levelData.progressToNext;
        } catch (error) {
          console.error('Error calculating progress:', error);
        }
        
        const newXpData: XPData = {
          totalXP: currentXP,
          currentLevel: level,
          progressToNext: progressToNext,
          dailyXP: dailyXpEarned || 0,
          dailyCap: 360,
          streakCount: 0,
          lastActiveDate: new Date().toISOString().split('T')[0],
          sharesToday: 0,
          referralsCount: 0,
          boostedXP: 0
        };
        
        console.log('📊 Force updating XP data:', newXpData);
        setXpData(newXpData);
        
        // Force a re-render by updating loading state briefly
        setLoading(true);
        setTimeout(() => setLoading(false), 100);
      }
    };

    window.addEventListener('forceXPRefresh', handleForceRefresh as EventListener);
    return () => {
      window.removeEventListener('forceXPRefresh', handleForceRefresh as EventListener);
    };
  }, [user?.uid]);

  // Award XP for watching videos
  const awardWatchXP = useCallback(async (
    videoId: string, 
    watchTime: number, 
    completed: boolean,
    sessionId: string
  ): Promise<XPAwardResult | null> => {
    const currentUser = authSingleton.getCurrentUser();
    if (!currentUser?.uid) return null;

    try {
      console.log('🎬 Awarding watch XP:', { videoId, watchTime, completed, sessionId });
      
      const result = await awardXPFunction({
        videoId,
        watchTime,
        completed,
        sessionId
      });
      
      const data = result.data as XPAwardResult;
      console.log('✅ XP awarded:', data);
      
      // Dispatch level up event if applicable
      if (data.leveledUp) {
        window.dispatchEvent(new CustomEvent('showLevelUpAnimation', {
          detail: { newLevel: data.level, oldLevel: data.level - 1 }
        }));
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error awarding watch XP:', error);
      setError(error instanceof Error ? error.message : 'Failed to award XP');
      return null;
    }
  }, [awardXPFunction]);

  // Award XP for sharing
  const awardShareXP = useCallback(async (videoId: string): Promise<XPAwardResult | null> => {
    const currentUser = authSingleton.getCurrentUser();
    if (!currentUser?.uid) return null;

    try {
      console.log('🔗 Awarding share XP for video:', videoId);
      
      const result = await awardShareXPFunction({ videoId });
      const data = result.data as XPAwardResult;
      
      console.log('✅ Share XP awarded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error awarding share XP:', error);
      setError(error instanceof Error ? error.message : 'Failed to award share XP');
      return null;
    }
  }, [awardShareXPFunction]);

  // Award XP for referrals
  const awardReferralXP = useCallback(async (referralCode: string, newUserId: string): Promise<XPAwardResult | null> => {
    const currentUser = authSingleton.getCurrentUser();
    if (!currentUser?.uid) return null;

    try {
      console.log('👥 Awarding referral XP:', { referralCode, newUserId });
      
      const result = await awardReferralXPFunction({ referralCode, newUserId });
      const data = result.data as XPAwardResult;
      
      console.log('✅ Referral XP awarded:', data);
      return data;
    } catch (error) {
      console.error('❌ Error awarding referral XP:', error);
      setError(error instanceof Error ? error.message : 'Failed to award referral XP');
      return null;
    }
  }, [awardReferralXPFunction]);

  // Calculate level progression data using shared function
  const getLevelData = useCallback((totalXP: number) => {
    return calculateLevelData(totalXP);
  }, []);

  // Computed values
  const levelData = xpData ? getLevelData(xpData.totalXP) : null;
  const canEarnMoreXP = xpData ? xpData.dailyXP < xpData.dailyCap : true;
  const dailyProgress = xpData ? (xpData.dailyXP / xpData.dailyCap) * 100 : 0;
  
  // Debug computed values - disabled for production
  // console.log('🔧 useXPSystem computed values:', JSON.stringify({
  //   xpData: xpData ? { totalXP: xpData.totalXP, currentLevel: xpData.currentLevel, progressToNext: xpData.progressToNext } : null,
  //   levelData,
  //   progressPercent: (levelData?.progressToNext || 0) * 100,
  //   totalXP: xpData?.totalXP || 0,
  //   level: levelData?.level || 1,
  // }, null, 2));

  return {
    // Data
    xpData,
    levelData,
    loading,
    error,

    // Computed values
    totalXP: xpData?.totalXP || 0,
    level: levelData?.level || 1,
    xpInCurrentLevel: levelData?.xpInCurrentLevel || 0,
    xpToNextLevel: levelData?.xpNeededForLevel || 100,
    progressPercent: (levelData?.progressToNext || 0) * 100,
    dailyXP: xpData?.dailyXP || 0,
    dailyXPCap: xpData?.dailyCap || 360,
    streakCount: xpData?.streakCount || 0,
    sharesToday: xpData?.sharesToday || 0,
    canEarnMoreXP,
    dailyProgress,

    // Actions
    awardWatchXP,
    awardShareXP,
    awardReferralXP,
    
    // Utilities
    getLevelData
  };
};