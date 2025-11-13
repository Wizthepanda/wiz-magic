import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  BookmarkCheck,
  Award,
  Eye,
  Clock,
  Sparkles,
  Send,
  Image,
  Smile,
  Gift,
  Users,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { postsInteractionService } from '@/lib/posts-interaction-service';
import { userProfileService } from '@/lib/user-profile-service';
import { Post } from '@/lib/firestore/queries';
import { toast } from 'sonner';

interface PostPopupModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onVideoSelect?: (video: any) => void;
}

interface Comment {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  userLevel?: number;
  content: string;
  createdAt: any;
  upvotes: number;
  downvotes: number;
}

const PostPopupModal: React.FC<PostPopupModalProps> = ({ 
  post, 
  isOpen, 
  onClose,
  onVideoSelect 
}) => {
  const { user: currentUser } = useAuth();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes || 0);
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes || 0);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [showCommentOverlay, setShowCommentOverlay] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen && currentUser?.uid) {
      // Load user vote status
      postsInteractionService.getUserVote(post.id, currentUser.uid)
        .then(setUserVote)
        .catch(() => {});
      
      // Load saved status  
      postsInteractionService.isPostSaved(post.id, currentUser.uid)
        .then(setIsSaved)
        .catch(() => {});
    }
  }, [post.id, currentUser?.uid, isOpen]);

  // Load author profile
  useEffect(() => {
    if (post.authorId) {
      userProfileService.getUserProfile(post.authorId)
        .then(setAuthorProfile)
        .catch(() => {});
    }
  }, [post.authorId]);

  // Focus comment input when overlay opens
  useEffect(() => {
    if (showCommentOverlay && commentInputRef.current) {
      setTimeout(() => commentInputRef.current?.focus(), 200);
    }
  }, [showCommentOverlay]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!currentUser?.uid) {
      toast.error('Please sign in to vote');
      return;
    }

    if (isVoting) return;
    
    try {
      setIsVoting(true);
      const result = await postsInteractionService.votePost(post.id, currentUser.uid, voteType);
      
      setUserVote(result.userVote);
      setLocalUpvotes(result.upvotes);
      setLocalDownvotes(result.downvotes);
      
      if (result.userVote) {
        // Trigger XP animation
        const earnedXp = voteType === 'up' ? 2 : 1;
        setXpEarned(earnedXp);
        setShowXpAnimation(true);
        setTimeout(() => setShowXpAnimation(false), 2000);
      }
      
      toast.success(result.userVote ? `${voteType === 'up' ? 'Upvoted' : 'Downvoted'}!` : 'Vote removed');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.uid) {
      toast.error('Please sign in to save posts');
      return;
    }

    try {
      const saved = await postsInteractionService.toggleSavePost(post.id, currentUser.uid);
      setIsSaved(saved);
      toast.success(saved ? 'Post saved!' : 'Post unsaved');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: window.location.href + `#post-${post.id}`
        });
      } else {
        await navigator.clipboard.writeText(window.location.href + `#post-${post.id}`);
        toast.success('Link copied to clipboard!');
      }
      
      if (currentUser?.uid) {
        await postsInteractionService.sharePost(post.id, currentUser.uid);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAward = () => {
    if (!currentUser?.uid) {
      toast.error('Please sign in to award ZAPs');
      return;
    }

    // Trigger award animation
    setXpEarned(10);
    setShowXpAnimation(true);
    setTimeout(() => setShowXpAnimation(false), 2000);
    
    toast('💫 Award feature coming soon!', {
      description: 'You would award 10 ZAPs to this post'
    });
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser?.uid) return;

    try {
      setIsSubmittingComment(true);
      
      const result = await postsInteractionService.addComment(
        post.id,
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        currentUser.photoURL || '',
        commentText
      );

      if (result.success) {
        setCommentText('');
        setShowCommentOverlay(false);
        toast('💫 Your spark has joined the conversation!');
        
        // Trigger XP animation for commenting
        setXpEarned(5);
        setShowXpAnimation(true);
        setTimeout(() => setShowXpAnimation(false), 2000);
      } else {
        toast.error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatTime = (ts: any): string => {
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
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Main Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-4 z-50 flex items-center justify-center"
          >
            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(138,77,255,0.15)] max-w-4xl w-full h-full overflow-hidden border border-white/20">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <img 
                    src={
                      post.communityAvatar || 
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.communityName || 'Community')}`
                    }
                    alt={post.communityName}
                    className="w-8 h-8 rounded-full ring-2 ring-violet-200"
                  />
                  <span className="font-semibold text-slate-800">{post.communityName} ⚡</span>
                  <button className="px-3 py-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm rounded-full hover:scale-105 transition-transform">
                    Follow
                  </button>
                </div>
                
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-gray-600 hover:text-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-[calc(100%-140px)] overflow-hidden">
                
                {/* Left Column - Main Post */}
                <div className="lg:col-span-2 overflow-y-auto space-y-6">
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={
                        authorProfile?.photoURL ||
                        post.authorAvatar || 
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.authorUsername || 'user')}`
                      }
                      alt={post.authorUsername}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">@{post.authorUsername || post.authorName}</span>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs rounded-full">
                          Level {post.authorLevel || 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(post.createdAt)}</span>
                        <Eye className="w-3 h-3" />
                        <span>{post.score || 0} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Title */}
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    {post.title}
                  </h1>

                  {/* Media */}
                  {post.media?.thumbnail && (
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src={post.media.thumbnail}
                        alt={post.title}
                        className="w-full h-80 object-cover"
                      />
                    </div>
                  )}

                  {/* Post Body */}
                  {post.excerpt && (
                    <div className="text-gray-700 leading-relaxed text-lg">
                      {post.excerpt}
                    </div>
                  )}

                  {/* XP Badge */}
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                      +{post.zapsReward || 0} ZAPs earned
                    </span>
                  </div>
                  
                </div>

                {/* Right Column - Engagement */}
                <div className="lg:col-span-1 overflow-y-auto space-y-4">
                  
                  {/* Engagement Stats */}
                  <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 space-y-3">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Engagement
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Upvotes</span>
                        <span className="font-medium">{localUpvotes}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Comments</span>
                        <span className="font-medium">{post.commentsCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ZAPs Earned</span>
                        <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
                          {post.zapsReward || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Comments Preview */}
                  <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Recent Sparks
                    </h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="text-gray-500 text-center py-4">
                        No comments yet. Be the first to spark a conversation! 💫
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/20 p-4">
                
                {/* Reaction Row */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <motion.button 
                    onClick={() => handleVote('up')}
                    disabled={isVoting}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      userVote === 'up' 
                        ? 'bg-pink-100 text-pink-600 shadow-lg shadow-pink-200' 
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-500'
                    }`}
                  >
                    <ArrowBigUp className={`w-5 h-5 ${userVote === 'up' ? 'fill-current' : ''}`} />
                    <span className="font-medium">{localUpvotes}</span>
                  </motion.button>

                  <motion.button 
                    onClick={() => handleVote('down')}
                    disabled={isVoting}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      userVote === 'down' 
                        ? 'bg-blue-100 text-blue-600 shadow-lg shadow-blue-200' 
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-500'
                    }`}
                  >
                    <ArrowBigDown className={`w-5 h-5 ${userVote === 'down' ? 'fill-current' : ''}`} />
                    <span className="font-medium">{localDownvotes}</span>
                  </motion.button>

                  <motion.button 
                    onClick={() => setShowCommentOverlay(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:bg-violet-50 hover:text-violet-500 transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">{post.commentsCount || 0}</span>
                  </motion.button>

                  <motion.button 
                    onClick={handleShare}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 hover:bg-blue-50 hover:text-blue-500 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>

                  <motion.button 
                    onClick={handleAward}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-200 hover:shadow-xl transition-all"
                  >
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Award</span>
                  </motion.button>

                  <motion.button 
                    onClick={handleSave}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-full transition-all ${
                      isSaved 
                        ? 'bg-pink-100 text-pink-600' 
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-500'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </motion.button>
                </div>

                {/* Comment Input */}
                <button 
                  onClick={() => setShowCommentOverlay(true)}
                  className="w-full p-3 bg-white/60 backdrop-blur-xl rounded-full text-left text-gray-500 hover:bg-white/80 transition-all border border-white/30 hover:border-violet-200"
                >
                  Join the conversation… 💫
                </button>
              </div>
            </div>
          </motion.div>

          {/* XP Animation */}
          <AnimatePresence>
            {showXpAnimation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.5, 1.2, 1.2, 1.5], 
                  y: [20, -10, -10, -50] 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
                className="fixed top-1/3 right-8 z-60 flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-xl"
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">+{xpEarned} ZAPs</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comment Overlay */}
          <AnimatePresence>
            {showCommentOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-60 bg-black/40 backdrop-blur-md flex items-center justify-center"
                onClick={() => setShowCommentOverlay(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 max-w-lg w-full mx-4 shadow-[0_8px_32px_rgba(138,77,255,0.2)] border border-white/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={
                          currentUser?.photoURL || 
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.displayName || 'user')}`
                        }
                        alt="Your avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">Reply as {currentUser?.displayName || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">Level 5 • Spark Creator</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowCommentOverlay(false)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      ref={commentInputRef}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts and spark the conversation..."
                      className="w-full p-4 bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
                      rows={4}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                          <Image className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                          <Smile className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                          <Gift className="w-4 h-4" />
                        </button>
                      </div>

                      <motion.button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                        whileHover={{ scale: commentText.trim() ? 1.05 : 1 }}
                        whileTap={{ scale: commentText.trim() ? 0.95 : 1 }}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default PostPopupModal;