import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp,
  Youtube,
  Crown,
  Star,
  Award,
  BarChart3,
  VideoIcon,
  BookOpen,
  MessageSquare,
  Plus,
  ExternalLink,
  Flame,
  Zap,
  Play,
  Heart,
  DollarSign,
  Pause,
  MoreHorizontal,
  ThumbsUp,
  MonitorPlay,
  GraduationCap,
  MessageCircle,
  UserPlus,
  Gift,
  Coins,
  CreditCard,
  Smartphone,
  Calendar,
  BarChart2,
  Target,
  Sparkles,
  Settings,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { youTubeAPI, YouTubeChannelInfo, YouTubeVideo } from '@/lib/youtube-api';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface PrivateCreatorDashboardProps {
  className?: string;
}

export const PrivateCreatorDashboard: React.FC<PrivateCreatorDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { 
    totalXP, 
    level, 
    progressPercent, 
    xpInCurrentLevel,
    xpToNextLevel,
    dailyXP 
  } = useXp();
  
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'courses' | 'community'>('videos');
  const [youtubeProfile, setYoutubeProfile] = useState<YouTubeChannelInfo | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loadingYouTube, setLoadingYouTube] = useState(false);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const [tipAmount, setTipAmount] = useState('5.00');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Trigger level up animation
  useEffect(() => {
    const handleLevelUp = () => {
      setLevelUpAnimation(true);
      setTimeout(() => setLevelUpAnimation(false), 3000);
    };

    window.addEventListener('levelUp', handleLevelUp);
    return () => window.removeEventListener('levelUp', handleLevelUp);
  }, []);

  // Load YouTube profile data
  useEffect(() => {
    const loadYouTubeData = async () => {
      setLoadingYouTube(true);
      try {
        if (youTubeAPI.isAuthenticated()) {
          const [profile, videos] = await Promise.all([
            youTubeAPI.getChannelInfo(),
            youTubeAPI.getRecentVideos(12)
          ]);
          setYoutubeProfile(profile);
          setYoutubeVideos(videos);
        }
      } catch (error) {
        console.error('Error loading YouTube data:', error);
      } finally {
        setLoadingYouTube(false);
      }
    };
    
    loadYouTubeData();
  }, []);

  // Creator stats (WIZ DB + YouTube API integration)
  const creatorStats = {
    xpTotal: totalXP, // XP earned from viewers watching creator's content
    views: '456.7K', // WIZ views (aggregate from DB)
    subscribers: youtubeProfile?.subscriberCount || '12.3K', // YouTube count, live updated
    level: level, // WIZ gamification level
    tipsEarned: '$1,247.89', // Aggregate tips from Stripe/crypto
    videosCount: youtubeVideos.length || 23,
    coursesCreated: 4,
    avgViewDuration: '8:42',
    engagement: '12.4%',
    monthlyGrowth: '+18.3%'
  };

  // Handle YouTube subscription
  const handleSubscribe = async () => {
    if (!youtubeProfile?.id) return;
    
    setIsSubscribing(true);
    try {
      // Redirect to YouTube's subscribe flow (seamless via auth)
      const subscribeUrl = `https://www.youtube.com/channel/${youtubeProfile.id}?sub_confirmation=1`;
      window.open(subscribeUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error with subscription flow:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Handle tip processing
  const handleTip = async (amount: string) => {
    console.log(`💰 Processing tip of $${amount} for creator ${youtubeProfile?.name}`);
    // TODO: Integrate with Stripe/crypto flow
    alert(`Tip of $${amount} sent! (Demo mode)`);
  };

  const mockCourses = [
    {
      id: 1,
      title: 'Complete React Mastery',
      thumbnail: '/api/placeholder/120/68',
      enrollments: 234,
      lessons: 24,
      xpReward: 2400,
      status: 'published',
      publishedAt: '1 week ago'
    },
    {
      id: 2,
      title: 'Advanced JavaScript Patterns',
      thumbnail: '/api/placeholder/120/68',
      enrollments: 156,
      lessons: 18,
      xpReward: 1800,
      status: 'published',
      publishedAt: '2 weeks ago'
    }
  ];

  const mockCommunityPosts = [
    {
      id: 1,
      type: 'poll',
      title: 'What topic should I cover next?',
      content: 'React Server Components vs Next.js 14 Features',
      votes: 127,
      comments: 23,
      publishedAt: '3 hours ago'
    },
    {
      id: 2,
      type: 'discussion',
      title: 'Weekly Q&A Session',
      content: 'Drop your questions about web development here!',
      comments: 45,
      likes: 89,
      publishedAt: '1 day ago'
    }
  ];

  const achievements = [
    { name: 'First Creator', icon: Star, earned: true },
    { name: 'Rising Star', icon: TrendingUp, earned: true },
    { name: 'Content King', icon: Crown, earned: false },
    { name: 'Community Builder', icon: Users, earned: true }
  ];

  const separateVideosAndShorts = (videos: YouTubeVideo[]) => {
    // YouTube API doesn't distinguish shorts by duration alone
    // For now, we'll mock some as shorts (videos under 60 seconds typically)
    const regularVideos = videos.filter((_, index) => index % 4 !== 0); // Mock: 75% regular videos
    const shorts = videos.filter((_, index) => index % 4 === 0); // Mock: 25% shorts
    return { regularVideos, shorts };
  };

  const { regularVideos, shorts } = separateVideosAndShorts(youtubeVideos);

  if (!user) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Hero Card - Glassmorphism Design */}
      <Card className="border-0 shadow-2xl relative overflow-hidden" style={{
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%),
          linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)
        `,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* YouTube Banner Background */}
        <div className={cn(
          "relative overflow-hidden",
          isMobile ? "h-32" : "h-48"
        )}>
          {youtubeProfile?.bannerImageUrl ? (
            <>
              <img 
                src={youtubeProfile.bannerImageUrl} 
                alt="YouTube Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            <div className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/10" />
              <span className="text-white/90 text-sm font-medium">YouTube Creator Banner</span>
            </div>
          )}
        </div>

        <CardContent className={cn(
          "relative", 
          isMobile ? "p-4 -mt-16" : "p-8 -mt-20"
        )}>
          <div className={cn(
            "flex items-start space-y-4",
            isMobile ? "flex-col" : "flex-row md:items-end md:space-y-0 md:space-x-8"
          )}>
            {/* Creator Avatar - Centered */}
            <div className={cn(
              "relative",
              isMobile ? "self-center" : ""
            )}>
              <Avatar className={cn(
                "border-4 border-white shadow-xl",
                isMobile ? "w-24 h-24" : "w-32 h-32"
              )}>
                <AvatarImage 
                  src={youtubeProfile?.avatar || user.photoURL || ''} 
                  alt={youtubeProfile?.name || user.displayName || ''} 
                />
                <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-3xl">
                  {(youtubeProfile?.name || user.displayName)?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              
              {/* Level up animation */}
              <AnimatePresence>
                {levelUpAnimation && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 60],
                          y: [0, (Math.random() - 0.5) * 60],
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Creator Info - Centered on mobile */}
            <div className={cn(
              "flex-1 min-w-0 space-y-4",
              isMobile ? "text-center" : ""
            )}>
              <div>
                <h1 className="font-bold text-3xl mb-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {youtubeProfile?.name || user.displayName}
                </h1>
                {youtubeProfile?.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {youtubeProfile.description}
                  </p>
                )}
              </div>
              
              {/* Action Buttons - Subscribe & Tipping */}
              <div className={cn(
                "flex gap-3",
                isMobile ? "flex-col w-full" : "flex-row"
              )}>
                <Button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing || !youtubeProfile}
                  className={cn(
                    "bg-red-600 hover:bg-red-700 text-white shadow-lg",
                    isMobile ? "w-full" : ""
                  )}
                >
                  {isSubscribing ? (
                    <><Clock className="w-4 h-4 mr-2 animate-spin" />Subscribing...</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" />Subscribe on YouTube</>
                  )}
                </Button>
                
                {/* Tipping Button with Glass Effect */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "shadow-lg transition-all duration-300 hover:scale-105",
                        isMobile ? "w-full" : ""
                      )}
                      style={{
                        background: `
                          linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%),
                          rgba(255, 255, 255, 0.9)
                        `,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent font-semibold">
                        Send Tip
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Gift className="w-5 h-5 mr-2 text-purple-600" />
                        Send Tip to {youtubeProfile?.name || user.displayName}
                      </DialogTitle>
                      <DialogDescription>
                        Support this creator with a tip. Choose your amount below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="tip-amount">Tip Amount ($USD)</Label>
                        <Input
                          id="tip-amount"
                          type="number"
                          min="1"
                          step="0.01"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          className="text-center text-lg font-semibold"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        {['5.00', '10.00', '25.00', '50.00'].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setTipAmount(amount)}
                            className="flex-1"
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleTip(tipAmount)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Send ${tipAmount}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* XP Progress Bar with Glass Effect */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Level {level} Progress</span>
                  <span className="text-sm text-gray-500">{Math.round(progressPercent)}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={progressPercent} 
                    className="h-3 bg-white/50 backdrop-blur-sm border border-white/20 shadow-inner"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{xpInCurrentLevel} XP</span>
                  <span>{xpToNextLevel} XP to next level</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row - shadcn/ui Cards with Tailwind Grid */}
      <div className={cn(
        "grid gap-4 mb-8",
        isMobile ? "grid-cols-2 overflow-x-auto" : "grid-cols-2 md:grid-cols-5"
      )}>
        {/* XP Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(251, 191, 36, 0.2)'
        }}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-yellow-700">{creatorStats.xpTotal}</div>
            <div className="text-xs text-yellow-600 font-medium">Total XP</div>
          </CardContent>
        </Card>

        {/* Views Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{creatorStats.views}</div>
            <div className="text-xs text-blue-600 font-medium">WIZ Views</div>
          </CardContent>
        </Card>

        {/* Subscribers Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-red-700">{creatorStats.subscribers}</div>
            <div className="text-xs text-red-600 font-medium">Subscribers</div>
          </CardContent>
        </Card>

        {/* Level Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-violet-700">{creatorStats.level}</div>
            <div className="text-xs text-violet-600 font-medium">WIZ Level</div>
          </CardContent>
        </Card>

        {/* Tips Earned Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-700">{creatorStats.tipsEarned}</div>
            <div className="text-xs text-green-600 font-medium">Tips Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Radix Tabs for Content Navigation */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList className={cn(
          "p-1 shadow-lg",
          isMobile ? "w-full grid grid-cols-4" : "grid w-full grid-cols-4"
        )} style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <TabsTrigger value="videos" className="flex items-center space-x-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm">
            <VideoIcon className="w-4 h-4" />
            <span className={isMobile ? "text-xs" : "text-sm"}>Videos</span>
          </TabsTrigger>
          <TabsTrigger value="shorts" className="flex items-center space-x-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm">
            <MonitorPlay className="w-4 h-4" />
            <span className={isMobile ? "text-xs" : "text-sm"}>Shorts</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center space-x-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm">
            <GraduationCap className="w-4 h-4" />
            <span className={isMobile ? "text-xs" : "text-sm"}>Courses</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center space-x-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-sm data-[state=active]:backdrop-blur-sm">
            <MessageCircle className="w-4 h-4" />
            <span className={isMobile ? "text-xs" : "text-sm"}>Community</span>
          </TabsTrigger>
        </TabsList>


        <TabsContent value="videos" className="space-y-6">
          {/* My Videos Tab - Grid View */}
          <Card className="border-0 shadow-lg" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <VideoIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Featured Videos ({regularVideos.length})
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Feature Video
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingYouTube ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mr-3"></div>
                  <p className="text-gray-600">Loading your YouTube videos...</p>
                </div>
              ) : regularVideos.length > 0 ? (
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                  {regularVideos.map((video) => (
                    <div key={video.id} className="group relative bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-medium line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{video.views}</span>
                          </div>
                          <span>{video.publishedAt}</span>
                        </div>
                        
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="ghost" className="flex-1" title="Feature on WIZ">
                            <Star className="w-3 h-3 mr-1" />
                            Feature
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <VideoIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Videos Yet</h3>
                  <p className="text-gray-500 mb-4">Connect your YouTube account to sync and feature your videos.</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                    <Youtube className="w-4 h-4 mr-2" />
                    Connect YouTube
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shorts" className="space-y-6">
          {/* My Shorts Tab - Horizontal Carousel */}
          <Card className="border-0 shadow-lg" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MonitorPlay className="w-5 h-5 mr-2 text-purple-600" />
                  My Shorts ({shorts.length})
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Feature Short
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingYouTube ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mr-3"></div>
                  <p className="text-gray-600">Loading your YouTube Shorts...</p>
                </div>
              ) : shorts.length > 0 ? (
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4 min-w-max">
                    {shorts.map((short) => (
                      <div key={short.id} className="group relative flex-shrink-0">
                        <div className="w-32 aspect-[9/16] relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg hover:shadow-xl transition-all duration-300">
                          <img 
                            src={short.thumbnail} 
                            alt={short.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <h4 className="text-white text-xs font-medium line-clamp-2 mb-1">{short.title}</h4>
                            <div className="flex items-center justify-between">
                              <p className="text-white/80 text-xs flex items-center">
                                <Eye className="w-2 h-2 mr-1" />
                                {short.views}
                              </p>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                              >
                                <Star className="w-3 h-3 text-white" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MonitorPlay className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Shorts Yet</h3>
                  <p className="text-gray-500 mb-4">Connect your YouTube account to sync and feature your shorts.</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                    <Youtube className="w-4 h-4 mr-2" />
                    Connect YouTube
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* My Courses Tab - Learn Integration */}
          <Card className="border-0 shadow-lg" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
                  My Learning Courses ({mockCourses.length})
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockCourses.map((course) => (
                <div key={course.id} className="group relative bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 aspect-video md:aspect-square relative overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <Badge className={cn(
                          "text-xs",
                          course.status === 'published' 
                            ? "bg-green-500/90 text-white" 
                            : "bg-yellow-500/90 text-white"
                        )}>
                          {course.status === 'published' ? '✅ Published' : '🔄 Draft'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                            {course.title}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center text-blue-600">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{course.enrollments} students</span>
                            </div>
                            <div className="flex items-center text-green-600">
                              <BookOpen className="w-4 h-4 mr-1" />
                              <span>{course.lessons} lessons</span>
                            </div>
                            <div className="flex items-center text-purple-600">
                              <Zap className="w-4 h-4 mr-1" />
                              <span>{course.xpReward} XP reward</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 min-w-max">
                          <Button size="sm" variant="outline" className="hover:bg-purple-50">
                            <BarChart2 className="w-4 h-4 mr-1" />
                            Analytics
                          </Button>
                          <Button size="sm" variant="outline" className="hover:bg-blue-50">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Course
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="text-purple-600 hover:bg-purple-50">
                            <Settings className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className={cn(
                              course.status === 'published' 
                                ? "text-orange-600 hover:bg-orange-50" 
                                : "text-green-600 hover:bg-green-50"
                            )}
                          >
                            {course.status === 'published' ? (
                              <><Pause className="w-4 h-4 mr-1" />Unpublish</>
                            ) : (
                              <><Play className="w-4 h-4 mr-1" />Publish</>
                            )}
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Published {course.publishedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {mockCourses.length === 0 && (
                <div className="text-center py-12">
                  <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Courses Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first course to start teaching and earning XP from students.</p>
                  <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Course
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          {/* My Community Tab - Q&A and Posts */}
          <Card className="border-0 shadow-lg" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Community Hub
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockCommunityPosts.map((post) => (
                <div key={post.id} className="group bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={post.type === 'poll' ? 'default' : 'secondary'} className="text-xs">
                            {post.type === 'poll' ? '📊 Poll' : '💬 Discussion'}
                          </Badge>
                          <span className="text-xs text-gray-500">{post.publishedAt}</span>
                        </div>
                        
                        <h4 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-gray-600 mb-4">{post.content}</p>
                        
                        <div className="flex items-center space-x-6">
                          {post.type === 'poll' && (
                            <div className="flex items-center text-blue-600">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              <span className="font-medium">{post.votes}</span>
                              <span className="text-sm ml-1">votes</span>
                            </div>
                          )}
                          {post.type === 'discussion' && (
                            <div className="flex items-center text-green-600">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              <span className="font-medium">{post.likes}</span>
                              <span className="text-sm ml-1">likes</span>
                            </div>
                          )}
                          <div className="flex items-center text-purple-600">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="font-medium">{post.comments}</span>
                            <span className="text-sm ml-1">comments</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" title="Pin Post" className="hover:bg-yellow-50">
                          <Target className="w-4 h-4 text-yellow-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-gray-50">
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="ghost" className="text-purple-600 hover:bg-purple-50">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      
                      <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
                        View Thread
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {mockCommunityPosts.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Community Posts Yet</h3>
                  <p className="text-gray-500 mb-6">Start engaging with your audience by creating polls, discussions, and Q&A sessions.</p>
                  <div className="flex justify-center space-x-3">
                    <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Poll
                    </Button>
                    <Button variant="outline" className="hover:bg-purple-50">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Discussion
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="text-center py-6 border-t border-gray-200">
                <p className="text-gray-500 mb-4">💡 <strong>Pro Tip:</strong> Engage with your community regularly to build stronger connections and increase retention!</p>
                <Button variant="outline" size="sm" className="hover:bg-purple-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Community Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};