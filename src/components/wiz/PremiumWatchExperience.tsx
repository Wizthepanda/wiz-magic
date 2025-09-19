import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  X, Play, Download, BookOpen, MessageCircle, Bell, Coins, Zap, Crown,
  ThumbsUp, Sparkles, Lock, ExternalLink, Users, Star, Heart, Share,
  ChevronDown, ArrowUp, ShoppingBag, TrendingUp, User, Bitcoin
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
  const [isMobile, setIsMobile] = useState(false);

  // Optimized spring physics for smooth, lightweight animations
  const springConfig = { damping: 30, stiffness: 400, mass: 0.8 };
  const xpProgress = useSpring(progress, springConfig);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        {/* Close Button - Premium Floating */}
        <motion.button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <X size={18} className="text-gray-700" />
        </motion.button>

        {/* Main Content Container */}
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/20">
          <div className="max-w-8xl mx-auto px-6 lg:px-12 py-8 lg:py-12">

            {/* Desktop Layout */}
            {!isMobile ? (
              <div className="flex gap-16">

                {/* Left Side - Main Content (75% width) */}
                <motion.div
                  className="flex-1 max-w-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                >
                  {/* VIDEO PLAYER - Sacred Space at Top, Centered */}
                  <motion.div
                    className="relative mb-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                  >
                    <div
                      className="relative aspect-video rounded-2xl overflow-hidden bg-black mx-auto"
                      style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                      }}
                    >
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

                  {/* XP PROGRESS BAR - Ultra-thin, No Labels */}
                  <motion.div
                    className="relative mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="relative mx-auto max-w-2xl">
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>

                      {/* Minimal XP Coin Animation */}
                      <AnimatePresence>
                        {showXpCoin && (
                          <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                            initial={{ opacity: 0, scale: 0.5, y: 5 }}
                            animate={{
                              opacity: [0, 1, 1, 0],
                              scale: [0.5, 1.1, 1, 0.8],
                              y: [5, -5, -5, -10]
                            }}
                            exit={{ opacity: 0, scale: 0.5, y: -15 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                              style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)'
                              }}
                            >
                              <Coins size={14} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* CREATOR INTERACTION CONTAINER - New Premium Panel */}
                  <motion.div
                    className="bg-white rounded-2xl p-8 mb-8"
                    style={{
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="grid grid-cols-12 gap-8 items-center">
                      {/* Left - Creator Avatar */}
                      <div className="col-span-2">
                        <Avatar className="w-16 h-16 mx-auto">
                          <AvatarFallback
                            className="text-xl font-bold text-white"
                            style={{
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                            }}
                          >
                            {video.creator[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Center - Creator Info */}
                      <div className="col-span-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{video.creator}</h3>
                        <p className="text-sm text-gray-600 font-semibold mb-1">DesignPro, AI Expert & Educator – Level 7</p>
                        <p className="text-sm text-gray-400">2.1M Subscribers</p>
                      </div>

                      {/* Right - World-Class Premium Action Row */}
                      <div className="col-span-4 flex gap-3 justify-end items-center">
                        {/* Subscribe - Satin Red→Orange Premium */}
                        <motion.button
                          onClick={() => setIsSubscribed(!isSubscribed)}
                          className="w-32 h-11 rounded-2xl font-bold text-white text-sm flex items-center justify-center"
                          style={{
                            background: isSubscribed
                              ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                              : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                            filter: 'saturate(1.1)'
                          }}
                          whileHover={{
                            scale: 1.02,
                            background: isSubscribed
                              ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                              : 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
                            boxShadow: '0 6px 18px rgba(239, 68, 68, 0.35), 0 0 12px rgba(239, 68, 68, 0.15)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          {isSubscribed ? 'Subscribed' : 'Subscribe'}
                        </motion.button>

                        {/* Tip - Amber→Gold Luxury, Same Size as Subscribe */}
                        <motion.button
                          onClick={() => setShowTipModal(true)}
                          className="w-32 h-11 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2"
                          style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                            filter: 'saturate(1.2)'
                          }}
                          whileHover={{
                            scale: 1.02,
                            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                            boxShadow: '0 6px 18px rgba(245, 158, 11, 0.35)',
                            filter: 'saturate(1.3) brightness(1.05)'
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Bitcoin size={14} strokeWidth={1.5} />
                          <span>Tip</span>
                        </motion.button>

                        {/* Share - Outlined Minimal, Slimmer Width */}
                        <motion.button
                          className="w-11 h-11 rounded-2xl border bg-white flex items-center justify-center"
                          style={{
                            borderWidth: '1.5px',
                            borderColor: '#d1d5db'
                          }}
                          whileHover={{
                            scale: 1.03,
                            borderColor: '#9ca3af',
                            boxShadow: '0 4px 12px rgba(156, 163, 175, 0.15)'
                          }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Share size={16} strokeWidth={1.5} className="text-gray-600" />
                          </motion.div>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* NAVIGATION TABS - Clean & Fluid */}
                  <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <div className="flex gap-6 justify-center">
                      {tabs.map((tab) => (
                        <motion.button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 ${
                            activeTab === tab.id
                              ? 'text-white shadow-lg'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                          style={activeTab === tab.id ? {
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                          } : {}}
                          whileHover={{
                            scale: 1.02,
                            boxShadow: activeTab === tab.id ? '0 12px 35px rgba(139, 92, 246, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.06)'
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {tab.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Tab Content - Simplified for clean design */}
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-12"
                  >
                    {activeTab === 'overview' && (
                      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h4 className="text-xl font-bold text-gray-900 mb-6">About this video</h4>
                        <p className="text-gray-700 leading-relaxed text-lg">{video.description}</p>
                      </div>
                    )}
                    {/* Other tab content remains similar but with updated styling */}
                  </motion.div>
                </motion.div>

                {/* RIGHT VIDEO PANEL - Independent Scroll Area */}
                <motion.div
                  className="w-96 flex-shrink-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
                >
                  <div className="sticky top-8">
                    <div
                      className="bg-white rounded-2xl max-h-[90vh] overflow-y-auto"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)'
                      }}
                    >
                      <div className="p-6">
                        {/* From This Creator Section */}
                        <div className="mb-10">
                          <h3 className="text-lg font-bold text-gray-900 mb-6">From This Creator</h3>
                          <div className="space-y-5">
                            {nextXpVideos.filter(v => v.category === 'from_creator').slice(0, 3).map((videoItem, index) => (
                              <motion.div
                                key={videoItem.id}
                                className="group cursor-pointer rounded-xl transition-all duration-200"
                                whileHover={{ y: -2 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                              >
                                <div className="flex gap-4">
                                  <div className="relative">
                                    <LazyImage
                                      src={videoItem.thumbnail}
                                      alt={videoItem.title}
                                      className="w-28 h-16 rounded-xl bg-gray-200"
                                    />
                                    <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                                      {videoItem.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mb-2">{videoItem.duration}</p>
                                    <Badge
                                      className="text-xs text-white px-2 py-1"
                                      style={{
                                        background: videoItem.glowing
                                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                      }}
                                    >
                                      +{videoItem.xp} XP
                                    </Badge>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Trending Section */}
                        <div className="mb-10">
                          <h3 className="text-lg font-bold text-gray-900 mb-6">Trending in Your Categories</h3>
                          <div className="space-y-5">
                            {nextXpVideos.filter(v => v.category === 'trending').slice(0, 4).map((videoItem, index) => (
                              <motion.div
                                key={videoItem.id}
                                className="group cursor-pointer rounded-xl transition-all duration-200"
                                whileHover={{ y: -2 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 + index * 0.1 }}
                              >
                                <div className="flex gap-4">
                                  <div className="relative">
                                    <LazyImage
                                      src={videoItem.thumbnail}
                                      alt={videoItem.title}
                                      className="w-28 h-16 rounded-xl bg-gray-200"
                                    />
                                    <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-5 h-5 text-white" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                                      {videoItem.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mb-2">{videoItem.duration}</p>
                                    <Badge
                                      className="text-xs text-white px-2 py-1"
                                      style={{
                                        background: videoItem.glowing
                                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                                      }}
                                    >
                                      +{videoItem.xp} XP
                                    </Badge>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sticky Premium Promo Card */}
                      <motion.div
                        className="sticky bottom-0 mx-6 mb-6 p-6 rounded-2xl text-white"
                        style={{
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.25)'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                      >
                        <motion.div
                          className="cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white">Unlock XP Deals</h4>
                              <p className="text-sm text-white/80">Premium Courses 50% Off</p>
                            </div>
                            <Badge
                              className="text-xs text-yellow-900 font-bold px-2 py-1"
                              style={{
                                background: '#fbbf24'
                              }}
                            >
                              XP
                            </Badge>
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

              </div>
            ) : (
              /* Mobile Layout */
              <div className="space-y-6">
                {/* Mobile Video Player */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
                >
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
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

                {/* Mobile Action Buttons */}
                <div className="flex gap-2 justify-center">
                  <motion.button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className="flex-1 px-4 py-3 rounded-full font-semibold text-white text-sm"
                    style={{
                      background: isSubscribed
                        ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bell size={14} className="mr-2 inline" />
                    {isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </motion.button>

                  <motion.button
                    onClick={() => setShowTipModal(true)}
                    className="flex-1 px-4 py-3 rounded-full font-semibold text-white text-sm"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Bitcoin size={14} className="mr-2 inline" />
                    Tip Creator
                  </motion.button>

                  <motion.button
                    className="px-6 py-3 rounded-full font-semibold text-gray-700 text-sm border border-gray-300 bg-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share size={14} />
                  </motion.button>
                </div>

                {/* Mobile Right Panel as Horizontal Scroll */}
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 w-max">
                    {nextXpVideos.slice(0, 6).map((videoItem, index) => (
                      <motion.div
                        key={videoItem.id}
                        className="w-48 bg-white rounded-xl p-4 shadow-lg border border-gray-100"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <LazyImage
                          src={videoItem.thumbnail}
                          alt={videoItem.title}
                          className="w-full h-24 rounded-lg bg-gray-200 mb-3"
                        />
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                          {videoItem.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{videoItem.duration}</span>
                          <Badge
                            className="text-xs text-white"
                            style={{
                              background: videoItem.glowing
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                            }}
                          >
                            +{videoItem.xp} XP
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Rest of mobile content */}
              </div>
            )}

          </div>
        </div>

        {/* Enhanced Tip Modal */}
        <AnimatePresence>
          {showTipModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              onClick={() => setShowTipModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Tip {video.creator}
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {['$1', '$5', '$10'].map((amount) => (
                    <motion.button
                      key={amount}
                      className="h-14 rounded-2xl border-2 border-gray-200 font-bold text-gray-700 hover:border-yellow-400 hover:bg-yellow-50 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {amount}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Bitcoin size={18} className="mr-3 inline" />
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
