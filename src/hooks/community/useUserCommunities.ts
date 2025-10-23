/**
 * useUserCommunities Hook (Phase 6)
 * Fetch user's communities (created + joined)
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchUserCommunities } from '@/lib/api/communities';
import type { Community } from '@/schemas/community';

export const useUserCommunities = (
  userId: string,
  options?: Omit<UseQueryOptions<Community[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Community[], Error>({
    queryKey: ['user', userId, 'communities'],
    queryFn: () => fetchUserCommunities(userId),
    enabled: !!userId,
    ...options,
  });
};
