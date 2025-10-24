import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardCardProps {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  xpRequired: number;
  currentXP: number;
  rewards: string[];
  icon: string;
  isUnlocked?: boolean;
}

/**
 * RewardCard Component (Phase 4)
 * - Display individual reward tier information
 * - Icon, title, ZAP requirement, rewards list
 * - Tier-specific styling (amber/slate/yellow/gradient)
 * - Locked/unlocked states with animations
 */
export const RewardCard: React.FC<RewardCardProps> = ({
  tier,
  xpRequired,
  currentXP,
  rewards,
  icon,
  isUnlocked,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate progress percentage
  const progress = Math.min((currentXP / xpRequired) * 100, 100);
  const locked = !isUnlocked && currentXP < xpRequired;

  // Tier-specific styling
  const tierStyles = {
    Bronze: {
      gradient: 'from-amber-600 via-orange-600 to-amber-700',
      glowColor: 'shadow-amber-500/50',
      borderColor: 'border-amber-400',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
      progressBar: 'from-amber-500 to-orange-500',
    },
    Silver: {
      gradient: 'from-gray-300 via-gray-400 to-gray-500',
      glowColor: 'shadow-gray-400/50',
      borderColor: 'border-gray-400',
      bgLight: 'bg-gray-50',
      textColor: 'text-gray-700',
      progressBar: 'from-gray-400 to-gray-500',
    },
    Gold: {
      gradient: 'from-amber-400 via-yellow-500 to-amber-600',
      glowColor: 'shadow-amber-500/70',
      borderColor: 'border-amber-500',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-800',
      progressBar: 'from-yellow-400 to-amber-500',
    },
    Diamond: {
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      glowColor: 'shadow-purple-500/70',
      borderColor: 'border-purple-400',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-800',
      progressBar: 'from-cyan-400 to-purple-500',
    },
  };

  const style = tierStyles[tier];

  return (
    <motion.div
      whileHover={{ scale: locked ? 1.01 : 1.05, y: locked ? 0 : -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 shadow-lg transition-all duration-300',
        locked
          ? 'bg-gray-100/60 backdrop-blur-xl border-gray-300 opacity-60'
          : `bg-white/60 backdrop-blur-xl ${style.borderColor}`,
        isHovered && !locked && `shadow-2xl ${style.glowColor}`
      )}
    >
      {/* Gradient Header */}
      <div
        className={cn(
          'relative p-6 bg-gradient-to-br',
          locked ? 'from-gray-400 to-gray-500' : style.gradient
        )}
      >
        {/* Animated Background Pattern */}
        {!locked && (
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-white"
            style={{ backgroundSize: '200% 200%' }}
          />
        )}

        {/* Lock Icon (for locked tiers) */}
        {locked && (
          <div className="absolute top-4 right-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
        )}

        {/* Unlocked Badge */}
        {isUnlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </motion.div>
        )}

        {/* Tier Icon */}
        <div className="relative z-10 text-center">
          <motion.div
            animate={isHovered && !locked ? { rotate: [0, -5, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-3"
          >
            {icon}
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-1">{tier} Tier</h3>
          <div className="flex items-center justify-center gap-1 text-white/90">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              {xpRequired.toLocaleString()}⚡ ZAPs Required
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {!isUnlocked && (
        <div className="px-6 pt-4">
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn('h-full bg-gradient-to-r', style.progressBar)}
            />
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">
            {currentXP.toLocaleString()} / {xpRequired.toLocaleString()} ZAPs⚡ ({progress.toFixed(0)}
            %)
          </p>
        </div>
      )}

      {/* Rewards List */}
      <div className="p-6">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Trophy className={cn('w-5 h-5', locked ? 'text-gray-500' : style.textColor)} />
          <span>ZAP Rewards</span>
        </h4>
        <ul className="space-y-2">
          {rewards.map((reward, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-2 text-sm"
            >
              <span className={cn('mt-0.5', locked ? 'text-gray-400' : 'text-green-500')}>
                {locked ? '🔒' : '✓'}
              </span>
              <span className={cn(locked ? 'text-gray-500' : 'text-gray-700')}>{reward}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Locked Overlay Message */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 backdrop-blur-[1px]">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border-2 border-gray-400"
          >
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Earn {(xpRequired - currentXP).toLocaleString()}⚡ more ZAPs to unlock
            </p>
          </motion.div>
        </div>
      )}

      {/* Shine Effect on Hover (unlocked only) */}
      {isHovered && !locked && (
        <motion.div
          initial={{ x: '-100%', opacity: 0.3 }}
          animate={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none"
        />
      )}
    </motion.div>
  );
};
