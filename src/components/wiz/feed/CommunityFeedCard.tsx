import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EngagementRow } from './EngagementRow';

export interface CommunityFeedPost {
  id: string;
  type: 'video' | 'text' | 'image';
  community: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    memberCount: number;
  };
  content: {
    title: string;
    body?: string;
    videoId?: string;
    videoThumbnail?: string;
    videoDuration?: string;
    imageUrl?: string;
  };
  author: {
    id: string;
    username: string;
    avatar: string;
    level?: number;
  };
  engagement: {
    upvotes: number;
    downvotes: number;
    comments: number;
    shares: number;
    userVote?: 'up' | 'down' | null;
    saved: boolean;
  };
  meta: {
    timestamp: string;
    views: number;
    xpEarned?: number;
  };
}

interface CommunityFeedCardProps {
  post: CommunityFeedPost;
  onVideoClick?: (post: CommunityFeedPost) => void;
  onCommunityClick?: (communityId: string) => void;
  onEngagement?: (action: 'upvote' | 'downvote' | 'comment' | 'share' | 'save', postId: string) => void;
}

export const CommunityFeedCard: React.FC<CommunityFeedCardProps> = ({
  post,
  onVideoClick,
  onCommunityClick,
  onEngagement
}) => {
  const [videoHovered, setVideoHovered] = useState(false);

  const totalScore = post.engagement.upvotes - post.engagement.downvotes;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "w-full rounded-[28px] overflow-hidden",
        "bg-gradient-to-br from-white/95 via-white/90 to-white/85",
        "dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85",
        "backdrop-blur-xl border border-white/40 dark:border-gray-800/60",
        "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]",
        "dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]",
        "hover:shadow-[0_16px_60px_-16px_rgba(0,0,0,0.12)]",
        "dark:hover:shadow-[0_16px_60px_-16px_rgba(0,0,0,0.7)]",
        "transition-all duration-500"
      )}
    >
      {/* Community Header */}
      <motion.button
        onClick={() => onCommunityClick?.(post.community.id)}
        className={cn(
          "w-full px-8 py-6 flex items-center gap-4",
          "hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50",
          "dark:hover:from-violet-950/30 dark:hover:to-purple-950/30",
          "transition-all duration-300 cursor-pointer group"
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Community Avatar with Glow */}
        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400"
          )} />
          <Avatar className="h-14 w-14 relative ring-4 ring-white/50 dark:ring-gray-800/50 shadow-lg">
            <AvatarImage src={post.community.avatar} alt={post.community.name} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
              {post.community.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Community Info */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
              {post.community.name}
            </h3>
            {post.community.verified && (
              <Sparkles className="w-5 h-5 text-violet-500 fill-violet-500/20" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {post.community.memberCount.toLocaleString()} members
          </p>
        </div>
      </motion.button>

      {/* Separator */}
      <div className="mx-8 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

      {/* Content Body */}
      <div className="px-8 py-6 space-y-5">
        {/* Title */}
        <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
          {post.content.title}
        </h2>

        {/* Video Content */}
        {post.type === 'video' && post.content.videoThumbnail && (
          <motion.div
            className="relative rounded-[18px] overflow-hidden cursor-pointer group"
            onMouseEnter={() => setVideoHovered(true)}
            onMouseLeave={() => setVideoHovered(false)}
            onClick={() => onVideoClick?.(post)}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full">
              <img
                src={post.content.videoThumbnail}
                alt={post.content.title}
                className="w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              )} />

              {/* Play Button */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={videoHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={cn(
                  "w-20 h-20 rounded-full",
                  "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl",
                  "flex items-center justify-center",
                  "shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
                  "border-4 border-white/50 dark:border-gray-800/50"
                )}>
                  <Play className="w-8 h-8 text-violet-600 dark:text-violet-400 fill-current ml-1" />
                </div>
              </motion.div>

              {/* Duration Badge */}
              {post.content.videoDuration && (
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-sm">
                  <span className="text-sm font-medium text-white">{post.content.videoDuration}</span>
                </div>
              )}
            </div>

            {/* Soft Shadow Glow */}
            <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </motion.div>
        )}

        {/* Text/Image Content */}
        {post.type === 'text' && post.content.body && (
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {post.content.body}
          </p>
        )}
      </div>

      {/* Post Meta */}
      <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 text-sm">
          {/* Author */}
          <Avatar className="h-8 w-8 ring-2 ring-white/50 dark:ring-gray-800/50">
            <AvatarImage src={post.author.avatar} alt={post.author.username} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white text-xs">
              {post.author.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              @{post.author.username}
            </span>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <span className="text-gray-600 dark:text-gray-400">posted in</span>
            <span className="font-medium text-violet-600 dark:text-violet-400">
              {post.community.name}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{post.meta.timestamp}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{post.meta.views.toLocaleString()}</span>
            </div>
            {post.meta.xpEarned && (
              <Badge className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                +{post.meta.xpEarned} XP
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Row */}
      <div className="px-8 pb-8">
        <EngagementRow
          upvotes={post.engagement.upvotes}
          downvotes={post.engagement.downvotes}
          score={totalScore}
          comments={post.engagement.comments}
          shares={post.engagement.shares}
          userVote={post.engagement.userVote}
          saved={post.engagement.saved}
          onUpvote={() => onEngagement?.('upvote', post.id)}
          onDownvote={() => onEngagement?.('downvote', post.id)}
          onComment={() => onEngagement?.('comment', post.id)}
          onShare={() => onEngagement?.('share', post.id)}
          onSave={() => onEngagement?.('save', post.id)}
        />
      </div>
    </motion.article>
  );
};
