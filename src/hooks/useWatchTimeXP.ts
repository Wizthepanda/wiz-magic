import { useState, useEffect, useRef, useCallback } from 'react';
import { useWizXPSystem } from './useWizXPSystem';
import { XP_CONFIG } from '@/lib/xp-system';

interface WatchTimeXPConfig {
  videoId: string;
  videoDuration: number; // Total video duration in seconds
  onXPAwarded?: (xpAwarded: number, totalXP: number) => void;
  onLevelUp?: (newLevel: number, oldLevel: number) => void;
  enableAntiCheat?: boolean;
}

interface WatchTimeState {
  isWatching: boolean;
  totalWatchTime: number;
  sessionWatchTime: number;
  lastHeartbeat: number;
  isTabFocused: boolean;
  completionRate: number;
  xpEarned: number;
}

export const useWatchTimeXP = (config: WatchTimeXPConfig) => {
  const { awardWatchTimeXP, canEarnMoreXP, dailyXPRemaining } = useWizXPSystem();
  
  const [watchState, setWatchState] = useState<WatchTimeState>({
    isWatching: false,
    totalWatchTime: 0,
    sessionWatchTime: 0,
    lastHeartbeat: 0,
    isTabFocused: true,
    completionRate: 0,
    xpEarned: 0
  });

  const watchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Track tab focus for anti-cheat
  useEffect(() => {
    if (!config.enableAntiCheat) return;

    const handleFocus = () => setWatchState(prev => ({ ...prev, isTabFocused: true }));
    const handleBlur = () => setWatchState(prev => ({ ...prev, isTabFocused: false }));

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [config.enableAntiCheat]);

  // Start watching - begins XP accumulation
  const startWatching = useCallback(() => {
    if (watchState.isWatching || !canEarnMoreXP) return;

    console.log('🎬 Starting watch time XP tracking for:', config.videoId);
    setWatchState(prev => ({ ...prev, isWatching: true, lastHeartbeat: Date.now() }));

    // Track watch time every second
    watchIntervalRef.current = setInterval(() => {
      setWatchState(prev => {
        // Only increment if tab is focused (anti-cheat)
        const shouldIncrement = !XP_CONFIG.FOCUS_REQUIRED || prev.isTabFocused;
        
        if (!shouldIncrement) return prev;

        const newSessionTime = prev.sessionWatchTime + 1;
        const newTotalTime = prev.totalWatchTime + 1;
        const newCompletionRate = Math.min(1, newTotalTime / config.videoDuration);

        return {
          ...prev,
          sessionWatchTime: newSessionTime,
          totalWatchTime: newTotalTime,
          completionRate: newCompletionRate
        };
      });
    }, 1000);

    // Send heartbeat pings for anti-cheat (every 10 seconds)
    if (config.enableAntiCheat) {
      heartbeatIntervalRef.current = setInterval(() => {
        setWatchState(prev => ({ ...prev, lastHeartbeat: Date.now() }));
        console.log('💓 Heartbeat ping for video:', config.videoId);
      }, XP_CONFIG.ANTI_CHEAT_PING_INTERVAL);
    }
  }, [watchState.isWatching, canEarnMoreXP, config.videoId, config.videoDuration, config.enableAntiCheat]);

  // Pause watching
  const pauseWatching = useCallback(() => {
    if (!watchState.isWatching) return;

    console.log('⏸️ Pausing watch time XP tracking');
    setWatchState(prev => ({ ...prev, isWatching: false }));

    if (watchIntervalRef.current) {
      clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, [watchState.isWatching]);

  // End watching session and award XP
  const endWatchingSession = useCallback(async () => {
    if (!watchState.isWatching && watchState.sessionWatchTime === 0) return;

    console.log('🏁 Ending watch session:', {
      sessionTime: watchState.sessionWatchTime,
      completionRate: watchState.completionRate
    });

    pauseWatching();

    // Award XP if user watched for at least 10 seconds
    if (watchState.sessionWatchTime >= 10) {
      const xpAwarded = await awardWatchTimeXP(
        config.videoId,
        watchState.sessionWatchTime,
        watchState.completionRate
      );

      if (xpAwarded > 0) {
        setWatchState(prev => ({ ...prev, xpEarned: prev.xpEarned + xpAwarded }));
        config.onXPAwarded?.(xpAwarded, watchState.xpEarned + xpAwarded);
      }
    }

    // Reset session data
    setWatchState(prev => ({
      ...prev,
      sessionWatchTime: 0,
      isWatching: false
    }));
  }, [watchState, pauseWatching, awardWatchTimeXP, config]);

  // Auto-award XP periodically during long sessions (every 2 minutes)
  const checkPeriodicXPAward = useCallback(async () => {
    if (!watchState.isWatching || watchState.sessionWatchTime < 120) return;

    // Award XP for the current session
    const xpAwarded = await awardWatchTimeXP(
      config.videoId,
      watchState.sessionWatchTime,
      watchState.completionRate
    );

    if (xpAwarded > 0) {
      setWatchState(prev => ({
        ...prev,
        xpEarned: prev.xpEarned + xpAwarded,
        sessionWatchTime: 0 // Reset session counter after awarding
      }));
      
      config.onXPAwarded?.(xpAwarded, watchState.xpEarned + xpAwarded);
    }
  }, [watchState, awardWatchTimeXP, config]);

  // Check for periodic XP awards every 2 minutes
  useEffect(() => {
    if (!watchState.isWatching) return;

    const periodicTimer = setInterval(checkPeriodicXPAward, 120000); // 2 minutes
    return () => clearInterval(periodicTimer);
  }, [watchState.isWatching, checkPeriodicXPAward]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, []);

  // Listen for level up events
  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      const { newLevel, oldLevel } = event.detail;
      config.onLevelUp?.(newLevel, oldLevel);
    };

    window.addEventListener('levelUp', handleLevelUp as EventListener);
    return () => window.removeEventListener('levelUp', handleLevelUp as EventListener);
  }, [config]);

  // Auto-end session when component unmounts or video changes
  useEffect(() => {
    return () => {
      endWatchingSession();
    };
  }, []);

  // Calculate potential XP for current session
  const potentialXP = Math.floor(watchState.sessionWatchTime / 10);
  const potentialBonusXP = watchState.completionRate >= 1.0 ? 
    Math.floor(potentialXP * XP_CONFIG.COMPLETION_BONUS_RATE) : 0;

  return {
    // State
    isWatching: watchState.isWatching,
    sessionWatchTime: watchState.sessionWatchTime,
    totalWatchTime: watchState.totalWatchTime,
    completionRate: watchState.completionRate,
    isTabFocused: watchState.isTabFocused,
    xpEarned: watchState.xpEarned,

    // Calculated values
    potentialXP,
    potentialBonusXP,
    totalPotentialXP: potentialXP + potentialBonusXP,
    watchTimeFormatted: formatWatchTime(watchState.totalWatchTime),
    sessionTimeFormatted: formatWatchTime(watchState.sessionWatchTime),

    // Actions
    startWatching,
    pauseWatching,
    endWatchingSession,

    // Anti-cheat info
    sessionId: sessionIdRef.current,
    lastHeartbeat: watchState.lastHeartbeat,
    canEarnXP: canEarnMoreXP && (watchState.isTabFocused || !XP_CONFIG.FOCUS_REQUIRED)
  };
};

// Helper function to format watch time
function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}