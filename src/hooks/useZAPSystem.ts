import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ZAPSystem, ZAPData, calculateLevel } from '@/lib/zap-system';

export interface ZAPProgress {
  level: number;
  currentLevelZAPs: number;
  nextLevelZAPs: number;
  progressPercent: number;
  totalZAPs: number;
  zapsToNextLevel: number;
  zapsForCurrentLevel: number;
  zapsForNextLevel: number;
}

export const useZAPSystem = () => {
  const { user } = useAuth();
  const [zapData, setZAPData] = useState<ZAPData | null>(null);
  const [zapProgress, setZAPProgress] = useState<ZAPProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user ZAP data
  useEffect(() => {
    const loadZAPData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await ZAPSystem.getUserZAPs(user.uid);

        if (!data) {
          // Initialize user ZAPs if not found
          const initialData = await ZAPSystem.initializeUserZAPs(user.uid);
          setZAPData(initialData);
          setZAPProgress(calculateLevel(initialData.totalZAPs));
        } else {
          setZAPData(data);
          setZAPProgress(calculateLevel(data.totalZAPs));
        }
      } catch (err) {
        console.error('Error loading ZAP data:', err);
        setError('Failed to load ZAP data');
      } finally {
        setLoading(false);
      }
    };

    loadZAPData();
  }, [user?.uid]);

  // Listen for ZAP updates
  useEffect(() => {
    if (!user?.uid) return;

    const handleZAPUpdate = (event: CustomEvent) => {
      const { userId, totalZAPs, zapsGained } = event.detail;

      if (userId === user.uid) {
        // Update local state with new ZAP values
        setZAPData(prev => prev ? {
          ...prev,
          totalZAPs: totalZAPs,
          level: calculateLevel(totalZAPs).level
        } : null);

        setZAPProgress(calculateLevel(totalZAPs));

        console.log(`⚡ Hook: ZAPs updated +${zapsGained} (total: ${totalZAPs})`);
      }
    };

    const handleLevelUp = (event: CustomEvent) => {
      const { userId, newLevel, oldLevel } = event.detail;

      if (userId === user.uid) {
        console.log(`🎉 Hook: Level up! ${oldLevel} → ${newLevel}`);
        // Show level up notification
        // You can add toast notification here
      }
    };

    window.addEventListener('zapsUpdated', handleZAPUpdate as EventListener);
    window.addEventListener('levelUp', handleLevelUp as EventListener);

    return () => {
      window.removeEventListener('zapsUpdated', handleZAPUpdate as EventListener);
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
    };
  }, [user?.uid]);

  const awardWatchTimeZAPs = async (
    videoId: string,
    watchTimeSeconds: number,
    completionRate: number,
    isBoosted?: boolean
  ) => {
    if (!user?.uid) return 0;

    try {
      return await ZAPSystem.awardWatchTimeZAPs(
        user.uid,
        videoId,
        watchTimeSeconds,
        completionRate,
        isBoosted
      );
    } catch (error) {
      console.error('Error awarding watch time ZAPs:', error);
      return 0;
    }
  };

  const awardShareZAPs = async (videoId: string) => {
    if (!user?.uid) return 0;

    try {
      return await ZAPSystem.awardShareZAPs(user.uid, videoId);
    } catch (error) {
      console.error('Error awarding share ZAPs:', error);
      return 0;
    }
  };

  const awardReferralZAPs = async (newUserId: string) => {
    if (!user?.uid) return 0;

    try {
      return await ZAPSystem.awardReferralZAPs(user.uid, newUserId);
    } catch (error) {
      console.error('Error awarding referral ZAPs:', error);
      return 0;
    }
  };

  const checkStreakBonus = async () => {
    if (!user?.uid) return 0;

    try {
      return await ZAPSystem.checkStreakBonus(user.uid);
    } catch (error) {
      console.error('Error checking streak bonus:', error);
      return 0;
    }
  };

  const refreshZAPData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const data = await ZAPSystem.getUserZAPs(user.uid);
      if (data) {
        setZAPData(data);
        setZAPProgress(calculateLevel(data.totalZAPs));
      }
    } catch (error) {
      console.error('Error refreshing ZAP data:', error);
      setError('Failed to refresh ZAP data');
    } finally {
      setLoading(false);
    }
  };

  return {
    zapData,
    zapProgress,
    loading,
    error,
    awardWatchTimeZAPs,
    awardShareZAPs,
    awardReferralZAPs,
    checkStreakBonus,
    refreshZAPData
  };
};