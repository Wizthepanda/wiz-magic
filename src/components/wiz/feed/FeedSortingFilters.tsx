import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeedSortOption = 'hot' | 'top-today' | 'top-week' | 'top-month' | 'new';

interface FeedSortingFiltersProps {
  activeSort: FeedSortOption;
  onSortChange: (sort: FeedSortOption) => void;
}

const SORT_OPTIONS: {
  id: FeedSortOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: {
    bg: string;
    hover: string;
    active: string;
    shadow: string;
  };
}[] = [
  {
    id: 'hot',
    label: 'Hot',
    icon: Flame,
    gradient: {
      bg: 'from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/30 dark:via-red-950/30 dark:to-pink-950/30',
      hover: 'from-orange-100 via-red-100 to-pink-100 dark:from-orange-900/40 dark:via-red-900/40 dark:to-pink-900/40',
      active: 'from-orange-500 via-red-500 to-pink-500',
      shadow: 'shadow-orange-500/20 dark:shadow-orange-500/40'
    }
  },
  {
    id: 'top-today',
    label: 'Top Today',
    icon: TrendingUp,
    gradient: {
      bg: 'from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-sky-950/30',
      hover: 'from-blue-100 via-cyan-100 to-sky-100 dark:from-blue-900/40 dark:via-cyan-900/40 dark:to-sky-900/40',
      active: 'from-blue-500 via-cyan-500 to-sky-500',
      shadow: 'shadow-blue-500/20 dark:shadow-blue-500/40'
    }
  },
  {
    id: 'top-week',
    label: 'Top Week',
    icon: Calendar,
    gradient: {
      bg: 'from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30',
      hover: 'from-violet-100 via-purple-100 to-fuchsia-100 dark:from-violet-900/40 dark:via-purple-900/40 dark:to-fuchsia-900/40',
      active: 'from-violet-500 via-purple-500 to-fuchsia-500',
      shadow: 'shadow-violet-500/20 dark:shadow-violet-500/40'
    }
  },
  {
    id: 'top-month',
    label: 'Top Month',
    icon: CalendarDays,
    gradient: {
      bg: 'from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30',
      hover: 'from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-teal-900/40',
      active: 'from-green-500 via-emerald-500 to-teal-500',
      shadow: 'shadow-green-500/20 dark:shadow-green-500/40'
    }
  },
  {
    id: 'new',
    label: 'New',
    icon: Clock,
    gradient: {
      bg: 'from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30',
      hover: 'from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900/40 dark:via-yellow-900/40 dark:to-orange-900/40',
      active: 'from-amber-500 via-yellow-500 to-orange-500',
      shadow: 'shadow-amber-500/20 dark:shadow-amber-500/40'
    }
  }
];

export const FeedSortingFilters: React.FC<FeedSortingFiltersProps> = ({
  activeSort,
  onSortChange
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  return (
    <div className="relative w-full">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = activeSort === option.id;

          return (
            <motion.button
              key={option.id}
              onClick={() => onSortChange(option.id)}
              className={cn(
                "relative flex items-center gap-2.5 px-6 py-3.5 rounded-full",
                "transition-all duration-300 whitespace-nowrap group",
                "border-2",
                isActive
                  ? [
                      `bg-gradient-to-r ${option.gradient.active}`,
                      "border-white/30 dark:border-gray-800/30",
                      `shadow-lg ${option.gradient.shadow}`,
                      "text-white"
                    ]
                  : [
                      `bg-gradient-to-r ${option.gradient.bg}`,
                      "border-gray-200/50 dark:border-gray-700/50",
                      "hover:border-gray-300 dark:hover:border-gray-600",
                      "text-gray-700 dark:text-gray-300"
                    ]
              )}
              whileHover={{ scale: isActive ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active Glow Effect */}
              {isActive && (
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-full blur-xl opacity-50",
                    `bg-gradient-to-r ${option.gradient.active}`
                  )}
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  "w-5 h-5 relative z-10 transition-transform duration-300",
                  isActive
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-400 group-hover:scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />

              {/* Label */}
              <span className={cn(
                "font-semibold text-sm relative z-10",
                isActive
                  ? "text-white"
                  : "text-gray-700 dark:text-gray-300"
              )}>
                {option.label}
              </span>

              {/* Hover Gradient Overlay */}
              {!isActive && (
                <div
                  className={cn(
                    "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    `bg-gradient-to-r ${option.gradient.hover}`
                  )}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Fade Edges for Scroll Indication */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
