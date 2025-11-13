import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTopCommunityPosts } from '@/hooks/useTopCommunityPosts';
import { PostCard } from './PostCard';
import { FeedControls } from './FeedControls';
import { cn } from '@/lib/utils';
import { Post } from '@/lib/firestore/queries';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, deleteDoc, runTransaction, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CommunityFeedContainerProps {
  communityIds?: string[];
  className?: string;
  onVideoPlay?: (post: Post) => void;
}

/**
 * CommunityFeedContainer
 * Main container for single-post community feed
 * - Shows one post at a time
 * - Supports keyboard navigation (←/→)
 * - Auto-prefetches next posts for instant transitions
 * - Handles all engagement actions (vote, save, share, comment)
 */
export const CommunityFeedContainer: React.FC<CommunityFeedContainerProps> = ({
  communityIds,
  className,
  onVideoPlay,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Fetch posts using React Query hook
  const { posts, isLoading, isError, hasMore, fetchNext, prefetchNext, refetch } =
    useTopCommunityPosts({
      communityIds,
      limit: 50,
    });

  const currentPost = posts[currentIndex];

  // Load user's saved posts and votes from localStorage on mount
  useEffect(() => {
    if (!user) return;

    const savedKey = `saved-posts-${user.uid}`;
    const votesKey = `post-votes-${user.uid}`;

    const saved = localStorage.getItem(savedKey);
    const votes = localStorage.getItem(votesKey);

    if (saved) {
      try {
        setSavedPosts(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved posts:', e);
      }
    }

    if (votes) {
      try {
        setUserVotes(JSON.parse(votes));
      } catch (e) {
        console.error('Error loading votes:', e);
      }
    }
  }, [user?.uid]);

  // Prefetch next posts when viewing current post
  useEffect(() => {
    if (currentIndex >= posts.length - 3 && hasMore) {
      prefetchNext();
    }
  }, [currentIndex, posts.length, hasMore, prefetchNext]);

  // Auto-fetch more posts when approaching end
  useEffect(() => {
    if (currentIndex >= posts.length - 5 && hasMore) {
      fetchNext();
    }
  }, [currentIndex, posts.length, hasMore, fetchNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, posts.length]);

  // Focus management for accessibility
  useEffect(() => {
    if (containerRef.current) {
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, posts.length]);

  const handleUpvote = useCallback(
    async (postId: string) => {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to vote on posts',
          variant: 'destructive',
        });
        return;
      }

      const currentVote = userVotes[postId];
      const newVote = currentVote === 'up' ? null : 'up';

      // Optimistic update
      setUserVotes((prev) => ({ ...prev, [postId]: newVote }));

      try {
        const postRef = doc(db, 'posts', postId);
        const voteRef = doc(db, 'posts', postId, 'votes', user.uid);

        await runTransaction(db, async (transaction) => {
          const postDoc = await transaction.get(postRef);
          if (!postDoc.exists()) throw new Error('Post not found');

          if (currentVote === 'up') {
            // Remove upvote
            transaction.update(postRef, { upvotes: increment(-1), score: increment(-1) });
            transaction.delete(voteRef);
          } else if (currentVote === 'down') {
            // Switch from downvote to upvote
            transaction.update(postRef, {
              upvotes: increment(1),
              downvotes: increment(-1),
              score: increment(2),
            });
            transaction.set(voteRef, { vote: 'up', timestamp: new Date() });
          } else {
            // New upvote
            transaction.update(postRef, { upvotes: increment(1), score: increment(1) });
            transaction.set(voteRef, { vote: 'up', timestamp: new Date() });
          }
        });

        // Save to localStorage
        const votesKey = `post-votes-${user.uid}`;
        localStorage.setItem(votesKey, JSON.stringify({ ...userVotes, [postId]: newVote }));
      } catch (error) {
        console.error('Error voting:', error);
        // Revert optimistic update
        setUserVotes((prev) => ({ ...prev, [postId]: currentVote }));
        toast({
          title: 'Error',
          description: 'Failed to vote on post',
          variant: 'destructive',
        });
      }
    },
    [user, userVotes, toast]
  );

  const handleDownvote = useCallback(
    async (postId: string) => {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to vote on posts',
          variant: 'destructive',
        });
        return;
      }

      const currentVote = userVotes[postId];
      const newVote = currentVote === 'down' ? null : 'down';

      // Optimistic update
      setUserVotes((prev) => ({ ...prev, [postId]: newVote }));

      try {
        const postRef = doc(db, 'posts', postId);
        const voteRef = doc(db, 'posts', postId, 'votes', user.uid);

        await runTransaction(db, async (transaction) => {
          const postDoc = await transaction.get(postRef);
          if (!postDoc.exists()) throw new Error('Post not found');

          if (currentVote === 'down') {
            // Remove downvote
            transaction.update(postRef, { downvotes: increment(-1), score: increment(1) });
            transaction.delete(voteRef);
          } else if (currentVote === 'up') {
            // Switch from upvote to downvote
            transaction.update(postRef, {
              upvotes: increment(-1),
              downvotes: increment(1),
              score: increment(-2),
            });
            transaction.set(voteRef, { vote: 'down', timestamp: new Date() });
          } else {
            // New downvote
            transaction.update(postRef, { downvotes: increment(1), score: increment(-1) });
            transaction.set(voteRef, { vote: 'down', timestamp: new Date() });
          }
        });

        // Save to localStorage
        const votesKey = `post-votes-${user.uid}`;
        localStorage.setItem(votesKey, JSON.stringify({ ...userVotes, [postId]: newVote }));
      } catch (error) {
        console.error('Error voting:', error);
        // Revert optimistic update
        setUserVotes((prev) => ({ ...prev, [postId]: currentVote }));
        toast({
          title: 'Error',
          description: 'Failed to vote on post',
          variant: 'destructive',
        });
      }
    },
    [user, userVotes, toast]
  );

  const handleSave = useCallback(
    async (postId: string) => {
      if (!user) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to save posts',
          variant: 'destructive',
        });
        return;
      }

      const isSaved = savedPosts[postId];
      const newSavedState = !isSaved;

      // Optimistic update
      setSavedPosts((prev) => ({ ...prev, [postId]: newSavedState }));

      try {
        const saveRef = doc(db, 'users', user.uid, 'saves', postId);

        if (newSavedState) {
          await setDoc(saveRef, { postId, savedAt: new Date() });
          toast({
            title: 'Post saved',
            description: 'You can find this in your saved posts',
          });
        } else {
          await deleteDoc(saveRef);
          toast({
            title: 'Post unsaved',
          });
        }

        // Save to localStorage
        const savedKey = `saved-posts-${user.uid}`;
        localStorage.setItem(savedKey, JSON.stringify({ ...savedPosts, [postId]: newSavedState }));
      } catch (error) {
        console.error('Error saving post:', error);
        // Revert optimistic update
        setSavedPosts((prev) => ({ ...prev, [postId]: isSaved }));
        toast({
          title: 'Error',
          description: 'Failed to save post',
          variant: 'destructive',
        });
      }
    },
    [user, savedPosts, toast]
  );

  const handleShare = useCallback((postId: string) => {
    const url = `${window.location.origin}/post/${postId}`;
    setShareUrl(url);
    setShareDialogOpen(true);
  }, []);

  const handleCopyShareLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share link copied to clipboard',
    });
    setShareDialogOpen(false);
  }, [shareUrl, toast]);

  const handleComment = useCallback((postId: string) => {
    // TODO: Open comment composer/dialog
    toast({
      title: 'Comments',
      description: 'Comment feature coming soon!',
    });
  }, [toast]);

  const handleCommunityClick = useCallback(
    (communityId: string) => {
      navigate(`/community/${communityId}`);
    },
    [navigate]
  );

  const handleCreatorClick = useCallback(
    (creatorId: string) => {
      navigate(`/profile/${creatorId}`);
    },
    [navigate]
  );

  const handleMediaClick = useCallback(
    (post: Post) => {
      onVideoPlay?.(post);
    },
    [onVideoPlay]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 dark:text-red-400">Failed to load posts</p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 dark:text-gray-400">No posts available</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8', className)}
      role="feed"
      aria-label="Community feed"
    >
      {/* Single Post Card */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          {currentPost && (
            <PostCard
              key={currentPost.id}
              post={currentPost}
              onCommunityClick={handleCommunityClick}
              onCreatorClick={handleCreatorClick}
              onMediaClick={handleMediaClick}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onComment={handleComment}
              onShare={handleShare}
              onSave={handleSave}
              userVote={userVotes[currentPost.id] || null}
              isSaved={savedPosts[currentPost.id] || false}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <FeedControls
        currentIndex={currentIndex}
        totalPosts={posts.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={currentIndex > 0}
        canGoNext={currentIndex < posts.length - 1}
        className="mb-8"
      />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>Share this post with your friends</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={handleCopyShareLink}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
