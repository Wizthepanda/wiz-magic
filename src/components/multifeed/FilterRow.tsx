import { motion } from 'framer-motion';
import { categories } from '@/lib/feed-utils';
import { cn } from '@/lib/utils';

interface FilterRowProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function FilterRow({ activeCategory, onCategoryChange }: FilterRowProps) {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-6xl px-4">
        <div className="relative">
          {/* Category pills */}
          <div
            className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-none scroll-smooth"
            role="tablist"
            aria-label="Content categories"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((category) => {
              const isActive = activeCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={cn(
                    'relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium',
                    'transition-all duration-300 flex items-center gap-2',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent',
                    isActive
                      ? 'bg-gradient-to-r text-white shadow-lg'
                      : 'bg-white/6 text-neutral-300 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                  )}
                  style={
                    isActive
                      ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }
                      : undefined
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`category-${category.id}-panel`}
                >
                  {/* Dot indicator */}
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      category.dotColor,
                      isActive && 'shadow-lg'
                    )}
                  />
                  {category.label}

                  {/* Active indicator glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Fade edges for horizontal scroll indication */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0a0a0f] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent" />
        </div>
      </div>
    </div>
  );
}
