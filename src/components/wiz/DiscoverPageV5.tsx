import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  creator: {
    name: string;
    avatar: string;
  };
  duration: string;
  zapsReward: number;
  category: string;
  views: string;
}

interface FilterCategory {
  id: string;
  label: string;
  subCategories?: string[];
}

const filterCategories: FilterCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'tech', label: 'Tech' },
  { id: 'money', label: 'Money' },
  {
    id: 'design',
    label: 'Design',
    subCategories: ['Graphic Design', 'UX/UI', 'Art', 'Animation', '3D Design']
  },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health' },
  { id: 'growth', label: 'Self Improvement' },
  { id: 'education', label: 'Education' },
  { id: 'gaming', label: 'Gaming Lifestyle' },
  { id: 'social', label: 'Social' },
  { id: 'diy', label: 'DIY' },
  {
    id: 'entertainment',
    label: 'Entertainment',
    subCategories: ['Anime', 'Animations', 'Music', 'Movies', 'Sports', 'Comedy', 'Podcasting']
  },
];

// Sub-category mapping
const subCategoryMap: Record<string, string[]> = {
  design: ['Graphic Design', 'UX/UI', 'Art', 'Animation', '3D Design'],
  entertainment: ['Anime', 'Animations', 'Music', 'Movies', 'Sports', 'Comedy', 'Podcasting']
};

// Expanded sample data for infinite scroll demo
const generateVideoData = (startId: number, count: number): VideoData[] => {
  const categories = ['tech', 'money', 'design', 'business', 'health', 'growth', 'education', 'gaming', 'social', 'diy', 'entertainment'];
  const creators = [
    { name: 'TechMaster Pro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techmaster' },
    { name: 'WealthBuilder', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wealth' },
    { name: 'DesignStudio', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=design' },
    { name: 'BusinessGuru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business' },
    { name: 'LifeOptimizer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=health' },
    { name: 'CodeAcademy Plus', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=education' },
  ];

  const titles = [
    'Advanced React Patterns You Should Know',
    'Building Wealth Through Smart Investments',
    'Modern UI/UX Design Principles',
    'Entrepreneurship Mindset for Success',
    'Complete Morning Routine for Peak Performance',
    'Learning to Code: Complete Roadmap',
    'Productivity Hacks That Actually Work',
    'Gaming Setup for Content Creation',
    'Social Media Marketing Strategies',
    'DIY Home Office Setup Guide',
  ];

  return Array.from({ length: count }, (_, i) => {
    const id = startId + i;
    return {
      id: id.toString(),
      title: titles[i % titles.length],
      thumbnail: `https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg?v=${id}`,
      creator: creators[i % creators.length],
      duration: `${Math.floor(Math.random() * 20) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      zapsReward: Math.floor(Math.random() * 1000) + 500,
      category: categories[i % categories.length],
      views: `${Math.floor(Math.random() * 500) + 50}K`,
    };
  });
};

interface DiscoverPageV5Props {
  onVideoSelect?: (video: VideoData) => void;
  currentZapsBalance?: number;
  className?: string;
}

const DiscoverPageV5: React.FC<DiscoverPageV5Props> = ({
  onVideoSelect,
  currentZapsBalance = 1240,
  className
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoData[]>(generateVideoData(1, 12));
  const [isLoading, setIsLoading] = useState(false);
  const [zapsDisplayValue, setZapsDisplayValue] = useState(currentZapsBalance);

  const filterBarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isDark = theme === 'dark';

  const { scrollY } = useScroll();
  const filterBarY = useTransform(scrollY, [0, 100], [0, -10]);
  const filterBarOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);

  // Animated ZAPS counter
  useEffect(() => {
    if (zapsDisplayValue !== currentZapsBalance) {
      const increment = currentZapsBalance > zapsDisplayValue ? 1 : -1;
      const timer = setInterval(() => {
        setZapsDisplayValue(prev => {
          const next = prev + increment * 5;
          if (increment > 0 ? next >= currentZapsBalance : next <= currentZapsBalance) {
            clearInterval(timer);
            return currentZapsBalance;
          }
          return next;
        });
      }, 20);
      return () => clearInterval(timer);
    }
  }, [currentZapsBalance, zapsDisplayValue]);

  // Filter videos
  const filteredVideos = activeFilter === 'all'
    ? videos
    : videos.filter(video => video.category === activeFilter);

  // Infinite scroll
  const loadMoreVideos = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    setTimeout(() => {
      const newVideos = generateVideoData(videos.length + 1, 6);
      setVideos(prev => [...prev, ...newVideos]);
      setIsLoading(false);
    }, 800);
  }, [videos.length, isLoading]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreVideos, isLoading]);

  // Handle main filter change
  const handleMainFilterChange = (categoryId: string) => {
    setActiveFilter(categoryId);
    setActiveSubFilter(null); // Reset sub-filter when changing main category
  };

  // Get active sub-categories
  const activeSubCategories = activeFilter !== 'all' && subCategoryMap[activeFilter]
    ? subCategoryMap[activeFilter]
    : null;

  // Filter bubble component with luxury animations
  const FilterBubble: React.FC<{ category: FilterCategory; isActive: boolean }> = ({
    category,
    isActive
  }) => {
    return (
      <motion.button
        onClick={() => handleMainFilterChange(category.id)}
        className={cn(
          "relative px-6 py-3 rounded-full whitespace-nowrap font-semibold text-sm transition-all duration-500 ease-out overflow-hidden",
          isActive
            ? "text-white shadow-2xl"
            : isDark
              ? "text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50"
              : "text-gray-600 hover:text-gray-800 border border-gray-300/30 hover:border-gray-400/50"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
            : 'transparent'
        }}
      >
        {/* Liquid gradient shimmer effect */}
        {isActive && (
          <motion.div
            className="absolute inset-0 opacity-40"
            animate={{
              background: [
                'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              ],
              x: ['-100%', '100%', '200%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}

        {/* Hover gradient expansion */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)'
          }}
          whileHover={{
            opacity: isActive ? 0 : 0.1,
            scale: 1.05
          }}
          transition={{ duration: 0.3 }}
        />

        <span className="relative z-10">{category.label}</span>
      </motion.button>
    );
  };

  // Sub-filter bubble component - slightly smaller, frosted design
  const SubFilterBubble: React.FC<{ label: string; isActive: boolean }> = ({
    label,
    isActive
  }) => {
    return (
      <motion.button
        onClick={() => setActiveSubFilter(isActive ? null : label)}
        className={cn(
          "relative px-4 py-1.5 rounded-full whitespace-nowrap font-medium text-sm transition-all duration-300 ease-out",
          isActive
            ? "text-white shadow-lg ring-1 ring-indigo-300/50"
            : isDark
              ? "text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50"
              : "text-neutral-700 border border-gray-300/30 hover:border-gray-400/50"
        )}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: isActive
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
            : 'transparent'
        }}
        transition={{ duration: 0.2 }}
      >
        <span className="relative z-10">{label}</span>
      </motion.button>
    );
  };

  // Premium video card component
  const VideoCard: React.FC<{ video: VideoData; index: number }> = ({ video, index }) => {
    const isHovered = hoveredVideo === video.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: index * 0.08,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="group cursor-pointer"
        onMouseEnter={() => setHoveredVideo(video.id)}
        onMouseLeave={() => setHoveredVideo(null)}
        onClick={() => onVideoSelect?.(video)}
      >
        <motion.div
          className={cn(
            "rounded-xl overflow-hidden transition-all duration-500 ease-out",
            "backdrop-blur-xl backdrop-saturate-150",
            isDark
              ? "bg-gray-900/20 hover:bg-gray-800/30"
              : "bg-white/60 hover:bg-white/80"
          )}
          animate={{
            y: isHovered ? -8 : 0,
            boxShadow: isHovered
              ? isDark
                ? "0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                : "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)"
              : isDark
                ? "0 4px 20px rgba(0, 0, 0, 0.2)"
                : "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <motion.img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.03 : 1,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Duration micro pill */}
            <div className="absolute top-3 right-3">
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md",
                isDark ? "bg-black/60 text-white" : "bg-white/80 text-gray-900"
              )}>
                {video.duration}
              </div>
            </div>

            {/* Watch button with Apple-level polish */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full text-gray-900 font-semibold text-sm shadow-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    Watch
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Blur-edge glow effect */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `
                    radial-gradient(
                      circle at center,
                      transparent 40%,
                      rgba(102, 126, 234, 0.1) 70%,
                      rgba(118, 75, 162, 0.15) 100%
                    )
                  `,
                  filter: 'blur(20px)',
                  transform: 'scale(1.1)'
                }}
              />
            )}
          </div>

          {/* Info section */}
          <div className="p-4">
            <h3 className={cn(
              "font-bold text-lg mb-3 line-clamp-1 leading-tight",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {video.title}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img
                  src={video.creator.avatar}
                  alt={video.creator.name}
                  className="w-7 h-7 rounded-full flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}>
                    {video.creator.name}
                  </p>
                  <p className={cn(
                    "text-xs",
                    isDark ? "text-gray-500" : "text-gray-500"
                  )}>
                    {video.views} views
                  </p>
                </div>
              </div>

              {/* Floating neon ZAPS pill */}
              <motion.div
                className="flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-md relative overflow-hidden"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 101, 101, 0.2) 100%)'
                    : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 101, 101, 0.1) 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}
                whileHover={{
                  boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)",
                  scale: 1.05
                }}
              >
                {/* Neon glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 101, 101, 0.3) 100%)',
                    filter: 'blur(10px)'
                  }}
                  whileHover={{ opacity: 1 }}
                />

                <Zap className="w-3 h-3 text-yellow-500 relative z-10" fill="currentColor" />
                <span className={cn(
                  "text-xs font-bold relative z-10",
                  isDark ? "text-yellow-400" : "text-yellow-600"
                )}>
                  +{video.zapsReward}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Pinned Top Meta Strip with smooth scroll */}
      <motion.div
        ref={filterBarRef}
        className="sticky top-0 z-50 transition-all duration-300 bg-transparent"
        style={{
          y: filterBarY,
          opacity: filterBarOpacity,
          background: 'transparent'
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-3 pt-4">
            <h1 className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Discover
            </h1>

            {/* Animated ZAPS counter */}
            <motion.div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md",
                isDark
                  ? "bg-gray-800/60 border border-gray-700/50"
                  : "bg-white/80 border border-gray-200/50"
              )}
              animate={{
                scale: zapsDisplayValue !== currentZapsBalance ? [1, 1.05, 1] : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <Zap className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <motion.span
                className={cn(
                  "font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
                key={zapsDisplayValue}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {zapsDisplayValue.toLocaleString()} ZAPS
              </motion.span>
            </motion.div>
          </div>

          {/* Jewelry-like filter bubbles with smooth scroll */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-3 pb-2 min-w-max">
              {filterCategories.map((category) => (
                <FilterBubble
                  key={category.id}
                  category={category}
                  isActive={activeFilter === category.id}
                />
              ))}
            </div>
          </div>

          {/* Sub-filter bubbles - appear when main category with sub-categories is selected */}
          <AnimatePresence mode="wait">
            {activeSubCategories && (
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto scrollbar-hide pt-1 pb-4">
                  <div className="flex items-center gap-2 min-w-max">
                    {activeSubCategories.map((subCategory) => (
                      <SubFilterBubble
                        key={subCategory}
                        label={subCategory}
                        isActive={activeSubFilter === subCategory}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main content with proper padding */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Video grid with seamless layout */}
        <motion.div
          key={`${activeFilter}-${activeSubFilter}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div
            ref={scrollContainerRef}
            className={cn(
              "grid gap-8",
              isMobile
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Loading indicator for infinite scroll */}
        <div ref={loadingRef} className="mt-12 mb-8">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-gray-600" : "bg-gray-400"
                )} />
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-gray-600" : "bg-gray-400"
                )} style={{ animationDelay: '0.2s' }} />
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isDark ? "bg-gray-600" : "bg-gray-400"
                )} style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Empty state */}
        {filteredVideos.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={cn(
              "text-xl font-bold mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}>
              No videos found
            </h3>
            <p className={cn(
              "text-sm",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              Try selecting a different category
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPageV5;