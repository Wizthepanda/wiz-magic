import { useState } from 'react';
import { Play, Eye, Heart, Share2, CheckCircle, Zap, ChevronLeft, ChevronRight, Crown, Medal, Trophy, Star, Users, Award, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { WizVideoPlayer } from './wiz-video-player';
import { VideoPanel } from './VideoPanel';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FloatingParticles } from '@/components/ui/floating-particles';

const categories = [
  { id: 'all', label: 'All', color: 'bg-wiz-primary', dotColor: 'bg-blue-400' },
  { id: 'ai', label: 'AI', color: 'bg-wiz-secondary', dotColor: 'bg-red-400' },
  { id: 'tech', label: 'Tech', color: 'bg-wiz-accent', dotColor: 'bg-orange-400' },
  { id: 'music', label: 'Music', color: 'bg-wiz-magic', dotColor: 'bg-pink-400' },
  { id: 'money', label: 'Money', color: 'bg-emerald-500', dotColor: 'bg-green-400' },
  { id: 'health', label: 'Health', color: 'bg-rose-500', dotColor: 'bg-red-400' },
];

// Exactly 8 video panels with category tags
const videos = [
  {
    id: 1,
    title: 'WIZ Magic Demo Video',
    creator: 'WIZ Magic',
    avatar: '',
    thumbnail: '',
    duration: '0:27',
    xpReward: 25,
    category: 'ai',
    categoryLabel: 'AI',
    views: '1K',
    watched: false,
    progress: 0,
    videoId: '2M4asXviuoo',
    isNew: true
  },
  {
    id: 2,
    title: 'Building Wealth Through Tech Investments',
    creator: 'MoneyWizard',
    avatar: '',
    thumbnail: '',
    duration: '18:30',
    xpReward: 220,
    category: 'money',
    categoryLabel: 'MONEY',
    views: '78K',
    watched: false,
    progress: 65,
    videoId: 'jNQXAC9IVRw',
    isNew: false
  },
  {
    id: 3,
    title: 'React 19 Features You Need to Know',
    creator: 'CodeMaster',
    avatar: '',
    thumbnail: '',
    duration: '15:20',
    xpReward: 180,
    category: 'tech',
    categoryLabel: 'TECH',
    views: '32K',
    watched: true,
    progress: 100,
    videoId: 'ScMzIvxBSi4',
    isNew: false
  },
  {
    id: 4,
    title: 'Music Production Secrets Revealed',
    creator: 'BeatCreator',
    avatar: '',
    thumbnail: '',
    duration: '22:15',
    xpReward: 280,
    category: 'music',
    categoryLabel: 'MUSIC',
    views: '56K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: true
  },
  {
    id: 5,
    title: 'Advanced Machine Learning Techniques',
    creator: 'MLExpert',
    avatar: '',
    thumbnail: '',
    duration: '25:40',
    xpReward: 320,
    category: 'ai',
    categoryLabel: 'AI',
    views: '89K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
    isNew: false
  },
  {
    id: 6,
    title: 'Cryptocurrency Trading Strategies',
    creator: 'CryptoKing',
    avatar: '',
    thumbnail: '',
    duration: '19:55',
    xpReward: 240,
    category: 'money',
    categoryLabel: 'MONEY',
    views: '67K',
    watched: false,
    progress: 30,
    videoId: 'jNQXAC9IVRw',
    isNew: false
  },
  {
    id: 7,
    title: 'Fitness Transformation in 30 Days',
    creator: 'HealthGuru',
    avatar: '',
    thumbnail: '',
    duration: '16:45',
    xpReward: 200,
    category: 'health',
    categoryLabel: 'HEALTH',
    views: '91K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: false
  },
  {
    id: 8,
    title: 'Electronic Music Composition',
    creator: 'SynthMaster',
    avatar: '',
    thumbnail: '',
    duration: '24:30',
    xpReward: 260,
    category: 'music',
    categoryLabel: 'MUSIC',
    views: '54K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
    isNew: true
  }
];



// Creators data for WIZ Premiere section
const creators = [
  {
    id: 1,
    name: 'FERA',
    username: '@imagineFERA',
    followers: '125K',
    videos: 89,
    totalViews: '2.3M',
    specialty: 'Creative Visionary',
    thumbnail: '/Profile Pics/FERA.jpg',
    avatar: '/Profile Pics/FERA.jpg',
    verified: true,
    rating: 4.9,
    twitterUrl: 'https://x.com/imagineFERA'
  },
  {
    id: 2,
    name: 'Captain HaHaa',
    username: '@CaptainHaHaa',
    followers: '89K',
    videos: 156,
    totalViews: '1.8M',
    specialty: 'Gaming & Entertainment',
    thumbnail: '/Profile Pics/Captain Hahaa.jpg',
    avatar: '/Profile Pics/Captain Hahaa.jpg',
    verified: true,
    rating: 4.7,
    twitterUrl: 'https://x.com/CaptainHaHaa'
  },
  {
    id: 3,
    name: 'RoyalKongz',
    username: '@RoyalKongz',
    followers: '203K',
    videos: 234,
    totalViews: '4.1M',
    specialty: 'Digital Art & Animation',
    thumbnail: '/Profile Pics/RoyalKongz.jpg',
    avatar: '/Profile Pics/RoyalKongz.jpg',
    verified: true,
    rating: 4.8,
    twitterUrl: 'https://x.com/RoyalKongz'
  },
  {
    id: 4,
    name: 'Alexandria',
    username: '@AleRVG',
    followers: '67K',
    videos: 78,
    totalViews: '1.2M',
    specialty: 'Tech & Innovation',
    thumbnail: '/Profile Pics/Ale.jpg',
    avatar: '/Profile Pics/Ale.jpg',
    verified: true,
    rating: 4.6,
    twitterUrl: 'https://x.com/AleRVG'
  },
  {
    id: 5,
    name: 'Bogdan',
    username: '@SMKP_Films',
    followers: '145K',
    videos: 198,
    totalViews: '3.2M',
    specialty: 'Film & Photography',
    thumbnail: '/Profile Pics/Bogdan.jpg',
    avatar: '/Profile Pics/Bogdan.jpg',
    verified: true,
    rating: 4.9,
    twitterUrl: 'https://x.com/SMKP_Films'
  },
  {
    id: 6,
    name: 'MadPencil',
    username: '@madpencil_',
    followers: '98K',
    videos: 134,
    totalViews: '2.1M',
    specialty: 'Art & Design',
    thumbnail: '/Profile Pics/MadPencil.jpg',
    avatar: '/Profile Pics/MadPencil.jpg',
    verified: true,
    rating: 4.8,
    twitterUrl: 'https://x.com/madpencil_'
  }
];

// Top creators and wizards data
const topCreators = [
  { rank: 1, name: 'AIGuru42', xp: 125000, level: 47, videos: 89, views: '2.3M', specialty: 'AI & ML' },
  { rank: 2, name: 'CodeMaster', xp: 98000, level: 42, videos: 156, views: '1.8M', specialty: 'Development' },
  { rank: 3, name: 'MoneyWizard', xp: 87000, level: 39, videos: 78, views: '1.5M', specialty: 'Finance' },
  { rank: 4, name: 'HealthGuru', xp: 76000, level: 35, videos: 134, views: '1.2M', specialty: 'Health' },
  { rank: 5, name: 'BeatCreator', xp: 65000, level: 32, videos: 92, views: '980K', specialty: 'Music' }
];

const topWizards = [
  { rank: 1, name: 'WizMaster', xp: 45000, level: 28, watchTime: '340h', streak: 89 },
  { rank: 2, name: 'LearningNinja', xp: 38000, level: 25, watchTime: '280h', streak: 67 },
  { rank: 3, name: 'KnowledgeSeeker', xp: 32000, level: 22, watchTime: '245h', streak: 54 },
  { rank: 4, name: 'StudyWiz', xp: 28000, level: 19, watchTime: '210h', streak: 43 },
  { rank: 5, name: 'ContentConsumer', xp: 24000, level: 17, watchTime: '180h', streak: 32 }
];

// Helper functions for category styling
const getCategoryGradient = (category: string) => {
  const gradients = {
    ai: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
    tech: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', 
    music: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    money: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    health: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  };
  return gradients[category] || gradients.ai;
};

const getCategoryShadow = (category: string) => {
  const shadows = {
    ai: '0 4px 12px rgba(59, 130, 246, 0.3)',
    tech: '0 4px 12px rgba(6, 182, 212, 0.3)',
    music: '0 4px 12px rgba(236, 72, 153, 0.3)', 
    money: '0 4px 12px rgba(245, 158, 11, 0.3)',
    health: '0 4px 12px rgba(16, 185, 129, 0.3)',
  };
  return shadows[category] || shadows.ai;
};

export const WizDiscoverSection = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [leaderboardTab, setLeaderboardTab] = useState('creators');
  const [isPremiereVideoPlaying, setIsPremiereVideoPlaying] = useState(false);

  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === activeCategory);

  const handleWatchVideo = (videoId: number | string) => {
    const video = videos.find(v => v.id === videoId) || aiTechVideos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400/20 to-yellow-600/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-300/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-400/20 to-orange-600/20 border-orange-500/30';
    return 'from-slate-100/20 to-slate-300/20 border-slate-200/30';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-500" />;
    return <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">{rank}</div>;
  };

  return (
    <div className="relative min-h-screen">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6 sm:space-y-8">
        {/* Category Filter Section - Mobile responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 px-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className={`${activeCategory === category.id ? category.color : ''} transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3`}
              >
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${category.dotColor}`} />
                <span className="truncate">{category.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Discover Content - Mobile responsive scrolling */}
        <div className="relative mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
            <h3 
              className="text-lg sm:text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #e879f9 0%, #a855f7 30%, #6366f1 70%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))'
              }}
            >
              Latest Videos
            </h3>
            <div className="hidden sm:flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('discover-container');
                  if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('discover-container');
                  if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
          
          <div
            id="discover-container"
            className="flex space-x-3 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth px-2 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
                        {filteredVideos.map((video) => (
              <div key={video.id} className="flex-shrink-0 w-64 sm:w-80 group">
                <Card className="h-80 sm:h-96 overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                      }}>
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* Thumbnail Section */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden"
                         style={{ borderRadius: '20px 20px 0 0' }}>
                      
                      {/* Category Badge - Top Left */}
                      <div className="absolute top-3 left-3 z-20">
                        {video.isNew ? (
                          <Badge className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                                 style={{
                                   background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                                   borderRadius: '12px',
                                   boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                 }}>
                            NEW
                          </Badge>
                        ) : (
                          <Badge className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                                 style={{
                                   background: getCategoryGradient(video.category),
                                   borderRadius: '12px',
                                   boxShadow: getCategoryShadow(video.category)
                                 }}>
                            {video.categoryLabel}
                          </Badge>
                        )}
                      </div>

                      {/* XP Badge - Top Right */}
                      <div className="absolute top-3 right-3 z-20">
                        <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold"
                             style={{
                               background: 'radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.8) 100%)',
                               color: '#1F2937',
                               boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                             }}>
                          <Zap className="w-3 h-3" />
                          <span>{video.xpReward}</span>
                        </div>
                      </div>

                      {/* Duration - Bottom Right */}
                      <div className="absolute bottom-3 right-3 z-20 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-semibold">
                        {video.duration}
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          size="lg"
                          onClick={() => handleWatchVideo(video.id)}
                          className="h-16 w-16 rounded-full p-0 text-wiz-primary shadow-2xl hover:scale-110 transition-transform duration-300"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <Play className="w-7 h-7 ml-0.5" fill="currentColor" />
                        </Button>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                      {/* Progress Bar */}
                      {video.progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 z-20">
                          <div className="w-full bg-white/30 h-1">
                            <div 
                              className="bg-gradient-to-r from-wiz-primary to-wiz-secondary h-1 transition-all duration-300"
                              style={{ width: `${video.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-5 flex flex-col">
                      {/* Title */}
                      <h4 className="font-bold text-lg text-gray-800 line-clamp-2 mb-3 group-hover:text-wiz-primary transition-colors leading-tight">
                        {video.title}
                      </h4>
                      
                      {/* Creator & Views */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span className="font-medium">{video.creator}</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{video.views}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 mt-auto">
                        <Button 
                          className={`flex-1 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                            video.watched 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                              : 'bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-secondary hover:to-wiz-primary'
                          }`}
                          onClick={() => handleWatchVideo(video.id)}
                          style={{ borderRadius: '12px' }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {video.watched ? 'Watched' : 'Watch'}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="p-2 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-300 transition-all duration-300"
                          style={{ borderRadius: '10px' }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="p-2 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-300 transition-all duration-300"
                          style={{ borderRadius: '10px' }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* XP Earned Display */}
                      {video.watched && (
                        <div className="mt-3 text-sm font-semibold text-wiz-primary">
                          XP Earned: +{video.xpReward} XP
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
          ))}
          </div>
        </div>

        {/* 🔥 Most Viewed - Glassmorphic Purple-to-Indigo Design */}
        <div className="relative mb-20">
          {/* Glassmorphic Container */}
          <motion.div
            className="relative rounded-xl overflow-hidden p-8"
            style={{
              background: `
                linear-gradient(135deg, 
                  rgba(147, 51, 234, 0.15) 0%, 
                  rgba(99, 102, 241, 0.12) 50%, 
                  rgba(79, 70, 229, 0.15) 100%
                ),
                rgba(255, 255, 255, 0.1)
              `,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              boxShadow: '0 20px 60px rgba(147, 51, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Enhanced Section Title */}
            <div className="text-center mb-10">
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-4 relative"
                style={{
                  background: 'linear-gradient(135deg, #e879f9 0%, #a855f7 30%, #6366f1 70%, #c4b5fd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))'
                }}
                whileHover={{ scale: 1.02 }}
              >
                🔥 Most Viewed
                
                {/* Pulsing Glowing Underline */}
                <motion.div 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 rounded-full"
                  style={{
                    width: '80%',
                    background: 'linear-gradient(90deg, rgba(232, 121, 249, 0.6) 0%, rgba(147, 51, 234, 0.8) 50%, rgba(232, 121, 249, 0.6) 100%)',
                    boxShadow: '0 0 20px rgba(147, 51, 234, 0.8)'
                  }}
                  animate={{
                    opacity: [0.6, 1, 0.6],
                    boxShadow: [
                      '0 0 20px rgba(147, 51, 234, 0.8)',
                      '0 0 30px rgba(147, 51, 234, 1)',
                      '0 0 20px rgba(147, 51, 234, 0.8)'
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.h2>
              <p className="text-xl text-purple-200">
                The content everyone is watching right now
              </p>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => {
                    const container = document.getElementById('most-viewed-container');
                    if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                  }}
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(99, 102, 241, 0.8) 100%)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(147, 51, 234, 0.3)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.5)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => {
                    const container = document.getElementById('most-viewed-container');
                    if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                  }}
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(99, 102, 241, 0.8) 100%)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(147, 51, 234, 0.3)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.5)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Most Viewed Cards - Horizontal Scroll */}
            <div
              id="most-viewed-container"
              className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videos.slice(0, 6).map((video, index) => (
                <motion.div 
                  key={`mv-${video.id}`} 
                  className="flex-shrink-0 w-80 group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div 
                    className="h-96 overflow-hidden border-0 shadow-xl group-hover:shadow-2xl transition-all duration-500 rounded-xl"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(147, 51, 234, 0.1) 0%, 
                          rgba(99, 102, 241, 0.08) 50%, 
                          rgba(79, 70, 229, 0.1) 100%
                        ),
                        rgba(255, 255, 255, 0.05)
                      `,
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      boxShadow: '0 8px 32px rgba(147, 51, 234, 0.15)'
                    }}
                  >
                    <div className="p-0 h-full flex flex-col">
                      {/* Thumbnail Section */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 overflow-hidden rounded-t-xl">
                        
                        {/* Ranking Badge */}
                        {index < 3 && (
                          <motion.div 
                            className="absolute top-3 left-3 z-30"
                            whileHover={{ scale: 1.1 }}
                          >
                            <div 
                              className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                              style={{
                                background: index === 0 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                           index === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)' :
                                           'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
                                color: '#000',
                                boxShadow: `0 4px 12px ${index === 0 ? 'rgba(255, 215, 0, 0.4)' : 'rgba(192, 192, 192, 0.4)'}`
                              }}
                            >
                              <Crown className="w-3 h-3" />
                              <span>#{index + 1}</span>
                            </div>
                          </motion.div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3 z-20">
                          <div className="px-2 py-1 text-xs font-bold text-white uppercase tracking-wide rounded-lg"
                               style={{
                                 background: getCategoryGradient(video.category),
                                 boxShadow: getCategoryShadow(video.category)
                               }}>
                            {video.categoryLabel}
                          </div>
                        </div>

                        {/* XP Badge */}
                        <motion.div 
                          className="absolute bottom-3 left-3 z-20"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold"
                               style={{
                                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%)',
                                 color: '#1F2937',
                                 boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
                               }}>
                            <Zap className="w-3 h-3" />
                            <span>{video.xpReward}</span>
                          </div>
                        </motion.div>

                        {/* Duration */}
                        <div className="absolute bottom-3 right-3 z-20 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-semibold">
                          {video.duration}
                        </div>

                        {/* Glassmorphic Play Button */}
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.button
                            onClick={() => handleWatchVideo(video.id)}
                            className="h-16 w-16 rounded-full flex items-center justify-center text-white shadow-2xl"
                            style={{
                              background: `
                                linear-gradient(135deg, 
                                  rgba(255, 215, 0, 0.9) 0%, 
                                  rgba(255, 165, 0, 0.9) 100%
                                )
                              `,
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                            whileHover={{ 
                              boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
                              scale: 1.1
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-6 h-6 ml-0.5 text-black" fill="currentColor" />
                          </motion.button>
                        </motion.div>

                        {/* Subtle Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent z-10" />
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-5 flex flex-col">
                        <h4 className="font-bold text-lg text-gray-800 line-clamp-2 mb-3 group-hover:text-purple-600 transition-colors leading-tight">
                          {video.title}
                        </h4>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span className="font-medium">{video.creator}</span>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{video.views}</span>
                          </div>
                        </div>
                        
                        {/* Glassmorphic CTA Button */}
                        <div className="mt-auto">
                          <motion.button 
                            className="w-full font-semibold text-white shadow-lg py-3 rounded-xl"
                            style={{
                              background: `
                                linear-gradient(135deg, 
                                  rgba(255, 215, 0, 0.9) 0%, 
                                  rgba(255, 165, 0, 0.9) 100%
                                )
                              `,
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            onClick={() => handleWatchVideo(video.id)}
                            whileHover={{ 
                              scale: 1.02,
                              boxShadow: '0 0 25px rgba(255, 215, 0, 0.4)'
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-center space-x-2 text-black">
                              <Play className="w-4 h-4" />
                              <span>Watch Now</span>
                            </div>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* WIZ Premiere — Elevated Abstract UI */}
        <motion.div 
          className="relative w-full mb-16 overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {/* Abstract Backdrop */}
          <div
            className="relative rounded-3xl py-16 px-8"
            style={{
              background: `
                linear-gradient(135deg, #0d0d0f 0%, #1a0129 100%),
                radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)
              `,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Floating Abstract Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Glassy Orbs */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full opacity-20"
                  style={{
                    width: `${60 + i * 20}px`,
                    height: `${60 + i * 20}px`,
                    background: `
                      radial-gradient(circle, 
                        rgba(${i % 3 === 0 ? '168, 85, 247' : i % 3 === 1 ? '99, 102, 241' : '139, 92, 246'}, 0.3) 0%, 
                        transparent 70%
                      )
                    `,
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    left: `${10 + (i * 15)}%`,
                    top: `${15 + (i * 12)}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 15, 0],
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 1.2
                  }}
                />
              ))}

              {/* Flowing Waveforms */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 80px,
                      rgba(168, 85, 247, 0.1) 81px,
                      rgba(168, 85, 247, 0.1) 83px
                    )
                  `
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Subtle Starfield */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-purple-400"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.3
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Hero Header */}
            <motion.div 
              className="text-center mb-12 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {/* Abstract Glowing Arc */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-48 h-24 opacity-50"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent)',
                  borderRadius: '50%',
                  filter: 'blur(20px)'
                }}
                animate={{
                  scaleX: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Title */}
              <motion.h2 
                className="text-5xl md:text-6xl font-bold mb-4 relative"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e879f9 30%, #a855f7 70%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                WIZ Premiere
              </motion.h2>
              
              {/* Subtitle */}
              <motion.p 
                className="text-xl text-gray-300 font-light max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                A Hollywood-level AI animation brought to life by 6 visionary animators
              </motion.p>
            </motion.div>

            {/* Trailer Showcase */}
            <motion.div 
              className="relative mb-16 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <motion.div
                className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 1, 41, 0.9) 100%)',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 0 60px rgba(168, 85, 247, 0.5)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glassy Frame Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(168, 85, 247, 0.1) 100%)',
                    backdropFilter: 'blur(1px)'
                  }}
                />
                
                {/* Interactive Video Player */}
                <div 
                  className="w-full h-full relative cursor-pointer group rounded-xl overflow-hidden"
                  onClick={() => setIsPremiereVideoPlaying(!isPremiereVideoPlaying)}
                  style={{ minHeight: '315px' }}
                >
                  {!isPremiereVideoPlaying ? (
                    <>
                      {/* Panda Thumbnail */}
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: 'url("/wiz-premiere-panda.svg")',
                          minHeight: '315px'
                        }}
                      >
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-all duration-300">
                          <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                            <Play className="w-10 h-10 text-black ml-1" />
                          </div>
                        </div>
                        
                        {/* Quality Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center space-x-1 px-3 py-1 bg-black/80 text-white text-xs font-semibold rounded-full">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            <span>4K Ultra HD</span>
                          </div>
                        </div>
                        
                        {/* Duration Badge */}
                        <div className="absolute bottom-4 right-4">
                          <div className="px-3 py-1 bg-black/80 text-white text-sm font-semibold rounded">
                            2:45
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <iframe
                      className="w-full h-full rounded-xl"
                      src="https://www.youtube.com/embed/2M4asXviuoo?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&hd=1&vq=hd1080&enablejsapi=1&origin=https://wizxp.com"
                      title="WIZ Premiere Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 1, 41, 0.8) 100%)',
                        minHeight: '315px'
                      }}
                    />
                  )}
                </div>

                {/* Purple Ripple Glow on Hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />

                {/* Trailer Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                     style={{
                       background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                       backdropFilter: 'blur(10px)'
                     }}>
                  🎬 PREMIERE TRAILER
                </div>
              </motion.div>
            </motion.div>

            {/* Creator Constellation Grid */}
            <motion.div 
              className="relative min-h-[600px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1.0 }}
            >
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
                <defs>
                  <linearGradient id="constellationGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.6)" />
                    <stop offset="50%" stopColor="rgba(99, 102, 241, 0.4)" />
                    <stop offset="100%" stopColor="rgba(139, 92, 246, 0.6)" />
                  </linearGradient>
                  <filter id="glowEffect">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Constellation Lines */}
                <motion.path
                  d="M120,100 L320,80 L520,160 L380,300 L180,280 L120,100"
                  stroke="url(#constellationGlow)"
                  strokeWidth="1.5"
                  fill="none"
                  filter="url(#glowEffect)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.7 }}
                  transition={{ duration: 3, delay: 2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M600,120 L520,160 L680,260 L780,200"
                  stroke="url(#constellationGlow)"
                  strokeWidth="1.5"
                  fill="none"
                  filter="url(#glowEffect)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ duration: 2.5, delay: 2.5, ease: "easeInOut" }}
                />
              </svg>

              {/* Creator Tiles - Organic Asymmetrical Layout */}
              {creators.slice(0, 6).map((creator, index) => {
                const positions = [
                  { x: '8%', y: '10%', size: 200 },
                  { x: '45%', y: '5%', size: 180 },
                  { x: '75%', y: '15%', size: 190 },
                  { x: '15%', y: '55%', size: 185 },
                  { x: '55%', y: '50%', size: 195 },
                  { x: '80%', y: '60%', size: 175 }
                ];
                
                const pos = positions[index];
                
                return (
                  <motion.div
                    key={creator.id}
                    className="absolute group cursor-pointer z-10"
                    style={{
                      left: pos.x,
                      top: pos.y,
                      width: `${pos.size}px`,
                      height: `${pos.size}px`,
                    }}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      y: 50
                    }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: 0
                    }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 1.8 + index * 0.2,
                      type: "spring",
                      bounce: 0.3
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    {/* Video Showcase */}
                    <div
                      className="relative w-full h-full rounded-2xl overflow-hidden transition-all duration-700"
                      style={{
                        background: `
                          linear-gradient(135deg, 
                            rgba(0, 0, 0, 0.9) 0%, 
                            rgba(168, 85, 247, 0.1) 30%,
                            rgba(99, 102, 241, 0.1) 70%,
                            rgba(0, 0, 0, 0.9) 100%
                          )
                        `,
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        boxShadow: '0 8px 32px rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      {/* Video Content */}
                      <div className="absolute inset-4 rounded-xl overflow-hidden">
                        <img 
                          src={creator.thumbnail}
                          alt={`${creator.name}'s showcase`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Glow Spread on Hover */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `
                              radial-gradient(circle at center, 
                                rgba(168, 85, 247, 0.3) 0%, 
                                rgba(99, 102, 241, 0.2) 40%, 
                                transparent 70%
                              )
                            `
                          }}
                        />
                      </div>

                      {/* Profile Image - Overlapping Bottom-Left */}
                      <motion.div 
                        className="absolute -bottom-4 left-4 z-20"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(168, 85, 247, 0.6)',
                            '0 0 30px rgba(168, 85, 247, 0.8)',
                            '0 0 20px rgba(168, 85, 247, 0.6)'
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        whileHover={{
                          scale: 1.1,
                          boxShadow: '0 0 40px rgba(168, 85, 247, 1)'
                        }}
                      >
                        <div
                          className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30"
                          style={{
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <img 
                            src={creator.avatar} 
                            alt={creator.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </motion.div>

                      {/* Twitter/X Icon - Top Right */}
                      <motion.button
                        className="absolute top-3 right-3 p-2 rounded-lg transition-all duration-300 z-20"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                        whileHover={{
                          scale: 1.1,
                          background: 'rgba(29, 155, 240, 0.3)',
                          boxShadow: '0 0 15px rgba(29, 155, 240, 0.5)'
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(creator.twitterUrl, '_blank');
                        }}
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </motion.button>

                      {/* Glow Ripple Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                          filter: 'blur(15px)'
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0, 0.5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    </div>

                    {/* Name + Role - Centered Below */}
                    <motion.div 
                      className="text-center mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2 + index * 0.2 }}
                    >
                      <motion.h3 
                        className="text-lg font-bold text-white mb-1"
                        whileHover={{
                          background: 'linear-gradient(90deg, #ffffff, #a855f7, #6366f1, #ffffff)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          backgroundPosition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }
                        }}
                      >
                        {creator.name}
                      </motion.h3>
                      <motion.p 
                        className="text-sm text-gray-400"
                        whileHover={{ color: '#a855f7' }}
                      >
                        {creator.specialty}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Join the Watch Party Button - Bottom Center */}
            <motion.div 
              className="flex justify-center mt-12 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.0, duration: 0.8 }}
            >
              <motion.button
                className="group relative px-8 py-4 font-bold text-lg rounded-2xl overflow-hidden"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(147, 51, 234, 0.9) 0%, 
                      rgba(99, 102, 241, 0.9) 50%, 
                      rgba(139, 92, 246, 0.9) 100%
                    )
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4)',
                  color: '#ffffff'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 12px 40px rgba(147, 51, 234, 0.6)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `
                      linear-gradient(45deg, 
                        transparent 30%, 
                        rgba(255, 255, 255, 0.3) 50%, 
                        transparent 70%
                      )
                    `
                  }}
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="relative flex items-center space-x-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🎬
                  </motion.div>
                  <span>Join the Watch Party</span>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* 🏆 Prestigious Leaderboard - Hall of Fame Design */}
        <div className="relative mb-20">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Glassmorphic Container */}
          <div 
            className="relative rounded-2xl overflow-hidden p-8"
            style={{
              background: `
                linear-gradient(135deg, rgba(230, 230, 250, 0.3) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(99, 102, 241, 0.2) 100%),
                rgba(255, 255, 255, 0.1)
              `,
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 25px 50px rgba(147, 51, 234, 0.15),
                0 0 80px rgba(230, 230, 250, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `
            }}
          >
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(45deg, rgba(255, 215, 0, 0.6), rgba(147, 51, 234, 0.4))',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Prismatic Light Edges */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-30"
              style={{
                background: `
                  linear-gradient(45deg, 
                    transparent 0%, 
                    rgba(255, 0, 150, 0.1) 25%, 
                    rgba(0, 255, 255, 0.1) 50%, 
                    rgba(255, 255, 0, 0.1) 75%, 
                    transparent 100%
                  )
                `
              }}
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Header - Hall of Fame Style */}
            <motion.div 
              className="text-center mb-10 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {/* Gradient Crown Icon */}
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Crown 
                  className="w-12 h-12"
                  style={{
                    background: 'linear-gradient(135deg, #E6E6FA 0%, #FFD700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.3))'
                  }}
                />
              </motion.div>
              
              {/* Title */}
              <motion.h2 
                className="text-4xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #E6E6FA 0%, #6d28d9 50%, #9333EA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 2px 4px rgba(147, 51, 234, 0.3))'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Leaderboard
              </motion.h2>
              
              {/* Subtitle */}
              <p className="text-lg text-gray-600/90 font-medium mb-6">
                This Week's Top Wizards & Creators
              </p>

              {/* Pill Toggle Tabs */}
              <div 
                className="inline-flex p-2 rounded-full"
                style={{
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(230, 230, 250, 0.1) 100%),
                    rgba(0, 0, 0, 0.1)
                  `,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `
                    0 8px 32px rgba(147, 51, 234, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                  `
                }}
              >
                {[{ id: 'creators', label: 'Creators', icon: Trophy }, { id: 'wizards', label: 'Wizards', icon: Zap }].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setLeaderboardTab(tab.id)}
                    className={`
                      relative px-8 py-3 text-sm font-semibold rounded-full transition-all duration-300 z-10
                      ${leaderboardTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                      }
                    `}
                    style={{ minWidth: '120px' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Glowing Active Background */}
                    {leaderboardTab === tab.id && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `
                            linear-gradient(135deg, 
                              rgba(147, 51, 234, 0.9) 0%, 
                              rgba(99, 102, 241, 0.8) 50%, 
                              rgba(139, 92, 246, 0.9) 100%
                            )
                          `,
                          boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        }}
                        layoutId="activeLeaderboardTab"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25
                        }}
                      />
                    )}
                    
                    {/* Shimmer Effect */}
                    {leaderboardTab === tab.id && (
                      <motion.div
                        className="absolute inset-0 rounded-full overflow-hidden"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 4,
                          ease: "easeInOut"
                        }}
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
                        }}
                      />
                    )}
                    
                    {/* Tab Content */}
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      <motion.div
                        animate={leaderboardTab === tab.id ? { 
                          scale: [1, 1.1, 1],
                          rotate: [0, 3, -3, 0]
                        } : {}}
                        transition={leaderboardTab === tab.id ? { 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        } : {}}
                      >
                        <tab.icon className="w-4 h-4" />
                      </motion.div>
                      <span className="font-semibold">{tab.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Leaderboard Cards */}
            <div className="space-y-3 relative z-10">
              {leaderboardTab === 'creators' && topCreators.map((creator, index) => (
                <motion.div
                  key={creator.rank}
                  className="group relative"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1.0 + index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                >
                  {/* Rank Card */}
                  <div
                    className="relative p-5 rounded-xl overflow-hidden transition-all duration-300"
                    style={{
                      background: creator.rank === 1
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)'
                        : creator.rank === 2
                        ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(169, 169, 169, 0.08) 100%)'
                        : creator.rank === 3
                        ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(184, 115, 51, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(230, 230, 250, 0.05) 100%)',
                      backdropFilter: 'blur(15px)',
                      border: creator.rank <= 3
                        ? `1px solid ${
                            creator.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                            creator.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                            'rgba(205, 127, 50, 0.3)'
                          }`
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: creator.rank <= 3
                        ? `0 4px 20px ${
                            creator.rank === 1 ? 'rgba(255, 215, 0, 0.1)' :
                            creator.rank === 2 ? 'rgba(192, 192, 192, 0.1)' :
                            'rgba(205, 127, 50, 0.1)'
                          }`
                        : '0 4px 20px rgba(147, 51, 234, 0.05)'
                    }}
                  >
                    {/* Hover Glass Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                        borderRadius: '12px'
                      }}
                    />

                    <div className="flex items-center justify-between relative z-10">
                      {/* Left: Rank + Avatar + Info */}
                      <div className="flex items-center gap-4">
                        {/* Ranking Badge */}
                        <motion.div 
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {creator.rank === 1 ? (
                            <motion.div
                              className="relative"
                              animate={{ 
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Crown 
                                className="w-10 h-10"
                                style={{
                                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text',
                                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))'
                                }}
                              />
                              {/* Glowing Aura */}
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                                  transform: 'scale(1.5)'
                                }}
                                animate={{ 
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            </motion.div>
                          ) : creator.rank === 2 ? (
                            <Medal 
                              className="w-10 h-10"
                              style={{
                                background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.5))'
                              }}
                            />
                          ) : creator.rank === 3 ? (
                            <Trophy 
                              className="w-10 h-10"
                              style={{
                                background: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 0 8px rgba(205, 127, 50, 0.5))'
                              }}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                              style={{
                                background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)'
                              }}
                            >
                              {creator.rank}
                            </div>
                          )}
                        </motion.div>

                        {/* Avatar */}
                        <motion.div
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div
                            className="w-16 h-16 rounded-full border-2 border-white/40 shadow-lg"
                            style={{
                              boxShadow: creator.rank <= 3
                                ? `0 0 15px ${
                                    creator.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                                    creator.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                                    'rgba(205, 127, 50, 0.3)'
                                  }`
                                : '0 0 10px rgba(147, 51, 234, 0.2)'
                            }}
                          >
                            <Avatar className="w-full h-full">
                              <AvatarImage src={creator.avatar} alt={creator.name} />
                              <AvatarFallback
                                className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl"
                                style={{
                                  background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)'
                                }}
                              >
                                {creator.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>

                        {/* User Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-800 truncate">
                              {creator.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            @{creator.name.toLowerCase().replace(/\s+/g, '')}
                          </p>
                        </div>
                      </div>

                      {/* Right: XP with Animated Shimmer */}
                      <motion.div
                        className="text-right flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="text-2xl font-bold mb-1 relative"
                          style={{
                            background: creator.rank <= 3
                              ? `linear-gradient(135deg, ${
                                  creator.rank === 1 ? '#FFD700, #FFA500' :
                                  creator.rank === 2 ? '#C0C0C0, #A8A8A8' :
                                  '#CD7F32, #B8860B'
                                })`
                              : 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          {creator.xp.toLocaleString()}
                          
                          {/* Animated Shimmer */}
                          <motion.div
                            className="absolute inset-0 opacity-20"
                            style={{
                              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%)'
                            }}
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 4,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                        <div className="text-sm text-gray-500 font-medium">XP</div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {leaderboardTab === 'wizards' && topWizards.map((wizard, index) => (
                <motion.div
                  key={wizard.rank}
                  className="group relative"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 1.0 + index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                >
                  {/* Rank Card */}
                  <div
                    className="relative p-5 rounded-xl overflow-hidden transition-all duration-300"
                    style={{
                      background: wizard.rank === 1
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)'
                        : wizard.rank === 2
                        ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(169, 169, 169, 0.08) 100%)'
                        : wizard.rank === 3
                        ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(184, 115, 51, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(230, 230, 250, 0.05) 100%)',
                      backdropFilter: 'blur(15px)',
                      border: wizard.rank <= 3
                        ? `1px solid ${
                            wizard.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                            wizard.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                            'rgba(205, 127, 50, 0.3)'
                          }`
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: wizard.rank <= 3
                        ? `0 4px 20px ${
                            wizard.rank === 1 ? 'rgba(255, 215, 0, 0.1)' :
                            wizard.rank === 2 ? 'rgba(192, 192, 192, 0.1)' :
                            'rgba(205, 127, 50, 0.1)'
                          }`
                        : '0 4px 20px rgba(147, 51, 234, 0.05)'
                    }}
                  >
                    {/* Hover Glass Effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                        borderRadius: '12px'
                      }}
                    />

                    <div className="flex items-center justify-between relative z-10">
                      {/* Left: Rank + Avatar + Info */}
                      <div className="flex items-center gap-4">
                        {/* Ranking Badge */}
                        <motion.div 
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {wizard.rank === 1 ? (
                            <motion.div
                              className="relative"
                              animate={{ 
                                scale: [1, 1.05, 1]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <Crown 
                                className="w-10 h-10"
                                style={{
                                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent',
                                  backgroundClip: 'text',
                                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))'
                                }}
                              />
                              {/* Glowing Aura */}
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                                  transform: 'scale(1.5)'
                                }}
                                animate={{ 
                                  opacity: [0.3, 0.6, 0.3]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            </motion.div>
                          ) : wizard.rank === 2 ? (
                            <Medal 
                              className="w-10 h-10"
                              style={{
                                background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 0 8px rgba(192, 192, 192, 0.5))'
                              }}
                            />
                          ) : wizard.rank === 3 ? (
                            <Trophy 
                              className="w-10 h-10"
                              style={{
                                background: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: 'drop-shadow(0 0 8px rgba(205, 127, 50, 0.5))'
                              }}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                              style={{
                                background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)'
                              }}
                            >
                              {wizard.rank}
                            </div>
                          )}
                        </motion.div>

                        {/* Avatar */}
                        <motion.div
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div
                            className="w-16 h-16 rounded-full border-2 border-white/40 shadow-lg"
                            style={{
                              boxShadow: wizard.rank <= 3
                                ? `0 0 15px ${
                                    wizard.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                                    wizard.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                                    'rgba(205, 127, 50, 0.3)'
                                  }`
                                : '0 0 10px rgba(147, 51, 234, 0.2)'
                            }}
                          >
                            <Avatar className="w-full h-full">
                              <AvatarImage src={wizard.avatar} alt={wizard.name} />
                              <AvatarFallback
                                className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl"
                                style={{
                                  background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)'
                                }}
                              >
                                {wizard.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>

                        {/* User Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-800 truncate">
                              {wizard.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            @{wizard.name.toLowerCase().replace(/\s+/g, '')}
                          </p>
                        </div>
                      </div>

                      {/* Right: XP with Animated Shimmer */}
                      <motion.div
                        className="text-right flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div 
                          className="text-2xl font-bold mb-1 relative"
                          style={{
                            background: wizard.rank <= 3
                              ? `linear-gradient(135deg, ${
                                  wizard.rank === 1 ? '#FFD700, #FFA500' :
                                  wizard.rank === 2 ? '#C0C0C0, #A8A8A8' :
                                  '#CD7F32, #B8860B'
                                })`
                              : 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          {wizard.xp.toLocaleString()}
                          
                          {/* Animated Shimmer */}
                          <motion.div
                            className="absolute inset-0 opacity-20"
                            style={{
                              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%)'
                            }}
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 4,
                              ease: "easeInOut"
                            }}
                          />
                        </motion.div>
                        <div className="text-sm text-gray-500 font-medium">XP</div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        </div>

      {/* Video Panel - Clean Dark Design */}
      <VideoPanel
        videoId={selectedVideo?.videoId || ''}
        title={selectedVideo?.title || ''}
        creator={selectedVideo?.creator || ''}
        xpReward={selectedVideo?.xpReward || 0}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onReward={(xp: number) => {
          console.log(`🎯 Earned ${xp} XP for watching ${selectedVideo?.title}`);
        }}
      />
      </div>
    </div>
  );
};