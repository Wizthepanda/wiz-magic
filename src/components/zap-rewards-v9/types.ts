/**
 * ZAP Rewards Hub V9 - Type Definitions
 * Ultra-premium, production-ready type system
 */

// Media slot types for 5-slot carousel
export interface MediaSlot {
  id: string;
  type: 'image' | 'youtube' | 'video';
  url: string;
  thumbnail?: string;
  videoId?: string; // For YouTube embeds
  alt?: string;
  duration?: string; // For video preview
}

// Privacy/Access types
export type PrivacyStatus = 'public' | 'private' | 'invite-only';

// Category types
export type RewardCategory = 'community' | 'course' | 'coaching' | 'product';

// Monetization types
export type MonetizationType = 'zaps-only' | 'zaps-usd' | 'free' | 'waitlist';

// Reward status
export type RewardStatus = 'available' | 'sold-out' | 'waitlist' | 'coming-soon';

// Creator/Provider interface
export interface Creator {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  level?: number;
  subsCount?: number;
}

// Stats interface
export interface RewardStats {
  rating: number;
  reviews: number;
  members?: number;
  claimed?: number;
  duration?: string; // For courses
  downloads?: number; // For downloadable content
  availableSlots?: number;
  totalSlots?: number;
}

// Pricing interface
export interface Pricing {
  zapsCost: number;
  usdCoPay?: number;
  originalPrice?: number; // For showing discount
  discount?: number; // Percentage
  monetizationType: MonetizationType;
}

// Downloadable asset
export interface DownloadableAsset {
  id: string;
  name: string;
  type: 'pdf' | 'zip' | 'doc' | 'file';
  size: string;
  url: string;
}

// Main Reward interface
export interface Reward {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;

  // Media
  coverMedia: MediaSlot[]; // Up to 5 slots

  // Classification
  category: RewardCategory;
  tags?: string[]; // AI, Art, Tech, Gaming, etc.
  privacy: PrivacyStatus;

  // Creator
  creator: Creator;

  // Pricing & Monetization
  pricing: Pricing;

  // Stats
  stats: RewardStats;
  status: RewardStatus;

  // Features & Benefits
  benefits?: string[];
  features?: string[];
  included?: string[]; // What's included (videos, modules, etc.)

  // Downloadable content
  downloads?: DownloadableAsset[];

  // Metadata
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  limitedOffer?: boolean;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Filter state
export interface FilterState {
  monetization: 'all' | MonetizationType;
  categories: RewardCategory[];
  search?: string;
  sortBy?: 'newest' | 'popular' | 'price-low' | 'price-high' | 'rating';
}

// Claim/Purchase types
export interface ClaimRequest {
  rewardId: string;
  userId: string;
  paymentMethod: 'zaps' | 'zaps-usd' | 'crypto';
  settleInUSD?: boolean;
}

export interface ClaimResponse {
  success: boolean;
  transactionId?: string;
  reward?: Reward;
  message?: string;
  updatedBalance?: {
    zaps: number;
    usd: number;
  };
}

// API Response types
export interface PaginatedRewards {
  rewards: Reward[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
