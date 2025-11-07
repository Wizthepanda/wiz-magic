import { useQuery } from '@tanstack/react-query';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Reward {
  id: string;
  tierName?: string;
  requiredXP?: number;
  benefits?: string[];
  description?: string;
  isActive?: boolean;
  [key: string]: any;
}

async function fetchRewards(): Promise<Reward[]> {
  try {
    const rewardsRef = collection(db, 'rewards');
    const q = query(
      rewardsRef,
      orderBy('requiredXP', 'desc'),
      limit(3)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No rewards found');
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Reward[];
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
}

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: fetchRewards,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}

