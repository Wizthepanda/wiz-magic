import { useState } from 'react';
import { Play, Eye, Heart, Share2, CheckCircle, Zap, ChevronLeft, ChevronRight, Crown, Medal, Trophy, Star, Users, Award } from 'lucide-react';
import { WizVideoPlayer } from './wiz-video-player';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    title: 'Master AI Prompting in 2024',
    creator: 'AIGuru42',
    avatar: '',
    thumbnail: '',
    duration: '12:45',
    xpReward: 150,
    category: 'ai',
    categoryLabel: 'AI',
    views: '45K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
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



// Creators data with placeholder images
const creators = [
  {
    id: 1,
    name: 'AIGuru42',
    username: '@aiguru42',
    followers: '125K',
    videos: 89,
    totalViews: '2.3M',
    specialty: 'AI & Machine Learning',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    verified: true,
    rating: 4.9
  },
  {
    id: 2,
    name: 'MoneyWizard',
    username: '@moneywizard',
    followers: '89K',
    videos: 156,
    totalViews: '1.8M',
    specialty: 'Finance & Investment',
    thumbnail: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=300&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop',
    verified: true,
    rating: 4.7
  },
  {
    id: 3,
    name: 'CodeMaster',
    username: '@codemaster',
    followers: '203K',
    videos: 234,
    totalViews: '4.1M',
    specialty: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    verified: true,
    rating: 4.8
  },
  {
    id: 4,
    name: 'BeatCreator',
    username: '@beatcreator',
    followers: '67K',
    videos: 78,
    totalViews: '1.2M',
    specialty: 'Music Production',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
    verified: true,
    rating: 4.6
  },
  {
    id: 5,
    name: 'HealthGuru',
    username: '@healthguru',
    followers: '145K',
    videos: 198,
    totalViews: '3.2M',
    specialty: 'Health & Fitness',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    verified: true,
    rating: 4.9
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
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Category Filter with Subtle Dots */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={`${activeCategory === category.id ? category.color : ''} transition-all duration-200 flex items-center gap-2 text-sm h-8 px-3`}
            >
              <div className={`w-2 h-2 rounded-full ${category.dotColor}`} />
              {category.label}
            </Button>
          ))}
        </div>

        {/* Discover Content - 8 Panels with Horizontal Scrolling */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">Discover Content</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('discover-container');
                  if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                }}
                className="h-10 w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('discover-container');
                  if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                }}
                className="h-10 w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div
            id="discover-container"
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
                        {filteredVideos.map((video) => (
              <div key={video.id} className="flex-shrink-0 w-80 group">
                <Card className="h-96 overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
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

        {/* Most Viewed Section - VIP Style */}
        <div className="relative mb-12">
          {/* VIP Background with Particles */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 50%, rgba(30, 41, 59, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          />
          
          {/* Floating Particles for VIP Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                <div className="w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-70" />
              </div>
            ))}
          </div>

          <div className="relative z-10 p-8 space-y-8">
            {/* VIP Section Title */}
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                Most Viewed
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full" />
              <p className="text-lg text-gray-300">
                🔥 The content everyone is watching right now
              </p>
            </div>

            {/* Most Viewed Cards - Horizontal Scroll */}
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const container = document.getElementById('most-viewed-container');
                      if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                    }}
                    className="h-10 w-10 p-0 bg-yellow-400/10 border-yellow-400/30 hover:bg-yellow-400/20 text-yellow-400 rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const container = document.getElementById('most-viewed-container');
                      if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                    }}
                    className="h-10 w-10 p-0 bg-yellow-400/10 border-yellow-400/30 hover:bg-yellow-400/20 text-yellow-400 rounded-full"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div
                id="most-viewed-container"
                className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {videos.slice(0, 6).map((video, index) => (
                  <div key={`mv-${video.id}`} className="flex-shrink-0 w-80 group">
                    <Card className="h-96 overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                          style={{
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
                            backdropFilter: 'blur(15px)',
                            border: '1.5px solid rgba(255, 215, 0, 0.3)',
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                          }}>
                      <CardContent className="p-0 h-full flex flex-col">
                        {/* VIP Thumbnail Section */}
                        <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden"
                             style={{ borderRadius: '20px 20px 0 0' }}>
                          
                          {/* VIP Ribbon */}
                          {index < 3 && (
                            <div className="absolute top-3 left-3 z-30">
                              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold"
                                   style={{
                                     background: index === 0 ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                                                index === 1 ? 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)' :
                                                'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
                                     color: '#000',
                                     boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
                                   }}>
                                <Crown className="w-3 h-3" />
                                <span>#{index + 1}</span>
                              </div>
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute top-3 right-3 z-20">
                            <Badge className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                                   style={{
                                     background: getCategoryGradient(video.category),
                                     borderRadius: '12px',
                                     boxShadow: getCategoryShadow(video.category)
                                   }}>
                              {video.categoryLabel}
                            </Badge>
                          </div>

                          {/* XP Badge */}
                          <div className="absolute bottom-3 left-3 z-20">
                            <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold"
                                 style={{
                                   background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%)',
                                   color: '#1F2937',
                                   boxShadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
                                 }}>
                              <Zap className="w-3 h-3" />
                              <span>{video.xpReward}</span>
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="absolute bottom-3 right-3 z-20 px-2 py-1 bg-black/80 rounded-lg text-xs text-white font-semibold">
                            {video.duration}
                          </div>

                          {/* VIP Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                              size="lg"
                              onClick={() => handleWatchVideo(video.id)}
                              className="h-16 w-16 rounded-full p-0 text-yellow-600 shadow-2xl hover:scale-110 transition-transform duration-300"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95) 0%, rgba(255, 165, 0, 0.95) 100%)',
                                backdropFilter: 'blur(10px)'
                              }}
                            >
                              <Play className="w-7 h-7 ml-0.5" fill="currentColor" />
                            </Button>
                          </div>

                          {/* Dark Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        </div>

                        {/* VIP Content Section */}
                        <div className="flex-1 p-5 flex flex-col">
                          <h4 className="font-bold text-lg text-white line-clamp-2 mb-3 group-hover:text-yellow-400 transition-colors leading-tight">
                            {video.title}
                          </h4>
                          
                          <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                            <span className="font-medium text-gray-200">{video.creator}</span>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{video.views}</span>
                            </div>
                          </div>
                          
                          {/* VIP Action Button */}
                          <div className="mt-auto">
                            <Button 
                              className="w-full font-semibold text-black shadow-lg hover:shadow-xl transition-all duration-300"
                              style={{
                                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                borderRadius: '12px'
                              }}
                              onClick={() => handleWatchVideo(video.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Watch Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meet the Creators Section - Horizontal Card Stack with Vertical Tiles */}
        <div className="relative">
          {/* Glassmorphism Background */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"
            style={{
              backdropFilter: 'blur(20px)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          />
          <div className="relative z-10 p-8 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-wiz-primary via-wiz-secondary to-wiz-accent bg-clip-text text-transparent">
                Meet the Creators
              </h2>
              <p className="text-xl text-muted-foreground italic font-medium">
                Behind the epic content of WIZ
              </p>
            </div>

            {/* Horizontal Scrolling Creator Cards */}
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const container = document.getElementById('creators-container');
                      if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                    }}
                    className="h-10 w-10 p-0 hover:bg-wiz-primary/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const container = document.getElementById('creators-container');
                      if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                    }}
                    className="h-10 w-10 p-0 hover:bg-wiz-primary/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div
                id="creators-container"
                className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {creators.map((creator) => (
                  <div
                    key={creator.id}
                    className="flex-shrink-0 w-72 group cursor-pointer"
                  >
                    <Card
                      className="h-96 relative overflow-hidden border-0 shadow-2xl group-hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.15) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <CardContent className="p-0 h-full">
                        {/* Thumbnail Image */}
                        <div 
                          className="h-64 bg-cover bg-center relative"
                          style={{ backgroundImage: `url(${creator.thumbnail})` }}
                        >
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Verified Badge */}
                          {creator.verified && (
                            <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* Hover Overlay with Profile Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12 border-2 border-white">
                                <AvatarImage src={creator.avatar} alt={creator.name} />
                                <AvatarFallback className="bg-wiz-primary text-white">
                                  {creator.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-bold text-white">{creator.name}</h3>
                                <p className="text-white/80 text-sm">{creator.username}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Creator Stats */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {creator.name}
                              </h3>
                              <p className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {creator.specialty}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-semibold">{creator.rating}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div>
                              <div className="font-bold text-wiz-primary">{creator.followers}</div>
                              <div className="text-xs text-muted-foreground">Followers</div>
                            </div>
                            <div>
                              <div className="font-bold text-wiz-secondary">{creator.videos}</div>
                              <div className="text-xs text-muted-foreground">Videos</div>
                            </div>
                            <div>
                              <div className="font-bold text-wiz-accent">{creator.totalViews}</div>
                              <div className="text-xs text-muted-foreground">Views</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* WIZ Premiere Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="px-8 py-3 bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-secondary hover:to-wiz-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Crown className="w-5 h-5 mr-2" />
                Explore WIZ Premiere
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Leaderboard Section with Equal Sizing */}
        <div className="relative">
          {/* Glassmorphism Background */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"
            style={{
              backdropFilter: 'blur(20px)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          />
          <div className="relative z-10 p-8 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-wiz-primary via-wiz-secondary to-wiz-accent bg-clip-text text-transparent">
                Leaderboard
              </h2>
              {/* Enhanced Leaderboard Tabs */}
              <div className="flex justify-center">
                <div
                  className="inline-flex p-1 rounded-xl border border-white/20"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <button
                    onClick={() => setLeaderboardTab('creators')}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                      leaderboardTab === 'creators'
                        ? 'bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-lg transform scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }`}
                  >
                    🏆 Top Creators
                  </button>
                  <button
                    onClick={() => setLeaderboardTab('wizards')}
                    className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
                      leaderboardTab === 'wizards'
                        ? 'bg-gradient-to-r from-wiz-secondary to-wiz-magic text-white shadow-lg transform scale-105'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                    }`}
                  >
                    ⚡ Top Wizards
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Leaderboard Content - Equal Sizing */}
            <div className="space-y-6">
              {leaderboardTab === 'creators' && (
                <div className="space-y-4">
                  {topCreators.map((creator, index) => (
                    <Card
                      key={creator.rank}
                      className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
                      style={{
                        background: creator.rank <= 3
                          ? `linear-gradient(135deg, ${
                              creator.rank === 1 ? 'rgba(255, 215, 0, 0.15)' :
                              creator.rank === 2 ? 'rgba(192, 192, 192, 0.15)' :
                              'rgba(205, 127, 50, 0.15)'
                            } 0%, rgba(255, 255, 255, 0.05) 50%, ${
                              creator.rank === 1 ? 'rgba(255, 215, 0, 0.15)' :
                              creator.rank === 2 ? 'rgba(192, 192, 192, 0.15)' :
                              'rgba(205, 127, 50, 0.15)'
                            } 100%)`
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: creator.rank <= 3
                          ? `1px solid ${
                              creator.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                              creator.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                              'rgba(205, 127, 50, 0.3)'
                            }`
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: creator.rank <= 3
                          ? `0 8px 32px ${
                              creator.rank === 1 ? 'rgba(255, 215, 0, 0.2)' :
                              creator.rank === 2 ? 'rgba(192, 192, 192, 0.2)' :
                              'rgba(205, 127, 50, 0.2)'
                            }, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                          : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          {/* Rank Badge */}
                          <div className="relative">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 border border-white/30">
                              {getRankIcon(creator.rank)}
                            </div>
                            {creator.rank === 1 && (
                              <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/20"></div>
                            )}
                          </div>

                          {/* Creator Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold truncate">{creator.name}</h3>
                              <Badge 
                                variant="secondary" 
                                className="bg-wiz-primary/20 text-wiz-primary border-wiz-primary/30"
                              >
                                Lv{creator.level}
                              </Badge>
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{creator.specialty}</p>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="font-semibold text-wiz-primary">{creator.videos}</div>
                                <div className="text-muted-foreground">Videos</div>
                              </div>
                              <div>
                                <div className="font-semibold text-wiz-secondary">{creator.views}</div>
                                <div className="text-muted-foreground">Views</div>
                              </div>
                              <div>
                                <div className="font-semibold text-wiz-accent">{creator.xp.toLocaleString()}</div>
                                <div className="text-muted-foreground">Total XP</div>
                              </div>
                            </div>
                          </div>

                          {/* XP Progress */}
                          <div className="text-right space-y-2">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-5 h-5 text-wiz-accent" />
                              <span className="text-2xl font-bold">{creator.xp.toLocaleString()}</span>
                            </div>
                            <div className="w-32">
                              <Progress 
                                value={(creator.xp / 150000) * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {leaderboardTab === 'wizards' && (
                <div className="space-y-4">
                  {topWizards.map((wizard, index) => (
                    <Card
                      key={wizard.rank}
                      className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
                      style={{
                        background: wizard.rank <= 3
                          ? `linear-gradient(135deg, ${
                              wizard.rank === 1 ? 'rgba(255, 215, 0, 0.15)' :
                              wizard.rank === 2 ? 'rgba(192, 192, 192, 0.15)' :
                              'rgba(205, 127, 50, 0.15)'
                            } 0%, rgba(255, 255, 255, 0.05) 50%, ${
                              wizard.rank === 1 ? 'rgba(255, 215, 0, 0.15)' :
                              wizard.rank === 2 ? 'rgba(192, 192, 192, 0.15)' :
                              'rgba(205, 127, 50, 0.15)'
                            } 100%)`
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: wizard.rank <= 3
                          ? `1px solid ${
                              wizard.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                              wizard.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                              'rgba(205, 127, 50, 0.3)'
                            }`
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: wizard.rank <= 3
                          ? `0 8px 32px ${
                              wizard.rank === 1 ? 'rgba(255, 215, 0, 0.2)' :
                              wizard.rank === 2 ? 'rgba(192, 192, 192, 0.2)' :
                              'rgba(205, 127, 50, 0.2)'
                            }, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                          : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          {/* Rank Badge */}
                          <div className="relative">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 border border-white/30">
                              {getRankIcon(wizard.rank)}
                            </div>
                            {wizard.rank === 1 && (
                              <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/20"></div>
                            )}
                          </div>

                          {/* Avatar */}
                          <Avatar className="w-16 h-16 border-2 border-wiz-secondary/30">
                            <AvatarFallback className="bg-gradient-to-r from-wiz-secondary to-wiz-magic text-white font-bold text-lg">
                              {wizard.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Wizard Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold truncate">{wizard.name}</h3>
                              <Badge 
                                variant="secondary" 
                                className="bg-wiz-secondary/20 text-wiz-secondary border-wiz-secondary/30"
                              >
                                Lv{wizard.level}
                              </Badge>
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="font-semibold text-wiz-primary">{wizard.watchTime}</div>
                                <div className="text-muted-foreground">Watch Time</div>
                              </div>
                              <div>
                                <div className="font-semibold text-wiz-secondary">{wizard.streak} days</div>
                                <div className="text-muted-foreground">Streak</div>
                              </div>
                              <div>
                                <div className="font-semibold text-wiz-accent">{wizard.xp.toLocaleString()}</div>
                                <div className="text-muted-foreground">Total XP</div>
                              </div>
                            </div>
                          </div>

                          {/* XP Progress */}
                          <div className="text-right space-y-2">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-5 h-5 text-wiz-accent" />
                              <span className="text-2xl font-bold">{wizard.xp.toLocaleString()}</span>
                            </div>
                            <div className="w-32">
                              <Progress 
                                value={(wizard.xp / 50000) * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="px-6 pb-6">
              <WizVideoPlayer
                videoId={selectedVideo.videoId}
                title={selectedVideo.title}
                creator={selectedVideo.creator}
                xpReward={selectedVideo.xpReward}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};