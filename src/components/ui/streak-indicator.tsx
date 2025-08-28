import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Target } from 'lucide-react';
import { useXp } from '@/context/XpContext';

interface StreakIndicatorProps {
  className?: string;
  showTooltip?: boolean;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ 
  className = '', 
  showTooltip = true 
}) => {
  const { currentStreak, longestStreak, dailyVideosWatched, dailyXp, dailyXpCap } = useXp();
  
  const isStreakActive = currentStreak > 0;
  const dailyProgress = dailyXpCap > 0 ? (dailyXp / dailyXpCap) * 100 : 0;
  const videosNeeded = Math.max(0, 3 - dailyVideosWatched);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Streak Flame */}
      <motion.div
        className="relative"
        animate={isStreakActive ? {
          scale: [1, 1.05, 1],
          rotateZ: [0, 2, -2, 0]
        } : {}}
        transition={{
          duration: 2,
          repeat: isStreakActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <div className={`
          relative p-2 rounded-full transition-all duration-300
          ${isStreakActive 
            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/40' 
            : 'bg-gray-500/10 border-2 border-gray-500/20'
          }
        `}>
          <Flame 
            className={`w-5 h-5 transition-colors duration-300 ${
              isStreakActive ? 'text-orange-500' : 'text-gray-500'
            }`}
            style={{
              filter: isStreakActive 
                ? 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))' 
                : 'none'
            }}
          />
          
          {/* Streak Number Badge */}
          {isStreakActive && (
            <motion.div
              className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                boxShadow: '0 0 12px rgba(249, 115, 22, 0.5)'
              }}
            >
              {currentStreak}
            </motion.div>
          )}
        </div>

        {/* Glow Effect for Active Streak */}
        {isStreakActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>

      {/* Daily Progress Ring */}
      <div className="relative">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
          {/* Background Ring */}
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
          />
          
          {/* Progress Ring */}
          <motion.circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="url(#dailyProgressGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - dailyProgress / 100)}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 12 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 12 * (1 - dailyProgress / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="dailyProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Target className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Stats Text */}
      <div className="text-xs space-y-0.5">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Daily:</span>
          <span className="font-medium text-white">
            {dailyXp}/{dailyXpCap} XP
          </span>
        </div>
        
        {videosNeeded > 0 ? (
          <div className="text-gray-500 text-xs">
            {videosNeeded} more video{videosNeeded !== 1 ? 's' : ''} for streak
          </div>
        ) : (
          <div className="text-orange-400 text-xs">
            Streak ready! 🔥
          </div>
        )}
      </div>

      {/* Tooltip on Hover */}
      {showTooltip && (
        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black/90 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
          <div>Current Streak: {currentStreak} days</div>
          <div>Longest Streak: {longestStreak} days</div>
          <div>Videos Today: {dailyVideosWatched}</div>
          <div>Daily XP: {dailyXp}/{dailyXpCap}</div>
        </div>
      )}
    </div>
  );
};