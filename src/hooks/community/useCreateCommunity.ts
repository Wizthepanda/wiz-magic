/**
 * useCreateCommunity Hook (Phase 6)
 * Mutation for creating a new community with cache invalidation
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCommunity } from '@/lib/api/communities';
import type { Community, CreateCommunityPayload } from '@/schemas/community';

export const useCreateCommunity = (
  options?: Omit<UseMutationOptions<Community, Error, CreateCommunityPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Community, Error, CreateCommunityPayload>({
    mutationFn: createCommunity,
    onSuccess: (data, variables) => {
      // Invalidate communities list to refetch
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'communities'] });

      // Optionally set the new community in cache
      queryClient.setQueryData(['community', data.id], data);

      toast.success('Community created successfully!');
      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error, variables) => {
      toast.error(`Failed to create community: ${error.message}`);
      options?.onError?.(error, variables, undefined);
    },
    ...options,
  });
};
