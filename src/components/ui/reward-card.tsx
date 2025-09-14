import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Sparkles, Clock, Users, Gift, Package } from 'lucide-react';

export interface RewardData {
  id: string;
  title: string;
  provider: {
    name: string;
    avatar?: string;
  };
  image: string;
  xpCost: number;
  usdCost: number;
  originalPrice: number;
  discount: number;
  availability?: {
    total: number;
    remaining: number;
  };
  category: 'courses' | 'coaching' | 'communities' | 'tools';
  isFeatured?: boolean;
  description?: string;
}

interface RewardCardProps {
  reward: RewardData;
  userXP: number;
  onClaim: (reward: RewardData) => void;
  variant?: 'default' | 'featured';
  className?: string;
}

export const RewardCard: React.FC<RewardCardProps> = ({ 
  reward, 
  userXP, 
  onClaim, 
  variant = 'default',
  className 
}) => {
  const canAfford = userXP >= reward.xpCost;
  const discountPercent = Math.round(((reward.originalPrice - reward.usdCost) / reward.originalPrice) * 100);
  const availabilityPercent = reward.availability 
    ? ((reward.availability.total - reward.availability.remaining) / reward.availability.total) * 100
    : 0;

  const cardStyle = {
    background: `
      linear-gradient(135deg,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(248, 250, 252, 0.65) 100%
      )
    `,
    backdropFilter: 'blur(25px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: `
      0 15px 35px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.5)
    `
  };

  const isLocked = !canAfford;

  return (
    <motion.div
      className={cn(
        "relative group cursor-pointer",
        isLocked && "opacity-60",
        className
      )}
      whileHover={!isLocked ? {
        y: -6,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      } : {
        y: -2,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Lock Icon for Locked Cards */}
      {isLocked && (
        <div className="absolute top-3 left-3 z-20">
          <div className="w-6 h-6 rounded-full bg-gray-400/50 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs text-gray-600">🔒</span>
          </div>
        </div>
      )}
      {/* Subtle Hover Glow */}
      <motion.div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl`}
        style={{
          background: isLocked
            ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
          transform: 'scale(1.02)'
        }}
        transition={{ duration: 0.4 }}
      />

      <Card
        className="overflow-hidden relative border-0 transition-all duration-300 rounded-2xl"
        style={cardStyle}
      >


        {/* Thumbnail (16:9) with Placeholder */}
        <div className="relative aspect-video overflow-hidden rounded-t-2xl">
          {reward.image && reward.image !== '/api/placeholder/400/225' ? (
            <motion.img
              src={reward.image}
              alt={reward.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4 }}
            />
          ) : (
            // Placeholder
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.1) 100%)'
              }}
            >
              <div className="text-center space-y-2">
                <Package className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Image Coming Soon</p>
              </div>
            </div>
          )}

          {/* Discount Badge - Top Right */}
          <div className="absolute top-3 right-3 z-10">
            <motion.div
              className="px-2 py-1 rounded-full text-white font-bold text-xs"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              {Math.round(((reward.originalPrice - reward.usdCost) / reward.originalPrice) * 100)}% OFF
            </motion.div>
          </div>
        </div>

        <CardContent className="p-6 relative z-10">
          {/* Title + Provider Stacked */}
          <div className="mb-4">
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg leading-snug">
              {reward.title}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {reward.provider.name}
            </p>
          </div>

          {/* Slots Remaining + Progress Bar */}
          {reward.availability && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  {reward.availability.remaining} slots left
                </span>
                <span className="text-xs text-gray-500">
                  {reward.availability.total - reward.availability.remaining}/{reward.availability.total} claimed
                </span>
              </div>
              <Progress
                value={(reward.availability.total - reward.availability.remaining) / reward.availability.total * 100}
                className="h-2"
                style={{
                  background: 'rgba(0, 0, 0, 0.05)'
                }}
              />
            </div>
          )}

          {/* Price Row */}
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-gray-400 line-through">
                ${reward.originalPrice}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-purple-600 font-bold text-lg">
                  {reward.xpCost} XP
                </span>
                <span className="text-gray-400">+</span>
                <span className="text-green-600 font-bold text-xl">
                  ${reward.usdCost}
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button - Capsule */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => canAfford && onClaim(reward)}
                disabled={!canAfford}
                className={cn(
                  "w-full font-bold text-sm py-3 rounded-full transition-all duration-300",
                  canAfford
                    ? "text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                )}
                style={canAfford ? {
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.9) 0%,
                      rgba(248, 250, 252, 0.8) 100%
                    )
                  `,
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: '#4B5563',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(139, 92, 246, 0.1)'
                } : {
                  background: 'rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}
                whileHover={canAfford ? {
                  scale: 1.05,
                  y: -3,
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.3)',
                  transition: { duration: 0.2, ease: "easeOut" }
                } : {
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {canAfford ? (
                  <span>Claim →</span>
                ) : (
                  <span className="flex items-center justify-center space-x-1">
                    <span>🔒</span>
                    <span>Earn {reward.xpCost - userXP} more XP</span>
                  </span>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              {canAfford
                ? `Claim with ${reward.xpCost} XP + $${reward.usdCost}`
                : `Earn ${reward.xpCost - userXP} more XP to unlock`
              }
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </motion.div>
  );
};