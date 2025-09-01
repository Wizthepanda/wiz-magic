import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Edit3, 
  Camera, 
  Share2, 
  Settings, 
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
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { youTubeAPI, YouTubeChannelInfo, YouTubeVideo } from '@/lib/youtube-api';
import { cn } from '@/lib/utils';

interface PrivateCreatorDashboardProps {
  className?: string;
}

export const PrivateCreatorDashboard: React.FC<PrivateCreatorDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const { 
    totalXP, 
    level, 
    progressPercent, 
    xpInCurrentLevel,
    xpToNextLevel,
    dailyXP 
  } = useXp();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'videos' | 'shorts' | 'courses' | 'community'>('analytics');
  const [youtubeProfile, setYoutubeProfile] = useState<YouTubeChannelInfo | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loadingYouTube, setLoadingYouTube] = useState(false);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

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

  // Mock creator analytics data (will be replaced with real data)
  const creatorStats = {
    subscribers: youtubeProfile?.subscriberCount || '12.3K',
    totalViews: '456.7K', // WIZ views
    watchTime: '2,134h',
    revenue: '$1,247.89',
    videosPublished: youtubeVideos.length || 23,
    coursesCreated: 4,
    avgViewDuration: '8:42',
    engagement: '12.4%',
    monthlyGrowth: '+18.3%'
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
      {/* Hero Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* YouTube Banner */}
        <div className="h-32 md:h-40 relative overflow-hidden rounded-t-lg">
          {youtubeProfile?.bannerImageUrl ? (
            <img 
              src={youtubeProfile.bannerImageUrl} 
              alt="YouTube Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 flex items-center justify-center">
              <span className="text-white/80 text-sm">YouTube Banner</span>
            </div>
          )}
        </div>

        <CardContent className="p-6 relative -mt-12">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={youtubeProfile?.avatar || user.photoURL || ''} 
                  alt={youtubeProfile?.name || user.displayName || ''} 
                />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-2xl">
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
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-yellow-400"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-2xl mb-1">
                {youtubeProfile?.name || user.displayName}
              </h1>
              {youtubeProfile?.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {youtubeProfile.description}
                </p>
              )}
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  {totalXP} XP
                </Badge>
                <Badge variant="outline">
                  <Eye className="w-3 h-3 mr-1" />
                  {creatorStats.totalViews} Views
                </Badge>
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {creatorStats.subscribers} Subs
                </Badge>
              </div>

              {/* Progress Bar - Level progression */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Level {level} Progress</span>
                  <span className="text-gray-600">{Math.round(progressPercent)}%</span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className="h-2"
                  style={{
                    background: 'linear-gradient(to right, #fef3c7, #fed7aa)'
                  }}
                />
              </div>
            </div>

            {/* Action Buttons - Right-aligned on desktop, stacked on mobile */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                🔴 Manage YouTube Sync
              </Button>
              <Button size="sm" variant="outline">
                <Edit3 className="w-4 h-4 mr-1" />
                Edit Creator Profile
              </Button>
              <Button size="sm" variant="outline" className="text-purple-600 hover:bg-purple-50">
                💜 Tip Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creator Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as typeof activeTab)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">📊 Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <VideoIcon className="w-4 h-4" />
            <span className="hidden sm:inline">🎬 My Videos</span>
          </TabsTrigger>
          <TabsTrigger value="shorts" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MonitorPlay className="w-4 h-4" />
            <span className="hidden sm:inline">⚡ My Shorts</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">🎓 My Courses</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">🌐 My Community</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
              <TrendingUp className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <div className="font-bold text-lg">{creatorStats.monthlyGrowth}</div>
              <div className="text-xs text-gray-600">Growth</div>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
              <Eye className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <div className="font-bold text-lg">{creatorStats.totalViews}</div>
              <div className="text-xs text-gray-600">WIZ Views</div>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
              <Clock className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <div className="font-bold text-lg">{creatorStats.avgViewDuration}</div>
              <div className="text-xs text-gray-600">Avg Watch Time</div>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100">
              <Users className="w-6 h-6 mx-auto text-orange-600 mb-2" />
              <div className="font-bold text-lg">{creatorStats.engagement}</div>
              <div className="text-xs text-gray-600">Engagement</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Video Performance</span>
                    <span className="text-sm font-medium text-green-600">📈 +23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Course Enrollments</span>
                    <span className="text-sm font-medium text-blue-600">👥 489 students</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">XP Earned This Month</span>
                    <span className="text-sm font-medium text-purple-600">⚡ +2,340 XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">{creatorStats.revenue}</div>
                <p className="text-sm text-gray-600 mb-4">This month's earnings</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Sales</span>
                    <span className="font-medium">$847.23</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tips & Donations</span>
                    <span className="font-medium">$234.56</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ad Revenue Share</span>
                    <span className="font-medium">$166.10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          {/* My Videos Tab */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <VideoIcon className="w-5 h-5 mr-2" />
                  My Videos ({regularVideos.length})
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Feature Video
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingYouTube ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading YouTube videos...</p>
                </div>
              ) : regularVideos.length > 0 ? (
                regularVideos.map((video) => (
                  <div key={video.id} className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-24 h-16 rounded object-cover"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{video.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{video.views} views</span>
                        <span>{video.publishedAt}</span>
                        <span>{video.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" title="Feature on WIZ">
                        <Star className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No videos found. Connect your YouTube account to sync videos.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shorts" className="space-y-6">
          {/* My Shorts Tab */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MonitorPlay className="w-5 h-5 mr-2" />
                  My Shorts ({shorts.length})
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Feature Short
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingYouTube ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading YouTube Shorts...</p>
                </div>
              ) : shorts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {shorts.map((short) => (
                    <div key={short.id} className="group relative">
                      <div className="aspect-[9/16] relative rounded-lg overflow-hidden bg-gray-200">
                        <img 
                          src={short.thumbnail} 
                          alt={short.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Play className="w-8 h-8 text-white opacity-80" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="text-white text-xs font-medium line-clamp-2 mb-1">{short.title}</h4>
                          <p className="text-white/80 text-xs">{short.views} views</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No shorts found. Connect your YouTube account to sync shorts.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* My Courses Tab */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  My Courses ({mockCourses.length})
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCourses.map((course) => (
                <div key={course.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-20 h-16 rounded object-cover bg-gray-200"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">{course.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>👥 {course.enrollments} students</span>
                      <span>📚 {course.lessons} lessons</span>
                      <span>⚡ {course.xpReward} XP reward</span>
                    </div>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button size="sm" variant="outline">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-purple-600">
                      {course.status === 'published' ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      {course.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          {/* My Community Tab */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Community Posts
                </CardTitle>
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCommunityPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{post.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {post.type === 'poll' && (
                          <span>🗳️ {post.votes} votes</span>
                        )}
                        {post.type === 'discussion' && (
                          <span>👍 {post.likes} likes</span>
                        )}
                        <span>💬 {post.comments} comments</span>
                        <span>{post.publishedAt}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" title="Pin Post">
                        📌
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">Engage with your community to build stronger connections!</p>
                <Button variant="outline" size="sm">
                  View All Community Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};