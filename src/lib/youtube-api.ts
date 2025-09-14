// YouTube Data API v3 Integration Service
// Handles OAuth 2.0 flow and video fetching from YouTube

// Load Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
          hasGrantedAllScopes: (token: any, ...scopes: string[]) => boolean;
        };
      };
    };
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        getToken: () => any;
        setToken: (token: any) => void;
        request: (config: any) => Promise<any>;
      };
    };
  }
}

interface YouTubeConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

export interface YouTubeChannelInfo {
  id: string;
  name: string;
  avatar: string;
  subscriberCount: string;
  customUrl?: string;
  description?: string;
  bannerImageUrl?: string;
  publishedAt?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  views: string;
  tags: string[];
  channelTitle: string;
  channelThumbnail: string;
  channelId: string;
}

export interface YouTubeOAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

class YouTubeAPIService {
  private config: YouTubeConfig;
  private accessToken: string | null = null;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID || '',
      apiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
      scopes: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube' // Required for subscriptions
      ]
    };
    
    // Load Google APIs
    this.loadGoogleAPIs();
  }

  /**
   * Load Google APIs and Identity Services
   */
  private async loadGoogleAPIs(): Promise<void> {
    // Load Google Identity Services first
    await this.loadGoogleIdentityServices();
    // We'll use fetch for API calls instead of gapi client to avoid loading issues
  }

  /**
   * Load Google Identity Services
   */
  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      // Load Google Identity Services
      const existingScript = document.querySelector('script[src*="accounts.google.com"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => {
          // Wait for Google Identity Services to be available
          const checkGIS = setInterval(() => {
            if (window.google?.accounts?.oauth2) {
              clearInterval(checkGIS);
              resolve();
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkGIS);
            if (!window.google?.accounts?.oauth2) {
              reject(new Error('Google Identity Services failed to load'));
            }
          }, 10000);
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
        document.head.appendChild(script);
      } else {
        // Script already exists, wait for it to load
        const checkGIS = setInterval(() => {
          if (window.google?.accounts?.oauth2) {
            clearInterval(checkGIS);
            resolve();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkGIS);
          if (!window.google?.accounts?.oauth2) {
            reject(new Error('Google Identity Services failed to initialize'));
          }
        }, 10000);
      }
    });
  }

  /**
   * Initialize Google OAuth 2.0 flow for YouTube access using Google Identity Services
   */
  async initiateOAuth(): Promise<{ access_token: string; expires_in: number }> {
    if (!this.config.clientId) {
      throw new Error('YouTube Client ID not configured. Please set VITE_YOUTUBE_CLIENT_ID environment variable.');
    }

    // Wait for Google APIs to load
    await this.ensureGoogleAPIsLoaded();

    return new Promise((resolve, reject) => {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scopes.join(' '),
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          
          this.accessToken = response.access_token;
          
          // Set token in gapi client
          if (window.gapi?.client) {
            window.gapi.client.setToken({
              access_token: response.access_token
            });
          }
          
          resolve({
            access_token: response.access_token,
            expires_in: parseInt(response.expires_in || '3600')
          });
        },
      });

      // Request access token
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  /**
   * Ensure Google Identity Services are loaded
   */
  private async ensureGoogleAPIsLoaded(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!window.google?.accounts?.oauth2 && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services failed to load. Please check your internet connection and try again.');
    }
  }

  /**
   * Authenticate user with YouTube and return success status
   */
  async authenticate(): Promise<boolean> {
    try {
      const result = await this.initiateOAuth();
      return !!result.access_token;
    } catch (error) {
      console.error('YouTube authentication failed:', error);
      return false;
    }
  }

  /**
   * Get authenticated user's channel information
   */
  async getChannelInfo(): Promise<YouTubeChannelInfo> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    try {
      // Use fetch instead of gapi.client to avoid loading issues
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&mine=true&key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch channel information: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No YouTube channel found for this account');
      }

      const channel = data.items[0];
      const snippet = channel.snippet;
      const statistics = channel.statistics;
      const brandingSettings = channel.brandingSettings;

      return {
        id: channel.id,
        name: snippet.title,
        avatar: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        subscriberCount: this.formatSubscriberCount(statistics.subscriberCount),
        customUrl: snippet.customUrl,
        description: snippet.description || '',
        bannerImageUrl: brandingSettings?.image?.bannerExternalUrl || '',
        publishedAt: snippet.publishedAt
      };
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  }

  /**
   * Fetch recent videos from the authenticated channel
   */
  async getRecentVideos(maxResults: number = 20): Promise<YouTubeVideo[]> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    try {
      // First get the channel's upload playlist ID using fetch
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true&key=${this.config.apiKey}`;
      
      const channelResponse = await fetch(channelUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!channelResponse.ok) {
        throw new Error('Failed to fetch channel details');
      }

      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error('Could not find uploads playlist');
      }

      // Get videos from the uploads playlist
      const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.config.apiKey}`;
      
      const videosResponse = await fetch(videosUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!videosResponse.ok) {
        throw new Error('Failed to fetch videos');
      }

      const videosData = await videosResponse.json();
      const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      if (!videoIds) {
        return [];
      }

      // Get detailed video information including statistics and content details
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.config.apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

      const detailsData = await detailsResponse.json();

      // Extract unique channel IDs to fetch channel information
      const channelIds = Array.from(new Set(detailsData.items.map((video: any) => video.snippet.channelId))).join(',');
      
      // Fetch channel information for profile pictures
      const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds}&key=${this.config.apiKey}`;
      
      const channelsResponse = await fetch(channelsUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      let channelsData: any = { items: [] };
      if (channelsResponse.ok) {
        channelsData = await channelsResponse.json();
      }

      // Create a map of channel ID to channel information
      const channelMap = new Map();
      channelsData.items.forEach((channel: any) => {
        channelMap.set(channel.id, {
          title: channel.snippet.title,
          thumbnail: channel.snippet.thumbnails?.high?.url || 
                    channel.snippet.thumbnails?.medium?.url || 
                    channel.snippet.thumbnails?.default?.url || ''
        });
      });

      return detailsData.items.map((video: any) => {
        const channelInfo = channelMap.get(video.snippet.channelId) || {
          title: video.snippet.channelTitle,
          thumbnail: ''
        };

        return {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description || '',
          thumbnail: video.snippet.thumbnails?.maxresdefault?.url || 
                    video.snippet.thumbnails?.high?.url || 
                    video.snippet.thumbnails?.medium?.url || '',
          duration: this.formatDuration(video.contentDetails?.duration),
          publishedAt: this.formatDate(video.snippet.publishedAt),
          views: this.formatViewCount(video.statistics.viewCount || '0'),
          tags: video.snippet.tags || [],
          channelTitle: channelInfo.title,
          channelThumbnail: channelInfo.thumbnail,
          channelId: video.snippet.channelId
        };
      });
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  /**
   * Set access token (for when token is retrieved from storage or callback)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear stored access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Subscribe to a YouTube channel
   */
  async subscribeToChannel(channelId: string): Promise<boolean> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            resourceId: {
              kind: 'youtube#channel',
              channelId: channelId
            }
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to subscribe to channel: ${response.status} ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      throw error;
    }
  }

  /**
   * Check if user is subscribed to a channel
   */
  async checkSubscription(channelId: string): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&forChannelId=${channelId}&key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.items && data.items.length > 0;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Get public channel information by channel ID (no authentication required)
   */
  async getPublicChannelInfo(channelId: string): Promise<YouTubeChannelInfo> {
    if (!this.config.apiKey) {
      throw new Error('YouTube API Key not configured. Please set VITE_YOUTUBE_API_KEY environment variable.');
    }

    try {
      // Use the public API endpoint that doesn't require authentication
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&id=${channelId}&key=${this.config.apiKey}`;
      
      const response = await fetch(url, {
        // No Authorization header needed for public data
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API Error:', errorText);
        throw new Error(`Failed to fetch channel information: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error(`No YouTube channel found with ID: ${channelId}`);
      }

      const channel = data.items[0];
      const snippet = channel.snippet;
      const statistics = channel.statistics;
      const brandingSettings = channel.brandingSettings;

      return {
        id: channel.id,
        name: snippet.title,
        avatar: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        subscriberCount: this.formatSubscriberCount(statistics.subscriberCount || '0'),
        customUrl: snippet.customUrl,
        description: snippet.description || '',
        bannerImageUrl: brandingSettings?.image?.bannerExternalUrl || '',
        publishedAt: snippet.publishedAt
      };
    } catch (error) {
      console.error('Error fetching public channel info:', error);
      throw error;
    }
  }

  /**
   * Get public videos from a specific channel (no authentication required)
   */
  async getPublicChannelVideos(channelId: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    if (!this.config.apiKey) {
      throw new Error('YouTube API Key not configured. Please set VITE_YOUTUBE_API_KEY environment variable.');
    }

    try {
      // First get the channel's upload playlist ID
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${this.config.apiKey}`;
      
      const channelResponse = await fetch(channelUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!channelResponse.ok) {
        throw new Error(`Failed to fetch channel details for ${channelId}`);
      }

      const channelData = await channelResponse.json();
      
      if (!channelData.items || channelData.items.length === 0) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        console.warn(`No uploads playlist found for channel ${channelId}`);
        return [];
      }

      // Get videos from the uploads playlist
      const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.config.apiKey}`;
      
      const videosResponse = await fetch(videosUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!videosResponse.ok) {
        throw new Error(`Failed to fetch videos for channel ${channelId}`);
      }

      const videosData = await videosResponse.json();
      const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      if (!videoIds) {
        return [];
      }

      // Get detailed video information including statistics and content details
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.config.apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

      const detailsData = await detailsResponse.json();

      // Get channel info for consistent data
      const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${this.config.apiKey}`;
      const channelInfoResponse = await fetch(channelInfoUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      let channelInfo = { snippet: { title: 'Unknown Channel', thumbnails: {} } };
      if (channelInfoResponse.ok) {
        const channelInfoData = await channelInfoResponse.json();
        if (channelInfoData.items && channelInfoData.items.length > 0) {
          channelInfo = channelInfoData.items[0];
        }
      }

      return detailsData.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description || '',
        thumbnail: video.snippet.thumbnails?.maxresdefault?.url || 
                  video.snippet.thumbnails?.high?.url || 
                  video.snippet.thumbnails?.medium?.url || 
                  video.snippet.thumbnails?.default?.url || '',
        duration: this.formatDuration(video.contentDetails?.duration),
        publishedAt: this.formatDate(video.snippet.publishedAt),
        views: this.formatViewCount(video.statistics.viewCount || '0'),
        tags: video.snippet.tags || [],
        channelTitle: channelInfo.snippet.title,
        channelThumbnail: channelInfo.snippet.thumbnails?.high?.url || 
                        channelInfo.snippet.thumbnails?.medium?.url || 
                        channelInfo.snippet.thumbnails?.default?.url || '',
        channelId: channelId
      }));
    } catch (error) {
      console.error('Error fetching public channel videos:', error);
      throw error;
    }
  }

  // Helper methods
  private formatSubscriberCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  }

  private formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  }

  private formatDuration(isoDuration: string | undefined): string {
    // Handle undefined or null duration
    if (!isoDuration || typeof isoDuration !== 'string') {
      return '0:00';
    }
    
    // Convert ISO 8601 duration to MM:SS format
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) === 1 ? '' : 's'} ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const youTubeAPI = new YouTubeAPIService();

