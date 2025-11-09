/**
 * CreatorVideoGrid - Grid of creator's videos
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoData } from '@/contexts/PlayerContext';

interface CreatorVideoGridProps {
  videos: VideoData[];
  onVideoClick: (video: VideoData, index: number) => void;
}

export const CreatorVideoGrid: React.FC<CreatorVideoGridProps> = ({ videos, onVideoClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          onClick={() => onVideoClick(video, index)}
          className={cn(
            'group cursor-pointer',
            'rounded-xl overflow-hidden',
            'shadow-sm hover:shadow-md',
            'hover:-translate-y-[2px]',
            'transition-all duration-300'
          )}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
            />

            {/* Overlay on hover - softer luxury feel */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Duration - subtle */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs font-medium text-white">
              {video.duration}
            </div>

            {/* XP Badge - softer gradient */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-400/90 to-pink-400/90 backdrop-blur-sm rounded-md flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 text-white" fill="currentColor" />
              <span className="text-xs font-semibold text-white">+{video.xpReward}</span>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-3 bg-white dark:bg-neutral-900">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1.5 text-sm leading-snug">
              {video.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{video.views}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
