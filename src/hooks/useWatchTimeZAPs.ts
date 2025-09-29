import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { ZAP_CONFIG, ZAPSystem } from '@/lib/zap-system';

interface WatchTimeZAPsConfig {
  videoId: string;
  videoDuration?: number;
  isBoosted?: boolean;
  onZAPsAwarded?: (zaps: number) => void;
  onProgressUpdate?: (progress: number) => void;
  onVideoCompleted?: () => void;
  actualVideoTime?: number; // Optional: actual video position from player
  isVideoPlaying?: boolean; // Optional: whether video is currently playing
}

export const useWatchTimeZAPs = ({
  videoId,
  videoDuration = 0,
  isBoosted = false,
  onZAPsAwarded,
  onProgressUpdate,
  onVideoCompleted,
  actualVideoTime,
  isVideoPlaying = true
}: WatchTimeZAPsConfig) => {
  const { user } = useAuth();
  const { awardWatchTimeZAPs } = useZAPSystem();

  const [isTracking, setIsTracking] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [lastPingTime, setLastPingTime] = useState(Date.now());
  const [tabFocused, setTabFocused] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [totalZAPsEarned, setTotalZAPsEarned] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [hasBeenCompleted, setHasBeenCompleted] = useState(false);
  const [progressBarReady, setProgressBarReady] = useState(false);

  const watchTimeRef = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastZAPAwardRef = useRef(0);

  // Check if video has been completed before
  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (!user?.uid || !videoId) return;

      try {
        const completed = await ZAPSystem.hasVideoBeenCompleted(user.uid, videoId);
        setHasBeenCompleted(completed);
        if (completed) {
          console.log(`🔄 Video ${videoId} has already been completed for ZAPs`);
        }
      } catch (error) {
        console.error('Error checking video completion status:', error);
      }
    };

    checkCompletionStatus();
  }, [user?.uid, videoId]);

  // Track tab focus for anti-cheat
  useEffect(() => {
    const handleFocus = () => setTabFocused(true);
    const handleBlur = () => setTabFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Start watch time tracking
  const startTracking = () => {
    if (!user?.uid || !videoId) {
      console.log(`⚡ Cannot start ZAP tracking - missing user (${!!user?.uid}) or videoId (${!!videoId})`);
      return;
    }

    if (isTracking) {
      console.log(`⚡ ZAP tracking already running for video ${videoId}`);
      return;
    }

    console.log(`⚡ Starting ZAP tracking for video ${videoId}`);
    setIsTracking(true);
    setLastPingTime(Date.now());
    watchTimeRef.current = 0;
    setWatchTime(0);
    setCompletionRate(0); // Reset completion rate when starting
    setTotalZAPsEarned(0);
    setProgressBarReady(true); // Mark progress bar as ready to update

    // Start heartbeat ping interval
    pingIntervalRef.current = setInterval(() => {
      pingWatchTime();
    }, ZAP_CONFIG.ANTI_CHEAT_PING_INTERVAL);
  };

  // Stop watch time tracking
  const stopTracking = async () => {
    if (!isTracking) {
      console.log(`⚡ ZAP tracking already stopped for video ${videoId}`);
      return;
    }

    console.log(`⚡ Stopping ZAP tracking for video ${videoId}`);
    setIsTracking(false);

    // Clear interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    // Award final ZAPs if any watch time accumulated
    if (watchTimeRef.current > 0) {
      await awardZAPsForWatchTime();
    }
  };

  // Ping watch time progress
  const pingWatchTime = async () => {
    if (!user?.uid || !tabFocused) return;

    const now = Date.now();
    const deltaSeconds = (now - lastPingTime) / 1000;

    // Only count time if tab is focused and delta is reasonable (prevent cheating)
    if (ZAP_CONFIG.FOCUS_REQUIRED && !tabFocused) return;
    if (deltaSeconds > 15) return; // Ignore if more than 15 seconds (tab was probably inactive)

    // Only increment watch time if video is playing
    if (isVideoPlaying) {
      watchTimeRef.current += deltaSeconds;
      setWatchTime(watchTimeRef.current);
    }
    setLastPingTime(now);

    let newCompletionRate = completionRate; // Default to current completion rate

    // Update completion rate based on actual video time if available, otherwise fallback to watch time
    if (videoDuration > 0 && progressBarReady) {
      if (actualVideoTime !== undefined && actualVideoTime > 0) {
        // Use actual video position for accurate progress
        newCompletionRate = Math.min(actualVideoTime / videoDuration, 1);
        console.log(`📺 Video progress: ${actualVideoTime.toFixed(1)}s / ${videoDuration}s (${(newCompletionRate * 100).toFixed(1)}%)`);

        // Also sync our watch time to be closer to actual video time
        // This helps maintain ZAP earning accuracy while showing correct progress
        const expectedWatchTime = Math.min(actualVideoTime, watchTimeRef.current + deltaSeconds * 2);
        if (Math.abs(expectedWatchTime - watchTimeRef.current) > 5) {
          // Only adjust if there's a significant difference (>5 seconds)
          watchTimeRef.current = Math.max(watchTimeRef.current, expectedWatchTime * 0.8);
        }
      } else {
        // Fallback to watch time-based calculation (only if we have meaningful watch time)
        newCompletionRate = watchTimeRef.current > 0 ? Math.min(watchTimeRef.current / videoDuration, 1) : 0;
        if (watchTimeRef.current > 0) {
          console.log(`⏰ Fallback progress: ${watchTimeRef.current.toFixed(1)}s / ${videoDuration}s (${(newCompletionRate * 100).toFixed(1)}%)`);
        }
      }

      setCompletionRate(newCompletionRate);
      onProgressUpdate?.(newCompletionRate);

      // Check for video completion (≥90% watched)
      if (newCompletionRate >= ZAP_CONFIG.COMPLETION_THRESHOLD && !isVideoCompleted) {
        setIsVideoCompleted(true);
        onVideoCompleted?.();
        console.log(`🎉 Video ${videoId} completed! Awarding final ZAPs...`);

        // Award final ZAPs on completion
        await awardZAPsForWatchTime();
        lastZAPAwardRef.current = Math.floor(watchTimeRef.current / 10) * 10;
      }
    }

    // Award ZAPs every 10 seconds of watch time (only if not yet completed)
    const zapThreshold = Math.floor(watchTimeRef.current / 10) * 10;
    if (zapThreshold > lastZAPAwardRef.current && zapThreshold > 0 && !isVideoCompleted) {
      console.log(`⚡ Awarding ZAPs for ${zapThreshold}s watch time, completion rate: ${(newCompletionRate * 100).toFixed(1)}%`);
      await awardZAPsForWatchTime();
      lastZAPAwardRef.current = zapThreshold;
    }
  };

  // Award ZAPs for accumulated watch time
  const awardZAPsForWatchTime = async () => {
    if (!user?.uid || watchTimeRef.current <= 0) {
      console.log(`⚠️ Cannot award ZAPs - user: ${!!user?.uid}, watchTime: ${watchTimeRef.current}s`);
      return;
    }

    console.log(`💰 Attempting to award ZAPs for ${watchTimeRef.current}s watch time, completion: ${(completionRate * 100).toFixed(1)}%`);

    try {
      const zapsAwarded = await awardWatchTimeZAPs(
        videoId,
        watchTimeRef.current,
        completionRate,
        isBoosted
      );

      console.log(`✅ awardWatchTimeZAPs returned: ${zapsAwarded} ZAPs`);

      if (zapsAwarded > 0) {
        setTotalZAPsEarned(prev => prev + zapsAwarded);
        onZAPsAwarded?.(zapsAwarded);
        console.log(`⚡ Awarded ${zapsAwarded} ZAPs for ${watchTimeRef.current}s watch time`);
      } else {
        console.log(`⚠️ No ZAPs awarded (returned 0)`);
      }
    } catch (error) {
      console.error('❌ Error awarding ZAPs:', error);
    }
  };

  // Manual progress update (for video player sync)
  const updateProgress = (currentTime: number) => {
    if (videoDuration > 0) {
      const newCompletionRate = Math.min(currentTime / videoDuration, 1);
      setCompletionRate(newCompletionRate);
      onProgressUpdate?.(newCompletionRate);
    }
  };

  // Get current ZAP earning rate
  const getCurrentZAPRate = () => {
    let rate = ZAP_CONFIG.WATCH_TIME_ZAP_RATE * 3600; // ZAPs per hour

    if (isBoosted) {
      rate *= ZAP_CONFIG.BOOSTED_MULTIPLIER;
    }

    return rate;
  };

  // Get estimated ZAPs for completion
  const getEstimatedZAPsForCompletion = () => {
    if (!videoDuration) return 0;

    let baseZAPs = videoDuration * ZAP_CONFIG.WATCH_TIME_ZAP_RATE;

    // Add completion bonus
    baseZAPs += baseZAPs * ZAP_CONFIG.COMPLETION_BONUS_RATE;

    if (isBoosted) {
      baseZAPs *= ZAP_CONFIG.BOOSTED_MULTIPLIER;
    }

    return Math.floor(baseZAPs);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []);

  // Method to manually update video position (for external integrations)
  const updateVideoTime = (currentTime: number, playing: boolean = true) => {
    if (videoDuration > 0) {
      const newCompletionRate = Math.min(currentTime / videoDuration, 1);
      setCompletionRate(newCompletionRate);
      onProgressUpdate?.(newCompletionRate);

      // Update watch time to be more aligned with actual video time
      const timeDiff = Math.abs(currentTime - watchTimeRef.current);
      if (timeDiff > 10) { // If difference is more than 10 seconds, adjust gradually
        watchTimeRef.current = Math.max(watchTimeRef.current, currentTime * 0.7);
        setWatchTime(watchTimeRef.current);
      }

      // Check for video completion
      if (newCompletionRate >= ZAP_CONFIG.COMPLETION_THRESHOLD && !isVideoCompleted) {
        setIsVideoCompleted(true);
        onVideoCompleted?.();
        console.log(`🎉 Video ${videoId} completed at time ${currentTime}!`);
      }
    }
  };

  return {
    isTracking,
    watchTime,
    completionRate,
    totalZAPsEarned,
    tabFocused,
    isVideoCompleted,
    hasBeenCompleted,
    progressBarReady,
    currentZAPRate: getCurrentZAPRate(),
    estimatedZAPsForCompletion: getEstimatedZAPsForCompletion(),
    startTracking,
    stopTracking,
    updateProgress,
    updateVideoTime,
    pingWatchTime
  };
};