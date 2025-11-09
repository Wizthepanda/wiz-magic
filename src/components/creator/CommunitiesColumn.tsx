/**
 * CommunitiesColumn - Left column with communities filter and posts feed
 * 30% width on desktop, full width on mobile (above video column)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Lock, Zap, DollarSign, Loader2, MessageSquare, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface Community {
  id: string;
  title: string;
  accessType: 'free' | 'paid' | 'zaps';
  zapCost?: number;
  priceUsd?: number;
  memberCount?: number;
  description?: string;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  media?: string[];
  createdAt: any;
  pinned?: boolean;
}

interface CommunitiesColumnProps {
  creatorId: string;
  className?: string;
}

export const CommunitiesColumn: React.FC<CommunitiesColumnProps> = ({
  creatorId,
  className,
}) => {
  const { user } = useAuth();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

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
        // Dedupe by ID
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
    queryKey: ['community-posts', selectedCommunityId],
    queryFn: async (): Promise<Post[]> => {
      if (!selectedCommunityId) return [];

      const postsQuery = query(
        collection(db, 'communities', selectedCommunityId, 'posts'),
        orderBy('createdAt', 'desc'),
        firestoreLimit(20)
      );

      const snapshot = await getDocs(postsQuery);
      const postsList: Post[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        postsList.push({
          id: doc.id,
          authorId: data.authorId,
          authorName: data.authorName || 'Unknown',
          authorAvatar: data.authorAvatar || '',
          content: data.content || '',
          media: data.media || [],
          createdAt: data.createdAt,
          pinned: data.pinned || false,
        });
      });

      return postsList;
    },
    enabled: !!selectedCommunityId,
    staleTime: 60_000,
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
      return { text: 'Free', icon: Users, className: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400' };
    }
    if (community.accessType === 'zaps') {
      return { text: `${community.zapCost} ZAPs`, icon: Zap, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
    }
    return { text: `$${community.priceUsd}`, icon: DollarSign, className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
  };

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Communities Filter Row */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Communities</h3>

        {communitiesLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : communities.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No communities yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {communities.map((community) => {
              const badge = getAccessBadge(community);
              const Icon = badge.icon;
              const isSelected = selectedCommunityId === community.id;

              return (
                <button
                  key={community.id}
                  onClick={() => setSelectedCommunityId(community.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium',
                    'border transition-all duration-200 hover:scale-[1.02]',
                    isSelected
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400'
                      : 'bg-white border-zinc-200 text-zinc-700 dark:bg-neutral-800 dark:border-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-neutral-700'
                  )}
                >
                  <span className="truncate max-w-[120px]">{community.title}</span>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', badge.className)}>
                    <Icon className="w-3 h-3" />
                    {badge.text}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCommunityId ? (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              Select a community to view posts
            </p>
          </div>
        ) : postsLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Post Composer (only if member) */}
            {isMember ? (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                <textarea
                  placeholder="Share your thoughts..."
                  className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-neutral-700 border border-zinc-200 dark:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  rows={3}
                />
                <Button className="mt-2 h-9 px-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full text-sm">
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6 text-center">
                <Lock className="w-8 h-8 mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">
                  Join to participate
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-4">
                  Become a member to post and engage with this community
                </p>
                <Button className="h-9 px-4 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full text-sm">
                  Join {selectedCommunity?.title}
                </Button>
              </div>
            )}

            {/* Posts List */}
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  No posts yet
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Be the first to start the discussion
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-neutral-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4"
                  >
                    {/* Post Author */}
                    <div className="flex items-center gap-3 mb-3">
                      {post.authorAvatar && (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-8 h-8 rounded-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {post.authorName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {post.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </p>
                      </div>
                      {post.pinned && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-full">
                          Pinned
                        </span>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Post Media */}
                    {post.media && post.media.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {post.media.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Post media ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
