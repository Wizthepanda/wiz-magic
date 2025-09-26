import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface VideoSkeletonProps {
  index?: number;
  className?: string;
}

const VideoSkeleton: React.FC<VideoSkeletonProps> = ({ index = 0, className }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      className={cn(
        "relative rounded-xl overflow-hidden",
        "backdrop-blur-xl backdrop-saturate-150",
        isDark
          ? "bg-white/5 border border-white/10"
          : "bg-white/70 border border-black/5",
        className
      )}
    >
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video overflow-hidden">
        <motion.div
          className={cn(
            "w-full h-full relative",
            isDark ? "bg-gray-800/50" : "bg-gray-200/70"
          )}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.1
            }}
          />
        </motion.div>

        {/* Top right badges skeleton */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <div className={cn(
            "w-12 h-5 rounded-md",
            isDark ? "bg-gray-700/70" : "bg-gray-300/70"
          )} />
          <div className={cn(
            "w-16 h-5 rounded-md",
            isDark ? "bg-gray-700/70" : "bg-gray-300/70"
          )} />
        </div>

        {/* Bottom info skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {/* Avatar skeleton */}
              <div className={cn(
                "w-6 h-6 rounded-full",
                isDark ? "bg-gray-700/70" : "bg-gray-300/70"
              )} />
              {/* Name skeleton */}
              <div className={cn(
                "w-20 h-4 rounded",
                isDark ? "bg-gray-700/70" : "bg-gray-300/70"
              )} />
            </div>
            {/* ZAPS skeleton */}
            <div className={cn(
              "w-12 h-4 rounded",
              isDark ? "bg-gray-700/70" : "bg-gray-300/70"
            )} />
          </div>
        </div>
      </div>

      {/* Card content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton - 2 lines */}
        <div className="space-y-2">
          <div className={cn(
            "w-full h-4 rounded",
            isDark ? "bg-gray-800/50" : "bg-gray-200/70"
          )} />
          <div className={cn(
            "w-3/4 h-4 rounded",
            isDark ? "bg-gray-800/50" : "bg-gray-200/70"
          )} />
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-1">
          <div className={cn(
            "w-12 h-6 rounded-full",
            isDark ? "bg-gray-800/50" : "bg-gray-200/70"
          )} />
          <div className={cn(
            "w-16 h-6 rounded-full",
            isDark ? "bg-gray-800/50" : "bg-gray-200/70"
          )} />
          <div className={cn(
            "w-14 h-6 rounded-full",
            isDark ? "bg-gray-800/50" : "bg-gray-200/70"
          )} />
        </div>
      </div>

      {/* Pulse animation overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          opacity: [0, 0.1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.2
        }}
        style={{
          background: isDark
            ? 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)'
            : 'linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.05) 50%, transparent 70%)'
        }}
      />
    </motion.div>
  );
};

export default VideoSkeleton;