/**
 * Discover / Published Video Type Definitions
 * Used for videos published to WIZUP Discover feed
 */

import { Timestamp } from 'firebase/firestore';

export type VisibilityType = 'public' | 'private' | 'waitlist';

export interface PublishedVideo {
  id: string; // Firestore document ID
  videoId: string; // YouTube video ID
  title: string;
  description?: string;
  thumbnail: string;
  duration: number; // seconds

  // Creator info
  creatorId: string;
  creatorName?: string;
  creatorHandle?: string;
  creatorAvatar?: string;

  // YouTube channel info
  youtubeChannelId: string;
  youtubeChannelTitle: string;

  // Categorization (REQUIRED)
  category: string; // e.g., "tech", "money", "design"
  subcategory: string; // e.g., "AI", "Crypto", "UX/UI"
  tags?: string[]; // Auto-generated from subcategory + manual tags

  // Video metadata from YouTube
  videoUrl?: string;
  videoPublishedAt?: string;
  videoViews?: number;
  videoTags?: string[];

  // WIZUP engagement & rewards
  zapsPotential?: number;
  totalZAPsEarned?: number;
  totalViews?: number;
  totalLikes?: number;
  totalShares?: number;

  // Status & visibility
  type: 'youtube_video';
  status: 'published' | 'draft' | 'archived';
  visibility: VisibilityType;

  // Timestamps
  publishedAt: Timestamp | any;
  createdAt: Timestamp | any;

  // Optional ranking/engagement score
  score?: number;
}

/**
 * Payload for creating a new published video
 * (subset of PublishedVideo before Firestore generates ID)
 */
export interface CreatePublishedVideoPayload {
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number;

  creatorId: string;
  creatorName?: string;
  creatorHandle?: string;
  creatorAvatar?: string;

  youtubeChannelId: string;
  youtubeChannelTitle: string;

  category: string;
  subcategory: string;
  tags?: string[];

  videoUrl?: string;
  videoPublishedAt?: string;
  videoViews?: number;
  videoTags?: string[];

  type: 'youtube_video';
  status: 'published';
  visibility: VisibilityType;

  totalZAPsEarned?: number;
  totalViews?: number;
  totalLikes?: number;
  totalShares?: number;
}
