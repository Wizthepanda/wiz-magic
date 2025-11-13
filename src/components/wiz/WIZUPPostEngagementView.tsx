import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Send,
  MoreHorizontal,
  Smile,
  Image,
  Zap,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WIZUPEngagementBar } from './WIZUPEngagementBar';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  content: string;
  createdAt: string;
  score: number;
  replies?: Comment[];
  isReply?: boolean;
  parentId?: string;
}

interface Post {
  id: string;
  communityId: string;
  communityName: string;
  communityAvatar: string;
  communityMemberCount: number;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorLevel: number;
  title: string;
  content?: string;
  excerpt?: string;
  media?: {
    type: 'video' | 'image' | 'none';
    url?: string;
    videoId?: string;
    thumbnail?: string;
    duration?: string;
  };
  score: number;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  zapsReward: number;
  createdAt: string;
  comments?: Comment[];
}

interface WIZUPPostEngagementViewProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onVote?: (postId: string, voteType: 'up' | 'down' | null) => void;
  onComment?: (postId: string, content: string, parentId?: string) => void;
}

function formatTime(ts: any): string {
  try {
    if (!ts) return '';
    if (typeof ts === 'string') return ts;
    if (ts.toDate) {
      const d = ts.toDate() as Date;
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
      return `${Math.floor(diff/86400)}d ago`;
    }
  } catch {}
  return '';
}

const CommentCard: React.FC<{
  comment: Comment;
  onReply?: (commentId: string) => void;
  onVote?: (commentId: string, voteType: 'up' | 'down' | null) => void;
  depth?: number;
}> = ({ comment, onReply, onVote, depth = 0 }) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [voteCount, setVoteCount] = useState(comment.score);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleVote = (voteType: 'up' | 'down') => {
    const newVote = userVote === voteType ? null : voteType;
    setUserVote(newVote);

    // Update vote count
    const delta = newVote === 'up' ? 1 : newVote === 'down' ? -1 : 0;
    setVoteCount(prev => prev + delta);

    onVote?.(comment.id, newVote);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative", depth > 0 && "ml-8")}
    >
      {/* Thread connector line for replies */}
      {depth > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/30 to-transparent" />
      )}

      <div className="flex gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
        {/* Avatar */}
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="w-8 h-8 rounded-full ring-2 ring-purple-500/20"
        />

        {/* Comment Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-white">{comment.authorName}</span>
            <span className="text-purple-300">Lv.{comment.authorLevel}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">{formatTime(comment.createdAt)}</span>
          </div>

          {/* Content */}
          <p className="text-gray-200 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            {/* Voting */}
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleVote('up')}
                className={cn(
                  "p-1 rounded-lg transition-all",
                  userVote === 'up' ? "text-purple-400 bg-purple-500/20" : "text-gray-400 hover:text-purple-400 hover:bg-purple-500/10"
                )}
              >
                <ChevronUp className="w-4 h-4" />
              </motion.button>

              <span className="text-sm font-medium text-gray-300 min-w-[2rem] text-center">
                {voteCount}
              </span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleVote('down')}
                className={cn(
                  "p-1 rounded-lg transition-all",
                  userVote === 'down' ? "text-red-400 bg-red-500/20" : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                )}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Reply Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors text-sm px-2 py-1 rounded-lg hover:bg-blue-500/10"
            >
              <MessageCircle className="w-4 h-4" />
              Reply
            </motion.button>

            {/* More Actions */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="p-1 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-500/10"
            >
              <MoreHorizontal className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onVote={onVote}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export const WIZUPPostEngagementView: React.FC<WIZUPPostEngagementViewProps> = ({
  post,
  isOpen,
  onClose,
  onVote,
  onComment
}) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [voteCount, setVoteCount] = useState(post.score);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && commentContent.trim()) {
        handleSubmitComment();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, commentContent]);

  const handleVote = (voteType: 'up' | 'down') => {
    const newVote = userVote === voteType ? null : voteType;
    setUserVote(newVote);

    // Update vote count
    const delta = newVote === 'up' ? 1 : newVote === 'down' ? -1 : 0;
    setVoteCount(prev => prev + delta);

    onVote?.(post.id, newVote);
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComment?.(post.id, commentContent);

      // Add comment locally for immediate UI feedback
      const newComment: Comment = {
        id: Date.now().toString(),
        authorId: 'current-user',
        authorName: 'You',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user',
        authorLevel: 1,
        content: commentContent,
        createdAt: new Date().toISOString(),
        score: 0,
        replies: []
      };

      setComments(prev => [newComment, ...prev]);
      setCommentContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-gray-900/95 via-purple-900/90 to-pink-900/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </motion.button>
                <h1 className="text-lg font-semibold text-white">Thread</h1>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Bookmark className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Primary Post */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
                >
                  {/* Community Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <img
                        src={post.communityAvatar}
                        alt={post.communityName}
                        className="w-10 h-10 rounded-2xl object-cover"
                      />
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                      >
                        <Sparkles className="w-2 h-2 text-white" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{post.communityName}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-300">
                        <Users className="w-3 h-3" />
                        <span>{post.communityMemberCount.toLocaleString()} members</span>
                      </div>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full ring-2 ring-purple-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{post.authorName}</span>
                        <span className="text-purple-300">@{post.authorUsername}</span>
                        <span className="text-purple-300">Lv.{post.authorLevel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-4 mb-6">
                    <h2 className="text-xl font-bold text-white leading-tight">{post.title}</h2>

                    {post.excerpt && (
                      <p className="text-gray-200 leading-relaxed">{post.excerpt}</p>
                    )}

                    {/* Media */}
                    {post.media?.thumbnail && (
                      <div className="rounded-2xl overflow-hidden bg-gray-800">
                        <img
                          src={post.media.thumbnail}
                          alt={post.title}
                          className="w-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Unified Engagement Bar */}
                  <WIZUPEngagementBar
                    userVote={userVote}
                    voteCount={voteCount}
                    commentCount={post.commentsCount || 0}
                    zapsEarned={post.zapsReward || 0}
                    onUpvote={() => handleVote('up')}
                    onDownvote={() => handleVote('down')}
                    onComment={() => console.log('Comment on post:', post.id)}
                    onShare={() => console.log('Share post:', post.id)}
                    enableAnimations={true}
                    className="border-t border-white/10"
                  />
                </motion.div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Comments ({comments.length})
                  </h3>

                  {comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <CommentCard
                          key={comment.id}
                          comment={comment}
                          onReply={(commentId, content) => {
                            // Handle reply logic
                            const newReply: Comment = {
                              id: Date.now().toString(),
                              authorId: 'current-user',
                              authorName: 'You',
                              authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user',
                              authorLevel: 1,
                              content,
                              createdAt: new Date().toISOString(),
                              score: 0,
                              isReply: true,
                              parentId: commentId
                            };

                            setComments(prev =>
                              prev.map(c =>
                                c.id === commentId
                                  ? { ...c, replies: [...(c.replies || []), newReply] }
                                  : c
                              )
                            );
                          }}
                          onVote={(commentId, voteType) => {
                            // Handle comment voting
                            console.log('Vote on comment:', commentId, voteType);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No comments yet. Be the first to join the conversation!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Composer */}
            <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=current-user"
                    alt="You"
                    className="w-10 h-10 rounded-full ring-2 ring-purple-500/30 flex-shrink-0"
                  />
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Add your magic ✨ to the conversation..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 min-h-[80px]"
                      rows={3}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Smile className="w-5 h-5 text-gray-400" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Image className="w-5 h-5 text-gray-400" />
                        </motion.button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmitComment}
                        disabled={!commentContent.trim() || isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Comment
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
