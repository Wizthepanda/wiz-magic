/**
 * useCommunities Hook (Phase 6)
 * Fetch and cache list of communities with filtering
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchCommunities } from '@/lib/api/communities';
import type { Community, CommunityFilter } from '@/schemas/community';

export const useCommunities = (
  filter: CommunityFilter = 'all',
  options?: Omit<UseQueryOptions<Community[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Community[], Error>({
    queryKey: ['communities', filter],
    queryFn: () => fetchCommunities(filter),
    ...options,
  });
};
