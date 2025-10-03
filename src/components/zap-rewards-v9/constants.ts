/**
 * ZAP Rewards Hub V9 - Constants & Configuration
 */

import { Sparkles, Users, GraduationCap, MessageSquare, Package } from 'lucide-react';
import type { RewardCategory, MonetizationType } from './types';

// Filter Options
export const MONETIZATION_FILTERS = [
  { id: 'all' as const, label: 'All Rewards' },
  { id: 'zaps-only' as MonetizationType, label: 'ZAPs Only' },
  { id: 'zaps-usd' as MonetizationType, label: 'ZAPs + USD' },
  { id: 'free' as MonetizationType, label: 'Free Rewards' },
] as const;

export const CATEGORY_FILTERS = [
  { id: 'all' as const, label: 'All', icon: Sparkles },
  { id: 'community' as RewardCategory, label: 'Communities', icon: Users },
  { id: 'course' as RewardCategory, label: 'Courses', icon: GraduationCap },
  { id: 'coaching' as RewardCategory, label: 'Coaching', icon: MessageSquare },
  { id: 'product' as RewardCategory, label: 'Digital Products', icon: Package },
] as const;

// Category Tags (for filtering)
export const TAGS = [
  'AI',
  'Art',
  'Tech',
  'Gaming',
  'Finance',
  'Music',
  'Design',
  'Marketing',
  'Development',
  'NFTs',
  'Crypto',
  'Metaverse',
  '3D',
  'Animation',
] as const;

// Layout Configuration
export const GRID_CONFIG = {
  desktop: {
    columns: 3,
    gap: 6,
  },
  tablet: {
    columns: 2,
    gap: 4,
  },
  mobile: {
    columns: 1,
    gap: 4,
  },
} as const;

// Carousel Configuration
export const CAROUSEL_CONFIG = {
  maxSlots: 5,
  autoplayDelay: 5000,
  dragFree: false,
  loop: true,
  align: 'start' as const,
} as const;

// Card Configuration
export const CARD_CONFIG = {
  imageAspectRatio: '16/9',
  thumbnailSize: 48,
  cornerRadius: '2xl',
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
  cardHover: {
    y: -4,
    scale: 0.998,
    transition: { duration: 0.2 },
  },
  cardTap: {
    scale: 0.995,
  },
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideIn: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
} as const;

// Glassmorphism Styling Constants
export const GLASS_STYLES = {
  card: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border border-white/20 dark:border-gray-700/20',
  pill: 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-gray-700/20',
  overlay: 'bg-black/40 backdrop-blur-sm',
  modal: 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl',
} as const;

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

// API Endpoints (Mock - to be replaced with real endpoints)
export const API_ENDPOINTS = {
  rewards: '/api/rewards',
  claim: '/api/rewards/claim',
  preview: '/api/rewards/:id',
  featured: '/api/rewards/featured',
} as const;

// Pagination
export const PAGINATION_CONFIG = {
  pageSize: 12,
  initialPage: 1,
  prefetchPages: 1, // Number of pages to prefetch ahead
} as const;

// Performance
export const PERFORMANCE_CONFIG = {
  virtualizeThreshold: 50, // Enable virtualization after this many items
  lazyLoadThreshold: '200px', // IntersectionObserver threshold
  imagePlaceholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Crect fill="%23f0f0f0" width="400" height="225"/%3E%3C/svg%3E',
} as const;

// Accessibility
export const A11Y_LABELS = {
  closeDialog: 'Close reward details',
  previousSlide: 'Previous media',
  nextSlide: 'Next media',
  claimReward: 'Claim this reward',
  previewReward: 'Preview reward details',
  filterByCategory: 'Filter rewards by category',
  filterByMonetization: 'Filter rewards by payment type',
} as const;
