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
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Right gradient fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Scrollable filter container */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-3 overflow-x-auto scrollbar-hide py-2 px-1"
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
              className="flex-shrink-0"
            >
              <button
                onClick={() => onFilterChange?.(category.id)}
                className={cn(
                  "relative px-4 py-2 rounded-full transition-all duration-200",
                  "text-sm font-medium whitespace-nowrap",
                  "border border-transparent",
                  isActive
                    ? "text-white shadow-lg transform scale-105"
                    : "text-gray-400 hover:text-white hover:scale-102"
                )}
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(219, 39, 119, 0.8) 50%, rgba(59, 130, 246, 0.8) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isActive 
                    ? '0 0 20px rgba(147, 51, 234, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: isActive 
                    ? '1px solid rgba(147, 51, 234, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center space-x-2">
                  {/* Category dot indicator */}
                  <div 
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      isActive ? "scale-125" : "scale-100"
                    )}
                    style={{
                      background: isActive 
                        ? 'rgba(255, 255, 255, 0.8)'
                        : category.dotColor.replace('bg-', '#')
                    }}
                  />
                  <span>{category.label}</span>
                </div>
                
                {/* Active glow effect */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Filter count indicator */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-1">
          {categories.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1 h-1 rounded-full transition-all duration-200",
                Math.floor(index / 3) === Math.floor(categories.findIndex(c => c.id === activeFilter) / 3)
                  ? "bg-purple-400 scale-125"
                  : "bg-gray-600 scale-100"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};