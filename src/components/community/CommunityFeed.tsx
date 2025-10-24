import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PostComposer } from './PostComposer';
import { PinnedPostBar } from './PinnedPostBar';
import { PostCardEnhanced } from './PostCardEnhanced';
import type { Post, Reply } from './Placeholders';

interface CommunityFeedProps {
  posts: Post[];
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
  posts: initialPosts,
  communityId,
  currentUserId,
  isCreatorOrMod = false,
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [sortType, setSortType] = useState<SortType>('pinned');

  // Handle new post submission
  const handleNewPost = (content: string, embedUrl?: string, attachments?: File[]) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: 'current-user',
      authorName: 'You',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      authorLevel: 12,
      content,
      embedUrl,
      embedPreview: embedUrl
        ? {
            title: 'Video Preview',
            thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop',
            provider: 'YouTube',
          }
        : undefined,
      attachments: attachments?.map((file) => ({
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: URL.createObjectURL(file),
        name: file.name,
      })),
      isPinned: false,
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      reactions: {},
      userReactions: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  // Filter and sort posts
  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);

  const getSortedPosts = () => {
    let sorted = [...regularPosts];

    switch (sortType) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'top':
        sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'pinned':
      default:
        // Keep pinned first (already separated), then recent
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const currentVote = post.userVote;
        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Toggle vote or switch vote
        if (currentVote === voteType) {
          // Remove vote
          newUserVote = null;
          if (voteType === 'up') newUpvotes--;
          else newDownvotes--;
        } else if (currentVote) {
          // Switch vote
          if (currentVote === 'up') newUpvotes--;
          else newDownvotes--;
          if (voteType === 'up') newUpvotes++;
          else newDownvotes++;
        } else {
          // New vote
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
  };

  const handleReact = (postId: string, emoji: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const hasReacted = post.userReactions.includes(emoji);
        const newReactions = { ...post.reactions };
        const newUserReactions = [...post.userReactions];

        if (hasReacted) {
          // Remove reaction
          newReactions[emoji] = (newReactions[emoji] || 1) - 1;
          if (newReactions[emoji] <= 0) delete newReactions[emoji];
          const index = newUserReactions.indexOf(emoji);
          if (index > -1) newUserReactions.splice(index, 1);
        } else {
          // Add reaction
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
  };

  const handlePin = (postId: string) => {
    setPosts((prevPosts) => {
      const pinnedCount = prevPosts.filter((p) => p.isPinned).length;

      return prevPosts.map((post) => {
        if (post.id !== postId) return post;

        // If trying to pin and already at max (3), don't pin
        if (!post.isPinned && pinnedCount >= 3) {
          return post;
        }

        return {
          ...post,
          isPinned: !post.isPinned,
        };
      });
    });
  };

  const handleReply = (postId: string, content: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const newReply: Reply = {
          id: `reply-${Date.now()}`,
          authorId: currentUserId || 'current-user',
          authorName: 'You',
          authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
          authorLevel: 12,
          content,
          upvotes: 0,
          downvotes: 0,
          userVote: null,
          createdAt: new Date().toISOString(),
        };

        return {
          ...post,
          replies: [...(post.replies || []), newReply],
          commentCount: (post.replies?.length || 0) + 1,
        };
      })
    );
  };

  const handleReplyVote = (postId: string, replyId: string, voteType: 'up' | 'down') => {
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

            // Toggle vote or switch vote
            if (currentVote === voteType) {
              // Remove vote
              newUserVote = null;
              if (voteType === 'up') newUpvotes--;
              else newDownvotes--;
            } else if (currentVote) {
              // Switch vote
              if (currentVote === 'up') newUpvotes--;
              else newDownvotes--;
              if (voteType === 'up') newUpvotes++;
              else newDownvotes++;
            } else {
              // New vote
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
  };

  return (
    <div className="max-w-4xl mx-auto overflow-visible">
      {/* Post Composer (Phase 2) */}
      <PostComposer
        onPost={handleNewPost}
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
