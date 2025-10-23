/**
 * useJoinCommunity Hook (Phase 6)
 * Mutation for joining a community with optimistic member count update
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { joinCommunity } from '@/lib/api/communities';
import type { Community, JoinCommunityPayload, ApiResponse } from '@/schemas/community';

interface JoinCommunityVariables {
  id: string;
  payload: JoinCommunityPayload;
}

export const useJoinCommunity = (
  options?: Omit<UseMutationOptions<ApiResponse, Error, JoinCommunityVariables>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, JoinCommunityVariables>({
    mutationFn: ({ id, payload }) => joinCommunity(id, payload),

    // Optimistic update - increment member count
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['community', id] });

      const previousCommunity = queryClient.getQueryData<Community>(['community', id]);

      if (previousCommunity) {
        queryClient.setQueryData<Community>(['community', id], (old) => ({
          ...old!,
          stats: {
            ...old!.stats,
            members: old!.stats.members + 1,
            slotsAvailable: old!.stats.slotsAvailable ? old!.stats.slotsAvailable - 1 : null,
          },
        }));
      }

      return { previousCommunity, id };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCommunity) {
        queryClient.setQueryData(['community', context.id], context.previousCommunity);
      }
      toast.error(`Failed to join community: ${error.message}`);
      options?.onError?.(error, variables, context);
    },

    onSuccess: (data, variables, context) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['community', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'communities'] });

      toast.success('Successfully joined community!');
      options?.onSuccess?.(data, variables, context);
    },

    ...options,
  });
};
