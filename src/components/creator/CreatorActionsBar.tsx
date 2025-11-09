/**
 * CreatorActionsBar - Clean action row with pill-shaped buttons
 * Subscribe, Tip, Collaborate, Join Community
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, Zap, MessageCircle, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSubscribe } from '@/hooks/useSubscribe';
import { useOpenCollaboration } from '@/hooks/useOpenCollaboration';

interface CreatorActionsBarProps {
  creatorId: string;
  creatorName: string;
  hasCommunity?: boolean;
  hasMultipleCommunities?: boolean;
  onTipClick: () => void;
  onJoinCommunityClick: () => void;
  className?: string;
}

export const CreatorActionsBar: React.FC<CreatorActionsBarProps> = ({
  creatorId,
  creatorName,
  hasCommunity,
  hasMultipleCommunities,
  onTipClick,
  onJoinCommunityClick,
  className,
}) => {
  const { isSubscribed, isLoading: subscribeLoading, toggleSubscribe } = useSubscribe(creatorId);
  const { openCollaboration, isLoading: collabLoading } = useOpenCollaboration();

  const handleCollaborate = () => {
    openCollaboration(
      creatorId,
      creatorName,
      `Hey! I'd love to open a collaboration. Here's what I have in mind…`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className={cn('flex flex-wrap items-center gap-3', className)}
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
            ? 'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-neutral-800'
            : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700'
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
          'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md',
          'border border-zinc-200 dark:border-zinc-700',
          'text-zinc-700 dark:text-zinc-300',
          'hover:bg-white dark:hover:bg-neutral-800',
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
          'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md',
          'border border-zinc-200 dark:border-zinc-700',
          'text-zinc-700 dark:text-zinc-300',
          'hover:bg-white dark:hover:bg-neutral-800',
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

      {/* Join Community Button */}
      {hasCommunity && (
        <Button
          onClick={onJoinCommunityClick}
          className={cn(
            'h-11 px-6 rounded-full font-medium text-sm',
            'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
            'hover:from-purple-700 hover:to-pink-700',
            'shadow-sm hover:shadow-md hover:scale-[1.02]',
            'transition-all duration-200'
          )}
          aria-label={hasMultipleCommunities ? 'View communities' : 'Join community'}
        >
          <Users className="w-4 h-4 mr-2" />
          {hasMultipleCommunities ? 'Join Communities' : 'Join Community'}
        </Button>
      )}
    </motion.div>
  );
};
