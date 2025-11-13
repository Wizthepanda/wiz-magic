import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Eye,
  Zap,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Post } from '@/lib/firestore/queries';
import confetti from 'canvas-confetti';

interface PostCardProps {
  post: Post;
  onCommunityClick?: (communityId: string) => void;
  onCreatorClick?: (creatorId: string) => void;
  onMediaClick?: (post: Post) => void;
  onUpvote?: (postId: string) => void;
  onDownvote?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  userVote?: 'up' | 'down' | null;
  isSaved?: boolean;
}

/**
 * PostCard Component
 * Single-post card with full community-centric UI
 * Includes media, engagement actions, and community info
 */
export const PostCard: React.FC<PostCardProps> = ({
  post,
  onCommunityClick,
  onCreatorClick,
  onMediaClick,
  onUpvote,
  onDownvote,
  onComment,
  onShare,
  onSave,
  userVote = null,
  isSaved = false,
}) => {
  const [mediaHovered, setMediaHovered] = useState(false);
  const [votePulse, setVotePulse] = useState(false);

  const handleUpvote = () => {
    onUpvote?.(post.id);

    // Trigger confetti animation on upvote
    if (userVote !== 'up') {
      setVotePulse(true);
      setTimeout(() => setVotePulse(false), 500);

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
      });
    }
  };

  const handleDownvote = () => {
    onDownvote?.(post.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -10 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'max-w-3xl mx-auto w-full',
        'rounded-2xl overflow-hidden',
        'bg-white/70 dark:bg-slate-900/95',
        'backdrop-blur-lg',
        'shadow-xl',
        'border border-white/30 dark:border-slate-700/50',
        'p-6'
      )}
    >
      {/* Community Badge - Top Left */}
      <motion.button
        onClick={() => onCommunityClick?.(post.communityId)}
        className={cn(
          'flex items-center gap-3 mb-4 p-3 rounded-full',
          'bg-gradient-to-r from-violet-50 to-purple-50',
          'dark:from-violet-950/30 dark:to-purple-950/30',
          'hover:from-violet-100 hover:to-purple-100',
          'dark:hover:from-violet-900/40 dark:hover:to-purple-900/40',
          'transition-all duration-300',
          'border border-violet-200/50 dark:border-violet-800/50'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Visit ${post.communityName} community`}
      >
        <Avatar className="h-10 w-10 ring-2 ring-violet-200 dark:ring-violet-800">
          <AvatarImage src={post.communityAvatar} alt={post.communityName} />
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-bold">
            {post.communityName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {post.communityName}
            </p>
            {post.communityVerified && (
              <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 fill-current" />
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-3 h-3" />
            <span>{post.communityMemberCount.toLocaleString()} members</span>
          </div>
        </div>
      </motion.button>

      {/* Media Content */}
      {post.media.type === 'video' && post.media.thumbnail && (
        <motion.div
          className="relative mb-4 rounded-xl overflow-hidden cursor-pointer group aspect-video"
          onMouseEnter={() => setMediaHovered(true)}
          onMouseLeave={() => setMediaHovered(false)}
          onClick={() => onMediaClick?.(post)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          role="button"
          aria-label="Play video"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onMediaClick?.(post);
            }
          }}
        >
          <img
            src={post.media.thumbnail}
            alt={post.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            )}
          />

          {/* Play button */}
          <AnimatePresence>
            {mediaHovered && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={cn(
                    'w-20 h-20 rounded-full',
                    'bg-white/95 dark:bg-gray-900/95',
                    'backdrop-blur-xl',
                    'flex items-center justify-center',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
                    'border-4 border-white/50 dark:border-gray-800/50'
                  )}
                >
                  <Play className="w-8 h-8 text-violet-600 dark:text-violet-400 fill-current ml-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration badge */}
          {post.media.duration && (
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm">
              <span className="text-sm font-medium text-white">{post.media.duration}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Post Title & Excerpt */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {post.excerpt}
          </p>
        )}
      </div>

      {/* Creator Info */}
      <motion.button
        onClick={() => onCreatorClick?.(post.authorId)}
        className={cn(
          'flex items-center gap-3 mb-4 p-2 rounded-lg',
          'hover:bg-gray-50 dark:hover:bg-gray-800/50',
          'transition-colors duration-200'
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        aria-label={`View ${post.authorName}'s profile`}
      >
        <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-700">
          <AvatarImage src={post.authorAvatar} alt={post.authorName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs">
            {post.authorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="text-left">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {post.authorName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            @{post.authorUsername} • Level {post.authorLevel}
          </p>
        </div>
      </motion.button>

      {/* Engagement Row */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Score pill with upvote/downvote */}
        <div className="flex items-center gap-2">
          {/* Upvote */}
          <motion.button
            onClick={handleUpvote}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full',
              'transition-all duration-300',
              userVote === 'up'
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={votePulse ? { scale: [1, 1.2, 1] } : {}}
            aria-label="Upvote post"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            <span className="font-bold">{post.upvotes.toLocaleString()}</span>
          </motion.button>

          {/* Downvote */}
          <motion.button
            onClick={handleDownvote}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full',
              'transition-all duration-300',
              userVote === 'down'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Downvote post"
          >
            <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
            <span className="font-bold">{post.downvotes.toLocaleString()}</span>
          </motion.button>

          {/* ZAPs reward pill */}
          {post.zapsReward && (
            <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-3 py-1">
              <Zap className="w-3 h-3 mr-1 fill-current" />
              +{post.zapsReward}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Comment */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment?.(post.id)}
            className="inline-flex items-center gap-2"
            aria-label={`${post.commentsCount} comments`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{post.commentsCount}</span>
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShare?.(post.id)}
            className="inline-flex items-center gap-2"
            aria-label="Share post"
          >
            <Share2 className="w-4 h-4" />
          </Button>

          {/* Save */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave?.(post.id)}
            className={cn(
              'inline-flex items-center gap-2',
              isSaved && 'text-violet-600 dark:text-violet-400'
            )}
            aria-label={isSaved ? 'Unsave post' : 'Save post'}
            aria-pressed={isSaved}
          >
            <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
          </Button>
        </div>
      </div>
    </motion.article>
  );
};
