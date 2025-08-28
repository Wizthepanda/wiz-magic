import { useState, useRef, useCallback, useEffect } from 'react';
import { useXPSystem } from './useXPSystem';
import { useAuth } from './useAuth';

interface WatchSession {
  sessionId: string;
  videoId: string;
  startTime: number;
  lastUpdateTime: number;
  totalWatchTime: number;
  videoDuration: number;
  completionRate: number;
  isActive: boolean;
  hasBeenCounted: boolean;
}

interface WatchTrackerOptions {
  minWatchTime?: number; // Minimum seconds to award XP
  updateInterval?: number; // How often to update progress (ms)
  completionThreshold?: number; // % completion for bonus (0.9 = 90%)
}

const DEFAULT_OPTIONS: WatchTrackerOptions = {
  minWatchTime: 5, // 5 seconds minimum
  updateInterval: 1000, // Update every second
  completionThreshold: 0.9 // 90% completion bonus
};

export const useWatchTracker = (videoId: string, options: WatchTrackerOptions = {}) => {
  const { user } = useAuth();
  const { awardWatchXP } = useXPSystem();
  
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const [session, setSession] = useState<WatchSession | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null);
  const lastPositionRef = useRef<number>(0);
  const seekDetectionRef = useRef<{ position: number; time: number } | null>(null);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `${user?.uid}_${videoId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, [user?.uid, videoId]);

  // Start tracking session
  const startTracking = useCallback((player: any, videoDuration: number) => {
    if (!user?.uid || !videoId || isTracking) return;

    console.log('🎬 Starting watch tracking for video:', videoId);
    
    const sessionId = generateSessionId();
    const newSession: WatchSession = {
      sessionId,
      videoId,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      totalWatchTime: 0,
      videoDuration,
      completionRate: 0,
      isActive: true,
      hasBeenCounted: false
    };

    setSession(newSession);
    setIsTracking(true);
    playerRef.current = player;
    lastPositionRef.current = 0;
    
    // Start tracking interval
    intervalRef.current = setInterval(() => {
      updateWatchTime();
    }, opts.updateInterval);

  }, [user?.uid, videoId, isTracking, generateSessionId, opts.updateInterval]);

  // Update watch time with anti-cheat measures
  const updateWatchTime = useCallback(() => {
    if (!session || !playerRef.current || !isTracking) return;

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const currentTimestamp = Date.now();
      
      // Anti-cheat: Detect impossible playback speeds
      const timeDiff = (currentTimestamp - session.lastUpdateTime) / 1000;
      const positionDiff = currentTime - lastPositionRef.current;
      const playbackRate = timeDiff > 0 ? positionDiff / timeDiff : 0;
      
      // Allow for some variance in playback rate (0.5x to 2.5x speed)
      if (playbackRate > 2.5 || playbackRate < 0) {
        console.warn('🚨 Suspicious playback detected:', { playbackRate, positionDiff, timeDiff });
        return;
      }

      // Anti-cheat: Detect large seeks (skip detection)
      if (Math.abs(positionDiff) > 10 && timeDiff < 2) {
        console.warn('🚨 Large seek detected:', { positionDiff, timeDiff });
        seekDetectionRef.current = { position: currentTime, time: currentTimestamp };
        return;
      }

      // Only count legitimate watch time (normal playback)
      const legitimateWatchTime = Math.min(positionDiff, timeDiff);
      
      if (legitimateWatchTime > 0 && legitimateWatchTime <= 2) {
        setSession(prev => {
          if (!prev) return null;
          
          const newTotalWatchTime = prev.totalWatchTime + legitimateWatchTime;
          const newCompletionRate = session.videoDuration > 0 ? 
            Math.min(newTotalWatchTime / session.videoDuration, 1) : 0;
          
          return {
            ...prev,
            totalWatchTime: newTotalWatchTime,
            completionRate: newCompletionRate,
            lastUpdateTime: currentTimestamp
          };
        });
      }

      lastPositionRef.current = currentTime;
      
    } catch (error) {
      console.error('❌ Error updating watch time:', error);
    }
  }, [session, isTracking]);

  // Stop tracking and award XP
  const stopTracking = useCallback(async () => {
    if (!session || !isTracking || session.hasBeenCounted) return;

    console.log('⏹️ Stopping watch tracking:', {
      sessionId: session.sessionId,
      totalWatchTime: session.totalWatchTime,
      completionRate: session.completionRate
    });

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Award XP if minimum watch time is met
    if (session.totalWatchTime >= opts.minWatchTime!) {
      const isCompleted = session.completionRate >= opts.completionThreshold!;
      
      try {
        const result = await awardWatchXP(
          session.videoId,
          session.totalWatchTime,
          isCompleted,
          session.sessionId
        );

        if (result?.success) {
          console.log('✅ XP awarded for watch session:', result);
          setSession(prev => prev ? { ...prev, hasBeenCounted: true } : null);
        }
      } catch (error) {
        console.error('❌ Error awarding XP for watch session:', error);
      }
    }

    setIsTracking(false);
    playerRef.current = null;
    
  }, [session, isTracking, opts.minWatchTime, opts.completionThreshold, awardWatchXP]);

  // Pause tracking
  const pauseTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('⏸️ Watch tracking paused');
  }, []);

  // Resume tracking
  const resumeTracking = useCallback(() => {
    if (session && isTracking && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        updateWatchTime();
      }, opts.updateInterval);
      console.log('▶️ Watch tracking resumed');
    }
  }, [session, isTracking, updateWatchTime, opts.updateInterval]);

  // React Player event handlers
  const handlePlay = useCallback(() => {
    resumeTracking();
  }, [resumeTracking]);

  const handlePause = useCallback(() => {
    pauseTracking();
  }, [pauseTracking]);

  const handleEnded = useCallback(() => {
    stopTracking();
  }, [stopTracking]);

  const handleProgress = useCallback((state: { played: number, playedSeconds: number }) => {
    // Additional validation can be added here
    if (seekDetectionRef.current) {
      const timeSinceSeek = Date.now() - seekDetectionRef.current.time;
      if (timeSinceSeek > 3000) { // Reset after 3 seconds
        seekDetectionRef.current = null;
      }
    }
  }, []);

  // Cleanup on unmount or video change
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (session && isTracking && !session.hasBeenCounted) {
        // Award XP for partial watch time on unmount
        stopTracking();
      }
    };
  }, [videoId]);

  // Auto-stop tracking after video ends or component unmounts
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, []);

  return {
    // State
    session,
    isTracking,
    watchTime: session?.totalWatchTime || 0,
    completionRate: session?.completionRate || 0,
    
    // Actions
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    
    // React Player event handlers
    onPlay: handlePlay,
    onPause: handlePause,
    onEnded: handleEnded,
    onProgress: handleProgress
  };
};