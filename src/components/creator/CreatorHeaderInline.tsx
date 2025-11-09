/**
 * CreatorHeaderInline - Banner, avatar, name with inline action buttons
 * Action buttons appear adjacent to name, aligned vertically center
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, UserPlus, UserCheck, Zap, MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSubscribe } from '@/hooks/useSubscribe';
import { useOpenCollaboration } from '@/hooks/useOpenCollaboration';

interface CreatorHeaderInlineProps {
  creatorId: string;
  displayName: string;
  username: string;
  photoURL: string;
  bannerURL?: string;
  verified?: boolean;
  subscriberCount?: number;
  videoCount?: number;
  onTipClick: () => void;
  className?: string;
}

export const CreatorHeaderInline: React.FC<CreatorHeaderInlineProps> = ({
  creatorId,
  displayName,
  username,
  photoURL,
  bannerURL,
  verified,
  subscriberCount,
  videoCount,
  onTipClick,
  className,
}) => {
  const { isSubscribed, isLoading: subscribeLoading, toggleSubscribe } = useSubscribe(creatorId);
  const { openCollaboration, isLoading: collabLoading } = useOpenCollaboration();

  const handleCollaborate = () => {
    openCollaboration(
      creatorId,
      displayName,
      `Collab Request — I'd love to collaborate with you on WIZUP. Here's what I have in mind...`
    );
  };

  return (
    <div className={cn('relative', className)}>
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-48 sm:h-56 lg:h-64 w-full overflow-hidden"
      >
        {bannerURL ? (
          <img
            src={bannerURL}
            alt={`${displayName} banner`}
            className="w-full h-full object-cover bg-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-100 via-rose-100 to-blue-100 dark:from-purple-900/20 dark:via-rose-900/20 dark:to-blue-900/20" />
        )}
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
      </motion.div>

      {/* Profile Block - Below Banner with inline actions */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-12 sm:-mt-16 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative flex-shrink-0"
              >
                <div className="relative">
                  {/* Subtle glow with gentle pulse */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Avatar image */}
                  <img
                    src={photoURL}
                    alt={displayName}
                    className={cn(
                      'relative w-24 h-24 sm:w-28 sm:h-28 rounded-full',
                      'object-cover',
                      'border-4 border-white dark:border-neutral-900',
                      'shadow-2xl'
                    )}
                    loading="lazy"
                  />

                  {/* Verified badge */}
                  {verified && (
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Name, Handle, Stats + Action Buttons (Inline) */}
              <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Name & Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex-shrink-0"
                >
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {displayName}
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    @{username}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {subscriberCount !== undefined && (
                      <span className="font-medium">
                        {subscriberCount.toLocaleString()} subscriber{subscriberCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {videoCount !== undefined && (
                      <>
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <span>{videoCount.toLocaleString()} video{videoCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Right: Action Buttons (Inline) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  {/* Subscribe Button */}
                  <Button
                    onClick={toggleSubscribe}
                    disabled={subscribeLoading}
                    className={cn(
                      'h-11 px-6 rounded-full font-medium text-sm',
                      'transition-all duration-200',
                      'shadow-sm hover:shadow-md hover:scale-[1.02]',
                      isSubscribed
                        ? 'bg-white dark:bg-neutral-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-neutral-700'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:from-indigo-700 hover:to-violet-600'
                    )}
                    aria-label={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                  >
                    {subscribeLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isSubscribed ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Subscribed
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Subscribe
                          </>
                        )}
                      </>
                    )}
                  </Button>

                  {/* Tip Button */}
                  <Button
                    onClick={onTipClick}
                    className={cn(
                      'h-11 px-6 rounded-full font-medium text-sm',
                      'bg-white dark:bg-neutral-800',
                      'border border-zinc-300 dark:border-zinc-700',
                      'text-zinc-700 dark:text-zinc-300',
                      'hover:bg-zinc-50 dark:hover:bg-neutral-700',
                      'shadow-sm hover:shadow-md hover:scale-[1.02]',
                      'transition-all duration-200'
                    )}
                    aria-label="Send tip"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Tip
                  </Button>

                  {/* Collaborate Button */}
                  <Button
                    onClick={handleCollaborate}
                    disabled={collabLoading}
                    className={cn(
                      'h-11 px-6 rounded-full font-medium text-sm',
                      'bg-white dark:bg-neutral-800',
                      'border border-zinc-300 dark:border-zinc-700',
                      'text-zinc-700 dark:text-zinc-300',
                      'hover:bg-zinc-50 dark:hover:bg-neutral-700',
                      'shadow-sm hover:shadow-md hover:scale-[1.02]',
                      'transition-all duration-200'
                    )}
                    aria-label="Open collaboration"
                  >
                    {collabLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Collaborate
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
