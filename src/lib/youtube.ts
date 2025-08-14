import { auth, googleProviderWithYouTube } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export class YouTubeService {
  private static async getAccessToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get the OAuth access token from the user's credential
    const credential = await user.getIdTokenResult();
    const accessToken = credential.claims.access_token;
    
    if (!accessToken) {
      // Re-authenticate with YouTube scopes if no access token
      await this.authenticateWithYouTube();
      const newCredential = await user.getIdTokenResult();
      return newCredential.claims.access_token;
    }
    
    return accessToken;
  }

  static async authenticateWithYouTube(): Promise<boolean> {
    try {
      console.log('Authenticating with YouTube...');
      const result = await signInWithPopup(auth, googleProviderWithYouTube);
      console.log('YouTube authentication successful');
      const credential = result.credential;
      
      if (credential) {
        // Update user document with YouTube connection status
        const user = result.user;
        await updateDoc(doc(db, 'users', user.uid), {
          youtubeConnected: true,
          youtubeAccessToken: credential.accessToken,
          lastYouTubeAuth: new Date(),
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error authenticating with YouTube:', error);
      throw error;
    }
  }
  
  static async getUserChannel() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching user channel:', error);
      return null;
    }
  }
  
  static async getVideoDetails(videoId: string) {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );
      
      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
    }
  }
  
  static async getUserWatchHistory() {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=WL&maxResults=50&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching watch history:', error);
      return [];
    }
  }
  
  static async trackVideoEngagement(videoId: string, action: 'watch' | 'like' | 'comment', metadata?: any) {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      // Calculate XP based on action
      const xpRewards = {
        watch: 10,
        like: 5,
        comment: 15
      };
      
      const xpGained = xpRewards[action] || 0;
      
      // Update user's XP in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        totalXP: increment(xpGained),
        [`engagement.${action}Count`]: increment(1),
        lastActivity: new Date()
      });
      
      // Record the engagement event
      const engagementData = {
        userId: user.uid,
        videoId,
        action,
        xpGained,
        timestamp: new Date(),
        ...metadata
      };
      
      // Store engagement in a separate collection for analytics
      await setDoc(doc(db, 'engagements', `${user.uid}_${Date.now()}`), engagementData);
      
      console.log(`User ${user.uid} earned ${xpGained} XP for ${action} on video ${videoId}`);
      return xpGained;
    } catch (error) {
      console.error('Error tracking engagement:', error);
      return 0;
    }
  }

  static async getWatchTime(videoId: string): Promise<number> {
    try {
      const token = await this.getAccessToken();
      
      // Get video duration from YouTube API
      const response = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      const data = await response.json();
      const duration = data.items?.[0]?.contentDetails?.duration;
      
      if (duration) {
        // Convert ISO 8601 duration to seconds
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '').replace('H', '') || '0';
        const minutes = (match[2] || '').replace('M', '') || '0';
        const seconds = (match[3] || '').replace('S', '') || '0';
        
        return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting watch time:', error);
      return 0;
    }
  }

  static async recordVideoView(videoId: string, watchedDuration: number, totalDuration: number) {
    const user = auth.currentUser;
    if (!user) return;
    
    try {
      // Calculate completion percentage
      const completionPercentage = totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0;
      
      // Calculate XP based on watch completion
      let xpGained = 0;
      
      // For short videos (under 2 minutes), award fixed XP for completion
      if (totalDuration <= 120) {
        if (completionPercentage >= 80) {
          xpGained = 25; // Fixed 25 XP for completing short videos (lowered threshold)
        }
      } else {
        // For longer videos, use milestone-based XP
        if (completionPercentage >= 25) xpGained += 25;
        if (completionPercentage >= 50) xpGained += 25;
        if (completionPercentage >= 75) xpGained += 25;
        if (completionPercentage >= 90) xpGained += 25; // Bonus for near-completion
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
        timestamp: new Date()
      };
      
      await setDoc(doc(db, 'video_views', `${user.uid}_${videoId}_${Date.now()}`), viewData);
      
      console.log(`User ${user.uid} earned ${xpGained} XP for watching ${completionPercentage.toFixed(1)}% of video ${videoId}`);
      return xpGained;
    } catch (error) {
      console.error('Error recording video view:', error);
      return 0;
    }
  }
}
