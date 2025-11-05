import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  userId: string;
  creatorName: string;
  creatorAvatar: string;
  category: string;
  subcategory?: string;
  status: string;
  views: number;
  createdAt: any;
}

export function useFeaturedVideos(limitCount: number = 6) {
  return useQuery({
    queryKey: ['featuredVideos', limitCount],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'videos'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FeaturedVideo[];
      } catch (error) {
        console.error('Error fetching featured videos:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreatorVideos(userId: string, limitCount: number = 3) {
  return useQuery({
    queryKey: ['creatorVideos', userId, limitCount],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'videos'),
          where('userId', '==', userId),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FeaturedVideo[];
      } catch (error) {
        console.error('Error fetching creator videos:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
