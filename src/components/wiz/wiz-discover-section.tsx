import { useState } from 'react';
import { Play, Eye, Heart, Share2, CheckCircle, Zap, ChevronLeft, ChevronRight, Crown, Medal, Trophy } from 'lucide-react';
import { WizVideoPlayer } from './wiz-video-player';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const categories = [
  { id: 'all', label: 'All', color: 'bg-wiz-primary' },
  { id: 'ai', label: 'AI', color: 'bg-wiz-secondary' },
  { id: 'tech', label: 'Tech', color: 'bg-wiz-accent' },
  { id: 'music', label: 'Music', color: 'bg-wiz-magic' },
  { id: 'money', label: 'Money', color: 'bg-emerald-500' },
  { id: 'health', label: 'Health', color: 'bg-rose-500' },
];

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
    views: '56K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: true
  },
  // Additional dynamic content
  {
    id: 5,
    title: 'Advanced Machine Learning Techniques',
    creator: 'MLExpert',
    avatar: '',
    thumbnail: '',
    duration: '25:40',
    xpReward: 320,
    category: 'ai',
    views: '89K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
    isNew: true
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
    views: '67K',
    watched: false,
    progress: 30,
    videoId: 'jNQXAC9IVRw',
    isNew: false
  },
  {
    id: 7,
    title: 'Next.js 14 Complete Guide',
    creator: 'WebDevPro',
    avatar: '',
    thumbnail: '',
    duration: '28:12',
    xpReward: 350,
    category: 'tech',
    views: '43K',
    watched: false,
    progress: 0,
    videoId: 'ScMzIvxBSi4',
    isNew: true
  },
  {
    id: 8,
    title: 'Electronic Music Composition',
    creator: 'SynthMaster',
    avatar: '',
    thumbnail: '',
    duration: '31:20',
    xpReward: 380,
    category: 'music',
    views: '29K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: false
  }
];

// Creators data for Meet the Creators section
const creators = [
  {
    id: 1,
    name: 'AIGuru42',
    bio: 'AI & Machine Learning Expert with 10+ years experience',
    avatar: '',
    videos: 127,
    views: '2.4M',
    specialization: 'Artificial Intelligence',
    gradient: 'from-purple-500 to-blue-600'
  },
  {
    id: 2,
    name: 'MoneyWizard',
    bio: 'Financial strategist and investment advisor',
    avatar: '',
    videos: 89,
    views: '1.8M',
    specialization: 'Finance & Investing',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 3,
    name: 'CodeMaster',
    bio: 'Full-stack developer and tech educator',
    avatar: '',
    videos: 156,
    views: '2.1M',
    specialization: 'Web Development',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 4,
    name: 'BeatCreator',
    bio: 'Music producer and audio engineering expert',
    avatar: '',
    videos: 98,
    views: '1.5M',
    specialization: 'Music Production',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: 5,
    name: 'HealthHero',
    bio: 'Wellness coach and nutrition specialist',
    avatar: '',
    videos: 76,
    views: '1.2M',
    specialization: 'Health & Wellness',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 6,
    name: 'TechGuru',
    bio: 'Technology reviewer and innovation expert',
    avatar: '',
    videos: 134,
    views: '1.9M',
    specialization: 'Technology Reviews',
    gradient: 'from-orange-500 to-red-600'
  }
];

// Leaderboard data
const topCreators = [
  { rank: 1, name: 'AIGuru42', xp: 125000, videos: 127, badge: 'XP Sorcerer' },
  { rank: 2, name: 'CodeMaster', xp: 98500, videos: 156, badge: 'Content Guru' },
  { rank: 3, name: 'MoneyWizard', xp: 87200, videos: 89, badge: 'Wealth Sage' },
  { rank: 4, name: 'BeatCreator', xp: 76800, videos: 98, badge: 'Audio Master' },
  { rank: 5, name: 'HealthHero', xp: 65400, videos: 76, badge: 'Wellness Wizard' }
];

const topWizards = [
  { rank: 1, name: 'WizMaster101', xp: 45000, level: 8, watchTime: '245h', streak: 89 },
  { rank: 2, name: 'KnowledgeSeeker', xp: 38900, level: 7, watchTime: '198h', streak: 76 },
  { rank: 3, name: 'CuriosityQueen', xp: 34200, level: 6, watchTime: '167h', streak: 64 },
  { rank: 4, name: 'BrainBooster', xp: 29800, level: 6, watchTime: '145h', streak: 52 },
  { rank: 5, name: 'SmartStudent', xp: 26500, level: 5, watchTime: '134h', streak: 43 }
];

export const WizDiscoverSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [watchedVideos, setWatchedVideos] = useState<number[]>([3]);
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);
  const [creatorScrollPosition, setCreatorScrollPosition] = useState(0);
  const [leaderboardTab, setLeaderboardTab] = useState<'creators' | 'wizards'>('creators');
  const { user } = useAuth();

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const handleWatchVideo = (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
    }
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  const scrollCreators = (direction: 'left' | 'right') => {
    const container = document.getElementById('creators-container');
    if (container) {
      const scrollAmount = 320; // Width of one card plus gap
      const newPosition = direction === 'left' 
        ? Math.max(0, creatorScrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, creatorScrollPosition + scrollAmount);
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setCreatorScrollPosition(newPosition);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default: return 'from-muted/20 to-muted/10 border-border/50';
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Category Bubbles */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`
                relative overflow-hidden transition-all duration-300
                ${selectedCategory === category.id 
                  ? 'neon-glow bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white' 
                  : 'hover:bg-wiz-primary/10 hover:border-wiz-primary/30'
                }
              `}
            >
              <div className={`w-2 h-2 rounded-full ${category.color} mr-2`} />
              {category.label}
              {selectedCategory === category.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-wiz-accent/20 to-transparent" />
              )}
            </Button>
          ))}
        </div>

      {/* Main Video Grid - Discover Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.slice(0, 4).map((video) => {
            const isWatched = watchedVideos.includes(video.id);
            const hasProgress = video.progress > 0 && video.progress < 100;
            
            return (
              <Card 
                key={video.id} 
                className={`video-card glass-card border-card-border group overflow-hidden transition-all duration-300 hover:scale-[1.02] ${video.isNew ? 'ring-2 ring-wiz-primary/50 shadow-lg shadow-wiz-primary/20' : ''}`}
              >
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                    
                    {/* New Content Glow */}
                    {video.isNew && (
                      <div className="absolute inset-0 bg-gradient-to-r from-wiz-primary/20 to-wiz-secondary/20 z-5" />
                    )}
                    
                    {/* Circular Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="lg"
                        onClick={() => handleWatchVideo(video.id)}
                        className="h-16 w-16 rounded-full p-0 bg-white/90 hover:bg-white text-wiz-primary hover:text-wiz-secondary shadow-2xl"
                      >
                        {isWatched ? (
                          <CheckCircle className="w-6 h-6" fill="currentColor" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" fill="currentColor" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Duration */}
                    <div className="absolute bottom-2 right-2 z-20 px-2 py-1 bg-black/70 rounded text-xs text-white">
                      {video.duration}
                    </div>
                    
                    {/* XP Reward */}
                    <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 px-2 py-1 bg-wiz-primary/80 backdrop-blur-sm rounded-full">
                      <Zap className="w-3 h-3 text-wiz-accent" />
                      <span className="text-xs font-bold text-white">{video.xpReward}</span>
                    </div>
                    
                    {/* New Badge */}
                    {video.isNew && (
                      <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-gradient-to-r from-wiz-accent to-wiz-secondary text-white text-xs font-bold rounded-full animate-pulse">
                        NEW
                      </div>
                    )}
                    
                    {/* Progress Bar */}
                    {hasProgress && (
                      <div className="absolute bottom-0 left-0 right-0 z-20">
                        <Progress value={video.progress} className="h-1 bg-transparent" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-wiz-primary transition-colors">
                      {video.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={video.avatar} />
                          <AvatarFallback className="text-xs bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white">
                            {video.creator.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{video.creator}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{video.views}</span>
                      </div>
                    </div>
                    
                    {/* XP Progress for watched content */}
                    {isWatched && (
                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">XP Earned</span>
                          <span className="font-bold text-wiz-primary">+{video.xpReward} XP</span>
                        </div>
                        <div className="xp-progress h-2 bg-wiz-primary/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-wiz-primary to-wiz-secondary rounded-full w-full animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Dynamic Content Rows */}
        <div className="space-y-8">
          {/* Row 1: AI & Tech Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">AI & Technology</h3>
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {videos.filter(v => v.category === 'ai' || v.category === 'tech').map((video) => (
                  <div key={`ai-tech-${video.id}`} className="flex-shrink-0 w-72">
                    <Card className="video-card glass-card border-card-border group overflow-hidden hover:scale-[1.02] transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
                          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              size="lg"
                              onClick={() => handleWatchVideo(video.id)}
                              className="h-12 w-12 rounded-full p-0 bg-white/90 hover:bg-white text-wiz-primary"
                            >
                              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 right-2 z-20 px-2 py-1 bg-black/70 rounded text-xs text-white">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm line-clamp-2 mb-2">{video.title}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{video.creator}</span>
                            <span>{video.views}</span>
                          </div>
                          {video.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={video.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Money & Health Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Finance & Wellness</h3>
            <div className="relative">
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {videos.filter(v => v.category === 'money' || v.category === 'health').map((video) => (
                  <div key={`money-health-${video.id}`} className="flex-shrink-0 w-72">
                    <Card className="video-card glass-card border-card-border group overflow-hidden hover:scale-[1.02] transition-all duration-300">
                      <CardContent className="p-0">
                        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50">
                          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              size="lg"
                              onClick={() => handleWatchVideo(video.id)}
                              className="h-12 w-12 rounded-full p-0 bg-white/90 hover:bg-white text-wiz-primary"
                            >
                              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                            </Button>
                          </div>
                          <div className="absolute bottom-2 right-2 z-20 px-2 py-1 bg-black/70 rounded text-xs text-white">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm line-clamp-2 mb-2">{video.title}</h4>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{video.creator}</span>
                            <span>{video.views}</span>
                          </div>
                          {video.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={video.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Creators Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">Meet the Creators</h2>
          <p className="text-lg text-muted-foreground italic">Behind the epic AI animation of WIZ</p>
        </div>

        {/* Creator Cards with Navigation */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollCreators('left')}
              className="z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollCreators('right')}
              className="z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div 
            id="creators-container"
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="flex-shrink-0 w-80 group cursor-pointer"
              >
                <Card className="h-full bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-2 border-transparent hover:border-wiz-primary/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
                  <CardContent className="p-6 space-y-4">
                    {/* Creator Avatar */}
                    <div className="flex items-center space-x-4">
                      <div 
                        className={`w-16 h-16 rounded-full bg-gradient-to-r ${creator.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="text-white font-bold text-xl">
                          {creator.name.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-wiz-primary transition-colors">
                          {creator.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{creator.specialization}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {creator.bio}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-wiz-primary/10 rounded-xl">
                        <div className="text-xl font-bold text-wiz-primary">{creator.videos}</div>
                        <div className="text-xs text-gray-600">Videos</div>
                      </div>
                      <div className="text-center p-3 bg-wiz-secondary/10 rounded-xl">
                        <div className="text-xl font-bold text-wiz-secondary">{creator.views}</div>
                        <div className="text-xs text-gray-600">Views</div>
                      </div>
                    </div>

                    {/* Hidden hover info */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Join Date: Jan 2023</div>
                        <div>Avg Rating: 4.9/5</div>
                      </div>
                      <Button size="sm" className="w-full">
                        View Profile
                      </Button>
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

      {/* Leaderboard Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Leaderboard</h2>
          
          {/* Leaderboard Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-muted/30 rounded-lg p-1">
              <button
                onClick={() => setLeaderboardTab('creators')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  leaderboardTab === 'creators'
                    ? 'bg-wiz-primary text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Top Creators
              </button>
              <button
                onClick={() => setLeaderboardTab('wizards')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  leaderboardTab === 'wizards'
                    ? 'bg-wiz-secondary text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Top Wizards
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="max-w-4xl mx-auto">
          {leaderboardTab === 'creators' && (
            <div className="space-y-4">
              {topCreators.map((creator) => (
                <Card 
                  key={creator.rank} 
                  className={`glass-card border bg-gradient-to-r ${getRankColor(creator.rank)} hover:scale-[1.02] transition-transform duration-200`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background/50">
                        {getRankIcon(creator.rank)}
                        <span className="absolute text-xs font-bold mt-8">{creator.rank}</span>
                      </div>
                      
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 border-2 border-wiz-primary/30">
                        <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold">
                          {creator.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">{creator.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {creator.badge}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{creator.videos} videos</span>
                        </div>
                      </div>
                      
                      {/* XP */}
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Zap className="w-4 h-4 text-wiz-accent" />
                          <span className="font-bold text-lg">{creator.xp.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Total XP</p>
                      </div>
                      
                      {/* Action */}
                      <Button size="sm" variant="outline" className="hover:bg-wiz-primary/10">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {leaderboardTab === 'wizards' && (
            <div className="space-y-4">
              {topWizards.map((wizard) => (
                <Card 
                  key={wizard.rank} 
                  className={`glass-card border bg-gradient-to-r ${getRankColor(wizard.rank)} hover:scale-[1.02] transition-transform duration-200`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background/50">
                        {getRankIcon(wizard.rank)}
                        <span className="absolute text-xs font-bold mt-8">{wizard.rank}</span>
                      </div>
                      
                      {/* Avatar */}
                      <Avatar className="w-12 h-12 border-2 border-wiz-secondary/30">
                        <AvatarFallback className="bg-gradient-to-r from-wiz-secondary to-wiz-magic text-white font-bold">
                          {wizard.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold truncate">{wizard.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            Lv{wizard.level}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{wizard.watchTime} watched</span>
                          <span>{wizard.streak} day streak</span>
                        </div>
                      </div>
                      
                      {/* XP */}
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Zap className="w-4 h-4 text-wiz-accent" />
                          <span className="font-bold text-lg">{wizard.xp.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Total XP</p>
                      </div>
                      
                      {/* Action */}
                      <Button size="sm" variant="outline" className="hover:bg-wiz-secondary/10">
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Load More */}
        <div className="text-center pt-6">
          <Button variant="outline" className="hover:bg-wiz-primary/10 hover:border-wiz-primary/30">
            Load More Content
          </Button>
        </div>
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => closeVideoPlayer()}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="p-6 pt-0 h-full overflow-auto">
              <WizVideoPlayer
                videoId={selectedVideo.videoId}
                title={selectedVideo.title}
                description={`Created by ${selectedVideo.creator}`}
                xpReward={selectedVideo.xpReward}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};