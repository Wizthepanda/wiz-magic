import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  userId: string;
  creatorName?: string;
  creatorAvatar?: string;
  category: string;
  subcategory?: string;
  status: string;
  createdAt: any;
  views?: number;
}

export function useFeaturedVideos() {
  return useQuery({
    queryKey: ['featuredVideos'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'videos'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Video[];
      } catch (error) {
        console.error('Error fetching featured videos:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
