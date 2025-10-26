import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategoryInfinite } from '@/hooks/useCategoryInfinite';
import { CategoryChips, DEFAULT_CATEGORIES } from './CategoryChips';
import { VideoGrid } from './VideoGrid';
import type { Video } from '@/hooks/useCategoryInfinite';

interface SmartDiscoverLayoutProps {
  onVideoSelect?: (video: Video) => void;
  className?: string;
}

/**
 * SmartDiscoverLayout Component
 *
 * Features:
 * - Wraps sidebar + header + filter chips + grid
 * - Animates when sidebar toggles (280px ↔ 80px)
 * - Per-category infinite scroll
 * - Smooth transitions and animations
 * - Responsive to mobile/desktop
 */
export function SmartDiscoverLayout({
  onVideoSelect,
  className
}: SmartDiscoverLayoutProps) {
  const { theme } = useTheme();
  const { isSidebarExpanded } = useLayout();
  const isMobile = useIsMobile();
  const isDark = theme === 'dark';

  const [activeCategory, setActiveCategory] = useState('All');

  // Use infinite scroll hook
  const {
    items: videos,
    loading,
    hasMore,
    error,
    sentinelRef,
    refetch
  } = useCategoryInfinite({
    category: activeCategory,
    limit: 12,
    enabled: true
  });

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Scroll to top when category changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle video click
  const handleVideoClick = (video: Video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  // Calculate container width based on sidebar state
  const sidebarWidth = isMobile ? 0 : (isSidebarExpanded ? 280 : 80);

  return (
    <motion.div
      animate={{
        marginLeft: isMobile ? 0 : sidebarWidth,
        width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`
      }}
      transition={{
        type: 'spring',
        stiffness: 140,
        damping: 20,
        mass: 0.8
      }}
      className={cn(
        "min-h-screen transition-all duration-500",
        className
      )}
      style={{
        background: isDark
          ? 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)'
          : 'linear-gradient(to bottom right, #ffffff, #f7f9fc, #eef1f7)'
      }}
    >
      <div className="w-full px-4 lg:px-6 py-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <h1 className={cn(
            "text-3xl lg:text-4xl font-bold mb-2",
            isDark
              ? "bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          )}>
            Discover
          </h1>
          <p className={cn(
            "text-sm lg:text-base",
            isDark ? "text-dark-text-muted" : "text-gray-600"
          )}>
            Explore trending videos, learn new skills, and earn ZAPs
          </p>
        </motion.div>

        {/* Category Filter Chips - Sticky */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <CategoryChips
            categories={DEFAULT_CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </motion.div>

        {/* Video Grid Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="mt-6"
        >
          {/* Category Header with Count */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="mb-4 flex items-center justify-between"
            >
              <div>
                <h2 className={cn(
                  "text-xl font-semibold",
                  isDark ? "text-dark-text-primary" : "text-gray-900"
                )}>
                  {activeCategory === 'All' ? 'All Videos' : `${activeCategory} Videos`}
                </h2>
                {videos.length > 0 && !loading && (
                  <p className={cn(
                    "text-sm mt-1",
                    isDark ? "text-dark-text-muted" : "text-gray-600"
                  )}>
                    {videos.length} {videos.length === 1 ? 'video' : 'videos'} available
                  </p>
                )}
              </div>

              {/* Refresh Button */}
              {error && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refetch}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium",
                    "bg-gradient-to-r from-indigo-500 to-purple-500",
                    "text-white shadow-md hover:shadow-lg",
                    "transition-shadow duration-200"
                  )}
                >
                  Retry
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Video Grid */}
          <VideoGrid
            videos={videos}
            loading={loading}
            hasMore={hasMore}
            error={error}
            onVideoClick={handleVideoClick}
            onRetry={refetch}
            sentinelRef={sentinelRef}
          />
        </motion.div>

        {/* Stats Footer */}
        {videos.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={cn(
              "mt-12 p-6 rounded-2xl",
              isDark
                ? "bg-dark-bg-secondary/60 border border-dark-surface-300"
                : "bg-white/60 backdrop-blur-sm border border-gray-200"
            )}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  isDark
                    ? "bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                    : "text-indigo-600"
                )}>
                  {videos.length}
                </div>
                <div className={cn(
                  "text-xs",
                  isDark ? "text-dark-text-muted" : "text-gray-600"
                )}>
                  Videos Loaded
                </div>
              </div>

              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  isDark
                    ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    : "text-purple-600"
                )}>
                  {DEFAULT_CATEGORIES.length}
                </div>
                <div className={cn(
                  "text-xs",
                  isDark ? "text-dark-text-muted" : "text-gray-600"
                )}>
                  Categories
                </div>
              </div>

              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  isDark
                    ? "bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent"
                    : "text-pink-600"
                )}>
                  {videos.reduce((sum, v) => sum + v.xpReward, 0)}
                </div>
                <div className={cn(
                  "text-xs",
                  isDark ? "text-dark-text-muted" : "text-gray-600"
                )}>
                  Total ZAPs Available
                </div>
              </div>

              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  isDark
                    ? "bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"
                    : "text-orange-600"
                )}>
                  {hasMore ? '∞' : videos.length}
                </div>
                <div className={cn(
                  "text-xs",
                  isDark ? "text-dark-text-muted" : "text-gray-600"
                )}>
                  {hasMore ? 'More to Explore' : 'All Videos Shown'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
