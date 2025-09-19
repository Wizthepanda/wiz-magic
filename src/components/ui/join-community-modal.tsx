import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  MessageCircle,
  Star,
  Crown,
  Heart,
  Share2,
  TrendingUp,
  CheckCircle,
  Zap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';

interface JoinCommunityModalProps {
  community: any;
  isOpen: boolean;
  onClose: () => void;
  userXP: number;
  onJoin?: () => void;
}

// Mock community feed posts
const communityPosts = [
  {
    id: 1,
    author: 'Sarah Chen',
    avatar: '/Profile Pics/Sarah.jpg',
    content: '🚀 Just launched my new AI automation workflow! Who wants to see a breakdown?',
    likes: 127,
    replies: 23,
    timeAgo: '2h ago'
  },
  {
    id: 2,
    author: 'Marcus Johnson',
    avatar: '/Profile Pics/Marcus.jpg',
    content: 'Weekly challenge: Build something with AI in 30 minutes. Share your results! 💡',
    likes: 89,
    replies: 45,
    timeAgo: '4h ago'
  },
  {
    id: 3,
    author: 'Elena Rodriguez',
    avatar: '/Profile Pics/Elena.jpg',
    content: 'Behind-the-scenes: How I grew my AI consultancy from 0 to $100k',
    likes: 203,
    replies: 67,
    timeAgo: '1d ago'
  }
];

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({
  community,
  isOpen,
  onClose,
  userXP,
  onJoin
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'feed'>('overview');
  const [isJoined, setIsJoined] = useState(false);
  const [showJoinedAnimation, setShowJoinedAnimation] = useState(false);
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  const canAfford = userXP >= (community?.xpRequired || 0);

  const handleJoin = () => {
    if (!canAfford) return;

    setShowJoinedAnimation(true);
    setIsJoined(true);
    onJoin?.();

    // Reset animation after 2 seconds
    setTimeout(() => {
      setShowJoinedAnimation(false);
    }, 2000);
  };

  if (!isOpen || !community) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Frosted Glass Backdrop */}
        <motion.div
          className={cn(
            "absolute inset-0 transition-all duration-400",
            theme === 'dark'
              ? "bg-black/60"
              : "bg-black/40"
          )}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          className={cn(
            "relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl transition-all duration-400",
            isMobile ? "h-full" : "h-auto",
            theme === 'dark' ? "bg-slate-800 border border-slate-700/50" : "bg-white"
          )}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className={cn(
              "absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
              theme === 'dark' ? "bg-slate-700 hover:bg-slate-600" : "bg-gray-100 hover:bg-gray-200"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={20} className={theme === 'dark' ? "text-slate-300" : "text-gray-600"} />
          </motion.button>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Top Section - Creator & Community Info */}
            <div
              className="relative h-32 bg-gradient-to-r from-purple-500 via-violet-500 to-cyan-500 p-8 flex items-end"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
              }}
            >
              <div className="flex items-center gap-6">
                {/* Creator Avatar */}
                <Avatar className="w-16 h-16 border-4 border-white/20">
                  <AvatarImage src={community.creatorAvatar} alt={community.creator} />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                    {community.creator[0]}
                  </AvatarFallback>
                </Avatar>

                {/* Community Info */}
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-1">{community?.title || 'Community'}</h2>
                  <p className="text-white/90 font-medium">{community?.creator || 'Creator'} • {community?.role || 'Expert'}</p>
                  <p className="text-white/80 text-sm">{(community?.members || 0).toLocaleString()} members enrolled</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className={cn("px-8 py-6 border-b", theme === 'dark' ? "border-slate-700" : "border-gray-200")}>
              <div className="flex gap-8">
                {['overview', 'feed'].map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'overview' | 'feed')}
                    className={cn(
                      "px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 relative",
                      activeTab === tab
                        ? "text-white"
                        : theme === 'dark' ? "text-slate-400 hover:text-slate-200" : "text-gray-600 hover:text-gray-900"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === tab && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                        }}
                        layoutId="activeTab"
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                      />
                    )}
                    <span className="relative z-10 capitalize">{tab === 'feed' ? 'Community Feed' : tab}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Community Description */}
                    <div>
                      <h3 className={cn("text-xl font-bold mb-4", theme === 'dark' ? "text-white" : "text-gray-900")}>
                        What You'll Get
                      </h3>
                      <p className={cn("leading-relaxed mb-6", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
                        {community?.description || 'Join this amazing community to connect with like-minded individuals and learn from experts.'}
                      </p>

                      {/* Community Features */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(community?.features || []).map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className={cn("text-sm", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Community Stats */}
                    <div className="grid grid-cols-3 gap-6 py-6">
                      <div className="text-center">
                        <div className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>
                          {(community?.members || 0).toLocaleString()}
                        </div>
                        <div className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-600")}>
                          Members
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>
                          {community?.rating || 5}★
                        </div>
                        <div className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-600")}>
                          Rating
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={cn("text-2xl font-bold", theme === 'dark' ? "text-white" : "text-gray-900")}>
                          24/7
                        </div>
                        <div className={cn("text-sm", theme === 'dark' ? "text-slate-400" : "text-gray-600")}>
                          Access
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'feed' && (
                  <motion.div
                    key="feed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className={cn("text-xl font-bold mb-6", theme === 'dark' ? "text-white" : "text-gray-900")}>
                      Recent Community Activity
                    </h3>

                    {communityPosts.map((post) => (
                      <div
                        key={post.id}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-200",
                          theme === 'dark' ? "bg-slate-700/50 border-slate-600" : "bg-gray-50 border-gray-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.avatar} alt={post.author} />
                            <AvatarFallback className="bg-purple-500 text-white font-semibold">
                              {post.author[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn("font-semibold text-sm", theme === 'dark' ? "text-white" : "text-gray-900")}>
                                {post.author}
                              </span>
                              <span className={cn("text-xs", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                                {post.timeAgo}
                              </span>
                            </div>

                            <p className={cn("text-sm mb-3 leading-relaxed", theme === 'dark' ? "text-slate-300" : "text-gray-700")}>
                              {post.content}
                            </p>

                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
                                  {post.likes}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4 text-blue-500" />
                                <span className={theme === 'dark' ? "text-slate-400" : "text-gray-500"}>
                                  {post.replies}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Row (Bottom Section) */}
            <div className={cn(
              "flex items-center justify-between p-8 border-t",
              theme === 'dark' ? "border-slate-700 bg-slate-800/50" : "border-gray-200 bg-gray-50/50"
            )}>
              {/* XP Requirement Card */}
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl",
                theme === 'dark' ? "bg-slate-700" : "bg-white"
              )}>
                <Zap className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className={cn("text-sm font-semibold", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    {(community?.xpRequired || 0).toLocaleString()} XP to Join
                  </div>
                  <div className={cn("text-xs", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                    {canAfford ? 'You have enough XP!' : `Need ${((community?.xpRequired || 0) - userXP).toLocaleString()} more XP`}
                  </div>
                </div>
              </div>

              {/* Join/Enter Button */}
              <div className="text-right">
                <motion.button
                  onClick={handleJoin}
                  disabled={!canAfford}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-bold text-white text-sm transition-all duration-300 relative overflow-hidden",
                    canAfford
                      ? "cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    background: canAfford
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    boxShadow: canAfford ? '0 8px 25px rgba(139, 92, 246, 0.3)' : 'none'
                  }}
                  whileHover={canAfford ? {
                    scale: 1.02,
                    boxShadow: '0 12px 35px rgba(139, 92, 246, 0.4)'
                  } : {}}
                  whileTap={canAfford ? { scale: 0.98 } : {}}
                  animate={!isJoined && canAfford ? {
                    boxShadow: [
                      '0 8px 25px rgba(139, 92, 246, 0.3)',
                      '0 12px 35px rgba(139, 92, 246, 0.5)',
                      '0 8px 25px rgba(139, 92, 246, 0.3)'
                    ]
                  } : {}}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {/* Join Success Animation */}
                  <AnimatePresence>
                    {showJoinedAnimation && (
                      <motion.div
                        className="absolute inset-0 bg-green-500 flex items-center justify-center"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <span className={showJoinedAnimation ? "opacity-0" : "opacity-100"}>
                    {isJoined ? 'Enter Community' : 'Join Community'}
                  </span>
                </motion.button>

                <p className={cn("text-xs mt-2 max-w-48", theme === 'dark' ? "text-slate-400" : "text-gray-500")}>
                  You'll unlock direct access + updates from creator.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};