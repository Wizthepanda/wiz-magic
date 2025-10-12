/**
 * Video Grid Skeleton Loader
 *
 * Animated shimmer skeleton for video grids while loading.
 * Provides smooth visual feedback during YouTube video fetch.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VideoGridSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Shimmer animation component
 */
const ShimmerEffect = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    transition={{
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    }}
  />
);

/**
 * Single video card skeleton
 */
export const VideoCardSkeleton = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200',
      'dark:from-slate-800 dark:to-slate-900',
      className
    )}
  >
    {/* Thumbnail skeleton */}
    <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-700">
      <ShimmerEffect />
    </div>

    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <ShimmerEffect />
        </div>
        <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 overflow-hidden">
          <ShimmerEffect />
        </div>
      </div>

      {/* Channel info skeleton */}
      <div className="flex items-center gap-3">
        {/* Avatar skeleton */}
        <div className="relative w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0">
          <ShimmerEffect />
        </div>
        {/* Channel name skeleton */}
        <div className="flex-1">
          <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-2/3 overflow-hidden">
            <ShimmerEffect />
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="flex items-center gap-4">
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-20 overflow-hidden">
          <ShimmerEffect />
        </div>
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-16 overflow-hidden">
          <ShimmerEffect />
        </div>
      </div>
    </div>
  </motion.div>
);

/**
 * Grid of video card skeletons
 */
export const VideoGridSkeleton = ({ count = 12, className }: VideoGridSkeletonProps) => {
  return (
    <div
      className={cn(
        'grid gap-6',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <VideoCardSkeleton
          key={index}
          className="animate-pulse"
        />
      ))}
    </div>
  );
};

/**
 * Compact list skeleton for smaller spaces
 */
export const VideoListSkeleton = ({ count = 6, className }: VideoGridSkeletonProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800"
        >
          {/* Thumbnail skeleton */}
          <div className="relative w-32 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
            <ShimmerEffect />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-full overflow-hidden">
              <ShimmerEffect />
            </div>
            <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4 overflow-hidden">
              <ShimmerEffect />
            </div>
            <div className="flex gap-3">
              <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-20 overflow-hidden">
                <ShimmerEffect />
              </div>
              <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-16 overflow-hidden">
                <ShimmerEffect />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Channel header skeleton
 */
export const ChannelHeaderSkeleton = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={cn(
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-6',
      'dark:from-slate-800 dark:to-slate-900',
      className
    )}
  >
    <div className="flex items-center gap-6">
      {/* Avatar skeleton */}
      <div className="relative w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0">
        <ShimmerEffect />
      </div>

      {/* Info skeleton */}
      <div className="flex-1 space-y-3">
        <div className="relative h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3 overflow-hidden">
          <ShimmerEffect />
        </div>
        <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2 overflow-hidden">
          <ShimmerEffect />
        </div>
        <div className="flex gap-4">
          <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-24 overflow-hidden">
            <ShimmerEffect />
          </div>
          <div className="relative h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-24 overflow-hidden">
            <ShimmerEffect />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default VideoGridSkeleton;
