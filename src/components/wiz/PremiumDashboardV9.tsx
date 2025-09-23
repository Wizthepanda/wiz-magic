import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  TrendingUp
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

// Premium sample video data with white theme focus
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
    badges: ['trending', 'premium'],
    monetization: {
      community: {
        title: 'SaaS Builders Community',
        members: '12K',
        price: '⚡ 500/month'
      },
      course: {
        title: 'SaaS Mastery Bootcamp',
        price: '⚡ 2,500',
        thumbnail: 'https://i.ytimg.com/vi/example/maxresdefault.jpg'
      },
      coaching: {
        title: '1-on-1 Strategy Session',
        sessions: '4 weeks',
        price: '⚡ 5,000'
      }
    }
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
    badges: ['new'],
    monetization: {
      course: {
        title: 'Epic React Masterclass',
        price: '⚡ 1,200',
        thumbnail: 'https://i.ytimg.com/vi/example/maxresdefault.jpg'
      },
      products: [
        {
          title: 'React Patterns Cheatsheet',
          price: '⚡ 50',
          thumbnail: 'https://example.com/cheatsheet.jpg'
        }
      ]
    }
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
    badges: ['trending'],
    monetization: {
      community: {
        title: 'Design Academy',
        members: '8K',
        price: '⚡ 300/month'
      }
    }
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
    badges: ['premium'],
    monetization: {
      coaching: {
        title: 'Personalized Health Protocol',
        sessions: '8 weeks',
        price: '⚡ 3,000'
      }
    }
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

interface PremiumDashboardV9Props {
  className?: string;
}

const PremiumDashboardV9: React.FC<PremiumDashboardV9Props> = ({ className }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatchMode, setIsWatchMode] = useState(false);

  const isMobile = useIsMobile();
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Filter videos based on active category
  const filteredVideos = activeFilter === 'all'
    ? sampleVideos
    : sampleVideos.filter(video => video.category === activeFilter);

  // Get related videos (excluding current video)
  const relatedVideos = selectedVideo
    ? sampleVideos.filter(v => v.id !== selectedVideo.id).slice(0, 5)
    : [];

  // Spring animation configs
  const springConfig = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.8
  };

  // Seamless Filter Pill Component (Embedded into canvas)
  const FilterPill: React.FC<{ category: FilterCategory; isActive: boolean }> = ({
    category,
    isActive
  }) => (
    <motion.button
      onClick={() => setActiveFilter(category.id)}
      className={cn(
        "relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-500 whitespace-nowrap",
        "select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
        "border-0 shadow-none", // Remove floating appearance
        isActive
          ? "text-white font-semibold"
          : "text-gray-600 hover:text-gray-800 font-medium"
      )}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
        boxShadow: isActive
          ? '0 8px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : 'inset 0 2px 4px rgba(0, 0, 0, 0.06), inset 0 -2px 4px rgba(255, 255, 255, 0.8)',
      }}
      whileHover={{
        scale: isActive ? 1.05 : 1.03,
        y: -1,
        transition: springConfig,
        boxShadow: isActive
          ? '0 12px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.06)'
      }}
      whileTap={{
        scale: 0.95,
        transition: { ...springConfig, stiffness: 600 }
      }}
    >
      {/* Active gradient glow overlay */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-80"
          animate={{
            background: [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              'linear-gradient(135deg, #764ba2 0%, #9333ea 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Hover glow for inactive pills */}
      {!isActive && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-0"
          whileHover={{ opacity: 1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            boxShadow: '0 0 20px rgba(102, 126, 234, 0.15)'
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      <span className="relative z-10">{category.label}</span>
    </motion.button>
  );

  // Premium White Video Card Component
  const VideoCard: React.FC<{ video: VideoData; index: number }> = ({ video, index }) => {
    const getBadgeColor = (badge: string) => {
      switch (badge) {
        case 'trending': return 'bg-red-500 text-white';
        case 'new': return 'bg-emerald-500 text-white';
        case 'premium': return 'bg-purple-600 text-white';
        default: return 'bg-gray-500 text-white';
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: index * 0.1,
          ease: "easeOut"
        }}
        className="group cursor-pointer"
        onClick={() => {
          setSelectedVideo(video);
          setIsWatchMode(true);
        }}
      >
        <motion.div
          className="bg-white rounded-xl overflow-hidden transition-all duration-300 border border-gray-100"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          whileHover={{
            y: -6,
            scale: 1.02,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: springConfig
          }}
        >
          {/* Thumbnail with overlay */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }}
              >
                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/75 text-white text-xs rounded-lg font-medium backdrop-blur-sm">
              {video.duration}
            </div>

            {/* Status badges */}
            {video.badges && video.badges.length > 0 && (
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {video.badges.map((badge) => (
                  <div
                    key={badge}
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm",
                      getBadgeColor(badge)
                    )}
                  >
                    {getBadgeIcon(badge)}
                    {badge.charAt(0).toUpperCase() + badge.slice(1)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card content */}
          <div className="p-5 space-y-3">
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
              />
              <span className="text-sm font-medium text-gray-700">
                {video.creator.name}
              </span>
              {video.creator.verified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Zap className="w-3 h-3" fill="currentColor" />
                  <span className="font-bold">+{video.zapsReward}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Premium White Watch Mode Component
  const WatchMode: React.FC = () => {
    if (!selectedVideo) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50"
        style={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%)'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <motion.button
              onClick={() => {
                setIsWatchMode(false);
                setSelectedVideo(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white/90 rounded-full text-gray-700 transition-colors backdrop-blur-sm border border-gray-200/50"
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Feed</span>
            </motion.button>
          </div>

          {/* Main content */}
          <div className="flex-1 flex">
            {/* Video player section (70%) */}
            <div className="flex-1 px-6 pb-6">
              <div className="max-w-5xl mx-auto">
                {/* Video player */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-6"
                  style={{
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)'
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

                {/* Video details */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Title and engagement */}
                  <div>
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
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-semibold">
                              {selectedVideo.creator.name}
                            </span>
                            {selectedVideo.creator.verified && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {selectedVideo.creator.subscribers} subscribers
                          </p>
                        </div>

                        <motion.button
                          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium"
                          style={{
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <UserPlus className="w-4 h-4 inline mr-2" />
                          Subscribe
                        </motion.button>
                      </div>

                      {/* Engagement buttons */}
                      <div className="flex items-center gap-2">
                        {[
                          { icon: Heart, label: selectedVideo.likes, color: 'hover:text-red-500', bg: 'hover:bg-red-50' },
                          { icon: MessageCircle, label: '2.1K', color: 'hover:text-blue-500', bg: 'hover:bg-blue-50' },
                          { icon: Share, label: 'Share', color: 'hover:text-green-500', bg: 'hover:bg-green-50' },
                          { icon: Bookmark, label: 'Save', color: 'hover:text-yellow-500', bg: 'hover:bg-yellow-50' },
                        ].map((action, index) => (
                          <motion.button
                            key={index}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full text-gray-700 transition-all backdrop-blur-sm border border-gray-200/50",
                              action.color,
                              action.bg
                            )}
                            style={{
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)'
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <action.icon className="w-4 h-4" />
                            <span className="text-sm">{action.label}</span>
                          </motion.button>
                        ))}

                        <motion.button
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-full text-yellow-700 transition-all border border-yellow-200/50"
                          style={{
                            boxShadow: '0 2px 10px rgba(251, 191, 36, 0.1)'
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Zap className="w-4 h-4" fill="currentColor" />
                          <span className="text-sm font-bold">Tip Creator</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50 backdrop-blur-sm">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  </div>

                  {/* Monetization section */}
                  {selectedVideo.monetization && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900">Creator's Ecosystem</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Community */}
                        {selectedVideo.monetization.community && (
                          <motion.div
                            className="bg-white rounded-xl p-5 border border-blue-100/50"
                            style={{
                              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.08)'
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold mb-1">
                                  {selectedVideo.monetization.community.title}
                                </h4>
                                <p className="text-gray-600 text-sm mb-3">
                                  {selectedVideo.monetization.community.members} members
                                </p>
                                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                  Join Community
                                  {selectedVideo.monetization.community.price && (
                                    <span className="ml-2 text-sm opacity-90">
                                      {selectedVideo.monetization.community.price}
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Course */}
                        {selectedVideo.monetization.course && (
                          <motion.div
                            className="bg-white rounded-xl p-5 border border-emerald-100/50"
                            style={{
                              background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)',
                              boxShadow: '0 8px 25px rgba(34, 197, 94, 0.08)'
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-emerald-50 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold mb-1">
                                  {selectedVideo.monetization.course.title}
                                </h4>
                                <p className="text-gray-600 text-sm mb-3">
                                  Complete course curriculum
                                </p>
                                <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                                  Enroll Now - {selectedVideo.monetization.course.price}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Coaching */}
                        {selectedVideo.monetization.coaching && (
                          <motion.div
                            className="bg-white rounded-xl p-5 border border-purple-100/50"
                            style={{
                              background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
                              boxShadow: '0 8px 25px rgba(147, 51, 234, 0.08)'
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-50 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold mb-1">
                                  {selectedVideo.monetization.coaching.title}
                                </h4>
                                <p className="text-gray-600 text-sm mb-3">
                                  {selectedVideo.monetization.coaching.sessions}
                                </p>
                                <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                                  Book Session - {selectedVideo.monetization.coaching.price}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Related videos sidebar (30%) */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-80 p-6"
              style={{
                background: 'linear-gradient(145deg, #fafbfc 0%, #f1f3f4 100%)',
                borderLeft: '1px solid rgba(0, 0, 0, 0.06)'
              }}
            >
              <h3 className="text-gray-900 font-semibold mb-4">Up Next</h3>
              <div className="space-y-3">
                {relatedVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="flex gap-3 p-3 rounded-lg hover:bg-white/60 cursor-pointer transition-all group border border-transparent hover:border-gray-200/50"
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/75 text-white text-xs rounded backdrop-blur-sm">
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
                        <span className="text-yellow-600">⚡ +{video.zapsReward}</span>
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
    <div className={cn("min-h-screen", className)}
      style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%)'
      }}
    >
      {/* Seamless embedded filter pills */}
      <motion.div
        className="sticky top-0 z-40 backdrop-blur-xl backdrop-saturate-150 border-b border-gray-200/50"
        style={{
          background: 'linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(241, 243, 244, 0.9) 100%)'
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
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
            <div className="flex items-center gap-3 pb-2 min-w-max">
              {filterCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  style={{
                    scrollSnapAlign: isMobile ? 'center' : 'start'
                  }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <FilterPill
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
        {/* Video grid - 3x2 layout (6 videos visible) */}
        <motion.div
          className={cn(
            "grid gap-6",
            isMobile
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
          layout
        >
          {filteredVideos.slice(0, 6).map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </motion.div>

        {/* Load more section */}
        {filteredVideos.length > 6 && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              className="px-8 py-3 rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
              style={{
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Load More Videos
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Premium White Watch Mode */}
      <AnimatePresence>
        {isWatchMode && <WatchMode />}
      </AnimatePresence>
    </div>
  );
};

export default PremiumDashboardV9;