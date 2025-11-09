/**
 * Hook to fetch ALL of a creator's published communities
 * Used for the Communities tab on Creator Profile
 */

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunityItem } from '@/components/creator/CommunityList';

/**
 * Fetch all published communities by this creator
 */
export function useCreatorCommunities(creatorId?: string | null) {
  return useQuery({
    queryKey: ['creator-communities', creatorId],
    queryFn: async (): Promise<CommunityItem[]> => {
      if (!creatorId) {
        return [];
      }

      try {
        // Query for all published communities by this creator
        const communitiesQuery = query(
          collection(db, 'communities'),
          where('creatorId', '==', creatorId),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(communitiesQuery);

        const communities: CommunityItem[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          communities.push({
            id: doc.id,
            title: data.title || 'Community',
            description: data.description,
            thumbnail: data.thumbnail,
            memberCount: data.memberCount || 0,
            zapsRequired: data.zapsRequired || 0,
            usdCoPay: data.usdCoPay || 0,
            offerZAPsToNewMembers: data.offerZAPsToNewMembers || false,
            newMemberZAPsReward: data.newMemberZAPsReward || 0,
            waitlistOnly: data.waitlistOnly || false,
            hasCourse: data.hasCourse || false,
          });
        });

        return communities;
      } catch (error) {
        console.error('Error fetching creator communities:', error);
        return [];
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
