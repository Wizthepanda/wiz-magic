import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Medal, ExternalLink, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LuxuryCircularIcon } from './luxury-circular-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';

interface LeaderboardUser {
  id: string;
  displayName: string;
  avatar?: string;
  level: number;
  totalXP: number;
  rank: number;
  isCurrentUser?: boolean;
  xpGained24h?: number;
}

interface LeaderboardDropdownProps {
  currentUser?: LeaderboardUser;
  topUsers?: LeaderboardUser[];
  onViewFullLeaderboard?: () => void;
}

export const LeaderboardDropdown: React.FC<LeaderboardDropdownProps> = ({
  currentUser,
  topUsers = [],
  onViewFullLeaderboard
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mock data if none provided
  const mockTopUsers: LeaderboardUser[] = [
    {
      id: '1',
      displayName: 'Alex Chen',
      avatar: '/api/placeholder/40/40',
      level: 10,
      totalXP: 12500,
      rank: 1,
      xpGained24h: 320
    },
    {
      id: '2',
      displayName: 'Sarah Kim',
      avatar: '/api/placeholder/40/40',
      level: 9,
      totalXP: 11800,
      rank: 2,
      xpGained24h: 280
    },
    {
      id: '3',
      displayName: 'Mike Johnson',
      avatar: '/api/placeholder/40/40',
      level: 9,
      totalXP: 11200,
      rank: 3,
      xpGained24h: 195
    },
    {
      id: '4',
      displayName: 'Emma Wilson',
      avatar: '/api/placeholder/40/40',
      level: 8,
      totalXP: 10800,
      rank: 4,
      xpGained24h: 150
    },
    {
      id: '5',
      displayName: 'David Lee',
      avatar: '/api/placeholder/40/40',
      level: 8,
      totalXP: 10500,
      rank: 5,
      xpGained24h: 225
    }
  ];

  const mockCurrentUser: LeaderboardUser = {
    id: 'current',
    displayName: 'You',
    avatar: '/api/placeholder/40/40',
    level: 7,
    totalXP: 8900,
    rank: 12,
    isCurrentUser: true,
    xpGained24h: 180
  };

  const displayTopUsers = topUsers.length > 0 ? topUsers : mockTopUsers;
  const displayCurrentUser = currentUser || mockCurrentUser;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  const getLevelProgress = (level: number, xp: number) => {
    // Simple calculation for demo - in real app this would be more complex
    const baseXPForLevel = level * 1000;
    const xpInCurrentLevel = xp % 1000;
    return (xpInCurrentLevel / 1000) * 100;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <LuxuryCircularIcon
            icon={Trophy}
            isActive={isOpen}
            variant="aurora"
            size="md"
            progressPercent={displayCurrentUser ? getLevelProgress(displayCurrentUser.level, displayCurrentUser.totalXP) : 0}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        variant="premium"
        className="w-80 max-w-[90vw]"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="px-1 py-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Leaderboard
              </h3>
              <div className="text-xs text-gray-500 font-medium">
                Last 24h
              </div>
            </div>

            {/* Current User Position */}
            {displayCurrentUser && (
              <motion.div
                className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* User avatar with XP ring */}
                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="rgba(59, 130, 246, 0.2)"
                          strokeWidth="2"
                          fill="none"
                        />
                        <motion.circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="url(#userProgressGradient)"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: getLevelProgress(displayCurrentUser.level, displayCurrentUser.totalXP) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="userProgressGradient">
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

                    {/* Rank badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      #{displayCurrentUser.rank}
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Your Position</p>
                    <p className="text-sm text-gray-600">
                      Level {displayCurrentUser.level} • {displayCurrentUser.totalXP.toLocaleString()} XP
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        +{displayCurrentUser.xpGained24h} XP today
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Top 5 Users */}
          <div className="px-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Players</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {displayTopUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group cursor-pointer",
                      user.rank <= 3
                        ? "bg-gradient-to-r from-yellow-50/50 to-orange-50/50 hover:from-yellow-50 hover:to-orange-50 border border-yellow-200/50"
                        : "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    )}
                  >
                    {/* Rank indicator */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      user.rank <= 3
                        ? `bg-gradient-to-r ${getRankGradient(user.rank)} text-white`
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {getRankIcon(user.rank)}
                    </div>

                    {/* User avatar with level ring */}
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="rgba(156, 163, 175, 0.3)"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <motion.circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke={`url(#progress${index})`}
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: getLevelProgress(user.level, user.totalXP) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
                          />
                          <defs>
                            <linearGradient id={`progress${index}`}>
                              <stop offset="0%" stopColor={user.rank === 1 ? "#F59E0B" : "#3B82F6"} />
                              <stop offset="100%" stopColor={user.rank === 1 ? "#EAB308" : "#8B5CF6"} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <img
                          src={user.avatar || '/default-avatar.png'}
                          alt={user.displayName}
                          className="w-6 h-6 rounded-full object-cover absolute top-2 left-2"
                        />
                      </div>

                      {/* Level badge */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {user.level}
                      </div>
                    </div>

                    {/* User details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user.totalXP.toLocaleString()} XP
                      </p>
                    </div>

                    {/* 24h XP gain */}
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          +{user.xpGained24h}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Full Leaderboard CTA */}
          <div className="px-1">
            <motion.button
              onClick={onViewFullLeaderboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-200 group shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="w-4 h-4" />
              Full Leaderboard
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};