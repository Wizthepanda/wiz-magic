import { useState } from 'react';
import { Trophy, Crown, Medal, Star, Zap, TrendingUp, TrendingDown, UserPlus, Users, CheckCircle, ChevronDown, Award, Flame, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Creator {
  rank: number;
  name: string;
  xp: number;
  level: number;
  videos: number;
  views: string;
  specialty: string;
  avatar: string;
  verified: boolean;
  weeklyGrowth: string;
  totalFollowers: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface Wizard {
  rank: number;
  name: string;
  avatar: string;
  xpEarned: number;
  streakCount: number;
  streakDays: number;
  topCategories: string[];
  watchTime: string;
  verified: boolean;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

const creators: Creator[] = [
  { 
    rank: 1, 
    name: 'AIGuru42', 
    xp: 125000, 
    level: 47, 
    videos: 89, 
    views: '2.3M', 
    specialty: 'AI',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    verified: true,
    weeklyGrowth: '+15%',
    totalFollowers: '125K',
    trend: 'up',
    trendValue: 3
  },
  { 
    rank: 2, 
    name: 'CodeMaster', 
    xp: 98000, 
    level: 42, 
    videos: 156, 
    views: '1.8M', 
    specialty: 'Tech',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    verified: true,
    weeklyGrowth: '+12%',
    totalFollowers: '203K',
    trend: 'up',
    trendValue: 1
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
    trend: 'down',
    trendValue: -1
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
    trend: 'up',
    trendValue: 2
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
    trend: 'stable',
    trendValue: 0
  },
  { 
    rank: 6, 
    name: 'TechNinja', 
    xp: 58000, 
    level: 30, 
    videos: 203, 
    views: '850K', 
    specialty: 'Tech',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    verified: true,
    weeklyGrowth: '+4%',
    totalFollowers: '92K',
    trend: 'up',
    trendValue: 1
  },
  { 
    rank: 7, 
    name: 'FitnessFreak', 
    xp: 52000, 
    level: 28, 
    videos: 167, 
    views: '720K', 
    specialty: 'Health',
    avatar: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=100&h=100&fit=crop',
    verified: false,
    weeklyGrowth: '+7%',
    totalFollowers: '54K',
    trend: 'up',
    trendValue: 2
  },
  { 
    rank: 8, 
    name: 'CryptoKing', 
    xp: 47000, 
    level: 26, 
    videos: 89, 
    views: '680K', 
    specialty: 'Finance',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
    verified: true,
    weeklyGrowth: '+2%',
    totalFollowers: '78K',
    trend: 'down',
    trendValue: -3
  },
  { 
    rank: 9, 
    name: 'GameMaster', 
    xp: 43000, 
    level: 25, 
    videos: 124, 
    views: '590K', 
    specialty: 'Gaming',
    avatar: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=100&h=100&fit=crop',
    verified: false,
    weeklyGrowth: '+5%',
    totalFollowers: '67K',
    trend: 'stable',
    trendValue: 0
  },
  { 
    rank: 10, 
    name: 'ArtVisionX', 
    xp: 39000, 
    level: 23, 
    videos: 98, 
    views: '520K', 
    specialty: 'Art',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=100&h=100&fit=crop',
    verified: true,
    weeklyGrowth: '+9%',
    totalFollowers: '45K',
    trend: 'up',
    trendValue: 4
  }
];

const wizards: Wizard[] = [
  {
    rank: 1,
    name: 'WizThePanda',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    xpEarned: 45200,
    streakCount: 28,
    streakDays: 28,
    topCategories: ['AI', 'Tech', 'Gaming'],
    watchTime: '127h',
    verified: true,
    trend: 'up',
    trendValue: 2
  },
  {
    rank: 2,
    name: 'CodeNinja92',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    xpEarned: 38900,
    streakCount: 22,
    streakDays: 25,
    topCategories: ['Tech', 'AI', 'Finance'],
    watchTime: '98h',
    verified: false,
    trend: 'up',
    trendValue: 1
  },
  {
    rank: 3,
    name: 'AIEnthusiast',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    xpEarned: 35600,
    streakCount: 19,
    streakDays: 21,
    topCategories: ['AI', 'Music', 'Art'],
    watchTime: '89h',
    verified: true,
    trend: 'down',
    trendValue: -1
  },
  {
    rank: 4,
    name: 'TechWatcher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    xpEarned: 29800,
    streakCount: 15,
    streakDays: 18,
    topCategories: ['Tech', 'Health', 'Finance'],
    watchTime: '76h',
    verified: false,
    trend: 'up',
    trendValue: 3
  },
  {
    rank: 5,
    name: 'MusicLover',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
    xpEarned: 26400,
    streakCount: 13,
    streakDays: 16,
    topCategories: ['Music', 'Art', 'Gaming'],
    watchTime: '65h',
    verified: true,
    trend: 'stable',
    trendValue: 0
  },
  {
    rank: 6,
    name: 'GameFanatic',
    avatar: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=100&h=100&fit=crop',
    xpEarned: 23100,
    streakCount: 11,
    streakDays: 14,
    topCategories: ['Gaming', 'Tech', 'AI'],
    watchTime: '58h',
    verified: false,
    trend: 'up',
    trendValue: 2
  },
  {
    rank: 7,
    name: 'HealthSeeker',
    avatar: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=100&h=100&fit=crop',
    xpEarned: 19800,
    streakCount: 9,
    streakDays: 12,
    topCategories: ['Health', 'Finance', 'Music'],
    watchTime: '52h',
    verified: true,
    trend: 'up',
    trendValue: 1
  },
  {
    rank: 8,
    name: 'ArtExplorer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=100&h=100&fit=crop',
    xpEarned: 17200,
    streakCount: 7,
    streakDays: 10,
    topCategories: ['Art', 'Music', 'AI'],
    watchTime: '45h',
    verified: false,
    trend: 'down',
    trendValue: -2
  },
  {
    rank: 9,
    name: 'FinanceWiz',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
    xpEarned: 14900,
    streakCount: 6,
    streakDays: 8,
    topCategories: ['Finance', 'Tech', 'Health'],
    watchTime: '38h',
    verified: true,
    trend: 'stable',
    trendValue: 0
  },
  {
    rank: 10,
    name: 'CuriositySeeker',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=100&h=100&fit=crop',
    xpEarned: 12600,
    streakCount: 5,
    streakDays: 7,
    topCategories: ['AI', 'Gaming', 'Art'],
    watchTime: '32h',
    verified: false,
    trend: 'up',
    trendValue: 1
  }
];

const XPProgressRing = ({ progress, size = 80, isWizard = false }: { progress: number; size?: number; isWizard?: boolean }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="4"
          fill="transparent"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isWizard ? "url(#wizard-gradient)" : "url(#xp-gradient)"}
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <defs>
        <linearGradient id="xp-gradient" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="wizard-gradient" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </div>
  );
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return null;
  }
};

const getSpecialtyColor = (specialty: string) => {
  const colors = {
    'AI': 'from-purple-500 to-violet-600',
    'Tech': 'from-blue-500 to-cyan-600',
    'Money': 'from-green-500 to-emerald-600',
    'Health': 'from-red-500 to-rose-600',
    'Music': 'from-pink-500 to-purple-600',
    'Gaming': 'from-indigo-500 to-purple-600',
    'Art': 'from-orange-500 to-red-600'
  };
  return colors[specialty as keyof typeof colors] || 'from-gray-500 to-gray-600';
};

const TopThreeCreatorCard = ({ creator, index }: { creator: Creator; index: number }) => {
  const isCenter = creator.rank === 1;
  const progressPercent = ((creator.xp % 1000) / 1000) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "relative group cursor-pointer",
        isCenter ? "order-2 scale-110 z-20" : index === 0 ? "order-1 z-10" : "order-3 z-10"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "hover:scale-105 hover:shadow-2xl",
          isCenter ? "p-8 rounded-3xl" : "p-6 rounded-2xl"
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isCenter 
            ? '0 25px 50px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.1)'
            : '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Rank Badge */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          {getRankIcon(creator.rank)}
          <span className={cn(
            "font-bold text-2xl",
            creator.rank === 1 ? "text-yellow-400" : 
            creator.rank === 2 ? "text-gray-300" :
            "text-amber-600"
          )}>
            #{creator.rank}
          </span>
        </div>

        {/* Trend Indicator */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
          {creator.trend === 'up' && (
            <div className="flex items-center space-x-1 text-green-500">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium">+{creator.trendValue}</span>
            </div>
          )}
          {creator.trend === 'down' && (
            <div className="flex items-center space-x-1 text-red-500">
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium">{creator.trendValue}</span>
            </div>
          )}
        </div>

        {/* Avatar with XP Ring */}
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="relative mb-3 sm:mb-4">
            <XPProgressRing progress={progressPercent} size={isCenter ? 90 : 70} />
            <Avatar className={cn(
              "absolute inset-2",
              isCenter ? "w-16 h-16 sm:w-20 sm:h-20" : "w-12 h-12 sm:w-16 sm:h-16"
            )}>
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                {creator.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Creator Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <h3 className={cn(
                "font-bold",
                isCenter ? "text-xl" : "text-lg"
              )} style={{
                color: '#1A1A1A'
              }}>
                {creator.name}
              </h3>
              {creator.verified && (
                <CheckCircle className="w-4 h-4 text-blue-400" />
              )}
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="font-semibold" style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {(creator.xp / 1000).toFixed(1)}K XP
              </span>
            </div>

            <Badge 
              className="text-xs font-medium text-white border-0 px-3 py-1"
              style={{
                background: `linear-gradient(135deg, ${getSpecialtyColor(creator.specialty)})`
              }}
            >
              {creator.specialty}
            </Badge>
          </div>
        </div>

        {/* Follow Button */}
        <Button
          size="sm"
          className={cn(
            "w-full bg-white/10 hover:bg-white/20 text-white border-white/20",
            "transition-all duration-200 backdrop-blur-sm"
          )}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </Button>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div 
            className="absolute inset-0 rounded-3xl blur-xl"
            style={{
              background: creator.rank === 1 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))'
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

const TopThreeWizardCard = ({ wizard, index }: { wizard: Wizard; index: number }) => {
  const isCenter = wizard.rank === 1;
  const streakPercent = Math.min((wizard.streakCount / 30) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "relative group cursor-pointer",
        isCenter ? "order-2 scale-110 z-20" : index === 0 ? "order-1 z-10" : "order-3 z-10"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-lg hover:shadow-xl",
          "hover:scale-105",
          isCenter ? "p-6 sm:p-8 rounded-3xl" : "p-4 sm:p-6 rounded-2xl",
          "w-full max-w-[280px] sm:max-w-none"
        )}
      >
        {/* Rank Badge */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex items-center space-x-2">
          {getRankIcon(wizard.rank)}
          <span className={cn(
            "font-bold text-lg sm:text-2xl",
            wizard.rank === 1 ? "text-yellow-500" : 
            wizard.rank === 2 ? "text-gray-500" :
            "text-amber-600"
          )}>
            #{wizard.rank}
          </span>
        </div>

        {/* Trend Indicator */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
          {wizard.trend === 'up' && (
            <div className="flex items-center space-x-1 text-green-500">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium">+{wizard.trendValue}</span>
            </div>
          )}
          {wizard.trend === 'down' && (
            <div className="flex items-center space-x-1 text-red-500">
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs font-medium">{wizard.trendValue}</span>
            </div>
          )}
        </div>

        {/* Avatar with Streak Ring */}
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <div className="relative mb-3 sm:mb-4">
            <XPProgressRing progress={streakPercent} size={isCenter ? 90 : 70} isWizard />
            <Avatar className={cn(
              "absolute inset-2",
              isCenter ? "w-16 h-16 sm:w-20 sm:h-20" : "w-12 h-12 sm:w-16 sm:h-16"
            )}>
              <AvatarImage src={wizard.avatar} alt={wizard.name} />
              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                {wizard.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Wizard Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <h3 className={cn(
                "font-bold text-gray-900",
                isCenter ? "text-lg sm:text-xl" : "text-base sm:text-lg"
              )}>
                {wizard.name}
              </h3>
              {wizard.verified && (
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
              )}
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="font-semibold" style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {(wizard.xpEarned / 1000).toFixed(1)}K XP
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium" style={{ color: '#6F6F6F' }}>
                {wizard.streakCount} day streak
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {wizard.topCategories.slice(0, 2).map((category) => (
                <Badge 
                  key={category}
                  className="text-xs font-medium text-white border-0 px-2 py-1"
                  style={{
                    background: `linear-gradient(135deg, ${getSpecialtyColor(category)})`
                  }}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Follow Button */}
        <Button
          size="sm"
          className={cn(
            "w-full bg-gray-800 hover:bg-gray-900 text-white border-0",
            "transition-all duration-200 text-xs sm:text-sm"
          )}
        >
          <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Follow
        </Button>

      </div>
    </motion.div>
  );
};

const CompactCreatorRow = ({ creator, index }: { creator: Creator; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: (index - 3) * 0.05 }}
      className="group"
    >
      <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border border-gray-100 shadow-sm hover:shadow-md">
        {/* Rank */}
        <div className="flex-shrink-0 w-6 sm:w-8 text-center">
          <span className="text-base sm:text-lg font-bold text-gray-700">#{creator.rank}</span>
        </div>

        {/* Avatar with Mini XP Ring */}
        <div className="relative flex-shrink-0">
          <XPProgressRing progress={((creator.xp % 1000) / 1000) * 100} size={40} />
          <Avatar className="absolute inset-1 w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm font-bold">
              {creator.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Creator Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <h4 className="font-semibold truncate text-gray-900 text-sm sm:text-base">{creator.name}</h4>
            {creator.verified && (
              <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
            <span className="text-xs sm:text-sm font-medium" style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ⚡ {(creator.xp / 1000).toFixed(1)}K XP
            </span>
            <Badge 
              className="text-xs font-medium text-white border-0 px-1.5 sm:px-2 py-0.5 hidden sm:inline-flex"
              style={{
                background: `linear-gradient(135deg, ${getSpecialtyColor(creator.specialty)})`
              }}
            >
              {creator.specialty}
            </Badge>
          </div>
        </div>

        {/* Trend & Follow */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Trend */}
          <div className="text-center hidden sm:block">
            {creator.trend === 'up' && (
              <div className="flex flex-col items-center text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">+{creator.trendValue}</span>
              </div>
            )}
            {creator.trend === 'down' && (
              <div className="flex flex-col items-center text-red-500">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs">{creator.trendValue}</span>
              </div>
            )}
            {creator.trend === 'stable' && (
              <div className="flex flex-col items-center text-gray-400">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-0.5 bg-gray-400 rounded" />
                </div>
                <span className="text-xs">0</span>
              </div>
            )}
          </div>

          {/* Follow Button */}
          <Button
            size="sm"
            className="bg-gray-800 hover:bg-gray-900 text-white border-0 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <UserPlus className="w-3 h-3 mr-0 sm:mr-1" />
            <span className="hidden sm:inline">Follow</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CompactWizardRow = ({ wizard, index }: { wizard: Wizard; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: (index - 3) * 0.05 }}
      className="group"
    >
      <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] cursor-pointer bg-white border border-gray-100 shadow-sm hover:shadow-md">
        {/* Rank */}
        <div className="flex-shrink-0 w-6 sm:w-8 text-center">
          <span className="text-base sm:text-lg font-bold text-gray-700">#{wizard.rank}</span>
        </div>

        {/* Avatar with Mini Streak Ring */}
        <div className="relative flex-shrink-0">
          <XPProgressRing progress={Math.min((wizard.streakCount / 30) * 100, 100)} size={40} isWizard />
          <Avatar className="absolute inset-1 w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={wizard.avatar} alt={wizard.name} />
            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs sm:text-sm font-bold">
              {wizard.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Wizard Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <h4 className="font-semibold truncate text-gray-900 text-sm sm:text-base">{wizard.name}</h4>
            {wizard.verified && (
              <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 mt-1">
            <span className="text-xs sm:text-sm font-medium" style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ⚡ {(wizard.xpEarned / 1000).toFixed(1)}K XP
            </span>
            <div className="flex items-center space-x-1">
              <Flame className="w-3 h-3 text-red-500" />
              <span className="text-xs font-medium text-gray-600">
                {wizard.streakCount}d
              </span>
            </div>
            <Badge 
              className="text-xs font-medium text-white border-0 px-1.5 sm:px-2 py-0.5 hidden sm:inline-flex"
              style={{
                background: `linear-gradient(135deg, ${getSpecialtyColor(wizard.topCategories[0])})`
              }}
            >
              {wizard.topCategories[0]}
            </Badge>
          </div>
        </div>

        {/* Trend & Follow */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          {/* Trend */}
          <div className="text-center hidden sm:block">
            {wizard.trend === 'up' && (
              <div className="flex flex-col items-center text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">+{wizard.trendValue}</span>
              </div>
            )}
            {wizard.trend === 'down' && (
              <div className="flex flex-col items-center text-red-500">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs">{wizard.trendValue}</span>
              </div>
            )}
            {wizard.trend === 'stable' && (
              <div className="flex flex-col items-center text-gray-400">
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-0.5 bg-gray-400 rounded" />
                </div>
                <span className="text-xs">0</span>
              </div>
            )}
          </div>

          {/* Follow Button */}
          <Button
            size="sm"
            className="bg-gray-800 hover:bg-gray-900 text-white border-0 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <UserPlus className="w-3 h-3 mr-0 sm:mr-1" />
            <span className="hidden sm:inline">Follow</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export const WizPremiumLeaderboard = () => {
  const [activeTab, setActiveTab] = useState<'creators' | 'wizards'>('creators');
  const [showAll, setShowAll] = useState(false);
  
  const currentData = activeTab === 'creators' ? creators : wizards;
  const topThree = currentData.slice(0, 3);
  const restOfData = currentData.slice(3, showAll ? currentData.length : 10);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 
          className="text-3xl sm:text-4xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          🏆 Leaderboard
        </h2>
        
        {/* Tab Pills */}
        <div className="inline-flex p-1 rounded-full bg-gray-100 border border-gray-200">
          <button
            onClick={() => setActiveTab('creators')}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 relative",
              activeTab === 'creators' 
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            {activeTab === 'creators' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg"
                transition={{ duration: 0.3 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Creators
            </span>
          </button>
          <button
            onClick={() => setActiveTab('wizards')}
            className={cn(
              "px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 relative",
              activeTab === 'wizards' 
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            {activeTab === 'wizards' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full bg-gray-700 shadow-lg"
                transition={{ duration: 0.3 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Wizards
            </span>
          </button>
        </div>

        <p className="text-base sm:text-lg font-medium text-gray-600">
          {activeTab === 'creators' ? '🎥 top creators this week' : '🧙‍♂️ top wizards this week'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Top 3 Podium */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-4 sm:gap-6 px-2 sm:px-4">
            {topThree.map((item, index) => (
              activeTab === 'creators' 
                ? <TopThreeCreatorCard key={item.rank} creator={item as Creator} index={index} />
                : <TopThreeWizardCard key={item.rank} wizard={item as Wizard} index={index} />
            ))}
          </div>

          {/* Ranks 4-10+ */}
          <div className="space-y-4">
            <div className="space-y-2 sm:space-y-3">
              {restOfData.map((item, index) => (
                activeTab === 'creators'
                  ? <CompactCreatorRow key={item.rank} creator={item as Creator} index={index + 3} />
                  : <CompactWizardRow key={item.rank} wizard={item as Wizard} index={index + 3} />
              ))}
            </div>

            {/* Show All Toggle */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 text-sm sm:text-base"
              >
                {showAll ? 'Show Less' : `Show All ${activeTab === 'creators' ? 'Creators' : 'Wizards'}`}
                <ChevronDown className={cn(
                  "w-4 h-4 ml-2 transition-transform duration-200",
                  showAll && "rotate-180"
                )} />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* SVG Gradients */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="xp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="wizard-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};