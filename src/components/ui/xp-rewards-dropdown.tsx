import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Sparkles, Gift, TrendingUp, ExternalLink, Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedIconTrigger } from './enhanced-icon-trigger';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from './dropdown-menu';

interface RewardChip {
  id: string;
  type: 'daily' | 'video' | 'lesson' | 'bonus';
  title: string;
  xpAmount: number;
  timestamp: Date;
  icon?: React.ReactNode;
}

interface XPRewardsDropdownProps {
  totalXP: number;
  dailyXP: number;
  availableRewards?: RewardChip[];
  onClaimReward?: (id: string) => void;
  onGoToXPStore?: () => void;
}

export const XPRewardsDropdown: React.FC<XPRewardsDropdownProps> = ({
  totalXP,
  dailyXP,
  availableRewards = [],
  onClaimReward,
  onGoToXPStore
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState<Set<string>>(new Set());

  // Mock rewards if none provided
  const mockRewards: RewardChip[] = [
    {
      id: '1',
      type: 'daily',
      title: 'Daily Quest',
      xpAmount: 50,
      timestamp: new Date(),
      icon: <Sparkles className="w-3 h-3 text-yellow-500" />
    },
    {
      id: '2',
      type: 'video',
      title: 'Video Complete',
      xpAmount: 120,
      timestamp: new Date(),
      icon: <TrendingUp className="w-3 h-3 text-blue-500" />
    },
    {
      id: '3',
      type: 'bonus',
      title: 'Streak Bonus',
      xpAmount: 75,
      timestamp: new Date(),
      icon: <Zap className="w-3 h-3 text-purple-500" />
    }
  ];

  const displayRewards = availableRewards.length > 0 ? availableRewards : mockRewards;
  const unclaimedCount = displayRewards.filter(r => !claimedRewards.has(r.id)).length;

  const handleClaimReward = (rewardId: string) => {
    setClaimedRewards(prev => new Set([...prev, rewardId]));
    onClaimReward?.(rewardId);
  };

  const getRewardColor = (type: RewardChip['type']) => {
    switch (type) {
      case 'daily':
        return 'from-yellow-400 to-orange-500';
      case 'video':
        return 'from-blue-400 to-blue-600';
      case 'lesson':
        return 'from-green-400 to-green-600';
      case 'bonus':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <EnhancedIconTrigger
            icon={Gem}
            isActive={isOpen}
            variant="premium"
            hasNotification={unclaimedCount > 0}
            notificationCount={unclaimedCount}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        variant="premium"
        className="w-72 max-w-[90vw]"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Header with total XP */}
          <div className="px-1 py-2">
            <div className="text-center">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg"
                whileHover={{ scale: 1.02 }}
                animate={{
                  boxShadow: [
                    '0 4px 15px rgba(147, 51, 234, 0.3)',
                    '0 8px 25px rgba(147, 51, 234, 0.4)',
                    '0 4px 15px rgba(147, 51, 234, 0.3)'
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Gem className="w-5 h-5" />
                <motion.span
                  key={totalXP}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {Math.floor(totalXP).toLocaleString()}
                </motion.span>
                <span className="text-sm opacity-90">XP</span>
              </motion.div>
            </div>

            {/* Daily XP Progress */}
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Today's XP</span>
                <span className="font-bold text-blue-600">{Math.floor(dailyXP)}/360 XP</span>
              </div>
              <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((dailyXP / 360) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Available Rewards */}
          {displayRewards.length > 0 && (
            <div className="px-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-600" />
                Recent Rewards
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {displayRewards.map((reward, index) => {
                    const isClaimed = claimedRewards.has(reward.id);
                    const rewardColor = getRewardColor(reward.type);

                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "relative p-3 rounded-lg transition-all duration-300 group cursor-pointer",
                          isClaimed
                            ? "bg-gray-100 opacity-60"
                            : "bg-gradient-to-r from-white to-gray-50 hover:shadow-md border border-gray-200 hover:border-purple-300"
                        )}
                        onClick={() => !isClaimed && handleClaimReward(reward.id)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Reward icon */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isClaimed ? "bg-gray-300" : `bg-gradient-to-r ${rewardColor}`
                          )}>
                            {reward.icon || <Gift className="w-4 h-4 text-white" />}
                          </div>

                          {/* Reward details */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              isClaimed ? "text-gray-500" : "text-gray-900"
                            )}>
                              {reward.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isClaimed ? 'Claimed' : 'Ready to claim'}
                            </p>
                          </div>

                          {/* XP amount */}
                          <motion.div
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white",
                              isClaimed ? "bg-gray-400" : `bg-gradient-to-r ${rewardColor}`
                            )}
                            whileHover={!isClaimed ? { scale: 1.05 } : {}}
                          >
                            <Plus className="w-3 h-3" />
                            {reward.xpAmount}
                          </motion.div>
                        </div>

                        {/* Claim animation */}
                        {isClaimed && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg"
                          >
                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              ✓ Claimed
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* XP Store CTA */}
          <div className="px-1">
            <motion.button
              onClick={onGoToXPStore}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              Go to XP Store
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>

          {/* Empty state */}
          {displayRewards.length === 0 && (
            <div className="text-center py-6 px-4">
              <Gem className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">No rewards available</p>
              <p className="text-xs text-gray-500 mt-1">Watch videos and complete lessons to earn XP!</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};