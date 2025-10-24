import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, MessageCircle, TrendingUp, Crown, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  badges: string[];
  postCount: number;
  commentCount: number;
  trend?: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
  onProfileClick?: (userId: string) => void;
}

/**
 * LeaderboardCard Component
 * - Displays user ranking in community
 * - Special podium design for top 3
 * - Hover effects with pulse animation
 * - Badge and ZAPs display
 * - Trend indicators
 */
export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  rank,
  userId,
  name,
  avatar,
  xp,
  level,
  badges,
  postCount,
  commentCount,
  trend = 'same',
  isCurrentUser = false,
  onProfileClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isTopThree = rank <= 3;

  // Get rank styling
  const getRankStyle = () => {
    switch (rank) {
      case 1:
        return {
          gradient: 'from-amber-400 via-yellow-500 to-amber-600',
          glow: 'shadow-amber-500/50',
          border: 'border-amber-400',
          icon: <Crown className="w-5 h-5 text-amber-600" />,
          medal: '🥇',
        };
      case 2:
        return {
          gradient: 'from-gray-300 via-gray-400 to-gray-500',
          glow: 'shadow-gray-400/50',
          border: 'border-gray-400',
          icon: <Medal className="w-5 h-5 text-gray-600" />,
          medal: '🥈',
        };
      case 3:
        return {
          gradient: 'from-amber-600 via-orange-600 to-amber-700',
          glow: 'shadow-orange-500/50',
          border: 'border-orange-400',
          icon: <Medal className="w-5 h-5 text-orange-600" />,
          medal: '🥉',
        };
      default:
        return {
          gradient: 'from-purple-500 to-indigo-500',
          glow: 'shadow-purple-500/30',
          border: 'border-white/20',
          icon: null,
          medal: null,
        };
    }
  };

  const rankStyle = getRankStyle();

  const handleClick = () => {
    onProfileClick?.(userId);
  };

  return (
    <motion.div
      whileHover={{ scale: isTopThree ? 1.02 : 1.01, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all duration-300',
        isTopThree
          ? `bg-gradient-to-br ${rankStyle.gradient} bg-opacity-10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl ${rankStyle.glow} border-2 ${rankStyle.border}`
          : 'bg-white/60 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20',
        isCurrentUser && 'ring-2 ring-purple-500 ring-offset-2',
        isHovered && !isTopThree && 'shadow-xl'
      )}
    >
      {/* Rank Badge */}
      <div className="absolute top-3 left-3">
        {isTopThree ? (
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl"
          >
            {rankStyle.medal}
          </motion.div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">#{rank}</span>
          </div>
        )}
      </div>

      {/* Trend Indicator */}
      {trend !== 'same' && (
        <div className="absolute top-3 right-3">
          <TrendingUp
            className={cn(
              'w-5 h-5',
              trend === 'up' ? 'text-green-500 rotate-0' : 'text-red-500 rotate-180'
            )}
          />
        </div>
      )}

      {/* Content */}
      <div className={cn('flex items-center gap-4', isTopThree && 'pl-12')}>
        {/* Avatar with ZAP Ring */}
        <div className="relative">
          <motion.div
            animate={isHovered ? { rotate: 360 } : {}}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="absolute -inset-1.5"
          >
            <div
              className={cn(
                'w-full h-full rounded-full',
                isTopThree
                  ? `bg-gradient-to-r ${rankStyle.gradient}`
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              )}
              style={{
                maskImage: `conic-gradient(from 0deg, transparent ${360 - (level / 50) * 360}deg, black ${360 - (level / 50) * 360}deg)`,
              }}
            />
          </motion.div>
          <Avatar
            className={cn(
              'border-4 border-white shadow-lg',
              isTopThree ? 'w-16 h-16 md:w-20 md:h-20' : 'w-14 h-14'
            )}
          >
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold text-lg">
              {name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'font-bold truncate',
                isTopThree ? 'text-xl md:text-2xl' : 'text-lg',
                isTopThree && rank === 1 ? 'text-amber-900' : 'text-gray-900'
              )}
            >
              {name}
            </h3>
            {badges.length > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  isTopThree
                    ? 'bg-white/80 backdrop-blur-sm'
                    : 'bg-purple-100 text-purple-700'
                )}
              >
                {badges[0]}
              </Badge>
            )}
          </div>

          {/* ZAPs & ZAP Tier */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <Zap className={cn('w-4 h-4', isTopThree ? 'text-amber-600' : 'text-amber-500')} />
              <span className={cn('font-bold', isTopThree ? 'text-lg' : 'text-sm')}>
                {xp.toLocaleString()}⚡ ZAPs
              </span>
            </div>
            <div className={cn('text-xs font-medium', isTopThree ? 'text-gray-700' : 'text-gray-600')}>
              ZAP Tier {level}
            </div>
          </div>

          {/* Contribution Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{postCount} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount} comments</span>
            </div>
          </div>
        </div>

        {/* Top 3 Icon */}
        {isTopThree && rankStyle.icon && (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            {rankStyle.icon}
          </motion.div>
        )}
      </div>

      {/* Hover Glow */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'absolute inset-0 pointer-events-none',
            isTopThree
              ? `bg-gradient-to-br ${rankStyle.gradient} opacity-10`
              : 'bg-gradient-to-br from-purple-500/5 to-indigo-500/5'
          )}
        />
      )}
    </motion.div>
  );
};
