import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { functions, db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { YouTubeXPService } from '@/lib/youtube-xp-service';

export interface YouTubeXPData {
  isConnected: boolean;
  lastSyncDate: Date | null;
  totalOffPlatformXP: number;
  youtubeEntriesCount: number;
  canSync: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface XPLogEntry {
  id: string;
  source: 'watch_time' | 'completion_bonus' | 'share' | 'referral' | 'youtube_api';
  xpAmount: number;
  videoId?: string;
  timestamp: Date;
  details: {
    watchTime?: number;
    completionRate?: number;
    dailyXPBeforeAward: number;
    dailyXPAfterAward: number;
  };
}

export interface SyncResult {
  success: boolean;
  entriesProcessed: number;
  xpAwarded: number;
  error?: string;
}

export const useYouTubeXP = () => {
  const { user } = useAuth();
  const [youtubeXPData, setYouTubeXPData] = useState<YouTubeXPData>({
    isConnected: false,
    lastSyncDate: null,
    totalOffPlatformXP: 0,
    youtubeEntriesCount: 0,
    canSync: false,
    isLoading: true,
    error: null,
  });

  const [xpLogs, setXpLogs] = useState<XPLogEntry[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Cloud Functions
  const syncYouTubeHistoryFn = httpsCallable(functions, 'syncYouTubeHistory');
  const initializeYouTubeTrackingFn = httpsCallable(functions, 'initializeYouTubeTracking');

  // Listen to user tracking data
  useEffect(() => {
    if (!user?.uid) {
      setYouTubeXPData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const trackingRef = doc(db, 'userTrackingData', user.uid);
    const unsubscribe = onSnapshot(
      trackingRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setYouTubeXPData(prev => ({
            ...prev,
            isConnected: data.youtubeConnected || false,
            lastSyncDate: data.lastYouTubeSyncDate?.toDate() || null,
            canSync: !!(data.youtubeTokens?.accessToken && 
                      data.youtubeTokens.expiresAt?.toDate() > new Date()),
            isLoading: false,
            error: null,
          }));
        } else {
          setYouTubeXPData(prev => ({
            ...prev,
            isConnected: false,
            canSync: false,
            isLoading: false,
          }));
        }
      },
      (error) => {
        console.error('Error listening to tracking data:', error);
        setYouTubeXPData(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Listen to YouTube watch history
  useEffect(() => {
    if (!user?.uid) return;

    const historyQuery = query(
      collection(db, 'youtubeWatchHistory'),
      where('userId', '==', user.uid),
      orderBy('watchedAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        let totalXP = 0;
        const entriesCount = snapshot.size;

        snapshot.forEach(doc => {
          const data = doc.data();
          totalXP += data.xpAwarded || 0;
        });

        setYouTubeXPData(prev => ({
          ...prev,
          totalOffPlatformXP: totalXP,
          youtubeEntriesCount: entriesCount,
        }));
      },
      (error) => {
        console.error('Error listening to YouTube history:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Listen to XP logs
  useEffect(() => {
    if (!user?.uid) return;

    const logsQuery = query(
      collection(db, 'xpLogs'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logs: XPLogEntry[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          logs.push({
            ...data,
            timestamp: data.timestamp.toDate(),
          } as XPLogEntry);
        });
        setXpLogs(logs);
      },
      (error) => {
        console.error('Error listening to XP logs:', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Initialize YouTube tracking
  const initializeTracking = useCallback(async (
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await initializeYouTubeTrackingFn({
        accessToken,
        refreshToken,
        expiresIn: expiresIn || 3600,
      });

      // Also initialize tracking data locally
      await YouTubeXPService.initializeUserTracking(user.uid);
      await YouTubeXPService.saveYouTubeTokens(user.uid, accessToken, refreshToken, expiresIn);

      return true;
    } catch (error) {
      console.error('Error initializing YouTube tracking:', error);
      setYouTubeXPData(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize tracking',
      }));
      return false;
    }
  }, [user?.uid, initializeYouTubeTrackingFn]);

  // Manual sync YouTube history
  const syncYouTubeHistory = useCallback(async (): Promise<SyncResult> => {
    if (!user?.uid || !youtubeXPData.canSync) {
      return {
        success: false,
        entriesProcessed: 0,
        xpAwarded: 0,
        error: 'Cannot sync - user not authenticated or no valid token',
      };
    }

    setSyncInProgress(true);

    try {
      const result = await syncYouTubeHistoryFn();
      const data = result.data as {
        success: boolean;
        entriesProcessed: number;
        xpAwarded: number;
      };

      setSyncInProgress(false);

      return {
        success: data.success,
        entriesProcessed: data.entriesProcessed || 0,
        xpAwarded: data.xpAwarded || 0,
      };
    } catch (error) {
      setSyncInProgress(false);
      console.error('Error syncing YouTube history:', error);

      return {
        success: false,
        entriesProcessed: 0,
        xpAwarded: 0,
        error: error instanceof Error ? error.message : 'Sync failed',
      };
    }
  }, [user?.uid, youtubeXPData.canSync, syncYouTubeHistoryFn]);

  // Get XP breakdown by source
  const getXPBreakdown = useCallback(() => {
    const breakdown = {
      watchTime: 0,
      completionBonus: 0,
      shares: 0,
      referrals: 0,
      youtubeAPI: 0,
    };

    xpLogs.forEach(log => {
      switch (log.source) {
        case 'watch_time':
          breakdown.watchTime += log.xpAmount;
          break;
        case 'completion_bonus':
          breakdown.completionBonus += log.xpAmount;
          break;
        case 'share':
          breakdown.shares += log.xpAmount;
          break;
        case 'referral':
          breakdown.referrals += log.xpAmount;
          break;
        case 'youtube_api':
          breakdown.youtubeAPI += log.xpAmount;
          break;
      }
    });

    return breakdown;
  }, [xpLogs]);

  // Check if user has synced recently
  const getTimeSinceLastSync = useCallback(() => {
    if (!youtubeXPData.lastSyncDate) return null;

    const now = new Date();
    const diffMs = now.getTime() - youtubeXPData.lastSyncDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { hours: diffHours, minutes: diffMinutes };
  }, [youtubeXPData.lastSyncDate]);

  // Get recent XP activity
  const getRecentActivity = useCallback((days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return xpLogs.filter(log => log.timestamp >= cutoff);
  }, [xpLogs]);

  return {
    // Data
    youtubeXPData,
    xpLogs,
    syncInProgress,

    // Actions
    initializeTracking,
    syncYouTubeHistory,

    // Computed values
    getXPBreakdown,
    getTimeSinceLastSync,
    getRecentActivity,

    // Status checks
    canSyncNow: youtubeXPData.canSync && !syncInProgress,
    needsTokenRefresh: youtubeXPData.isConnected && !youtubeXPData.canSync,
  };
};