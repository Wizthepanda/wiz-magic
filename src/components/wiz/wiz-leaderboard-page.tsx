import { useState } from 'react';
import { Trophy, Crown, Medal, Star, Zap, Users, Eye, CheckCircle, TrendingUp, Award, Target, Calendar, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { FloatingParticles } from '@/components/ui/floating-particles';

export const WizLeaderboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('creators');
  const [timeframe, setTimeframe] = useState('all-time');

  // Enhanced creator data
  const topCreators = [
    { 
      rank: 1, 
      name: 'AIGuru42', 
      xp: 125000, 
      level: 47, 
      videos: 89, 
      views: '2.3M', 
      specialty: 'AI & ML',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      verified: true,
      weeklyGrowth: '+15%',
      totalFollowers: '125K',
      averageRating: 4.9
    },
    { 
      rank: 2, 
      name: 'CodeMaster', 
      xp: 98000, 
      level: 42, 
      videos: 156, 
      views: '1.8M', 
      specialty: 'Development',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      verified: true,
      weeklyGrowth: '+12%',
      totalFollowers: '203K',
      averageRating: 4.8
    },
    { 
      rank: 3, 
      name: 'MoneyWizard', 
      xp: 87000, 
      level: 39, 
      videos: 78, 
      views: '1.5M', 
      specialty: 'Finance',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop',
      verified: true,
      weeklyGrowth: '+8%',
      totalFollowers: '89K',
      averageRating: 4.7
    },
    { 
      rank: 4, 
      name: 'HealthGuru', 
      xp: 76000, 
      level: 35, 
      videos: 134, 
      views: '1.2M', 
      specialty: 'Health',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      verified: true,
      weeklyGrowth: '+10%',
      totalFollowers: '145K',
      averageRating: 4.9
    },
    { 
      rank: 5, 
      name: 'BeatCreator', 
      xp: 65000, 
      level: 32, 
      videos: 92, 
      views: '980K', 
      specialty: 'Music',
      avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
      verified: true,
      weeklyGrowth: '+6%',
      totalFollowers: '67K',
      averageRating: 4.6
    }
  ];

  // Enhanced wizard data
  const topWizards = [
    { 
      rank: 1, 
      name: 'WizMaster', 
      xp: 45000, 
      level: 28, 
      watchTime: '340h', 
      streak: 89,
      avatar: '',
      weeklyXP: 2100,
      favoriteCategory: 'AI',
      completionRate: 94
    },
    { 
      rank: 2, 
      name: 'LearningNinja', 
      xp: 38000, 
      level: 25, 
      watchTime: '280h', 
      streak: 67,
      avatar: '',
      weeklyXP: 1850,
      favoriteCategory: 'Tech',
      completionRate: 91
    },
    { 
      rank: 3, 
      name: 'KnowledgeSeeker', 
      xp: 32000, 
      level: 22, 
      watchTime: '245h', 
      streak: 54,
      avatar: '',
      weeklyXP: 1600,
      favoriteCategory: 'Finance',
      completionRate: 88
    },
    { 
      rank: 4, 
      name: 'StudyWiz', 
      xp: 28000, 
      level: 19, 
      watchTime: '210h', 
      streak: 43,
      avatar: '',
      weeklyXP: 1400,
      favoriteCategory: 'Health',
      completionRate: 85
    },
    { 
      rank: 5, 
      name: 'ContentConsumer', 
      xp: 24000, 
      level: 17, 
      watchTime: '180h', 
      streak: 32,
      avatar: '',
      weeklyXP: 1200,
      favoriteCategory: 'Music',
      completionRate: 82
    }
  ];

  const tabs = [
    { id: 'creators', label: 'Top Creators', icon: Trophy },
    { id: 'wizards', label: 'Top Wizards', icon: Zap },
    { id: 'rising', label: 'Rising Stars', icon: TrendingUp }
  ];

  const timeframes = [
    { id: 'all-time', label: 'All Time' },
    { id: 'monthly', label: 'This Month' },
    { id: 'weekly', label: 'This Week' }
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400/20 to-yellow-600/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-300/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-400/20 to-orange-600/20 border-orange-500/30';
    return 'from-slate-100/20 to-slate-300/20 border-slate-200/30';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-8 h-8 text-orange-500" />;
    return <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white text-lg font-bold">{rank}</div>;
  };

  const getRankBackground = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)';
    if (rank === 2) return 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)';
    if (rank === 3) return 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)';
    return 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)';
  };

  // Find user's position in leaderboards
  const userRankInWizards = user ? Math.floor(Math.random() * 20) + 6 : null; // Simulated rank

  return (
    <div className="relative min-h-full">
      <FloatingParticles />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Leaderboards
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover top creators and wizards in the WIZ community. Compete, learn, and rise through the ranks!
          </p>
        </div>

        {/* User's Position Card */}
        {user && userRankInWizards && (
          <Card className="border-0 shadow-xl" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-wiz-primary/30">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold text-lg">
                      {user.displayName?.charAt(0) || 'W'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{user.displayName}</h3>
                    <p className="text-muted-foreground">Your Current Position</p>
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-wiz-primary" />
                    <span className="text-2xl font-bold text-wiz-primary">#{userRankInWizards}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Level {user.level} • {user.totalXP.toLocaleString()} XP
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white' 
                    : 'hover:bg-wiz-primary/10'
                } transition-all duration-300`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <Button
                key={tf.id}
                variant={timeframe === tf.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf.id)}
                className="text-sm"
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="space-y-6">
          {/* Top 3 Podium */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {(activeTab === 'creators' ? topCreators : topWizards).slice(0, 3).map((item, index) => {
              const podiumOrder = [1, 0, 2]; // Center, Left, Right
              const actualIndex = podiumOrder[index];
              const actualItem = (activeTab === 'creators' ? topCreators : topWizards)[actualIndex];
              
              return (
                <Card 
                  key={actualItem.rank}
                  className={`border-0 shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden ${
                    actualItem.rank === 1 ? 'md:order-2 transform md:scale-110' : 
                    actualItem.rank === 2 ? 'md:order-1' : 'md:order-3'
                  }`}
                  style={{
                    background: getRankBackground(actualItem.rank),
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: actualItem.rank === 1 ? '2px solid rgba(255, 215, 0, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                      {getRankIcon(actualItem.rank)}
                    </div>
                  </div>

                  <CardContent className="p-6 pt-8 text-center space-y-4">
                    {/* Avatar */}
                    <Avatar className="w-20 h-20 mx-auto border-4 border-white shadow-lg">
                      <AvatarImage src={actualItem.avatar} alt={actualItem.name} />
                      <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold text-xl">
                        {actualItem.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name and Info */}
                    <div>
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold">{actualItem.name}</h3>
                        {actualItem.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{actualItem.specialty || actualItem.favoriteCategory}</p>
                    </div>

                    {/* XP and Level */}
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-wiz-primary">
                        {actualItem.xp.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">XP</div>
                      <Badge variant="secondary" className="bg-wiz-primary/20 text-wiz-primary">
                        Level {actualItem.level}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {activeTab === 'creators' ? (
                        <>
                          <div>
                            <div className="font-semibold">{actualItem.videos}</div>
                            <div className="text-muted-foreground">Videos</div>
                          </div>
                          <div>
                            <div className="font-semibold">{actualItem.views}</div>
                            <div className="text-muted-foreground">Views</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="font-semibold">{actualItem.watchTime}</div>
                            <div className="text-muted-foreground">Watch Time</div>
                          </div>
                          <div>
                            <div className="font-semibold flex items-center justify-center">
                              <Flame className="w-4 h-4 text-orange-500 mr-1" />
                              {actualItem.streak}
                            </div>
                            <div className="text-muted-foreground">Day Streak</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Full Rankings */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center mb-6">
              {activeTab === 'creators' ? 'All Creators' : 'All Wizards'} Rankings
            </h3>
            
            {(activeTab === 'creators' ? topCreators : topWizards).map((item, index) => (
              <Card
                key={item.rank}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group"
                style={{
                  background: getRankBackground(item.rank),
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: item.rank <= 3 ? `1px solid ${
                    item.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                    item.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                    'rgba(205, 127, 50, 0.3)'
                  }` : '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    {/* Rank */}
                    <div className="relative">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 border border-white/30">
                        {getRankIcon(item.rank)}
                      </div>
                      {item.rank === 1 && (
                        <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400/20"></div>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-16 h-16 border-2 border-white/30">
                      <AvatarImage src={item.avatar} alt={item.name} />
                      <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold text-lg">
                        {item.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold truncate">{item.name}</h3>
                        <Badge variant="secondary" className="bg-wiz-primary/20 text-wiz-primary border-wiz-primary/30">
                          Lv{item.level}
                        </Badge>
                        {item.verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.specialty || `${item.favoriteCategory} Enthusiast`}
                      </p>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {activeTab === 'creators' ? (
                          <>
                            <div>
                              <div className="font-semibold text-wiz-primary">{item.videos}</div>
                              <div className="text-muted-foreground">Videos</div>
                            </div>
                            <div>
                              <div className="font-semibold text-wiz-secondary">{item.views}</div>
                              <div className="text-muted-foreground">Views</div>
                            </div>
                            <div>
                              <div className="font-semibold text-wiz-accent flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                {item.averageRating}
                              </div>
                              <div className="text-muted-foreground">Rating</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div className="font-semibold text-wiz-primary">{item.watchTime}</div>
                              <div className="text-muted-foreground">Watch Time</div>
                            </div>
                            <div>
                              <div className="font-semibold text-wiz-secondary flex items-center">
                                <Flame className="w-3 h-3 mr-1" />
                                {item.streak} days
                              </div>
                              <div className="text-muted-foreground">Streak</div>
                            </div>
                            <div>
                              <div className="font-semibold text-wiz-accent">{item.completionRate}%</div>
                              <div className="text-muted-foreground">Completion</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* XP and Growth */}
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-wiz-accent" />
                        <span className="text-2xl font-bold">{item.xp.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {item.weeklyGrowth || `+${item.weeklyXP} this week`}
                      </div>
                      <div className="w-32">
                        <Progress 
                          value={(item.xp / (activeTab === 'creators' ? 150000 : 50000)) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Competition Info */}
        <Card className="border-0 shadow-xl mt-8" style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Join the Competition!</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Climb the leaderboards by watching content, creating amazing videos, and engaging with the community. 
              Top performers each month receive exclusive rewards and recognition.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <Button className="bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-secondary hover:to-wiz-primary">
                Start Learning
              </Button>
              <Button variant="outline">
                View Rewards
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};