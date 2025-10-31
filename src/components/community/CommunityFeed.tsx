import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PostComposer } from './PostComposer';
import { PinnedPostBar } from './PinnedPostBar';
import { PostCardEnhanced } from './PostCardEnhanced';
import type { Post, Reply } from './Placeholders';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { uploadPostImage, validateImageFile } from '@/lib/storage-utils';
import { useToast } from '@/hooks/use-toast';

interface CommunityFeedProps {
  communityId: string;
  currentUserId?: string;
  isCreatorOrMod?: boolean;
}

type SortType = 'recent' | 'top' | 'pinned';

/**
 * Community Feed Component (Phase 2 Complete)
 * - Post composer with rich text, emoji picker, and video embeds
 * - Displays feed of posts with Reddit-style ranking
 * - Pinned posts bar at top (up to 3)
 * - Sorting options (Recent, Top, Pinned first)
 * - Smooth animations with Framer Motion
 */
export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  communityId,
  currentUserId,
  isCreatorOrMod = false,
}) => {
  const { user } = useAuth();
  const { profile } = useUserProfile(); // Get fresh cached profile data
  const { toast } = useToast();
  const [sortType, setSortType] = useState<SortType>('pinned');

  // Use the community posts hook for persistence
  const {
    posts,
    pinnedPosts: hookPinnedPosts,
    unpinnedPosts: hookUnpinnedPosts,
    loading,
    createPost,
    togglePinPost,
    votePost,
    reactToPost,
    addReply,
    voteReply,
    deletePost,
  } = useCommunityPosts({ communityId, enableCache: true });

  // Handle new post submission with image upload
  const handleNewPost = async (content: string, embedUrl?: string, attachments?: File[]) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to create a post.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let imageUrl: string | undefined;

      // Handle single image upload to Firebase Storage
      if (attachments && attachments.length > 0) {
        const imageFile = attachments.find(file => file.type.startsWith('image/'));

        if (imageFile) {
          // Validate image before upload
          const validationError = validateImageFile(imageFile);
          if (validationError) {
            toast({
              title: 'Invalid image',
              description: validationError,
              variant: 'destructive',
            });
            return;
          }

          // Upload to Firebase Storage
          try {
            imageUrl = await uploadPostImage(imageFile, user.uid);
          } catch (error) {
            console.error('Error uploading image:', error);
            toast({
              title: 'Upload failed',
              description: error instanceof Error ? error.message : 'Failed to upload image. Please try again.',
              variant: 'destructive',
            });
            return;
          }
        }
      }

      // Create post with imageUrl
      await createPost({
        content,
        imageUrl,
        embedUrl,
      });

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Failed to create post',
        description: 'There was an error creating your post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter and sort posts
  const pinnedPosts = hookPinnedPosts;
  const regularPosts = hookUnpinnedPosts;

  const getSortedPosts = () => {
    let sorted = [...regularPosts];

    switch (sortType) {
      case 'recent':
        sorted.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });
        break;
      case 'top':
        sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'pinned':
      default:
        // Keep pinned first (already separated), then recent
        sorted.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });
        break;
    }

    return sortType === 'pinned' ? [...pinnedPosts, ...sorted] : sorted;
  };

  const sortedPosts = getSortedPosts();

  const handleScrollToPost = (postId: string) => {
    const element = document.getElementById(`post-${postId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight effect
      element.classList.add('ring-4', 'ring-purple-400', 'ring-opacity-50');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-purple-400', 'ring-opacity-50');
      }, 2000);
    }
  };

  // Use hook methods for all operations
  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    votePost(postId, voteType);
  };

  const handleReact = (postId: string, emoji: string) => {
    reactToPost(postId, emoji);
  };

  const handlePin = (postId: string) => {
    togglePinPost(postId);
  };

  const handleReply = (postId: string, content: string) => {
    addReply(postId, content);
  };

  const handleReplyVote = (postId: string, replyId: string, voteType: 'up' | 'down') => {
    voteReply(postId, replyId, voteType);
  };

  const handleDelete = (postId: string) => {
    deletePost(postId);
  };

  // Show loading state on initial load
  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <PostComposer
          onPost={handleNewPost}
          userAvatar={profile?.photoURL || user?.photoURL || undefined}
          userName={profile?.displayName || user?.displayName || 'You'}
          placeholder="Share your thoughts with the community..."
        />

        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading community posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto overflow-visible">
      {/* Post Composer (Phase 2) */}
      <PostComposer
        onPost={handleNewPost}
        userAvatar={profile?.photoURL || user?.photoURL || undefined}
        userName={profile?.displayName || user?.displayName || 'You'}
        placeholder="Share your thoughts with the community..."
      />

      {/* Pinned Posts Bar */}
      {pinnedPosts.length > 0 && (
        <PinnedPostBar
          pinnedPosts={pinnedPosts}
          onPostClick={handleScrollToPost}
        />
      )}

      {/* Sort Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortType('pinned')}
            className={cn(
              'gap-2',
              sortType === 'pinned' && 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Pinned First
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortType('top')}
            className={cn(
              'gap-2',
              sortType === 'top' && 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Top
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortType('recent')}
            className={cn(
              'gap-2',
              sortType === 'recent' && 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            )}
          >
            <Clock className="w-4 h-4" />
            Recent
          </Button>
        </div>
      </div>

      {/* Posts Feed with Layout Animations */}
      <motion.div layout className="space-y-6 overflow-visible">
        <AnimatePresence mode="popLayout">
          {sortedPosts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-[1] text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20"
            >
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                No posts yet
              </p>
              <p className="text-gray-600">
                Be the first to share something with the community!
              </p>
            </motion.div>
          ) : (
            sortedPosts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <PostCardEnhanced
                  post={post}
                  onVote={handleVote}
                  onReact={handleReact}
                  onPin={handlePin}
                  onReply={handleReply}
                  onReplyVote={handleReplyVote}
                  onDelete={handleDelete}
                  currentUserId={currentUserId}
                  isCreatorOrMod={isCreatorOrMod}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Load More Placeholder */}
      {sortedPosts.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
};
