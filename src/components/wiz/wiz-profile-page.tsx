import { useState } from 'react';
import { User, Edit3, Camera, Trophy, Zap, Clock, Target, BookOpen, Award, Star, TrendingUp, Calendar, Eye, Heart, Share2, Settings, Crown, Medal, Youtube, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { FloatingParticles } from '@/components/ui/floating-particles';

export const WizProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user stats and data
  const userStats = {
    totalWatchTime: '247h 32m',
    videosWatched: 156,
    currentStreak: 23,
    longestStreak: 45,
    favoriteCategory: 'AI & Technology',
    joinDate: 'September 2024',
    rank: 'Top 15%',
    achievements: 12,
    totalEarnings: '$127.50'
  };

  const recentActivity = [
    {
      type: 'video_watched',
      title: 'Advanced React Patterns',
      creator: 'CodeMaster',
      xpEarned: 150,
      timestamp: '2 hours ago',
      category: 'Tech'
    },
    {
      type: 'level_up',
      title: `Reached Level ${user?.level || 5}`,
      xpEarned: 0,
      timestamp: '1 day ago',
      category: 'Achievement'
    },
    {
      type: 'video_watched',
      title: 'Crypto Trading Fundamentals',
      creator: 'MoneyWizard',
      xpEarned: 200,
      timestamp: '2 days ago',
      category: 'Finance'
    },
    {
      type: 'achievement',
      title: 'Learning Streak Master',
      description: 'Watched content for 7 consecutive days',
      timestamp: '3 days ago',
      category: 'Achievement'
    }
  ];

  const achievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Watched your first video',
      icon: BookOpen,
      earned: true,
      earnedDate: '2024-09-15'
    },
    {
      id: 2,
      name: 'Speed Learner',
      description: 'Earned 1,000 XP in a day',
      icon: Zap,
      earned: true,
      earnedDate: '2024-09-20'
    },
    {
      id: 3,
      name: 'Dedication',
      description: 'Maintained a 7-day learning streak',
      icon: Flame,
      earned: true,
      earnedDate: '2024-09-25'
    },
    {
      id: 4,
      name: 'Knowledge Seeker',
      description: 'Watched 50 videos',
      icon: Eye,
      earned: true,
      earnedDate: '2024-10-01'
    },
    {
      id: 5,
      name: 'Category Explorer',
      description: 'Watched content from 5 different categories',
      icon: Target,
      earned: true,
      earnedDate: '2024-10-05'
    },
    {
      id: 6,
      name: 'Rising Star',
      description: 'Reach Level 10',
      icon: Star,
      earned: false,
      required: 'Level 10'
    },
    {
      id: 7,
      name: 'Content Connoisseur',
      description: 'Watch 100 hours of content',
      icon: Clock,
      earned: false,
      required: '100 hours'
    },
    {
      id: 8,
      name: 'Premiere Elite',
      description: 'Upgrade to WIZ Premiere',
      icon: Crown,
      earned: false,
      required: 'Premiere subscription'
    }
  ];

  const categoryStats = [
    { name: 'AI & Technology', watchTime: '89h', videos: 45, xpEarned: 12750, color: 'from-blue-400 to-cyan-500' },
    { name: 'Finance', watchTime: '67h', videos: 34, xpEarned: 9560, color: 'from-green-400 to-emerald-500' },
    { name: 'Programming', watchTime: '54h', videos: 28, xpEarned: 7620, color: 'from-purple-400 to-pink-500' },
    { name: 'Health', watchTime: '37h', videos: 19, xpEarned: 5180, color: 'from-red-400 to-orange-500' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'stats', label: 'Statistics', icon: TrendingUp }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video_watched': return Eye;
      case 'level_up': return TrendingUp;
      case 'achievement': return Award;
      default: return BookOpen;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'video_watched': return 'text-blue-500';
      case 'level_up': return 'text-green-500';
      case 'achievement': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-full flex items-center justify-center">
        <FloatingParticles />
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <FloatingParticles />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-xl relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)'
            }} />
          </div>

          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold text-4xl">
                    {user.displayName?.charAt(0) || 'W'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-white shadow-lg hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h1 className="text-3xl font-bold">{user.displayName}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary" className="bg-wiz-primary/20 text-wiz-primary">
                        <Crown className="w-3 h-3 mr-1" />
                        Level {user.level}
                      </Badge>
                      <Badge variant="outline">
                        <Youtube className="w-3 h-3 mr-1" />
                        {user.youtubeConnected ? 'Connected' : 'Not Connected'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Joined {userStats.joinDate}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-secondary hover:to-wiz-primary"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-wiz-primary">{user.totalXP.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-wiz-secondary">{userStats.videosWatched}</div>
                    <div className="text-sm text-muted-foreground">Videos Watched</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-wiz-accent">{userStats.totalWatchTime}</div>
                    <div className="text-sm text-muted-foreground">Watch Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500 flex items-center justify-center">
                      <Flame className="w-6 h-6 mr-1" />
                      {userStats.currentStreak}
                    </div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white' 
                  : 'hover:bg-wiz-primary/10'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Level Progress */}
              <Card className="border-0 shadow-xl" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px'
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-wiz-primary" />
                    <span>Level Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-wiz-primary">Level {user.level}</div>
                    <div className="text-muted-foreground">
                      {((user.totalXP % 1000) / 1000 * 100).toFixed(1)}% to next level
                    </div>
                  </div>
                  <Progress value={(user.totalXP % 1000) / 1000 * 100} className="h-4" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{user.totalXP % 1000} XP</span>
                    <span>1000 XP</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="border-0 shadow-xl" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px'
              }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {achievements.filter(a => a.earned).slice(-3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                        <achievement.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'activity' && (
            <Card className="border-0 shadow-xl" style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              backdropFilter: 'blur(8px)',
              borderRadius: '20px'
            }}>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <ActivityIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{activity.title}</div>
                        {activity.creator && (
                          <div className="text-sm text-muted-foreground">by {activity.creator}</div>
                        )}
                        {activity.description && (
                          <div className="text-sm text-muted-foreground">{activity.description}</div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                          {activity.xpEarned > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              +{activity.xpEarned} XP
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {activeTab === 'achievements' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={`border-0 shadow-xl transition-all duration-300 ${
                    achievement.earned ? 'hover:scale-105' : 'opacity-60'
                  }`}
                  style={{
                    background: achievement.earned 
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '20px',
                    border: achievement.earned ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      <achievement.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.earned ? (
                      <Badge className="bg-green-100 text-green-700">
                        Earned {achievement.earnedDate}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {achievement.required}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Category Breakdown */}
              <Card className="border-0 shadow-xl" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px'
              }}>
                <CardHeader>
                  <CardTitle>Learning Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryStats.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.watchTime}</span>
                      </div>
                      <Progress value={(category.videos / 50) * 100} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{category.videos} videos</span>
                        <span>{category.xpEarned.toLocaleString()} XP</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Overall Stats */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-xl text-center p-6" style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px'
                }}>
                  <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold">{userStats.rank}</div>
                  <div className="text-sm text-muted-foreground">Global Rank</div>
                </Card>

                <Card className="border-0 shadow-xl text-center p-6" style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px'
                }}>
                  <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                  <div className="text-2xl font-bold">{userStats.longestStreak}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </Card>

                <Card className="border-0 shadow-xl text-center p-6" style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px'
                }}>
                  <Award className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">{userStats.achievements}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </Card>

                <Card className="border-0 shadow-xl text-center p-6" style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px'
                }}>
                  <div className="text-2xl font-bold text-green-600 mb-2">💰</div>
                  <div className="text-2xl font-bold">{userStats.totalEarnings}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};