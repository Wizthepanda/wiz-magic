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
          className="group cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Duration */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded-lg text-xs font-semibold text-white">
              {video.duration}
            </div>

            {/* XP Badge */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center gap-1">
              <Zap className="w-3 h-3 text-white" fill="currentColor" />
              <span className="text-xs font-semibold text-white">+{video.xpReward}</span>
            </div>
          </div>

          {/* Video Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-purple-500 transition-colors">
              {video.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span>{video.views}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
