/**
 * YouTube API Client (Server-Proxied)
 *
 * All requests go through backend endpoints that use server-side tokens.
 * No tokens stored in localStorage - all authentication via httpOnly cookies.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnailHigh?: string;
  duration: string;
  publishedAt: string;
  views: string;
  channelId: string;
  channelTitle: string;
  tags?: string[];
  categoryId?: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  avatar: string;
  banner?: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  customUrl?: string;
  country?: string;
  publishedAt: string;
}

export interface YouTubeConnectionStatus {
  connected: boolean;
  channelId?: string;
  channelTitle?: string;
  channelAvatar?: string;
  subscriberCount?: string;
  lastSynced?: string;
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Check if user has connected YouTube
 */
export async function fetchYouTubeConnectionStatus(): Promise<YouTubeConnectionStatus> {
  const response = await fetch('/api/youtube/status', {
    method: 'GET',
    credentials: 'include', // Include httpOnly cookies
  });

  if (!response.ok) {
    throw new Error(`Failed to check connection status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch user's YouTube channel info
 */
export async function fetchYouTubeChannel(): Promise<YouTubeChannel> {
  const response = await fetch('/api/youtube/channel', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not connected to YouTube');
    }
    throw new Error(`Failed to fetch channel: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch user's YouTube videos (server-side fetches from YouTube API)
 */
export async function fetchYouTubeVideos(options?: {
  maxResults?: number;
  pageToken?: string;
}): Promise<{
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}> {
  const params = new URLSearchParams();
  if (options?.maxResults) params.set('maxResults', options.maxResults.toString());
  if (options?.pageToken) params.set('pageToken', options.pageToken);

  const response = await fetch(`/api/youtube/videos?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Not connected to YouTube');
    }
    throw new Error(`Failed to fetch videos: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Disconnect YouTube channel
 */
export async function disconnectYouTube(): Promise<void> {
  const response = await fetch('/api/youtube/disconnect', {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to disconnect: ${response.statusText}`);
  }
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to check YouTube connection status
 */
export function useYouTubeConnectionStatus(): UseQueryResult<YouTubeConnectionStatus> {
  return useQuery({
    queryKey: ['youtubeConnectionStatus'],
    queryFn: fetchYouTubeConnectionStatus,
    staleTime: 30000, // 30 seconds
    retry: false,
  });
}

/**
 * Hook to fetch YouTube channel info
 */
export function useYouTubeChannel(): UseQueryResult<YouTubeChannel> {
  return useQuery({
    queryKey: ['youtubeChannel'],
    queryFn: fetchYouTubeChannel,
    staleTime: 60000, // 1 minute
    retry: false,
    enabled: false, // Only fetch when explicitly enabled
  });
}

/**
 * Hook to fetch YouTube videos with automatic pagination support
 */
export function useYouTubeVideos(options?: {
  maxResults?: number;
  enabled?: boolean;
}): UseQueryResult<{
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}> {
  return useQuery({
    queryKey: ['youtubeVideos', options?.maxResults],
    queryFn: () => fetchYouTubeVideos({ maxResults: options?.maxResults || 50 }),
    staleTime: 300000, // 5 minutes
    retry: 1,
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to fetch more videos (pagination)
 */
export function useYouTubeVideosPaginated(pageToken?: string, maxResults = 20) {
  return useQuery({
    queryKey: ['youtubeVideos', 'page', pageToken],
    queryFn: () => fetchYouTubeVideos({ maxResults, pageToken }),
    enabled: !!pageToken,
    staleTime: 300000,
  });
}
