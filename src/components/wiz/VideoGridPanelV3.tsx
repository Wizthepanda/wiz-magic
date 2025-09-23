import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Eye,
  Clock,
  Zap,
  Monitor,
  DollarSign,
  Palette,
  BarChart3,
  Heart,
  Sprout,
  GraduationCap,
  Gamepad2,
  Globe,
  Wrench,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  creator: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  duration: string;
  views: string;
  zapsEarned: number;
  tags: string[];
  watchProgress?: number; // 0-100 percentage
  isNew?: boolean;
}

interface FilterCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  emoji: string;
}

const filterCategories: FilterCategory[] = [
  { id: 'all', label: 'All', icon: Globe, emoji: '🌐' },
  { id: 'tech', label: 'Tech', icon: Monitor, emoji: '💻' },
  { id: 'money', label: 'Money', icon: DollarSign, emoji: '💰' },
  { id: 'design', label: 'Design', icon: Palette, emoji: '🎨' },
  { id: 'business', label: 'Business', icon: BarChart3, emoji: '📊' },
  { id: 'health', label: 'Health', icon: Heart, emoji: '🧬' },
  { id: 'growth', label: 'Self Improvement', icon: Sprout, emoji: '🌱' },
  { id: 'education', label: 'Education', icon: GraduationCap, emoji: '🎓' },
  { id: 'gaming', label: 'Gaming Lifestyle', icon: Gamepad2, emoji: '🎮' },
  { id: 'social', label: 'Social', icon: Globe, emoji: '🌐' },
  { id: 'diy', label: 'DIY', icon: Wrench, emoji: '🛠️' },
];

// Sample video data
const sampleVideos: VideoData[] = [
  {
    id: '1',
    title: 'Advanced React Patterns You Should Know in 2024',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'TechMaster Pro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techmaster',
      verified: true
    },
    duration: '15:42',
    views: '124K',
    zapsEarned: 850,
    tags: ['React', 'JavaScript', 'Frontend'],
    watchProgress: 45,
    isNew: true
  },
  {
    id: '2',
    title: 'Building Wealth: 10 Investment Strategies for Beginners',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'WealthBuilder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wealth',
      verified: false
    },
    duration: '22:15',
    views: '89K',
    zapsEarned: 1200,
    tags: ['Investment', 'Finance', 'Money'],
    watchProgress: 0
  },
  {
    id: '3',
    title: 'Modern UI/UX Design Principles & Figma Workflow',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'DesignStudio',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=design',
      verified: true
    },
    duration: '18:30',
    views: '156K',
    zapsEarned: 950,
    tags: ['Design', 'UI/UX', 'Figma'],
    watchProgress: 100
  },
  {
    id: '4',
    title: 'Entrepreneurship Mindset: From Idea to Million Dollar Business',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'BusinessGuru',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business',
      verified: true
    },
    duration: '25:18',
    views: '203K',
    zapsEarned: 1500,
    tags: ['Business', 'Startup', 'Entrepreneurship'],
    watchProgress: 20
  },
  {
    id: '5',
    title: 'Complete Morning Routine for Peak Performance',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'LifeOptimizer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=health',
      verified: false
    },
    duration: '12:45',
    views: '67K',
    zapsEarned: 720,
    tags: ['Health', 'Productivity', 'Lifestyle'],
    watchProgress: 0
  },
  {
    id: '6',
    title: 'Learning to Code: Complete Roadmap for 2024',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    creator: {
      name: 'CodeAcademy Plus',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=education',
      verified: true
    },
    duration: '28:12',
    views: '312K',
    zapsEarned: 1800,
    tags: ['Education', 'Programming', 'Career'],
    watchProgress: 75
  }
];

interface VideoGridPanelV3Props {
  onVideoSelect?: (video: VideoData) => void;
  className?: string;
}

const VideoGridPanelV3: React.FC<VideoGridPanelV3Props> = ({
  onVideoSelect,
  className
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [filteredVideos, setFilteredVideos] = useState<VideoData[]>(sampleVideos);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Filter videos based on active category
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredVideos(sampleVideos);
    } else {
      const filtered = sampleVideos.filter(video =>
        video.tags.some(tag =>
          tag.toLowerCase().includes(activeFilter) ||
          (activeFilter === 'growth' && (tag.toLowerCase().includes('productivity') || tag.toLowerCase().includes('lifestyle'))) ||
          (activeFilter === 'money' && (tag.toLowerCase().includes('finance') || tag.toLowerCase().includes('investment'))) ||
          (activeFilter === 'tech' && (tag.toLowerCase().includes('programming') || tag.toLowerCase().includes('react') || tag.toLowerCase().includes('javascript')))
        )
      );
      setFilteredVideos(filtered);
    }
  }, [activeFilter]);

  // Get progress ring color based on completion
  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'stroke-gray-400';
    if (progress === 100) return 'stroke-green-500';
    return 'stroke-blue-500';
  };

  // Video card component
  const VideoCard: React.FC<{ video: VideoData; index: number }> = ({ video, index }) => {
    const isHovered = hoveredVideo === video.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className={cn(
          "group relative rounded-xl overflow-hidden",
          "backdrop-blur-xl backdrop-saturate-150",
          isDark
            ? "bg-white/5 border border-white/10"
            : "bg-white/70 border border-black/5",
          "hover:shadow-xl transition-all duration-300 ease-out",
          "hover:-translate-y-1"
        )}
        onMouseEnter={() => setHoveredVideo(video.id)}
        onMouseLeave={() => setHoveredVideo(null)}
        onClick={() => onVideoSelect?.(video)}
      >
        {/* Thumbnail Container */}
        <div className="relative aspect-video overflow-hidden">
          {/* Thumbnail Image */}
          <motion.img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Gradient Overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t",
            isDark
              ? "from-black/60 via-transparent to-transparent"
              : "from-black/40 via-transparent to-transparent"
          )} />

          {/* Glassy Overlay with Brand Gradient */}
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-transparent"
          )} />

          {/* Duration & Views - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <div className={cn(
              "px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm",
              isDark ? "bg-black/60 text-white" : "bg-white/80 text-black"
            )}>
              {video.duration}
            </div>
            <div className={cn(
              "px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm flex items-center gap-1",
              isDark ? "bg-black/60 text-white" : "bg-white/80 text-black"
            )}>
              <Eye className="w-3 h-3" />
              {video.views}
            </div>
          </div>

          {/* New Badge */}
          {video.isNew && (
            <div className="absolute top-2 left-2">
              <div className="px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white">
                NEW
              </div>
            </div>
          )}

          {/* Play Button - Center (appears on hover) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-600 transition-colors">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Ring (on hover, if watch progress exists) */}
          {video.watchProgress !== undefined && video.watchProgress > 0 && (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-2 left-2"
                >
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                        fill="none"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        className={getProgressColor(video.watchProgress)}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${video.watchProgress * 0.75} 75`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {video.watchProgress === 100 ? '✓' : `${video.watchProgress}%`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Info Strip - Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center justify-between">
              {/* Creator Info - Left */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={video.creator.avatar}
                  alt={video.creator.name}
                  className="w-6 h-6 rounded-full border-2 border-white/50"
                />
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-white text-sm font-medium truncate">
                    {video.creator.name}
                  </span>
                  {video.creator.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* ZAPS - Right */}
              <motion.div
                className="flex items-center gap-1"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{
                    rotate: isHovered ? [0, -10, 10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap
                    className={cn(
                      "w-4 h-4 text-yellow-400",
                      isHovered && "drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]"
                    )}
                    fill="currentColor"
                  />
                </motion.div>
                <span className="text-white text-sm font-bold">
                  {video.zapsEarned.toLocaleString()}
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <h3 className={cn(
            "font-semibold text-sm leading-tight line-clamp-2 mb-3",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {video.title}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  isDark
                    ? "bg-white/10 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Filter Bubbles */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterCategories.map((category) => {
            const IconComponent = category.icon;
            const isActive = activeFilter === category.id;

            return (
              <motion.button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300",
                  "backdrop-blur-xl backdrop-saturate-150 border",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  isActive
                    ? isDark
                      ? "bg-white/20 border-white/30 text-white shadow-lg"
                      : "bg-white/90 border-purple-200 text-purple-700 shadow-lg"
                    : isDark
                      ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      : "bg-white/60 border-black/5 text-gray-600 hover:bg-white/80"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm">{category.emoji}</span>
                <IconComponent className="w-4 h-4" />
                <span className="font-medium text-sm">{category.label}</span>

                {/* Active Gradient Underline */}
                {isActive && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className={cn(
            "text-xl font-semibold mb-2",
            isDark ? "text-white" : "text-gray-900"
          )}>
            No videos found
          </h3>
          <p className={cn(
            "text-sm",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            Try selecting a different category or check back later
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default VideoGridPanelV3;