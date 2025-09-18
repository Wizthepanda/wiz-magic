import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, TrendingUp, Zap, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  id: string;
  displayName: string;
  avatar?: string;
  level: number;
  totalXP: number;
  rank: number;
  isCurrentUser?: boolean;
  xpGained24h?: number;
  xpGained7d?: number;
  streak?: number;
  rankChange?: number; // positive = up, negative = down
}

interface FullLeaderboardPageProps {
  users?: LeaderboardUser[];
  currentUser?: LeaderboardUser;
  timeframe?: '24h' | '7d' | 'all-time';
  onTimeframeChange?: (timeframe: '24h' | '7d' | 'all-time') => void;
}

export const FullLeaderboardPage: React.FC<FullLeaderboardPageProps> = ({
  users = [],
  currentUser,
  timeframe = '24h',
  onTimeframeChange
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  // Mock data if none provided
  const mockUsers: LeaderboardUser[] = [
    {
      id: '1',
      displayName: 'Alex Chen',
      avatar: '/api/placeholder/60/60',
      level: 10,
      totalXP: 12500,
      rank: 1,
      xpGained24h: 320,
      xpGained7d: 1850,
      streak: 15,
      rankChange: 1
    },
    {
      id: '2',
      displayName: 'Sarah Kim',
      avatar: '/api/placeholder/60/60',
      level: 9,
      totalXP: 11800,
      rank: 2,
      xpGained24h: 280,
      xpGained7d: 1650,
      streak: 12,
      rankChange: -1
    },
    {
      id: '3',
      displayName: 'Mike Johnson',
      avatar: '/api/placeholder/60/60',
      level: 9,
      totalXP: 11200,
      rank: 3,
      xpGained24h: 195,
      xpGained7d: 1420,
      streak: 8,
      rankChange: 2
    },
    // Generate more users for the list
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `user-${i + 4}`,
      displayName: `Player ${i + 4}`,
      avatar: '/api/placeholder/40/40',
      level: Math.floor(Math.random() * 8) + 1,
      totalXP: Math.floor(Math.random() * 10000) + 1000,
      rank: i + 4,
      xpGained24h: Math.floor(Math.random() * 200) + 50,
      xpGained7d: Math.floor(Math.random() * 1000) + 300,
      streak: Math.floor(Math.random() * 10) + 1,
      rankChange: Math.floor(Math.random() * 6) - 3
    }))
  ];

  const mockCurrentUser: LeaderboardUser = {
    id: 'current',
    displayName: 'You',
    avatar: '/api/placeholder/40/40',
    level: 7,
    totalXP: 8900,
    rank: 12,
    isCurrentUser: true,
    xpGained24h: 180,
    xpGained7d: 950,
    streak: 5,
    rankChange: 3
  };

  const displayUsers = users.length > 0 ? users : mockUsers;
  const displayCurrentUser = currentUser || mockCurrentUser;

  const topThree = displayUsers.slice(0, 3);
  const otherUsers = displayUsers.slice(3);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getPodiumStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
          glow: 'shadow-yellow-500/40',
          height: 'h-32',
          icon: <Crown className="w-8 h-8 text-yellow-600" />,
          bg: 'bg-gradient-to-br from-yellow-50 to-orange-50'
        };
      case 2:
        return {
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          glow: 'shadow-gray-400/30',
          height: 'h-28',
          icon: <Medal className="w-7 h-7 text-gray-500" />,
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50'
        };
      case 3:
        return {
          gradient: 'from-amber-400 via-amber-500 to-amber-600',
          glow: 'shadow-amber-500/30',
          height: 'h-24',
          icon: <Medal className="w-6 h-6 text-amber-600" />,
          bg: 'bg-gradient-to-br from-amber-50 to-orange-50'
        };
      default:
        return {
          gradient: 'from-blue-400 to-purple-500',
          glow: 'shadow-blue-400/20',
          height: 'h-20',
          icon: <Trophy className="w-5 h-5 text-blue-500" />,
          bg: 'bg-gradient-to-br from-blue-50 to-purple-50'
        };
    }
  };

  const getLevelProgress = (level: number, xp: number) => {
    const baseXPForLevel = level * 1000;
    const xpInCurrentLevel = xp % 1000;
    return (xpInCurrentLevel / 1000) * 100;
  };

  const getRankChangeIcon = (change?: number) => {
    if (!change || change === 0) return null;

    return change > 0 ? (
      <div className="flex items-center gap-1 text-green-600">
        <ArrowUp className="w-3 h-3" />
        <span className="text-xs font-medium">+{change}</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-red-500">
        <ArrowDown className="w-3 h-3" />
        <span className="text-xs font-medium">{change}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{
      background: `
        radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)
      `
    }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-600" />
            Leaderboard
          </h1>
          <p className="text-gray-600 text-lg">Compete with the best WIZ learners</p>

          {/* Timeframe Selector */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {(['24h', '7d', 'all-time'] as const).map((period) => (
              <button
                key={period}
                onClick={() => onTimeframeChange?.(period)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  timeframe === period
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                )}
              >
                {period === '24h' ? 'Last 24h' : period === '7d' ? 'Last 7 days' : 'All Time'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-end justify-center gap-8 max-w-4xl mx-auto">
            {topThree.map((user, index) => {
              const styles = getPodiumStyles(user.rank);
              const isCenter = user.rank === 1;

              return (
                <motion.div
                  key={user.id}
                  className={cn(
                    "relative flex flex-col items-center",
                    isCenter ? "order-2" : user.rank === 2 ? "order-1" : "order-3"
                  )}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 + index * 0.2 }}
                >
                  {/* User Card */}
                  <motion.div
                    className={cn(
                      "relative p-6 rounded-2xl shadow-2xl mb-4 min-w-[200px]",
                      styles.bg,
                      styles.glow
                    )}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Rank Icon */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                        `bg-gradient-to-r ${styles.gradient}`
                      )}>
                        {styles.icon}
                      </div>
                    </div>

                    {/* Avatar with XP Ring */}
                    <div className="flex flex-col items-center mt-6">
                      <div className="relative mb-4">
                        <div className={cn("w-20 h-20 rounded-full overflow-hidden relative", isCenter && "w-24 h-24")}>
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                              cx="50%"
                              cy="50%"
                              r={isCenter ? "44" : "36"}
                              stroke="rgba(156, 163, 175, 0.3)"
                              strokeWidth="3"
                              fill="none"
                            />
                            <motion.circle
                              cx="50%"
                              cy="50%"
                              r={isCenter ? "44" : "36"}
                              stroke={`url(#podiumProgress${user.rank})`}
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: getLevelProgress(user.level, user.totalXP) / 100 }}
                              transition={{ duration: 2, ease: "easeOut", delay: 1 + index * 0.3 }}
                            />
                            <defs>
                              <linearGradient id={`podiumProgress${user.rank}`}>
                                <stop offset="0%" stopColor={user.rank === 1 ? "#F59E0B" : "#3B82F6"} />
                                <stop offset="100%" stopColor={user.rank === 1 ? "#EAB308" : "#8B5CF6"} />
                              </linearGradient>
                            </defs>
                          </svg>
                          <img
                            src={user.avatar || '/default-avatar.png'}
                            alt={user.displayName}
                            className={cn(
                              "rounded-full object-cover absolute top-2 left-2",
                              isCenter ? "w-20 h-20" : "w-16 h-16"
                            )}
                          />
                        </div>

                        {/* Level Badge */}
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                          {user.level}
                        </div>
                      </div>

                      <h3 className={cn("font-bold text-gray-900 mb-1", isCenter ? "text-xl" : "text-lg")}>
                        {user.displayName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {user.totalXP.toLocaleString()} XP
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 font-medium">
                            +{timeframe === '24h' ? user.xpGained24h : user.xpGained7d}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-600 font-medium">
                            {user.streak}d
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Podium Base */}
                  <motion.div
                    className={cn(
                      "w-32 rounded-t-lg",
                      styles.height,
                      `bg-gradient-to-t ${styles.gradient}`,
                      styles.glow
                    )}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                    style={{ transformOrigin: 'bottom' }}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Current User Position (if not in top 3) */}
        {displayCurrentUser && displayCurrentUser.rank > 3 && (
          <motion.div
            className="mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    #{displayCurrentUser.rank}
                  </div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="2" fill="none" />
                        <motion.circle
                          cx="24" cy="24" r="20"
                          stroke="url(#currentUserProgress)"
                          strokeWidth="2" fill="none" strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: getLevelProgress(displayCurrentUser.level, displayCurrentUser.totalXP) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="currentUserProgress">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <img
                        src={displayCurrentUser.avatar || '/default-avatar.png'}
                        alt={displayCurrentUser.displayName}
                        className="w-8 h-8 rounded-full object-cover absolute top-2 left-2"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">Your Position</h3>
                    {getRankChangeIcon(displayCurrentUser.rankChange)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Level {displayCurrentUser.level} • {displayCurrentUser.totalXP.toLocaleString()} XP
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      +{timeframe === '24h' ? displayCurrentUser.xpGained24h : displayCurrentUser.xpGained7d}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">{displayCurrentUser.streak} day streak</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rest of Leaderboard */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rankings</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {otherUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 + index * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group",
                    user.isCurrentUser && "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      #{user.rank}
                    </div>

                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="20" cy="20" r="16" stroke="rgba(156, 163, 175, 0.3)" strokeWidth="1.5" fill="none" />
                          <motion.circle
                            cx="20" cy="20" r="16"
                            stroke="url(#listProgress)"
                            strokeWidth="1.5" fill="none" strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={animationComplete ? { pathLength: getLevelProgress(user.level, user.totalXP) / 100 } : {}}
                            transition={{ duration: 1, ease: "easeOut", delay: 2.5 + index * 0.1 }}
                          />
                          <defs>
                            <linearGradient id="listProgress">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <img
                          src={user.avatar || '/default-avatar.png'}
                          alt={user.displayName}
                          className="w-6 h-6 rounded-full object-cover absolute top-2 left-2"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {user.level}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{user.displayName}</h3>
                        {getRankChangeIcon(user.rankChange)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {user.totalXP.toLocaleString()} XP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-green-600 font-medium">
                        +{timeframe === '24h' ? user.xpGained24h : user.xpGained7d}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-500" />
                      <span className="text-orange-600 font-medium">{user.streak}d</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};