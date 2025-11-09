/**
 * Hook to fetch a creator's primary community
 * Used on Creator Profile pages to show Join Community button
 */

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreatorCommunity {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  zapsRequired?: number;
  usdCoPay?: number;
  offerZAPsToNewMembers?: boolean;
  newMemberZAPsReward?: number;
  waitlistOnly?: boolean;
  memberCount?: number;
  status?: string;
}

/**
 * Fetch the creator's primary (published) community
 */
export function useCreatorCommunity(creatorId?: string | null) {
  return useQuery({
    queryKey: ['creator-community', creatorId],
    queryFn: async (): Promise<CreatorCommunity | null> => {
      if (!creatorId) {
        return null;
      }

      try {
        // Query for published communities by this creator
        const communitiesQuery = query(
          collection(db, 'communities'),
          where('creatorId', '==', creatorId),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        const snapshot = await getDocs(communitiesQuery);

        if (snapshot.empty) {
          return null;
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        return {
          id: doc.id,
          title: data.title || 'Community',
          description: data.description,
          thumbnail: data.thumbnail,
          zapsRequired: data.zapsRequired || 0,
          usdCoPay: data.usdCoPay || 0,
          offerZAPsToNewMembers: data.offerZAPsToNewMembers || false,
          newMemberZAPsReward: data.newMemberZAPsReward || 0,
          waitlistOnly: data.waitlistOnly || false,
          memberCount: data.memberCount || 0,
          status: data.status,
        };
      } catch (error) {
        console.error('Error fetching creator community:', error);
        return null;
      }
    },
    enabled: !!creatorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
