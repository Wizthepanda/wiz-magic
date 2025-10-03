/**
 * ZAP Rewards Hub V9 - Utility Functions
 */

import type { Reward, MediaSlot, MonetizationType, RewardStatus } from './types';

/**
 * Format ZAP amount with commas
 */
export function formatZaps(amount: number): string {
  return amount.toLocaleString('en-US');
}

/**
 * Format USD amount
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(original: number, current: number): number {
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status: RewardStatus): string {
  switch (status) {
    case 'available':
      return 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20';
    case 'sold-out':
      return 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20';
    case 'waitlist':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20';
    case 'coming-soon':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20';
  }
}

/**
 * Get monetization badge color
 */
export function getMonetizationColor(type: MonetizationType): string {
  switch (type) {
    case 'zaps-only':
      return 'bg-gradient-to-r from-indigo-500 to-violet-600';
    case 'zaps-usd':
      return 'bg-gradient-to-r from-blue-500 to-green-500';
    case 'free':
      return 'bg-gradient-to-r from-green-500 to-emerald-500';
    case 'waitlist':
      return 'bg-gradient-to-r from-orange-500 to-amber-500';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600';
  }
}

/**
 * Get monetization label
 */
export function getMonetizationLabel(type: MonetizationType): string {
  switch (type) {
    case 'zaps-only':
      return 'ZAPs Only';
    case 'zaps-usd':
      return 'ZAPs + USD';
    case 'free':
      return 'Free';
    case 'waitlist':
      return 'Waitlist';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate slots progress percentage
 */
export function calculateSlotsProgress(claimed: number, total: number): number {
  if (total === 0) return 0;
  return Math.min((claimed / total) * 100, 100);
}

/**
 * Get progress bar color based on availability
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-orange-500';
  if (percentage >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
}

/**
 * Check if user can afford reward
 */
export function canAffordReward(
  userZaps: number,
  requiredZaps: number,
  userUSD?: number,
  requiredUSD?: number
): boolean {
  const hasEnoughZaps = userZaps >= requiredZaps;
  const hasEnoughUSD = requiredUSD ? (userUSD || 0) >= requiredUSD : true;
  return hasEnoughZaps && hasEnoughUSD;
}

/**
 * Get placeholder image for empty media slots
 */
export function getPlaceholderImage(width: number = 800, height: number = 450): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='%23f0f0f0' width='${width}' height='${height}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E`;
}

/**
 * Parse YouTube video ID from URL
 */
export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'maxres' = 'maxres'): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    maxres: 'maxresdefault',
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Validate media slots (ensure max 5, at least 1)
 */
export function validateMediaSlots(slots: MediaSlot[]): boolean {
  return slots.length >= 1 && slots.length <= 5;
}

/**
 * Fill empty media slots with placeholders
 */
export function fillMediaSlots(slots: MediaSlot[], maxSlots: number = 5): MediaSlot[] {
  const filled = [...slots];
  while (filled.length < maxSlots) {
    filled.push({
      id: `placeholder-${filled.length}`,
      type: 'image',
      url: getPlaceholderImage(),
      alt: 'Placeholder',
    });
  }
  return filled.slice(0, maxSlots);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get star rating display (filled/empty stars)
 */
export function getStarRating(rating: number): { filled: number; half: boolean; empty: number } {
  const filled = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty = 5 - filled - (hasHalf ? 1 : 0);
  return { filled, half: hasHalf, empty };
}

/**
 * Debounce function for search/filter
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate skeleton array for loading states
 */
export function generateSkeletons(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

/**
 * Check if reward is sold out
 */
export function isSoldOut(reward: Reward): boolean {
  if (!reward.stats.totalSlots) return false;
  return (reward.stats.claimed || 0) >= reward.stats.totalSlots;
}

/**
 * Get remaining slots
 */
export function getRemainingSlots(reward: Reward): number {
  if (!reward.stats.totalSlots) return 0;
  return Math.max(0, reward.stats.totalSlots - (reward.stats.claimed || 0));
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}
