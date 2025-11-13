import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export interface CommunityData {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  members: string[];
  profileIcon?: string;
  iconUrl?: string;
  avatarUrl?: string;
  banner?: string;
  coverMedia?: Array<{ url: string; thumbnail?: string }>;
  memberCount?: number;
  [key: string]: any;
}

export const useJoinedCommunities = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time listener for communities
  useEffect(() => {
    if (!user?.uid) {
      console.warn('[joinedCommunities] skip subscribe: missing user uid');
      return;
    }

    const uid = user.uid;
    console.log('🔄 Setting up real-time listener for joined communities', { uid, path: `communities (where members contains ${uid})` });

    const q = query(
      collection(db, 'communities'),
      where('members', 'array-contains', uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const communities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CommunityData[];

        console.log('✅ Communities updated via real-time listener:', communities.length);

        // Update React Query cache with stable key
        queryClient.setQueryData(['joinedCommunities', uid], communities);
      },
      (error) => {
        console.error('❌ Error in communities real-time listener:', error);
      }
    );

    return () => {
      console.log('🛑 Cleaning up real-time listener for communities', { uid });
      unsubscribe();
    };
  }, [user?.uid, queryClient]);

  return useQuery<CommunityData[]>({
    queryKey: ['joinedCommunities', user?.uid],
    queryFn: async () => {
      // This is only called on initial mount or cache invalidation
      // Real-time updates are handled by the onSnapshot listener above
      return [];
    },
    initialData: [],
    enabled: !!user?.uid,
    staleTime: Infinity, // Data stays fresh because we're using real-time updates
  });
};
