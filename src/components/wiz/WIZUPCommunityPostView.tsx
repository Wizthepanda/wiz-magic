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
  Sparkles,
  X,
  Shield,
  Play,
  Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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
  communityVerified?: boolean;
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

interface CommunityInfo {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  description: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  isVerified: boolean;
  isJoined: boolean;
  topContributors: Array<{
    id: string;
    name: string;
    avatar: string;
    zapsEarned: number;
  }>;
  trendingPosts: Post[];
}

interface WIZUPCommunityPostViewProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onComment: (postId: string, content: string, parentId?: string) => void;
  onJoinCommunity?: (communityId: string) => void;
}

export const WIZUPCommunityPostView: React.FC<WIZUPCommunityPostViewProps> = ({
  post,
  isOpen,
  onClose,
  onVote,
  onComment,
  onJoinCommunity
}) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [zapAnimation, setZapAnimation] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Mock comments data - in real app, this would be fetched based on post.id
  const mockComments: Comment[] = [
    {
      id: '1',
      authorId: 'user1',
      authorName: 'Sarah Creative',
      authorAvatar: '/api/placeholder/32/32',
      authorLevel: 12,
      content: 'This is exactly the kind of content I was looking for! Really well explained and the examples are super helpful. 🔥',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      score: 24,
      replies: [
        {
          id: '1-1',
          authorId: post.authorId,
          authorName: post.authorName,
          authorAvatar: post.authorAvatar,
          authorLevel: post.authorLevel,
          content: 'Thanks so much Sarah! Really appreciate the feedback. More content like this coming soon! ⚡',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          score: 12,
          isReply: true,
          parentId: '1'
        }
      ]
    },
    {
      id: '2',
      authorId: 'user2',
      authorName: 'Marcus Developer',
      authorAvatar: '/api/placeholder/32/32',
      authorLevel: 8,
      content: 'Quick question - do you have any resources for beginners who want to get started with this?',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      score: 7
    },
    {
      id: '3',
      authorId: 'user3',
      authorName: 'Jessica Designer',
      authorAvatar: '/api/placeholder/32/32',
      authorLevel: 15,
      content: 'Love the visual approach! The way you break down complex concepts makes it so much easier to understand. Keep up the amazing work! 💎',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      score: 18
    }
  ];

  // Use mock comments if none provided, or merge with existing ones
  const commentsToShow = post.comments?.length ? post.comments : mockComments;

  // Mock community data - in real app, this would be fetched based on post.communityId
  const communityInfo: CommunityInfo = {
    id: post.communityId,
    name: post.communityName,
    avatar: post.communityAvatar,
    banner: `linear-gradient(90deg, #8A4DFF, #FF4DF3)`,
    description: "A premium community focused on creative content and meaningful discussions. Join us to connect with like-minded creators and earn ZAPs!",
    memberCount: post.communityMemberCount,
    postCount: 120,
    createdAt: "2y ago",
    isVerified: post.communityVerified || true,
    isJoined: false, // This would come from user's joined communities
    topContributors: [
      { id: '1', name: 'Alex Creator', avatar: '/api/placeholder/32/32', zapsEarned: 1234 },
      { id: '2', name: 'Sam Innovator', avatar: '/api/placeholder/32/32', zapsEarned: 987 },
      { id: '3', name: 'Jordan Artist', avatar: '/api/placeholder/32/32', zapsEarned: 756 }
    ],
    trendingPosts: [] // Mock trending posts
  };

  // Update URL when post opens
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({}, '', `/post/${post.id}`);
    }
  }, [isOpen, post.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = () => {
    window.history.back();
    onClose();
  };

  const handleVote = (voteType: 'up' | 'down') => {
    const newVote = userVote === voteType ? null : voteType;
    setUserVote(newVote);
    onVote(post.id, voteType);
    
    if (voteType === 'up' && newVote === 'up') {
      setZapAnimation(true);
      setTimeout(() => setZapAnimation(false), 600);
    }
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    
    onComment(post.id, commentText, replyTo || undefined);
    setCommentText('');
    setReplyTo(null);
    setIsInputFocused(false);
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const CommentComponent = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative",
        isReply ? "ml-8 border-l-2 border-gradient-to-b from-purple-200 to-pink-200 pl-4" : ""
      )}
    >
      <div className="flex space-x-3 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/20 hover:bg-white/80 transition-all duration-200">
        <img
          src={comment.authorAvatar || '/api/placeholder/32/32'}
          alt={comment.authorName}
          className="w-8 h-8 rounded-full ring-2 ring-white/50"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">{comment.authorName}</span>
            <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
              L{comment.authorLevel}
            </span>
            <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
          </div>
          
          <p className="text-gray-800 text-sm leading-relaxed mb-2">{comment.content}</p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <button className="p-1 hover:bg-purple-100 rounded-lg transition-colors">
                <ChevronUp className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm font-medium text-gray-700">{comment.score}</span>
              <button className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <button
              onClick={() => setReplyTo(comment.id)}
              className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {comment.replies?.map((reply) => (
        <div key={reply.id} className="mt-2">
          <CommentComponent comment={reply} isReply />
        </div>
      ))}
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div className="h-full grid grid-cols-[250px_1fr_350px] max-w-[1600px] mx-auto">
          {/* Left spacer - keeps nav visible */}
          <div />

          {/* Main Post View */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative flex flex-col bg-white/80 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(138,77,255,0.08)] mx-6 my-4 max-h-[calc(100vh-32px)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
              <div className="flex items-center space-x-3">
                <img
                  src={post.authorAvatar || '/api/placeholder/48/48'}
                  alt={post.authorName}
                  className="w-12 h-12 rounded-full ring-2 ring-white/50"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{post.authorName}</span>
                    <span className="text-gray-500">@{post.authorUsername}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Posted in</span>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                      <span className="font-medium text-purple-700">{post.communityName}</span>
                      {communityInfo.isVerified && <Shield className="w-3 h-3 text-purple-600" />}
                      <Zap className="w-3 h-3 text-yellow-500" />
                    </div>
                    <span>•</span>
                    <span>{formatTime(post.createdAt)}</span>
                    {post.zapsReward > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <Zap className="w-3 h-3" />
                          <span>+{post.zapsReward} ZAPs earned</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Media */}
                {post.media?.type === 'video' && (
                  <div className="relative mb-6 rounded-2xl overflow-hidden bg-black/5">
                    <video
                      ref={videoRef}
                      src={post.media.url}
                      poster={post.media.thumbnail}
                      className="w-full aspect-video object-cover"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                    <button
                      onClick={toggleVideo}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                    >
                      {isPlaying ? (
                        <Pause className="w-16 h-16 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <Play className="w-16 h-16 text-white drop-shadow-lg" />
                      )}
                    </button>
                  </div>
                )}

                {post.media?.type === 'image' && (
                  <div className="mb-6 rounded-2xl overflow-hidden">
                    <img
                      src={post.media.url}
                      alt={post.title}
                      className="w-full h-auto max-h-[400px] object-cover"
                    />
                  </div>
                )}

                {/* Title & Description */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                  {post.title}
                </h1>
                
                {(post.content || post.excerpt) && (
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {post.content || post.excerpt}
                  </p>
                )}

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

                {/* Engagement Row */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleVote('up')}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200 flex items-center space-x-1",
                          userVote === 'up'
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                            : "hover:bg-purple-100 text-gray-600"
                        )}
                      >
                        <motion.div
                          animate={zapAnimation ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.6 }}
                        >
                          <ChevronUp className="w-5 h-5" />
                        </motion.div>
                      </motion.button>
                      
                      <span className="font-semibold text-lg text-gray-900">
                        {formatNumber(post.upvotes - post.downvotes)}
                      </span>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleVote('down')}
                        className={cn(
                          "p-2 rounded-xl transition-all duration-200",
                          userVote === 'down'
                            ? "bg-red-500 text-white shadow-lg"
                            : "hover:bg-red-100 text-gray-600"
                        )}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{formatNumber(post.commentsCount)}</span>
                    </div>

                    <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>

                    {post.zapsReward > 0 && (
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl text-yellow-700">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">+{post.zapsReward} ZAPs</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Comments</span>
                    <span className="text-gray-500">({commentsToShow.length})</span>
                  </h3>

                  {commentsToShow.map((comment) => (
                    <CommentComponent key={comment.id} comment={comment} />
                  ))}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="border-t border-gray-100/50 p-4 bg-white/60 backdrop-blur-md">
              {replyTo && (
                <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Replying to comment</span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-purple-500 hover:text-purple-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className={cn(
                "relative rounded-2xl border-2 transition-all duration-300",
                isInputFocused 
                  ? "border-transparent ring-2 ring-purple-500/20 bg-gradient-to-r from-purple-50 to-pink-50" 
                  : "border-gray-200 bg-white/80"
              )}>
                <textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="✨ Add your thoughts..."
                  className="w-full p-4 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500"
                  rows={isInputFocused ? 3 : 1}
                />
                
                {isInputFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 pt-0"
                  >
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-600">
                        <Smile className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-600">
                        <Image className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!commentText.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>Post</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Community Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            className="p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Community Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[24px] shadow-[0_8px_32px_rgba(138,77,255,0.08)] p-6 mb-6">
              {/* Community Banner */}
              <div 
                className="h-20 rounded-2xl mb-4 relative overflow-hidden"
                style={{ background: communityInfo.banner }}
              >
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/80" />
                </div>
              </div>

              {/* Community Info */}
              <div className="flex items-start space-x-3 mb-4">
                <img
                  src={communityInfo.avatar || '/api/placeholder/64/64'}
                  alt={communityInfo.name}
                  className="w-16 h-16 rounded-2xl ring-4 ring-white/50 shadow-lg"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-gray-900">{communityInfo.name}</h3>
                    {communityInfo.isVerified && (
                      <div className="flex items-center space-x-1 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                        <Shield className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {formatNumber(communityInfo.memberCount)} Members
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onJoinCommunity?.(communityInfo.id)}
                    className={cn(
                      "w-full py-2 px-4 rounded-xl font-medium transition-all duration-200",
                      communityInfo.isJoined
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg"
                    )}
                  >
                    {communityInfo.isJoined ? 'Joined' : 'Join Community'}
                  </motion.button>
                </div>
              </div>

              {/* About */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  {communityInfo.description}
                </p>
                <div className="text-xs text-gray-500">
                  Created {communityInfo.createdAt} • {communityInfo.postCount} Posts
                </div>
              </div>

              {/* Top Contributors */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Top Contributors</h4>
                <div className="space-y-2">
                  {communityInfo.topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 flex-1">
                        <img
                          src={contributor.avatar}
                          alt={contributor.name}
                          className="w-8 h-8 rounded-full ring-2 ring-white/50"
                        />
                        <span className="text-sm font-medium text-gray-900">{contributor.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Zap className="w-3 h-3" />
                        <span className="text-xs font-medium">{formatNumber(contributor.zapsEarned)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Posts Preview */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Trending in Community</h4>
                <div className="text-sm text-gray-500 text-center py-4">
                  No trending posts available
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};