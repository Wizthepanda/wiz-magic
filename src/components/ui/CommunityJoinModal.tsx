import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// ========================================
// TYPES & INTERFACES
// ========================================

export type AccessType = 'free' | 'free-zaps' | 'paid-usd' | 'paid-zaps' | 'hybrid' | 'waitlist';

export interface CommunityJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessType: AccessType;
  communityName: string;
  communityAvatar: string;
  rewardInfo?: {
    zapsEarned?: number;
    zapsSpent?: number;
    usdAmount?: number;
    xpEarned?: number;
  };
  transactionId?: string;
  onEnterCommunity: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

// ========================================
// ACCESS TYPE CONFIGURATIONS
// ========================================

const accessConfigs = {
  free: {
    ringGradient: 'from-blue-400 to-violet-500',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    headline: 'You've successfully joined this community for free',
    badge: null,
    primaryCTA: 'Enter Community',
    secondaryCTA: 'View My Communities',
    icon: CheckCircle2,
  },
  'free-zaps': {
    ringGradient: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(139, 92, 246, 0.5)',
    headline: 'You've joined using your ZAP balance',
    badge: null,
    primaryCTA: 'Enter Community',
    secondaryCTA: 'Earn More ZAPs',
    icon: Zap,
  },
  'paid-usd': {
    ringGradient: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    headline: 'You've unlocked premium access',
    badge: null,
    primaryCTA: 'Enter Premium Community',
    secondaryCTA: 'Manage Subscription',
    icon: DollarSign,
  },
  'paid-zaps': {
    ringGradient: 'from-indigo-500 to-violet-600',
    glowColor: 'rgba(99, 102, 241, 0.5)',
    headline: 'You've joined using ZAPs',
    badge: null,
    primaryCTA: 'Enter Community',
    secondaryCTA: 'View My Wallet',
    icon: Zap,
  },
  hybrid: {
    ringGradient: 'from-amber-400 via-violet-500 to-cyan-500',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    headline: 'Access granted through hybrid unlock',
    badge: '✨ Hybrid Access',
    primaryCTA: 'Start Exploring',
    secondaryCTA: 'View Balance',
    icon: Sparkles,
  },
  waitlist: {
    ringGradient: 'from-gray-400 to-gray-500',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    headline: 'You've joined the waitlist',
    badge: null,
    primaryCTA: 'View My Waitlisted Communities',
    secondaryCTA: null,
    icon: Clock,
  },
};

// ========================================
// MAIN COMPONENT
// ========================================

export const CommunityJoinModal: React.FC<CommunityJoinModalProps> = ({
  open,
  onOpenChange,
  accessType,
  communityName,
  communityAvatar,
  rewardInfo,
  transactionId,
  onEnterCommunity,
  onSecondaryAction,
  className,
}) => {
  const isMobile = useIsMobile();
  const config = accessConfigs[accessType];
  const IconComponent = config.icon;

  // Build reward text dynamically
  const getRewardText = () => {
    if (accessType === 'waitlist') {
      return "We'll notify you when this community opens.";
    }

    const parts: string[] = [];

    if (rewardInfo?.zapsEarned && rewardInfo.zapsEarned > 0) {
      parts.push(`+${rewardInfo.zapsEarned} ZAPs earned ⚡`);
    }

    if (rewardInfo?.zapsSpent && rewardInfo.zapsSpent > 0) {
      parts.push(`−${rewardInfo.zapsSpent} ZAPs spent ⚡`);
    }

    if (rewardInfo?.usdAmount && rewardInfo.usdAmount > 0) {
      parts.push(`$${rewardInfo.usdAmount} paid`);
    }

    if (rewardInfo?.xpEarned && rewardInfo.xpEarned > 0) {
      parts.push(`+${rewardInfo.xpEarned} XP earned`);
    }

    if (parts.length === 0 && accessType === 'free') {
      return '+50 ZAPs earned ⚡';
    }

    return parts.join(' • ') || 'Welcome to the community!';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
            "w-[90vw] max-w-md p-0 border-0 bg-transparent shadow-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            {/* Glassmorphic Shell */}
            <div
              className="relative overflow-hidden rounded-3xl p-8 backdrop-blur-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Background Animated Glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl opacity-40 pointer-events-none"
                animate={{
                  background: [
                    `radial-gradient(circle at 50% 50%, ${config.glowColor} 0%, transparent 70%)`,
                    `radial-gradient(circle at 60% 40%, ${config.glowColor} 0%, transparent 70%)`,
                    `radial-gradient(circle at 40% 60%, ${config.glowColor} 0%, transparent 70%)`,
                    `radial-gradient(circle at 50% 50%, ${config.glowColor} 0%, transparent 70%)`,
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Close Button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 z-10 rounded-full p-2 hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-white/70" />
              </button>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                {/* Avatar with Animated Ring */}
                <div className="relative">
                  {/* Pulsing Glow */}
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full blur-xl",
                      `bg-gradient-to-r ${config.ringGradient}`
                    )}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Ring Border */}
                  <div
                    className={cn(
                      "relative w-24 h-24 rounded-full p-1",
                      `bg-gradient-to-r ${config.ringGradient}`
                    )}
                  >
                    <Avatar className="w-full h-full border-4 border-white/10">
                      <AvatarImage src={communityAvatar} alt={communityName} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl font-bold">
                        {communityName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Icon Badge */}
                  <div
                    className={cn(
                      "absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center",
                      `bg-gradient-to-r ${config.ringGradient}`,
                      "border-2 border-white/20 shadow-lg"
                    )}
                  >
                    <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">
                    Welcome to{' '}
                    <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                      {communityName}
                    </span>
                  </h2>

                  {config.badge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      <span className="text-xs font-medium text-white">{config.badge}</span>
                    </div>
                  )}
                </div>

                {/* Subtext */}
                <p className="text-sm text-white/70 max-w-sm">
                  {config.headline}
                </p>

                {/* Reward Line with Sparkle Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <p className="text-sm font-medium text-white flex items-center gap-2">
                      {accessType === 'free-zaps' || accessType === 'paid-zaps' || accessType === 'hybrid' ? (
                        <motion.span
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          ⚡
                        </motion.span>
                      ) : null}
                      {getRewardText()}
                    </p>
                  </div>
                </motion.div>

                {/* Transaction ID (if present) */}
                {transactionId && (
                  <p className="text-xs text-white/40">
                    Transaction ID: <span className="font-mono">{transactionId}</span>
                  </p>
                )}

                {/* CTAs */}
                <div className="w-full space-y-3 pt-2">
                  <Button
                    onClick={() => {
                      onEnterCommunity();
                      onOpenChange(false);
                    }}
                    className={cn(
                      "w-full h-12 rounded-xl font-semibold text-white shadow-lg",
                      `bg-gradient-to-r ${config.ringGradient}`,
                      "hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    )}
                  >
                    {config.primaryCTA}
                  </Button>

                  {config.secondaryCTA && onSecondaryAction && (
                    <Button
                      onClick={() => {
                        onSecondaryAction();
                        onOpenChange(false);
                      }}
                      variant="ghost"
                      className="w-full h-12 rounded-xl font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm"
                    >
                      {config.secondaryCTA}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CommunityJoinModal;
