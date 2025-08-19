/**
 * Local XP Service - Handles XP tracking without YouTube API
 * Used when VITE_USE_YOUTUBE_API=false
 */

import { auth } from './firebase';
import { doc, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { isYouTubeAPIEnabled, logFeatureFlag } from './feature-flags';

export class LocalXPService {
  /**
   * Track video engagement without YouTube API
   */
  static async trackLocalVideoEngagement(
    videoId: string, 
    action: 'watch' | 'like' | 'comment' | 'completion', 
    watchTime?: number,
    metadata?: any
  ) {
    const user = auth.currentUser;
    if (!user) return 0;

    if (isYouTubeAPIEnabled()) {
      // Use existing YouTube service if API is enabled
      const { YouTubeService } = await import('./youtube');
      return YouTubeService.trackVideoEngagement(videoId, action, metadata);
    }

    logFeatureFlag('Local XP Tracking', true, `${action} action for video ${videoId}`);

    try {
      // Calculate XP based on action
      const xpRewards = {
        watch: 10,
        like: 5,
        comment: 15,
        completion: 25
      };

      let xpGained = xpRewards[action] || 0;
      
      // Bonus for completion with watch time
      if (action === 'completion' && watchTime && watchTime > 120) {
        xpGained += Math.floor(watchTime / 60) * 2; // +2 XP per minute watched
      }

      // Update user's XP in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        totalXP: increment(xpGained),
        [`engagement.${action}Count`]: increment(1),
        lastActivity: new Date(),
        'stats.videosWatched': action === 'completion' ? increment(1) : increment(0),
        'stats.totalWatchTime': watchTime ? increment(watchTime) : increment(0)
      });

      // Record the engagement event
      const engagementData = {
        userId: user.uid,
        videoId,
        action,
        xpGained,
        watchTime: watchTime || 0,
        timestamp: new Date(),
        source: 'local_tracking',
        ...metadata
      };

      // Store engagement in a separate collection for analytics
      await setDoc(
        doc(db, 'engagements', `${user.uid}_${Date.now()}`), 
        engagementData
      );

      console.log(`🎯 Local XP: User ${user.uid} earned ${xpGained} XP for ${action} on video ${videoId}`);
      return xpGained;
    } catch (error) {
      console.error('Error tracking local engagement:', error);
      return 0;
    }
  }

  /**
   * Record video view with local tracking
   */
  static async recordLocalVideoView(
    videoId: string, 
    watchedDuration: number, 
    totalDuration: number
  ) {
    const user = auth.currentUser;
    if (!user) return 0;

    if (isYouTubeAPIEnabled()) {
      // Use existing YouTube service if API is enabled
      const { YouTubeService } = await import('./youtube');
      return YouTubeService.recordVideoView(videoId, watchedDuration, totalDuration);
    }

    logFeatureFlag('Local Video View Tracking', true, `${watchedDuration}s of ${totalDuration}s`);

    try {
      // Calculate completion percentage
      const completionPercentage = totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0;

      // Calculate XP based on watch completion
      let xpGained = 0;

      // For short videos (under 2 minutes), award fixed XP for completion
      if (totalDuration <= 120) {
        if (completionPercentage >= 80) {
          xpGained = 25; // Fixed 25 XP for completing short videos
        }
      } else {
        // For longer videos, use milestone-based XP
        if (completionPercentage >= 25) xpGained += 15;
        if (completionPercentage >= 50) xpGained += 15;
        if (completionPercentage >= 75) xpGained += 15;
        if (completionPercentage >= 90) xpGained += 20; // Bonus for near-completion
      }

      // Update user stats
      await updateDoc(doc(db, 'users', user.uid), {
        totalXP: increment(xpGained),
        'stats.videosWatched': increment(1),
        'stats.totalWatchTime': increment(watchedDuration),
        lastActivity: new Date()
      });

      // Record detailed view data
      const viewData = {
        userId: user.uid,
        videoId,
        watchedDuration,
        totalDuration,
        completionPercentage,
        xpGained,
        timestamp: new Date(),
        source: 'local_tracking'
      };

      await setDoc(
        doc(db, 'video_views', `${user.uid}_${videoId}_${Date.now()}`), 
        viewData
      );

      console.log(`🎬 Local View: User ${user.uid} earned ${xpGained} XP for watching ${completionPercentage.toFixed(1)}% of video ${videoId}`);
      return xpGained;
    } catch (error) {
      console.error('Error recording local video view:', error);
      return 0;
    }
  }

  /**
   * Get video info without YouTube API (uses video ID to generate placeholder data)
   */
  static getLocalVideoInfo(videoId: string) {
    return {
      id: videoId,
      title: 'Video Tutorial', // Generic title
      description: 'Learn new skills and earn XP!',
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      duration: 0, // Will be determined by player
      viewCount: '---',
      likeCount: '---',
      source: 'local_mode'
    };
  }

  /**
   * Initialize user for local mode
   */
  static async initializeLocalUser(userId: string, userData: any) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          ...userData,
          youtubeConnected: false, // Always false in local mode
          level: 1,
          totalXP: 0,
          createdAt: new Date(),
          lastLogin: new Date(),
          stats: {
            videosWatched: 0,
            totalWatchTime: 0,
          },
          engagement: {
            watchCount: 0,
            likeCount: 0,
            commentCount: 0,
          },
          mode: 'local_tracking'
        });
        
        console.log(`👤 Initialized local user: ${userId}`);
      } else {
        // Update last login
        await updateDoc(userRef, {
          lastLogin: new Date(),
          mode: 'local_tracking'
        });
      }
    } catch (error) {
      console.error('Error initializing local user:', error);
    }
  }
}