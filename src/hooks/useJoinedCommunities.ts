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
    if (!user) return;

    console.log('🔄 Setting up real-time listener for joined communities');

    const q = query(
      collection(db, 'communities'),
      where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const communities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as CommunityData[];

        console.log('✅ Communities updated via real-time listener:', communities.length);

        // Update React Query cache
        queryClient.setQueryData(['joinedCommunities', user.uid], communities);
      },
      (error) => {
        console.error('❌ Error in communities real-time listener:', error);
      }
    );

    return () => {
      console.log('🛑 Cleaning up real-time listener for communities');
      unsubscribe();
    };
  }, [user, queryClient]);

  return useQuery<CommunityData[]>({
    queryKey: ['joinedCommunities', user?.uid],
    queryFn: async () => {
      // This is only called on initial mount or cache invalidation
      // Real-time updates are handled by the onSnapshot listener above
      return [];
    },
    initialData: [],
    enabled: !!user,
    staleTime: Infinity, // Data stays fresh because we're using real-time updates
  });
};
