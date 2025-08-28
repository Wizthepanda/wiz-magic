import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { functions, db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { WizXPSystem, type WizXPData, type XPProgressInfo } from '@/lib/wiz-xp-system';

interface WizXPHookData {
  // Core XP Data
  currentXP: number;
  level: number;
  dailyXP: number;
  dailyXpRemaining: number;
  canEarnXP: boolean;
  
  // Progress Info
  progressInfo: XPProgressInfo;
  
  // Badges & Achievements
  badges: string[];
  totalBadges: number;
  
  // Stats
  lifetimeStats: {
    totalWatchTime: number;
    totalVideosWatched: number;
    totalShares: number;
    totalReferrals: number;
    totalVideosCompleted: number;
  };
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  awardWatchXP: (videoId: string, watchTime: number, completionRate: number, sessionId?: string) => Promise<any>;
  awardShareXP: (videoId: string) => Promise<any>;
  awardReferralXP: (referredUserId: string, referralCode?: string) => Promise<any>;
  refreshData: () => Promise<void>;
}

export const useWizXP = (): WizXPHookData => {
  const { user } = useAuth();
  const [xpData, setXpData] = useState<WizXPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cloud Functions
  const awardWatchXPFn = httpsCallable(functions, 'awardWatchXP');
  const awardWizShareXPFn = httpsCallable(functions, 'awardWizShareXP');
  const awardWizReferralXPFn = httpsCallable(functions, 'awardWizReferralXP');
  const getWizXPDataFn = httpsCallable(functions, 'getWizXPData');

  // Real-time listener for user XP data
  useEffect(() => {
    if (!user?.uid) {
      setXpData(null);
      setLoading(false);
      return;
    }

    console.log('🎯 Setting up WIZ XP listener for:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          
          // Transform Firestore data to WizXPData format
          const wizXpData: WizXPData = {
            userId: user.uid,
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

          setXpData(wizXpData);
          console.log('📊 WIZ XP data updated:', wizXpData);
        } else {
          // Initialize user if doesn't exist
          initializeUser();
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('❌ Error listening to WIZ XP data:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Initialize user XP data
  const initializeUser = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      await WizXPSystem.initializeUserXP(user.uid);
    } catch (error) {
      console.error('❌ Error initializing WIZ XP:', error);
    }
  }, [user?.uid]);

  // Award watch XP
  const awardWatchXP = useCallback(async (
    videoId: string,
    watchTime: number,
    completionRate: number,
    sessionId?: string
  ) => {
    if (!user?.uid) return null;

    try {
      console.log('🎬 Awarding WIZ watch XP:', { videoId, watchTime, completionRate });
      
      const result = await awardWatchXPFn({
        videoId,
        watchTime,
        completionRate,
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      const data = result.data as any;
      console.log('✅ WIZ watch XP awarded:', data);

      // Dispatch level up event if applicable
      if (data.leveledUp) {
        window.dispatchEvent(new CustomEvent('wizLevelUp', {
          detail: {
            userId: user.uid,
            fromLevel: data.oldLevel,
            toLevel: data.level,
            xpGained: data.totalXpAwarded || data.xpAwarded,
            badgeEarned: data.badgeEarned
          }
        }));
      }

      // Dispatch XP update event
      window.dispatchEvent(new CustomEvent('wizXPUpdate', {
        detail: {
          userId: user.uid,
          xpGained: data.totalXpAwarded || data.xpAwarded,
          newTotal: data.currentXP,
          source: 'watch'
        }
      }));

      return data;
    } catch (error) {
      console.error('❌ Error awarding WIZ watch XP:', error);
      setError(error instanceof Error ? error.message : 'Failed to award watch XP');
      return null;
    }
  }, [user?.uid, awardWatchXPFn]);

  // Award share XP
  const awardShareXP = useCallback(async (videoId: string) => {
    if (!user?.uid) return null;

    try {
      console.log('🔗 Awarding WIZ share XP for:', videoId);
      
      const result = await awardWizShareXPFn({ videoId });
      const data = result.data as any;
      
      console.log('✅ WIZ share XP awarded:', data);

      // Dispatch events
      if (data.leveledUp) {
        window.dispatchEvent(new CustomEvent('wizLevelUp', {
          detail: {
            userId: user.uid,
            fromLevel: data.oldLevel,
            toLevel: data.level,
            xpGained: data.xpAwarded,
            badgeEarned: data.badgeEarned
          }
        }));
      }

      window.dispatchEvent(new CustomEvent('wizXPUpdate', {
        detail: {
          userId: user.uid,
          xpGained: data.xpAwarded,
          newTotal: data.currentXP,
          source: 'share'
        }
      }));

      return data;
    } catch (error) {
      console.error('❌ Error awarding WIZ share XP:', error);
      setError(error instanceof Error ? error.message : 'Failed to award share XP');
      return null;
    }
  }, [user?.uid, awardWizShareXPFn]);

  // Award referral XP
  const awardReferralXP = useCallback(async (referredUserId: string, referralCode?: string) => {
    if (!user?.uid) return null;

    try {
      console.log('👥 Awarding WIZ referral XP:', { referredUserId, referralCode });
      
      const result = await awardWizReferralXPFn({ referredUserId, referralCode });
      const data = result.data as any;
      
      console.log('✅ WIZ referral XP awarded:', data);

      // Dispatch events
      if (data.leveledUp) {
        window.dispatchEvent(new CustomEvent('wizLevelUp', {
          detail: {
            userId: user.uid,
            fromLevel: data.oldLevel,
            toLevel: data.level,
            xpGained: data.xpAwarded,
            badgeEarned: data.badgeEarned
          }
        }));
      }

      window.dispatchEvent(new CustomEvent('wizXPUpdate', {
        detail: {
          userId: user.uid,
          xpGained: data.xpAwarded,
          newTotal: data.currentXP,
          source: 'referral'
        }
      }));

      return data;
    } catch (error) {
      console.error('❌ Error awarding WIZ referral XP:', error);
      setError(error instanceof Error ? error.message : 'Failed to award referral XP');
      return null;
    }
  }, [user?.uid, awardWizReferralXPFn]);

  // Refresh XP data from server
  const refreshData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const result = await getWizXPDataFn();
      const serverData = result.data as any;
      
      // The real-time listener will pick up the changes
      console.log('🔄 Refreshed WIZ XP data from server:', serverData);
    } catch (error) {
      console.error('❌ Error refreshing WIZ XP data:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, getWizXPDataFn]);

  // Calculate progress info
  const progressInfo = xpData ? WizXPSystem.calculateLevel(xpData.currentXP) : {
    currentLevel: 1,
    currentXP: 0,
    xpInCurrentLevel: 0,
    xpNeededForNext: 100,
    nextLevelXP: 100,
    progressPercent: 0,
    totalXPForCurrentLevel: 0,
    totalXPForNextLevel: 100,
  };

  return {
    // Core data
    currentXP: xpData?.currentXP || 0,
    level: xpData?.level || 1,
    dailyXP: xpData?.dailyXpEarned || 0,
    dailyXpRemaining: Math.max(0, 360 - (xpData?.dailyXpEarned || 0)),
    canEarnXP: (xpData?.dailyXpEarned || 0) < 360,
    
    // Progress
    progressInfo,
    
    // Badges
    badges: xpData?.badges || [],
    totalBadges: xpData?.badges?.length || 0,
    
    // Stats
    lifetimeStats: xpData?.lifetimeStats || {
      totalWatchTime: 0,
      totalVideosWatched: 0,
      totalShares: 0,
      totalReferrals: 0,
      totalVideosCompleted: 0,
    },
    
    // State
    loading,
    error,
    
    // Actions
    awardWatchXP,
    awardShareXP,
    awardReferralXP,
    refreshData,
  };
};