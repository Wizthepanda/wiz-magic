/**
 * CreatorHeader - Banner, avatar, bio, and action buttons
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreatorProfile } from '@/hooks/useCreator';
import { useSubscribe } from '@/hooks/useSubscribe';
import { useOpenCollaboration } from '@/hooks/useOpenCollaboration';
import { Button } from '@/components/ui/button';

interface CreatorHeaderProps {
  creator: CreatorProfile;
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
        className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden"
      >
        {creator.bannerURL ? (
          <img
            src={creator.bannerURL}
            alt={`${creator.displayName} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </motion.div>

      {/* Creator Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 sm:-mt-24">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative inline-block"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50" />

              {/* Avatar image */}
              <img
                src={creator.photoURL}
                alt={creator.displayName}
                className={cn(
                  'relative w-32 h-32 sm:w-40 sm:h-40 rounded-full',
                  'object-cover',
                  'border-4 border-white dark:border-neutral-900',
                  'shadow-2xl'
                )}
              />

              {/* Verified badge */}
              {creator.verified && (
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900">
                  <CheckCircle2 className="w-6 h-6 text-white" fill="currentColor" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Name and Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {creator.displayName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">@{creator.username}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {creator.subscriberCount && (
                <span>{creator.subscriberCount.toLocaleString()} subscribers</span>
              )}
              {creator.videoCount && (
                <span>{creator.videoCount.toLocaleString()} videos</span>
              )}
            </div>

            {/* Bio */}
            {creator.bio && (
              <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
                {creator.bio}
              </p>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="flex flex-wrap items-center gap-3 mt-6"
          >
            {/* Subscribe Button */}
            <Button
              onClick={toggleSubscribe}
              disabled={subscribeLoading}
              className={cn(
                'px-6 py-2 rounded-full font-semibold transition-all',
                isSubscribed
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
              )}
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

            {/* Tip Button */}
            <Button
              onClick={onTipClick}
              className="px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="w-4 h-4 mr-2" fill="currentColor" />
              Send Tip
            </Button>

            {/* Collaborate Button */}
            <Button
              onClick={handleCollaborate}
              disabled={collabLoading}
              variant="outline"
              className="px-6 py-2 rounded-full font-semibold border-2 border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
            >
              {collabLoading ? (
                <motion.div
                  className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Collaboration
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
