import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Eye, MessageCircle, Share2, Users, Target, TrendingUp } from 'lucide-react';
import { RewardCard } from './RewardCard';
import { RewardBadge } from './RewardBadge';
import { cn } from '@/lib/utils';

interface RewardsTabProps {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  rewardTiers: {
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
    xpRequired: number;
    rewards: string[];
    icon: string;
    isUnlocked?: boolean;
  }[];
  earnActions: {
    icon: any;
    action: string;
    xpAmount: number;
    color: string;
  }[];
}

/**
 * RewardsTab Component (Phase 4)
 * - XP Progress Summary with animated progress bar
 * - Reward tiers grid (Bronze/Silver/Gold/Diamond)
 * - Earn Actions section with bounce hover effects
 * - Locked/unlocked reward states
 * - Gamification elements with live XP updates
 */
export const RewardsTab: React.FC<RewardsTabProps> = ({
  currentXP,
  currentLevel,
  nextLevelXP,
  rewardTiers,
  earnActions,
}) => {
  const [displayXP, setDisplayXP] = useState(currentXP);
  const progressPercentage = (currentXP / nextLevelXP) * 100;

  // Animate XP counter
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = (currentXP - displayXP) / steps;
    let current = displayXP;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayXP(currentXP);
        clearInterval(timer);
      } else {
        setDisplayXP(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentXP]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* XP Progress Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-3xl p-8 md:p-10 shadow-2xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Your Progress
              </h2>
              <p className="text-purple-200">Keep earning XP to unlock exclusive rewards!</p>
            </div>

            {/* Level Badge */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl px-6 py-4 text-center shadow-xl"
            >
              <div className="text-sm text-purple-200 mb-1">Level</div>
              <div className="text-4xl font-bold text-white">{currentLevel}</div>
            </motion.div>
          </div>

          {/* XP Counter */}
          <div className="flex items-baseline gap-3 mb-4">
            <Zap className="w-8 h-8 text-amber-400" />
            <div>
              <motion.span
                key={displayXP}
                initial={{ scale: 1.2, color: '#fbbf24' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-5xl md:text-6xl font-bold text-white"
              >
                {displayXP.toLocaleString()}
              </motion.span>
              <span className="text-2xl text-purple-200 ml-2">
                / {nextLevelXP.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-6 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 relative"
            >
              {/* Shimmer Effect */}
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>

            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
          </div>

          <p className="text-sm text-purple-200 text-center mt-3">
            {(nextLevelXP - currentXP).toLocaleString()} XP until Level {currentLevel + 1}
          </p>
        </div>
      </motion.div>

      {/* Reward Tiers Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-amber-500" />
            Reward Tiers
          </h2>
          <p className="text-gray-600">
            Unlock exclusive perks and benefits as you level up
          </p>
        </motion.div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {rewardTiers.map((tier, index) => (
            <motion.div
              key={tier.tier}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <RewardCard
                tier={tier.tier}
                xpRequired={tier.xpRequired}
                currentXP={currentXP}
                rewards={tier.rewards}
                icon={tier.icon}
                isUnlocked={tier.isUnlocked}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Earn Actions Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-purple-600" />
            How to Earn XP
          </h2>
          <p className="text-gray-600">
            Complete these actions to boost your XP and climb the leaderboard
          </p>
        </motion.div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {earnActions.map((action, index) => (
            <motion.div
              key={action.action}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
            >
              <RewardBadge
                icon={action.icon}
                action={action.action}
                xpAmount={action.xpAmount}
                color={action.color}
                onClick={() => console.log(`Action clicked: ${action.action}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pro Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 border border-purple-200 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Pro Tips for Maximum XP
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Daily Consistency</p>
              <p className="text-gray-600">
                Log in daily and complete at least one action to build your streak
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💎</span>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Quality Over Quantity</p>
              <p className="text-gray-600">
                High-quality posts and helpful comments earn bonus XP from upvotes
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Complete Courses</p>
              <p className="text-gray-600">
                Finishing courses gives massive XP rewards (500-1000 XP per course)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Engage with Others</p>
              <p className="text-gray-600">
                React, comment, and share posts to earn XP while building connections
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
