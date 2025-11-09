/**
 * CommunityFeed - Reddit 2.0 style community discussion feed
 * Main content area (70-80% width) with horizontal community filter
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Zap, DollarSign, Loader2, TrendingUp, Clock, Flame, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { PostCard, type Post as PostCardType } from './PostCard';

interface Community {
  id: string;
  title: string;
  accessType: 'free' | 'paid' | 'zaps';
  zapCost?: number;
  priceUsd?: number;
  memberCount?: number;
  description?: string;
}

interface CommunityFeedProps {
  creatorId: string;
  className?: string;
}

type SortOption = 'pinned' | 'top' | 'new' | 'active';

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  creatorId,
  className,
}) => {
  const { user } = useAuth();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('pinned');

  // Fetch creator's communities
  const { data: communities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ['creator-communities-list', creatorId],
    queryFn: async (): Promise<Community[]> => {
      const communitiesQuery = query(
        collection(db, 'communities'),
        where('creatorId', '==', creatorId),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(communitiesQuery);
      const uniqueCommunities = new Map();

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!uniqueCommunities.has(doc.id)) {
          uniqueCommunities.set(doc.id, {
            id: doc.id,
            title: data.title || 'Community',
            accessType: (data.zapsRequired || 0) > 0 ? 'zaps' : (data.usdCoPay || 0) > 0 ? 'paid' : 'free',
            zapCost: data.zapsRequired,
            priceUsd: data.usdCoPay,
            memberCount: data.memberCount || 0,
            description: data.description,
          });
        }
      });

      return Array.from(uniqueCommunities.values());
    },
    enabled: !!creatorId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  // Fetch posts for selected community
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts', selectedCommunityId, sortBy],
    queryFn: async (): Promise<PostCardType[]> => {
      if (!selectedCommunityId) return [];

      const postsQuery = query(
        collection(db, 'communities', selectedCommunityId, 'posts'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(50)
      );

      const snapshot = await getDocs(postsQuery);
      const postsList: PostCardType[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        postsList.push({
          id: doc.id,
          authorId: data.authorId,
          authorName: data.authorName || 'Unknown',
          authorAvatar: data.authorAvatar || '',
          authorLevel: data.authorLevel,
          title: data.title,
          content: data.content || '',
          media: data.media || [],
          createdAt: data.createdAt,
          pinned: data.pinned || false,
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          commentCount: data.commentCount || 0,
          userVote: data.userVotes?.[user?.uid || ''] || null,
        });
      });

      // Sort posts based on selected option
      return postsList.sort((a, b) => {
        // Pinned always first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        switch (sortBy) {
          case 'top':
            return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
          case 'new':
            return b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.() || 0;
          case 'active':
            return (b.commentCount || 0) - (a.commentCount || 0);
          default:
            return 0;
        }
      });
    },
    enabled: !!selectedCommunityId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  // Check if user is member of selected community
  const { data: isMember } = useQuery({
    queryKey: ['community-membership', selectedCommunityId, user?.uid],
    queryFn: async () => {
      if (!user || !selectedCommunityId) return false;
      const memberDoc = await getDocs(
        query(
          collection(db, 'communities', selectedCommunityId, 'members'),
          where('userId', '==', user.uid),
          firestoreLimit(1)
        )
      );
      return !memberDoc.empty;
    },
    enabled: !!user && !!selectedCommunityId,
  });

  const getAccessBadge = (community: Community) => {
    if (community.accessType === 'free') {
      return { text: 'Free', icon: Users, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300' };
    }
    if (community.accessType === 'zaps') {
      return { text: `${community.zapCost} ZAPs`, icon: Zap, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' };
    }
    return { text: `$${community.priceUsd}`, icon: DollarSign, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' };
  };

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);

  const sortOptions: { value: SortOption; label: string; icon: any }[] = [
    { value: 'pinned', label: 'Pinned', icon: Pin },
    { value: 'top', label: 'Top', icon: TrendingUp },
    { value: 'new', label: 'New', icon: Clock },
    { value: 'active', label: 'Most Active', icon: Flame },
  ];

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Horizontal Community Filter Chips */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 px-1">
          Communities
        </h3>

        {communitiesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : communities.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 px-1">
            No communities yet
          </p>
        ) : (
          <div className="flex overflow-x-auto gap-2 pb-2 px-1 scrollbar-hide">
            {communities.map((community) => {
              const badge = getAccessBadge(community);
              const Icon = badge.icon;
              const isSelected = selectedCommunityId === community.id;

              return (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunityId(community.id)}
                  className={cn(
                    'group relative flex-shrink-0 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full',
                    'border transition-all duration-300',
                    'backdrop-blur-md shadow-sm hover:shadow-md',
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-300 dark:border-indigo-600 shadow-indigo-500/10'
                      : 'bg-white/60 dark:bg-neutral-800/60 border-zinc-200/50 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="community-active"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-full border border-indigo-400/20 dark:border-indigo-600/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}

                  <span className={cn(
                    'relative font-medium text-sm whitespace-nowrap',
                    isSelected
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-zinc-700 dark:text-zinc-300'
                  )}>
                    {community.title}
                  </span>

                  <span className={cn(
                    'relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    badge.className
                  )}>
                    <Icon className="w-3 h-3" />
                    {badge.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Community Feed */}
      {!selectedCommunityId ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-sm">
            <Users className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Select a Community
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Choose a community above to view discussions and posts
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Community Header */}
          <div className="bg-white/40 dark:bg-neutral-800/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  {selectedCommunity?.title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {selectedCommunity?.memberCount || 0} {selectedCommunity?.memberCount === 1 ? 'member' : 'members'}
                </p>
              </div>
              {!isMember && (
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-medium rounded-full hover:from-indigo-700 hover:to-violet-600 transition-colors shadow-lg shadow-indigo-500/25">
                  Join Community
                </button>
              )}
            </div>

            {/* Create Post Input */}
            {isMember && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <textarea
                  placeholder="Share your voice with the community..."
                  className="w-full p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-500 text-white text-sm font-medium rounded-full hover:from-indigo-700 hover:to-violet-600 transition-colors shadow-lg shadow-indigo-500/25">
                    Create Post
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sorting Row */}
          <div className="flex items-center gap-2 px-1">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const isActive = sortBy === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Posts List */}
          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white/40 dark:bg-neutral-800/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl">
              <Lock className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                No posts yet
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Be the first to start the discussion
              </p>
              {isMember && (
                <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  Create the first post →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isMember={isMember}
                  onVote={(postId, vote) => {
                    console.log('Vote:', postId, vote);
                    // TODO: Implement voting logic
                  }}
                  onShare={(postId) => {
                    console.log('Share:', postId);
                    // TODO: Implement share logic
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
