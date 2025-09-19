import React, { useState, useEffect, useRef } from 'react';
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
  const [activeSection, setActiveSection] = useState('overview');
  const [showRewardCeremony, setShowRewardCeremony] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const creatorRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);
  const courseRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

  // Scroll progress tracking for left column
  const { scrollY } = useScroll({
    container: leftScrollRef
  });

  // Spring physics for smooth animations
  const springConfig = { damping: 25, stiffness: 300 };
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

  const sections = [
    { id: 'overview', label: 'Overview', ref: overviewRef },
    { id: 'videos', label: 'Other Videos', ref: videosRef },
    { id: 'course', label: 'Course', ref: courseRef },
    { id: 'community', label: 'Community', ref: communityRef }
  ];

  // Handle scroll to section in left column
  const scrollToSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section?.ref.current && leftScrollRef.current) {
      const container = leftScrollRef.current;
      const element = section.ref.current;
      const offsetTop = element.offsetTop - 120; // Account for sticky header

      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Handle scroll position tracking for left column
  const handleLeftScroll = () => {
    if (!leftScrollRef.current) return;

    const container = leftScrollRef.current;
    const scrollTop = container.scrollTop;

    // Update active section based on scroll position
    sections.forEach(section => {
      if (section.ref.current) {
        const element = section.ref.current;
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (rect.top <= containerRect.top + 200 && rect.bottom >= containerRect.top + 200) {
          setActiveSection(section.id);
        }
      }
    });
  };

  // Handle video completion and reward ceremony
  const handleVideoComplete = () => {
    setVideoCompleted(true);
    setShowRewardCeremony(true);
    setTimeout(() => {
      setShowRewardCeremony(false);
    }, 3000);
  };

  useEffect(() => {
    if (progress > 0 && video?.xpReward) {
      const xpEarned = Math.floor((progress / 100) * video.xpReward);
      setCurrentXP(xpEarned);
      xpProgress.set(progress);

      // Trigger reward ceremony when video is complete
      if (progress >= 100 && !videoCompleted) {
        handleVideoComplete();
      }
    }
  }, [progress, video?.xpReward, xpProgress, videoCompleted]);

  useEffect(() => {
    const leftContainer = leftScrollRef.current;
    if (leftContainer) {
      leftContainer.addEventListener('scroll', handleLeftScroll);
      return () => leftContainer.removeEventListener('scroll', handleLeftScroll);
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        className="fixed inset-0 z-50"
        style={{
          background: 'linear-gradient(135deg, #fafbff 0%, #f0f4ff 25%, #e8f2ff 50%, #f5f8ff 100%)'
        }}
      >
        {/* Subtle Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Close Button - Always Visible */}
        <motion.button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15)'
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <X size={20} className="text-gray-700" />
        </motion.button>

        {/* Two-Column Layout Container */}
        <div className="flex h-full">
          {/* Left Column - 70% - Primary Immersive Video */}
          <motion.div
            className="w-[70%] flex flex-col"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 25 }}
          >
            {/* Sticky Mini Header for Left Column */}
            <motion.div
              className="sticky top-0 z-40 p-4"
              style={{
                background: 'rgba(250, 251, 255, 0.8)',
                backdropFilter: 'blur(20px) saturate(150%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, type: "spring", damping: 25 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className="text-white font-semibold text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      }}
                    >
                      {video.creator[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-semibold text-gray-900 text-sm">{video.title}</h1>
                    <p className="text-xs text-gray-600">by {video.creator}</p>
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="flex gap-1">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "px-3 py-1 rounded-lg font-medium transition-all duration-300 text-xs relative",
                        activeSection === section.id
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {activeSection === section.id && (
                        <motion.div
                          layoutId="activeSection"
                          className="absolute inset-0 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                          }}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}
                      <span className="relative z-10">{section.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Left Column Scrollable Content */}
            <div
              ref={leftScrollRef}
              className="flex-1 overflow-y-auto px-6 pb-24"
              style={{
                scrollBehavior: 'smooth'
              }}
            >
              <div className="space-y-8">

                {/* 1. Video Hero Zone with Glowing XP Aura */}
                <motion.div
                  ref={videoRef}
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring", damping: 25 }}
                  className="relative"
                >
                  {/* Video Container with XP Glow */}
                  <div
                    className="relative aspect-video rounded-3xl overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px) saturate(150%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: `0 25px 50px -12px rgba(99, 102, 241, ${progress > 50 ? '0.2' : '0.1'}), 0 0 ${progress > 75 ? '40px' : '20px'} rgba(99, 102, 241, ${progress > 75 ? '0.3' : '0.15'})`
                    }}
                  >
                    {/* YouTube Embed */}
                    <iframe
                      className="w-full h-full rounded-3xl"
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />

                    {/* Floating Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <motion.button
                        onClick={() => setIsSubscribed(!isSubscribed)}
                        className="px-3 py-2 rounded-full font-medium text-white text-sm"
                        style={{
                          background: isSubscribed
                            ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.25)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Bell size={12} className="mr-1" />
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </motion.button>

                      <motion.button
                        onClick={() => setShowTipModal(true)}
                        className="px-3 py-2 rounded-full font-medium text-white text-sm"
                        style={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Coins size={12} className="mr-1" />
                        Tip
                      </motion.button>

                      <motion.button
                        className="px-3 py-2 rounded-full font-medium text-white text-sm"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share size={12} className="mr-1" />
                        Share
                      </motion.button>
                    </div>
                  </div>

                  {/* XP Progress Bar with Milestones */}
                  <motion.div
                    className="mt-4 p-6 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px) saturate(150%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-4">
                      <span>XP Progress: {currentXP}/{video.xpReward}</span>
                      <span>{Math.round(progress)}% Complete</span>
                    </div>

                    <div
                      className="h-4 rounded-full overflow-hidden relative"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <motion.div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #f59e0b 100%)',
                          boxShadow: `0 0 ${progress > 75 ? '25px' : '15px'} rgba(59, 130, 246, ${progress > 75 ? '0.5' : '0.3'})`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      >
                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)'
                          }}
                          animate={{
                            x: ['-100%', '200%']
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* XP Milestone Indicators */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Start</span>
                      <span className={progress >= 25 ? "text-blue-600 font-medium" : ""}>25%</span>
                      <span className={progress >= 50 ? "text-purple-600 font-medium" : ""}>50%</span>
                      <span className={progress >= 75 ? "text-orange-600 font-medium" : ""}>75%</span>
                      <span className={progress >= 100 ? "text-green-600 font-medium" : ""}>Complete</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* 2. Creator Snapshot */}
                <motion.div
                  ref={creatorRef}
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px) saturate(150%)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)'
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, type: "spring", damping: 25 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback
                          className="text-xl font-bold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          }}
                        >
                          {video.creator[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{video.creator}</h2>
                        <p className="text-gray-600 mb-2">AI Expert & Educator • Level 7</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span><strong className="text-gray-900">2.1M</strong> Subscribers</span>
                          <span><strong className="text-gray-900">156</strong> Videos</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsSubscribed(!isSubscribed)}
                      className={cn(
                        "text-white border-0 px-6 py-3",
                        isSubscribed && "opacity-75"
                      )}
                      style={{
                        background: isSubscribed
                          ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
                          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        boxShadow: '0 8px 25px rgba(239, 68, 68, 0.25)'
                      }}
                    >
                      <Bell size={16} className="mr-2" />
                      {isSubscribed ? 'Subscribed' : 'Follow Creator'}
                    </Button>
                  </div>
                </motion.div>

                {/* 3. Other sections would continue here... */}
                {/* For brevity, I'll add simplified versions */}

                <div ref={overviewRef} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                  <div className="p-6 rounded-2xl bg-white/80 backdrop-blur-20">
                    <p className="text-gray-700">{video.description}</p>
                  </div>
                </div>

                <div ref={videosRef} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">More from {video.creator}</h2>
                  <div className="grid gap-4">
                    {otherVideos.slice(0, 3).map((otherVideo, index) => (
                      <div key={otherVideo.id} className="p-4 rounded-2xl bg-white/80 backdrop-blur-20">
                        <h3 className="font-bold text-gray-900 mb-2">{otherVideo.title}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{otherVideo.views} views • {otherVideo.duration}</span>
                          <Badge className="bg-orange-500 text-white">+{otherVideo.xp} XP</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div ref={courseRef} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
                  <div className="space-y-4">
                    {courseModules.map((module, index) => (
                      <div key={module.id} className="p-4 rounded-2xl bg-white/80 backdrop-blur-20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                              module.completed ? "bg-green-500 text-white" : module.locked ? "bg-gray-300 text-gray-500" : "bg-blue-500 text-white"
                            )}>
                              {module.completed ? '✓' : module.locked ? <Lock size={14} /> : index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{module.title}</h3>
                              <p className="text-sm text-gray-600">{module.duration} • +{module.xp} XP</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div ref={communityRef} className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Community</h2>
                  <div className="space-y-4">
                    {communityPosts.map((post) => (
                      <div key={post.id} className="p-6 rounded-2xl bg-white/80 backdrop-blur-20">
                        <div className="flex items-start gap-4">
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
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <button className="flex items-center gap-1 hover:text-red-500">
                                <Heart size={16} />
                                <span>{post.likes}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-blue-500">
                                <MessageCircle size={16} />
                                <span>{post.replies}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra spacing */}
                <div className="h-16" />
              </div>
            </div>
          </motion.div>

          {/* Right Column - 30% - Dynamic Side Panel */}
          <motion.div
            className="w-[30%] flex flex-col border-l border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(20px) saturate(150%)'
            }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", damping: 25 }}
          >
            {/* Side Panel Header */}
            <div className="sticky top-0 z-30 p-4 border-b border-white/20">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="font-bold text-gray-900">Keep Earning XP</h2>
                <motion.span
                  className="text-xs text-purple-600 font-medium"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Next opportunities
                </motion.span>
              </motion.div>
            </div>

            {/* Scrollable Video Feed */}
            <div
              ref={rightScrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{
                scrollBehavior: 'smooth'
              }}
            >
              {/* From Creator Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star size={14} className="text-yellow-500" />
                  From {video.creator}
                </h3>
                {nextXpVideos.filter(v => v.category === 'from_creator').slice(0, 3).map((sideVideo, index) => (
                  <motion.div
                    key={sideVideo.id}
                    className="mb-3 p-3 rounded-xl cursor-pointer group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: sideVideo.glowing ? '0 4px 15px rgba(99, 102, 241, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {sideVideo.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>{sideVideo.duration}</span>
                        </div>
                        <motion.div
                          className="flex items-center gap-1"
                          animate={{
                            scale: sideVideo.glowing ? [1, 1.05, 1] : 1,
                          }}
                          transition={{
                            duration: 2,
                            repeat: sideVideo.glowing ? Infinity : 0,
                          }}
                        >
                          <Badge
                            className="text-white border-0 text-xs px-2 py-1"
                            style={{
                              background: sideVideo.glowing
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                              boxShadow: sideVideo.glowing ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
                            }}
                          >
                            +{sideVideo.xp} XP
                          </Badge>
                          {sideVideo.glowing && (
                            <motion.div
                              className="w-2 h-2 rounded-full bg-yellow-400"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trending Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-500" />
                  Trending in Your Categories
                </h3>
                {nextXpVideos.filter(v => v.category === 'trending').slice(0, 5).map((sideVideo, index) => (
                  <motion.div
                    key={sideVideo.id}
                    className="mb-3 p-3 rounded-xl cursor-pointer group"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: sideVideo.glowing ? '0 4px 15px rgba(99, 102, 241, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {sideVideo.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">{sideVideo.creator}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{sideVideo.duration}</span>
                          <motion.div
                            animate={{
                              scale: sideVideo.glowing ? [1, 1.05, 1] : 1,
                            }}
                            transition={{
                              duration: 2,
                              repeat: sideVideo.glowing ? Infinity : 0,
                            }}
                          >
                            <Badge
                              className="text-white border-0 text-xs px-2 py-1"
                              style={{
                                background: sideVideo.glowing
                                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                boxShadow: sideVideo.glowing ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none'
                              }}
                            >
                              +{sideVideo.xp} XP
                            </Badge>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sticky Footer Mini-Shop */}
            <motion.div
              className="sticky bottom-0 p-4 border-t border-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px) saturate(150%)'
              }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="p-3 rounded-xl cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)'
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.25)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">Unlock XP Deals</h4>
                    <p className="text-xs text-gray-600">Premium courses 50% off</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* End-of-Video Reward Ceremony */}
        <AnimatePresence>
          {showRewardCeremony && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="bg-white rounded-3xl p-8 text-center max-w-md mx-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px) saturate(150%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
                }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h2
                  className="text-3xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  🎉 +{video.xpReward} XP Earned!
                </motion.h2>

                <motion.p
                  className="text-gray-700 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Amazing! You've completed the video and unlocked new XP rewards.
                </motion.p>

                <motion.button
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                  className="px-8 py-3 rounded-xl font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  Claim in XP Shop →
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crypto Tip Modal */}
        <AnimatePresence>
          {showTipModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)'
              }}
              onClick={() => setShowTipModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="max-w-md w-full p-8 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px) saturate(150%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Tip {video.creator}
                </h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['$1', '$5', '$10'].map((amount) => (
                    <motion.button
                      key={amount}
                      className="h-14 rounded-xl font-semibold text-gray-700 transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {amount}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  className="w-full py-4 rounded-xl font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
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