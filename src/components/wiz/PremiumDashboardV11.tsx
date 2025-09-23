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
  MoreHorizontal,
  Brain,
  Code,
  DollarSign,
  Palette,
  Briefcase,
  HeartHandshake
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
    bio?: string;
  };
  duration: string;
  views: string;
  likes: string;
  description: string;
  zapsReward: number;
  category: string;
  categoryLabel: string;
}

interface FilterCategory {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

const filterCategories: FilterCategory[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI', icon: <Brain className="w-3 h-3" /> },
  { id: 'tech', label: 'Tech', icon: <Code className="w-3 h-3" /> },
  { id: 'money', label: 'Money', icon: <DollarSign className="w-3 h-3" /> },
  { id: 'design', label: 'Design', icon: <Palette className="w-3 h-3" /> },
  { id: 'business', label: 'Business', icon: <Briefcase className="w-3 h-3" /> },
  { id: 'health', label: 'Health', icon: <HeartHandshake className="w-3 h-3" /> },
  { id: 'startup', label: 'Startup' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'education', label: 'Education' }
];

// Premium sample videos with category-first labeling
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
      verified: true,
      bio: 'Serial entrepreneur and business coach helping founders scale to 8-figures'
    },
    duration: '28:45',
    views: '487K',
    likes: '42K',
    description: 'Learn the exact playbook I used to build multiple 8-figure companies. This comprehensive guide covers everything from product-market fit to scaling your team.',
    zapsReward: 1250,
    category: 'business',
    categoryLabel: 'Business'
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
      verified: true,
      bio: 'Full-stack developer educator focused on React and testing best practices'
    },
    duration: '45:12',
    views: '234K',
    likes: '18K',
    description: 'Master advanced React patterns including compound components, render props, and custom hooks. Perfect for senior developers.',
    zapsReward: 980,
    category: 'tech',
    categoryLabel: 'Tech'
  },
  {
    id: '3',
    title: 'AI-Powered Design Systems: The Future of UI/UX',
    thumbnail: 'https://i.ytimg.com/vi/sample3/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample3',
    creator: {
      id: 'ai-designer',
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      subscribers: '756K',
      verified: true,
      bio: 'AI-driven design strategist and Figma plugin creator'
    },
    duration: '32:18',
    views: '178K',
    likes: '15K',
    description: 'Explore how AI is revolutionizing design workflows and creating smarter, more accessible user interfaces.',
    zapsReward: 1150,
    category: 'ai',
    categoryLabel: 'AI'
  },
  {
    id: '4',
    title: 'Biohacking Your Sleep: Science-Based Optimization',
    thumbnail: 'https://i.ytimg.com/vi/sample4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample4',
    creator: {
      id: 'health-guru',
      name: 'Dr. Andrew Huberman',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=andrew',
      subscribers: '3.2M',
      verified: true,
      bio: 'Neuroscientist and professor at Stanford School of Medicine'
    },
    duration: '52:30',
    views: '892K',
    likes: '67K',
    description: 'Deep dive into the science of sleep optimization, circadian rhythms, and evidence-based biohacking techniques.',
    zapsReward: 1100,
    category: 'health',
    categoryLabel: 'Health'
  },
  {
    id: '5',
    title: 'Startup Valuation Masterclass: From Seed to Series A',
    thumbnail: 'https://i.ytimg.com/vi/sample5/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample5',
    creator: {
      id: 'startup-expert',
      name: 'Jason Calacanis',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jason',
      subscribers: '1.8M',
      verified: true,
      bio: 'Angel investor and founder with 200+ startup investments'
    },
    duration: '38:22',
    views: '345K',
    likes: '29K',
    description: 'Learn how to value your startup, negotiate with investors, and avoid common valuation mistakes.',
    zapsReward: 920,
    category: 'startup',
    categoryLabel: 'Startup'
  },
  {
    id: '6',
    title: 'Building Authentic Relationships in the Digital Age',
    thumbnail: 'https://i.ytimg.com/vi/sample6/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/embed/sample6',
    creator: {
      id: 'relationship-coach',
      name: 'Esther Perel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=esther',
      subscribers: '1.2M',
      verified: true,
      bio: 'Psychotherapist and relationship expert, author of "Mating in Captivity"'
    },
    duration: '41:15',
    views: '567K',
    likes: '45K',
    description: 'Practical strategies for building deeper connections and maintaining meaningful relationships in our hyperconnected world.',
    zapsReward: 850,
    category: 'relationships',
    categoryLabel: 'Relationships'
  }
];

interface PremiumDashboardV11Props {
  className?: string;
}

const PremiumDashboardV11: React.FC<PremiumDashboardV11Props> = ({ className }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatchMode, setIsWatchMode] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Motion values for enhanced interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Filter videos based on active category
  const filteredVideos = activeFilter === 'all'
    ? sampleVideos
    : sampleVideos.filter(video => video.category === activeFilter);

  // Get related videos (excluding current video)
  const relatedVideos = selectedVideo
    ? sampleVideos.filter(v => v.id !== selectedVideo.id).slice(0, 6)
    : [];

  // Enhanced spring animation configs
  const premiumSpring = {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
    mass: 0.5
  };

  // Handle mouse movement for enhanced glassmorphic effects
  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  // Get category color for dynamic theming
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return { bg: 'rgba(147, 51, 234, 0.8)', glow: 'rgba(147, 51, 234, 0.4)' };
      case 'tech': return { bg: 'rgba(59, 130, 246, 0.8)', glow: 'rgba(59, 130, 246, 0.4)' };
      case 'money': return { bg: 'rgba(34, 197, 94, 0.8)', glow: 'rgba(34, 197, 94, 0.4)' };
      case 'design': return { bg: 'rgba(236, 72, 153, 0.8)', glow: 'rgba(236, 72, 153, 0.4)' };
      case 'business': return { bg: 'rgba(245, 158, 11, 0.8)', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'health': return { bg: 'rgba(239, 68, 68, 0.8)', glow: 'rgba(239, 68, 68, 0.4)' };
      case 'startup': return { bg: 'rgba(168, 85, 247, 0.8)', glow: 'rgba(168, 85, 247, 0.4)' };
      case 'relationships': return { bg: 'rgba(219, 39, 119, 0.8)', glow: 'rgba(219, 39, 119, 0.4)' };
      default: return { bg: 'rgba(107, 114, 128, 0.8)', glow: 'rgba(107, 114, 128, 0.4)' };
    }
  };

  // Seamless Filter Pill Component (Natural Backdrop Integration)
  const SeamlessFilterPill: React.FC<{ category: FilterCategory; isActive: boolean }> = ({
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
          : 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(25px) saturate(200%)',
        border: isActive
          ? '1px solid rgba(255, 255, 255, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: isActive
          ? '0 8px 40px rgba(139, 92, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 4px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      whileHover={{
        scale: 1.05,
        y: -2,
        transition: premiumSpring,
      }}
      whileTap={{
        scale: 0.95,
        transition: { ...premiumSpring, stiffness: 600 }
      }}
    >
      {/* Gradient wave shimmer on scroll */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        animate={{
          opacity: [0, 0.3, 0],
          background: [
            'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
            'linear-gradient(90deg, transparent 20%, rgba(255, 255, 255, 0.3) 70%, transparent 100%)',
            'linear-gradient(90deg, transparent 40%, rgba(255, 255, 255, 0.3) 90%, transparent 100%)',
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

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
          opacity: [0, 0.4, 0],
          scale: [1, 1.2, 1.4],
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background: isActive
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)'
        }}
      />

      <div className="relative z-10 flex items-center gap-2">
        {category.icon}
        <span>{category.label}</span>
      </div>
    </motion.button>
  );

  // Seamless Video Card Component (Natural Backdrop Integration)
  const SeamlessVideoCard: React.FC<{ video: VideoData; index: number }> = ({ video, index }) => {
    const isHovered = hoveredCard === video.id;
    const categoryColors = getCategoryColor(video.category);

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
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(25px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
          whileHover={{
            y: -12,
            scale: 1.02,
            transition: premiumSpring,
            background: 'rgba(255, 255, 255, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Soft glass glow outline on hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)'
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Thumbnail with enhanced overlay */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Category pill - top-left corner */}
            <div className="absolute top-3 left-3">
              <motion.div
                className="px-3 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1"
                style={{
                  background: categoryColors.bg,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `0 4px 16px ${categoryColors.glow}`
                }}
                animate={{
                  boxShadow: [
                    `0 4px 16px ${categoryColors.glow}`,
                    `0 6px 20px ${categoryColors.glow}`,
                    `0 4px 16px ${categoryColors.glow}`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {video.categoryLabel}
              </motion.div>
            </div>

            {/* Premium play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(25px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
              >
                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Duration badge */}
            <div
              className="absolute bottom-3 right-3 px-3 py-1 text-white text-xs rounded-lg font-medium"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(15px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {video.duration}
            </div>
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

            {/* Meta row with floating neon XP badge */}
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

  // Premium Glassmorphic Watch Mode with Upgraded Up Next
  const PremiumWatchMode: React.FC = () => {
    if (!selectedVideo) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50"
        style={{
          background: 'rgba(248, 250, 252, 0.9)',
          backdropFilter: 'blur(50px) saturate(150%)',
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Enhanced background gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(219, 39, 119, 0.04) 50%, rgba(59, 130, 246, 0.08) 100%)',
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
                backdropFilter: 'blur(25px) saturate(180%)',
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
                {/* Video player with enhanced glassmorphic frame */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="aspect-video rounded-3xl overflow-hidden bg-gray-900 mb-6 relative"
                  style={{
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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

                {/* Enhanced creator profile and actions */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Creator profile strip */}
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(25px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Creator info */}
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedVideo.creator.avatar}
                          alt={selectedVideo.creator.name}
                          className="w-16 h-16 rounded-full"
                          style={{
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            border: '3px solid rgba(255, 255, 255, 0.5)'
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-900 font-semibold text-lg">
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
                          <p className="text-gray-600 text-sm mb-1">
                            {selectedVideo.creator.subscribers} subscribers
                          </p>
                          {selectedVideo.creator.bio && (
                            <p className="text-gray-700 text-sm max-w-md">
                              {selectedVideo.creator.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Key actions */}
                      <div className="flex items-center gap-3">
                        {/* Subscribe - Premium glowing button */}
                        <motion.button
                          className="px-6 py-3 text-white rounded-full font-medium"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
                            backdropFilter: 'blur(25px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
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

                        {/* Share - Frosted glass icon */}
                        <motion.button
                          className="p-3 text-gray-700 transition-all rounded-full"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(25px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.3)'
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Share className="w-4 h-4" />
                        </motion.button>

                        {/* Save - Frosted glass icon */}
                        <motion.button
                          className="p-3 text-gray-700 transition-all rounded-full"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(25px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                          }}
                          whileHover={{
                            scale: 1.05,
                            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Bookmark className="w-4 h-4" />
                        </motion.button>

                        {/* Tip - Glowing premium button */}
                        <motion.button
                          className="flex items-center gap-2 px-4 py-3 text-white transition-all rounded-full font-bold"
                          style={{
                            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.9) 100%)',
                            backdropFilter: 'blur(25px) saturate(180%)',
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
                          <span>Tip</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(25px) saturate(180%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedVideo.title}
                    </h1>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Upgraded "Up Next" Side Panel (30%) */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-80 p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(35px) saturate(200%)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <h3 className="text-gray-900 font-semibold mb-6 text-lg">Up Next</h3>
              <div className="space-y-4">
                {relatedVideos.map((video, index) => {
                  const categoryColors = getCategoryColor(video.category);
                  return (
                    <motion.div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="flex gap-3 p-4 rounded-xl cursor-pointer transition-all group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(25px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                      whileHover={{
                        scale: 1.02,
                        background: 'rgba(255, 255, 255, 0.7)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-14 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                          style={{
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        />

                        {/* Category pill */}
                        <div className="absolute top-1 left-1">
                          <div
                            className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                            style={{
                              background: categoryColors.bg,
                              backdropFilter: 'blur(15px)',
                              fontSize: '10px'
                            }}
                          >
                            {video.categoryLabel}
                          </div>
                        </div>

                        {/* Duration */}
                        <div
                          className="absolute bottom-1 right-1 px-1 py-0.5 text-white text-xs rounded"
                          style={{
                            background: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            fontSize: '10px'
                          }}
                        >
                          {video.duration}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 text-sm font-medium line-clamp-2 group-hover:text-indigo-600 transition-colors mb-1">
                          {video.title}
                        </h4>
                        <p className="text-gray-600 text-xs mb-1">
                          {video.creator.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{video.views}</span>
                          {/* Small glowing XP badge */}
                          <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.8) 0%, rgba(245, 158, 11, 0.8) 100%)',
                              color: 'white',
                              fontSize: '10px'
                            }}
                          >
                            <Zap className="w-2 h-2" fill="currentColor" />
                            <span>+{video.zapsReward}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 20%, #ddd6fe 40%, #e2e8f0 60%, #f1f5f9 80%, #f8fafc 100%)',
      }}
    >
      {/* Seamless filter bubbles - directly on natural backdrop */}
      <motion.div
        className="sticky top-0 z-40 transition-all duration-500"
        style={{
          background: 'transparent', // No background overlay
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
                  <SeamlessFilterPill
                    category={category}
                    isActive={activeFilter === category.id}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content - seamless video grid directly on backdrop */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
            <SeamlessVideoCard key={video.id} video={video} index={index} />
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
                backdropFilter: 'blur(25px) saturate(180%)',
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

      {/* Premium Glassmorphic Watch Mode */}
      <AnimatePresence>
        {isWatchMode && <PremiumWatchMode />}
      </AnimatePresence>
    </div>
  );
};

export default PremiumDashboardV11;