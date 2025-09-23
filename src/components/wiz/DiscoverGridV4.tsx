import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  isFeatured?: boolean;
}

interface FilterCategory {
  id: string;
  label: string;
}

const filterCategories: FilterCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'tech', label: 'Tech' },
  { id: 'money', label: 'Money' },
  { id: 'design', label: 'Design' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health' },
  { id: 'growth', label: 'Self Improvement' },
  { id: 'education', label: 'Education' },
  { id: 'gaming', label: 'Gaming Lifestyle' },
  { id: 'social', label: 'Social' },
  { id: 'diy', label: 'DIY' },
];

// Sample minimalist video data
const sampleVideos: VideoData[] = [
  {
    id: '1',
    title: 'Advanced React Patterns You Should Know',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'TechMaster Pro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techmaster'
    },
    duration: '15:42',
    zapsReward: 850,
    category: 'tech',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Building Wealth Through Smart Investments',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'WealthBuilder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wealth'
    },
    duration: '22:15',
    zapsReward: 1200,
    category: 'money'
  },
  {
    id: '3',
    title: 'Modern UI/UX Design Principles',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'DesignStudio',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=design'
    },
    duration: '18:30',
    zapsReward: 950,
    category: 'design'
  },
  {
    id: '4',
    title: 'Entrepreneurship Mindset for Success',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'BusinessGuru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business'
    },
    duration: '25:18',
    zapsReward: 1500,
    category: 'business'
  },
  {
    id: '5',
    title: 'Complete Morning Routine for Peak Performance',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'LifeOptimizer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=health'
    },
    duration: '12:45',
    zapsReward: 720,
    category: 'health'
  },
  {
    id: '6',
    title: 'Learning to Code: Complete Roadmap',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'CodeAcademy Plus',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=education'
    },
    duration: '28:12',
    zapsReward: 1800,
    category: 'education'
  },
  {
    id: '7',
    title: 'Productivity Hacks That Actually Work',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'ProductivityPro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=productivity'
    },
    duration: '16:20',
    zapsReward: 890,
    category: 'growth'
  },
  {
    id: '8',
    title: 'Gaming Setup for Content Creation',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'GameSetupGuru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gaming'
    },
    duration: '20:05',
    zapsReward: 1100,
    category: 'gaming'
  },
  {
    id: '9',
    title: 'Social Media Marketing Strategies',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'SocialGrowth',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=social'
    },
    duration: '19:45',
    zapsReward: 1050,
    category: 'social'
  }
];

interface DiscoverGridV4Props {
  onVideoSelect?: (video: VideoData) => void;
  currentZapsBalance?: number;
  className?: string;
}

const DiscoverGridV4: React.FC<DiscoverGridV4Props> = ({
  onVideoSelect,
  currentZapsBalance = 1240,
  className
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>(sampleVideos);
  const [isScrolling, setIsScrolling] = useState(false);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isDark = theme === 'dark';

  // Filter videos based on active category
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredVideos(sampleVideos);
    } else {
      const filtered = sampleVideos.filter(video => video.category === activeFilter);
      setFilteredVideos(filtered);
    }
  }, [activeFilter]);

  // Handle filter scroll animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 150);
    };

    const scrollElement = filterScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Featured video component
  const FeaturedVideo: React.FC<{ video: VideoData }> = ({ video }) => {
    const isHovered = hoveredVideo === video.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="col-span-full mb-8"
        onMouseEnter={() => setHoveredVideo(video.id)}
        onMouseLeave={() => setHoveredVideo(null)}
        onClick={() => onVideoSelect?.(video)}
      >
        <motion.div
          className={cn(
            "relative rounded-xl overflow-hidden cursor-pointer group",
            "transition-all duration-300 ease-out",
            isDark ? "bg-gray-900/50" : "bg-white/80",
            "hover:shadow-lg"
          )}
          whileHover={{ y: -2 }}
        >
          <div className="relative aspect-[21/9] overflow-hidden">
            <motion.img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.02 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Duration badge */}
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {video.duration}
              </div>
            </div>

            {/* Watch Now button */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold flex items-center gap-2 shadow-lg">
                    <Play className="w-4 h-4" fill="currentColor" />
                    Watch Now
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white text-2xl font-bold mb-2 line-clamp-1">
                    {video.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <img
                      src={video.creator.avatar}
                      alt={video.creator.name}
                      className="w-8 h-8 rounded-full border-2 border-white/50"
                    />
                    <span className="text-white/90 font-medium">
                      {video.creator.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/90 backdrop-blur-sm rounded-full">
                  <Zap className="w-4 h-4 text-white" fill="currentColor" />
                  <span className="text-white font-bold text-sm">
                    +{video.zapsReward}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Regular video card component
  const VideoCard: React.FC<{ video: VideoData; index: number }> = ({ video, index }) => {
    const isHovered = hoveredVideo === video.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group cursor-pointer"
        onMouseEnter={() => setHoveredVideo(video.id)}
        onMouseLeave={() => setHoveredVideo(null)}
        onClick={() => onVideoSelect?.(video)}
      >
        <motion.div
          className={cn(
            "rounded-xl overflow-hidden transition-all duration-300 ease-out",
            isDark ? "bg-gray-900/30" : "bg-white/60",
            "hover:shadow-lg"
          )}
          whileHover={{
            y: -4,
            boxShadow: isDark
              ? "0 10px 40px rgba(0, 0, 0, 0.3)"
              : "0 10px 40px rgba(0, 0, 0, 0.1)"
          }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <motion.img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* Duration badge */}
            <div className="absolute top-3 right-3">
              <div className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-white text-xs font-medium">
                {video.duration}
              </div>
            </div>

            {/* Hover glow effect */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent"
              />
            )}

            {/* Watch Now button */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium text-sm flex items-center gap-2 shadow-lg">
                    <Play className="w-3 h-3" fill="currentColor" />
                    Watch Now
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className={cn(
              "font-bold text-base mb-3 line-clamp-1",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {video.title}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={video.creator.avatar}
                  alt={video.creator.name}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <span className={cn(
                  "text-sm font-medium truncate",
                  isDark ? "text-gray-300" : "text-gray-600"
                )}>
                  {video.creator.name}
                </span>
              </div>

              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                isDark
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-yellow-50 text-yellow-700"
              )}>
                <Zap className="w-3 h-3" fill="currentColor" />
                +{video.zapsReward}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const featuredVideo = filteredVideos.find(video => video.isFeatured);
  const regularVideos = filteredVideos.filter(video => !video.isFeatured);

  return (
    <div className={cn("w-full", className)}>
      {/* Top Meta Row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className={cn(
          "text-3xl font-bold",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Discover
        </h1>

        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          isDark
            ? "bg-gray-800/60 border border-gray-700/50"
            : "bg-white/80 border border-gray-200/50"
        )}>
          <Zap className="w-4 h-4 text-yellow-500" fill="currentColor" />
          <span className={cn(
            "font-bold",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {currentZapsBalance.toLocaleString()} ZAPS
          </span>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="mb-8">
        <div
          ref={filterScrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {filterCategories.map((category) => {
            const isActive = activeFilter === category.id;

            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={cn(
                  "relative px-4 py-2 rounded-xl whitespace-nowrap font-medium text-sm transition-all duration-300",
                  "border-2",
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 border-transparent text-white shadow-lg"
                    : isDark
                      ? "border-gray-600/50 text-gray-300 hover:border-gray-500/70 hover:text-white"
                      : "border-gray-300/50 text-gray-600 hover:border-gray-400/70 hover:text-gray-800"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category.label}

                {/* Shimmer effect during scroll */}
                {isScrolling && !isActive && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Video Grid */}
      <div className={cn(
        "grid gap-6",
        isMobile
          ? "grid-cols-1"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {/* Featured Video */}
        {featuredVideo && <FeaturedVideo video={featuredVideo} />}

        {/* Regular Videos */}
        <AnimatePresence mode="popLayout">
          {regularVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
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
  );
};

export default DiscoverGridV4;