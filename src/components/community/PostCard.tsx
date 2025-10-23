import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Pin,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Post } from './Placeholders';

interface PostCardProps {
  post: Post;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onReact?: (postId: string, emoji: string) => void;
}

/**
 * Post Card Component
 * - Displays individual post with author, content, attachments
 * - Upvote/downvote functionality
 * - Emoji reactions
 * - Pinned indicator
 * - Video embed preview
 */
export const PostCard: React.FC<PostCardProps> = ({
  post,
  onVote,
  onReact,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleVote = (voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(post.id, voteType);
    }
  };

  const netVotes = post.upvotes - post.downvotes;

  // Common emoji reactions
  const quickEmojis = ['❤️', '🔥', '👍', '🎉', '💯', '🚀'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white/80 backdrop-blur-xl rounded-2xl border shadow-lg hover:shadow-xl transition-shadow',
        post.isPinned
          ? 'border-2 border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/50'
          : 'border-white/20'
      )}
      id={`post-${post.id}`}
    >
      {/* Pinned Indicator */}
      {post.isPinned && (
        <div className="flex items-center gap-2 px-6 pt-4 pb-2">
          <Pin className="w-4 h-4 text-amber-600 fill-amber-600" />
          <span className="text-xs font-bold text-amber-700">
            PINNED POST
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Post Header - Author Info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12 rounded-xl ring-2 ring-white shadow-md">
            <AvatarImage src={post.authorAvatar} alt={post.authorName} />
            <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold text-lg">
              {post.authorName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900">
                {post.authorName}
              </span>
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                Lvl {post.authorLevel}
              </Badge>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Attachments - Images */}
        {post.attachments && post.attachments.length > 0 && (
          <div className={cn(
            'mb-4 grid gap-2',
            post.attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}>
            {post.attachments.map((attachment, index) => (
              <div key={index} className="rounded-xl overflow-hidden">
                <img
                  src={attachment.url}
                  alt={`Attachment ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}

        {/* Video Embed Preview */}
        {post.embedPreview && (
          <div className="mb-4 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition-colors group cursor-pointer">
            <div className="relative">
              <img
                src={post.embedPreview.thumbnail}
                alt={post.embedPreview.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-purple-600 ml-1" />
                </div>
              </div>
              <Badge className="absolute top-3 right-3 bg-black/70 text-white">
                {post.embedPreview.provider}
              </Badge>
            </div>
            <div className="p-3 bg-gray-50">
              <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                {post.embedPreview.title}
              </p>
            </div>
          </div>
        )}

        {/* Reactions Bar */}
        {Object.keys(post.reactions).length > 0 && (
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
            {Object.entries(post.reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact?.(post.id, emoji)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full border-2 transition-all hover:scale-105',
                  post.userReactions.includes(emoji)
                    ? 'bg-purple-100 border-purple-300'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                )}
              >
                <span className="text-base">{emoji}</span>
                <span className="text-xs font-bold text-gray-700">{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action Bar - Upvote, Comment, Share */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Upvote/Downvote */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
              <button
                onClick={() => handleVote('up')}
                className={cn(
                  'p-2 rounded-full transition-all hover:bg-white',
                  post.userVote === 'up' && 'bg-purple-100 text-purple-600'
                )}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <span className={cn(
                'font-bold text-sm min-w-[2rem] text-center',
                netVotes > 0 ? 'text-green-600' : netVotes < 0 ? 'text-red-600' : 'text-gray-600'
              )}>
                {netVotes > 0 ? '+' : ''}{netVotes}
              </span>

              <button
                onClick={() => handleVote('down')}
                className={cn(
                  'p-2 rounded-full transition-all hover:bg-white',
                  post.userVote === 'down' && 'bg-red-100 text-red-600'
                )}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Comment */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600 hover:text-gray-900"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </Button>

            {/* Add Reaction */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="text-base">😊</span>
              </Button>

              {/* Quick Emoji Picker */}
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 flex gap-1 z-50"
                >
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact?.(post.id, emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
