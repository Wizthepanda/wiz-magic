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
  videoId: string;
  creator: string;
  creatorAvatar?: string;
  subscriberCount?: string;
  isVerified?: boolean;
  creatorDetails?: {
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
  xpReward: number;
  zapsReward: number;
  category: string;
  publishedAt: string;
  daysAgo: number;
}

// V16 Premium filter categories with gradient palettes
const FILTER_CATEGORIES = [
  {
    id: 'all',
    label: 'All',
    gradient: {
      default: 'linear-gradient(90deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))',
      hover: 'linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))',
      active: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))'
    }
  },
  {
    id: 'tech',
    label: 'Tech',
    gradient: {
      default: 'linear-gradient(90deg, rgba(0,102,255,0.15), rgba(102,204,255,0.08))',
      hover: 'linear-gradient(90deg, rgba(0,102,255,0.25), rgba(102,204,255,0.12))',
      active: 'linear-gradient(90deg, rgba(0,102,255,0.8), rgba(102,204,255,0.6))'
    }
  },
  {
    id: 'money',
    label: 'Money',
    gradient: {
      default: 'linear-gradient(90deg, rgba(0,204,102,0.15), rgba(153,255,204,0.08))',
      hover: 'linear-gradient(90deg, rgba(0,204,102,0.25), rgba(153,255,204,0.12))',
      active: 'linear-gradient(90deg, rgba(0,204,102,0.8), rgba(153,255,204,0.6))'
    }
  },
  {
    id: 'design',
    label: 'Design',
    gradient: {
      default: 'linear-gradient(90deg, rgba(140,82,255,0.15), rgba(82,180,255,0.08))',
      hover: 'linear-gradient(90deg, rgba(140,82,255,0.25), rgba(82,180,255,0.12))',
      active: 'linear-gradient(90deg, rgba(140,82,255,0.8), rgba(82,180,255,0.6))'
    }
  },
  {
    id: 'business',
    label: 'Business',
    gradient: {
      default: 'linear-gradient(90deg, rgba(72,61,139,0.15), rgba(147,112,219,0.08))',
      hover: 'linear-gradient(90deg, rgba(72,61,139,0.25), rgba(147,112,219,0.12))',
      active: 'linear-gradient(90deg, rgba(72,61,139,0.8), rgba(147,112,219,0.6))'
    }
  },
  {
    id: 'health',
    label: 'Health',
    gradient: {
      default: 'linear-gradient(90deg, rgba(46,204,113,0.15), rgba(171,235,198,0.08))',
      hover: 'linear-gradient(90deg, rgba(46,204,113,0.25), rgba(171,235,198,0.12))',
      active: 'linear-gradient(90deg, rgba(46,204,113,0.8), rgba(171,235,198,0.6))'
    }
  },
  {
    id: 'self-improvement',
    label: 'Self Improvement',
    gradient: {
      default: 'linear-gradient(90deg, rgba(255,159,67,0.15), rgba(255,204,153,0.08))',
      hover: 'linear-gradient(90deg, rgba(255,159,67,0.25), rgba(255,204,153,0.12))',
      active: 'linear-gradient(90deg, rgba(255,159,67,0.8), rgba(255,204,153,0.6))'
    }
  },
  {
    id: 'education',
    label: 'Education',
    gradient: {
      default: 'linear-gradient(90deg, rgba(0,128,128,0.15), rgba(102,205,170,0.08))',
      hover: 'linear-gradient(90deg, rgba(0,128,128,0.25), rgba(102,205,170,0.12))',
      active: 'linear-gradient(90deg, rgba(0,128,128,0.8), rgba(102,205,170,0.6))'
    }
  },
  {
    id: 'gaming',
    label: 'Gaming',
    gradient: {
      default: 'linear-gradient(90deg, rgba(155,89,182,0.15), rgba(195,155,211,0.08))',
      hover: 'linear-gradient(90deg, rgba(155,89,182,0.25), rgba(195,155,211,0.12))',
      active: 'linear-gradient(90deg, rgba(155,89,182,0.8), rgba(195,155,211,0.6))'
    }
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    gradient: {
      default: 'linear-gradient(90deg, rgba(255,94,98,0.15), rgba(255,195,113,0.08))',
      hover: 'linear-gradient(90deg, rgba(255,94,98,0.25), rgba(255,195,113,0.12))',
      active: 'linear-gradient(90deg, rgba(255,94,98,0.8), rgba(255,195,113,0.6))'
    }
  },
  {
    id: 'social',
    label: 'Social',
    gradient: {
      default: 'linear-gradient(90deg, rgba(52,152,219,0.15), rgba(174,214,241,0.08))',
      hover: 'linear-gradient(90deg, rgba(52,152,219,0.25), rgba(174,214,241,0.12))',
      active: 'linear-gradient(90deg, rgba(52,152,219,0.8), rgba(174,214,241,0.6))'
    }
  },
  {
    id: 'diy',
    label: 'DIY',
    gradient: {
      default: 'linear-gradient(90deg, rgba(127,140,141,0.15), rgba(189,195,199,0.08))',
      hover: 'linear-gradient(90deg, rgba(127,140,141,0.25), rgba(189,195,199,0.12))',
      active: 'linear-gradient(90deg, rgba(127,140,141,0.8), rgba(189,195,199,0.6))'
    }
  }
] as const;

// Enhanced video data with creator extras
const SAMPLE_VIDEOS: VideoData[] = [
  {
    id: '1',
    title: 'Building a $10M SaaS Empire: The Complete Blueprint',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    thumbnailBlurred: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ',
    creator: 'Alex Hormozi',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    subscriberCount: '2.1M subscribers',
    isVerified: true,
    creatorDetails: {
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
    views: '487K views',
    likes: '42K',
    description: 'Learn the exact playbook I used to build multiple 8-figure companies from scratch. This comprehensive guide covers everything from initial product development to scaling systems.',
    xpReward: 1250,
    zapsReward: 1250,
    category: 'business',
    publishedAt: '2024-01-15',
    daysAgo: 3
  },
  {
    id: '2',
    title: 'React Performance: From Slow to Lightning Fast',
    thumbnail: 'https://i.ytimg.com/vi/M7lc1UVf-VE/maxresdefault.jpg',
    thumbnailBlurred: 'https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    videoId: 'M7lc1UVf-VE',
    creator: 'Kent C. Dodds',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kent',
    subscriberCount: '890K subscribers',
    isVerified: true,
    creatorDetails: {
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
    views: '234K views',
    likes: '18K',
    description: 'Master advanced React optimization techniques for production applications.',
    xpReward: 980,
    zapsReward: 980,
    category: 'tech',
    publishedAt: '2024-01-14',
    daysAgo: 5
  },
  {
    id: '3',
    title: 'AI Design Systems: The Future of UI/UX',
    thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/maxresdefault.jpg',
    thumbnailBlurred: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
    videoId: '9bZkp7q19f0',
    creator: 'Sarah Chen',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    subscriberCount: '756K subscribers',
    isVerified: true,
    creatorDetails: {
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
    views: '178K views',
    likes: '15K',
    description: 'How AI is revolutionizing design workflows and creating smarter interfaces.',
    xpReward: 1150,
    zapsReward: 1150,
    category: 'design',
    publishedAt: '2024-01-13',
    daysAgo: 7
  },
  {
    id: '4',
    title: 'Mastering Sleep: Science-Based Optimization',
    thumbnail: 'https://i.ytimg.com/vi/nm1TxQj9IsQ/maxresdefault.jpg',
    thumbnailBlurred: 'https://i.ytimg.com/vi/nm1TxQj9IsQ/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/nm1TxQj9IsQ',
    videoId: 'nm1TxQj9IsQ',
    creator: 'Dr. Andrew Huberman',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrew',
    subscriberCount: '3.2M subscribers',
    isVerified: true,
    creatorDetails: {
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
    views: '892K views',
    likes: '67K',
    description: 'Evidence-based strategies for optimizing sleep quality and duration.',
    xpReward: 1100,
    zapsReward: 1100,
    category: 'health',
    publishedAt: '2024-01-12',
    daysAgo: 8
  },
  {
    id: '5',
    title: 'Crypto Trading Psychology: Master Your Mind',
    thumbnail: 'https://i.ytimg.com/vi/p_6WJmgMxqs/maxresdefault.jpg',
    thumbnailBlurred: 'https://i.ytimg.com/vi/p_6WJmgMxqs/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/p_6WJmgMxqs',
    videoId: 'p_6WJmgMxqs',
    creator: 'Coin Bureau',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=crypto',
    subscriberCount: '2.8M subscribers',
    isVerified: true,
    creatorDetails: {
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
    views: '345K views',
    likes: '29K',
    description: 'Develop winning psychology for volatile crypto markets.',
    xpReward: 920,
    zapsReward: 920,
    category: 'money',
    publishedAt: '2024-01-11',
    daysAgo: 9
  },
  {
    id: '6',
    title: 'Building Atomic Habits That Actually Stick',
    thumbnail: 'https://i.ytimg.com/vi/UiTOhZQbAhg/maxresdefault.jpg',
    thumbnailBlurred: 'https://i.ytimg.com/vi/UiTOhZQbAhg/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/UiTOhZQbAhg',
    videoId: 'UiTOhZQbAhg',
    creator: 'James Clear',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    subscriberCount: '1.5M subscribers',
    isVerified: true,
    creatorDetails: {
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
    views: '567K views',
    likes: '45K',
    description: 'Practical strategies for building sustainable routines.',
    xpReward: 850,
    zapsReward: 850,
    category: 'self-improvement',
    publishedAt: '2024-01-10',
    daysAgo: 10
  }
];

interface WIZUPDashboardV12_5Props {
  className?: string;
  onVideoSelect?: (video: VideoData) => void;
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

const WIZUPDashboardV12_5: React.FC<WIZUPDashboardV12_5Props> = ({ className, onVideoSelect }) => {
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
    if (onVideoSelect) {
      // Use parent's video selection handler (WatchDialogV4)
      onVideoSelect(video);
    } else {
      // Fall back to internal modal
      setIsLoading(true);
      setTimeout(() => {
        setSelectedVideo(video);
        setIsWatchMode(true);
        setIsLoading(false);
      }, 100);
    }
  }, [onVideoSelect]);

  // V16 Premium Glassmorphic Filter Pills with Gradient Palettes
  const FilterPill = React.memo<{
    category: typeof FILTER_CATEGORIES[number];
    isActive: boolean;
  }>(({ category, isActive }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getGradient = () => {
      if (isActive) return category.gradient.active;
      if (isHovered) return category.gradient.hover;
      return category.gradient.default;
    };

    const getTextColor = () => {
      if (isActive && category.id === 'all') return 'text-black';
      if (isActive) return 'text-white';
      return 'text-gray-700 hover:text-gray-900';
    };

    return (
      <motion.button
        onClick={() => handleFilterChange(category.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative px-4 py-2 h-10 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap overflow-hidden border-0",
          getTextColor()
        )}
        style={{
          background: getGradient(),
          backdropFilter: 'blur(12px)',
          border: 'none',
          boxShadow: 'none'
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        whileHover={{
          scale: 1.02,
          y: -1,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
        aria-selected={isActive}
        role="tab"
      >
        {/* Premium shimmer effect for active state */}
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut'
            }}
          />
        )}
        <span className="relative z-10 font-medium">{category.label}</span>
      </motion.button>
    );
  });

  // Enhanced video card with premium glassmorphism
  const VideoCard = React.memo<{ video: VideoData; index: number }>(({ video, index }) => {
    const [imageRef, isImageVisible] = useIntersectionObserver(0.1);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="group cursor-pointer"
        onClick={() => handleVideoSelect(video)}
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          }}
          whileHover={{
            y: -6,
            scale: 1.01,
            filter: 'brightness(1.02)',
            transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
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
            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 font-sans">
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xl"
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
          className="w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-2xl mx-4 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
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
                        background: 'rgba(255, 255, 255, 0.20)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Share className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      className="p-3 text-slate-600 hover:text-slate-900 transition-colors rounded-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.20)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)'
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
                          className="p-4 rounded-xl cursor-pointer text-center bg-white/10 backdrop-blur-lg border border-white/20"
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
            <div className="w-96 overflow-y-auto border-l border-white/10 bg-white/5 backdrop-blur-xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Up Next</h3>
                <div className="space-y-4">
                  {relatedVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10"
                      whileHover={{ scale: 1.01 }}
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
      {/* Content Wrapper - Seamless Scrolling */}
      <div className="content-wrapper px-8 lg:px-10 xl:px-12 pt-6">

        {/* Filter Chips - Natural Scroll with Content */}
        <div className="filter-row mb-6">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2">
            {FILTER_CATEGORIES.map((category) => (
              <FilterPill
                key={category.id}
                category={category}
                isActive={activeFilter === category.id}
              />
            ))}
          </div>
        </div>

        {/* Video Grid - 3 Column Constraint, Left Baseline Aligned */}
        <section className="video-grid-section">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </section>
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

    </div>
  );
};

export default WIZUPDashboardV12_5;