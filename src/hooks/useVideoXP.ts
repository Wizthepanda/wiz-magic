/**
 * Video XP Hook
 * Integrates video player with XP tracking system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WatchTimeTracker } from '../lib/watch-time-tracker';
import { XPSystem } from '../lib/xp-system';
import { useAuth } from './useAuth';
import { useXp } from '../context/XpContext';

export interface VideoXPConfig {
  videoId: string;
  videoDuration?: number;
  isBoosted?: boolean;
  enableXP?: boolean;
}

export const useVideoXP = (config: VideoXPConfig) => {
  const { user } = useAuth();
  const { addXp } = useXp();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [completionRate, setCompletionRate] = useState(0);

  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(0);

  const startTracking = useCallback(async () => {
    if (!user || !config.enableXP || isTracking) return;

    try {
      const session = await WatchTimeTracker.startWatchSession(
        config.videoId,
        config.videoDuration,
        config.isBoosted || false
      );
      
      if (session) {
        setSessionId(session);
        setIsTracking(true);
        lastUpdateTime.current = Date.now();
        
        // Start periodic updates
        updateIntervalRef.current = setInterval(() => {
          updateWatchProgress();
        }, 1000); // Update every second
        
        console.log(`🎬 Video XP: Started tracking for video ${config.videoId}`);
      }
    } catch (error) {
      console.error('Error starting XP tracking:', error);
    }
  }, [user, config.videoId, config.videoDuration, config.isBoosted, config.enableXP, isTracking]);

  const stopTracking = useCallback(async () => {
    if (!sessionId || !isTracking) return;

    try {
      const finalXP = await WatchTimeTracker.endWatchSession(sessionId);
      setXpEarned(prev => prev + finalXP);
      setIsTracking(false);
      
      // Clear update interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      
      console.log(`🏁 Video XP: Stopped tracking, earned ${finalXP} XP`);
    } catch (error) {
      console.error('Error stopping XP tracking:', error);
    } finally {
      setSessionId(null);
    }
  }, [sessionId, isTracking]);

  const pauseTracking = useCallback(() => {
    if (!sessionId) return;
    
    WatchTimeTracker.pauseWatchSession(sessionId);
    
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    
    console.log(`⏸️ Video XP: Paused tracking for session ${sessionId}`);
  }, [sessionId]);

  const resumeTracking = useCallback(() => {
    if (!sessionId) return;
    
    WatchTimeTracker.resumeWatchSession(sessionId);
    lastUpdateTime.current = Date.now();
    
    // Resume periodic updates
    updateIntervalRef.current = setInterval(() => {
      updateWatchProgress();
    }, 1000);
    
    console.log(`▶️ Video XP: Resumed tracking for session ${sessionId}`);
  }, [sessionId]);

  const updateWatchProgress = useCallback((currentTime?: number) => {
    if (!sessionId || !isTracking) return;

    const now = Date.now();
    const timeSinceLastUpdate = (now - lastUpdateTime.current) / 1000;
    
    // Update watch time
    setWatchTime(prev => prev + Math.min(timeSinceLastUpdate, 2)); // Cap at 2 seconds to prevent jumps
    
    // Calculate completion rate
    if (config.videoDuration && currentTime !== undefined) {
      const completion = Math.min(1, currentTime / config.videoDuration);
      setCompletionRate(completion);
      
      // Update the tracker with current progress
      WatchTimeTracker.updateWatchProgress(sessionId, currentTime, config.videoDuration);
    }
    
    lastUpdateTime.current = now;
  }, [sessionId, isTracking, config.videoDuration]);

  // Award share XP
  const shareVideo = useCallback(async () => {
    if (!user || !config.enableXP) return 0;

    try {
      const shareXP = await XPSystem.awardShareXP(user.uid, config.videoId);
      if (shareXP > 0) {
        addXp(shareXP);
        setXpEarned(prev => prev + shareXP);
      }
      return shareXP;
    } catch (error) {
      console.error('Error awarding share XP:', error);
      return 0;
    }
  }, [user, config.videoId, config.enableXP, addXp]);

  // Manual progress update (called from video player)
  const updateProgress = useCallback((currentTime: number) => {
    updateWatchProgress(currentTime);
  }, [updateWatchProgress]);

  // Check if video is boosted
  const checkIfBoosted = useCallback(async (videoId: string): Promise<boolean> => {
    try {
      // TODO: Check Firestore for boosted videos
      // For now, return the prop value
      return config.isBoosted || false;
    } catch (error) {
      console.error('Error checking boosted status:', error);
      return false;
    }
  }, [config.isBoosted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (sessionId) {
        WatchTimeTracker.endWatchSession(sessionId);
      }
    };
  }, [sessionId]);

  // Auto-start tracking when video ID changes
  useEffect(() => {
    if (config.videoId && config.enableXP && user) {
      startTracking();
    }
    
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [config.videoId, config.enableXP, user]); // Don't include startTracking/stopTracking to avoid infinite loops

  return {
    // State
    isTracking,
    xpEarned,
    watchTime,
    completionRate,
    sessionId,
    
    // Actions
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    updateProgress,
    shareVideo,
    
    // Utilities
    checkIfBoosted,
    
    // Config
    isXPEnabled: config.enableXP && !!user,
    isBoosted: config.isBoosted || false
  };
};

// Share functionality for videos
export const useVideoShare = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const shareVideo = useCallback(async (videoId: string, title: string = 'Check out this video on WIZ!') => {
    if (!navigator.share && !navigator.clipboard) {
      console.warn('Share/Copy not supported');
      return false;
    }

    setIsSharing(true);
    
    try {
      const shareUrl = `${window.location.origin}/video/${videoId}`;
      const shareData = {
        title,
        text: 'Learn something new and earn XP on WIZ!',
        url: shareUrl
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }

      setShareCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error sharing video:', error);
      return false;
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    shareVideo,
    isSharing,
    shareCount
  };
};

// Referral system hook
export const useReferral = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);

  // Generate user's referral code
  useEffect(() => {
    if (user) {
      // Simple referral code based on user ID
      const code = btoa(user.uid).substring(0, 8).toUpperCase();
      setReferralCode(code);
    }
  }, [user]);

  const processReferral = useCallback(async (referralCode: string) => {
    if (!user) return false;

    try {
      // TODO: Implement referral processing
      // 1. Decode referral code to get referrer user ID  
      // 2. Award referral XP to referrer
      // 3. Mark new user as referred
      
      console.log(`Processing referral code: ${referralCode} for user ${user.uid}`);
      return true;
    } catch (error) {
      console.error('Error processing referral:', error);
      return false;
    }
  }, [user]);

  const getReferralLink = useCallback(() => {
    if (!referralCode) return null;
    return `${window.location.origin}?ref=${referralCode}`;
  }, [referralCode]);

  return {
    referralCode,
    referralCount,
    processReferral,
    getReferralLink
  };
};