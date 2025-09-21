import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Sparkles,
  Crown,
  Zap,
  Diamond,
  Gem,
  ExternalLink,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';

interface FeaturedReward {
  id: string;
  name: string;
  icon: React.ReactNode;
  cost: number;
  status: 'available' | 'limited' | 'sold-out';
  timeRemaining?: string;
  gradient: string;
}

interface RewardsDropdownProps {
  currentXP: number;
  onRewardClick?: (rewardId: string) => void;
  onViewAllRewards?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const RewardsDropdown: React.FC<RewardsDropdownProps> = ({
  currentXP = 850,
  onRewardClick,
  onViewAllRewards,
  isOpen = false,
  onOpenChange
}) => {
  const { theme } = useTheme();
  const navigate = useSafeNavigate();
  const [hoveredReward, setHoveredReward] = useState<string | null>(null);

  // Featured rewards data
  const featuredRewards: FeaturedReward[] = [
    {
      id: 'golden-crown',
      name: 'Golden Crown',
      icon: <Crown className="w-5 h-5" />,
      cost: 1200,
      status: 'available',
      gradient: 'from-yellow-400 via-yellow-500 to-orange-500'
    },
    {
      id: 'xp-booster',
      name: 'XP Booster',
      icon: <Zap className="w-5 h-5" />,
      cost: 500,
      status: 'limited',
      timeRemaining: '12h',
      gradient: 'from-purple-400 via-purple-500 to-indigo-500'
    },
    {
      id: 'premium-avatar',
      name: 'Premium Avatar',
      icon: <Sparkles className="w-5 h-5" />,
      cost: 800,
      status: 'available',
      gradient: 'from-blue-400 via-cyan-400 to-teal-500'
    },
    {
      id: 'gem-bundle',
      name: 'Gem Bundle',
      icon: <Diamond className="w-5 h-5" />,
      cost: 300,
      status: 'sold-out',
      gradient: 'from-pink-400 via-rose-400 to-red-500'
    }
  ];

  const handleRewardClick = (reward: FeaturedReward) => {
    if (reward.status === 'sold-out') return;
    onRewardClick?.(reward.id);
  };

  const handleViewAllRewards = () => {
    navigate('/claim');
    onViewAllRewards?.();
    onOpenChange?.(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <motion.button
          className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group",
            theme === 'dark'
              ? "bg-gray-800/50 hover:bg-gray-700/60 text-gray-300 hover:text-white"
              : "bg-gray-100/50 hover:bg-gray-200/60 text-gray-600 hover:text-gray-900"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Gift className="w-5 h-5" strokeWidth={1.5} />

          {/* Subtle glow effect */}
          {isOpen && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/20 to-cyan-400/20"
              style={{ filter: 'blur(8px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-w-[90vw] p-0 border-0"
        align="end"
        sideOffset={12}
        style={{
          background: theme === 'dark'
            ? 'rgba(17, 24, 39, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: theme === 'dark'
            ? '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="p-6"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={cn(
                "text-xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Rewards
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* XP Balance Pill */}
              <motion.div
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)'
                }}
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 4px 16px rgba(79, 70, 229, 0.3)',
                    '0 8px 24px rgba(79, 70, 229, 0.4)',
                    '0 4px 16px rgba(79, 70, 229, 0.3)'
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Gem className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">
                  {currentXP.toLocaleString()}
                </span>
              </motion.div>

              {/* View All Link */}
              <motion.button
                onClick={handleViewAllRewards}
                className={cn(
                  "text-sm font-medium transition-colors",
                  theme === 'dark'
                    ? 'text-violet-400 hover:text-violet-300'
                    : 'text-violet-600 hover:text-violet-700'
                )}
                whileHover={{ x: 2 }}
              >
                View All Rewards
              </motion.button>
            </div>
          </div>

          {/* Featured Rewards Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {featuredRewards.map((reward, index) => (
              <motion.button
                key={reward.id}
                onClick={() => handleRewardClick(reward)}
                onMouseEnter={() => setHoveredReward(reward.id)}
                onMouseLeave={() => setHoveredReward(null)}
                className={cn(
                  "relative p-4 rounded-xl transition-all duration-300 group text-left",
                  reward.status === 'sold-out'
                    ? "cursor-not-allowed"
                    : "cursor-pointer",
                  theme === 'dark'
                    ? "bg-white/5 hover:bg-white/10 border border-white/10"
                    : "bg-white/30 hover:bg-white/50 border border-white/20"
                )}
                style={{
                  backdropFilter: 'blur(8px)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={reward.status !== 'sold-out' ? {
                  scale: 1.02,
                  y: -4,
                  boxShadow: theme === 'dark'
                    ? '0 12px 24px rgba(139, 92, 246, 0.2)'
                    : '0 12px 24px rgba(139, 92, 246, 0.15)'
                } : {}}
                whileTap={reward.status !== 'sold-out' ? { scale: 0.98 } : {}}
              >
                {/* Glow Ring Effect */}
                {hoveredReward === reward.id && reward.status !== 'sold-out' && (
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-xl",
                      `bg-gradient-to-r ${reward.gradient}`
                    )}
                    style={{
                      filter: 'blur(12px)',
                      opacity: 0.3
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                {/* Sold Out Overlay */}
                {reward.status === 'sold-out' && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-10">
                    <span className="text-white font-bold text-xs uppercase tracking-wide">
                      SOLD OUT
                    </span>
                  </div>
                )}

                <div className="relative z-10">
                  {/* Reward Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white",
                    reward.status === 'sold-out'
                      ? "bg-gray-400"
                      : `bg-gradient-to-r ${reward.gradient}`
                  )}>
                    {reward.icon}
                  </div>

                  {/* Reward Name */}
                  <h3 className={cn(
                    "text-sm font-bold mb-2",
                    reward.status === 'sold-out'
                      ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      : theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {reward.name}
                  </h3>

                  {/* Cost Pill */}
                  <div className={cn(
                    "inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold",
                    reward.status === 'sold-out'
                      ? "bg-gray-400/20 text-gray-500 border border-gray-400/20"
                      : theme === 'dark'
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-violet-100 text-violet-700 border border-violet-200"
                  )}>
                    <Gem className="w-3 h-3" />
                    <span>{reward.cost}</span>
                  </div>

                  {/* Limited Time Indicator */}
                  {reward.status === 'limited' && reward.timeRemaining && (
                    <motion.div
                      className="flex items-center space-x-1 mt-2 px-2 py-1 rounded-lg text-xs font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                        color: 'white'
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 0 rgba(124, 58, 237, 0.4)',
                          '0 0 20px rgba(124, 58, 237, 0.6)',
                          '0 0 0 rgba(124, 58, 237, 0.4)'
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{reward.timeRemaining} left</span>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer CTA */}
          <motion.button
            onClick={handleViewAllRewards}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl text-white font-bold transition-all duration-300 group"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 12px 32px rgba(124, 58, 237, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Visit Rewards Marketplace</span>
            <motion.div
              className="flex items-center"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ExternalLink className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};