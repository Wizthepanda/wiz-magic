/**
 * PostCard - Reddit-style post card with voting and comments
 * Luxury minimal design with threaded comments
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel?: number;
  content: string;
  title?: string;
  media?: string[];
  createdAt: any;
  pinned?: boolean;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: 'up' | 'down' | null;
}

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, vote: 'up' | 'down') => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  isMember?: boolean;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onVote,
  onComment,
  onShare,
  isMember = false,
  className,
}) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [localVote, setLocalVote] = useState<'up' | 'down' | null>(post.userVote || null);

  const netVotes = post.upvotes - post.downvotes;

  const handleVote = (vote: 'up' | 'down') => {
    if (!user || !isMember) return;

    // Toggle vote if clicking same button, otherwise switch
    const newVote = localVote === vote ? null : vote;
    setLocalVote(newVote);
    if (onVote) onVote(post.id, vote);
  };

  const handleShare = () => {
    if (onShare) onShare(post.id);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative',
        'bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md',
        'border border-zinc-200/50 dark:border-zinc-700/50',
        'rounded-2xl overflow-hidden',
        'shadow-sm hover:shadow-md',
        'transition-all duration-300',
        className
      )}
    >
      {/* Pinned Badge */}
      {post.pinned && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      )}

      <div className="flex gap-4 p-5">
        {/* Left: Voting Column */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button
            onClick={() => handleVote('up')}
            disabled={!user || !isMember}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              'hover:bg-orange-100 dark:hover:bg-orange-900/20',
              localVote === 'up'
                ? 'text-orange-500'
                : 'text-zinc-400 dark:text-zinc-600',
              !user || !isMember ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            )}
            aria-label="Upvote"
          >
            <ArrowBigUp
              className={cn(
                'w-6 h-6 transition-transform',
                localVote === 'up' && 'scale-110'
              )}
              fill={localVote === 'up' ? 'currentColor' : 'none'}
            />
          </button>

          <span
            className={cn(
              'text-sm font-semibold tabular-nums',
              netVotes > 0 && 'text-orange-600 dark:text-orange-400',
              netVotes < 0 && 'text-blue-600 dark:text-blue-400',
              netVotes === 0 && 'text-zinc-500 dark:text-zinc-400'
            )}
          >
            {netVotes > 0 ? `+${netVotes}` : netVotes}
          </span>

          <button
            onClick={() => handleVote('down')}
            disabled={!user || !isMember}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              'hover:bg-blue-100 dark:hover:bg-blue-900/20',
              localVote === 'down'
                ? 'text-blue-500'
                : 'text-zinc-400 dark:text-zinc-600',
              !user || !isMember ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            )}
            aria-label="Downvote"
          >
            <ArrowBigDown
              className={cn(
                'w-6 h-6 transition-transform',
                localVote === 'down' && 'scale-110'
              )}
              fill={localVote === 'down' ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50 dark:ring-zinc-700/50"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                {post.authorName}
              </span>
              {post.authorLevel && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium">
                  Lvl {post.authorLevel}
                </span>
              )}
              {post.pinned && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
                  Pinned
                </span>
              )}
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatTimestamp(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Post Title */}
          {post.title && (
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              {post.title}
            </h3>
          )}

          {/* Post Content */}
          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed mb-3">
            {post.content}
          </p>

          {/* Post Media */}
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {post.media.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Post media ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group/comment"
            >
              <MessageSquare className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover/comment:text-indigo-600 dark:group-hover/comment:text-indigo-400 transition-colors" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover/comment:text-zinc-900 dark:group-hover/comment:text-white">
                {post.commentCount > 0 ? `${post.commentCount} Comments` : 'Comment'}
              </span>
              {showComments ? (
                <ChevronUp className="w-3 h-3 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors group/share"
            >
              <Share2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover/share:text-indigo-600 dark:group-hover/share:text-indigo-400 transition-colors" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover/share:text-zinc-900 dark:group-hover/share:text-white">
                Share
              </span>
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700"
              >
                {isMember ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                      rows={2}
                    />
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-violet-600 transition-colors">
                      Post Comment
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 px-4 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
                      Join this community to comment
                    </p>
                    <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      Join Community →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
