import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, 
  Flame, 
  Star, 
  Trophy, 
  BookOpen, 
  Heart, 
  Share2,
  Copy,
  Check,
  Gift,
  Target,
  Calendar,
  TrendingUp,
  Eye,
  Clock,
  Award,
  Sparkles,
  Crown,
  Shield,
  Play,
  BarChart3,
  Activity,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useViewerStats } from '@/hooks/useViewerStats';

interface PrivateViewerProfileProps {
  className?: string;
}

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
  description: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: string;
}

interface Milestone {
  level: number;
  title: string;
  icon: React.ElementType;
  unlocked: boolean;
}

// Helper function to get level-based title
const getLevelTitle = (level: number): string => {
  if (level >= 20) return "Master Wizard";
  if (level >= 15) return "Expert Wizard";  
  if (level >= 10) return "Adept Wizard";
  if (level >= 5) return "Apprentice Wizard";
  return "Novice Wizard";
};

// Helper function to get XP aura color based on level
const getAuraColor = (level: number): string => {
  if (level >= 20) return "from-purple-400 via-pink-400 to-purple-400";
  if (level >= 15) return "from-blue-400 via-purple-400 to-blue-400";
  if (level >= 10) return "from-green-400 via-blue-400 to-green-400";
  if (level >= 5) return "from-yellow-400 via-orange-400 to-yellow-400";
  return "from-gray-400 via-gray-300 to-gray-400";
};

export const PrivateViewerProfile: React.FC<PrivateViewerProfileProps> = ({ className }) => {
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
  const viewerStats = useViewerStats();
  
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [sparkAnimation, setSparkAnimation] = useState(false);
  const [selectedStatCard, setSelectedStatCard] = useState<StatCard | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Trigger spark animation when XP updates
  useEffect(() => {
    const handleXpUpdate = () => {
      setSparkAnimation(true);
      setTimeout(() => setSparkAnimation(false), 2000);
    };

    window.addEventListener('xpUpdated', handleXpUpdate);
    return () => window.removeEventListener('xpUpdated', handleXpUpdate);
  }, []);

  // Elegant stat cards configuration
  const statCards: StatCard[] = [
    {
      id: "xp",
      title: "Total XP",
      value: (totalXP || 0).toLocaleString(),
      icon: Zap,
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      shadowColor: "shadow-yellow-500/25",
      description: `You've earned ${totalXP || 0} experience points on your magical journey!`
    },
    {
      id: "videos",
      title: "Videos Watched",
      value: viewerStats.videosWatched,
      icon: Eye,
      gradient: "from-blue-400 via-purple-500 to-indigo-600",
      shadowColor: "shadow-blue-500/25",
      description: `You've watched ${viewerStats.videosWatched} videos and gained knowledge from each one.`
    },
    {
      id: "time",
      title: "Watch Time",
      value: `${viewerStats.totalWatchTimeHours}h`,
      icon: Clock,
      gradient: "from-green-400 via-teal-500 to-cyan-600",
      shadowColor: "shadow-green-500/25",
      description: `You've spent ${viewerStats.totalWatchTimeHours} hours learning and growing.`
    },
    {
      id: "streak",
      title: "Day Streak",
      value: viewerStats.streakDays,
      icon: Flame,
      gradient: "from-orange-400 via-red-500 to-pink-600",
      shadowColor: "shadow-orange-500/25",
      description: `You're on fire! ${viewerStats.streakDays} days of consistent learning.`
    }
  ];

  // Achievement system
  const achievements: Achievement[] = [
    {
      id: "first_video",
      title: "First Steps",
      description: "Watched your first video",
      icon: Play,
      gradient: "from-green-400 to-blue-500",
      unlocked: true,
      unlockedAt: "2 days ago",
      requirement: "Watch 1 video"
    },
    {
      id: "streak_master",
      title: "Streak Master",
      description: "Maintained a 7-day streak",
      icon: Flame,
      gradient: "from-orange-400 to-red-500",
      unlocked: viewerStats.streakDays >= 7,
      unlockedAt: viewerStats.streakDays >= 7 ? "Today" : undefined,
      requirement: "Maintain 7-day streak"
    },
    {
      id: "knowledge_seeker",
      title: "Knowledge Seeker",
      description: "Watched 50 videos",
      icon: BookOpen,
      gradient: "from-purple-400 to-pink-500",
      unlocked: viewerStats.videosWatched >= 50,
      unlockedAt: viewerStats.videosWatched >= 50 ? "Recently" : undefined,
      requirement: "Watch 50 videos"
    },
    {
      id: "time_master",
      title: "Time Master",
      description: "Spent 100+ hours learning",
      icon: Clock,
      gradient: "from-blue-400 to-indigo-500",
      unlocked: viewerStats.totalWatchTimeHours >= 100,
      unlockedAt: viewerStats.totalWatchTimeHours >= 100 ? "Recently" : undefined,
      requirement: "Watch 100+ hours"
    },
    {
      id: "social_wizard",
      title: "Social Wizard",
      description: "Invited 5 friends",
      icon: Heart,
      gradient: "from-pink-400 to-rose-500",
      unlocked: viewerStats.totalReferrals >= 5,
      unlockedAt: viewerStats.totalReferrals >= 5 ? "Recently" : undefined,
      requirement: "Invite 5 friends"
    },
    {
      id: "completion_master",
      title: "Completion Master",
      description: "Completed 25 videos",
      icon: Trophy,
      gradient: "from-emerald-400 to-teal-500",
      unlocked: viewerStats.videosCompleted >= 25,
      unlockedAt: viewerStats.videosCompleted >= 25 ? "Recently" : undefined,
      requirement: "Complete 25 videos"
    },
    {
      id: "level_champion",
      title: "Level Champion",
      description: "Reached Level 10",
      icon: Crown,
      gradient: "from-yellow-400 to-orange-500",
      unlocked: level >= 10,
      requirement: "Reach Level 10"
    }
  ];

  // XP Journey milestones
  const milestones: Milestone[] = [
    { level: 5, title: "Apprentice Wizard", icon: Star, unlocked: level >= 5 },
    { level: 10, title: "Adept Wizard", icon: Trophy, unlocked: level >= 10 },
    { level: 15, title: "Expert Wizard", icon: Crown, unlocked: level >= 15 },
    { level: 20, title: "Master Wizard", icon: Sparkles, unlocked: level >= 20 }
  ];

  // Generate realistic recent activity based on user stats
  const recentActivity = [
    ...(viewerStats.videosWatched > 0 ? [
      { id: 1, type: "video", title: "Latest video watched", xp: 150, time: "2 hours ago" }
    ] : []),
    ...(achievements.filter(a => a.unlocked).length > 0 ? [
      { id: 2, type: "achievement", title: `${achievements.filter(a => a.unlocked)[0]?.title} unlocked`, xp: 100, time: "1 day ago" }
    ] : []),
    ...(viewerStats.videosWatched > 1 ? [
      { id: 3, type: "video", title: "Video completion", xp: 200, time: "2 days ago" }
    ] : []),
    ...(viewerStats.streakDays >= 7 ? [
      { id: 4, type: "streak", title: `${viewerStats.streakDays}-day streak milestone`, xp: 500, time: "3 days ago" }
    ] : []),
    ...(viewerStats.videosWatched === 0 ? [
      { id: 5, type: "welcome", title: "Welcome to WIZ! Start watching videos to earn XP", xp: 0, time: "Today" }
    ] : [])
  ].slice(0, 4); // Show max 4 items

  const handleCopyReferral = async () => {
    const referralLink = `${window.location.origin}?ref=${user?.uid || 'demo'}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  if (!user) return null;

  // Show loading state while stats are being fetched
  if (viewerStats.loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Card className="w-full max-w-md border-0 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-purple-500/20 border-t-purple-500"
            />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Loading Your Stats...</h3>
            <p className="text-slate-600 text-sm">
              Fetching your magical progress data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 p-1", className)}>
      {/* Glassmorphic Hero Section */}
      <motion.div 
        className="relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background with glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent" />
        
        <div className="relative p-8">
          <div className="flex items-center space-x-6">
            {/* Avatar with XP Aura Ring */}
            <div className="relative">
              <motion.div
                className={cn(
                  "absolute -inset-4 rounded-full bg-gradient-to-r opacity-75",
                  getAuraColor(level)
                )}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className={cn(
                  "absolute -inset-3 rounded-full bg-gradient-to-r opacity-50",
                  getAuraColor(level)
                )}
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              
              <Avatar className="relative w-24 h-24 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-2xl">
                  {user.displayName?.charAt(0) || 'W'}
                </AvatarFallback>
              </Avatar>
              
              {/* XP Spark Animations */}
              <AnimatePresence>
                {sparkAnimation && (
                  <motion.div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                        style={{ left: '50%', top: '50%' }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 100],
                          y: [0, (Math.random() - 0.5) * 100],
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{ duration: 2, delay: i * 0.1 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-800 mb-1 drop-shadow-sm">{user.displayName}</h2>
              <p className="text-slate-600 text-sm mb-3">{user.email}</p>
              
              <div className="flex items-center space-x-3 mb-4">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-3 py-1 text-sm font-medium">
                  <Crown className="w-4 h-4 mr-1" />
                  {getLevelTitle(level)}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-slate-800 border-white/30 px-3 py-1 text-sm font-medium">
                  Level {level}
                </Badge>
              </div>

              {/* Streak Counter */}
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center space-x-1 bg-orange-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-orange-400/30"
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-800 font-medium text-sm">{viewerStats.streakDays} day streak</span>
                </motion.div>
              </div>
            </div>

            {/* Progress Orb */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">{Math.round(progressPercent || 0)}%</div>
                  <div className="text-xs text-slate-600 font-medium">to next</div>
                </div>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent"
                style={{
                  background: `conic-gradient(from 0deg, transparent ${(progressPercent || 0) * 3.6}deg, rgba(255,255,255,0.3) ${(progressPercent || 0) * 3.6}deg)`,
                  borderRadius: '50%'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* XP Journey Track */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-slate-800 font-semibold drop-shadow-sm">XP Journey</h3>
              <span className="text-slate-600 text-sm font-medium">{xpInCurrentLevel || 0} / {(xpInCurrentLevel || 0) + (xpToNextLevel || 100)} XP</span>
            </div>
            
            {/* Journey Track */}
            <div className="relative">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent || 0}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              
              {/* Milestones */}
              <div className="absolute -top-2 left-0 right-0 flex justify-between">
                {milestones.map((milestone, index) => {
                  const IconComponent = milestone.icon;
                  return (
                    <motion.div
                      key={milestone.level}
                      className={cn(
                        "w-7 h-7 rounded-full border-2 flex items-center justify-center",
                        milestone.unlocked
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 border-yellow-300 text-white"
                          : "bg-white/10 border-white/20 text-white/50"
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.2 }}
                    >
                      <IconComponent className="w-3 h-3" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Elegant Stat Cards */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-4"
      )}>
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Dialog key={card.id}>
              <DialogTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="cursor-pointer"
                >
                  <Card className={cn(
                    "relative overflow-hidden border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl",
                    card.shadowColor
                  )}>
                    <div className={cn("absolute inset-0 bg-gradient-to-r opacity-10", card.gradient)} />
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center",
                          card.gradient
                        )}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Sparkles className="w-4 h-4 text-white/50" />
                        </motion.div>
                      </div>
                      <div className="text-2xl font-bold text-slate-800 mb-1 drop-shadow-sm">{card.value}</div>
                      <div className="text-slate-600 text-sm font-medium">{card.title}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5" />
                    <span>{card.title}</span>
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={cn(
          "grid w-full",
          isMobile ? "grid-cols-2" : "grid-cols-4",
          "bg-white/5 backdrop-blur-xl border-0"
        )}>
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
            <BarChart3 className="w-4 h-4 mr-2" />
            {!isMobile && "Overview"}
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-white/20">
            <Activity className="w-4 h-4 mr-2" />
            {!isMobile && "Activity"}
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-white/20">
            <Trophy className="w-4 h-4 mr-2" />
            {!isMobile && "Achievements"}
          </TabsTrigger>
          <TabsTrigger value="statistics" className="data-[state=active]:bg-white/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            {!isMobile && "Stats"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          {/* Recent Achievements */}
          <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800 font-semibold">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg bg-gradient-to-r flex items-center justify-center",
                      achievement.gradient
                    )}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-800 font-semibold">{achievement.title}</div>
                      <div className="text-slate-600 text-sm">{achievement.description}</div>
                    </div>
                    <div className="text-slate-500 text-xs font-medium">{achievement.unlockedAt}</div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          {/* Invite Friends */}
          <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800 font-semibold">
                <Gift className="w-5 h-5 mr-2 text-green-500" />
                Invite Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm mb-4">
                Get 50 XP for each friend who joins your magical journey!
              </p>
              <Button
                onClick={handleCopyReferral}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
              >
                {copiedReferral ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Referral Link
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-800 font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {activity.type === 'video' && <Play className="w-4 h-4 text-white" />}
                      {activity.type === 'achievement' && <Trophy className="w-4 h-4 text-white" />}
                      {activity.type === 'streak' && <Flame className="w-4 h-4 text-white" />}
                      {activity.type === 'welcome' && <Star className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-slate-800 font-semibold text-sm">{activity.title}</div>
                      <div className="text-slate-600 text-xs">{activity.time}</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold text-sm">
                    {activity.xp > 0 ? `+${activity.xp} XP` : 'Start your journey!'}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className={cn(
                    "border-0 backdrop-blur-xl relative overflow-hidden",
                    achievement.unlocked 
                      ? "bg-white/10" 
                      : "bg-white/5 opacity-60"
                  )}>
                    <div className={cn(
                      "absolute inset-0 opacity-20",
                      achievement.unlocked 
                        ? `bg-gradient-to-br ${achievement.gradient}`
                        : "bg-gradient-to-br from-gray-500 to-gray-600"
                    )} />
                    <CardContent className="p-4 relative text-center">
                      <div className={cn(
                        "w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center",
                        achievement.unlocked
                          ? `bg-gradient-to-r ${achievement.gradient}`
                          : "bg-gray-500"
                      )}>
                        {achievement.unlocked ? (
                          <IconComponent className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <h3 className={cn(
                        "font-semibold text-sm mb-1",
                        achievement.unlocked ? "text-slate-800" : "text-slate-400"
                      )}>{achievement.title}</h3>
                      <p className={cn(
                        "text-xs mb-2",
                        achievement.unlocked ? "text-slate-600" : "text-slate-400"
                      )}>{achievement.description}</p>
                      <p className="text-slate-500 text-xs">{achievement.requirement}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-800 font-semibold">Your Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{viewerStats.totalWatchTimeHours}h</div>
                  <div className="text-slate-600 text-sm font-medium">Total Watch Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-600 bg-clip-text text-transparent">{viewerStats.avgWatchTimePerVideo}m</div>
                  <div className="text-slate-600 text-sm font-medium">Avg per Video</div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">{viewerStats.videosCompleted}</div>
                  <div className="text-slate-600 text-sm font-medium">Videos Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">{Math.round((totalXP || 0) / (viewerStats.videosWatched || 1))}</div>
                  <div className="text-slate-600 text-sm font-medium">XP per Video</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};