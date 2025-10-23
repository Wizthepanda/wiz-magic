import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RewardTierCardProps {
  id: string;
  tier: string;
  icon: string;
  title: string;
  description: string;
  xpRequired: number;
  currentXP: number;
  rewards: string[];
  isClaimed?: boolean;
  onClaim?: (id: string) => void;
}

/**
 * RewardTierCard Component (Phase 7)
 * Individual reward tier card with unlock animations and claim functionality
 */
export const RewardTierCard: React.FC<RewardTierCardProps> = ({
  id,
  tier,
  icon,
  title,
  description,
  xpRequired,
  currentXP,
  rewards,
  isClaimed = false,
  onClaim,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isUnlocked = currentXP >= xpRequired && !isClaimed;
  const isLocked = currentXP < xpRequired;
  const progress = Math.min((currentXP / xpRequired) * 100, 100);

  const tierColors = {
    Bronze: 'from-amber-600 to-orange-600',
    Silver: 'from-gray-300 to-gray-500',
    Gold: 'from-amber-400 to-yellow-600',
    Diamond: 'from-cyan-400 to-purple-600',
    Platinum: 'from-purple-400 to-pink-600',
  };

  const gradientClass = tierColors[tier as keyof typeof tierColors] || 'from-purple-500 to-indigo-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 shadow-lg transition-all duration-300',
        isLocked && 'opacity-60',
        isUnlocked && 'border-purple-500 shadow-purple-500/50',
        isClaimed && 'border-green-500 shadow-green-500/30',
        !isUnlocked && !isClaimed && 'border-white/20'
      )}
    >
      {/* Background Gradient */}
      <div className={cn('absolute inset-0 opacity-10 bg-gradient-to-br', gradientClass)} />

      {/* Glassmorphic Background */}
      <div className="relative bg-white/60 backdrop-blur-xl p-6">
        {/* Lock/Claimed Icon */}
        <div className="absolute top-4 right-4">
          {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
          {isClaimed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <CheckCircle className="w-6 h-6 text-green-500" />
            </motion.div>
          )}
        </div>

        {/* Icon & Title */}
        <div className="text-center mb-4">
          <motion.div
            animate={isHovered && !isLocked ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.6 }}
            className="text-6xl mb-3"
          >
            {icon}
          </motion.div>
          <div className={cn('inline-block px-3 py-1 rounded-full text-xs font-bold mb-2', `bg-gradient-to-r ${gradientClass} text-white`)}>
            {tier} Tier
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        {/* XP Requirement */}
        <div className="flex items-center justify-center gap-2 mb-4 text-gray-700">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">
            {xpRequired.toLocaleString()} XP Required
          </span>
        </div>

        {/* Progress Bar (if not claimed) */}
        {!isClaimed && (
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn('h-full bg-gradient-to-r', gradientClass)}
              />
            </div>
            <p className="text-xs text-gray-600 text-center mt-1">
              {currentXP.toLocaleString()} / {xpRequired.toLocaleString()} XP ({progress.toFixed(0)}%)
            </p>
          </div>
        )}

        {/* Rewards List */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Includes:</p>
          <ul className="space-y-1">
            {rewards.map((reward, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-xs text-gray-700"
              >
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{reward}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Claim Button */}
        {isUnlocked && !isClaimed && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button
              onClick={() => onClaim?.(id)}
              className={cn(
                'w-full rounded-xl font-semibold shadow-lg transition-all duration-300',
                `bg-gradient-to-r ${gradientClass} text-white hover:shadow-2xl`
              )}
            >
              <span className="mr-2">🎁</span>
              Claim Reward
            </Button>
          </motion.div>
        )}

        {isClaimed && (
          <div className="text-center py-2 px-4 bg-green-100 rounded-xl">
            <span className="text-sm font-semibold text-green-700">✓ Claimed</span>
          </div>
        )}

        {isLocked && (
          <div className="text-center py-2 px-4 bg-gray-100 rounded-xl">
            <span className="text-sm font-medium text-gray-600">
              {(xpRequired - currentXP).toLocaleString()} XP to unlock
            </span>
          </div>
        )}

        {/* Glow Effect on Hover */}
        {isHovered && isUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn('absolute inset-0 bg-gradient-to-br opacity-20 pointer-events-none', gradientClass)}
          />
        )}
      </div>
    </motion.div>
  );
};
