import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreatorProfileService, CreatorPublicProfile } from '@/lib/creator-profile-service';
import { CreatorService } from '@/lib/creator-service';

/**
 * React Query hook for fetching and caching creator profiles
 *
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Background refresh support
 * - Prefetching on hover
 * - Keep previous data during refetch (no flash)
 */

export interface CreatorVideo {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: string;
  views: string;
  xpReward: number;
  publishedAt?: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    level?: number;
    subscribers?: string;
  };
}

// Query keys for consistent caching
export const creatorKeys = {
  all: ['creator'] as const,
  profile: (id: string) => ['creator', 'profile', id] as const,
  videos: (id: string) => ['creator', 'videos', id] as const,
};

/**
 * Fetch creator profile by ID or username
 */
export function useCreatorProfile(identifier?: string | null) {
  return useQuery({
    queryKey: creatorKeys.profile(identifier || 'unknown'),
    queryFn: async () => {
      if (!identifier) {
        throw new Error('No creator identifier provided');
      }

      // Try username first, fallback to ID
      let profile: CreatorPublicProfile | null = null;

      if (identifier.startsWith('@') || identifier.length < 20) {
        // Looks like a username
        profile = await CreatorProfileService.getProfileByUsername(identifier);
      } else {
        // Looks like a UID
        profile = await CreatorProfileService.getProfileById(identifier);
      }

      if (!profile) {
        throw new Error('Creator not found');
      }

      return profile;
    },
    enabled: !!identifier, // Only run if identifier exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch creator videos
 */
export function useCreatorVideos(creatorId?: string | null) {
  return useQuery({
    queryKey: creatorKeys.videos(creatorId || 'unknown'),
    queryFn: async () => {
      if (!creatorId) {
        throw new Error('No creator ID provided');
      }

      const videos = await CreatorService.getCreatorVideos(creatorId);

      return videos.map((v): CreatorVideo => ({
        id: v.id,
        videoId: v.videoId,
        title: v.title,
        description: v.description,
        thumbnail: v.thumbnail,
        duration: v.duration,
        views: v.views,
        xpReward: 250,
        publishedAt: v.publishedAt,
        creator: {
          id: creatorId,
          name: v.creator || 'Unknown',
          avatar: v.creatorAvatar || '',
          level: 5,
          subscribers: v.subscriberCount || '0 subscribers'
        }
      }));
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Prefetch creator profile on hover
 * Call this function when user hovers over a creator avatar
 */
export function usePrefetchCreatorProfile() {
  const queryClient = useQueryClient();

  return (identifier: string) => {
    queryClient.prefetchQuery({
      queryKey: creatorKeys.profile(identifier),
      queryFn: async () => {
        let profile: CreatorPublicProfile | null = null;

        if (identifier.startsWith('@') || identifier.length < 20) {
          profile = await CreatorProfileService.getProfileByUsername(identifier);
        } else {
          profile = await CreatorProfileService.getProfileById(identifier);
        }

        if (!profile) {
          throw new Error('Creator not found');
        }

        return profile;
      },
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Prefetch creator videos on hover
 */
export function usePrefetchCreatorVideos() {
  const queryClient = useQueryClient();

  return (creatorId: string) => {
    queryClient.prefetchQuery({
      queryKey: creatorKeys.videos(creatorId),
      queryFn: async () => {
        const videos = await CreatorService.getCreatorVideos(creatorId);

        return videos.map((v): CreatorVideo => ({
          id: v.id,
          videoId: v.videoId,
          title: v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          duration: v.duration,
          views: v.views,
          xpReward: 250,
          publishedAt: v.publishedAt,
          creator: {
            id: creatorId,
            name: v.creator || 'Unknown',
            avatar: v.creatorAvatar || '',
            level: 5,
            subscribers: v.subscriberCount || '0 subscribers'
          }
        }));
      },
      staleTime: 1000 * 60 * 5,
    });
  };
}
