/**
 * VerticalVideoList - Vertical list of creator videos (YouTube-style)
 * Single column, each video is a horizontal card
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

interface VerticalVideoListProps {
  videos: Video[];
  onVideoClick: (video: Video, index: number) => void;
  className?: string;
}

export const VerticalVideoList: React.FC<VerticalVideoListProps> = ({
  videos,
  onVideoClick,
  className,
}) => {
  if (videos.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Play className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-600 dark:text-zinc-400">No videos yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          onClick={() => onVideoClick(video, index)}
          className={cn(
            'group cursor-pointer',
            'flex gap-4',
            'bg-white dark:bg-neutral-800',
            'rounded-xl overflow-hidden',
            'border border-zinc-200 dark:border-zinc-700',
            'hover:border-indigo-300 dark:hover:border-indigo-700',
            'hover:shadow-lg hover:shadow-indigo-500/10',
            'transition-all duration-300'
          )}
        >
          {/* Thumbnail */}
          <div className="relative w-48 sm:w-56 flex-shrink-0 aspect-video bg-zinc-100 dark:bg-zinc-800">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Duration */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-xs font-medium text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {video.duration}
            </div>

            {/* XP Badge */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-md flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 text-white" fill="currentColor" />
              <span className="text-xs font-semibold text-white">+{video.xpReward}</span>
            </div>
          </div>

          {/* Video Info */}
          <div className="flex-1 py-4 pr-4 min-w-0">
            <h3 className="font-semibold text-base text-zinc-900 dark:text-white line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {video.title}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{video.views}</span>
              </div>

              {video.publishedAt && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>

            {/* Creator info (optional, can be hidden if on creator's own page) */}
            <div className="flex items-center gap-2 mt-auto">
              {video.creator.avatar && (
                <img
                  src={video.creator.avatar}
                  alt={video.creator.name}
                  className="w-6 h-6 rounded-full object-cover"
                  loading="lazy"
                />
              )}
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {video.creator.name}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
