import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterOption = 'hot' | 'top' | 'new' | 'rising';

interface FilterRowProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  className?: string;
}

const FILTERS: { value: FilterOption; label: string; icon: React.ElementType }[] = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'top', label: 'Top', icon: Award },
  { value: 'new', label: 'New', icon: Clock },
  { value: 'rising', label: 'Rising', icon: TrendingUp },
];

/**
 * FilterRow Component
 * Sorting/filtering controls for the feed
 */
export const FilterRow: React.FC<FilterRowProps> = ({
  activeFilter,
  onFilterChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-full',
        'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg',
        'border border-gray-200 dark:border-gray-700',
        'shadow-lg',
        className
      )}
      role="tablist"
      aria-label="Feed filters"
    >
      {FILTERS.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;

        return (
          <motion.button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full',
              'font-medium text-sm transition-all duration-300',
              isActive
                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${filter.value}-panel`}
          >
            <Icon className="w-4 h-4" strokeWidth={2.5} />
            <span>{filter.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
