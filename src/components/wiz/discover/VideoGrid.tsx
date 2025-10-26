import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useLayout } from '@/contexts/LayoutContext';
import type { Video } from '@/hooks/useCategoryInfinite';
import { VideoCard, VideoCardSkeleton } from './VideoCard';

interface VideoGridProps {
  videos: Video[];
  loading?: boolean;
  hasMore?: boolean;
  error?: Error | null;
  onVideoClick: (video: Video) => void;
  onRetry?: () => void;
  sentinelRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

/**
 * VideoGrid Component
 *
 * Features:
 * - 3-column default (responsive to sidebar state)
 * - CSS Grid with auto-fit/minmax
 * - Smooth reflow when sidebar toggles
 * - Loading skeletons
 * - Error state with retry
 * - Infinite scroll sentinel
 * - Framer Motion animations
 */
export function VideoGrid({
  videos,
  loading,
  hasMore,
  error,
  onVideoClick,
  onRetry,
  sentinelRef,
  className
}: VideoGridProps) {
  const { theme } = useTheme();
  const { isSidebarExpanded } = useLayout();
  const isDark = theme === 'dark';

  // Calculate grid columns based on sidebar state
  // Expanded sidebar (280px): more compact grid
  // Collapsed sidebar (80px): wider grid can show more columns
  const gridClasses = cn(
    "grid gap-6 transition-all duration-500 ease-in-out",
    // Mobile: 1 column
    "grid-cols-1",
    // Tablet: 2 columns
    "sm:grid-cols-2",
    // Desktop: 3 columns by default
    "lg:grid-cols-3",
    // Extra large: 4 columns when sidebar collapsed, 3 when expanded
    isSidebarExpanded ? "xl:grid-cols-3 2xl:grid-cols-4" : "xl:grid-cols-4 2xl:grid-cols-5"
  );

  // Error state
  if (error && !loading && videos.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-20 px-4 rounded-2xl",
        isDark
          ? "bg-dark-bg-secondary/60 border border-dark-surface-300"
          : "bg-white/60 backdrop-blur-sm border border-gray-200",
        className
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className={cn(
            "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
            isDark ? "bg-red-500/20" : "bg-red-50"
          )}>
            <AlertCircle className={cn(
              "w-8 h-8",
              isDark ? "text-red-400" : "text-red-500"
            )} />
          </div>

          <div>
            <h3 className={cn(
              "text-xl font-semibold mb-2",
              isDark ? "text-dark-text-primary" : "text-gray-900"
            )}>
              Failed to Load Videos
            </h3>
            <p className={cn(
              "text-sm mb-4",
              isDark ? "text-dark-text-muted" : "text-gray-600"
            )}>
              {error.message || 'Something went wrong. Please try again.'}
            </p>
          </div>

          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className={cn(
                "px-6 py-3 rounded-full font-medium text-sm",
                "bg-gradient-to-r from-indigo-500 to-purple-500",
                "text-white shadow-lg hover:shadow-xl",
                "transition-shadow duration-200"
              )}
            >
              Try Again
            </motion.button>
          )}
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!loading && videos.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-20 px-4 rounded-2xl",
        isDark
          ? "bg-dark-bg-secondary/60 border border-dark-surface-300"
          : "bg-white/60 backdrop-blur-sm border border-gray-200",
        className
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-indigo-100 to-purple-100",
              isDark && "from-indigo-500/20 to-purple-500/20"
            )}
          >
            <span className="text-4xl">📹</span>
          </motion.div>

          <div>
            <h3 className={cn(
              "text-xl font-semibold mb-2",
              isDark ? "text-dark-text-primary" : "text-gray-900"
            )}>
              No Videos Found
            </h3>
            <p className={cn(
              "text-sm",
              isDark ? "text-dark-text-muted" : "text-gray-600"
            )}>
              Try selecting a different category or check back later.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Video Grid */}
      <div className={gridClasses}>
        <AnimatePresence mode="popLayout">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: index < 12 ? index * 0.05 : 0,
                ease: "easeOut"
              }}
              layout
            >
              <VideoCard
                video={video}
                onClick={onVideoClick}
                enablePreview={true}
              />
            </motion.div>
          ))}

          {/* Loading Skeletons */}
          {loading && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <VideoCardSkeleton />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Infinite Scroll Sentinel */}
      {sentinelRef && hasMore && !loading && (
        <div
          ref={sentinelRef}
          className="h-20 flex items-center justify-center mt-8"
          aria-hidden="true"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={cn(
              "w-8 h-8 rounded-full border-2 border-t-transparent",
              isDark
                ? "border-purple-400"
                : "border-indigo-500"
            )}
          />
        </div>
      )}

      {/* End of Results Message */}
      {!hasMore && videos.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className={cn(
            "text-sm",
            isDark ? "text-dark-text-muted" : "text-gray-500"
          )}>
            You've reached the end. Check back soon for more content!
          </p>
        </motion.div>
      )}
    </div>
  );
}
