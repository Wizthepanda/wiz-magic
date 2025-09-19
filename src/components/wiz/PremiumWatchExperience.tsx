import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  X, Play, Download, BookOpen, MessageCircle, Bell, Coins, Zap, Crown,
  ThumbsUp, Sparkles, Lock, ExternalLink, Users, Star, Heart, Share,
  ChevronDown, ArrowUp, ShoppingBag, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VideoData {
  id: number;
  title: string;
  creator: string;
  thumbnail: string;
  videoId: string;
  xpReward: number;
  duration: string;
  views: string;
  description: string;
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Convert to WebP format for better compression
          const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          setImageSrc(webpSrc);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={imgRef} className={className} style={style}>
      {!isLoaded && (
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-lg" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 rounded-lg ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={style}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            // Fallback to original format if WebP fails
            setImageSrc(src);
          }}
        />
      )}
    </div>
  );
};

const VideoSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex gap-3">
      <div className="w-20 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-200 rounded w-1/2" />
        <div className="h-2 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  </div>
);

interface PremiumWatchExperienceProps {
  video: VideoData;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  progress?: number;
  isDarkMode?: boolean;
}

export const PremiumWatchExperience: React.FC<PremiumWatchExperienceProps> = ({
  video,
  isOpen,
  onClose,
  onComplete,
  progress = 0,
  isDarkMode = false
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentXP, setCurrentXP] = useState(0);
  const [showTipModal, setShowTipModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showXpCoin, setShowXpCoin] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Optimized spring physics for smooth, lightweight animations
  const springConfig = { damping: 30, stiffness: 400, mass: 0.8 };
  const xpProgress = useSpring(progress, springConfig);

  // Early return if no video data
  if (!isOpen || !video) return null;

  // Sample data for enhanced experience - Side panel videos
  const nextXpVideos = [
    { id: 1, title: "Advanced AI Techniques", creator: "Dr. Sarah Kim", xp: 150, duration: "12:45", thumbnail: "/api/placeholder/160/90", category: "from_creator", glowing: true },
    { id: 2, title: "Machine Learning Basics", creator: "Alex Chen", xp: 95, duration: "8:30", thumbnail: "/api/placeholder/160/90", category: "from_creator", glowing: false },
    { id: 3, title: "Neural Networks Deep Dive", creator: "Dr. Sarah Kim", xp: 180, duration: "15:20", thumbnail: "/api/placeholder/160/90", category: "from_creator", glowing: true },
    { id: 4, title: "Python for AI Beginners", creator: "Code Master", xp: 120, duration: "22:15", thumbnail: "/api/placeholder/160/90", category: "trending", glowing: false },
    { id: 5, title: "Data Science Fundamentals", creator: "Analytics Pro", xp: 140, duration: "18:30", thumbnail: "/api/placeholder/160/90", category: "trending", glowing: true },
    { id: 6, title: "Deep Learning Applications", creator: "ML Expert", xp: 200, duration: "25:45", thumbnail: "/api/placeholder/160/90", category: "trending", glowing: false },
    { id: 7, title: "AI Ethics & Future", creator: "Dr. Sarah Kim", xp: 160, duration: "14:30", thumbnail: "/api/placeholder/160/90", category: "from_creator", glowing: false },
    { id: 8, title: "Computer Vision Basics", creator: "Vision AI", xp: 175, duration: "20:15", thumbnail: "/api/placeholder/160/90", category: "trending", glowing: true }
  ];

  const otherVideos = [
    { id: 1, title: "Advanced AI Techniques", xp: 150, duration: "12:45", views: "1.2M", thumbnail: "/api/placeholder/320/180" },
    { id: 2, title: "Machine Learning Basics", xp: 95, duration: "8:30", views: "950K", thumbnail: "/api/placeholder/320/180" },
    { id: 3, title: "Neural Networks Explained", xp: 180, duration: "15:20", views: "2.1M", thumbnail: "/api/placeholder/320/180" },
    { id: 4, title: "Deep Learning Fundamentals", xp: 220, duration: "18:45", views: "1.8M", thumbnail: "/api/placeholder/320/180" },
    { id: 5, title: "AI Ethics & Future", xp: 160, duration: "14:30", views: "1.5M", thumbnail: "/api/placeholder/320/180" }
  ];

  const courseModules = [
    { id: 1, title: "Introduction to AI", completed: true, xp: 50, locked: false, duration: "45 min" },
    { id: 2, title: "Machine Learning Basics", completed: true, xp: 95, locked: false, duration: "1h 20min" },
    { id: 3, title: "Neural Networks Deep Dive", completed: false, xp: 120, locked: false, duration: "2h 15min" },
    { id: 4, title: "Advanced Deep Learning", completed: false, xp: 180, locked: true, duration: "3h 10min" },
    { id: 5, title: "AI Ethics & Implementation", completed: false, xp: 250, locked: true, duration: "2h 45min" }
  ];

  const communityPosts = [
    {
      id: 1,
      author: "Alex Chen",
      avatar: "/api/placeholder/40/40",
      content: "This lesson really helped me understand neural networks! The visualization was perfect. 🧠✨",
      time: "2h ago",
      likes: 24,
      replies: 5,
      isPinned: true
    },
    {
      id: 2,
      author: "Sarah Kim",
      avatar: "/api/placeholder/40/40",
      content: "Can someone explain the backpropagation algorithm in simpler terms? The math is getting complex 📊",
      time: "4h ago",
      likes: 12,
      replies: 8,
      isPinned: false
    }
  ];

  const freeDownloads = [
    { name: "AI Fundamentals Cheat Sheet", size: "2.4 MB", type: "PDF", downloads: "12K" },
    { name: "Neural Network Code Examples", size: "1.8 MB", type: "ZIP", downloads: "8.5K" },
    { name: "Machine Learning Quick Reference", size: "0.5 MB", type: "PDF", downloads: "15K" }
  ];


  // Handle video completion with elegant XP coin animation
  const handleVideoComplete = useCallback(() => {
    setVideoCompleted(true);
    setShowXpCoin(true);
    setTimeout(() => {
      setShowXpCoin(false);
    }, 2000); // Elegant 2-second XP coin animation
  }, []);

  useEffect(() => {
    if (progress > 0 && video?.xpReward) {
      const xpEarned = Math.floor((progress / 100) * video.xpReward);
      setCurrentXP(xpEarned);
      xpProgress.set(progress);

      // Trigger elegant XP coin when video is complete
      if (progress >= 100 && !videoCompleted) {
        handleVideoComplete();
      }
    }
  }, [progress, video?.xpReward, xpProgress, videoCompleted, handleVideoComplete]);

  useEffect(() => {
    // Simulate initial loading state
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'videos', label: 'Other Videos' },
    { id: 'course', label: 'Course' },
    { id: 'community', label: 'Community' },
    { id: 'downloads', label: 'Downloads' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
        className="fixed inset-0 z-50 bg-white overflow-y-auto"
      >
        {/* Close Button - Top Right */}
        <motion.button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <X size={16} className="text-gray-600" />
        </motion.button>

        {/* Main Content Container */}
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">

              {/* Left Side - Video Player & Content (8 columns) */}
              <motion.div
                className="lg:col-span-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
              >
                {/* Top Action Bar */}
                <div className="flex justify-end mb-4 lg:mb-6">
                  <div className="flex gap-2 lg:gap-3 flex-wrap">
                    <motion.button
                      onClick={() => setIsSubscribed(!isSubscribed)}
                      className="px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-medium text-white text-xs lg:text-sm transition-all duration-200"
                      style={{
                        background: isSubscribed
                          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                          : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                      }}
                      whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Bell size={14} className="mr-2 inline" />
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </motion.button>

                    <motion.button
                      onClick={() => setShowTipModal(true)}
                      className="px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-medium text-white text-xs lg:text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                      }}
                      whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Coins size={14} className="mr-2 inline" />
                      Tip Creator
                    </motion.button>

                    <motion.button
                      className="px-4 lg:px-6 py-2 lg:py-2.5 rounded-full font-medium text-gray-700 text-xs lg:text-sm border border-gray-300 bg-white hover:border-gray-400 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share size={14} className="mr-2 inline" />
                      Share
                    </motion.button>
                  </div>
                </div>

                {/* Video Player with Sacred Space */}
                <motion.div
                  className="relative mb-4 lg:mb-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </motion.div>

                {/* XP Progress Bar with Elegant Coin Animation */}
                <motion.div
                  className="relative mb-6 lg:mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-4">
                      <span>XP Progress: {currentXP}/{video.xpReward}</span>
                      <span>{Math.round(progress)}% Complete</span>
                    </div>

                    <div className="relative">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>

                      {/* Elegant XP Coin Animation */}
                      <AnimatePresence>
                        {showXpCoin && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                            animate={{
                              opacity: [0, 1, 1, 0],
                              scale: [0.5, 1.1, 1, 0.8],
                              y: [10, -5, -5, -10]
                            }}
                            exit={{ opacity: 0, scale: 0.5, y: -15 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
                              }}
                            >
                              <Coins size={16} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Start</span>
                      <span className={progress >= 25 ? "text-blue-600 font-medium" : ""}>25%</span>
                      <span className={progress >= 50 ? "text-purple-600 font-medium" : ""}>50%</span>
                      <span className={progress >= 75 ? "text-orange-600 font-medium" : ""}>75%</span>
                      <span className={progress >= 100 ? "text-green-600 font-medium" : ""}>Complete</span>
                    </div>
                  </div>
                </motion.div>

                {/* Creator Card */}
                <motion.div
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback
                          className="text-lg font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          }}
                        >
                          {video.creator[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{video.creator}</h3>
                        <p className="text-sm text-gray-600">AI Expert & Educator • Level 7</p>
                        <p className="text-sm text-gray-500">2.1M subscribers</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setIsSubscribed(!isSubscribed)}
                      className="px-6 py-2.5 rounded-full font-medium text-white"
                      style={{
                        background: isSubscribed
                          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                          : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubscribed ? 'Following' : 'Follow Creator'}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="flex gap-2 p-2 bg-gray-50 rounded-xl">
                    {tabs.map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {tab.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Tab Content */}
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-12"
                >
                  {activeTab === 'overview' && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">About this video</h4>
                      <p className="text-gray-700 leading-relaxed">{video.description}</p>
                    </div>
                  )}

                  {activeTab === 'videos' && (
                    <div className="space-y-4">
                      {otherVideos.slice(0, 3).map((otherVideo, index) => (
                        <motion.div
                          key={otherVideo.id}
                          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200"
                          whileHover={{ scale: 1.01, y: -2 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex gap-4">
                            <LazyImage
                              src={otherVideo.thumbnail}
                              alt={otherVideo.title}
                              className="w-32 h-20 rounded-lg bg-gray-200 flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-2">{otherVideo.title}</h5>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{otherVideo.views} views • {otherVideo.duration}</span>
                                <Badge
                                  className="text-white"
                                  style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                  }}
                                >
                                  +{otherVideo.xp} XP
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'course' && (
                    <div className="space-y-4">
                      {courseModules.map((module, index) => (
                        <div
                          key={module.id}
                          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                              module.completed ? 'bg-green-500 text-white' :
                              module.locked ? 'bg-gray-300 text-gray-500' :
                              'bg-blue-500 text-white'
                            }`}>
                              {module.completed ? '✓' : module.locked ? <Lock size={16} /> : index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{module.title}</h5>
                              <p className="text-sm text-gray-600">{module.duration} • +{module.xp} XP</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'community' && (
                    <div className="space-y-4">
                      {communityPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                        >
                          <div className="flex gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-purple-500 text-white font-semibold">
                                {post.author[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900">{post.author}</span>
                                <span className="text-sm text-gray-500">{post.time}</span>
                              </div>
                              <p className="text-gray-700 mb-3">{post.content}</p>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                  <Heart size={16} />
                                  <span>{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                  <MessageCircle size={16} />
                                  <span>{post.replies}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'downloads' && (
                    <div className="space-y-4">
                      {freeDownloads.map((download, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Download size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">{download.name}</h5>
                                <p className="text-sm text-gray-600">{download.size} • {download.downloads} downloads</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {download.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>

              {/* Right Panel - Video Recommendations (4 columns) */}
              <motion.div
                className="lg:col-span-4 order-first lg:order-last"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              >
                <div className="lg:sticky lg:top-8">
                  <div
                    className="bg-white rounded-xl shadow-lg border border-gray-100 lg:max-h-[80vh] lg:overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
                    }}
                  >
                    <div className="p-6">

                      {/* From This Creator Section */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Star size={18} className="text-yellow-500" />
                          From This Creator
                        </h3>
                        <div className="space-y-3">
                          {nextXpVideos.filter(v => v.category === 'from_creator').slice(0, 3).map((video, index) => (
                            <motion.div
                              key={video.id}
                              className="group cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              whileHover={{ scale: 1.02 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                            >
                              <div className="flex gap-3">
                                <div className="relative">
                                  <LazyImage
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-20 h-12 rounded-lg bg-gray-200"
                                  />
                                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                                    {video.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1">{video.duration}</p>
                                  <Badge
                                    className="text-xs text-white mt-2"
                                    style={{
                                      background: video.glowing
                                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                        : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                    }}
                                  >
                                    +{video.xp} XP
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Trending Section */}
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp size={18} className="text-green-500" />
                          Trending in Your Categories
                        </h3>
                        <div className="space-y-3">
                          {nextXpVideos.filter(v => v.category === 'trending').slice(0, 4).map((video, index) => (
                            <motion.div
                              key={video.id}
                              className="group cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                              whileHover={{ scale: 1.02 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                            >
                              <div className="flex gap-3">
                                <div className="relative">
                                  <LazyImage
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-20 h-12 rounded-lg bg-gray-200"
                                  />
                                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-green-600 transition-colors">
                                    {video.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1">{video.creator}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">{video.duration}</span>
                                    <Badge
                                      className="text-xs text-white"
                                      style={{
                                        background: video.glowing
                                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                      }}
                                    >
                                      +{video.xp} XP
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sticky Premium Gradient Card */}
                    <motion.div
                      className="sticky bottom-0 p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-b-xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.6 }}
                    >
                      <motion.div
                        className="cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">Unlock XP Deals</h4>
                            <p className="text-sm text-white/80">Premium courses 50% off</p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                            <Coins className="w-4 h-4 text-yellow-900" />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Tip Modal */}
        <AnimatePresence>
          {showTipModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => setShowTipModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Tip {video.creator}
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['$1', '$5', '$10'].map((amount) => (
                    <motion.button
                      key={amount}
                      className="h-12 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {amount}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  className="w-full py-3 rounded-xl font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Coins size={16} className="mr-2 inline" />
                  Send Tip
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
