import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WatchVideoData } from '../WatchDialogV4';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VideoContainerProps {
  video: WatchVideoData;
  xpProgress: number;
  className?: string;
}

export const VideoContainer = memo<VideoContainerProps>(({
  video,
  xpProgress,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Video player container with glassmorphism */}
      <div className="watch-video-container relative w-full">
        {/* Aspect ratio wrapper */}
        <div className="relative w-full aspect-video">
          <iframe
            className="w-full h-full gpu-accelerated"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              // Ensure no layout shift
              minHeight: '200px',
              // GPU acceleration
              transform: 'translateZ(0)',
              willChange: 'auto'
            }}
          />
        </div>
      </div>

      {/* ZAPs Progress Bar */}
      <motion.div
        className="mt-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="watch-xp-bar bg-neutral-200/60">
          <motion.div
            className="watch-xp-progress"
            style={{ width: `${xpProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* ZAPs Progress text */}
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>Watching progress</span>
          <span className="font-medium">
            +{Math.floor((video.xpReward * xpProgress) / 100)} / {video.xpReward} ⚡ ZAPs
          </span>
        </div>
      </motion.div>

      {/* Video metadata */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h1 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {video.title}
        </h1>

        {/* Creator Section */}
        <motion.div
          className="flex items-center gap-3 mb-4 p-3 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Avatar className="w-10 h-10 shadow-sm">
            <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-400 text-white text-sm font-medium">
              {video.creator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-900">{video.creator.name}</span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-blue-400 text-white text-xs font-medium rounded-full">
                Lv.{Math.floor(Math.random() * 10) + 1}
              </span>
            </div>
            <span className="text-sm text-gray-600">{video.creator.subscribers}</span>
          </div>
        </motion.div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>{video.views} views</span>
          <span>•</span>
          <span>{video.duration}</span>
          <span>•</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            +{video.xpReward} ⚡ ZAPs
          </span>
        </div>

        {/* Video description preview */}
        {video.description && (
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {video.description}
          </p>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {video.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
});

VideoContainer.displayName = 'VideoContainer';