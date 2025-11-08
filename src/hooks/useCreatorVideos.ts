/**
 * useCreatorVideos Hook - Fetches videos for a specific creator
 */

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { VideoData } from '@/contexts/PlayerContext';

export const useCreatorVideos = (creatorId: string | undefined, limitCount: number = 50) => {
  return useQuery({
    queryKey: ['creatorVideos', creatorId, limitCount],
    queryFn: async (): Promise<VideoData[]> => {
      if (!creatorId) throw new Error('Creator ID is required');

      console.log('📹 Fetching videos for creator:', creatorId);

      // Query videos from the discover collection
      const videosRef = collection(db, 'discover');
      const q = query(
        videosRef,
        where('creatorId', '==', creatorId),
        orderBy('publishedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const videos: VideoData[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          id: doc.id,
          videoId: data.videoId || doc.id,
          title: data.title || 'Untitled Video',
          description: data.description || '',
          thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
          duration: data.duration || '0:00',
          views: data.videoViews ? `${parseInt(data.videoViews).toLocaleString()} views` : data.views || '0 views',
          xpReward: data.xpReward || 150,
          creator: {
            id: data.creatorId || creatorId,
            name: data.creatorName || data.youtubeChannelTitle || 'Unknown Creator',
            avatar: data.creatorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
            subscribers: data.creatorSubscribers || '0 subscribers',
            isVerified: data.creatorVerified || true,
            level: data.creatorLevel || 1,
          },
          tags: [data.category, data.subcategory, ...(data.tags || [])].filter(Boolean),
          category: data.category,
          subcategory: data.subcategory,
        });
      });

      console.log(`📹 Found ${videos.length} videos for creator ${creatorId}`);
      return videos;
    },
    enabled: !!creatorId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
