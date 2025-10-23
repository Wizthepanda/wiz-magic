/**
 * useMembers Hook (Phase 6)
 * Fetch and cache community members
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchMembers } from '@/lib/api/communities';
import type { Member } from '@/schemas/community';

export const useMembers = (
  communityId: string,
  options?: Omit<UseQueryOptions<Member[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Member[], Error>({
    queryKey: ['members', communityId],
    queryFn: () => fetchMembers(communityId),
    enabled: !!communityId,
    ...options,
  });
};
