/**
 * Video Type Definitions
 * Used across the WIZ platform for video data structure
 */

export interface Video {
  id: string;
  videoId: string; // YouTube video ID
  title: string;
  description?: string;
  thumbnail: string;

  // Creator information
  creatorId?: string;
  creatorName: string;
  creatorAvatar: string;
  channelId?: string;
  channelName?: string;
  channelAvatar?: string;

  // Video metadata
  views: number;
  duration: number; // in seconds
  uploadDate?: Date | string;
  createdAt?: Date | string;

  // Engagement & rewards
  zapReward: number;
  xpReward?: number;

  // Status & visibility
  status?: 'active' | 'inactive' | 'pending' | 'deleted';
  isFeatured?: boolean;

  // Optional fields
  category?: string;
  tags?: string[];
}

/**
 * Partial video data for list/card views
 */
export interface VideoCardData {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string; // formatted as "MM:SS"
  creatorName: string;
  creatorAvatar: string;
  creatorId?: string;
  views: string; // formatted with K/M suffixes
  zapReward: number;
}

/**
 * Firestore video document structure
 */
export interface FirestoreVideo {
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;

  creatorId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  channelId?: string;
  channelName?: string;
  channelAvatar?: string;

  views?: number | string;
  duration?: number | string;
  uploadDate?: any;
  createdAt?: any;

  zapReward?: number;
  xpReward?: number;

  status?: string;
  isFeatured?: boolean;

  category?: string;
  tags?: string[];
}
