import { useState, useEffect } from 'react';
import { Play, Eye, Heart, Share2, CheckCircle, Zap, Crown, Medal, Trophy, Star, Users, Award, Search, Clock, TrendingUp, Gift, ShoppingBag, Timer, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { WizVideoPlayer } from './wiz-video-player';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', icon: '🎯', gradient: 'from-slate-400 to-slate-500' },
  { id: 'ai', label: 'AI', icon: '🤖', gradient: 'from-blue-400 to-blue-500' },
  { id: 'crypto', label: 'Crypto', icon: '₿', gradient: 'from-yellow-400 to-yellow-500' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', gradient: 'from-green-400 to-green-500' },
  { id: 'design', label: 'Design', icon: '🎨', gradient: 'from-pink-400 to-pink-500' },
  { id: 'music', label: 'Music', icon: '🎵', gradient: 'from-orange-400 to-orange-500' },
  { id: 'tech', label: 'Tech', icon: '⚡', gradient: 'from-cyan-400 to-cyan-500' },
  { id: 'money', label: 'Money', icon: '💰', gradient: 'from-emerald-400 to-emerald-500' },
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

const leaderboardData = [
  { rank: 1, username: 'XPMaster', xp: 12540, avatar: 'https://ui-avatars.com/api/?name=XPMaster&background=FFD700&color=000000&size=64' },
  { rank: 2, username: 'CryptoLord', xp: 11890, avatar: 'https://ui-avatars.com/api/?name=CryptoLord&background=C0C0C0&color=000000&size=64' },
  { rank: 3, username: 'GameMaster', xp: 10450, avatar: 'https://ui-avatars.com/api/?name=GameMaster&background=CD7F32&color=ffffff&size=64' },
  { rank: 4, username: 'DesignGuru', xp: 9820, avatar: 'https://ui-avatars.com/api/?name=DesignGuru&background=8B5CF6&color=ffffff&size=64' },
  { rank: 5, username: 'TechWiz', xp: 8965, avatar: 'https://ui-avatars.com/api/?name=TechWiz&background=10B981&color=ffffff&size=64' },
];

const storeItems = [
  {
    id: 1,
    title: 'Premium AI Course Bundle',
    description: 'Complete artificial intelligence mastery',
    price: 500,
    originalPrice: 800,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    timeLeft: '2d 12h',
    featured: true
  },
  {
    id: 2,
    title: 'Crypto Signals Pro',
    description: '30-day premium trading signals',
    price: 300,
    originalPrice: 450,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    timeLeft: '5h 30m',
    featured: false
  },
  {
    id: 3,
    title: 'Design Assets Pack',
    description: 'Premium UI/UX design resources',
    price: 250,
    originalPrice: 400,
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400',
    timeLeft: '1d 8h',
    featured: false
  },
  {
    id: 4,
    title: 'Music Producer Kit',
    description: 'Professional beats and samples',
    price: 180,
    originalPrice: 280,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    timeLeft: '3h 15m',
    featured: false
  }
];

interface CleanPremiumDashboardProps {
  className?: string;
}

export const CleanPremiumDashboard = ({ className }: CleanPremiumDashboardProps) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());
  const [todayXP, setTodayXP] = useState(120);
  const [showXPCelebration, setShowXPCelebration] = useState(false);
  const [earnedXP, setEarnedXP] = useState<number | null>(null);
  const [userLevel, setUserLevel] = useState(7);
  const [userXP, setUserXP] = useState(2450);
  const [nextLevelXP] = useState(3000);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { addXp } = useXp();

  const userName = user?.displayName || 'Champion';
  const progressPercent = (userXP / nextLevelXP) * 100;

  const filteredVideos = activeCategory === 'all'
    ? feedVideos
    : feedVideos.filter(video => video.category === activeCategory);

  const featuredStoreItem = storeItems.find(item => item.featured);
  const regularStoreItems = storeItems.filter(item => !item.featured);

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleVideoComplete = (video: any) => {
    if (!watchedVideos.has(video.id)) {
      setWatchedVideos(prev => new Set([...prev, video.id]));
      setEarnedXP(video.xpReward);
      setTodayXP(prev => prev + video.xpReward);
      setUserXP(prev => prev + video.xpReward);
      setShowXPCelebration(true);
      addXp(video.xpReward);

      setTimeout(() => {
        setShowXPCelebration(false);
        setEarnedXP(null);
      }, 2500);
    }
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 to-white", className)}>
      {/* Main Layout */}
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 px-8 py-8 max-w-4xl mx-auto">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-white/80 to-slate-50/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8 shadow-sm">
              <div className="text-center space-y-6">

                {/* Greeting */}
                <motion.h1
                  className="text-3xl font-semibold text-slate-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  👋 Welcome back, {userName}
                </motion.h1>

                {/* Level & Progress */}
                <div className="space-y-4 max-w-lg mx-auto">

                  {/* Level Badge */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full px-4 py-2 border border-amber-200/50">
                      <Crown size={16} className="text-amber-600" />
                      <span className="text-amber-800 font-medium text-sm">Level {userLevel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                      <Sparkles size={14} />
                      <span>+{todayXP} XP today</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{userXP} XP</span>
                      <span>{nextLevelXP} XP</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-8 py-3 shadow-lg shadow-blue-500/25 border-0 font-medium"
                  >
                    ▶ Keep Watching → Earn +20 XP
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border",
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.gradient} text-white border-transparent shadow-md`
                      : "bg-white/70 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                  )}
                >
                  <span className="text-sm">{category.icon}</span>
                  <span>{category.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Video Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group cursor-pointer"
                onClick={() => handleWatchVideo(video)}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:border-slate-300/50 transition-all duration-300 overflow-hidden hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <Badge className={cn(
                        "text-xs font-medium text-white border-0 shadow-sm",
                        `bg-gradient-to-r ${categories.find(c => c.id === video.category)?.gradient}`
                      )}>
                        {categories.find(c => c.id === video.category)?.icon} {video.category.toUpperCase()}
                      </Badge>
                    </div>

                    {/* XP Reward */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 text-xs font-medium text-slate-700 shadow-sm">
                      <Zap size={12} className="text-amber-500" />
                      <span>+{video.xpReward}</span>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-white text-xs font-medium">
                      {video.duration}
                    </div>

                    {/* Hover CTA */}
                    <motion.div
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-slate-700 font-medium text-sm shadow-lg"
                      >
                        <Play size={14} />
                        <span>Earn +{video.xpReward} XP</span>
                      </motion.div>
                    </motion.div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {video.title}
                    </h3>

                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8 border border-slate-200">
                        <AvatarImage src={video.avatar} />
                        <AvatarFallback className="text-xs">{video.creator[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-600 font-medium truncate">{video.creator}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Eye size={10} />
                          <span>{video.views}</span>
                          <span>•</span>
                          <span>{video.uploaded}</span>
                        </div>
                      </div>
                    </div>

                    {watchedVideos.has(video.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-1 text-emerald-600 text-sm font-medium bg-emerald-50 rounded-lg py-2"
                      >
                        <CheckCircle size={14} />
                        <span>+{video.xpReward} XP Earned!</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Panel */}
        {!isMobile && (
          <div className="w-80 p-8 space-y-8">

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Trophy size={18} className="text-amber-500" />
                    <h3 className="font-semibold text-slate-800">Leaderboard</h3>
                  </div>

                  <div className="space-y-3">
                    {leaderboardData.map((player, index) => (
                      <motion.div
                        key={player.rank}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-6 h-6">
                          {player.rank === 1 && <span className="text-amber-500">👑</span>}
                          {player.rank === 2 && <span className="text-slate-400">🥈</span>}
                          {player.rank === 3 && <span className="text-amber-600">🥉</span>}
                          {player.rank > 3 && <span className="text-slate-400 text-sm font-medium">#{player.rank}</span>}
                        </div>
                        <Avatar className="w-8 h-8 border border-slate-200">
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback className="text-xs">{player.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{player.username}</p>
                          <p className="text-xs text-slate-500">{player.xp.toLocaleString()} XP</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <TrendingUp size={14} className="mr-2" />
                    Climb the Leaderboard
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* XP Store */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={18} className="text-purple-500" />
                      <h3 className="font-semibold text-slate-800">XP Store</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                      <Timer size={12} />
                      <span>2d 12h</span>
                    </div>
                  </div>

                  {/* Featured Item */}
                  {featuredStoreItem && (
                    <div className="mb-6">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={featuredStoreItem.image}
                          alt={featuredStoreItem.title}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-orange-500 text-white text-xs">
                          Featured
                        </Badge>
                        <div className="absolute bottom-3 left-3 right-3">
                          <h4 className="text-white font-semibold text-sm mb-1">{featuredStoreItem.title}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400 font-bold">{featuredStoreItem.price} XP</span>
                              <span className="text-white/70 line-through text-xs">{featuredStoreItem.originalPrice} XP</span>
                            </div>
                            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs">
                              Claim
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Regular Items */}
                  <div className="space-y-3">
                    {regularStoreItems.slice(0, 3).map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-700 truncate">{item.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600 font-semibold text-sm">{item.price} XP</span>
                            <span className="text-slate-400 line-through text-xs">{item.originalPrice}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs">
                          Claim
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Gift size={14} className="mr-2" />
                    View Full Store
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogContent className="max-w-4xl w-full bg-white/95 backdrop-blur-xl border-slate-200">
          <DialogTitle className="sr-only">Video Player</DialogTitle>
          {selectedVideo && (
            <div className="space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden">
                <WizVideoPlayer
                  videoId={selectedVideo.videoId}
                  onVideoEnd={() => handleVideoComplete(selectedVideo)}
                  autoplay={true}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-slate-200">
                    <AvatarImage src={selectedVideo.avatar} />
                    <AvatarFallback>{selectedVideo.creator[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-800">{selectedVideo.creator}</h3>
                    <p className="text-sm text-slate-500">Creator</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4">
                    Follow
                  </Button>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">XP Reward</div>
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Zap size={16} />
                    {selectedVideo.xpReward}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* XP Celebration */}
      <AnimatePresence>
        {showXPCelebration && earnedXP && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full px-6 py-3 flex items-center gap-2 text-white font-semibold shadow-lg">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <Sparkles size={20} />
              </motion.div>
              <span>+{earnedXP} XP Earned!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};