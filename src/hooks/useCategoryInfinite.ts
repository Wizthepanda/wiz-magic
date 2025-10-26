import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, orderBy, limit as firestoreLimit, getDocs, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Video {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  xpReward: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
    subscribers: string;
    isVerified: boolean;
    level?: number;
  };
  tags: string[];
  category?: string;
  addedToWiz?: Date;
}

interface UseCategoryInfiniteOptions {
  category: string;
  limit?: number;
  enabled?: boolean;
}

interface UseCategoryInfiniteReturn {
  items: Video[];
  loading: boolean;
  hasMore: boolean;
  error: Error | null;
  sentinelRef: React.RefObject<HTMLDivElement>;
  refetch: () => void;
}

/**
 * Custom hook for infinite scroll per category
 * - Fetches videos from Firestore by category
 * - Implements intersection observer for infinite loading
 * - Resets on category change
 * - Provides skeleton loading states
 */
export function useCategoryInfinite({
  category,
  limit = 12,
  enabled = true
}: UseCategoryInfiniteOptions): UseCategoryInfiniteReturn {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInitialMount = useRef(true);

  // Reset when category changes
  useEffect(() => {
    if (!isInitialMount.current) {
      setItems([]);
      setPage(1);
      setHasMore(true);
      setError(null);
    }
    isInitialMount.current = false;
  }, [category]);

  // Fetch page data
  const fetchPage = useCallback(async (pageNum: number) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // Build query constraints
      const constraints: QueryConstraint[] = [
        orderBy('addedToWiz', 'desc'),
        firestoreLimit(limit)
      ];

      // Filter by category if not "All"
      if (category !== 'All') {
        constraints.unshift(where('tags', 'array-contains', category));
      }

      // Fetch from both videos and creatorVideos collections
      const [videosSnapshot, creatorVideosSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'videos'), ...constraints)),
        getDocs(query(collection(db, 'creatorVideos'), ...constraints))
      ]);

      const processedVideoIds = new Set<string>();
      const newVideos: Video[] = [];

      // Helper to process video document
      const processVideo = (doc: any): Video | null => {
        const data = doc.data();

        // Skip if already processed
        if (processedVideoIds.has(data.videoId || doc.id)) {
          return null;
        }

        processedVideoIds.add(data.videoId || doc.id);

        return {
          id: doc.id,
          videoId: data.videoId || doc.id,
          title: data.title || 'Untitled Video',
          description: data.description || '',
          thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
          duration: data.duration || '0:00',
          views: data.views || '0 views',
          xpReward: data.xpValue || data.xpReward || 100,
          creator: {
            id: data.creatorId || data.channelId || 'unknown',
            name: data.channelName || data.creatorName || 'Unknown Creator',
            avatar: data.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.creatorId}`,
            subscribers: data.subscriberCount || '0 subscribers',
            isVerified: data.verified || false,
            level: 5
          },
          tags: data.tags || data.categoryTags || [],
          category: data.category || (data.tags && data.tags[0]) || 'General',
          addedToWiz: data.addedToWiz?.toDate?.() || new Date()
        };
      };

      // Process videos
      videosSnapshot.docs.forEach(doc => {
        const video = processVideo(doc);
        if (video) newVideos.push(video);
      });

      creatorVideosSnapshot.docs.forEach(doc => {
        const video = processVideo(doc);
        if (video) newVideos.push(video);
      });

      // Sort by addedToWiz date
      newVideos.sort((a, b) => {
        return (b.addedToWiz?.getTime() || 0) - (a.addedToWiz?.getTime() || 0);
      });

      // Update state
      setItems(prev => pageNum === 1 ? newVideos : [...prev, ...newVideos]);
      setHasMore(newVideos.length >= limit);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [category, limit, enabled]);

  // Fetch when page changes
  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  // Setup intersection observer for sentinel
  useEffect(() => {
    if (!sentinelRef.current || !enabled) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(p => p + 1);
        }
      },
      {
        rootMargin: '400px', // Load more when 400px away from bottom
        threshold: 0.1
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, enabled]);

  // Refetch function
  const refetch = useCallback(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    items,
    loading,
    hasMore,
    error,
    sentinelRef,
    refetch
  };
}
