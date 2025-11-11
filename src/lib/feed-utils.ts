// Feed item types
export interface VideoItem {
  id: string;
  type: 'video';
  title: string;
  creator: string;
  thumbnail: string;
  duration: string;
  xpReward: number;
  category: string;
  views: number;
  watched: boolean;
  progress: number;
  videoId: string;
  isNew: boolean;
  likes: number;
  comments: number;
}

export interface PostItem {
  id: string;
  type: 'post';
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  category: string;
  image?: string;
}

export interface RewardItem {
  id: string;
  type: 'reward';
  title: string;
  description: string;
  xpValue: number;
  icon: string;
  progress: number;
  category: string;
  unlocked: boolean;
}

export type FeedItem = VideoItem | PostItem | RewardItem;

export interface FeedFilters {
  category: string;
  searchQuery?: string;
}

export interface Category {
  id: string;
  label: string;
  color: string;
  dotColor: string;
}

export const categories: Category[] = [
  { id: 'all', label: 'All', color: 'from-indigo-500 to-purple-500', dotColor: 'bg-blue-400' },
  { id: 'ai', label: 'AI', color: 'from-red-500 to-pink-500', dotColor: 'bg-red-400' },
  { id: 'tech', label: 'Tech', color: 'from-orange-500 to-amber-500', dotColor: 'bg-orange-400' },
  { id: 'music', label: 'Music', color: 'from-pink-500 to-purple-500', dotColor: 'bg-pink-400' },
  { id: 'money', label: 'Money', color: 'from-emerald-500 to-green-500', dotColor: 'bg-green-400' },
  { id: 'health', label: 'Health', color: 'from-rose-500 to-red-500', dotColor: 'bg-red-400' },
];

// Utility functions
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getCategoryColor(categoryId: string): string {
  const category = categories.find(c => c.id === categoryId);
  return category?.color || categories[0].color;
}
