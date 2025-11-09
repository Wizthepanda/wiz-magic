/**
 * VideoRail - Compact video sidebar (YouTube-style)
 * Fixed position on desktop, 20-30% width
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Video {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  xpReward: number;
  publishedAt?: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface VideoRailProps {
  videos: Video[];
  onVideoClick: (video: Video, index: number) => void;
  className?: string;
}

export const VideoRail: React.FC<VideoRailProps> = ({
  videos,
  onVideoClick,
  className,
}) => {
  if (videos.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white px-4">
          Videos
        </h3>
        <div className="flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <Play className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No videos yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Videos
        </h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </span>
      </div>

      {/* Video List */}
      <div className="space-y-3 px-2">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            onClick={() => onVideoClick(video, index)}
            className={cn(
              'group cursor-pointer',
              'bg-white/40 dark:bg-neutral-800/40 backdrop-blur-sm',
              'border border-zinc-200/50 dark:border-zinc-700/50',
              'rounded-xl overflow-hidden',
              'hover:border-indigo-300 dark:hover:border-indigo-700',
              'hover:shadow-md hover:shadow-indigo-500/5',
              'transition-all duration-300'
            )}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-xs font-medium text-white flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {video.duration}
              </div>

              {/* XP Badge */}
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded flex items-center gap-0.5 shadow-sm">
                <Zap className="w-2.5 h-2.5 text-white" fill="currentColor" />
                <span className="text-xs font-semibold text-white">+{video.xpReward}</span>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-3">
              <h4 className="font-medium text-sm text-zinc-900 dark:text-white line-clamp-2 mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {video.title}
              </h4>

              {/* Meta */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Eye className="w-3 h-3" />
                <span>{video.views}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
