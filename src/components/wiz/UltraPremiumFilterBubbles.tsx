import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface FilterCategory {
  id: string;
  label: string;
  description?: string;
  count?: number;
}

const premiumCategories: FilterCategory[] = [
  { id: 'all', label: 'All', description: 'Everything available', count: 1247 },
  { id: 'trending', label: 'Trending', description: 'Hot right now', count: 89 },
  { id: 'new', label: 'New', description: 'Recently added', count: 156 },
  { id: 'top-rated', label: 'Top Rated', description: 'Highest quality', count: 324 },
  { id: 'free', label: 'Free', description: 'No cost content', count: 567 },
  { id: 'premium', label: 'Premium', description: 'Exclusive content', count: 234 },
  { id: 'tech', label: 'Tech', description: 'Technology focused', count: 445 },
  { id: 'design', label: 'Design', description: 'Creative & visual', count: 298 },
  { id: 'business', label: 'Business', description: 'Entrepreneurship', count: 387 },
  { id: 'health', label: 'Health', description: 'Wellness & fitness', count: 203 },
  { id: 'education', label: 'Education', description: 'Learning content', count: 512 },
];

interface UltraPremiumFilterBubblesProps {
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  className?: string;
}

const UltraPremiumFilterBubbles: React.FC<UltraPremiumFilterBubblesProps> = ({
  activeFilter,
  onFilterChange,
  className
}) => {
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isDark = theme === 'dark';

  // Motion values for scroll interactions
  const scrollX = useMotionValue(0);
  const scrollVelocity = useMotionValue(0);

  // Spring physics for smooth interactions
  const springConfig = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8
  };

  // Handle scroll events for parallax shimmer
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        scrollX.set(scrollLeft);
        setIsScrolling(true);

        // Clear scrolling state after animation
        setTimeout(() => setIsScrolling(false), 150);
      }
    };

    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [scrollX]);

  // Tooltip management
  const handleMouseEnter = (filterId: string) => {
    if (!isMobile) {
      setHoveredFilter(filterId);
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(filterId);
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    setHoveredFilter(null);
    setShowTooltip(null);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  // Individual bubble component
  const FilterBubble: React.FC<{
    category: FilterCategory;
    isActive: boolean;
    index: number;
  }> = ({ category, isActive, index }) => {
    const bubbleRef = useRef<HTMLButtonElement>(null);
    const isHovered = hoveredFilter === category.id;

    // Parallax shimmer effect based on scroll
    const shimmerOffset = useTransform(
      scrollX,
      [index * 100 - 200, index * 100, index * 100 + 200],
      [-100, 0, 100]
    );

    return (
      <motion.div className="relative flex-shrink-0">
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip === category.id && category.description && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className={cn(
                "px-3 py-2 rounded-lg backdrop-blur-xl border text-xs font-medium whitespace-nowrap",
                isDark
                  ? "bg-gray-800/90 border-gray-600/50 text-gray-200"
                  : "bg-white/90 border-gray-200/50 text-gray-700"
              )}>
                {category.description}
                {category.count && (
                  <span className="ml-2 text-gray-400">
                    ({category.count})
                  </span>
                )}
                {/* Tooltip arrow */}
                <div className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45",
                  isDark ? "bg-gray-800/90" : "bg-white/90"
                )} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main bubble */}
        <motion.button
          ref={bubbleRef}
          onClick={() => onFilterChange(category.id)}
          onMouseEnter={() => handleMouseEnter(category.id)}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative px-8 py-4 rounded-full font-medium text-sm transition-all duration-500 ease-out overflow-hidden",
            "backdrop-blur-xl backdrop-saturate-150 border select-none",
            "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
            isActive
              ? "text-white shadow-2xl border-transparent"
              : isDark
                ? "text-gray-300 hover:text-white border-gray-600/20 hover:border-gray-500/30"
                : "text-gray-600 hover:text-gray-800 border-gray-300/20 hover:border-gray-400/30"
          )}
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: '0.02em',
            fontWeight: 500,
            background: isActive
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
              : isDark
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.7)',
          }}
          whileHover={{
            scale: 1.02,
            y: -2,
            transition: springConfig
          }}
          whileTap={{
            scale: 0.95,
            transition: { ...springConfig, stiffness: 600 }
          }}
        >
          {/* Glassmorphism background layer */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: isDark
                ? 'rgba(255, 255, 255, 0.02)'
                : 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(20px) saturate(150%)',
            }}
            animate={{
              opacity: isHovered && !isActive ? 0.8 : 0.5
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Breathing gradient animation for active state */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full opacity-40"
              animate={{
                background: [
                  'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                  'linear-gradient(135deg, #764ba2 0%, #f093fb 25%, #f5576c 50%, #4facfe 75%, #667eea 100%)',
                  'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #667eea 75%, #764ba2 100%)',
                  'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Parallax shimmer effect during scroll */}
          {isScrolling && !isActive && (
            <motion.div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                x: shimmerOffset
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}

          {/* Hover neon border glow */}
          {isHovered && !isActive && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                boxShadow: isDark
                  ? '0 0 20px rgba(102, 126, 234, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05)'
                  : '0 0 20px rgba(102, 126, 234, 0.2), inset 0 0 20px rgba(102, 126, 234, 0.1)'
              }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Text content */}
          <span className="relative z-10">
            {category.label}
          </span>

          {/* Optional glowing underline for active state */}
          {isActive && (
            <motion.div
              className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-white/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "60%" }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            />
          )}
        </motion.button>

        {/* Mobile tap ripple effect */}
        {isMobile && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 1.5, opacity: 0 }}
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
            }}
            transition={{ duration: 0.4 }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Sticky container */}
      <motion.div
        className={cn(
          "sticky top-0 z-40 backdrop-blur-xl backdrop-saturate-150 border-b transition-all duration-300",
          isDark
            ? "bg-gray-900/70 border-gray-700/20"
            : "bg-white/70 border-gray-200/20"
        )}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Filter bubbles container */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div
            ref={scrollContainerRef}
            className={cn(
              "overflow-x-auto scrollbar-hide",
              // Custom scroll behavior
              "scroll-smooth"
            )}
            style={{
              scrollSnapType: isMobile ? 'x mandatory' : 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex items-center gap-4 pb-2 min-w-max px-2">
              {premiumCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  style={{
                    scrollSnapAlign: isMobile ? 'center' : 'start'
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <FilterBubble
                    category={category}
                    isActive={activeFilter === category.id}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile swipe indicator */}
          {isMobile && (
            <motion.div
              className="flex justify-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    className={cn(
                      "w-1 h-1 rounded-full transition-all duration-300",
                      isDark ? "bg-gray-600" : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Subtle gradient overlay at edges for scroll indication */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-current to-transparent opacity-5 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-current to-transparent opacity-5 pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default UltraPremiumFilterBubbles;