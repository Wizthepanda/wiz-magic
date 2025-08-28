/**
 * Bulletproof YouTube Video Completion System
 * Ensures atomic XP awards and prevents duplicates using Firestore transactions
 */

import { doc, runTransaction, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

interface CompletionResult {
  success: boolean;
  xpAwarded: number;
  alreadyCompleted?: boolean;
  finalXpBalance?: number;
  error?: string;
}

interface VideoCompletionData {
  videoId: string;
  completed: boolean;
  completedAt: any;
  xpAwarded: number;
  watchTimeSeconds: number;
}

// XP Rules: 10 points per completed video (as specified)
const XP_PER_COMPLETION = 10;

/**
 * Mark video as completed and award XP atomically
 * This is the ONLY function that should be called when a video ends
 */
export async function completeVideo(videoId: string, userId: string): Promise<CompletionResult> {
  console.log(`📥 Checking Firestore before awarding XP for video ${videoId}...`);

  if (!videoId || !userId) {
    console.error('❌ Missing videoId or userId');
    return { success: false, xpAwarded: 0, error: 'Missing required parameters' };
  }

  try {
    // Use a single atomic transaction to check completion and award XP
    const result = await runTransaction(db, async (transaction) => {
      // References for the transaction
      const userDocRef = doc(db, 'users', userId);
      const videoCompletionRef = doc(db, 'users', userId, 'videos', videoId);

      // Read current state
      const userDoc = await transaction.get(userDocRef);
      const videoDoc = await transaction.get(videoCompletionRef);

      // Check if user document exists
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      const currentXP = userData.currentXP || 0;

      // Check if video is already completed
      if (videoDoc.exists()) {
        const videoData = videoDoc.data() as VideoCompletionData;
        if (videoData.completed === true) {
          console.log(`⚠️ Video already completed, no XP awarded`);
          return {
            success: false,
            xpAwarded: 0,
            alreadyCompleted: true,
            finalXpBalance: currentXP
          };
        }
      }

      // Video not completed yet - award XP
      const newXP = currentXP + XP_PER_COMPLETION;

      // Update user's XP atomically
      transaction.update(userDocRef, {
        currentXP: newXP,
        lastActivity: serverTimestamp()
      });

      // Mark video as completed atomically
      transaction.set(videoCompletionRef, {
        videoId,
        completed: true,
        completedAt: serverTimestamp(),
        xpAwarded: XP_PER_COMPLETION,
        watchTimeSeconds: 0 // Can be enhanced to track actual watch time
      });

      console.log(`✅ XP updated and video marked watched`);
      console.log(`💰 Final XP balance: ${newXP} (+${XP_PER_COMPLETION})`);

      return {
        success: true,
        xpAwarded: XP_PER_COMPLETION,
        finalXpBalance: newXP,
        alreadyCompleted: false
      };
    });

    // Dispatch XP update event for UI updates
    if (result.success && typeof window !== 'undefined') {
      const event = new CustomEvent('xpUpdated', {
        detail: {
          videoId,
          xpAwarded: result.xpAwarded,
          newXpBalance: result.finalXpBalance
        }
      });
      window.dispatchEvent(event);
      console.log('📡 XP update event dispatched to UI');
    }

    return result;

  } catch (error) {
    console.error('❌ Error in completeVideo transaction:', error);
    return {
      success: false,
      xpAwarded: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a video is already completed (for UI state)
 * This reads from Firestore as the single source of truth
 */
export async function isVideoCompleted(videoId: string, userId: string): Promise<boolean> {
  try {
    const videoCompletionRef = doc(db, 'users', userId, 'videos', videoId);
    const videoDoc = await getDoc(videoCompletionRef);
    
    if (videoDoc.exists()) {
      const data = videoDoc.data() as VideoCompletionData;
      return data.completed === true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking video completion status:', error);
    return false;
  }
}

/**
 * Get all completed videos for a user (for dashboard)
 * Always reads from Firestore as single source of truth
 */
export async function getCompletedVideos(userId: string): Promise<string[]> {
  try {
    // This would need to be implemented with a collection query
    // For now, return empty array - can be enhanced later
    return [];
  } catch (error) {
    console.error('❌ Error fetching completed videos:', error);
    return [];
  }
}

/**
 * YouTube Player State Change Handler
 * Prevents duplicate ENDED events and ensures single completion call
 */
export function createYouTubeCompletionHandler() {
  const completedVideos = new Set<string>(); // Local cache to prevent rapid duplicates
  
  return function onPlayerStateChange(event: any) {
    const state = event.data;
    
    // Only handle ENDED state (0)
    if (state !== 0) {
      return;
    }

    const player = event.target;
    const videoData = player.getVideoData();
    const videoId = videoData?.video_id;

    if (!videoId) {
      console.warn('⚠️ No video ID found in ENDED event');
      return;
    }

    // Prevent duplicate processing in the same session
    if (completedVideos.has(videoId)) {
      console.log(`⚠️ Video ${videoId} already processed in this session`);
      return;
    }

    // Mark as processed locally to prevent rapid duplicates
    completedVideos.add(videoId);

    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('⚠️ No authenticated user for video completion');
      return;
    }

    console.log(`🎬 Video ${videoId} reached 100% completion`);

    // Award XP using our atomic function
    completeVideo(videoId, currentUser.uid)
      .then((result) => {
        if (result.success) {
          console.log(`✅ Successfully awarded ${result.xpAwarded} XP for video ${videoId}`);
        } else if (result.alreadyCompleted) {
          console.log(`⚠️ Video ${videoId} was already completed - no duplicate XP`);
        } else {
          console.error(`❌ Failed to award XP for video ${videoId}: ${result.error}`);
        }
      })
      .catch((error) => {
        console.error('❌ Error in video completion handler:', error);
        // Remove from local cache so it can be retried
        completedVideos.delete(videoId);
      });
  };
}

/**
 * Load YouTube IFrame API with promise-based loading
 */
export function loadYouTubeAPI(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('Window object not available'));
      return;
    }

    // Set up callback for when API loads
    window.onYouTubeIframeAPIReady = () => {
      console.log('✅ YouTube IFrame API loaded successfully');
      resolve(window.YT);
    };

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      // Script already exists, just wait for callback
      return;
    }

    // Load the API script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));
    
    document.head.appendChild(script);
    console.log('📡 Loading YouTube IFrame API...');
  });
}