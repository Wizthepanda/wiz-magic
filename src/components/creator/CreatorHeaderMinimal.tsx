/**
 * CreatorHeaderMinimal - Banner, avatar, name, handle, stats only
 * No action buttons (those are in CreatorActionsBar)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatorHeaderMinimalProps {
  displayName: string;
  username: string;
  photoURL: string;
  bannerURL?: string;
  verified?: boolean;
  subscriberCount?: number;
  videoCount?: number;
  communityCount?: number;
  className?: string;
}

export const CreatorHeaderMinimal: React.FC<CreatorHeaderMinimalProps> = ({
  displayName,
  username,
  photoURL,
  bannerURL,
  verified,
  subscriberCount,
  videoCount,
  communityCount,
  className,
}) => {
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
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-100 via-rose-100 to-blue-100 dark:from-purple-900/20 dark:via-rose-900/20 dark:to-blue-900/20" />
        )}
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
      </motion.div>

      {/* Profile Block - Below Banner */}
      <div className="bg-white dark:bg-neutral-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-10 sm:-mt-12 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
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
                      'relative w-20 h-20 sm:w-24 sm:h-24 rounded-full',
                      'object-cover',
                      'border-4 border-white dark:border-neutral-900',
                      'shadow-2xl'
                    )}
                  />

                  {/* Verified badge */}
                  {verified && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" fill="currentColor" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Name, Handle, Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex-1 min-w-0"
              >
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                  {displayName}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  @{username}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
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
                  {communityCount !== undefined && communityCount > 0 && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span>{communityCount} {communityCount === 1 ? 'community' : 'communities'}</span>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
