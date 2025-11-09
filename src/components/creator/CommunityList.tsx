/**
 * CommunityList - Display creator's communities with access badges and join buttons
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, Zap, DollarSign, GraduationCap, LockKeyhole } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JoinCommunityButton } from './JoinCommunityButton';

export interface CommunityItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  memberCount?: number;
  zapsRequired?: number;
  usdCoPay?: number;
  offerZAPsToNewMembers?: boolean;
  newMemberZAPsReward?: number;
  waitlistOnly?: boolean;
  hasCourse?: boolean;
}

interface CommunityListProps {
  communities: CommunityItem[];
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  className?: string;
}

export const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  creatorId,
  creatorName,
  creatorAvatar,
  className,
}) => {
  const getAccessBadge = (community: CommunityItem) => {
    if (community.waitlistOnly) {
      return {
        text: 'Invite Required',
        icon: LockKeyhole,
        className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      };
    }

    if (community.hasCourse) {
      return {
        text: 'Course Access',
        icon: GraduationCap,
        className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      };
    }

    const hasZaps = (community.zapsRequired || 0) > 0;
    const hasUsd = (community.usdCoPay || 0) > 0;

    if (hasZaps && hasUsd) {
      return {
        text: `${community.zapsRequired} ZAPs + $${community.usdCoPay}`,
        icon: Lock,
        className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      };
    }

    if (hasUsd) {
      return {
        text: `$${community.usdCoPay}`,
        icon: DollarSign,
        className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      };
    }

    if (hasZaps) {
      return {
        text: `${community.zapsRequired} ZAPs`,
        icon: Zap,
        className: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      };
    }

    if (community.offerZAPsToNewMembers && community.newMemberZAPsReward) {
      return {
        text: `+${community.newMemberZAPsReward} ZAPs`,
        icon: Zap,
        className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      };
    }

    return {
      text: 'Free',
      icon: Users,
      className: 'bg-slate-100 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    };
  };

  if (communities.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-600 dark:text-zinc-400">No communities yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {communities.map((community, index) => {
        const badge = getAccessBadge(community);
        const Icon = badge.icon;

        return (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className={cn(
              'group relative',
              'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md',
              'border border-zinc-200 dark:border-zinc-800',
              'rounded-2xl p-6',
              'hover:shadow-lg hover:shadow-indigo-500/5',
              'hover:border-indigo-200 dark:hover:border-indigo-800',
              'transition-all duration-300'
            )}
          >
            {/* Thumbnail */}
            {community.thumbnail && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
                <img
                  src={community.thumbnail}
                  alt={community.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1 truncate">
                  {community.title}
                </h3>

                {/* Access Badge */}
                <div className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                  badge.className
                )}>
                  <Icon className="w-3 h-3" />
                  {badge.text}
                </div>
              </div>
            </div>

            {/* Description */}
            {community.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
                {community.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {/* Member Count */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Users className="w-4 h-4" />
                <span>{community.memberCount?.toLocaleString() || 0} members</span>
              </div>

              {/* Join Button */}
              <JoinCommunityButton
                creatorId={creatorId}
                communityId={community.id}
                creatorName={creatorName}
                creatorAvatar={creatorAvatar}
                className="h-9 px-4 text-sm"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
