import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export interface Category {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryChipsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

/**
 * CategoryChips Component
 *
 * Features:
 * - Sticky horizontal scrollable chips
 * - Smooth gradient glow for active chip
 * - Hide native scrollbar
 * - Momentum scrolling
 * - Keyboard accessible
 */
export function CategoryChips({
  categories,
  activeCategory,
  onCategoryChange,
  className
}: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Auto-scroll to active chip when category changes
  useEffect(() => {
    if (activeChipRef.current && scrollRef.current) {
      const chipRect = activeChipRef.current.getBoundingClientRect();
      const containerRect = scrollRef.current.getBoundingClientRect();

      // Check if chip is out of view
      if (chipRect.left < containerRect.left || chipRect.right > containerRect.right) {
        activeChipRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeCategory]);

  return (
    <div className={cn("sticky top-0 z-40 py-4", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-3 overflow-x-auto scrollbar-hide",
          "scroll-smooth overscroll-x-contain",
          // Fade gradient edges
          "relative",
          "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-8 before:pointer-events-none before:z-10",
          "after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:pointer-events-none after:z-10",
          isDark
            ? "before:bg-gradient-to-r before:from-slate-900 before:to-transparent after:bg-gradient-to-l after:from-slate-900 after:to-transparent"
            : "before:bg-gradient-to-r before:from-white before:to-transparent after:bg-gradient-to-l after:from-white after:to-transparent"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex gap-3 px-1">
          {categories.map((category) => {
            const isActive = category.id === activeCategory;

            return (
              <motion.button
                key={category.id}
                ref={isActive ? activeChipRef : null}
                onClick={() => onCategoryChange(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative px-5 py-2.5 rounded-full whitespace-nowrap",
                  "font-medium text-sm transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isActive
                    ? cn(
                        "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400",
                        "text-white shadow-lg",
                        isDark
                          ? "shadow-purple-500/50 focus:ring-purple-500"
                          : "shadow-purple-500/30 focus:ring-purple-400"
                      )
                    : cn(
                        "text-gray-600 hover:text-gray-900",
                        isDark
                          ? "bg-dark-bg-secondary/60 backdrop-blur-sm border border-dark-surface-300 hover:bg-dark-bg-tertiary/80"
                          : "bg-white/40 backdrop-blur-sm border border-gray-200 hover:bg-white/70",
                        "focus:ring-gray-400"
                      )
                )}
                aria-pressed={isActive}
                aria-label={`Filter by ${category.label}`}
              >
                {/* Glow effect for active chip */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-300 opacity-40 blur-md"
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30
                    }}
                  />
                )}

                {/* Content */}
                <span className="relative z-10 flex items-center gap-2">
                  {category.icon && <span>{category.icon}</span>}
                  {category.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'All', label: 'All', icon: '🌐' },
  { id: 'Tech', label: 'Tech', icon: '💻' },
  { id: 'Money', label: 'Money', icon: '💰' },
  { id: 'Design', label: 'Design', icon: '🎨' },
  { id: 'Marketing', label: 'Marketing', icon: '📈' },
  { id: 'Business', label: 'Business', icon: '💼' },
  { id: 'Health', label: 'Health', icon: '🏃' },
  { id: 'Education', label: 'Education', icon: '📚' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎬' }
];
