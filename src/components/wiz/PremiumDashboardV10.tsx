import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowLeft,
  Heart,
  MessageCircle,
  Share,
  Zap,
  Eye,
  Users,
  GraduationCap,
  MessageSquare,
  Package,
  Star,
  UserPlus,
  Bookmark,
  ChevronRight,
  Crown,
  Sparkles,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  badges?: ('trending' | 'new' | 'premium')[];
  monetization?: {
    community?: {
      title: string;
      members: string;
      price?: string;
    };
    course?: {
      title: string;
      price: string;
      thumbnail: string;
    };
    coaching?: {
      title: string;
      sessions: string;
      price: string;
    };
    products?: Array<{
      title: string;
      price: string;
      thumbnail: string;
    }>;
  };
}

interface FilterCategory {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const filterCategories: FilterCategory[] = [
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
];

// Premium glassmorphic video data
const sampleVideos: VideoData[] = [
  {
    id: '1',
    title: 'Building a $10M SaaS Empire: The Complete Blueprint',
    thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    creator: {
      id: 'saas-king',
      name: 'Alex Hormozi',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      subscribers: '2.1M',
      verified: true
    },
    duration: '28:45',
    views: '487K',
    likes: '42K',
    description: 'Learn the exact playbook I used to build multiple 8-figure companies. This comprehensive guide covers everything from product-market fit to scaling your team.',
    zapsReward: 1250,
    category: 'business',
    badges: ['trending', 'premium']
  },
  {
    id: '2',
    title: 'Advanced React Patterns That Will Make You a Better Developer',
    thumbnail: 'https://i.ytimg.com/vi/sample2/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample2',
    creator: {
      id: 'tech-master',
      name: 'Kent C. Dodds',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kent',
      subscribers: '890K',
      verified: true
    },
    duration: '45:12',
    views: '234K',
    likes: '18K',
    description: 'Master advanced React patterns including compound components, render props, and custom hooks. Perfect for senior developers.',
    zapsReward: 980,
    category: 'tech',
    badges: ['new']
  },
  {
    id: '3',
    title: 'Mastering Figma: UI/UX Design for 2024',
    thumbnail: 'https://i.ytimg.com/vi/sample3/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample3',
    creator: {
      id: 'design-pro',
      name: 'Ran Segall',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ran',
      subscribers: '456K',
      verified: true
    },
    duration: '32:18',
    views: '178K',
    likes: '15K',
    description: 'Complete Figma masterclass covering components, auto-layout, prototyping and advanced design systems.',
    zapsReward: 750,
    category: 'design',
    badges: ['trending']
  },
  {
    id: '4',
    title: 'Intermittent Fasting: The Science-Based Approach',
    thumbnail: 'https://i.ytimg.com/vi/sample4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample4',
    creator: {
      id: 'health-guru',
      name: 'Dr. Andrew Huberman',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrew',
      subscribers: '3.2M',
      verified: true
    },
    duration: '52:30',
    views: '892K',
    likes: '67K',
    description: 'Deep dive into the science of intermittent fasting, optimal timing windows, and metabolic health benefits.',
    zapsReward: 1100,
    category: 'health',
    badges: ['premium']
  },
  {
    id: '5',
    title: 'Crypto Trading Psychology: Master Your Emotions',
    thumbnail: 'https://i.ytimg.com/vi/sample5/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample5',
    creator: {
      id: 'crypto-trader',
      name: 'Coin Bureau',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=crypto',
      subscribers: '2.8M',
      verified: true
    },
    duration: '38:22',
    views: '345K',
    likes: '29K',
    description: 'Learn to control emotions, manage risk, and develop winning trading psychology in volatile crypto markets.',
    zapsReward: 920,
    category: 'money',
    badges: ['new', 'trending']
  },
  {
    id: '6',
    title: 'Building Habits That Stick: The Science of Behavior Change',
    thumbnail: 'https://i.ytimg.com/vi/sample6/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample6',
    creator: {
      id: 'habit-expert',
      name: 'James Clear',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      subscribers: '1.5M',
      verified: true
    },
    duration: '41:15',
    views: '567K',
    likes: '45K',
    description: 'Practical strategies from Atomic Habits author on building sustainable routines and breaking bad habits.',
    zapsReward: 850,
    category: 'self-improvement',
    badges: ['premium']
  }
];

interface PremiumDashboardV10Props {
  className?: string;
}

const PremiumDashboardV10: React.FC<PremiumDashboardV10Props> = ({ className }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatchMode, setIsWatchMode] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Motion values for glassmorphic effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Filter videos based on active category
  const filteredVideos = activeFilter === 'all'
    ? sampleVideos
    : sampleVideos.filter(video => video.category === activeFilter);

  // Get related videos (excluding current video)
  const relatedVideos = selectedVideo
    ? sampleVideos.filter(v => v.id !== selectedVideo.id).slice(0, 5)
    : [];

  // Spring animation configs for glassmorphism
  const glassSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
    mass: 0.5
  };

  // Handle mouse movement for glassmorphic effects
  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  // Glassmorphic Filter Pill Component
  const GlassmorphicFilterPill: React.FC<{ category: FilterCategory; isActive: boolean }> = ({
    category,
    isActive
  }) => (
    <motion.button
      onClick={() => setActiveFilter(category.id)}
      className={cn(
        "relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-700 whitespace-nowrap",
        "select-none focus:outline-none border-0 overflow-hidden",
        isActive
          ? "text-white font-semibold"
          : "text-gray-700 hover:text-gray-900 font-medium"
      )}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(219, 39, 119, 0.9) 50%, rgba(59, 130, 246, 0.9) 100%)'
          : 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: isActive
          ? '1px solid rgba(255, 255, 255, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: isActive
          ? '0 8px 32px rgba(139, 92, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      whileHover={{
        scale: 1.05,
        y: -2,
        transition: glassSpring,
      }}
      whileTap={{
        scale: 0.95,
        transition: { ...glassSpring, stiffness: 600 }
      }}
    >
      {/* Active gradient shimmer animation */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-50"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(219, 39, 119, 0.6) 50%, rgba(59, 130, 246, 0.6) 100%)',
              'linear-gradient(135deg, rgba(219, 39, 119, 0.6) 0%, rgba(59, 130, 246, 0.6) 50%, rgba(139, 92, 246, 0.6) 100%)',
              'linear-gradient(135deg, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 50%, rgba(219, 39, 119, 0.6) 100%)',
              'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(219, 39, 119, 0.6) 50%, rgba(59, 130, 246, 0.6) 100%)',
            ]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Hover ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        whileHover={{
          opacity: [0, 0.3, 0],
          scale: [1, 1.2, 1.4],
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: isActive
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
        }}
      />

      <span className="relative z-10">{category.label}</span>
    </motion.button>
  );

  // Glassmorphic Video Card Component
  const GlassmorphicVideoCard: React.FC<{ video: VideoData; index: number }> = ({ video, index }) => {
    const isHovered = hoveredCard === video.id;

    const getBadgeColor = (badge: string) => {
      switch (badge) {
        case 'trending': return 'rgba(239, 68, 68, 0.9)';
        case 'new': return 'rgba(34, 197, 94, 0.9)';
        case 'premium': return 'rgba(168, 85, 247, 0.9)';
        default: return 'rgba(107, 114, 128, 0.9)';
      }
    };

    const getBadgeIcon = (badge: string) => {
      switch (badge) {
        case 'trending': return <TrendingUp className="w-3 h-3" />;
        case 'new': return <Sparkles className="w-3 h-3" />;
        case 'premium': return <Crown className="w-3 h-3" />;
        default: return null;
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="group cursor-pointer"
        onMouseEnter={() => setHoveredCard(video.id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => {
          setSelectedVideo(video);
          setIsWatchMode(true);
        }}
      >
        <motion.div
          className="rounded-2xl overflow-hidden transition-all duration-500 relative"
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          whileHover={{
            y: -8,
            scale: 1.02,
            transition: glassSpring,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Glassmorphic reflection overlay */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Thumbnail with glassmorphic overlay */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Glassmorphic play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              >
                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Duration badge - glassmorphic */}
            <div
              className="absolute bottom-3 right-3 px-3 py-1 text-white text-xs rounded-lg font-medium"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {video.duration}
            </div>

            {/* Floating neon-glass badges */}
            {video.badges && video.badges.length > 0 && (
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                {video.badges.map((badge) => (
                  <motion.div
                    key={badge}
                    className="px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1"
                    style={{
                      background: getBadgeColor(badge),
                      backdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: `0 4px 16px ${getBadgeColor(badge).replace('0.9', '0.4')}`
                    }}
                    animate={{
                      boxShadow: [
                        `0 4px 16px ${getBadgeColor(badge).replace('0.9', '0.4')}`,
                        `0 6px 20px ${getBadgeColor(badge).replace('0.9', '0.6')}`,
                        `0 4px 16px ${getBadgeColor(badge).replace('0.9', '0.4')}`
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {getBadgeIcon(badge)}
                    {badge.charAt(0).toUpperCase() + badge.slice(1)}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Card content */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-sm leading-5 line-clamp-2">
              {video.title}
            </h3>

            {/* Creator info */}
            <div className="flex items-center gap-3">
              <img
                src={video.creator.avatar}
                alt={video.creator.name}
                className="w-6 h-6 rounded-full"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <span className="text-sm font-medium text-gray-700">
                {video.creator.name}
              </span>
              {video.creator.verified && (
                <div
                  className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                  style={{
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            {/* Meta row with glassmorphic XP badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views}</span>
                </div>
              </div>

              {/* Floating neon-glass XP badge */}
              <motion.div
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}
                animate={{
                  boxShadow: [
                    '0 4px 16px rgba(251, 191, 36, 0.4)',
                    '0 6px 20px rgba(251, 191, 36, 0.6)',
                    '0 4px 16px rgba(251, 191, 36, 0.4)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.05 }}
              >
                <Zap className="w-3 h-3" fill="currentColor" />
                <motion.span
                  key={video.zapsReward}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  +{video.zapsReward}
                </motion.span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Immersive Glassmorphic Watch Mode
  const ImmersiveWatchMode: React.FC = () => {
    if (!selectedVideo) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(40px) saturate(150%)',
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Background gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(219, 39, 119, 0.05) 50%, rgba(59, 130, 246, 0.1) 100%)',
          }}
        />

        <div className="h-full flex flex-col relative z-10">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <motion.button
              onClick={() => {
                setIsWatchMode(false);
                setSelectedVideo(null);
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-all font-medium rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Feed</span>
            </motion.button>
          </div>

          {/* Main content */}
          <div className="flex-1 flex">
            {/* Video player section (70%) */}
            <div className="flex-1 px-6 pb-6">
              <div className="max-w-5xl mx-auto">
                {/* Video player with glassmorphic frame */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="aspect-video rounded-3xl overflow-hidden bg-gray-900 mb-6 relative"
                  style={{
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  />
                </motion.div>

                {/* Video details in glassmorphic sections */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Title */}
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedVideo.title}
                    </h1>

                    <div className="flex items-center justify-between">
                      {/* Creator info */}
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedVideo.creator.avatar}
                          alt={selectedVideo.creator.name}
                          className="w-12 h-12 rounded-full"
                          style={{
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            border: '2px solid rgba(255, 255, 255, 0.5)'
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-semibold">
                              {selectedVideo.creator.name}
                            </span>
                            {selectedVideo.creator.verified && (
                              <div
                                className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                                style={{
                                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
                                }}
                              >
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {selectedVideo.creator.subscribers} subscribers
                          </p>
                        </div>

                        {/* Subscribe button */}
                        <motion.button
                          className="px-6 py-2 text-white rounded-full font-medium"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)'
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.6)'
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <UserPlus className="w-4 h-4 inline mr-2" />
                          Subscribe
                        </motion.button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {[
                          { icon: Heart, label: selectedVideo.likes, color: 'rgba(239, 68, 68, 0.9)' },
                          { icon: Share, label: 'Share', color: 'rgba(34, 197, 94, 0.9)' },
                          { icon: Bookmark, label: 'Save', color: 'rgba(245, 158, 11, 0.9)' },
                        ].map((action, index) => (
                          <motion.button
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-all rounded-full text-sm"
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(20px) saturate(180%)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                            }}
                            whileHover={{
                              scale: 1.05,
                              boxShadow: `0 4px 16px ${action.color.replace('0.9', '0.3')}`
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <action.icon className="w-4 h-4" />
                            <span>{action.label}</span>
                          </motion.button>
                        ))}

                        {/* Special Tip button */}
                        <motion.button
                          className="flex items-center gap-2 px-4 py-2 text-white transition-all rounded-full text-sm font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)'
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.6)'
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4" fill="currentColor" />
                          <span>Tip Creator</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <p className="text-gray-700 leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Related videos sidebar (30%) - glassmorphic */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-80 p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(30px) saturate(180%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <h3 className="text-gray-900 font-semibold mb-4">Up Next</h3>
              <div className="space-y-3">
                {relatedVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded-lg"
                      />
                      <div
                        className="absolute bottom-1 right-1 px-1 py-0.5 text-white text-xs rounded"
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 text-sm font-medium line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        {video.creator.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{video.views}</span>
                        <span>•</span>
                        <span className="text-yellow-600 font-medium">⚡ +{video.zapsReward}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={cn("min-h-screen", className)}
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #f8fafc 75%, #f1f5f9 100%)',
      }}
    >
      {/* Glassmorphic filter pills - seamlessly integrated */}
      <motion.div
        className="sticky top-0 z-40 transition-all duration-500"
        style={{
          background: 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(30px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div
            ref={filterScrollRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{
              scrollSnapType: isMobile ? 'x mandatory' : 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex items-center gap-4 pb-2 min-w-max">
              {filterCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  style={{
                    scrollSnapAlign: isMobile ? 'center' : 'start'
                  }}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                >
                  <GlassmorphicFilterPill
                    category={category}
                    isActive={activeFilter === category.id}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Glassmorphic video grid */}
        <motion.div
          className={cn(
            "grid gap-8",
            isMobile
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
          layout
        >
          {filteredVideos.slice(0, 6).map((video, index) => (
            <GlassmorphicVideoCard key={video.id} video={video} index={index} />
          ))}
        </motion.div>

        {/* Load more section */}
        {filteredVideos.length > 6 && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              className="px-8 py-3 rounded-full font-medium transition-all duration-300 text-white"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)'
              }}
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.6)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Load More Videos
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Immersive Glassmorphic Watch Mode */}
      <AnimatePresence>
        {isWatchMode && <ImmersiveWatchMode />}
      </AnimatePresence>
    </div>
  );
};

export default PremiumDashboardV10;