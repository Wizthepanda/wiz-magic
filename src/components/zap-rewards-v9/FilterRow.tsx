/**
 * FilterRow - Two-tier sticky filter system
 * Row A: Monetization filters (single-select)
 * Row B: Category filters (multi-select)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MONETIZATION_FILTERS, CATEGORY_FILTERS, GLASS_STYLES, A11Y_LABELS } from './constants';
import type { MonetizationType, RewardCategory } from './types';

interface FilterRowProps {
  selectedMonetization: 'all' | MonetizationType;
  selectedCategories: RewardCategory[];
  onMonetizationChange: (monetization: 'all' | MonetizationType) => void;
  onCategoryToggle: (category: RewardCategory) => void;
  className?: string;
}

export const FilterRow: React.FC<FilterRowProps> = ({
  selectedMonetization,
  selectedCategories,
  onMonetizationChange,
  onCategoryToggle,
  className,
}) => {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 dark:border-gray-800/10',
        'bg-white/80 dark:bg-gray-900/80',
        className
      )}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row A: Monetization Filters (Single Select) */}
        <div className="py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">
              Payment Type:
            </span>
            <div className="flex gap-2">
              {MONETIZATION_FILTERS.map((filter) => {
                const isActive = selectedMonetization === filter.id;
                return (
                  <motion.button
                    key={filter.id}
                    onClick={() => onMonetizationChange(filter.id)}
                    className={cn(
                      GLASS_STYLES.pill,
                      'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                      'hover:scale-105 active:scale-95',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
                    )}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${A11Y_LABELS.filterByMonetization}: ${filter.label}`}
                    aria-pressed={isActive}
                  >
                    {filter.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row B: Category Filters (Multi Select) */}
        <div className="py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">
              Categories:
            </span>
            <div className="flex gap-2">
              {CATEGORY_FILTERS.map((filter) => {
                const isAll = filter.id === 'all';
                const isActive = isAll
                  ? selectedCategories.length === 0
                  : selectedCategories.includes(filter.id as RewardCategory);
                const Icon = filter.icon;

                return (
                  <motion.button
                    key={filter.id}
                    onClick={() => {
                      if (isAll) {
                        // Clear all categories
                        selectedCategories.forEach((cat) => onCategoryToggle(cat));
                      } else {
                        onCategoryToggle(filter.id as RewardCategory);
                      }
                    }}
                    className={cn(
                      GLASS_STYLES.pill,
                      'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                      'hover:scale-105 active:scale-95 flex items-center gap-2',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
                    )}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`${A11Y_LABELS.filterByCategory}: ${filter.label}`}
                    aria-pressed={isActive}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile-optimized FilterRow with horizontal scroll
 */
export const MobileFilterRow: React.FC<FilterRowProps> = ({
  selectedMonetization,
  selectedCategories,
  onMonetizationChange,
  onCategoryToggle,
  className,
}) => {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 dark:border-gray-800/10',
        'bg-white/80 dark:bg-gray-900/80',
        className
      )}
    >
      {/* Row A: Monetization Filters (Compact) */}
      <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {MONETIZATION_FILTERS.map((filter) => {
            const isActive = selectedMonetization === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onMonetizationChange(filter.id)}
                className={cn(
                  GLASS_STYLES.pill,
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-sm'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                aria-label={`${A11Y_LABELS.filterByMonetization}: ${filter.label}`}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row B: Category Filters (Compact with Icons) */}
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_FILTERS.map((filter) => {
            const isAll = filter.id === 'all';
            const isActive = isAll
              ? selectedCategories.length === 0
              : selectedCategories.includes(filter.id as RewardCategory);
            const Icon = filter.icon;

            return (
              <button
                key={filter.id}
                onClick={() => {
                  if (isAll) {
                    selectedCategories.forEach((cat) => onCategoryToggle(cat));
                  } else {
                    onCategoryToggle(filter.id as RewardCategory);
                  }
                }}
                className={cn(
                  GLASS_STYLES.pill,
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                  'flex items-center gap-1.5',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-sm'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                aria-label={`${A11Y_LABELS.filterByCategory}: ${filter.label}`}
                aria-pressed={isActive}
              >
                <Icon className="w-3.5 h-3.5" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
