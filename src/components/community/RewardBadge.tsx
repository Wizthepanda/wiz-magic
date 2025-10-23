import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardBadgeProps {
  icon: LucideIcon;
  action: string;
  xpAmount: number;
  color?: string;
  onClick?: () => void;
}

/**
 * RewardBadge Component (Phase 4)
 * - Display earn action cards
 * - Icon, action name, XP amount
 * - Hover bounce + glow effects
 */
export const RewardBadge: React.FC<RewardBadgeProps> = ({
  icon: Icon,
  action,
  xpAmount,
  color = 'purple',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorClasses = {
    purple: {
      bg: 'from-purple-500 to-indigo-500',
      glow: 'shadow-purple-500/50',
      text: 'text-purple-600',
      lightBg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    amber: {
      bg: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/50',
      text: 'text-amber-600',
      lightBg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      glow: 'shadow-green-500/50',
      text: 'text-green-600',
      lightBg: 'bg-green-50',
      border: 'border-green-200',
    },
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/50',
      text: 'text-blue-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    pink: {
      bg: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/50',
      text: 'text-pink-600',
      lightBg: 'bg-pink-50',
      border: 'border-pink-200',
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.purple;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer bg-white/60 backdrop-blur-xl rounded-2xl p-6 border-2 transition-all duration-300',
        isHovered ? `${colors.border} shadow-2xl ${colors.glow}` : 'border-white/20 shadow-lg'
      )}
    >
      {/* Icon Container with Gradient */}
      <motion.div
        animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={cn(
          'w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center',
          colors.bg
        )}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>

      {/* Action Name */}
      <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
        {action}
      </h3>

      {/* XP Amount */}
      <div className={cn('text-center py-2 px-4 rounded-xl', colors.lightBg)}>
        <span className={cn('text-2xl font-bold', colors.text)}>
          +{xpAmount}
        </span>
        <span className="text-sm text-gray-600 ml-2">XP</span>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10 pointer-events-none',
            colors.bg
          )}
        />
      )}

      {/* Sparkle Effect on Hover */}
      {isHovered && (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-2 right-2 text-2xl"
          >
            ✨
          </motion.div>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-2 left-2 text-xl"
          >
            ⚡
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
