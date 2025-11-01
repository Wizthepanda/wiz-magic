/**
 * ZAP Reward Tiers Display Component
 * Matches the design from Community Creation → Content tab
 * Shows tiered reward system with gradient cards
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ZAPReward {
  id: string;
  name: string;
  description?: string;
  completed?: boolean;
}

export interface ZAPTier {
  id: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Platinum';
  icon: string;
  zapsRequired: number;
  currentZAPs: number;
  userName?: string;
  rewards: ZAPReward[];
}

interface ZapRewardTiersDisplayProps {
  tiers: ZAPTier[];
  onAddTier?: () => void;
  showEmptyState?: boolean;
}

const tierGradients = {
  Bronze: {
    bg: 'from-orange-500 via-red-500 to-orange-600',
    border: 'border-orange-300',
    text: 'text-white',
    icon: '⚡',
  },
  Silver: {
    bg: 'from-gray-400 via-gray-500 to-gray-600',
    border: 'border-gray-300',
    text: 'text-white',
    icon: '🔥',
  },
  Gold: {
    bg: 'from-yellow-400 via-amber-500 to-yellow-600',
    border: 'border-yellow-300',
    text: 'text-white',
    icon: '👑',
  },
  Diamond: {
    bg: 'from-cyan-400 via-blue-500 to-purple-600',
    border: 'border-cyan-300',
    text: 'text-white',
    icon: '💎',
  },
  Platinum: {
    bg: 'from-purple-500 via-pink-500 to-purple-600',
    border: 'border-purple-300',
    text: 'text-white',
    icon: '🌟',
  },
};

const ZapTierCard: React.FC<{ tier: ZAPTier; index: number }> = ({ tier, index }) => {
  const gradient = tierGradients[tier.tier];
  const progress = Math.min((tier.currentZAPs / tier.zapsRequired) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
    >
      <div className={cn('rounded-2xl overflow-hidden shadow-xl transition-all duration-300', gradient.border)}>
        {/* Gradient Header */}
        <div className={cn('relative bg-gradient-to-br p-6 pb-8', gradient.bg)}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="text-6xl drop-shadow-lg">
              {tier.icon || gradient.icon}
            </div>
          </div>

          {/* Tier Name */}
          <h3 className={cn('text-center font-bold text-2xl mb-2', gradient.text)}>
            {tier.tier} Tier
          </h3>

          {/* ZAPs Required */}
          <div className={cn('flex items-center justify-center gap-2 text-sm', gradient.text)}>
            <Zap className="w-4 h-4 fill-current" />
            <span className="font-semibold">
              {tier.currentZAPs} + ZAPs Required
            </span>
          </div>
        </div>

        {/* White Content Area */}
        <div className="bg-white p-6">
          {/* Progress Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>
                {tier.currentZAPs} / {tier.zapsRequired} ZAPs
                {tier.userName && ` - ${tier.userName}`}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn('h-full bg-gradient-to-r', gradient.bg)}
              />
            </div>
          </div>

          {/* ZAP Rewards Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-600" />
              <h4 className="font-semibold text-sm text-gray-900">ZAP Rewards</h4>
            </div>

            {/* Rewards List */}
            <ul className="space-y-2">
              {tier.rewards.map((reward, idx) => (
                <motion.li
                  key={reward.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.1) + (idx * 0.05) }}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <Check className={cn(
                    'w-4 h-4 mt-0.5 flex-shrink-0',
                    reward.completed ? 'text-green-500' : 'text-gray-300'
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{reward.name}</div>
                    {reward.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {reward.description}
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ZapRewardTiersDisplay: React.FC<ZapRewardTiersDisplayProps> = ({
  tiers,
  onAddTier,
  showEmptyState = true,
}) => {
  // Empty State
  if (tiers.length === 0 && showEmptyState) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="font-bold text-xl text-gray-900 mb-2">
            No reward tiers yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first ZAP reward to energize your community
          </p>
          {onAddTier && (
            <Button
              onClick={onAddTier}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reward Tier
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">ZAP Reward Tiers</h2>
        </div>
        <p className="text-gray-600">
          Unlock exclusive perks and benefits as your ZAP Tier rises
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier, index) => (
          <ZapTierCard key={tier.id} tier={tier} index={index} />
        ))}
      </div>

      {/* Add Tier Button */}
      {onAddTier && tiers.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onAddTier}
            variant="outline"
            className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Tier
          </Button>
        </div>
      )}
    </div>
  );
};
