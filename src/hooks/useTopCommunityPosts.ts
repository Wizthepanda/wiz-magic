import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import {
  getTopCommunityPosts,
  Post,
  TopPostQuery,
} from '@/lib/firestore/queries';

interface UseTopCommunityPostsOptions {
  communityIds?: string[];
  limit?: number;
  enabled?: boolean;
}

interface UseTopCommunityPostsReturn {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasMore: boolean;
  fetchNext: () => Promise<void>;
  prefetchNext: () => void;
  refetch: () => void;
}

/**
 * React Query hook for fetching top community posts
 * - Fetches posts ordered by score (descending)
 * - Supports pagination with cursor-based navigation
 * - Auto-prefetches next 3 posts for instant transitions
 * - Caches results for optimal performance
 */
export function useTopCommunityPosts({
  communityIds,
  limit = 50,
  enabled = true,
}: UseTopCommunityPostsOptions = {}): UseTopCommunityPostsReturn {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(
    undefined
  );
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Generate unique query key
  const queryKey: QueryKey = ['topCommunityPosts', communityIds?.join(',') || 'all', limit];

  // Fetch initial posts
  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getTopCommunityPosts({
        communityIds,
        limitCount: limit,
        cursor: undefined,
      });
      return result;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Update posts when data changes
  useEffect(() => {
    if (data) {
      setAllPosts(data.posts);
      setCursor(data.lastDoc || undefined);
      setHasMore(data.hasMore);
    }
  }, [data]);

  /**
   * Fetch next page of posts
   */
  const fetchNext = useCallback(async () => {
    if (!hasMore || !cursor) return;

    try {
      const result = await getTopCommunityPosts({
        communityIds,
        limitCount: limit,
        cursor,
      });

      setAllPosts((prev) => [...prev, ...result.posts]);
      setCursor(result.lastDoc || undefined);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error fetching next posts:', err);
    }
  }, [communityIds, limit, cursor, hasMore]);

  /**
   * Prefetch next 3 posts for smooth transitions
   * Called when user is viewing a post to ensure instant navigation
   */
  const prefetchNext = useCallback(() => {
    if (!hasMore || !cursor) return;

    queryClient.prefetchQuery({
      queryKey: [...queryKey, 'prefetch', cursor],
      queryFn: async () => {
        const result = await getTopCommunityPosts({
          communityIds,
          limitCount: 3, // Prefetch only 3 posts
          cursor,
        });
        return result;
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, queryKey, communityIds, cursor, hasMore]);

  /**
   * Refetch posts from scratch
   */
  const refetch = useCallback(() => {
    setCursor(undefined);
    setAllPosts([]);
    setHasMore(true);
    refetchQuery();
  }, [refetchQuery]);

  return {
    posts: allPosts,
    isLoading,
    isError,
    error: error as Error | null,
    hasMore,
    fetchNext,
    prefetchNext,
    refetch,
  };
}
