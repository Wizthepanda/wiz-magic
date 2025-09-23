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

// Sample premium video data
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

interface PremiumDashboardV8Props {
  className?: string;
}

const PremiumDashboardV8: React.FC<PremiumDashboardV8Props> = ({ className }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isWatchMode, setIsWatchMode] = useState(false);

  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isDark = theme === 'dark';

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

  // Filter Pill Component
  const FilterPill: React.FC<{ category: FilterCategory; isActive: boolean }> = ({
    category,
    isActive
  }) => (
    <motion.button
      onClick={() => setActiveFilter(category.id)}
      className={cn(
        "relative px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap",
        "backdrop-blur-xl border select-none focus:outline-none focus:ring-2 focus:ring-purple-500/20",
        isActive
          ? "text-white shadow-xl border-transparent"
          : isDark
            ? "text-gray-300 hover:text-white border-gray-600/30 hover:border-gray-500/50"
            : "text-gray-600 hover:text-gray-800 border-gray-300/30 hover:border-gray-400/50"
      )}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)'
          : isDark
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px) saturate(150%)',
      }}
      whileHover={{
        scale: 1.02,
        y: -1,
        transition: springConfig
      }}
      whileTap={{
        scale: 0.98,
        transition: { ...springConfig, stiffness: 600 }
      }}
    >
      {/* Active gradient border animation */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-60"
          animate={{
            background: [
              'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
              'linear-gradient(135deg, #764ba2 0%, #667eea 50%, #764ba2 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Hover glow effect */}
      {!isActive && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
          style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            boxShadow: isDark
              ? '0 0 20px rgba(102, 126, 234, 0.2)'
              : '0 0 20px rgba(102, 126, 234, 0.15)'
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      <span className="relative z-10">{category.label}</span>

      {/* Active underline */}
      {isActive && (
        <motion.div
          className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-white/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}
    </motion.button>
  );

  // Video Card Component
  const VideoCard: React.FC<{ video: VideoData; index: number }> = ({ video, index }) => {
    const getBadgeColor = (badge: string) => {
      switch (badge) {
        case 'trending': return 'bg-red-500/90 text-white';
        case 'new': return 'bg-green-500/90 text-white';
        case 'premium': return 'bg-purple-500/90 text-white';
        default: return 'bg-gray-500/90 text-white';
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
          className={cn(
            "rounded-xl overflow-hidden backdrop-blur-sm border transition-all duration-300",
            isDark
              ? "bg-gray-900/50 border-gray-700/30 hover:border-gray-600/50"
              : "bg-white/70 border-gray-200/40 hover:border-gray-300/60"
          )}
          whileHover={{
            y: -4,
            scale: 1.02,
            transition: springConfig
          }}
          style={{
            boxShadow: isDark
              ? '0 10px 40px rgba(0, 0, 0, 0.3)'
              : '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Thumbnail with overlay */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <motion.div
                className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md font-medium">
              {video.duration}
            </div>

            {/* Status badges */}
            {video.badges && video.badges.length > 0 && (
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {video.badges.map((badge) => (
                  <div
                    key={badge}
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
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
          <div className="p-4 space-y-3">
            {/* Title */}
            <h3 className={cn(
              "font-semibold text-sm leading-5 line-clamp-2",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {video.title}
            </h3>

            {/* Creator info */}
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
                <div className="flex items-center gap-1 text-yellow-500">
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

  // Watch Mode Component
  const WatchMode: React.FC = () => {
    if (!selectedVideo) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <motion.button
              onClick={() => {
                setIsWatchMode(false);
                setSelectedVideo(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
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
                    <h1 className="text-2xl font-bold text-white mb-4">
                      {selectedVideo.title}
                    </h1>

                    <div className="flex items-center justify-between">
                      {/* Creator info */}
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedVideo.creator.avatar}
                          alt={selectedVideo.creator.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {selectedVideo.creator.name}
                            </span>
                            {selectedVideo.creator.verified && (
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            {selectedVideo.creator.subscribers} subscribers
                          </p>
                        </div>

                        <motion.button
                          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium"
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
                          { icon: Heart, label: selectedVideo.likes, color: 'hover:text-red-400' },
                          { icon: MessageCircle, label: '2.1K', color: 'hover:text-blue-400' },
                          { icon: Share, label: 'Share', color: 'hover:text-green-400' },
                          { icon: Bookmark, label: 'Save', color: 'hover:text-yellow-400' },
                        ].map((action, index) => (
                          <motion.button
                            key={index}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors",
                              action.color
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <action.icon className="w-4 h-4" />
                            <span className="text-sm">{action.label}</span>
                          </motion.button>
                        ))}

                        <motion.button
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-full text-yellow-400 transition-colors"
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
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-gray-300 leading-relaxed">
                      {selectedVideo.description}
                    </p>
                  </div>

                  {/* Monetization section */}
                  {selectedVideo.monetization && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Creator's Ecosystem</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Community */}
                        {selectedVideo.monetization.community && (
                          <motion.div
                            className="bg-white/10 rounded-xl p-4 border border-white/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start gap-3">
                              <Users className="w-6 h-6 text-blue-400 mt-1" />
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">
                                  {selectedVideo.monetization.community.title}
                                </h4>
                                <p className="text-gray-400 text-sm mb-3">
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
                            className="bg-white/10 rounded-xl p-4 border border-white/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start gap-3">
                              <GraduationCap className="w-6 h-6 text-green-400 mt-1" />
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">
                                  {selectedVideo.monetization.course.title}
                                </h4>
                                <p className="text-gray-400 text-sm mb-3">
                                  Complete course curriculum
                                </p>
                                <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                                  Enroll Now - {selectedVideo.monetization.course.price}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Coaching */}
                        {selectedVideo.monetization.coaching && (
                          <motion.div
                            className="bg-white/10 rounded-xl p-4 border border-white/20"
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-start gap-3">
                              <MessageSquare className="w-6 h-6 text-purple-400 mt-1" />
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">
                                  {selectedVideo.monetization.coaching.title}
                                </h4>
                                <p className="text-gray-400 text-sm mb-3">
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
              className="w-80 bg-black/50 backdrop-blur-xl border-l border-white/10 p-6"
            >
              <h3 className="text-white font-semibold mb-4">Up Next</h3>
              <div className="space-y-3">
                {relatedVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="flex gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
                        {video.title}
                      </h4>
                      <p className="text-gray-400 text-xs mt-1">
                        {video.creator.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{video.views}</span>
                        <span>•</span>
                        <span className="text-yellow-500">⚡ +{video.zapsReward}</span>
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
    <div className={cn("min-h-screen", className)}>
      {/* Sticky filter pills */}
      <motion.div
        className={cn(
          "sticky top-0 z-40 backdrop-blur-xl backdrop-saturate-150 border-b transition-all duration-300",
          isDark
            ? "bg-gray-900/80 border-gray-700/30"
            : "bg-white/80 border-gray-200/30"
        )}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
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
              className={cn(
                "px-8 py-3 rounded-full font-medium transition-all duration-300",
                "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
                "hover:shadow-xl hover:shadow-purple-500/25"
              )}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Load More Videos
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Watch Mode */}
      <AnimatePresence>
        {isWatchMode && <WatchMode />}
      </AnimatePresence>
    </div>
  );
};

export default PremiumDashboardV8;