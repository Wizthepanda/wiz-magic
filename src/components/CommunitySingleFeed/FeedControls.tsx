import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedControlsProps {
  currentIndex: number;
  totalPosts: number;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  className?: string;
}

/**
 * FeedControls Component
 * Navigation controls for single-post feed
 * Includes Previous/Next buttons and keyboard hints
 */
export const FeedControls: React.FC<FeedControlsProps> = ({
  currentIndex,
  totalPosts,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Previous Button */}
      <motion.div whileHover={{ scale: canGoPrevious ? 1.05 : 1 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="outline"
          size="lg"
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-full',
            'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg',
            'border border-gray-200 dark:border-gray-700',
            'transition-all duration-300',
            'hover:bg-white dark:hover:bg-slate-800',
            'hover:shadow-lg',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2'
          )}
          aria-label="Previous post"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-semibold">Previous</span>
        </Button>
      </motion.div>

      {/* Position Indicator */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'px-4 py-2 rounded-full',
            'bg-gradient-to-r from-violet-50 to-purple-50',
            'dark:from-violet-950/30 dark:to-purple-950/30',
            'border border-violet-200/50 dark:border-violet-800/50'
          )}
        >
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {currentIndex + 1} <span className="text-gray-500 dark:text-gray-400">of</span>{' '}
            {totalPosts}
          </span>
        </div>

        {/* Keyboard hint */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <kbd
            className={cn(
              'px-2 py-1 rounded',
              'bg-gray-100 dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600',
              'font-mono text-xs'
            )}
          >
            ←
          </kbd>
          <span>/</span>
          <kbd
            className={cn(
              'px-2 py-1 rounded',
              'bg-gray-100 dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600',
              'font-mono text-xs'
            )}
          >
            →
          </kbd>
          <span>to navigate</span>
        </div>
      </div>

      {/* Next Button */}
      <motion.div whileHover={{ scale: canGoNext ? 1.05 : 1 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          variant="outline"
          size="lg"
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-full',
            'bg-gradient-to-r from-violet-500 to-purple-600',
            'text-white border-0',
            'transition-all duration-300',
            'hover:from-violet-600 hover:to-purple-700',
            'hover:shadow-xl hover:shadow-violet-500/30',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400',
            'focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2'
          )}
          aria-label="Next post"
        >
          <span className="font-semibold">Next</span>
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </Button>
      </motion.div>
    </div>
  );
};
