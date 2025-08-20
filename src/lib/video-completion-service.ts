/**
 * Video Completion Service - Tracks completed videos and prevents XP farming
 */

import { auth } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

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
   * Mark a video as completed for the current user
   */
  static async markVideoCompleted(
    videoId: string, 
    xpEarned: number, 
    watchTime: number
  ): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      // Check if already completed to prevent duplicates
      const alreadyCompleted = await this.isVideoCompleted(videoId);
      if (alreadyCompleted) {
        console.log(`⚠️ Video ${videoId} already completed by user ${user.uid}`);
        return false;
      }

      // Add to user's completed videos list
      await updateDoc(doc(db, 'users', user.uid), {
        completedVideos: arrayUnion(videoId),
        lastActivity: new Date()
      });

      // Store detailed completion record
      const completionData: VideoCompletion = {
        videoId,
        completedAt: new Date(),
        xpEarned,
        watchTime,
        userId: user.uid
      };

      await setDoc(
        doc(db, 'video_completions', `${user.uid}_${videoId}`),
        completionData
      );

      console.log(`✅ Video ${videoId} marked as completed for user ${user.uid}`);
      return true;
    } catch (error) {
      console.error('Error marking video as completed:', error);
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