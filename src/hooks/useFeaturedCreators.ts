import { useQuery } from '@tanstack/react-query';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedCreator {
  id: string;
  displayName: string;
  photoURL: string;
  creatorProfile: boolean;
  totalXP: number;
  level: number;
  bio?: string;
}

export function useFeaturedCreators() {
  return useQuery({
    queryKey: ['featuredCreators'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('creatorProfile', '==', true),
          limit(10)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as FeaturedCreator[];
      } catch (error) {
        console.error('Error fetching featured creators:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}
