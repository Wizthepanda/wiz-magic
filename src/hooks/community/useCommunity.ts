/**
 * useCommunity Hook (Phase 6)
 * Fetch and cache a single community by ID
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchCommunity } from '@/lib/api/communities';
import type { Community } from '@/schemas/community';

export const useCommunity = (
  id: string,
  options?: Omit<UseQueryOptions<Community, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Community, Error>({
    queryKey: ['community', id],
    queryFn: () => fetchCommunity(id),
    enabled: !!id, // Only run if ID exists
    ...options,
  });
};
