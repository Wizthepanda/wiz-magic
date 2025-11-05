import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedCommunity {
  id: string;
  name: string;
  bannerUrl: string;
  category: string;
  description?: string;
  memberCount: number;
  createdAt: any;
}

export function useFeaturedCommunities(limitCount: number = 3) {
  return useQuery({
    queryKey: ['featuredCommunities', limitCount],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'communities'),
          orderBy('memberCount', 'desc'),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FeaturedCommunity[];
      } catch (error) {
        console.error('Error fetching featured communities:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
