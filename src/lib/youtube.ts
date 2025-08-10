import { auth } from './firebase';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export class YouTubeService {
  private static async getAccessToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const token = await user.getIdToken();
    return token;
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
    
    // This would integrate with your Firestore service
    // to record engagement and award XP
    console.log(`User ${user.uid} performed ${action} on video ${videoId}`, metadata);
  }
}
