import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Community {
  id: string;
  name: string;
  banner?: string;
  category: string;
  memberCount: number;
  description?: string;
}

export function useFeaturedCommunities() {
  return useQuery({
    queryKey: ['featuredCommunities'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'communities'),
          orderBy('memberCount', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Community[];
      } catch (error) {
        console.error('Error fetching featured communities:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
