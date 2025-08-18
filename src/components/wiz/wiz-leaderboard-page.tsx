import { useState } from 'react';
import { Trophy, Crown, Medal, Star, Zap, Users, Eye, CheckCircle, TrendingUp, Award, Target, Calendar, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

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
    { id: 'creators', label: 'Creators', icon: Trophy },
    { id: 'wizards', label: 'Wizards', icon: Zap },
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
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: 'linear-gradient(45deg, rgba(230, 230, 250, 0.6), rgba(147, 51, 234, 0.4))',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.8, 1]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-12 relative">
        {/* Leaderboard Header - Hall of Fame Style */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Gradient Crown Icon */}
          <motion.div 
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center relative"
            style={{
              background: `
                linear-gradient(135deg, rgba(230, 230, 250, 0.3) 0%, rgba(255, 215, 0, 0.2) 50%, rgba(147, 51, 234, 0.3) 100%),
                rgba(255, 255, 255, 0.1)
              `,
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: `
                0 20px 40px rgba(255, 215, 0, 0.2),
                0 0 60px rgba(230, 230, 250, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.4)
              `
            }}
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Crown 
              className="w-14 h-14"
              style={{
                background: 'linear-gradient(135deg, #E6E6FA 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.4))'
              }}
            />
            {/* Glowing Aura */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)'
              }}
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Title with Gradient Typography */}
          <motion.h1 
            className="text-5xl font-bold mb-3"
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
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            Leaderboard
          </motion.h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600/90 font-medium max-w-2xl mx-auto">
            This Week's Top Wizards & Creators
          </p>
        </motion.div>

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
                    Level {(user as any)?.level || 1} • {((user as any)?.totalXP || 1250).toLocaleString()} XP
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pill Toggle Tabs */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-between space-y-6 sm:space-y-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div 
            className="relative flex p-2 rounded-full"
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
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-8 py-4 text-sm font-semibold rounded-full transition-all duration-300 z-10
                  ${activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
                style={{ minWidth: '150px' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glowing Active Background */}
                {activeTab === tab.id && (
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
                    layoutId="activeTabBackground"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                  />
                )}
                
                {/* Shimmer Effect */}
                {activeTab === tab.id && (
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
                    animate={activeTab === tab.id ? { 
                      scale: [1, 1.1, 1],
                      rotate: [0, 3, -3, 0]
                    } : {}}
                    transition={activeTab === tab.id ? { 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    } : {}}
                  >
                    <tab.icon className="w-5 h-5" />
                  </motion.div>
                  <span className="font-semibold">{tab.label.replace('Top ', '')}</span>
                </div>
              </motion.button>
            ))}
          </div>
          
          {/* Time Filter Pills */}
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <motion.button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`
                  px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
                  ${timeframe === tf.id 
                    ? 'bg-white/20 text-purple-700 backdrop-blur-sm border border-purple-200/50' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/10'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tf.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard Content */}
        <motion.div 
          className="space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Glassmorphic Leaderboard Container */}
          <div 
            className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
            style={{
              background: `
                linear-gradient(135deg, rgba(230, 230, 250, 0.3) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(99, 102, 241, 0.15) 100%),
                rgba(255, 255, 255, 0.1)
              `,
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 25px 50px rgba(147, 51, 234, 0.1),
                0 0 80px rgba(230, 230, 250, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `
            }}
          >
            {/* Leaderboard Cards */}
            <div className="space-y-3">
              {(activeTab === 'creators' ? topCreators : topWizards).map((item, index) => (
                <motion.div
                  key={item.rank}
                  className="group relative"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.8 + index * 0.1,
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
                    className="relative p-4 md:p-5 rounded-xl overflow-hidden transition-all duration-300"
                    style={{
                      background: item.rank === 1
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)'
                        : item.rank === 2
                        ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(169, 169, 169, 0.08) 100%)'
                        : item.rank === 3
                        ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.15) 0%, rgba(184, 115, 51, 0.08) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(230, 230, 250, 0.05) 100%)',
                      backdropFilter: 'blur(15px)',
                      border: item.rank <= 3
                        ? `1px solid ${
                            item.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                            item.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                            'rgba(205, 127, 50, 0.3)'
                          }`
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: item.rank <= 3
                        ? `0 4px 20px ${
                            item.rank === 1 ? 'rgba(255, 215, 0, 0.1)' :
                            item.rank === 2 ? 'rgba(192, 192, 192, 0.1)' :
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
                          {item.rank === 1 ? (
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
                          ) : item.rank === 2 ? (
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
                          ) : item.rank === 3 ? (
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
                              {item.rank}
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
                              boxShadow: item.rank <= 3
                                ? `0 0 15px ${
                                    item.rank === 1 ? 'rgba(255, 215, 0, 0.3)' :
                                    item.rank === 2 ? 'rgba(192, 192, 192, 0.3)' :
                                    'rgba(205, 127, 50, 0.3)'
                                  }`
                                : '0 0 10px rgba(147, 51, 234, 0.2)'
                            }}
                          >
                            <Avatar className="w-full h-full">
                              <AvatarImage src={item.avatar} alt={item.name} />
                              <AvatarFallback
                                className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl"
                                style={{
                                  background: 'linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)'
                                }}
                              >
                                {item.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          {item.verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </motion.div>

                        {/* User Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-800 truncate">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            @{item.name.toLowerCase().replace(/\s+/g, '')}
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
                            background: item.rank <= 3
                              ? `linear-gradient(135deg, ${
                                  item.rank === 1 ? '#FFD700, #FFA500' :
                                  item.rank === 2 ? '#C0C0C0, #A8A8A8' :
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
                          {item.xp.toLocaleString()}
                          
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