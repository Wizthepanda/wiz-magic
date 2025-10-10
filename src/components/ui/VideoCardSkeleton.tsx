import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VideoCardSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Premium skeleton loader for video cards
 * Matches the design of the actual video cards in WIZUPDashboardV12_5
 */
export const VideoCardSkeleton = ({ count = 12, className }: VideoCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={`skeleton-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.05,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className={cn("relative overflow-hidden rounded-2xl", className)}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Thumbnail skeleton */}
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />

            {/* Duration pill skeleton */}
            <div
              className="absolute bottom-3 right-3 w-14 h-6 rounded-full"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)'
              }}
            />
          </div>

          {/* Content skeleton */}
          <div className="p-5 space-y-4">
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-full" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            </div>

            {/* Creator row skeleton */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div className="h-3 bg-slate-200 rounded-md w-24" />
            </div>

            {/* Meta row skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-3 bg-slate-200 rounded-md w-16" />
                <div className="h-3 bg-slate-200 rounded-md w-12" />
              </div>
              <div className="h-6 bg-slate-200 rounded-full w-16" />
            </div>
          </div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: index * 0.1
            }}
          />
        </motion.div>
      ))}
    </>
  );
};

/**
 * Compact skeleton for loading more videos at the bottom
 */
export const VideoCardSkeletonCompact = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-3 gap-6 px-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={`compact-skeleton-${index}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05
          }}
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
          }}
        >
          <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
