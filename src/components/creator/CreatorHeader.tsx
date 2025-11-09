/**
 * CreatorHeader - Banner, avatar, bio, and action buttons (YouTube-style layout)
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatorProfile } from '@/hooks/useCreator';
import { useSubscribe } from '@/hooks/useSubscribe';
import { useOpenCollaboration } from '@/hooks/useOpenCollaboration';
import { Button } from '@/components/ui/button';
import { JoinCommunityButton } from './JoinCommunityButton';

interface CreatorHeaderProps {
  creator: CreatorProfile & {
    hasCourse?: boolean;
    hasCommunity?: boolean;
    communityId?: string;
    courseId?: string;
  };
  onTipClick: () => void;
}

export const CreatorHeader: React.FC<CreatorHeaderProps> = ({ creator, onTipClick }) => {
  const { isSubscribed, isLoading: subscribeLoading, toggleSubscribe } = useSubscribe(creator.id);
  const { openCollaboration, isLoading: collabLoading } = useOpenCollaboration();

  const handleCollaborate = () => {
    openCollaboration(
      creator.id,
      creator.displayName,
      `Hi ${creator.displayName}, I'd love to collaborate with you on WIZUP!`
    );
  };

  return (
    <div className="relative">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden"
      >
        {creator.bannerURL ? (
          <img
            src={creator.bannerURL}
            alt={`${creator.displayName} banner`}
            className="w-full h-full object-cover bg-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-100 via-rose-100 to-blue-100" />
        )}
        {/* Soft luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
      </motion.div>

      {/* White Content Section - Below Banner */}
      <div className="bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-12 sm:-mt-16">
            {/* Main Row: Avatar + Name + Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 pb-8">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative flex-shrink-0"
              >
                <div className="relative">
                  {/* Subtle muted blur glow with gentle pulse */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-2xl"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
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
                    src={creator.photoURL}
                    alt={creator.displayName}
                    className={cn(
                      'relative w-20 h-20 sm:w-24 sm:h-24 rounded-full',
                      'object-cover',
                      'border-4 border-white dark:border-neutral-900',
                      'shadow-2xl backdrop-blur-sm'
                    )}
                  />

                  {/* Verified badge - subtle */}
                  {creator.verified && (
                    <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-400/90 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" fill="currentColor" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Name, Username, Stats + Action Buttons (Inline) */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              {/* Creator Name & Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex-shrink-0"
              >
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {creator.displayName}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  @{creator.username}
                </p>

                {/* Stats */}
                <div className="flex flex-row items-center gap-3 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {creator.subscriberCount !== undefined && (
                    <span>{creator.subscriberCount.toLocaleString()} subscribers</span>
                  )}
                  {creator.videoCount !== undefined && (
                    <>
                      <span>·</span>
                      <span>{creator.videoCount.toLocaleString()} videos</span>
                    </>
                  )}
                  {creator.hasCommunity && (
                    <>
                      <span>·</span>
                      <span>Community</span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Action Buttons - Right Aligned on Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center sm:ml-auto gap-3"
              >
                {/* Subscribe Button */}
                <Button
                  onClick={toggleSubscribe}
                  disabled={subscribeLoading}
                  className={cn(
                    'h-11 px-5 rounded-full font-semibold',
                    'transition-all duration-200',
                    'shadow-sm hover:shadow-md hover:scale-[1.02]',
                    isSubscribed
                      ? 'bg-white/60 backdrop-blur-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-white/80'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white'
                  )}
                  aria-label={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                >
                  {subscribeLoading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
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

                {/* Join Community Button */}
                {creator.hasCommunity && (
                  <JoinCommunityButton
                    creatorId={creator.id}
                    communityId={creator.communityId}
                    creatorName={creator.displayName}
                    creatorAvatar={creator.photoURL}
                  />
                )}

                {/* Tip Button */}
                <Button
                  onClick={onTipClick}
                  className={cn(
                    'h-11 px-5 rounded-full font-semibold',
                    'bg-white/60 backdrop-blur-md',
                    'border border-zinc-300 dark:border-zinc-700',
                    'text-zinc-700 dark:text-zinc-300',
                    'hover:bg-white/80',
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
                    'h-11 px-5 rounded-full font-semibold',
                    'bg-white/60 backdrop-blur-md',
                    'border border-zinc-300 dark:border-zinc-700',
                    'text-zinc-700 dark:text-zinc-300',
                    'hover:bg-white/80',
                    'shadow-sm hover:shadow-md hover:scale-[1.02]',
                    'transition-all duration-200'
                  )}
                  aria-label="Open collaboration"
                >
                  {collabLoading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
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

          {/* Bio - Full width below */}
          {creator.bio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="pb-8 pt-2"
            >
              <p className="text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed text-base">
                {creator.bio}
              </p>
            </motion.div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
