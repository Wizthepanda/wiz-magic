import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Heart,
  Share,
  Bookmark,
  Zap,
  Eye,
  Clock,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  BadgeCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { calculateVideoZAPs } from "@/lib/zap-system";
import { BackToTopButton } from '@/components/ui/BackToTopButton';
import { VideoCardSkeleton } from '@/components/ui/VideoCardSkeleton';

// Enhanced video data interface for V13
interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  thumbnailBlurred?: string;
  videoUrl: string;
  videoId: string;
  creator: string;
  creatorAvatar?: string;
  subscriberCount?: string;
  isVerified?: boolean;
  creatorId?: string;
  channelId?: string;
  duration: string;
  views: string;
  likes: string;
  description: string;
  xpReward: number;
  zapsReward: number;
  category: string;
  publishedAt: string;
  daysAgo: number;
}

// V13 Premium filter categories with enhanced gradients
const FILTER_CATEGORIES = [
  {
    id: 'all',
    label: 'All',
    gradient: 'from-white/30 to-white/10',
    activeGradient: 'from-violet-500 to-pink-500',
    icon: Sparkles
  },
  {
    id: 'tech',
    label: 'Tech',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    activeGradient: 'from-blue-500 to-cyan-500',
    icon: Zap
  },
  {
    id: 'money',
    label: 'Money',
    gradient: 'from-green-500/20 to-emerald-500/10',
    activeGradient: 'from-green-500 to-emerald-500',
    icon: Crown
  },
  {
    id: 'design',
    label: 'Design',
    gradient: 'from-purple-500/20 to-indigo-500/10',
    activeGradient: 'from-purple-500 to-indigo-500',
    icon: Sparkles
  }
];

interface WIZUPDashboardV13Props {
  className?: string;
  onVideoSelect?: (video: VideoData) => void;
  videos?: VideoData[];
  loading?: boolean;
}

export default function WIZUPDashboardV13({
  className,
  onVideoSelect,
  videos = [],
  loading = false
}: WIZUPDashboardV13Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Automatically collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Filter videos based on category and search
  const filteredVideos = useMemo(() => {
    let filtered = videos;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v =>
        v.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [videos, selectedCategory, searchQuery]);

  // Handle video click
  const handleVideoClick = useCallback((video: VideoData) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    }
  }, [onVideoSelect]);

  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50 -z-10" />

      {/* Main Container with Sidebar Sync */}
      <motion.div
        animate={{
          paddingLeft: sidebarOpen && !isMobile ? '280px' : '0px'
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative transition-all duration-400"
      >
        {/* Sticky Header with Search & Filters */}
        <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Category Chips with Glow Animation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {FILTER_CATEGORIES.map((category, index) => {
                const isActive = selectedCategory === category.id;
                const Icon = category.icon;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "relative flex items-center gap-2 px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all duration-300",
                      isActive
                        ? `bg-gradient-to-r ${category.activeGradient} text-white shadow-lg`
                        : `bg-gradient-to-r ${category.gradient} text-gray-700 hover:shadow-md`
                    )}
                  >
                    {/* Glow Effect for Active Filter */}
                    {isActive && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full blur-xl -z-10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.label}</span>

                    {/* Pulse Animation for Active */}
                    {isActive && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Video Grid - Dynamic Columns */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            layout
            className={cn(
              "grid gap-6 transition-all duration-500 ease-in-out",
              // Dynamic grid based on sidebar state
              sidebarOpen && !isMobile
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            )}
          >
            {loading || filteredVideos.length === 0 ? (
              // Skeleton loaders
              Array.from({ length: 8 }).map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))
            ) : (
              filteredVideos.map((video, index) => (
                <CinematicVideoCard
                  key={video.id}
                  video={video}
                  index={index}
                  isHovered={hoveredVideo === video.id}
                  onHover={() => setHoveredVideo(video.id)}
                  onLeave={() => setHoveredVideo(null)}
                  onClick={() => handleVideoClick(video)}
                />
              ))
            )}
          </motion.div>
        </div>

        {/* Back to Top Button */}
        <BackToTopButton />
      </motion.div>

      {/* Sidebar Toggle Button (Floating) */}
      {!isMobile && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-4 bottom-8 z-50 p-3 bg-white shadow-lg rounded-full hover:shadow-xl transition-all border border-gray-200"
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-700" />
          )}
        </motion.button>
      )}
    </div>
  );
}

// Cinematic Video Card Component
interface CinematicVideoCardProps {
  video: VideoData;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

const CinematicVideoCard: React.FC<CinematicVideoCardProps> = ({
  video,
  index,
  isHovered,
  onHover,
  onLeave,
  onClick
}) => {
  const zapReward = video.zapsReward || calculateVideoZAPs(video.duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -4 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-300"
    >
      {/* Thumbnail with Overlay */}
      <div className="relative aspect-video overflow-hidden bg-gray-900">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover Overlay with Play Button */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white/20 backdrop-blur-md rounded-full p-4 hover:bg-white/30 transition-colors"
              >
                <Play className="w-8 h-8 text-white fill-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-white text-xs font-medium">
          {video.duration}
        </div>

        {/* ZAP Reward Badge with Glow */}
        <motion.div
          animate={isHovered ? {
            scale: [1, 1.1, 1],
          } : {}}
          transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
          className="absolute top-2 right-2 px-2.5 py-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-lg text-white text-xs font-bold flex items-center gap-1 shadow-lg"
        >
          <motion.div
            animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-3 h-3 fill-white" />
          </motion.div>
          +{zapReward}
        </motion.div>
      </div>

      {/* Card Content */}
      <div className="p-4 bg-white">
        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative">
            <img
              src={video.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creator}`}
              alt={video.creator}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md"
            />
            {video.isVerified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5"
              >
                <BadgeCheck className="w-3 h-3 text-white fill-white" />
              </motion.div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {video.creator}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {video.subscriberCount || '1K subscribers'}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-base text-gray-900 line-clamp-2 mb-2 leading-snug tracking-tight">
          {video.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{video.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{video.daysAgo}d ago</span>
          </div>
        </div>

        {/* Progress Bar Preview (Simulated) */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '30%' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
            />
          </motion.div>
        )}
      </div>

      {/* Glow Effect on Hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-violet-500/10 to-transparent pointer-events-none rounded-2xl"
        />
      )}
    </motion.div>
  );
};
