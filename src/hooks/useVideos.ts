/**
 * React Query Hooks for Video Data
 * Provides cached, optimized access to video data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  fetchAllVideos,
  fetchFeaturedVideos,
  fetchUpNextVideos,
} from '@/lib/video-service';
import { Video, VideoCardData } from '@/types/video';

/**
 * Fetch all videos with caching
 */
export const useAllVideos = (): UseQueryResult<Video[], Error> => {
  return useQuery({
    queryKey: ['videos', 'all'],
    queryFn: fetchAllVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
};

/**
 * Fetch featured videos with caching
 */
export const useFeaturedVideos = (
  maxResults: number = 10
): UseQueryResult<Video[], Error> => {
  return useQuery({
    queryKey: ['videos', 'featured', maxResults],
    queryFn: () => fetchFeaturedVideos(maxResults),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch "Up Next" videos for video player
 * Excludes current video, returns formatted card data
 */
export const useUpNextVideos = (
  currentVideoId: string,
  maxResults: number = 4
): UseQueryResult<VideoCardData[], Error> => {
  return useQuery({
    queryKey: ['videos', 'upNext', currentVideoId, maxResults],
    queryFn: () => fetchUpNextVideos(currentVideoId, maxResults),
    enabled: !!currentVideoId, // Only run if we have a current video ID
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Convenience hook alias for backwards compatibility
 */
export const useVideos = useAllVideos;
