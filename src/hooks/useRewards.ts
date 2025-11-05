import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Reward {
  id: string;
  tierName: string;
  requiredXP: number;
  benefits: string[];
  description: string;
  icon?: string;
  gradient?: string;
  isActive: boolean;
}

export function useRewards(limitCount: number = 3) {
  return useQuery({
    queryKey: ['rewards', limitCount],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'rewards'),
          orderBy('requiredXP', 'desc'),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Reward[];
      } catch (error) {
        console.error('Error fetching rewards:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
