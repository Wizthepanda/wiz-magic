import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Reward {
  id: string;
  tierName: string;
  requiredXP: number;
  benefits: string[];
  description?: string;
  icon?: string;
}

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'rewards'),
          orderBy('requiredXP', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reward[];
      } catch (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
