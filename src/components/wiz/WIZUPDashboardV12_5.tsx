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
  Users,
  X,
  ChevronRight,
  BookOpen,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Enhanced video data interface for V12.5
interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  thumbnailBlurred?: string;
  videoUrl: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    subscribers: string;
    verified: boolean;
    bio?: string;
    hasExtras?: boolean;
    community?: boolean;
    courses?: boolean;
    coaching?: boolean;
    products?: boolean;
  };
  duration: string;
  views: string;
  likes: string;
  description: string;
  zapsReward: number;
  category: string;
  publishedAt: string;
  daysAgo: number;
}

// Premium filter categories for V12.5
const FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tech', label: 'Tech' },
  { id: 'money', label: 'Money' },
  { id: 'design', label: 'Design' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health' },
  { id: 'self-improvement', label: 'Self Improvement' },
  { id: 'education', label: 'Education' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'social', label: 'Social' },
  { id: 'diy', label: 'DIY' }
] as const;

// Enhanced video data with creator extras
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
      bio: 'Serial entrepreneur helping founders scale to 8-figures',
      hasExtras: true,
      community: true,
      courses: true,
      coaching: true,
      products: false
    },
    duration: '28:45',
    views: '487K',
    likes: '42K',
    description: 'Learn the exact playbook I used to build multiple 8-figure companies from scratch. This comprehensive guide covers everything from initial product development to scaling systems.',
    zapsReward: 1250,
    category: 'business',
    publishedAt: '2024-01-15',
    daysAgo: 3
  },
  {
    id: '2',
    title: 'React Performance: From Slow to Lightning Fast',
    thumbnail: 'https://i.ytimg.com/vi/sample2/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample2',
    creator: {
      id: 'kent-dodds',
      name: 'Kent C. Dodds',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kent',
      subscribers: '890K',
      verified: true,
      bio: 'Full-stack developer educator',
      hasExtras: true,
      community: false,
      courses: true,
      coaching: false,
      products: true
    },
    duration: '45:12',
    views: '234K',
    likes: '18K',
    description: 'Master advanced React optimization techniques for production applications.',
    zapsReward: 980,
    category: 'tech',
    publishedAt: '2024-01-14',
    daysAgo: 5
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
      bio: 'AI-driven design strategist',
      hasExtras: false,
      community: true,
      courses: false,
      coaching: true,
      products: false
    },
    duration: '32:18',
    views: '178K',
    likes: '15K',
    description: 'How AI is revolutionizing design workflows and creating smarter interfaces.',
    zapsReward: 1150,
    category: 'design',
    publishedAt: '2024-01-13',
    daysAgo: 7
  },
  {
    id: '4',
    title: 'Mastering Sleep: Science-Based Optimization',
    thumbnail: 'https://i.ytimg.com/vi/sample4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample4',
    creator: {
      id: 'andrew-huberman',
      name: 'Dr. Andrew Huberman',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrew',
      subscribers: '3.2M',
      verified: true,
      bio: 'Stanford neuroscientist',
      hasExtras: true,
      community: true,
      courses: true,
      coaching: false,
      products: true
    },
    duration: '52:30',
    views: '892K',
    likes: '67K',
    description: 'Evidence-based strategies for optimizing sleep quality and duration.',
    zapsReward: 1100,
    category: 'health',
    publishedAt: '2024-01-12',
    daysAgo: 8
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
      bio: 'Crypto education and analysis',
      hasExtras: true,
      community: true,
      courses: true,
      coaching: true,
      products: true
    },
    duration: '38:22',
    views: '345K',
    likes: '29K',
    description: 'Develop winning psychology for volatile crypto markets.',
    zapsReward: 920,
    category: 'money',
    publishedAt: '2024-01-11',
    daysAgo: 9
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
      bio: 'Author of Atomic Habits',
      hasExtras: false,
      community: false,
      courses: false,
      coaching: false,
      products: true
    },
    duration: '41:15',
    views: '567K',
    likes: '45K',
    description: 'Practical strategies for building sustainable routines.',
    zapsReward: 850,
    category: 'self-improvement',
    publishedAt: '2024-01-10',
    daysAgo: 10
  }
];

interface WIZUPDashboardV12_5Props {
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

const WIZUPDashboardV12_5: React.FC<WIZUPDashboardV12_5Props> = ({ className }) => {
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
    return SAMPLE_VIDEOS.filter(v => v.id !== selectedVideo.id).slice(0, 8);
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
    }, 100);
  }, []);

  // Premium filter pill component with glassmorphism
  const FilterPill = React.memo<{
    category: typeof FILTER_CATEGORIES[number];
    isActive: boolean;
  }>(({ category, isActive }) => (
    <motion.button
      onClick={() => handleFilterChange(category.id)}
      className={cn(
        "relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap",
        "focus:outline-none",
        isActive
          ? "text-white shadow-lg"
          : "text-slate-700 hover:text-slate-900"
      )}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.9), rgba(139, 92, 246, 0.95), rgba(99, 102, 241, 0.9))'
          : 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(12px)',
        border: isActive
          ? '1px solid rgba(255, 255, 255, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: isActive
          ? '0 8px 32px rgba(124, 58, 237, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
      whileHover={{
        scale: 1.05,
        y: -2,
        boxShadow: isActive
          ? '0 12px 40px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 8px 24px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
      whileTap={{ scale: 0.98 }}
      aria-selected={isActive}
      role="tab"
    >
      <span className="relative z-10">{category.label}</span>
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(139, 92, 246, 0.2))',
            filter: 'blur(8px)'
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  ));

  // Enhanced video card with premium glassmorphism
  const VideoCard = React.memo<{ video: VideoData; index: number }>(({ video, index }) => {
    const [imageRef, isImageVisible] = useIntersectionObserver(0.1);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.08,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="group cursor-pointer"
        onClick={() => handleVideoSelect(video)}
      >
        <motion.div
          className="rounded-3xl overflow-hidden transition-all duration-400"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(20, 18, 30, 0.08)'
          }}
          whileHover={{
            y: -8,
            scale: 1.02,
            boxShadow: '0 20px 40px rgba(20, 18, 30, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.1)',
            transition: { duration: 0.3 }
          }}
        >
          {/* Premium thumbnail with lazy loading */}
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
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

            {/* Premium duration pill */}
            <div
              className="absolute bottom-3 right-3 px-3 py-1.5 text-white text-xs font-semibold rounded-full"
              style={{
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {video.duration}
            </div>

            {/* Premium play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-400 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Play className="w-6 h-6 text-slate-800 ml-1" fill="currentColor" />
              </motion.div>
            </div>
          </div>

          {/* Premium card content */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-2">
              {video.title}
            </h3>

            {/* Creator row */}
            <div className="flex items-center gap-3">
              <img
                src={video.creator.avatar}
                alt={video.creator.name}
                className="w-8 h-8 rounded-full ring-2 ring-white/60"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {video.creator.name}
                  </span>
                  {video.creator.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="font-medium">{video.views}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">{video.daysAgo}d ago</span>
                </div>
              </div>

              {/* Premium ZAP indicator */}
              {video.zapsReward > 0 && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 184, 107, 0.3), rgba(245, 158, 11, 0.2))',
                    color: '#D97706',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}
                >
                  <Zap className="w-3.5 h-3.5" fill="currentColor" />
                  <span>+{video.zapsReward}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  });

  // Premium full-screen watch modal
  const WatchModal = React.memo(() => {
    if (!selectedVideo) return null;

    const creatorExtras = [
      { id: 'community', label: 'Community', icon: Users, available: selectedVideo.creator.community },
      { id: 'courses', label: 'Courses', icon: BookOpen, available: selectedVideo.creator.courses },
      { id: 'coaching', label: 'Coaching', icon: UserPlus, available: selectedVideo.creator.coaching },
      { id: 'products', label: 'Products', icon: Package, available: selectedVideo.creator.products }
    ].filter(extra => extra.available);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)'
        }}
        onClick={() => {
          setIsWatchMode(false);
          setSelectedVideo(null);
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.4, type: "spring", damping: 25 }}
          className="w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-3xl mx-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full">
            {/* Main video section */}
            <div className="flex-1 p-8 overflow-y-auto">
              {/* Header with back button */}
              <div className="flex items-center justify-between mb-8">
                <motion.button
                  onClick={() => {
                    setIsWatchMode(false);
                    setSelectedVideo(null);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 transition-all duration-200 rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-semibold">Back</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    setIsWatchMode(false);
                    setSelectedVideo(null);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Video player */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 mb-8 shadow-2xl">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>

              {/* Creator and actions */}
              <div className="space-y-6">
                {/* Creator profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-5">
                    <img
                      src={selectedVideo.creator.avatar}
                      alt={selectedVideo.creator.name}
                      className="w-16 h-16 rounded-full ring-4 ring-white/60"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-slate-900">
                          {selectedVideo.creator.name}
                        </span>
                        {selectedVideo.creator.verified && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        {selectedVideo.creator.subscribers} subscribers
                      </p>
                      {selectedVideo.creator.bio && (
                        <p className="text-sm text-slate-700 max-w-md leading-relaxed">
                          {selectedVideo.creator.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      className="px-6 py-3 text-white rounded-full font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #8B5CF6, #6366F1)',
                        boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)'
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <UserPlus className="w-5 h-5 inline mr-2" />
                      Subscribe
                    </motion.button>

                    <motion.button
                      className="p-3 text-slate-600 hover:text-slate-900 transition-colors rounded-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      className="p-3 text-slate-600 hover:text-slate-900 transition-colors rounded-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Bookmark className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      className="px-4 py-3 text-white rounded-full font-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Zap className="w-5 h-5 inline mr-2" fill="currentColor" />
                      Tip
                    </motion.button>
                  </div>
                </div>

                {/* Title and description */}
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                    {selectedVideo.title}
                  </h1>
                  <p className="text-slate-700 leading-relaxed text-base">
                    {selectedVideo.description}
                  </p>
                </div>

                {/* Creator extras if available */}
                {selectedVideo.creator.hasExtras && creatorExtras.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Explore More</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {creatorExtras.map((extra) => (
                        <motion.div
                          key={extra.id}
                          className="p-4 rounded-xl cursor-pointer text-center"
                          style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                          }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <extra.icon className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                          <span className="text-sm font-semibold text-slate-900">{extra.label}</span>
                          <ChevronRight className="w-4 h-4 mx-auto mt-1 text-slate-500" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Up Next sidebar */}
            <div
              className="w-96 overflow-y-auto"
              style={{
                borderLeft: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Up Next</h3>
                <div className="space-y-4">
                  {relatedVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative w-28 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded font-medium">
                          {video.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight">
                          {video.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <img
                            src={video.creator.avatar}
                            alt={video.creator.name}
                            className="w-4 h-4 rounded-full"
                          />
                          <p className="text-xs font-medium text-slate-600 truncate">{video.creator.name}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{video.views}</span>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" fill="currentColor" />
                            <span className="font-bold text-amber-600">+{video.zapsReward}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
    <div className={cn("relative", className)}>
      {/* Ambient glow accents */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #FFDDF8 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-8 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #DDE8FF 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Seamless filter bubbles - no container background */}
      <div className="sticky top-0 z-30 pt-6 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div
            ref={filterScrollRef}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex items-center gap-4 min-w-max">
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

      {/* Premium video grid - desktop 3-column, responsive */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-12">
        <div
          className={cn(
            "grid gap-8",
            isMobile
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
            className="w-12 h-12 border-3 border-white border-t-purple-500 rounded-full animate-spin"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      )}

      {/* Premium watch modal */}
      <AnimatePresence>
        {isWatchMode && <WatchModal />}
      </AnimatePresence>
    </div>
  );
};

export default WIZUPDashboardV12_5;