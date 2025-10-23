/**
 * useUpdateCommunity Hook (Phase 6)
 * Mutation for updating community with optimistic updates
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateCommunity } from '@/lib/api/communities';
import type { Community, UpdateCommunityPayload } from '@/schemas/community';

export const useUpdateCommunity = (
  options?: Omit<UseMutationOptions<Community, Error, UpdateCommunityPayload>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<Community, Error, UpdateCommunityPayload>({
    mutationFn: updateCommunity,

    // Optimistic update before mutation
    onMutate: async (payload) => {
      const { id } = payload;

      // Cancel outgoing queries for this community
      await queryClient.cancelQueries({ queryKey: ['community', id] });

      // Snapshot previous value
      const previousCommunity = queryClient.getQueryData<Community>(['community', id]);

      // Optimistically update to the new value
      if (previousCommunity) {
        queryClient.setQueryData<Community>(['community', id], (old) => ({
          ...old!,
          ...payload,
          updatedAt: new Date().toISOString(),
        }));
      }

      // Return context with snapshot
      return { previousCommunity, id };
    },

    // If mutation fails, rollback using context
    onError: (error, variables, context) => {
      if (context?.previousCommunity) {
        queryClient.setQueryData(['community', context.id], context.previousCommunity);
      }
      toast.error(`Failed to update community: ${error.message}`);
      options?.onError?.(error, variables, context);
    },

    // Always refetch after error or success
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['community', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'communities'] });
      options?.onSettled?.(data, error, variables, context);
    },

    onSuccess: (data, variables, context) => {
      toast.success('Community updated successfully!');
      options?.onSuccess?.(data, variables, context);
    },

    ...options,
  });
};
