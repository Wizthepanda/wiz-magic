/**
 * Creator Type Definitions
 * 
 * Shared types for Creator-related components and features
 */

/**
 * Creator interface representing a content creator on the platform
 */
export interface Creator {
  /** Unique identifier for the creator */
  id: string;
  
  /** Display name of the creator */
  name: string;
  
  /** Short description or tagline (optional) */
  tagline?: string;
  
  /** URL to the creator's avatar image (optional) */
  avatarUrl?: string;
  
  /** URL to the creator's banner/cover image (optional) */
  bannerUrl?: string;
  
  /** Cost in ZAPs to unlock this creator's content (optional, defaults to 0) */
  zapCost?: number;
  
  /** List of features/benefits the creator offers (optional) */
  features?: string[];
  
  /** URL to a preview video (YouTube embed, Vimeo, etc.) (optional) */
  previewVideoUrl?: string;
  
  /** Category or niche of the creator (optional) */
  category?: string;
  
  /** Number of subscribers/followers (optional) */
  subscriberCount?: number;
  
  /** Creator's social media links (optional) */
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    website?: string;
  };
  
  /** Whether the creator is verified (optional) */
  verified?: boolean;
  
  /** Creator's bio or description (optional) */
  bio?: string;
  
  /** Timestamp when creator joined (optional) */
  joinedAt?: Date | string;
  
  /** Average rating from users (optional) */
  rating?: number;
  
  /** Number of ratings (optional) */
  ratingCount?: number;
}

/**
 * Extended creator with unlock status
 */
export interface CreatorWithUnlockStatus extends Creator {
  /** Whether the current user has unlocked this creator */
  isUnlocked: boolean;
  
  /** Timestamp when the user unlocked this creator (if unlocked) */
  unlockedAt?: Date | string;
}

/**
 * Creator feature with detailed description
 */
export interface CreatorFeature {
  /** Feature title */
  title: string;
  
  /** Detailed description of the feature */
  description: string;
  
  /** Icon name or component (optional) */
  icon?: string;
}

/**
 * Creator unlock transaction
 */
export interface CreatorUnlockTransaction {
  /** Transaction ID */
  id: string;
  
  /** User ID who unlocked */
  userId: string;
  
  /** Creator ID that was unlocked */
  creatorId: string;
  
  /** ZAPs spent */
  zapCost: number;
  
  /** Timestamp of unlock */
  unlockedAt: Date | string;
  
  /** Transaction status */
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

/**
 * Creator statistics
 */
export interface CreatorStats {
  /** Total number of unlocks */
  totalUnlocks: number;
  
  /** Total revenue in ZAPs */
  totalRevenue: number;
  
  /** Number of active subscribers */
  activeSubscribers: number;
  
  /** Average engagement rate */
  engagementRate: number;
  
  /** Monthly growth rate */
  growthRate: number;
}

/**
 * Props for CreatorFullScreenView component
 */
export interface CreatorFullScreenViewProps {
  /** Whether the dialog is open */
  open: boolean;
  
  /** Function to set the open state */
  setOpen: (open: boolean) => void;
  
  /** Creator data to display */
  creator: Creator;
  
  /** Callback when user clicks unlock (optional) */
  onUnlock?: (creatorId: string) => Promise<void>;
  
  /** Callback when user clicks preview (optional) */
  onPreview?: (creatorId: string) => void;
  
  /** Current user's ZAP balance (optional, defaults to 0) */
  userZapBalance?: number;
}

/**
 * Creator card props
 */
export interface CreatorCardProps {
  /** Creator data */
  creator: Creator;
  
  /** Callback when card is clicked */
  onClick?: (creator: Creator) => void;
  
  /** Whether to show the unlock button */
  showUnlockButton?: boolean;
  
  /** Whether the creator is unlocked */
  isUnlocked?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * Creator filter options
 */
export interface CreatorFilterOptions {
  /** Filter by category */
  category?: string;
  
  /** Filter by ZAP cost range */
  zapCostRange?: {
    min: number;
    max: number;
  };
  
  /** Filter by verified status */
  verifiedOnly?: boolean;
  
  /** Sort by */
  sortBy?: 'name' | 'zapCost' | 'subscriberCount' | 'rating' | 'joinedAt';
  
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  
  /** Search query */
  searchQuery?: string;
}

/**
 * Creator API response
 */
export interface CreatorApiResponse {
  /** Array of creators */
  creators: Creator[];
  
  /** Total count (for pagination) */
  total: number;
  
  /** Current page */
  page: number;
  
  /** Page size */
  pageSize: number;
  
  /** Whether there are more results */
  hasMore: boolean;
}

