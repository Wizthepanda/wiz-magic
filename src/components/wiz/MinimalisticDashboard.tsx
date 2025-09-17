import { useState, useEffect } from 'react';
import { Play, Eye, Search, ChevronDown, Settings, LogOut, Moon, Sun, Zap, Crown, Flame, Filter, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { MinimalisticVideoPlayer } from './MinimalisticVideoPlayer';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', emoji: '🎯' },
  { id: 'ai', label: 'AI', emoji: '🤖' },
  { id: 'crypto', label: 'Crypto', emoji: '₿' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'tech', label: 'Tech', emoji: '⚡' },
];

const feedVideos = [
  {
    id: 1,
    title: 'AI Revolution: The Future is Here',
    creator: 'TechGuru',
    avatar: 'https://ui-avatars.com/api/?name=TechGuru&background=8B5CF6&color=ffffff&size=128',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    duration: '8:45',
    xpReward: 85,
    category: 'ai',
    views: '2.1M',
    videoId: '2M4asXviuoo',
    uploaded: '2 hours ago'
  },
  {
    id: 2,
    title: 'Crypto Trading Mastery Course',
    creator: 'CryptoMaster',
    avatar: 'https://ui-avatars.com/api/?name=CryptoMaster&background=F59E0B&color=ffffff&size=128',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    duration: '12:30',
    xpReward: 120,
    category: 'crypto',
    views: '890K',
    videoId: 'jNQXAC9IVRw',
    uploaded: '5 hours ago'
  },
  {
    id: 3,
    title: 'Game Design Fundamentals',
    creator: 'GameDev Pro',
    avatar: 'https://ui-avatars.com/api/?name=GameDev+Pro&background=10B981&color=ffffff&size=128',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    duration: '15:20',
    xpReward: 150,
    category: 'gaming',
    views: '456K',
    videoId: 'ScMzIvxBSi4',
    uploaded: '1 day ago'
  },
  {
    id: 4,
    title: 'Modern UI/UX Design Principles',
    creator: 'DesignWiz',
    avatar: 'https://ui-avatars.com/api/?name=DesignWiz&background=EC4899&color=ffffff&size=128',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '10:15',
    xpReward: 95,
    category: 'design',
    views: '734K',
    videoId: 'dQw4w9WgXcQ',
    uploaded: '3 hours ago'
  },
  {
    id: 5,
    title: 'Music Production Essentials',
    creator: 'BeatMaker',
    avatar: 'https://ui-avatars.com/api/?name=BeatMaker&background=F97316&color=ffffff&size=128',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '6:30',
    xpReward: 65,
    category: 'music',
    views: '289K',
    videoId: 'dQw4w9WgXcQ',
    uploaded: '6 hours ago'
  },
  {
    id: 6,
    title: 'Next-Gen Technology Trends',
    creator: 'FutureTech',
    avatar: 'https://ui-avatars.com/api/?name=FutureTech&background=06B6D4&color=ffffff&size=128',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '14:45',
    xpReward: 140,
    category: 'tech',
    views: '1.2M',
    videoId: 'dQw4w9WgXcQ',
    uploaded: '4 hours ago'
  }
];

interface MinimalisticDashboardProps {
  className?: string;
}

export const MinimalisticDashboard = ({ className }: MinimalisticDashboardProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [userLevel, setUserLevel] = useState(7);
  const [userXP, setUserXP] = useState(2450);
  const [nextLevelXP] = useState(3000);
  const [todayXP, setTodayXP] = useState(120);
  const [dailyStreak, setDailyStreak] = useState(12);
  const [userRank, setUserRank] = useState(72);
  const [earnedXP, setEarnedXP] = useState<number | null>(null);

  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { addXp } = useXp();

  const userName = user?.displayName || 'Explorer';
  const progressPercent = (userXP / nextLevelXP) * 100;

  const filteredVideos = activeCategory === 'all'
    ? feedVideos
    : feedVideos.filter(video => video.category === activeCategory);

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleVideoComplete = (video: any) => {
    setEarnedXP(video.xpReward);
    setTodayXP(prev => prev + video.xpReward);
    setUserXP(prev => prev + video.xpReward);
    addXp(video.xpReward);

    setTimeout(() => {
      setEarnedXP(null);
    }, 2500);
  };

  const handleContinueWatching = () => {
    // Logic to continue to next video or back to feed
    console.log('Continue watching more content');
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500",
      className,
      isDarkMode
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-br from-white via-slate-50 to-white",
      isVideoModalOpen && "blur-sm scale-95"
    )}>
      {/* Clean Minimalistic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            isDarkMode ? "opacity-10" : "opacity-5"
          )}
          style={{
            backgroundImage: isDarkMode
              ? `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.15) 1px, transparent 0)`
              : `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.1) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Clean Minimalistic Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300",
          isDarkMode
            ? "bg-slate-900/80 border-slate-700/50"
            : "bg-white/80 border-slate-200/50"
        )}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Left: Navigation */}
            <div className="flex items-center gap-8">
              <motion.h1
                className={cn(
                  "text-xl font-bold transition-colors",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}
                whileHover={{ scale: 1.02 }}
              >
                Discover
              </motion.h1>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search size={18} className={cn(
                  "absolute left-4 top-1/2 transform -translate-y-1/2",
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                )} />
                <input
                  type="text"
                  placeholder="Search videos, creators, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                    isDarkMode
                      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                      : "bg-white/50 border-slate-200 text-slate-900 placeholder-slate-500"
                  )}
                />
              </div>
            </div>

            {/* Right: Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.photoURL || `https://ui-avatars.com/api/?name=${userName}&background=6366F1&color=ffffff&size=128`} />
                  <AvatarFallback className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-900"
                  )}>{userName[0]}</AvatarFallback>
                </Avatar>
                <ChevronDown size={16} className={cn(
                  "transition-transform duration-200",
                  showProfileDropdown && "rotate-180",
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                )} />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      "absolute right-0 top-12 w-80 rounded-2xl border shadow-xl backdrop-blur-xl z-50",
                      isDarkMode
                        ? "bg-slate-800/95 border-slate-700"
                        : "bg-white/95 border-slate-200"
                    )}
                  >
                    <div className="p-6">
                      {/* Profile Info */}
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user?.photoURL || `https://ui-avatars.com/api/?name=${userName}&background=6366F1&color=ffffff&size=128`} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">{userName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white" : "text-slate-900"
                          )}>{userName}</h3>
                          <p className={cn(
                            "text-sm",
                            isDarkMode ? "text-slate-400" : "text-slate-600"
                          )}>Level {userLevel} Explorer</p>
                        </div>
                      </div>

                      {/* XP Progress - Single Source of Truth */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-medium",
                            isDarkMode ? "text-slate-300" : "text-slate-700"
                          )}>Progress to Level {userLevel + 1}</span>
                          <span className={cn(
                            "text-sm font-bold",
                            isDarkMode ? "text-blue-400" : "text-blue-600"
                          )}>{userXP}/{nextLevelXP} XP</span>
                        </div>
                        <div className={cn(
                          "w-full h-2 rounded-full overflow-hidden",
                          isDarkMode ? "bg-slate-700" : "bg-slate-200"
                        )}>
                          <motion.div
                            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <div className="text-center">
                            <div className={cn(
                              "text-lg font-bold",
                              isDarkMode ? "text-emerald-400" : "text-emerald-600"
                            )}>+{todayXP}</div>
                            <div className={cn(
                              "text-xs",
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}>XP Today</div>
                          </div>
                          <div className="text-center">
                            <div className={cn(
                              "text-lg font-bold",
                              isDarkMode ? "text-orange-400" : "text-orange-600"
                            )}>{dailyStreak}</div>
                            <div className={cn(
                              "text-xs",
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}>Day Streak</div>
                          </div>
                          <div className="text-center">
                            <div className={cn(
                              "text-lg font-bold",
                              isDarkMode ? "text-purple-400" : "text-purple-600"
                            )}>#{userRank}</div>
                            <div className={cn(
                              "text-xs",
                              isDarkMode ? "text-slate-400" : "text-slate-600"
                            )}>Rank</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <button className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                        )}>
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>

                        {/* Light/Dark Toggle */}
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                            isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-700"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                          </div>
                          <div className={cn(
                            "w-10 h-6 rounded-full p-1 transition-colors",
                            isDarkMode ? "bg-blue-500" : "bg-slate-300"
                          )}>
                            <motion.div
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                              animate={{ x: isDarkMode ? 16 : 0 }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        </button>

                        <button className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isDarkMode ? "hover:bg-slate-700 text-red-400" : "hover:bg-slate-100 text-red-600"
                        )}>
                          <LogOut size={16} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bubbles */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-6 py-6"
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border",
                activeCategory === category.id
                  ? isDarkMode
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-blue-500 text-white border-blue-400"
                  : isDarkMode
                    ? "bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700/50"
                    : "bg-white/50 text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              <span>{category.emoji}</span>
              <span>{category.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Clean Video Feed */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group cursor-pointer"
              onClick={() => handleWatchVideo(video)}
            >
              <Card className={cn(
                "overflow-hidden transition-all duration-300 border-0 shadow-lg",
                isDarkMode
                  ? "bg-slate-800/50 hover:bg-slate-800/70 hover:shadow-2xl hover:shadow-purple-500/25"
                  : "bg-white hover:shadow-xl hover:shadow-slate-200/50"
              )}>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* XP Reward Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                    <Zap size={12} className="text-white" />
                    <span className="text-white font-bold text-sm">+{video.xpReward}</span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-xs font-medium">
                    {video.duration}
                  </div>

                  {/* Hover Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-lg"
                    >
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </motion.div>
                  </motion.div>
                </div>

                <CardContent className="p-4">
                  <h3 className={cn(
                    "font-semibold mb-2 line-clamp-2 transition-colors",
                    isDarkMode ? "text-white group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600"
                  )}>
                    {video.title}
                  </h3>

                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={video.avatar} />
                      <AvatarFallback className="text-xs">{video.creator[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      )}>{video.creator}</p>
                      <div className={cn(
                        "flex items-center gap-2 text-xs",
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      )}>
                        <Eye size={10} />
                        <span>{video.views}</span>
                        <span>•</span>
                        <span>{video.uploaded}</span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "text-center py-2 rounded-lg text-sm font-medium transition-colors",
                      isDarkMode
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    )}
                  >
                    Earn +{video.xpReward} XP
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Minimalistic Video Player */}
      <AnimatePresence>
        {selectedVideo && (
          <MinimalisticVideoPlayer
            video={{
              id: selectedVideo.id.toString(),
              title: selectedVideo.title,
              creator: selectedVideo.creator,
              avatar: selectedVideo.avatar,
              videoId: selectedVideo.videoId,
              xpReward: selectedVideo.xpReward,
              duration: selectedVideo.duration,
              views: selectedVideo.views,
              description: `Learn about ${selectedVideo.title} with ${selectedVideo.creator}`
            }}
            isOpen={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
            onVideoComplete={handleVideoComplete}
            onContinueWatching={handleContinueWatching}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* XP Celebration */}
      <AnimatePresence>
        {earnedXP && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl px-6 py-4 flex items-center gap-3 text-white font-bold shadow-lg">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Zap size={20} />
              </motion.div>
              <span>+{earnedXP} XP Earned!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};