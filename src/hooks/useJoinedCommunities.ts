import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface CommunityData {
  id: string;
  name: string;
  slug?: string;
  members: string[];
  [key: string]: any;
}

export const useJoinedCommunities = () => {
  const { user } = useAuth();

  return useQuery<CommunityData[]>({
    queryKey: ['joinedCommunities', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, 'communities'),
        where('members', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CommunityData[];
    },
    enabled: !!user,
  });
};
