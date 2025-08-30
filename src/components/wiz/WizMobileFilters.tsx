import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', color: 'bg-wiz-primary', dotColor: 'bg-blue-400' },
  { id: 'ai', label: 'AI', color: 'bg-wiz-secondary', dotColor: 'bg-red-400' },
  { id: 'tech', label: 'Tech', color: 'bg-wiz-accent', dotColor: 'bg-orange-400' },
  { id: 'music', label: 'Music', color: 'bg-wiz-magic', dotColor: 'bg-pink-400' },
  { id: 'money', label: 'Money', color: 'bg-emerald-500', dotColor: 'bg-green-400' },
  { id: 'health', label: 'Health', color: 'bg-rose-500', dotColor: 'bg-red-400' },
  { id: 'gaming', label: 'Gaming', color: 'bg-purple-500', dotColor: 'bg-purple-400' },
  { id: 'movies', label: 'Movies', color: 'bg-indigo-500', dotColor: 'bg-indigo-400' },
  { id: 'news', label: 'News', color: 'bg-cyan-500', dotColor: 'bg-cyan-400' },
  { id: 'podcast', label: 'Podcast', color: 'bg-teal-500', dotColor: 'bg-teal-400' },
];

interface WizMobileFiltersProps {
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  className?: string;
}

// Map category IDs to Tailwind gradient classes for desktop consistency
const getCategoryGradient = (categoryId: string, isActive: boolean) => {
  const gradientMap = {
    'all': isActive ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 'bg-white hover:bg-gray-50',
    'ai': isActive ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-white hover:bg-gray-50',
    'tech': isActive ? 'bg-gradient-to-r from-orange-500 to-amber-600' : 'bg-white hover:bg-gray-50',
    'music': isActive ? 'bg-gradient-to-r from-pink-500 to-rose-600' : 'bg-white hover:bg-gray-50',
    'money': isActive ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-white hover:bg-gray-50',
    'health': isActive ? 'bg-gradient-to-r from-rose-500 to-pink-600' : 'bg-white hover:bg-gray-50',
    'gaming': isActive ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 'bg-white hover:bg-gray-50',
    'movies': isActive ? 'bg-gradient-to-r from-indigo-500 to-blue-600' : 'bg-white hover:bg-gray-50',
    'news': isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-white hover:bg-gray-50',
    'podcast': isActive ? 'bg-gradient-to-r from-teal-500 to-cyan-600' : 'bg-white hover:bg-gray-50',
  };
  return gradientMap[categoryId] || (isActive ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 'bg-white hover:bg-gray-50');
};

// Map dot colors to actual color values for inline styles
const getDotColor = (dotColorClass: string): string => {
  const colorMap = {
    'bg-blue-400': '#60a5fa',
    'bg-red-400': '#f87171',
    'bg-orange-400': '#fb923c',
    'bg-pink-400': '#f472b6',
    'bg-green-400': '#4ade80',
    'bg-purple-400': '#c084fc',
    'bg-indigo-400': '#818cf8',
    'bg-cyan-400': '#22d3ee',
    'bg-teal-400': '#2dd4bf',
  };
  return colorMap[dotColorClass] || '#60a5fa';
};

export const WizMobileFilters = ({ 
  activeFilter = 'all', 
  onFilterChange,
  className 
}: WizMobileFiltersProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToActive = () => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(`[data-filter="${activeFilter}"]`) as HTMLElement;
      if (activeElement) {
        const containerWidth = scrollContainerRef.current.clientWidth;
        const elementLeft = activeElement.offsetLeft;
        const elementWidth = activeElement.offsetWidth;
        const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
        
        scrollContainerRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    scrollToActive();
  }, [activeFilter]);

  return (
    <div className={cn("relative", className)}>
      {/* Left gradient fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none max-md:block" />
      )}
      
      {/* Right gradient fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none max-md:block" />
      )}
      
      {/* Scrollable filter container - Enhanced mobile pill design */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-3 px-1 snap-x snap-mandatory max-md:gap-3"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }}
      >
        {categories.map((category, index) => {
          const isActive = activeFilter === category.id;
          
          return (
            <motion.div
              key={category.id}
              data-filter={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 snap-center"
            >
              <button
                onClick={() => onFilterChange?.(category.id)}
                className={cn(
                  // Base styling - elegant pill shape with Tailwind
                  "flex items-center gap-2 rounded-full px-4 py-2 font-semibold shadow-sm transition-all duration-200 whitespace-nowrap",
                  // Mobile-specific enhanced styling
                  "max-md:px-5 max-md:py-2.5 max-md:shadow-md",
                  // Gradient backgrounds and text colors
                  getCategoryGradient(category.id, isActive),
                  isActive
                    ? "text-white transform scale-105 shadow-lg"
                    : "text-gray-700 border border-gray-200 hover:scale-102 hover:shadow-md"
                )}
              >
                {/* Unique dot color indicator */}
                <span 
                  className="h-2 w-2 rounded-full flex-shrink-0" 
                  style={{ 
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.9)' : getDotColor(category.dotColor)
                  }} 
                />
                <span className="font-semibold text-sm max-md:text-sm">
                  {category.label}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Subtle scroll indicators for mobile */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 max-md:block hidden">
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(categories.length / 4) }).map((_, index) => {
            const isActive = Math.floor(categories.findIndex(c => c.id === activeFilter) / 4) === index;
            return (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  isActive
                    ? "bg-purple-400 scale-110"
                    : "bg-gray-300 scale-100"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};