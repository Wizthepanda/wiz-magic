/**
 * RewardDialog - Full-screen reward details modal
 * Features media gallery, full description, benefits, claim flow
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Users,
  Star,
  Globe,
  Lock,
  UserPlus,
  Download,
  Check,
  AlertCircle,
  BadgeCheck,
  Clock,
  TrendingUp,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaCarousel, ThumbnailStrip } from './MediaCarousel';
import {
  formatZaps,
  formatUSD,
  calculateDiscount,
  getStatusColor,
  getRemainingSlots,
  isSoldOut,
  formatRelativeTime,
  canAffordReward,
} from './utils';
import { GLASS_STYLES, Z_INDEX, A11Y_LABELS } from './constants';
import type { Reward, ClaimRequest } from './types';

interface RewardDialogProps {
  reward: Reward;
  isOpen: boolean;
  onClose: () => void;
  onClaim?: (request: ClaimRequest) => Promise<void>;
  userBalance?: number;
  userUSD?: number;
  className?: string;
}

export const RewardDialog: React.FC<RewardDialogProps> = ({
  reward,
  isOpen,
  onClose,
  onClaim,
  userBalance = 0,
  userUSD = 0,
  className,
}) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const soldOut = isSoldOut(reward);
  const remainingSlots = getRemainingSlots(reward);
  const hasDiscount = reward.pricing.discount && reward.pricing.discount > 0;
  const canAfford = canAffordReward(
    userBalance,
    reward.pricing.zapsCost,
    userUSD,
    reward.pricing.usdCoPay
  );

  const handleClaim = async () => {
    if (!onClaim || soldOut || !canAfford) return;

    setIsClaiming(true);
    setClaimError(null);

    try {
      await onClaim({
        rewardId: reward.id,
        userId: 'current-user', // TODO: Get from auth context
        paymentMethod: reward.pricing.usdCoPay ? 'zaps-usd' : 'zaps',
        settleInUSD: false,
      });
      // Success handled by parent
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : 'Failed to claim reward');
    } finally {
      setIsClaiming(false);
    }
  };

  const privacyIcons = {
    public: Globe,
    private: Lock,
    'invite-only': UserPlus,
  };

  const PrivacyIcon = privacyIcons[reward.privacy];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={cn('fixed inset-0 flex items-center justify-center p-4', className)}
          style={{ zIndex: Z_INDEX.modal }}
        >
          {/* Backdrop */}
          <motion.div
            className={GLASS_STYLES.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className={cn(
              GLASS_STYLES.modal,
              'relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20'
            )}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className={cn(
                GLASS_STYLES.pill,
                'absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center',
                'hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all'
              )}
              aria-label={A11Y_LABELS.closeDialog}
            >
              <X className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left Column: Media Gallery */}
              <div className="space-y-4">
                <MediaCarousel
                  media={reward.coverMedia}
                  size="lg"
                  onMediaClick={setSelectedMediaIndex}
                />
                <ThumbnailStrip
                  media={reward.coverMedia}
                  selectedIndex={selectedMediaIndex}
                  onSelect={setSelectedMediaIndex}
                />
              </div>

              {/* Right Column: Details */}
              <div className="space-y-6">
                {/* Header */}
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(reward.status))}>
                      {reward.status === 'available' && remainingSlots > 0 && `${remainingSlots} slots left`}
                      {reward.status === 'sold-out' && 'Sold Out'}
                      {reward.status === 'waitlist' && 'Waitlist Available'}
                      {reward.status === 'coming-soon' && 'Coming Soon'}
                    </span>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                      <PrivacyIcon className="w-3 h-3" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {reward.privacy === 'invite-only' ? 'Invite Only' : reward.privacy.charAt(0).toUpperCase() + reward.privacy.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {reward.title}
                  </h2>

                  {/* Subtitle */}
                  {reward.subtitle && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {reward.subtitle}
                    </p>
                  )}

                  {/* Creator */}
                  <div className="flex items-center gap-3">
                    <img
                      src={reward.creator.avatar}
                      alt={reward.creator.name}
                      className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {reward.creator.name}
                        </span>
                        {reward.creator.verified && (
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      {reward.creator.subsCount && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reward.creator.subsCount.toLocaleString()} subscribers
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {reward.stats.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ({reward.stats.reviews} reviews)
                      </span>
                    </div>

                    {reward.stats.members !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {reward.stats.members.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">members</span>
                      </div>
                    )}

                    {reward.stats.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {reward.stats.duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    About
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {reward.longDescription || reward.description}
                  </p>
                </div>

                {/* Benefits */}
                {reward.benefits && reward.benefits.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      What You Get
                    </h3>
                    <ul className="space-y-2">
                      {reward.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What's Included */}
                {reward.included && reward.included.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Included
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {reward.included.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                        >
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Downloadable Assets */}
                {reward.downloads && reward.downloads.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Downloadable Resources
                    </h3>
                    <div className="space-y-2">
                      {reward.downloads.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {asset.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {asset.type.toUpperCase()} • {asset.size}
                              </p>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {reward.tags && reward.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {reward.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pricing & CTA */}
                <div className={cn(GLASS_STYLES.card, 'p-6 rounded-2xl space-y-4')}>
                  {/* Price */}
                  {reward.pricing.monetizationType === 'free' ? (
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      Free
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {formatZaps(reward.pricing.zapsCost)}
                          </span>
                          <span className="text-lg text-gray-600 dark:text-gray-400">ZAPs</span>
                        </div>
                        {hasDiscount && reward.pricing.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            {formatZaps(reward.pricing.originalPrice)}
                          </span>
                        )}
                      </div>

                      {reward.pricing.usdCoPay && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <DollarSign className="w-5 h-5" />
                          <span className="text-lg">+ {formatUSD(reward.pricing.usdCoPay)} USD co-pay</span>
                        </div>
                      )}

                      {hasDiscount && (
                        <div className="inline-block px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                            Save {reward.pricing.discount}% ({formatZaps(calculateDiscount(reward.pricing.originalPrice || 0, reward.pricing.zapsCost))} ZAPs)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Affordability Check */}
                  {!canAfford && !soldOut && reward.pricing.monetizationType !== 'free' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="font-medium">Insufficient balance</p>
                        <p>You need {formatZaps(reward.pricing.zapsCost - userBalance)} more ZAPs</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {claimError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-200">{claimError}</p>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={handleClaim}
                    disabled={soldOut || !canAfford || isClaiming}
                    className={cn(
                      'w-full px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      soldOut || !canAfford
                        ? 'bg-gray-400 dark:bg-gray-600 text-white'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700'
                    )}
                  >
                    {isClaiming ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Processing...
                      </span>
                    ) : soldOut ? (
                      'Sold Out'
                    ) : !canAfford ? (
                      'Insufficient Balance'
                    ) : reward.status === 'waitlist' ? (
                      'Join Waitlist'
                    ) : (
                      'Claim Now'
                    )}
                  </button>

                  {/* Timestamp */}
                  {reward.createdAt && (
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      Published {formatRelativeTime(reward.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
