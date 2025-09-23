import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  ArrowLeft,
  Heart,
  Share,
  Bookmark,
  UserPlus,
  Zap,
  Eye,
  Clock,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Performance-optimized video data interface
interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  thumbnailBlurred?: string; // LQIP placeholder
  videoUrl: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    subscribers: string;
    verified: boolean;
    bio?: string;
  };
  duration: string;
  views: string;
  likes: string;
  description: string;
  zapsReward: number;
  category: string;
  publishedAt: string;
}

// Optimized filter categories
const FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'tech', label: 'Tech' },
  { id: 'business', label: 'Business' },
  { id: 'design', label: 'Design' },
  { id: 'ai', label: 'AI' },
  { id: 'health', label: 'Health' },
  { id: 'finance', label: 'Finance' },
  { id: 'education', label: 'Education' }
] as const;

// Sample optimized video data
const SAMPLE_VIDEOS: VideoData[] = [
  {
    id: '1',
    title: 'Building a $10M SaaS Empire: The Complete Blueprint',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    thumbnailBlurred: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8BVbEsr5u9Zn0jjkjjcXEDtJ2UZAA8RA7xj7jnOa5pVqoOGGKlT7xo+4eGG',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    creator: {
      id: 'alex-hormozi',
      name: 'Alex Hormozi',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      subscribers: '2.1M',
      verified: true,
      bio: 'Serial entrepreneur helping founders scale to 8-figures'
    },
    duration: '28:45',
    views: '487K',
    likes: '42K',
    description: 'Learn the exact playbook I used to build multiple 8-figure companies from scratch.',
    zapsReward: 1250,
    category: 'business',
    publishedAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'React Performance Optimization: From Slow to Lightning Fast',
    thumbnail: 'https://i.ytimg.com/vi/sample2/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample2',
    creator: {
      id: 'kent-dodds',
      name: 'Kent C. Dodds',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kent',
      subscribers: '890K',
      verified: true,
      bio: 'Full-stack developer educator'
    },
    duration: '45:12',
    views: '234K',
    likes: '18K',
    description: 'Master advanced React optimization techniques for production applications.',
    zapsReward: 980,
    category: 'tech',
    publishedAt: '2024-01-14'
  },
  {
    id: '3',
    title: 'AI Design Systems: The Future of UI/UX',
    thumbnail: 'https://i.ytimg.com/vi/sample3/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample3',
    creator: {
      id: 'sarah-chen',
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      subscribers: '756K',
      verified: true,
      bio: 'AI-driven design strategist'
    },
    duration: '32:18',
    views: '178K',
    likes: '15K',
    description: 'How AI is revolutionizing design workflows and creating smarter interfaces.',
    zapsReward: 1150,
    category: 'ai',
    publishedAt: '2024-01-13'
  },
  {
    id: '4',
    title: 'Mastering Sleep: Science-Based Optimization Techniques',
    thumbnail: 'https://i.ytimg.com/vi/sample4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample4',
    creator: {
      id: 'andrew-huberman',
      name: 'Dr. Andrew Huberman',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrew',
      subscribers: '3.2M',
      verified: true,
      bio: 'Stanford neuroscientist'
    },
    duration: '52:30',
    views: '892K',
    likes: '67K',
    description: 'Evidence-based strategies for optimizing sleep quality and duration.',
    zapsReward: 1100,
    category: 'health',
    publishedAt: '2024-01-12'
  },
  {
    id: '5',
    title: 'Crypto Trading Psychology: Master Your Mind',
    thumbnail: 'https://i.ytimg.com/vi/sample5/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample5',
    creator: {
      id: 'coin-bureau',
      name: 'Coin Bureau',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=crypto',
      subscribers: '2.8M',
      verified: true,
      bio: 'Crypto education and analysis'
    },
    duration: '38:22',
    views: '345K',
    likes: '29K',
    description: 'Develop winning psychology for volatile crypto markets.',
    zapsReward: 920,
    category: 'finance',
    publishedAt: '2024-01-11'
  },
  {
    id: '6',
    title: 'Building Atomic Habits That Actually Stick',
    thumbnail: 'https://i.ytimg.com/vi/sample6/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample6',
    creator: {
      id: 'james-clear',
      name: 'James Clear',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      subscribers: '1.5M',
      verified: true,
      bio: 'Author of Atomic Habits'
    },
    duration: '41:15',
    views: '567K',
    likes: '45K',
    description: 'Practical strategies for building sustainable routines.',
    zapsReward: 850,
    category: 'education',
    publishedAt: '2024-01-10'
  }
];

interface WIZUPDashboardV12Props {
  className?: string;
}

// Optimized debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Lazy loading intersection observer hook
const useIntersectionObserver = (threshold = 0.1) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);

  return [setRef, isIntersecting] as const;
};

const WIZUPDashboardV12: React.FC<WIZUPDashboardV12Props> = ({ className }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isWatchMode, setIsWatchMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useIsMobile();
  const filterScrollRef = useRef<HTMLDivElement>(null);

  // Debounce filter changes for performance
  const debouncedFilter = useDebounce(activeFilter, 200);

  // Memoized filtered videos for performance
  const filteredVideos = useMemo(() => {
    if (debouncedFilter === 'all') return SAMPLE_VIDEOS;
    return SAMPLE_VIDEOS.filter(video => video.category === debouncedFilter);
  }, [debouncedFilter]);

  // Related videos for watch mode
  const relatedVideos = useMemo(() => {
    if (!selectedVideo) return [];
    return SAMPLE_VIDEOS.filter(v => v.id !== selectedVideo.id).slice(0, 6);
  }, [selectedVideo]);

  // Optimized filter change handler
  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, []);

  // Optimized video selection with loading state
  const handleVideoSelect = useCallback((video: VideoData) => {
    setIsLoading(true);

    // Simulate modal load time
    setTimeout(() => {
      setSelectedVideo(video);
      setIsWatchMode(true);
      setIsLoading(false);
    }, 80);
  }, []);

  // Performance-optimized filter pill component
  const FilterPill = React.memo<{
    category: typeof FILTER_CATEGORIES[number];
    isActive: boolean;
  }>(({ category, isActive }) => (
    <motion.button
      onClick={() => handleFilterChange(category.id)}
      className={cn(
        "relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        isActive
          ? "text-white"
          : "text-gray-700 hover:text-gray-900"
      )}
      style={{
        background: isActive
          ? 'linear-gradient(90deg, #6C5CE7, #8A6CF6, #4BB0FF)'
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: isActive
          ? '0 4px 12px rgba(108, 92, 231, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 2px 6px rgba(20, 18, 30, 0.06)'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-selected={isActive}
      role="tab"
    >
      {category.label}
    </motion.button>
  ));

  // Performance-optimized video card with lazy loading
  const VideoCard = React.memo<{ video: VideoData; index: number }>(({ video, index }) => {
    const [imageRef, isImageVisible] = useIntersectionObserver(0.1);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.05,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="group cursor-pointer"
        onClick={() => handleVideoSelect(video)}
      >
        <motion.div
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 6px 18px rgba(20, 18, 30, 0.06)'
          }}
          whileHover={{
            y: -6,
            boxShadow: '0 12px 24px rgba(20, 18, 30, 0.12), 0 0 0 1px rgba(108, 92, 231, 0.1)',
            transition: { duration: 0.2 }
          }}
        >
          {/* Optimized thumbnail with lazy loading */}
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <div ref={imageRef} className="w-full h-full">
              {/* LQIP placeholder */}
              {!imageLoaded && video.thumbnailBlurred && (
                <img
                  src={video.thumbnailBlurred}
                  alt=""
                  className="w-full h-full object-cover filter blur-sm scale-110"
                />
              )}

              {/* High-res image */}
              {isImageVisible && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-700",
                    "group-hover:scale-105",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                />
              )}
            </div>

            {/* Clean duration pill */}
            <div
              className="absolute bottom-2 right-2 px-2 py-1 text-white text-xs font-medium rounded-md"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)'
              }}
            >
              {video.duration}
            </div>

            {/* Minimal play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
              <motion.div
                className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                style={{
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="w-4 h-4 text-gray-900 ml-0.5" fill="currentColor" />
              </motion.div>
            </div>
          </div>

          {/* Clean card content */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
              {video.title}
            </h3>

            {/* Creator row */}
            <div className="flex items-center gap-3">
              <img
                src={video.creator.avatar}
                alt={video.creator.name}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {video.creator.name}
                  </span>
                  {video.creator.verified && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{video.publishedAt}</span>
                </div>
              </div>

              {/* Small ZAP indicator */}
              {video.zapsReward > 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(255, 184, 107, 0.2)',
                    color: '#FFB86B'
                  }}
                >
                  <Zap className="w-3 h-3" fill="currentColor" />
                  <span>+{video.zapsReward}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  });

  // Optimized watch modal
  const WatchModal = React.memo(() => {
    if (!selectedVideo) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={() => {
          setIsWatchMode(false);
          setSelectedVideo(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, type: "spring", damping: 25 }}
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full">
            {/* Main video section */}
            <div className="flex-1 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    setIsWatchMode(false);
                    setSelectedVideo(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              </div>

              {/* Video player */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-6">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>

              {/* Creator and actions */}
              <div className="space-y-4">
                {/* Creator profile */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedVideo.creator.avatar}
                      alt={selectedVideo.creator.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {selectedVideo.creator.name}
                        </span>
                        {selectedVideo.creator.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedVideo.creator.subscribers} subscribers
                      </p>
                      {selectedVideo.creator.bio && (
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedVideo.creator.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      className="px-4 py-2 text-white rounded-lg font-medium"
                      style={{
                        background: 'linear-gradient(90deg, #6C5CE7, #8A6CF6, #4BB0FF)',
                        boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)'
                      }}
                    >
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      Subscribe
                    </button>

                    <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <Share className="w-4 h-4" />
                    </button>

                    <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      className="px-3 py-2 text-white rounded-lg font-medium"
                      style={{
                        background: '#FFB86B',
                        boxShadow: '0 4px 12px rgba(255, 184, 107, 0.3)'
                      }}
                    >
                      <Zap className="w-4 h-4 inline mr-1" fill="currentColor" />
                      Tip
                    </button>
                  </div>
                </div>

                {/* Title and description */}
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedVideo.title}
                  </h1>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedVideo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Up Next sidebar */}
            <div
              className="w-80 border-l overflow-y-auto"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Up Next</h3>
                <div className="space-y-3">
                  {relatedVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="flex gap-3 p-2 rounded-lg hover:bg-white/50 cursor-pointer transition-colors"
                    >
                      <div className="relative w-24 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-600">{video.creator.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{video.views}</span>
                          <span>•</span>
                          <span>⚡ +{video.zapsReward}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  });

  return (
    <div
      className={cn("min-h-screen", className)}
      style={{
        background: 'linear-gradient(135deg, #FEF9FF 0%, #F5F3FF 100%)'
      }}
    >
      {/* Single filter row - directly on backdrop */}
      <div className="sticky top-0 z-30 pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={filterScrollRef}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex items-center gap-3 min-w-max">
              {FILTER_CATEGORIES.map((category) => (
                <FilterPill
                  key={category.id}
                  category={category}
                  isActive={activeFilter === category.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Optimized video grid - Full space utilization */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div
          className={cn(
            "grid gap-6",
            isMobile
              ? "grid-cols-1"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          )}
        >
          {filteredVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>
      )}

      {/* Optimized watch modal */}
      <AnimatePresence>
        {isWatchMode && <WatchModal />}
      </AnimatePresence>
    </div>
  );
};

export default WIZUPDashboardV12;