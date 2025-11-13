import React from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, List, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedSortingFilters, FeedSortOption } from './feed/FeedSortingFilters';

export type ViewMode = 'single' | 'feed' | 'grid';

interface HeaderFiltersAndViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeSort?: FeedSortOption;
  onSortChange?: (sort: FeedSortOption) => void;
  showFilters?: boolean;
  className?: string;
}

/**
 * HeaderFiltersAndViewToggle
 * Unified header component that combines filter pills and view mode toggle
 * on the same horizontal baseline, eliminating vertical gaps
 */
export const HeaderFiltersAndViewToggle: React.FC<HeaderFiltersAndViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  activeSort = 'hot',
  onSortChange,
  showFilters = true,
  className,
}) => {
  return (
    <div className={cn('w-full flex justify-center', className)}>
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        {/* Unified row with glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'bg-white/60 dark:bg-gray-900/60',
            'backdrop-blur-xl',
            'border border-white/30 dark:border-gray-800/30',
            'rounded-2xl',
            'p-3',
            'flex items-center justify-between gap-4',
            'shadow-[0_6px_20px_rgba(11,15,32,0.06)]',
            'dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)]',
            // Subtle divider effect below
            'relative',
            'after:absolute after:bottom-0 after:left-0 after:right-0',
            'after:translate-y-full after:h-px',
            'after:bg-gradient-to-r after:from-transparent after:via-gray-200/40 after:to-transparent',
            'dark:after:via-gray-700/40'
          )}
        >
          {/* Filter pills row (scrollable) */}
          {showFilters && onSortChange && (
            <div className="flex-1 min-w-0">
              <div
                className="overflow-x-auto scrollbar-hide py-1"
                role="navigation"
                aria-label="Feed filter categories"
              >
                <FeedSortingFilters activeSort={activeSort} onSortChange={onSortChange} />
              </div>
            </div>
          )}

          {/* View mode toggle - compact icons */}
          <div className="flex-shrink-0 ml-4">
            <div
              className={cn(
                'inline-flex items-center gap-1 rounded-full',
                'bg-white/70 dark:bg-gray-800/70',
                'backdrop-blur-sm',
                'px-1.5 py-1.5',
                'shadow-sm',
                'border border-white/20 dark:border-gray-700/20'
              )}
              role="tablist"
              aria-label="View mode selector"
            >
              <ViewToggleIcon
                active={viewMode === 'single'}
                onClick={() => onViewModeChange('single')}
                ariaLabel="Single feed view"
                icon={<Layers className="w-4 h-4" strokeWidth={2.5} />}
              />
              <ViewToggleIcon
                active={viewMode === 'feed'}
                onClick={() => onViewModeChange('feed')}
                ariaLabel="Multi feed view"
                icon={<List className="w-4 h-4" strokeWidth={2.5} />}
              />
              <ViewToggleIcon
                active={viewMode === 'grid'}
                onClick={() => onViewModeChange('grid')}
                ariaLabel="Grid view"
                icon={<Grid3x3 className="w-4 h-4" strokeWidth={2.5} />}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/**
 * ViewToggleIcon
 * Individual icon button for view mode toggle
 */
interface ViewToggleIconProps {
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  icon: React.ReactNode;
}

const ViewToggleIcon: React.FC<ViewToggleIconProps> = ({
  active,
  onClick,
  ariaLabel,
  icon,
}) => {
  return (
    <motion.button
      onClick={onClick}
      aria-label={ariaLabel}
      role="tab"
      aria-selected={active}
      whileHover={{ scale: active ? 1 : 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'relative flex items-center justify-center',
        'w-9 h-9 rounded-lg',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
        'focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
        active
          ? [
              'bg-gradient-to-r from-indigo-600 to-violet-600',
              'text-white',
              'shadow-[0_6px_18px_rgba(99,102,241,0.25)]',
              'dark:shadow-[0_6px_18px_rgba(139,92,246,0.35)]',
            ]
          : [
              'text-gray-600 dark:text-gray-400',
              'hover:bg-white/80 dark:hover:bg-gray-700/50',
              'hover:text-gray-900 dark:hover:text-gray-200',
            ]
      )}
    >
      {/* Active indicator glow */}
      {active && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 blur-md opacity-40"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Icon */}
      <span className="relative z-10">{icon}</span>

      {/* Screen reader text */}
      <span className="sr-only">{ariaLabel}</span>
    </motion.button>
  );
};
