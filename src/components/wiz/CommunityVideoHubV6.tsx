import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  UserPlus,
  DollarSign,
  Users,
  GraduationCap,
  MessageSquare,
  Package,
  X,
  ChevronRight,
  Zap,
  Star,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import UltraPremiumFilterBubbles from './UltraPremiumFilterBubbles';

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    subscribers: string;
    verified: boolean;
  };
  duration: string;
  views: string;
  likes: string;
  description: string;
  zapsReward: number;
  category: string;
  offerings: CreatorOffering[];
}

interface CreatorOffering {
  id: string;
  type: 'community' | 'course' | 'coaching' | 'product';
  title: string;
  description: string;
  price?: string;
  thumbnail?: string;
  link: string;
  featured?: boolean;
}

interface FilterCategory {
  id: string;
  label: string;
}

// Filter categories are now handled by UltraPremiumFilterBubbles component

// Sample video data with creator offerings
const sampleVideos: VideoData[] = [
  {
    id: '1',
    title: 'Advanced React Patterns: Building Scalable Applications',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    creator: {
      id: 'techmaster',
      name: 'TechMaster Pro',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techmaster',
      subscribers: '245K',
      verified: true
    },
    duration: '15:42',
    views: '124K',
    likes: '12K',
    description: 'Learn advanced React patterns that will make your applications more scalable and maintainable. We cover compound components, render props, and custom hooks.',
    zapsReward: 850,
    category: 'tech',
    offerings: [
      {
        id: '1',
        type: 'community',
        title: 'React Developers Community',
        description: 'Join 5K+ React developers',
        link: '/community/react-devs',
        featured: true
      },
      {
        id: '2',
        type: 'course',
        title: 'Complete React Mastery',
        description: 'From beginner to expert in 12 weeks',
        price: '$299',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        link: '/course/react-mastery'
      },
      {
        id: '3',
        type: 'coaching',
        title: '1-on-1 React Mentoring',
        description: 'Personal guidance from industry experts',
        price: '$150/hour',
        link: '/coaching/react-mentor'
      },
      {
        id: '4',
        type: 'product',
        title: 'React Component Library',
        description: '100+ production-ready components',
        price: '$99',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        link: '/product/component-library'
      }
    ]
  },
  {
    id: '2',
    title: 'Building Wealth: Investment Strategies for 2024',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    creator: {
      id: 'wealthbuilder',
      name: 'WealthBuilder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wealth',
      subscribers: '182K',
      verified: false
    },
    duration: '22:15',
    views: '89K',
    likes: '8.5K',
    description: 'Discover proven investment strategies that have helped thousands build generational wealth. Learn about diversification, risk management, and compound growth.',
    zapsReward: 1200,
    category: 'money',
    offerings: [
      {
        id: '5',
        type: 'community',
        title: 'Wealth Builders Circle',
        description: 'Private community of investors',
        link: '/community/wealth-builders'
      },
      {
        id: '6',
        type: 'course',
        title: 'Investment Masterclass',
        description: 'Complete guide to smart investing',
        price: '$497',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        link: '/course/investment-masterclass',
        featured: true
      },
      {
        id: '7',
        type: 'product',
        title: 'Portfolio Tracker Pro',
        description: 'Advanced investment tracking tool',
        price: '$29/month',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        link: '/product/portfolio-tracker'
      }
    ]
  }
];

interface CommunityVideoHubV6Props {
  onVideoSelect?: (video: VideoData) => void;
  className?: string;
}

const CommunityVideoHubV6: React.FC<CommunityVideoHubV6Props> = ({
  onVideoSelect,
  className
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const filterScrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isDark = theme === 'dark';

  const { scrollY } = useScroll();
  const filterBarY = useTransform(scrollY, [0, 100], [0, -5]);

  // Filter videos based on category
  const filteredVideos = React.useMemo(() => {
    if (activeFilter === 'all') return sampleVideos;
    if (activeFilter === 'trending') return sampleVideos.slice(0, 3);
    if (activeFilter === 'new') return sampleVideos.slice(1, 4);
    if (activeFilter === 'top-rated') return sampleVideos.slice(0, 2);
    if (activeFilter === 'free') return sampleVideos.slice(0, 4);
    if (activeFilter === 'premium') return sampleVideos.slice(1, 3);
    return sampleVideos.filter(video => video.category === activeFilter);
  }, [activeFilter]);

  // Related videos (exclude current video)
  const relatedVideos = sampleVideos.filter(video => video.id !== selectedVideo?.id);

  // Handle video selection
  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    onVideoSelect?.(video);
  };

  // Close full-screen mode
  const closeVideoPlayer = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };


  // Video card component
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
        onClick={() => handleVideoSelect(video)}
      >
        <motion.div
          className={cn(
            "rounded-xl overflow-hidden transition-all duration-300 ease-out",
            isDark ? "bg-gray-900/20" : "bg-white/60"
          )}
          animate={{
            y: isHovered ? -6 : 0,
            boxShadow: isHovered
              ? isDark
                ? "0 20px 40px rgba(0, 0, 0, 0.3)"
                : "0 20px 40px rgba(0, 0, 0, 0.1)"
              : "0 4px 20px rgba(0, 0, 0, 0.05)"
          }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <motion.img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.02 : 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Duration */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 rounded-md text-white text-xs font-medium">
              {video.duration}
            </div>

            {/* Play button overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/20"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/95 rounded-full text-gray-900 font-semibold text-sm shadow-lg">
                    <Play className="w-4 h-4" fill="currentColor" />
                    Watch
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className={cn(
              "font-bold text-base mb-2 line-clamp-2 leading-tight",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {video.title}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={video.creator.avatar}
                  alt={video.creator.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className={cn(
                  "text-sm font-medium",
                  isDark ? "text-gray-300" : "text-gray-600"
                )}>
                  {video.creator.name}
                </span>
              </div>

              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
                <Zap className="w-3 h-3 text-yellow-500" fill="currentColor" />
                <span className="text-xs font-bold text-yellow-600">+{video.zapsReward}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Creator offering card
  const OfferingCard: React.FC<{ offering: CreatorOffering }> = ({ offering }) => {
    const getIcon = () => {
      switch (offering.type) {
        case 'community': return <Users className="w-5 h-5" />;
        case 'course': return <GraduationCap className="w-5 h-5" />;
        case 'coaching': return <MessageSquare className="w-5 h-5" />;
        case 'product': return <Package className="w-5 h-5" />;
      }
    };

    return (
      <motion.div
        className={cn(
          "p-4 rounded-xl border transition-all duration-300 cursor-pointer group",
          isDark
            ? "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
            : "bg-white/70 border-gray-200/50 hover:border-gray-300",
          offering.featured && "ring-2 ring-purple-500/20"
        )}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isDark ? "bg-gray-700/50" : "bg-gray-100/70"
          )}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              "font-semibold text-sm mb-1",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {offering.title}
            </h4>
            <p className={cn(
              "text-xs mb-2",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              {offering.description}
            </p>
            {offering.price && (
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-bold",
                  isDark ? "text-green-400" : "text-green-600"
                )}>
                  {offering.price}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (selectedVideo) {
    // Full-screen video experience
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-black"
      >
        <div className="h-full flex flex-col">
          {/* Video Player Area */}
          <div className="flex-1 flex">
            {/* Main Video */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allowFullScreen
                />

                {/* Close button */}
                <button
                  onClick={closeVideoPlayer}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Side Panel */}
            <AnimatePresence>
              {showSidePanel && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  className="w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700/50 overflow-y-auto"
                >
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-4">Related Videos</h3>
                    <div className="space-y-3">
                      {relatedVideos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => handleVideoSelect(video)}
                          className="flex gap-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                        >
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium line-clamp-2 mb-1">
                              {video.title}
                            </h4>
                            <p className="text-gray-400 text-xs">{video.creator.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Creator Details & Marketplace */}
          <div className={cn(
            "border-t",
            isDark ? "bg-gray-900/95 border-gray-700/50" : "bg-white/95 border-gray-200/50"
          )}>
            <div className="max-w-6xl mx-auto p-6">
              {/* Creator & Video Info */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className={cn(
                    "text-2xl font-bold mb-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {selectedVideo.title}
                  </h1>
                  <p className={cn(
                    "text-sm mb-4",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}>
                    {selectedVideo.description}
                  </p>

                  {/* Creator Strip */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedVideo.creator.avatar}
                        alt={selectedVideo.creator.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            {selectedVideo.creator.name}
                          </span>
                          {selectedVideo.creator.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          {selectedVideo.creator.subscribers} subscribers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg transition-all">
                        <UserPlus className="w-4 h-4 inline mr-2" />
                        Subscribe
                      </button>
                      <button className={cn(
                        "px-4 py-2 border-2 rounded-full font-semibold transition-all",
                        isDark
                          ? "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                          : "border-yellow-500/50 text-yellow-600 hover:bg-yellow-50"
                      )}>
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Tip
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Row */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700/30">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 text-gray-300 hover:text-white transition-colors">
                  <Heart className="w-4 h-4" />
                  {selectedVideo.likes}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 text-gray-300 hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Comment
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 text-gray-300 hover:text-white transition-colors">
                  <Share className="w-4 h-4" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 text-gray-300 hover:text-white transition-colors">
                  <Bookmark className="w-4 h-4" />
                  Save
                </button>
              </div>

              {/* Creator Offerings Marketplace */}
              <div>
                <h3 className={cn(
                  "text-lg font-bold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Creator's Ecosystem
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedVideo.offerings.map((offering) => (
                    <OfferingCard key={offering.id} offering={offering} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Main hub view
  return (
    <div className={cn("min-h-screen", className)}>
      {/* Ultra-Premium Filter Bubbles */}
      <UltraPremiumFilterBubbles
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={cn(
          "grid gap-8",
          isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {filteredVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityVideoHubV6;