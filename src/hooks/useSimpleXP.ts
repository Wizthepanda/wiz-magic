import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  subscribeToUserXP, 
  awardWatchTimeXP, 
  awardShareXP, 
  awardReferralXP,
  awardCompletionBonusXP,
  initializeUserXP
} from '@/lib/wiz-xp-core';


interface XPData {
  currentXP: number;
  level: number;
  dailyXpEarned: number;
  displayName: string;
  email: string;
  avatarUrl?: string;
  
  // Calculated fields
  progress: number;
  nextThreshold: number;
  prevThreshold: number;
  canEarnMoreXP: boolean;
  
  // Computed for UI compatibility
  progressPercent: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  dailyXpRemaining: number;
}

export const useSimpleXP = () => {
  const { user } = useAuth();
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Real-time Firestore listener using wiz-xp-core
  useEffect(() => {
    if (!user?.uid) {
      setXpData(null);
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up XP data subscription...');
    let unsubXP: (() => void) | null = null;
    
    // Initialize user if needed
    initializeUserXP(
      user.uid, 
      user.displayName || 'WIZ User', 
      user.email || ''
    ).catch(console.error);

    // Setup listener with cleanup
    function listenToXP(uid: string) {
      if (unsubXP) unsubXP(); // cleanup existing
      unsubXP = subscribeToUserXP(uid, (coreData) => {
      try {
        // Convert core data to UI-friendly format
        const xpInCurrentLevel = coreData.currentXP - coreData.prevThreshold;
        const xpNeededForNextLevel = coreData.nextThreshold - coreData.prevThreshold;
        
        const enrichedData: XPData = {
          currentXP: coreData.currentXP,
          level: coreData.level,
          dailyXpEarned: coreData.dailyXpEarned,
          displayName: user.displayName || 'WIZ User',
          email: user.email || '',
          avatarUrl: user.photoURL || '',
          
          // Core data
          progress: coreData.progress,
          nextThreshold: coreData.nextThreshold,
          prevThreshold: coreData.prevThreshold,
          canEarnMoreXP: coreData.canEarnMoreXP,
          
          // UI compatibility fields
          progressPercent: coreData.progress,
          xpForCurrentLevel: coreData.prevThreshold,
          xpForNextLevel: coreData.nextThreshold,
          xpInCurrentLevel,
          xpNeededForNextLevel,
          dailyXpRemaining: Math.max(0, 360 - coreData.dailyXpEarned)
        };

        setXpData(enrichedData);
        setLoading(false);
        setError(null);

      } catch (err) {
        console.error('❌ Error processing XP data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load XP data');
        setLoading(false);
      }
    });
    }

    // Start listening
    listenToXP(user.uid);

    return () => {
      if (unsubXP) unsubXP(); // cleanup on component unmount
    };
  }, [user?.uid, user?.displayName, user?.email, user?.photoURL]);

  // XP award functions using wiz-xp-core
  const awardWatchXP = async (watchTimeSeconds: number, completed: boolean = false): Promise<boolean> => {
    if (!user?.uid) return false;
    
    try {
      // Award base watch time XP
      const watchResult = await awardWatchTimeXP(user.uid, watchTimeSeconds);
      
      // Award completion bonus if video was completed and we earned watch XP
      if (completed && watchResult.success && watchResult.xpAwarded > 0) {
        const bonusResult = await awardCompletionBonusXP(user.uid, watchResult.xpAwarded);
        console.log(`🏆 Awarded completion bonus: ${bonusResult.xpAwarded} XP`);
      }
      
      return watchResult.success;
    } catch (error) {
      console.error('❌ Error awarding watch XP:', error);
      return false;
    }
  };

  const awardShare = async (videoId?: string): Promise<boolean> => {
    if (!user?.uid) return false;
    const result = await awardShareXP(user.uid);
    return result.success;
  };

  const awardReferral = async (referredUserId: string): Promise<boolean> => {
    if (!user?.uid) return false;
    const result = await awardReferralXP(user.uid);
    return result.success;
  };

  return {
    xpData,
    loading,
    error,
    awardWatchXP,
    awardShareXP: awardShare,
    awardReferralXP: awardReferral,
    canEarnMoreXP: xpData ? xpData.canEarnMoreXP : true
  };
};