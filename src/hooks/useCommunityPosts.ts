import { useState, useEffect, useCallback } from 'react';
import { communityPostsService, CommunityPost, CreatePostData } from '@/lib/community-posts-service';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { userProfileService } from '@/lib/user-profile-service';

interface UseCommunityPostsOptions {
  communityId: string;
  enableCache?: boolean;
}

/**
 * Custom hook for managing community posts
 * - Fetches posts from Firebase
 * - Handles localStorage caching for performance
 * - Provides methods for all post operations
 * - Automatically refetches after mutations
 */
export const useCommunityPosts = ({ communityId, enableCache = true }: UseCommunityPostsOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_KEY = `community-posts-${communityId}`;
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  /**
   * Load posts from localStorage cache
   */
  const loadFromCache = useCallback((): CommunityPost[] | null => {
    if (!enableCache) return null;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

      if (isExpired) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }, [CACHE_KEY, enableCache]);

  /**
   * Save posts to localStorage cache
   */
  const saveToCache = useCallback((data: CommunityPost[]) => {
    if (!enableCache) return;

    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [CACHE_KEY, enableCache]);

  /**
   * Subscribe to real-time posts updates
   */
  const setupRealtimeListener = useCallback(() => {
    if (!communityId) {
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);

    // Try loading from cache first for instant UI
    const cachedPosts = loadFromCache();
    if (cachedPosts) {
      setPosts(cachedPosts);
      setLoading(false);
    }

    // Set up real-time listener
    const unsubscribe = communityPostsService.subscribeToPosts(
      communityId,
      user?.uid,
      (fetchedPosts) => {
        setPosts(fetchedPosts);
        saveToCache(fetchedPosts);
        setLoading(false);
        setError(null);
      }
    );

    return unsubscribe;
  }, [communityId, user?.uid, loadFromCache, saveToCache]);

  /**
   * Manual refetch (for backwards compatibility)
   */
  const fetchPosts = useCallback(async () => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchedPosts = await communityPostsService.getPosts(communityId, user?.uid);
      setPosts(fetchedPosts);
      saveToCache(fetchedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      toast({
        title: 'Error loading posts',
        description: 'Failed to load community posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [communityId, user?.uid, saveToCache, toast]);

  /**
   * Create a new post
   * Fetches fresh user profile from Firestore to ensure accurate avatar/name
   */
  const createPost = useCallback(async (data: CreatePostData) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create a post.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch fresh user profile from Firestore to get latest avatar/name
      const userProfile = await userProfileService.getUserProfile(user.uid, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      console.log('📝 Creating post with fresh user profile:', {
        displayName: userProfile.displayName,
        photoURL: userProfile.photoURL,
        level: userProfile.level,
      });

      const newPost = await communityPostsService.createPost(
        communityId,
        user.uid,
        userProfile.displayName,
        userProfile.photoURL,
        userProfile.level,
        data
      );

      // Optimistically update UI
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      saveToCache([newPost, ...posts]);

      toast({
        title: 'Post created!',
        description: 'Your post has been published to the community.',
      });

      // Refetch to ensure consistency
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Failed to create post',
        description: 'There was an error publishing your post. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, communityId, posts, fetchPosts, saveToCache, toast]);

  /**
   * Pin/Unpin a post
   */
  const togglePinPost = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to pin posts.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await communityPostsService.pinPost(communityId, postId, user.uid);

      if (!result.success) {
        toast({
          title: 'Cannot pin post',
          description: result.message || 'You can only pin up to 3 posts.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: result.message,
        description: result.message === 'Post pinned successfully'
          ? 'This post will appear at the top of the feed.'
          : 'This post has been unpinned.',
      });

      // Refetch posts to update UI
      await fetchPosts();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: 'Failed to update post',
        description: 'There was an error updating the post. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, communityId, fetchPosts, toast]);

  /**
   * Vote on a post
   */
  const votePost = useCallback(async (postId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to vote.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          const currentVote = post.userVote;
          let newUpvotes = post.upvotes;
          let newDownvotes = post.downvotes;
          let newUserVote: 'up' | 'down' | null = voteType;

          if (currentVote === voteType) {
            newUserVote = null;
            if (voteType === 'up') newUpvotes--;
            else newDownvotes--;
          } else if (currentVote) {
            if (currentVote === 'up') newUpvotes--;
            else newDownvotes--;
            if (voteType === 'up') newUpvotes++;
            else newDownvotes++;
          } else {
            if (voteType === 'up') newUpvotes++;
            else newDownvotes++;
          }

          return {
            ...post,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote,
          };
        })
      );

      // Update backend
      await communityPostsService.votePost(communityId, postId, user.uid, voteType);
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      await fetchPosts();
      toast({
        title: 'Failed to vote',
        description: 'There was an error processing your vote. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, communityId, fetchPosts, toast]);

  /**
   * React to a post
   */
  const reactToPost = useCallback(async (postId: string, emoji: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to react.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          const hasReacted = post.userReactions.includes(emoji);
          const newReactions = { ...post.reactions };
          const newUserReactions = [...post.userReactions];

          if (hasReacted) {
            newReactions[emoji] = (newReactions[emoji] || 1) - 1;
            if (newReactions[emoji] <= 0) delete newReactions[emoji];
            const index = newUserReactions.indexOf(emoji);
            if (index > -1) newUserReactions.splice(index, 1);
          } else {
            newReactions[emoji] = (newReactions[emoji] || 0) + 1;
            newUserReactions.push(emoji);
          }

          return {
            ...post,
            reactions: newReactions,
            userReactions: newUserReactions,
          };
        })
      );

      // Update backend
      await communityPostsService.reactToPost(communityId, postId, user.uid, emoji);
    } catch (error) {
      console.error('Error reacting:', error);
      // Revert optimistic update on error
      await fetchPosts();
      toast({
        title: 'Failed to react',
        description: 'There was an error adding your reaction. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, communityId, fetchPosts, toast]);

  /**
   * Add a reply to a post
   * Fetches fresh user profile from Firestore to ensure accurate avatar/name
   */
  const addReply = useCallback(async (postId: string, content: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to reply.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch fresh user profile from Firestore to get latest avatar/name
      const userProfile = await userProfileService.getUserProfile(user.uid, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      const newReply = await communityPostsService.addReply(
        communityId,
        postId,
        user.uid,
        userProfile.displayName,
        userProfile.photoURL,
        userProfile.level,
        content
      );

      // Update UI
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            replies: [...(post.replies || []), newReply],
            commentCount: (post.commentCount || 0) + 1,
          };
        })
      );

      toast({
        title: 'Reply added!',
        description: 'Your reply has been posted.',
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Failed to reply',
        description: 'There was an error posting your reply. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, communityId, toast]);

  /**
   * Vote on a reply
   */
  const voteReply = useCallback(async (postId: string, replyId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to vote.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            replies: post.replies?.map((reply) => {
              if (reply.id !== replyId) return reply;

              const currentVote = reply.userVote;
              let newUpvotes = reply.upvotes;
              let newDownvotes = reply.downvotes;
              let newUserVote: 'up' | 'down' | null = voteType;

              if (currentVote === voteType) {
                newUserVote = null;
                if (voteType === 'up') newUpvotes--;
                else newDownvotes--;
              } else if (currentVote) {
                if (currentVote === 'up') newUpvotes--;
                else newDownvotes--;
                if (voteType === 'up') newUpvotes++;
                else newDownvotes++;
              } else {
                if (voteType === 'up') newUpvotes++;
                else newDownvotes++;
              }

              return {
                ...reply,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                userVote: newUserVote,
              };
            }),
          };
        })
      );

      // Update backend
      await communityPostsService.voteReply(communityId, postId, replyId, user.uid, voteType);
    } catch (error) {
      console.error('Error voting on reply:', error);
      // Revert optimistic update on error
      await fetchPosts();
      toast({
        title: 'Failed to vote',
        description: 'There was an error processing your vote. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, communityId, fetchPosts, toast]);

  /**
   * Delete a post
   */
  const deletePost = useCallback(async (postId: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to delete posts.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await communityPostsService.deletePost(communityId, postId, user.uid);

      if (!result.success) {
        toast({
          title: 'Cannot delete post',
          description: result.message || 'You do not have permission to delete this post.',
          variant: 'destructive',
        });
        return;
      }

      // Remove from UI
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

      toast({
        title: 'Post deleted',
        description: 'The post has been removed from the community.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Failed to delete post',
        description: 'There was an error deleting the post. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, communityId, toast]);

  // Set up real-time listener on mount and clean up on unmount
  useEffect(() => {
    const unsubscribe = setupRealtimeListener();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [setupRealtimeListener]);

  // Save to cache whenever posts change
  useEffect(() => {
    if (posts.length > 0) {
      saveToCache(posts);
    }
  }, [posts, saveToCache]);

  // Separate pinned and unpinned posts
  const pinnedPosts = posts.filter((post) => post.isPinned);
  const unpinnedPosts = posts.filter((post) => !post.isPinned);

  return {
    posts,
    pinnedPosts,
    unpinnedPosts,
    loading,
    error,
    createPost,
    togglePinPost,
    votePost,
    reactToPost,
    addReply,
    voteReply,
    deletePost,
    refetch: fetchPosts,
  };
};
