/**
 * Video Completion Service - Tracks completed videos and awards XP
 */

import { auth, functions } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { httpsCallable } from 'firebase/functions';

export interface VideoCompletion {
  videoId: string;
  completedAt: Date;
  xpEarned: number;
  watchTime: number;
  userId: string;
}

export class VideoCompletionService {
  /**
   * Check if a video has been completed by the current user
   */
  static async isVideoCompleted(videoId: string): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const completedVideos = userData?.completedVideos || [];
      
      return completedVideos.includes(videoId);
    } catch (error) {
      console.error('Error checking video completion:', error);
      return false;
    }
  }

  /**
   * Mark a video as completed and award XP through Firebase Functions
   */
  static async markVideoCompleted(
    videoId: string, 
    expectedXp: number, 
    watchTime: number
  ): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      // Validate inputs
      if (!videoId || typeof videoId !== 'string' || videoId.trim() === '') {
        console.error(`❌ Invalid videoId: "${videoId}"`);
        return false;
      }
      
      if (!watchTime || watchTime < 5) {
        console.error(`❌ Invalid watchTime: ${watchTime} (minimum 5 seconds required)`);
        return false;
      }
      
      // Check if already completed to prevent duplicates
      const alreadyCompleted = await this.isVideoCompleted(videoId);
      if (alreadyCompleted) {
        console.log(`⚠️ Video ${videoId} already completed by user ${user.uid}`);
        return false;
      }

      // Award XP through Firebase Function (this updates user's XP and profile)
      const awardWatchXP = httpsCallable(functions, 'awardWatchXP');
      const completionRate = 1.0; // Video was completed
      const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🎯 Awarding watch XP for video ${videoId}:`, { 
        videoId, 
        watchTime, 
        completionRate, 
        sessionId 
      });
      
      const xpResult = await awardWatchXP({
        videoId,
        watchTime,
        completionRate,
        sessionId
      });

      console.log(`✅ XP awarded result:`, JSON.stringify(xpResult.data, null, 2));

      // Mark video as completed in user's personal tracking
      const ref = doc(db, "users", user.uid, "videos", videoId);
      await setDoc(ref, { 
        watched: true, 
        completedAt: serverTimestamp(),
        xpEarned: xpResult.data?.totalXpAwarded || expectedXp,
        watchTime,
        sessionId
      }, { merge: true });

      // Update user's completed videos list and ensure XP fields are set
      const userUpdateData: any = {
        completedVideos: arrayUnion(videoId),
        lastActivity: new Date()
      };
      
      // Also ensure the XP fields are present in case Firebase Function failed to update
      if (xpResult.data) {
        if (xpResult.data.currentXP !== undefined) {
          userUpdateData.currentXP = xpResult.data.currentXP;
          userUpdateData.totalXP = xpResult.data.currentXP; // Both for compatibility
        }
        if (xpResult.data.level !== undefined) {
          userUpdateData.level = xpResult.data.level;
        }
        if (xpResult.data.dailyXpEarned !== undefined) {
          userUpdateData.dailyXpEarned = xpResult.data.dailyXpEarned;
          userUpdateData.dailyXP = xpResult.data.dailyXpEarned; // Both for compatibility
        }
      }
      
      await updateDoc(doc(db, 'users', user.uid), userUpdateData);
      console.log('📊 User document updated with XP data:', userUpdateData);

      // Dispatch XP updated event for real-time UI updates
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('xpUpdated', { 
          detail: { 
            earnedXp: xpResult.data?.totalXpAwarded || expectedXp,
            totalXp: xpResult.data?.currentXP || 0,
            currentXP: xpResult.data?.currentXP || 0,
            level: xpResult.data?.level || 1,
            dailyXpEarned: xpResult.data?.dailyXpEarned || 0,
            progressToNext: xpResult.data?.progressToNext || 0,
            levelUp: xpResult.data?.leveledUp || false,
            newLevel: xpResult.data?.level || 1,
            forceRefresh: true
          } 
        });
        window.dispatchEvent(event);
        console.log('🔄 VideoCompletionService dispatched xpUpdated event:', event.detail);
        
        // Also dispatch a force refresh event to ensure UI updates
        setTimeout(() => {
          const refreshEvent = new CustomEvent('forceXPRefresh', {
            detail: {
              currentXP: xpResult.data?.currentXP || 0,
              level: xpResult.data?.level || 1,
              dailyXpEarned: xpResult.data?.dailyXpEarned || 0
            }
          });
          window.dispatchEvent(refreshEvent);
          console.log('🔄 Dispatched forceXPRefresh event');
        }, 1000);
      }

      console.log(`✅ Video ${videoId} completed with ${xpResult.data?.totalXpAwarded || expectedXp} XP for user ${user.uid}`);
      return true;
    } catch (error) {
      console.error('Error completing video and awarding XP:', error);
      return false;
    }
  }

  /**
   * Get all completed videos for the current user
   */
  static async getUserCompletedVideos(): Promise<string[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      return userData?.completedVideos || [];
    } catch (error) {
      console.error('Error fetching completed videos:', error);
      return [];
    }
  }

  /**
   * Get completion details for a specific video
   */
  static async getVideoCompletionDetails(videoId: string): Promise<VideoCompletion | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const completionDoc = await getDoc(doc(db, 'video_completions', `${user.uid}_${videoId}`));
      if (completionDoc.exists()) {
        const data = completionDoc.data();
        return {
          ...data,
          completedAt: data.completedAt.toDate()
        } as VideoCompletion;
      }
      return null;
    } catch (error) {
      console.error('Error fetching video completion details:', error);
      return null;
    }
  }
}