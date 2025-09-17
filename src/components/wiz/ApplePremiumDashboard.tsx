import { useState, useEffect } from 'react';
import { Search, Flame, Trophy, Target, Gift, Zap, Crown, Users, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Minimal Futurism Base Classes
const minimalCard = "backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-sm";
const softHover = "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out";
const cleanInput = "backdrop-blur-sm bg-white/3 border border-white/8 rounded-full";
const elegantGradient = "bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-100/70";
const subtleAccent = "bg-gradient-to-r from-blue-600/80 via-violet-600/80 to-amber-500/80";

interface ApplePremiumDashboardProps {
  className?: string;
}

export const ApplePremiumDashboard = ({ className }: ApplePremiumDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userLevel, setUserLevel] = useState(7);
  const [userXP, setUserXP] = useState(2450);
  const [nextLevelXP] = useState(3000);
  const [dailyStreak, setDailyStreak] = useState(12);
  const [showLeaderboardDrawer, setShowLeaderboardDrawer] = useState(false);
  const [showQuestsDrawer, setShowQuestsDrawer] = useState(false);
  const [showShopDrawer, setShowShopDrawer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [xpMilestones, setXpMilestones] = useState({ 25: false, 50: false, 75: false, 100: false });
  const [pendingXP, setPendingXP] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showRewardCeremony, setShowRewardCeremony] = useState(false);
  const [earnedVideoXP, setEarnedVideoXP] = useState(0);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);

  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { addXp } = useXp();

  const userName = user?.displayName || 'Champion';
  const progressPercent = (userXP / nextLevelXP) * 100;

  // Sample video data
  const sampleVideos = [
    {
      id: 1,
      title: "AI Revolution: The Future is Here",
      creator: "TechGuru",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoId: "dQw4w9WgXcQ",
      xpReward: 85,
      duration: "8:45",
      views: "2.1M",
      description: "Explore the cutting-edge developments in artificial intelligence and machine learning."
    },
    {
      id: 2,
      title: "Crypto Trading Mastery",
      creator: "CryptoExpert",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoId: "dQw4w9WgXcQ",
      xpReward: 120,
      duration: "12:30",
      views: "1.5M",
      description: "Master the art of cryptocurrency trading with proven strategies."
    },
    {
      id: 3,
      title: "Design Systems Deep Dive",
      creator: "DesignPro",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoId: "dQw4w9WgXcQ",
      xpReward: 95,
      duration: "15:20",
      views: "890K",
      description: "Learn how to build scalable and maintainable design systems."
    },
    {
      id: 4,
      title: "Web Development Trends 2025",
      creator: "CodeMaster",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoId: "dQw4w9WgXcQ",
      xpReward: 110,
      duration: "18:10",
      views: "1.8M",
      description: "Stay ahead with the latest web development trends and technologies."
    },
    {
      id: 5,
      title: "Productivity Hacks for Developers",
      creator: "DevLifestyle",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoId: "dQw4w9WgXcQ",
      xpReward: 75,
      duration: "11:45",
      views: "650K",
      description: "Boost your productivity with these essential developer tips and tricks."
    },
    {
      id: 6,
      title: "Machine Learning Fundamentals",
      creator: "MLGuru",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      videoId: "dQw4w9WgXcQ",
      xpReward: 130,
      duration: "22:15",
      views: "2.3M",
      description: "Master the fundamentals of machine learning and data science."
    }
  ];

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);

    // Simulate video progress and XP earning for demo
    setTimeout(() => {
      setVideoProgress(25);
      handleXPMilestone(25);
    }, 2000);

    setTimeout(() => {
      setVideoProgress(50);
      handleXPMilestone(50);
    }, 4000);

    setTimeout(() => {
      setVideoProgress(75);
      handleXPMilestone(75);
    }, 6000);

    setTimeout(() => {
      setVideoProgress(100);
      handleXPMilestone(100);
      triggerRewardCeremony();
    }, 8000);
  };

  const handleVideoComplete = (video: any) => {
    console.log('Video completed:', video.title);
    // Add XP logic here
  };

  const handleContinueWatching = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
    setXpMilestones({ 25: false, 50: false, 75: false, 100: false });
    setPendingXP(0);
    setVideoProgress(0);
    setShowRewardCeremony(false);
    setEarnedVideoXP(0);
  };

  // Initialize filtered videos
  useEffect(() => {
    setFilteredVideos(sampleVideos);
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Filter by active category when no search query
      if (activeFilter === 'All') {
        setFilteredVideos(sampleVideos);
      } else {
        // Filter by category (you can enhance this logic)
        setFilteredVideos(sampleVideos);
      }
    } else {
      // Filter videos based on search query
      const filtered = sampleVideos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, activeFilter]);

  // Minimal filter categories
  const filterCategories = [
    { id: 'All', label: 'All', gradient: 'from-slate-500 to-slate-600' },
    { id: 'Trending', label: 'Trending', gradient: 'from-orange-500 to-red-600' },
    { id: 'Tech', label: 'Tech', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'Finance', label: 'Finance', gradient: 'from-emerald-500 to-green-600' },
    { id: 'Design', label: 'Design', gradient: 'from-violet-500 to-purple-600' }
  ];

  // Enhanced XP handling
  const handleXPMilestone = (milestone: number) => {
    if (!xpMilestones[milestone as keyof typeof xpMilestones]) {
      const milestoneXP = Math.floor((selectedVideo?.xpReward || 0) * (milestone / 100));
      setPendingXP(prev => prev + milestoneXP);
      setXpMilestones(prev => ({ ...prev, [milestone]: true }));

      // Trigger sparkle animation toward nav bar
      // This would be handled by the animation system
    }
  };

  const triggerRewardCeremony = () => {
    setEarnedVideoXP(selectedVideo?.xpReward || 0);
    setShowRewardCeremony(true);
    addXp(selectedVideo?.xpReward || 0);

    setTimeout(() => {
      setShowRewardCeremony(false);
    }, 3000);
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 ease-out flex",
      isDarkMode
        ? "bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95"
        : "bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-50/95",
      "backdrop-blur-xl",
      className
    )}
      style={{
        backgroundImage: isDarkMode
          ? `radial-gradient(circle at 20% 30%, rgba(100, 116, 139, 0.03) 0%, transparent 50%),
             radial-gradient(circle at 80% 70%, rgba(148, 163, 184, 0.02) 0%, transparent 50%)`
          : `radial-gradient(circle at 20% 30%, rgba(148, 163, 184, 0.04) 0%, transparent 50%),
             radial-gradient(circle at 80% 70%, rgba(203, 213, 225, 0.03) 0%, transparent 50%)`
      }}
    >


      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* Minimal Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-sm"
          style={{
            background: isDarkMode
              ? "linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.3) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.3) 100%)"
          }}
        >

          {/* Minimal Pill Search */}
          <div className="flex-1 max-w-lg mx-6">
            <motion.div
              whileHover={{
                scale: 1.01,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              <div
                className={cn(
                  "relative rounded-full transition-all duration-300 overflow-hidden",
                  cleanInput,
                  searchFocused && "ring-1 ring-slate-300/40"
                )}
                style={{
                  background: searchFocused
                    ? `linear-gradient(135deg,
                        rgba(255, 255, 255, 0.08) 0%,
                        rgba(255, 255, 255, 0.04) 100%),
                       rgba(255, 255, 255, 0.03)`
                    : `linear-gradient(135deg,
                        rgba(255, 255, 255, 0.04) 0%,
                        rgba(255, 255, 255, 0.02) 100%),
                       rgba(255, 255, 255, 0.02)`,
                  backdropFilter: 'blur(16px)',
                  border: searchFocused
                    ? '1px solid rgba(100, 116, 139, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: searchFocused
                    ? `0 4px 20px rgba(100, 116, 139, 0.1),
                       inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    : `0 2px 10px rgba(0, 0, 0, 0.04),
                       inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                }}
              >
                <div className="flex items-center px-5 py-3">
                  <Search
                    size={18}
                    className={cn(
                      "flex-shrink-0 mr-3 transition-colors duration-300",
                      searchFocused
                        ? "text-slate-600"
                        : isDarkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                    )}
                    style={{ opacity: 0.7 }}
                  />

                  <input
                    type="text"
                    placeholder="Search videos, creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={cn(
                      "flex-1 bg-transparent outline-none transition-all duration-300",
                      isDarkMode
                        ? "text-white placeholder-slate-400"
                        : "text-slate-800 placeholder-slate-500",
                      "font-normal text-sm",
                      "placeholder:font-normal"
                    )}
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                    }}
                  />

                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery('')}
                        className={cn(
                          "ml-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                          "hover:bg-slate-200/20 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <X size={12} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Profile Avatar with Circular XP Progress + Premium Streak Badge */}
          <div className="flex items-center gap-4 flex-shrink-0">

            {/* Premium Fire Streak Badge */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative cursor-pointer transition-all duration-300",
                minimalCard,
                softHover
              )}
            >
              <div className="flex items-center gap-3 px-4 py-2">
                {/* Glassmorphic Flame Container */}
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 3, -3, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    <Flame
                      size={18}
                      className="text-transparent bg-gradient-to-t from-orange-500 to-pink-500 bg-clip-text"
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(251, 146, 60, 0.5))"
                      }}
                    />
                  </motion.div>

                  {/* Flicker animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-orange-400 to-pink-400 rounded-full opacity-20 blur-sm"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                {/* Number Badge */}
                <Badge
                  className={cn(
                    "bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold border-none",
                    "shadow-lg shadow-orange-500/30"
                  )}
                >
                  {dailyStreak}
                </Badge>
              </div>

              {/* Hover ripple */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-pink-400/10 rounded-2xl opacity-0"
                whileHover={{
                  opacity: 1,
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>

            {/* Profile Avatar with Circular XP Progress */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative cursor-pointer group"
            >
              {/* Circular XP Progress Ring */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                {/* Background Ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                  strokeWidth="3"
                  fill="none"
                  className="transition-colors duration-300"
                />
                {/* Dynamic XP Progress Ring */}
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#dynamicXpGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 1.76} 176`}
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${progressPercent * 1.76} 176` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="dynamicXpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={userLevel < 5 ? "#3B82F6" : userLevel < 10 ? "#8B5CF6" : "#F59E0B"} />
                    <stop offset="50%" stopColor={userLevel < 5 ? "#8B5CF6" : userLevel < 10 ? "#EC4899" : "#F97316"} />
                    <stop offset="100%" stopColor={userLevel < 5 ? "#EC4899" : userLevel < 10 ? "#F59E0B" : "#EF4444"} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Avatar */}
              <Avatar className="absolute inset-2 w-12 h-12 ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={user?.photoURL || `https://ui-avatars.com/api/?name=${userName}&background=8B5CF6&color=ffffff&size=128`} />
                <AvatarFallback className={cn(
                  "bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold",
                  "transition-all duration-300"
                )}>
                  {userName[0]}
                </AvatarFallback>
              </Avatar>

              {/* Level Badge */}
              <motion.div
                className={cn(
                  "absolute -bottom-1 -right-1 rounded-full px-2 py-1 text-xs font-bold transition-all duration-300",
                  isDarkMode
                    ? "bg-slate-800 text-white border border-slate-600"
                    : "bg-white text-gray-900 border border-gray-200",
                  "shadow-lg"
                )}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Lv.{userLevel}
              </motion.div>

              {/* XP Tooltip on Hover */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                whileHover={{ opacity: 1, y: -5, scale: 1 }}
                className={cn(
                  "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shadow-xl border transition-all duration-200",
                  isDarkMode
                    ? "bg-slate-800/95 text-white border-slate-700/50"
                    : "bg-white/95 text-gray-900 border-gray-200/50",
                  "backdrop-blur-lg pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100"
                )}
              >
                {userXP}/{nextLevelXP} XP
                <div className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45",
                  isDarkMode ? "bg-slate-800" : "bg-white"
                )} />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>


        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {/* Premium Discovery Hub */}
            <div className="mb-8">
            {/* Clean Pill Filter Toggles */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filterCategories.map((filter, index) => (
                  <motion.button
                    key={filter.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={softHover}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
                      minimalCard,
                      activeFilter === filter.id
                        ? "text-white shadow-md ring-1 ring-white/10"
                        : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                    style={{
                      background: activeFilter === filter.id
                        ? `linear-gradient(135deg, ${filter.gradient.includes('slate-500') ? 'rgba(100, 116, 139, 0.9)' : ''}${filter.gradient.includes('orange-500') ? 'rgba(249, 115, 22, 0.9)' : ''}${filter.gradient.includes('blue-500') ? 'rgba(59, 130, 246, 0.9)' : ''}${filter.gradient.includes('emerald-500') ? 'rgba(16, 185, 129, 0.9)' : ''}${filter.gradient.includes('violet-500') ? 'rgba(139, 92, 246, 0.9)' : ''} 0%, ${filter.gradient.includes('slate-600') ? 'rgba(71, 85, 105, 0.95)' : ''}${filter.gradient.includes('red-600') ? 'rgba(220, 38, 38, 0.95)' : ''}${filter.gradient.includes('indigo-600') ? 'rgba(79, 70, 229, 0.95)' : ''}${filter.gradient.includes('green-600') ? 'rgba(22, 163, 74, 0.95)' : ''}${filter.gradient.includes('purple-600') ? 'rgba(147, 51, 234, 0.95)' : ''} 100%)`
                        : `linear-gradient(135deg,
                            rgba(255, 255, 255, 0.04) 0%,
                            rgba(255, 255, 255, 0.02) 100%)`,
                      backdropFilter: 'blur(16px)',
                      border: activeFilter === filter.id
                        ? '1px solid rgba(255, 255, 255, 0.15)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: activeFilter === filter.id
                        ? `0 4px 20px ${filter.gradient.includes('slate') ? 'rgba(100, 116, 139, 0.2)' : ''}${filter.gradient.includes('orange') ? 'rgba(249, 115, 22, 0.2)' : ''}${filter.gradient.includes('blue') ? 'rgba(59, 130, 246, 0.2)' : ''}${filter.gradient.includes('emerald') ? 'rgba(16, 185, 129, 0.2)' : ''}${filter.gradient.includes('violet') ? 'rgba(139, 92, 246, 0.2)' : ''},
                           inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                        : `0 2px 8px rgba(0, 0, 0, 0.04),
                           inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                    }}
                  >
                    {/* Subtle gradient underline for active state */}
                    {activeFilter === filter.id && (
                      <motion.div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full"
                        style={{
                          width: '60%',
                          background: `linear-gradient(90deg, ${filter.gradient.replace('from-', '').replace('to-', '').split(' ').join(', ')})`
                        }}
                        layoutId="activeFilter"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <span className="relative z-10 font-medium"
                      style={{
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                      }}>
                      {filter.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

              {/* Premium Hero Video Grid */}
              <div className={cn(
                "grid gap-8",
                isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              )}>
                {/* Clean Material You Video Cards */}
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.4 + index * 0.08,
                      type: "spring",
                      damping: 25,
                      stiffness: 120
                    }}
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    onClick={() => handleWatchVideo(video)}
                    className="group cursor-pointer"
                  >
                    {/* Clean Card Container */}
                    <motion.div
                      className={cn(
                        "relative rounded-xl overflow-hidden transition-all duration-300",
                        minimalCard,
                        "group-hover:shadow-lg"
                      )}
                      style={{
                        background: `linear-gradient(135deg,
                          rgba(255, 255, 255, 0.08) 0%,
                          rgba(255, 255, 255, 0.04) 100%)`,
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: `
                          0 4px 20px rgba(0, 0, 0, 0.08),
                          inset 0 1px 0 rgba(255, 255, 255, 0.1)
                        `
                      }}
                      whileHover={{
                        boxShadow: `
                          0 8px 40px rgba(0, 0, 0, 0.12),
                          0 0 0 1px rgba(100, 116, 139, 0.15),
                          inset 0 1px 0 rgba(255, 255, 255, 0.15)
                        `
                      }}
                    >
                    {/* Clean Thumbnail Area */}
                    <div className="relative aspect-video overflow-hidden rounded-t-xl">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Subtle Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                      {/* Minimal Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                        >
                          <div className="w-0 h-0 border-l-[10px] border-l-slate-800 border-y-[7px] border-y-transparent ml-1" />
                        </motion.div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1">
                        <span className="text-white text-xs font-medium">{video.duration}</span>
                      </div>

                      {/* Minimal XP Badge */}
                      <motion.div
                        whileHover={{
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                        className="absolute top-3 right-3"
                      >
                        <div
                          className="px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-sm"
                          style={{
                            background: subtleAccent,
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          <span>+{video.xpReward} XP</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Clean Card Content */}
                    <div className="p-5 space-y-3">
                      <h3 className={cn(
                        "font-semibold text-lg line-clamp-2 leading-tight transition-colors duration-300",
                        isDarkMode ? "text-white group-hover:text-slate-100" : "text-slate-900 group-hover:text-slate-700"
                      )}
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                        }}>
                        {video.title}
                      </h3>
                      <p className={cn(
                        "text-sm line-clamp-2 leading-relaxed",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      )}
                        style={{
                          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                        }}>
                        {video.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-medium">
                            {video.creator[0]}
                          </div>
                          <div>
                            <span className={cn(
                              "text-sm font-medium",
                              isDarkMode ? "text-slate-200" : "text-slate-700"
                            )}
                              style={{
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                              }}>
                              {video.creator}
                            </span>
                            <p className={cn(
                              "text-xs",
                              isDarkMode ? "text-slate-500" : "text-slate-500"
                            )}>
                              {video.views} views
                            </p>
                          </div>
                        </div>

                        {/* Minimal XP Action Badge */}
                        <motion.div
                          whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.2 }
                          }}
                          whileTap={{ scale: 0.95 }}
                          className="cursor-pointer"
                        >
                          <motion.div
                            className="px-3 py-1.5 rounded-full text-white text-xs font-medium"
                            style={{
                              background: subtleAccent,
                              backdropFilter: 'blur(16px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            whileHover={{
                              boxShadow: '0 4px 16px rgba(100, 116, 139, 0.2)'
                            }}
                          >
                            <span>+{video.xpReward} XP</span>
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Hidden Gamification Drawers */}

      {/* Leaderboard Drawer */}
      <AnimatePresence>
        {showLeaderboardDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowLeaderboardDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed right-0 top-0 h-full w-96 z-50 shadow-2xl border-l",
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700/50"
                  : "bg-white/95 border-gray-200/50",
                "backdrop-blur-xl"
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Trophy className={cn("w-6 h-6", isDarkMode ? "text-yellow-400" : "text-yellow-600")} />
                    <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                      Leaderboard
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLeaderboardDrawer(false)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                    )}
                  >
                    <X size={18} className={isDarkMode ? "text-slate-400" : "text-gray-600"} />
                  </motion.button>
                </div>

                {/* Leaderboard Content */}
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "CryptoKing", xp: 15420, avatar: "🥇" },
                    { rank: 2, name: "AIExpert", xp: 12890, avatar: "🥈" },
                    { rank: 3, name: "CodeMaster", xp: 11240, avatar: "🥉" },
                    { rank: 4, name: userName, xp: userXP, avatar: "👤", isUser: true },
                    { rank: 5, name: "TechGuru", xp: 9850, avatar: "🎯" }
                  ].map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                        player.isUser
                          ? isDarkMode
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : "bg-blue-50 border border-blue-200"
                          : isDarkMode
                            ? "bg-slate-800/60 hover:bg-slate-800/80"
                            : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          player.rank <= 3
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                            : isDarkMode ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-900"
                        )}>
                          #{player.rank}
                        </div>
                        <div>
                          <p className={cn("font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
                            {player.name}
                          </p>
                          <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-gray-600")}>
                            {player.xp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl">{player.avatar}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quests Drawer */}
      <AnimatePresence>
        {showQuestsDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowQuestsDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed right-0 top-0 h-full w-96 z-50 shadow-2xl border-l overflow-y-auto",
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700/50"
                  : "bg-white/95 border-gray-200/50",
                "backdrop-blur-xl"
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Target className={cn("w-6 h-6", isDarkMode ? "text-green-400" : "text-green-600")} />
                    <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                      Daily Quests
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowQuestsDrawer(false)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                    )}
                  >
                    <X size={18} className={isDarkMode ? "text-slate-400" : "text-gray-600"} />
                  </motion.button>
                </div>

                {/* Quests Content */}
                <div className="space-y-4">
                  {[
                    { title: "Watch 3 Videos", progress: 2, total: 3, xp: 50, icon: "🎥" },
                    { title: "Maintain Streak", progress: 1, total: 1, xp: 100, icon: "🔥", completed: true },
                    { title: "Learn Something New", progress: 0, total: 1, xp: 75, icon: "🎓" },
                    { title: "Share a Video", progress: 0, total: 2, xp: 25, icon: "📤" }
                  ].map((quest, index) => (
                    <motion.div
                      key={quest.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300",
                        quest.completed
                          ? isDarkMode
                            ? "bg-green-500/20 border-green-500/30"
                            : "bg-green-50 border-green-200"
                          : isDarkMode
                            ? "bg-slate-800/60 border-slate-700/50"
                            : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{quest.icon}</div>
                        <div className="flex-1">
                          <h4 className={cn("font-semibold mb-1", isDarkMode ? "text-white" : "text-gray-900")}>
                            {quest.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
                              {quest.progress}/{quest.total}
                            </span>
                            <Zap size={12} className="text-yellow-500" />
                            <span className="font-bold text-yellow-600">+{quest.xp} XP</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className={cn(
                        "h-2 rounded-full overflow-hidden",
                        isDarkMode ? "bg-slate-700" : "bg-gray-200"
                      )}>
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            quest.completed
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : "bg-gradient-to-r from-blue-400 to-purple-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shop Drawer */}
      <AnimatePresence>
        {showShopDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowShopDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed right-0 top-0 h-full w-96 z-50 shadow-2xl border-l overflow-y-auto",
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700/50"
                  : "bg-white/95 border-gray-200/50",
                "backdrop-blur-xl"
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Gift className={cn("w-6 h-6", isDarkMode ? "text-purple-400" : "text-purple-600")} />
                    <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                      Rewards Shop
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowShopDrawer(false)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                    )}
                  >
                    <X size={18} className={isDarkMode ? "text-slate-400" : "text-gray-600"} />
                  </motion.button>
                </div>

                {/* Shop Content */}
                <div className="space-y-4">
                  {[
                    { title: "Premium Course Access", price: 500, icon: "📚", available: true },
                    { title: "Custom Avatar Frame", price: 200, icon: "🖼️", available: true },
                    { title: "Exclusive Badge", price: 300, icon: "🎖️", available: false },
                    { title: "Priority Support", price: 150, icon: "🎧", available: true },
                    { title: "Special Effects", price: 400, icon: "✨", available: false }
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02]",
                        item.available
                          ? userXP >= item.price
                            ? isDarkMode
                              ? "bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
                              : "bg-green-50 border-green-200 hover:bg-green-100"
                            : isDarkMode
                              ? "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          : isDarkMode
                            ? "bg-slate-800/40 border-slate-700/30 opacity-60"
                            : "bg-gray-50 border-gray-200 opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{item.icon}</div>
                          <div>
                            <h4 className={cn(
                              "font-semibold",
                              isDarkMode ? "text-white" : "text-gray-900"
                            )}>
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1 text-sm">
                              <Crown size={12} className="text-yellow-500" />
                              <span className="font-bold text-yellow-600">{item.price} XP</span>
                            </div>
                          </div>
                        </div>
                        {item.available ? (
                          userXP >= item.price ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold"
                            >
                              Claim
                            </motion.button>
                          ) : (
                            <div className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-200 text-gray-600"
                            )}>
                              Need {item.price - userXP} XP
                            </div>
                          )
                        ) : (
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            isDarkMode ? "bg-slate-700 text-slate-500" : "bg-gray-200 text-gray-500"
                          )}>
                            Coming Soon
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Immersive XP Chamber Video Popup */}
      <AnimatePresence>
        {showVideoPlayer && selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleContinueWatching()}
          >
            {/* Enhanced Backdrop with Dashboard Blur */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{
                opacity: 1,
                backdropFilter: "blur(24px)",
                background: isDarkMode
                  ? "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)"
                  : "radial-gradient(ellipse at center, rgba(248, 250, 252, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)"
              }}
              exit={{
                opacity: 0,
                backdropFilter: "blur(0px)",
                transition: { duration: 0.5 }
              }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            />

            {/* XP Chamber Aura - shifts colors based on progress */}
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  "radial-gradient(600px at center, rgba(59, 130, 246, 0.1) 0%, transparent 50%)", // Blue start
                  videoProgress > 50
                    ? "radial-gradient(800px at center, rgba(147, 51, 234, 0.15) 0%, transparent 50%)" // Purple mid
                    : "radial-gradient(700px at center, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
                  videoProgress === 100
                    ? "radial-gradient(1000px at center, rgba(251, 191, 36, 0.2) 0%, transparent 50%)" // Gold complete
                    : videoProgress > 50
                      ? "radial-gradient(800px at center, rgba(147, 51, 234, 0.15) 0%, transparent 50%)"
                      : "radial-gradient(700px at center, rgba(59, 130, 246, 0.1) 0%, transparent 50%)"
                ]
              }}
              transition={{ duration: 1.5 }}
            />

            {/* XP Chamber Container with Animated Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50, rotateX: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-6xl"
            >
              {/* Animated Aura Glow around entire container */}
              <motion.div
                className="absolute -inset-4 rounded-3xl opacity-60"
                animate={{
                  background: [
                    "conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
                    "conic-gradient(from 120deg, transparent, rgba(147, 51, 234, 0.4), transparent)",
                    "conic-gradient(from 240deg, transparent, rgba(251, 191, 36, 0.5), transparent)",
                    "conic-gradient(from 360deg, transparent, rgba(59, 130, 246, 0.3), transparent)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ filter: "blur(20px)" }}
              />

              <div
                className={cn(
                  "relative rounded-3xl overflow-hidden shadow-2xl border-2",
                  isDarkMode
                    ? "bg-slate-900/95 border-slate-700/30"
                    : "bg-white/95 border-gray-200/30",
                  "backdrop-blur-2xl"
                )}
                style={{
                  background: isDarkMode
                    ? `linear-gradient(135deg,
                         rgba(15, 23, 42, 0.95) 0%,
                         rgba(30, 41, 59, 0.98) 50%,
                         rgba(15, 23, 42, 0.95) 100%)`
                    : `linear-gradient(135deg,
                         rgba(255, 255, 255, 0.95) 0%,
                         rgba(248, 250, 252, 0.98) 50%,
                         rgba(255, 255, 255, 0.95) 100%)`,
                  boxShadow: `
                    0 25px 50px -12px rgba(0, 0, 0, 0.25),
                    0 0 0 1px rgba(59, 130, 246, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `
                }}
              >
              {/* Header */}
              <div className={cn(
                "flex items-center justify-between p-6 border-b",
                isDarkMode ? "border-slate-700/50" : "border-gray-200/50"
              )}>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinueWatching}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                      isDarkMode
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <X size={18} />
                  </motion.button>

                  <div>
                    <h2 className={cn(
                      "text-xl font-bold line-clamp-1",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      {selectedVideo.title}
                    </h2>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-slate-400" : "text-gray-600"
                    )}>
                      by {selectedVideo.creator}
                    </p>
                  </div>
                </div>

                {/* XP Reward Badge */}
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-2xl font-bold shadow-lg flex items-center gap-2"
                >
                  <Zap size={16} />
                  +{selectedVideo.xpReward} XP
                </motion.div>
              </div>

              {/* XP-Integrated Video Player Area */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* Floating XP Counter - top-right */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-4 right-4 z-10"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-60"
                      animate={{
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div className="relative bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20 flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap size={16} className="text-yellow-200" />
                      </motion.div>
                      <span className="text-white font-bold text-sm">
                        +{pendingXP} XP pending
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Views Counter - top-left */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10"
                >
                  <span className="text-white text-sm font-medium">
                    {selectedVideo.views} views
                  </span>
                </motion.div>

                {/* Duration - bottom-right */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10"
                >
                  <span className="text-white text-sm font-medium">
                    {selectedVideo.duration}
                  </span>
                </motion.div>

                {/* XP Progress Bar with Milestone Ticks - bottom overlay */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                >
                  <div className="space-y-2">
                    {/* XP Milestone Progress */}
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>XP Progress</span>
                      <span>{Math.round(videoProgress)}%</span>
                    </div>

                    <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                      {/* Main progress bar */}
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${videoProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />

                      {/* Milestone tick marks */}
                      {[25, 50, 75, 100].map((milestone) => (
                        <div
                          key={milestone}
                          className="absolute top-0 bottom-0 w-0.5 bg-white/60"
                          style={{ left: `${milestone}%` }}
                        >
                          {/* Milestone glow when reached */}
                          {xpMilestones[milestone as keyof typeof xpMilestones] && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: [0, 1.5, 1],
                                opacity: [0, 1, 0.8]
                              }}
                              className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full"
                              style={{ boxShadow: "0 0 10px rgba(251, 191, 36, 0.8)" }}
                            />
                          )}
                        </div>
                      ))}

                      {/* Sparkle effects for milestones */}
                      <AnimatePresence>
                        {Object.entries(xpMilestones).map(([milestone, reached]) =>
                          reached && (
                            <motion.div
                              key={milestone}
                              initial={{ scale: 0, y: 0 }}
                              animate={{
                                scale: [0, 1, 0],
                                y: [-10, -30],
                                opacity: [0, 1, 0]
                              }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.5 }}
                              className="absolute text-yellow-400 text-sm"
                              style={{ left: `${milestone}%` }}
                            >
                              ✨
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Video Info & Actions */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className={cn(
                    "text-lg font-semibold mb-2",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>
                    {selectedVideo.title}
                  </h3>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  )}>
                    {selectedVideo.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {selectedVideo.creator[0]}
                    </div>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        isDarkMode ? "text-white" : "text-gray-900"
                      )}>
                        {selectedVideo.creator}
                      </p>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      )}>
                        Content Creator
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2",
                        isDarkMode
                          ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      )}
                    >
                      <Users size={16} />
                      Follow
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinueWatching}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg"
                    >
                      <ChevronRight size={16} />
                      Continue Learning
                    </motion.button>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>

            {/* End-of-Video Reward Ceremony */}
            <AnimatePresence>
              {showRewardCeremony && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-xl"
                >
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 20 }}
                    className="text-center space-y-6"
                  >
                    {/* 3D XP Reward Card */}
                    <motion.div
                      initial={{ rotateY: -15, scale: 0.8 }}
                      animate={{ rotateY: 0, scale: 1 }}
                      transition={{ type: "spring", damping: 20, stiffness: 200 }}
                      className="relative"
                      style={{ perspective: "1000px" }}
                    >
                      {/* Confetti trails */}
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-3 h-3 rounded-full"
                          style={{
                            background: `hsl(${i * 30}, 80%, 60%)`,
                            left: "50%",
                            top: "50%"
                          }}
                          animate={{
                            x: Math.cos((i * Math.PI * 2) / 12) * 150,
                            y: Math.sin((i * Math.PI * 2) / 12) * 150,
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.1,
                            ease: "easeOut"
                          }}
                        />
                      ))}

                      <div className={cn(
                        "bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-400/50 rounded-3xl p-8 shadow-2xl",
                        "backdrop-blur-xl relative overflow-hidden"
                      )}
                        style={{
                          background: `linear-gradient(135deg,
                            rgba(15, 23, 42, 0.95) 0%,
                            rgba(30, 41, 59, 0.95) 50%,
                            rgba(15, 23, 42, 0.95) 100%)`,
                          boxShadow: `
                            0 0 50px rgba(251, 191, 36, 0.5),
                            0 25px 50px -12px rgba(0, 0, 0, 0.8),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1)
                          `
                        }}
                      >
                        {/* Animated badge burst */}
                        <motion.div
                          animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity }
                          }}
                          className="mx-auto mb-6 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center relative"
                        >
                          <Crown size={40} className="text-white" />
                          {/* Orbiting sparkles */}
                          {[...Array(6)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                              animate={{
                                rotate: 360,
                                scale: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 2,
                                delay: i * 0.3,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                              style={{
                                left: "50%",
                                top: "50%",
                                transformOrigin: `${30 + i * 5}px center`
                              }}
                            />
                          ))}
                        </motion.div>

                        <motion.h2
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-4xl font-black text-white mb-2"
                        >
                          🎉 +{earnedVideoXP} XP Earned!
                        </motion.h2>

                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="text-lg text-slate-300 mb-6"
                        >
                          Amazing job completing this video!
                        </motion.p>

                        {/* Level progress bar */}
                        <motion.div
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ delay: 0.8, duration: 1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between text-sm text-slate-400">
                            <span>Level Progress</span>
                            <span>{userXP + earnedVideoXP}/{nextLevelXP} XP</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              initial={{ width: `${(userXP / nextLevelXP) * 100}%` }}
                              animate={{ width: `${((userXP + earnedVideoXP) / nextLevelXP) * 100}%` }}
                              transition={{ delay: 1, duration: 1.5 }}
                            />
                          </div>
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 }}
                          className="flex items-center justify-center gap-4 mt-8"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleContinueWatching}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 shadow-lg"
                          >
                            <ChevronRight size={18} />
                            Continue Journey →
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "px-6 py-3 rounded-2xl font-semibold transition-all duration-300",
                              isDarkMode
                                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            )}
                          >
                            Replay
                          </motion.button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark Mode Toggle (Hidden but available for development) */}
      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={cn(
          "fixed bottom-4 left-4 w-12 h-12 rounded-full transition-all duration-300 border shadow-lg backdrop-blur-lg",
          isDarkMode
            ? "bg-slate-800/80 border-slate-700/50 text-yellow-400"
            : "bg-white/80 border-gray-200/50 text-gray-600",
          "opacity-20 hover:opacity-100"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </motion.button>
    </div>
  );
};