import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Pin,
  Play,
  Send,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Post, Reply } from './Placeholders';

interface PostCardEnhancedProps {
  post: Post;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onReact?: (postId: string, emoji: string) => void;
  onPin?: (postId: string) => void;
  onReply?: (postId: string, content: string) => void;
  onReplyVote?: (postId: string, replyId: string, voteType: 'up' | 'down') => void;
  currentUserId?: string;
  isCreatorOrMod?: boolean;
}

/**
 * Enhanced Post Card Component (Phase 8)
 * - Displays individual post with author, content, attachments
 * - Upvote/downvote functionality with dynamic ranking
 * - Emoji reactions
 * - Pinned indicator and pin functionality for creator/moderators
 * - Threaded replies (1-level deep)
 * - Enhanced media embeds (YouTube, Vimeo, images)
 * - Video embed preview
 */
export const PostCardEnhanced: React.FC<PostCardEnhancedProps> = ({
  post,
  onVote,
  onReact,
  onPin,
  onReply,
  onReplyVote,
  currentUserId,
  isCreatorOrMod = false,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleVote = (voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(post.id, voteType);
    }
  };

  const handleReplyVote = (replyId: string, voteType: 'up' | 'down') => {
    if (onReplyVote) {
      onReplyVote(post.id, replyId, voteType);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmittingReply(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API call
    onReply(post.id, replyContent);
    setReplyContent('');
    setShowReplyInput(false);
    setIsSubmittingReply(false);
  };

  const netVotes = post.upvotes - post.downvotes;

  // Common emoji reactions
  const quickEmojis = ['❤️', '🔥', '👍', '🎉', '💯', '🚀'];

  // Get embed iframe for YouTube/Vimeo
  const getEmbedIframe = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
  };

  const embedIframeUrl = post.embedUrl ? getEmbedIframe(post.embedUrl) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white/80 backdrop-blur-xl rounded-2xl border shadow-lg hover:shadow-xl transition-shadow overflow-visible',
        post.isPinned
          ? 'border-2 border-amber-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 ring-2 ring-amber-200/50'
          : 'border-white/20'
      )}
      id={`post-${post.id}`}
    >
      {/* Pinned Indicator */}
      {post.isPinned && (
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-600 fill-amber-600" />
            <span className="text-xs font-bold text-amber-700">
              📌 PINNED POST
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Post Header - Author Info */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1">
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

          {/* Pin Button (Creator/Mod only) */}
          {isCreatorOrMod && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPin?.(post.id)}
              className={cn(
                'gap-2',
                post.isPinned
                  ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Pin className={cn('w-4 h-4', post.isPinned && 'fill-amber-600')} />
              {post.isPinned ? 'Unpin' : 'Pin'}
            </Button>
          )}
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
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <video
                    src={attachment.url}
                    controls
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Video Embed (YouTube/Vimeo) */}
        {embedIframeUrl && (
          <div className="mb-4 rounded-xl overflow-hidden border-2 border-purple-200">
            <iframe
              src={embedIframeUrl}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Video Embed Preview (fallback if no iframe) */}
        {!embedIframeUrl && post.embedPreview && (
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
        <div className="flex items-center justify-between overflow-visible">
          <div className="flex items-center gap-4 overflow-visible">
            {/* Upvote/Downvote */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
              <button
                onClick={() => handleVote('up')}
                className={cn(
                  'p-2 rounded-full transition-all hover:bg-white',
                  post.userVote === 'up' && 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200'
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
                  post.userVote === 'down' && 'bg-gray-400 text-white'
                )}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>

            {/* Comment/Reply */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-600 hover:text-gray-900"
              onClick={() => setShowReplyInput(!showReplyInput)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {post.replies?.length || post.commentCount || 0}
              </span>
            </Button>

            {/* Add Reaction */}
            <div className="relative overflow-visible">
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
                  className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 flex gap-1 z-[9999]"
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

        {/* Reply Input */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-purple-400 to-indigo-400 text-white text-sm font-bold">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="min-h-[80px] resize-none border-gray-200 focus:border-purple-300 rounded-xl"
                    disabled={isSubmittingReply}
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReplyInput(false);
                        setReplyContent('');
                      }}
                      disabled={isSubmittingReply}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitReply}
                      disabled={!replyContent.trim() || isSubmittingReply}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies Section */}
        {post.replies && post.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t border-gray-200 space-y-4"
          >
            {post.replies.map((reply) => {
              const replyNetVotes = reply.upvotes - reply.downvotes;
              return (
                <div key={reply.id} className="flex gap-3 bg-gray-50/50 rounded-xl p-3">
                  <Avatar className="w-8 h-8 rounded-lg">
                    <AvatarImage src={reply.authorAvatar} alt={reply.authorName} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-sm font-bold">
                      {reply.authorName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900">{reply.authorName}</span>
                      <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                        Lvl {reply.authorLevel}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{reply.content}</p>

                    {/* Reply Vote Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 border border-gray-200">
                        <button
                          onClick={() => handleReplyVote(reply.id, 'up')}
                          className={cn(
                            'p-1 rounded-full transition-all hover:bg-gray-100',
                            reply.userVote === 'up' && 'bg-purple-100 text-purple-600'
                          )}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <span className={cn(
                          'text-xs font-bold min-w-[1.5rem] text-center',
                          replyNetVotes > 0 ? 'text-green-600' : replyNetVotes < 0 ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {replyNetVotes > 0 ? '+' : ''}{replyNetVotes}
                        </span>
                        <button
                          onClick={() => handleReplyVote(reply.id, 'down')}
                          className={cn(
                            'p-1 rounded-full transition-all hover:bg-gray-100',
                            reply.userVote === 'down' && 'bg-red-100 text-red-600'
                          )}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
