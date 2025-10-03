/**
 * ZAP Rewards Hub V9 - Main Export File
 * Ultra-premium glassmorphic reward system
 */

// Components
export { Header } from './Header';
export { FilterRow, MobileFilterRow } from './FilterRow';
export { BalanceWidget, WalletPopup } from './BalanceWidget';
export { MediaCarousel, ThumbnailStrip } from './MediaCarousel';
export { RewardCard } from './RewardCard';
export { RewardDialog } from './RewardDialog';

// Types
export type {
  MediaSlot,
  PrivacyStatus,
  RewardCategory,
  MonetizationType,
  RewardStatus,
  Creator,
  RewardStats,
  Pricing,
  DownloadableAsset,
  Reward,
  FilterState,
  ClaimRequest,
  ClaimResponse,
  PaginatedRewards,
  ApiError,
} from './types';

// Constants
export {
  MONETIZATION_FILTERS,
  CATEGORY_FILTERS,
  TAGS,
  GRID_CONFIG,
  CAROUSEL_CONFIG,
  CARD_CONFIG,
  ANIMATION_CONFIG,
  GLASS_STYLES,
  Z_INDEX,
  API_ENDPOINTS,
  PAGINATION_CONFIG,
  PERFORMANCE_CONFIG,
  A11Y_LABELS,
} from './constants';

// Utilities
export {
  formatZaps,
  formatUSD,
  calculateDiscount,
  getStatusColor,
  getMonetizationColor,
  getMonetizationLabel,
  calculateSlotsProgress,
  getProgressColor,
  canAffordReward,
  getPlaceholderImage,
  parseYouTubeId,
  getYouTubeThumbnail,
  validateMediaSlots,
  fillMediaSlots,
  truncate,
  getStarRating,
  debounce,
  generateSkeletons,
  isSoldOut,
  getRemainingSlots,
  formatRelativeTime,
} from './utils';
