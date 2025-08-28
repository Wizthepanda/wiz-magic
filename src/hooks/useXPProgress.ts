import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { 
  LEVEL_THRESHOLDS, 
  calculateLevel, 
  initializeUserXP,
  awardWatchTimeXP,
  awardShareXP,
  awardReferralXP
} from '@/lib/xp-service';

interface XPProgressData {
  currentXP: number;
  level: number;
  dailyXpEarned: number;
  dailyXpRemaining: number;
  lastXpReset: Date;
  displayName: string;
  email: string;
  avatarUrl?: string;
  
  // Progress calculations
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
}

export const useXPProgress = () => {
  const { user } = useAuth();
  const [xpData, setXpData] = useState<XPProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time Firestore listener for XP data
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
      async (docSnapshot) => {
        try {
          let userData;
          
          if (!docSnapshot.exists()) {
            // Initialize user if doesn't exist
            console.log('🔄 Initializing user XP data...');
            userData = await initializeUserXP(
              user.uid, 
              user.displayName || 'WIZ User', 
              user.email || '', 
              user.photoURL || ''
            );
          } else {
            const data = docSnapshot.data();
            userData = {
              currentXP: data.currentXP || 0,
              level: data.level || 1,
              dailyXpEarned: data.dailyXpEarned || 0,
              lastXpReset: data.lastXpReset?.toDate() || new Date(),
              displayName: data.displayName || user.displayName || 'WIZ User',
              email: data.email || user.email || '',
              avatarUrl: data.avatarUrl || user.photoURL || ''
            };
          }

          // Calculate progress data
          const levelData = calculateLevel(userData.currentXP);
          const xpInCurrentLevel = userData.currentXP - levelData.xpForCurrentLevel;
          const xpNeededForNextLevel = levelData.xpForNextLevel - levelData.xpForCurrentLevel;
          const progressPercent = xpNeededForNextLevel > 0 ? (xpInCurrentLevel / xpNeededForNextLevel) * 100 : 100;

          const progressData: XPProgressData = {
            ...userData,
            xpForCurrentLevel: levelData.xpForCurrentLevel,
            xpForNextLevel: levelData.xpForNextLevel,
            progressPercent: Math.min(100, Math.max(0, progressPercent)),
            xpInCurrentLevel,
            xpNeededForNextLevel,
            dailyXpRemaining: Math.max(0, 360 - userData.dailyXpEarned)
          };

          setXpData(progressData);
          setLoading(false);
          setError(null);

          console.log('📊 XP data updated:', {
            currentXP: userData.currentXP,
            level: userData.level,
            progress: `${Math.round(progressPercent)}%`,
            dailyXP: `${userData.dailyXpEarned}/360`
          });

        } catch (err) {
          console.error('❌ Error processing XP data:', err);
          setError(err instanceof Error ? err.message : 'Failed to load XP data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('❌ Error listening to XP data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log('🔌 Cleaning up XP listener');
      unsubscribe();
    };
  }, [user?.uid, user?.displayName, user?.email, user?.photoURL]);

  // Award XP functions that use the corrected service
  const awardWatchXP = async (watchTimeSeconds: number, completedVideo: boolean = false, videoId?: string) => {
    if (!user?.uid) return null;
    
    try {
      const result = await awardWatchTimeXP(user.uid, watchTimeSeconds, completedVideo, videoId);
      console.log(`🎬 Watch XP result:`, result);
      return result;
    } catch (error) {
      console.error('❌ Error awarding watch XP:', error);
      return null;
    }
  };

  const awardShare = async (videoId?: string) => {
    if (!user?.uid) return null;
    
    try {
      const result = await awardShareXP(user.uid, videoId);
      console.log(`📤 Share XP result:`, result);
      return result;
    } catch (error) {
      console.error('❌ Error awarding share XP:', error);
      return null;
    }
  };

  const awardReferral = async (referredUserId: string) => {
    if (!user?.uid) return null;
    
    try {
      const result = await awardReferralXP(user.uid, referredUserId);
      console.log(`👥 Referral XP result:`, result);
      return result;
    } catch (error) {
      console.error('❌ Error awarding referral XP:', error);
      return null;
    }
  };

  // Helper functions for display
  const formatXP = (xp: number): string => {
    return Math.floor(xp).toLocaleString();
  };

  const getProgressBarColor = (level: number): string => {
    if (level >= 1 && level <= 4) return 'from-purple-500 to-purple-600';
    if (level >= 5 && level <= 6) return 'from-blue-500 to-blue-600';
    if (level >= 7 && level <= 9) return 'from-pink-500 to-pink-600';
    if (level === 10) return 'from-yellow-400 to-yellow-500';
    return 'from-gray-500 to-gray-600';
  };

  const canEarnMoreXP = xpData ? xpData.dailyXpRemaining > 0 : true;
  const dailyProgressPercent = xpData ? (xpData.dailyXpEarned / 360) * 100 : 0;

  return {
    // Core data
    xpData,
    loading,
    error,

    // Computed values
    canEarnMoreXP,
    dailyProgressPercent,
    
    // Award functions
    awardWatchXP,
    awardShare,
    awardReferral,

    // Helper functions
    formatXP,
    getProgressBarColor,

    // Constants
    LEVEL_THRESHOLDS,
    DAILY_XP_CAP: 360
  };
};