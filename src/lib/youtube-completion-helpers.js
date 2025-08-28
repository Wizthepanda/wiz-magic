/**
 * YouTube Video Completion Helpers
 * Handles Firestore writes for video completion tracking and XP awarding
 */

import { doc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import authSingleton from './authSingleton';

/**
 * Mark video as watched in Firestore - as specified in requirements
 */
export async function markVideoWatched(videoId) {
  const user = authSingleton.getCurrentUser();
  if (!user) {
    console.warn('⚠️ No authenticated user to mark video watched');
    return false;
  }

  try {
    const userRef = doc(db, "users", user.uid, "completedVideos", videoId);
    await setDoc(userRef, { 
      watched: true, 
      completedAt: Date.now(),
      timestamp: serverTimestamp()
    }, { merge: true });
    
    console.log(`✅ Video ${videoId} marked as watched for user ${user.uid}`);
    return true;
  } catch (error) {
    console.error('❌ Error marking video watched:', error);
    return false;
  }
}

/**
 * Award XP for video completion - using our production transaction system
 * Integrates with the new awardXpTransaction system as specified
 */
export async function awardXpForCompletion(videoId, watchTimeSeconds = 0) {
  const user = authSingleton.getCurrentUser();
  if (!user) {
    console.warn('⚠️ No authenticated user for XP award');
    return false;
  }

  try {
    const userRef = doc(db, "users", user.uid);

    const result = await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};

      // Check if XP already awarded for this video using our completedVideos subcollection
      const completedVideoRef = doc(db, "users", user.uid, "completedVideos", videoId);
      const completedVideoDoc = await tx.get(completedVideoRef);
      
      if (completedVideoDoc.exists() && completedVideoDoc.data().xpAwarded) {
        console.log(`⚠️ XP already awarded for video ${videoId}`);
        return { success: false, reason: 'already_completed', awardedXp: 0 };
      }

      // Calculate XP: base 10 + 1 XP per 10s + 10% completion bonus
      const baseXp = 10;
      const watchXp = Math.floor(watchTimeSeconds / 10);
      const totalXp = baseXp + watchXp;
      const bonusXp = Math.floor(totalXp * 0.1); // 10% completion bonus
      const finalXp = totalXp + bonusXp;

      // Check daily cap
      const today = new Date().toISOString().split('T')[0];
      const currentXp = data.currentXP || 0;
      const dailyXpEarned = data.dailyXpEarned || 0;
      const lastReset = data.lastReset || '';
      const effectiveDailyXp = (lastReset === today) ? dailyXpEarned : 0;
      const remainingDailyCap = Math.max(0, 360 - effectiveDailyXp);
      const allowedXp = Math.min(finalXp, remainingDailyCap);

      if (allowedXp <= 0) {
        console.log(`🚫 Daily XP cap reached: ${effectiveDailyXp}/360`);
        return { success: false, reason: 'daily_cap_reached', awardedXp: 0 };
      }

      // Update user XP atomically
      const newTotalXp = currentXp + allowedXp;
      const newDailyXp = lastReset === today ? dailyXpEarned + allowedXp : allowedXp;

      tx.update(userRef, {
        currentXP: newTotalXp,
        dailyXpEarned: newDailyXp,
        lastReset: today,
        [`completedVideos.${videoId}`]: true // Legacy field for compatibility
      });

      // Mark video as completed with XP details
      tx.set(completedVideoRef, {
        watched: true,
        completedAt: serverTimestamp(),
        xpAwarded: allowedXp,
        baseXp: baseXp,
        watchXp: watchXp,
        bonusXp: bonusXp,
        watchTimeSeconds: watchTimeSeconds,
        finalXp: finalXp,
        allowedXp: allowedXp
      });

      console.log(`🎉 Awarded ${allowedXp} XP for video ${videoId}. New total = ${newTotalXp}`);
      
      return { 
        success: true, 
        awardedXp: allowedXp, 
        newTotalXp: newTotalXp,
        previousXp: currentXp,
        breakdown: { baseXp, watchXp, bonusXp, finalXp, allowedXp }
      };
    });

    // Dispatch XP update event for instant UI feedback
    if (result.success && typeof window !== 'undefined') {
      const event = new CustomEvent('xpUpdated', {
        detail: {
          earnedXp: result.awardedXp,
          totalXp: result.newTotalXp,
          prevXp: result.previousXp,
          levelUp: false, // Would need level calculation here
          videoId: videoId
        }
      });
      window.dispatchEvent(event);
      console.log('📡 XP update event dispatched');
    }

    return result;

  } catch (error) {
    console.error('❌ Error awarding XP for video completion:', error);
    
    // Log to error tracking if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { feature: 'youtube-xp-completion' },
        extra: { videoId, watchTimeSeconds }
      });
    }
    
    return { success: false, reason: 'transaction_failed', error: error.message };
  }
}

/**
 * Enhanced onPlayerStateChange handler - as specified in requirements
 * Integrates with YouTube IFrame API correctly
 */
export function createPlayerStateChangeHandler(options = {}) {
  const { 
    onVideoStart, 
    onVideoEnd, 
    onVideoPause, 
    enableXpAwarding = true,
    minWatchTimeForXp = 30 // minimum seconds to award XP
  } = options;

  let watchStartTime = null;
  let totalWatchTime = 0;

  return function onPlayerStateChange(event) {
    const state = event.data;
    const player = event.target;
    
    console.log('🎬 YouTube player state changed:', state);

    switch (state) {
      case YT.PlayerState.PLAYING:
        watchStartTime = Date.now();
        if (onVideoStart) onVideoStart(event);
        break;

      case YT.PlayerState.PAUSED:
        if (watchStartTime) {
          totalWatchTime += (Date.now() - watchStartTime) / 1000;
          watchStartTime = null;
        }
        if (onVideoPause) onVideoPause(event);
        break;

      case YT.PlayerState.ENDED:
        if (watchStartTime) {
          totalWatchTime += (Date.now() - watchStartTime) / 1000;
          watchStartTime = null;
        }

        console.log("✅ Video completed", { totalWatchTime });
        
        const videoData = player.getVideoData();
        const videoId = videoData.video_id;

        if (!videoId) {
          console.warn('⚠️ No video ID found for completion');
          return;
        }

        // Mark video as watched in Firestore
        markVideoWatched(videoId);

        // Award XP only if watched for minimum time
        if (enableXpAwarding && totalWatchTime >= minWatchTimeForXp) {
          awardXpForCompletion(videoId, Math.floor(totalWatchTime));
        } else if (totalWatchTime < minWatchTimeForXp) {
          console.log(`⚠️ Video ${videoId} watched for only ${Math.floor(totalWatchTime)}s, minimum is ${minWatchTimeForXp}s`);
        }

        if (onVideoEnd) onVideoEnd(event, { totalWatchTime, videoId });
        break;

      case YT.PlayerState.BUFFERING:
        // Don't count buffering time
        if (watchStartTime) {
          totalWatchTime += (Date.now() - watchStartTime) / 1000;
          watchStartTime = Date.now(); // Reset start time after buffering
        }
        break;
    }
  };
}

/**
 * Enhanced YouTube player initialization with correct origin
 * As specified in requirements
 */
export function createYouTubePlayer(containerId, videoId, options = {}) {
  const {
    autoplay = 0,
    controls = 1,
    enableXpAwarding = true,
    onReady,
    onStateChange,
    onError
  } = options;

  // Create state change handler with XP integration
  const stateChangeHandler = onStateChange || createPlayerStateChangeHandler({
    enableXpAwarding
  });

  return new YT.Player(containerId, {
    videoId: videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      origin: window.location.origin,   // ✅ fixes cross-domain as specified
      enablejsapi: 1,
      autoplay: autoplay,
      controls: controls,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      fs: 1,
      cc_load_policy: 0,
      playsinline: 1
    },
    events: {
      'onReady': onReady || function(event) {
        console.log('🎬 YouTube player ready');
      },
      'onStateChange': stateChangeHandler,
      'onError': onError || function(event) {
        console.error('❌ YouTube player error:', event.data);
      }
    }
  });
}

/**
 * Load YouTube IFrame API if not already loaded
 */
export function loadYouTubeAPI() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
        return;
      }

      // Set up callback for when API loads
      window.onYouTubeIframeAPIReady = () => {
        console.log('✅ YouTube IFrame API loaded');
        resolve(window.YT);
      };

      // Load the API script
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load YouTube API'));
      document.head.appendChild(script);
    } else {
      reject(new Error('Window object not available'));
    }
  });
}

export default {
  markVideoWatched,
  awardXpForCompletion,
  createPlayerStateChangeHandler,
  createYouTubePlayer,
  loadYouTubeAPI
};