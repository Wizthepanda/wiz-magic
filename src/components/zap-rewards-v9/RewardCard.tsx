/**
 * RewardCard - Ultra-premium glassmorphic reward card
 * Features 5-slot carousel, privacy badges, stats, and pricing
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  Star,
  Lock,
  Globe,
  UserPlus,
  TrendingUp,
  Sparkles,
  BadgeCheck,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaCarousel } from './MediaCarousel';
import {
  formatZaps,
  formatUSD,
  calculateDiscount,
  getStatusColor,
  getMonetizationColor,
  getMonetizationLabel,
  calculateSlotsProgress,
  getProgressColor,
  getRemainingSlots,
  isSoldOut
} from './utils';
import { GLASS_STYLES, ANIMATION_CONFIG } from './constants';
import type { Reward } from './types';

interface RewardCardProps {
  reward: Reward;
  onClick?: () => void;
  onClaim?: (rewardId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onClick,
  onClaim,
  className,
  size = 'md',
}) => {
  const soldOut = isSoldOut(reward);
  const remainingSlots = getRemainingSlots(reward);
  const slotsProgress = calculateSlotsProgress(
    reward.stats.claimed || 0,
    reward.stats.totalSlots || 0
  );
  const hasDiscount = reward.pricing.discount && reward.pricing.discount > 0;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <motion.div
      className={cn(
        GLASS_STYLES.card,
        'rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer',
        sizeClasses[size],
        className
      )}
      whileHover={ANIMATION_CONFIG.cardHover}
      whileTap={ANIMATION_CONFIG.cardTap}
      onClick={onClick}
    >
      {/* Media Carousel */}
      <div className="relative">
        <MediaCarousel
          media={reward.coverMedia}
          size="md"
          onMediaClick={(index) => {
            // Prevent card click when clicking media
            onClick?.();
          }}
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {/* Privacy Badge */}
          <PrivacyBadge privacy={reward.privacy} />

          {/* Featured Badge */}
          {reward.featured && (
            <Badge
              icon={<Sparkles className="w-3 h-3" />}
              label="Featured"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
            />
          )}

          {/* Trending Badge */}
          {reward.trending && (
            <Badge
              icon={<TrendingUp className="w-3 h-3" />}
              label="Trending"
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"
            />
          )}

          {/* New Release Badge */}
          {reward.newRelease && (
            <Badge
              label="New"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            />
          )}

          {/* Limited Offer Badge */}
          {reward.limitedOffer && (
            <Badge
              label="Limited"
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse"
            />
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className={cn('px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(reward.status))}>
            {reward.status === 'available' && remainingSlots > 0 && `${remainingSlots} left`}
            {reward.status === 'sold-out' && 'Sold Out'}
            {reward.status === 'waitlist' && 'Join Waitlist'}
            {reward.status === 'coming-soon' && 'Coming Soon'}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Header: Category + Creator */}
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={reward.category} />
          <CreatorBadge creator={reward.creator} />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {reward.title}
          </h3>
          {reward.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              {reward.subtitle}
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {reward.description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium">{reward.stats.rating.toFixed(1)}</span>
            <span className="text-xs">({reward.stats.reviews})</span>
          </div>

          {/* Members/Claimed */}
          {reward.stats.members !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{reward.stats.members.toLocaleString()}</span>
            </div>
          )}

          {/* Duration (for courses) */}
          {reward.stats.duration && (
            <div className="text-xs">
              {reward.stats.duration}
            </div>
          )}
        </div>

        {/* Progress Bar (if limited slots) */}
        {reward.stats.totalSlots && reward.stats.totalSlots > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>{reward.stats.claimed || 0} claimed</span>
              <span>{reward.stats.totalSlots} total</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', getProgressColor(slotsProgress))}
                initial={{ width: 0 }}
                animate={{ width: `${slotsProgress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {reward.tags && reward.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {reward.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {reward.tags.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                +{reward.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Pricing Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            {/* Price */}
            <div className="flex-1">
              {reward.pricing.monetizationType === 'free' ? (
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Free
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatZaps(reward.pricing.zapsCost)}
                      </span>
                    </div>
                    {hasDiscount && reward.pricing.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatZaps(reward.pricing.originalPrice)}
                      </span>
                    )}
                  </div>
                  {reward.pricing.usdCoPay && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-3 h-3" />
                      <span>+ {formatUSD(reward.pricing.usdCoPay)} USD</span>
                    </div>
                  )}
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    -{reward.pricing.discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaim?.(reward.id);
              }}
              disabled={soldOut}
              className={cn(
                'px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                soldOut
                  ? 'bg-gray-400 dark:bg-gray-600 text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700'
              )}
            >
              {soldOut ? 'Sold Out' : reward.status === 'waitlist' ? 'Join Waitlist' : 'Claim Now'}
            </button>
          </div>

          {/* Monetization Type Badge */}
          <div className="mt-3">
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white',
                getMonetizationColor(reward.pricing.monetizationType)
              )}
            >
              {getMonetizationLabel(reward.pricing.monetizationType)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Privacy Badge Component
 */
const PrivacyBadge: React.FC<{ privacy: 'public' | 'private' | 'invite-only' }> = ({ privacy }) => {
  const config = {
    public: { icon: Globe, label: 'Public', className: 'bg-blue-500/90 text-white' },
    private: { icon: Lock, label: 'Private', className: 'bg-purple-500/90 text-white' },
    'invite-only': { icon: UserPlus, label: 'Invite Only', className: 'bg-orange-500/90 text-white' },
  };

  const { icon: Icon, label, className } = config[privacy];

  return (
    <Badge icon={<Icon className="w-3 h-3" />} label={label} className={className} />
  );
};

/**
 * Category Badge Component
 */
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const categoryLabels: Record<string, string> = {
    community: 'Community',
    course: 'Course',
    coaching: 'Coaching',
    product: 'Digital Product',
  };

  return (
    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {categoryLabels[category] || category}
    </span>
  );
};

/**
 * Creator Badge Component
 */
const CreatorBadge: React.FC<{ creator: { name: string; avatar: string; verified: boolean } }> = ({
  creator,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <img
        src={creator.avatar}
        alt={creator.name}
        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700"
      />
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
        {creator.name}
      </span>
      {creator.verified && (
        <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
      )}
    </div>
  );
};

/**
 * Generic Badge Component
 */
const Badge: React.FC<{
  icon?: React.ReactNode;
  label: string;
  className?: string;
}> = ({ icon, label, className }) => {
  return (
    <div
      className={cn(
        GLASS_STYLES.pill,
        'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm',
        className
      )}
    >
      {icon}
      {label}
    </div>
  );
};
