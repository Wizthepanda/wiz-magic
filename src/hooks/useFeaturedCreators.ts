import { useQuery } from '@tanstack/react-query';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Creator {
  id: string;
  displayName: string;
  photoURL: string;
  creatorProfile: boolean;
  bio?: string;
  category?: string;
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
          ...doc.data()
        })) as Creator[];
      } catch (error) {
        console.error('Error fetching featured creators:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
