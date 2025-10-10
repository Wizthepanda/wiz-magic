import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Video {
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
  [key: string]: any;
}

interface UseInfiniteVideosOptions {
  pageSize?: number;
  initialLimit?: number;
  category?: string;
}

/**
 * Custom hook for infinite scrolling videos with Firebase Firestore
 * Features:
 * - Pagination with startAfter cursor
 * - Automatic batch loading
 * - Category filtering
 * - Loading and error states
 * - Real-time updates for initial batch
 */
export const useInfiniteVideos = (
  userId: string | undefined,
  options: UseInfiniteVideosOptions = {}
) => {
  const {
    pageSize = 12,
    initialLimit = 12,
    category = 'all'
  } = options;

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const lastVisibleRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const isLoadingRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Helper to transform Firestore document to Video format
  const transformVideoDoc = (doc: QueryDocumentSnapshot<DocumentData>): Video => {
    const data = doc.data();
    return {
      id: doc.id,
      videoId: data.videoId || data.id || doc.id,
      title: data.title || 'Untitled Video',
      description: data.description || 'No description available',
      thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId || 'dQw4w9WgXcQ'}/maxresdefault.jpg`,
      duration: data.duration || '0:00',
      views: data.views || '0 views',
      xpReward: data.xpValue || data.xpReward || 100,
      creator: {
        id: data.creatorId || 'unknown',
        name: data.creator || data.channelName || 'Unknown Creator',
        avatar: data.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.creator || 'default'}`,
        subscribers: data.subscriberCount || '1K subscribers',
        isVerified: data.verified || false,
        level: 5
      },
      tags: data.tags || data.categoryTags || ['Video']
    };
  };

  // Load initial batch with real-time updates
  const loadInitialVideos = useCallback(async () => {
    if (!userId) {
      console.log('❌ No user ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading initial videos...', { category, initialLimit });
      setLoading(true);
      setError(null);

      // Query both videos and creatorVideos collections
      const videosQuery = query(
        collection(db, 'videos'),
        orderBy('addedToWiz', 'desc'),
        limit(initialLimit)
      );

      const creatorVideosQuery = query(
        collection(db, 'creatorVideos'),
        orderBy('addedToWiz', 'desc'),
        limit(initialLimit)
      );

      // Set up real-time listener for initial batch
      unsubscribeRef.current = onSnapshot(
        videosQuery,
        async (videosSnapshot) => {
          const creatorVideosSnapshot = await getDocs(creatorVideosQuery);

          const loadedVideos: Video[] = [];
          const processedIds = new Set<string>();

          // Process videos collection
          videosSnapshot.docs.forEach((doc) => {
            const video = transformVideoDoc(doc);
            if (!processedIds.has(video.videoId)) {
              processedIds.add(video.videoId);
              loadedVideos.push(video);
            }
          });

          // Process creatorVideos collection
          creatorVideosSnapshot.docs.forEach((doc) => {
            const video = transformVideoDoc(doc);
            if (!processedIds.has(video.videoId)) {
              processedIds.add(video.videoId);
              loadedVideos.push(video);
            }
          });

          // Store last visible document for pagination
          const lastDoc = videosSnapshot.docs[videosSnapshot.docs.length - 1];
          if (lastDoc) {
            lastVisibleRef.current = lastDoc;
          }

          // Check if there are more videos
          setHasMore(loadedVideos.length >= initialLimit);

          setVideos(loadedVideos);
          setLoading(false);

          console.log('✅ Initial videos loaded:', loadedVideos.length);
        },
        (err) => {
          console.error('❌ Error loading initial videos:', err);
          setError(err as Error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('❌ Error setting up video listener:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [userId, category, initialLimit]);

  // Load more videos (pagination)
  const loadMore = useCallback(async () => {
    if (!userId || isLoadingRef.current || !hasMore || !lastVisibleRef.current) {
      return;
    }

    try {
      console.log('🔄 Loading more videos...');
      isLoadingRef.current = true;
      setLoadingMore(true);
      setError(null);

      // Query next batch starting after last document
      const nextQuery = query(
        collection(db, 'videos'),
        orderBy('addedToWiz', 'desc'),
        startAfter(lastVisibleRef.current),
        limit(pageSize)
      );

      const snapshot = await getDocs(nextQuery);

      if (snapshot.empty) {
        console.log('✅ No more videos to load');
        setHasMore(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
        return;
      }

      const newVideos: Video[] = [];
      const existingIds = new Set(videos.map(v => v.videoId));

      snapshot.docs.forEach((doc) => {
        const video = transformVideoDoc(doc);
        if (!existingIds.has(video.videoId)) {
          newVideos.push(video);
        }
      });

      // Update last visible document
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      if (lastDoc) {
        lastVisibleRef.current = lastDoc;
      }

      // Append new videos
      setVideos(prev => [...prev, ...newVideos]);
      setHasMore(newVideos.length >= pageSize);
      setLoadingMore(false);
      isLoadingRef.current = false;

      console.log('✅ Loaded more videos:', newVideos.length);
    } catch (err) {
      console.error('❌ Error loading more videos:', err);
      setError(err as Error);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [userId, pageSize, hasMore, videos]);

  // Reset when category changes
  useEffect(() => {
    console.log('🔄 Category changed, resetting videos...');
    setVideos([]);
    setHasMore(true);
    lastVisibleRef.current = null;

    // Cleanup previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Load new videos
    loadInitialVideos();
  }, [category, loadInitialVideos]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    videos,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore
  };
};
