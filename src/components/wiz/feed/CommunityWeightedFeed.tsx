import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunityFeedCard, CommunityFeedPost } from './CommunityFeedCard';
import { FeedSortingFilters, FeedSortOption } from './FeedSortingFilters';
import { TrendingUp, Users, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CommunityWeightedFeedProps {
  className?: string;
  onVideoPlay?: (post: CommunityFeedPost) => void;
  activeSort?: FeedSortOption;
  onSortChange?: (sort: FeedSortOption) => void;
}

// Sample data for demonstration - replace with real data from Firestore
const SAMPLE_POSTS: CommunityFeedPost[] = [
  {
    id: '1',
    type: 'video',
    community: {
      id: 'tech-wizards',
      name: 'Tech Wizards',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech',
      verified: true,
      memberCount: 15420
    },
    content: {
      title: 'Building a Modern Full-Stack App with React & Node.js',
      videoId: 'dQw4w9WgXcQ',
      videoThumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoDuration: '15:42'
    },
    author: {
      id: 'user1',
      username: 'codingmaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
      level: 12
    },
    engagement: {
      upvotes: 2847,
      downvotes: 124,
      comments: 456,
      shares: 89,
      userVote: null,
      saved: false
    },
    meta: {
      timestamp: '4h ago',
      views: 12450,
      xpEarned: 150
    }
  },
  {
    id: '2',
    type: 'video',
    community: {
      id: 'crypto-kings',
      name: 'Crypto Kings',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=crypto',
      verified: true,
      memberCount: 28950
    },
    content: {
      title: 'Bitcoin Analysis: Is $100K Coming in 2025?',
      videoId: 'jNQXAC9IVRw',
      videoThumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
      videoDuration: '22:15'
    },
    author: {
      id: 'user2',
      username: 'cryptowhale',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
      level: 18
    },
    engagement: {
      upvotes: 4251,
      downvotes: 892,
      comments: 1205,
      shares: 234,
      userVote: null,
      saved: false
    },
    meta: {
      timestamp: '7h ago',
      views: 45680,
      xpEarned: 200
    }
  },
  {
    id: '3',
    type: 'text',
    community: {
      id: 'startup-founders',
      name: 'Startup Founders',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=startup',
      verified: false,
      memberCount: 8750
    },
    content: {
      title: 'Just raised our Seed Round! Here\'s what we learned',
      body: 'After 6 months of pitching to investors, we finally closed our $2M seed round. Here are the top 5 lessons I learned that I wish someone told me before I started...'
    },
    author: {
      id: 'user3',
      username: 'founderlife',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
      level: 8
    },
    engagement: {
      upvotes: 1532,
      downvotes: 45,
      comments: 287,
      shares: 156,
      userVote: null,
      saved: false
    },
    meta: {
      timestamp: '12h ago',
      views: 8950
    }
  }
];

const TRENDING_COMMUNITIES = [
  {
    id: '1',
    name: 'AI Builders',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=ai',
    members: 42580,
    trending: true
  },
  {
    id: '2',
    name: 'Web3 Warriors',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3',
    members: 35420,
    trending: true
  },
  {
    id: '3',
    name: 'Growth Hackers',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=growth',
    members: 28950,
    trending: false
  }
];

export const CommunityWeightedFeed: React.FC<CommunityWeightedFeedProps> = ({
  className,
  onVideoPlay,
  activeSort: externalActiveSort,
  onSortChange: externalOnSortChange
}) => {
  const [internalActiveSort, setInternalActiveSort] = useState<FeedSortOption>('hot');
  const [posts, setPosts] = useState<CommunityFeedPost[]>(SAMPLE_POSTS);
  const [loading, setLoading] = useState(false);

  // Use external or internal sort state
  const activeSort = externalActiveSort ?? internalActiveSort;
  const setActiveSort = externalOnSortChange ?? setInternalActiveSort;

  const handleSortChange = (sort: FeedSortOption) => {
    setActiveSort(sort);
    // TODO: Fetch sorted posts from Firestore based on sort option
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleEngagement = (action: 'upvote' | 'downvote' | 'comment' | 'share' | 'save', postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id !== postId) return post;

        const newPost = { ...post };

        switch (action) {
          case 'upvote':
            if (post.engagement.userVote === 'up') {
              newPost.engagement = {
                ...post.engagement,
                upvotes: post.engagement.upvotes - 1,
                userVote: null
              };
            } else {
              newPost.engagement = {
                ...post.engagement,
                upvotes: post.engagement.upvotes + 1,
                downvotes: post.engagement.userVote === 'down' ? post.engagement.downvotes - 1 : post.engagement.downvotes,
                userVote: 'up'
              };
            }
            break;

          case 'downvote':
            if (post.engagement.userVote === 'down') {
              newPost.engagement = {
                ...post.engagement,
                downvotes: post.engagement.downvotes - 1,
                userVote: null
              };
            } else {
              newPost.engagement = {
                ...post.engagement,
                downvotes: post.engagement.downvotes + 1,
                upvotes: post.engagement.userVote === 'up' ? post.engagement.upvotes - 1 : post.engagement.upvotes,
                userVote: 'down'
              };
            }
            break;

          case 'save':
            newPost.engagement = {
              ...post.engagement,
              saved: !post.engagement.saved
            };
            break;

          case 'comment':
            // TODO: Open comments section
            console.log('Open comments for post:', postId);
            break;

          case 'share':
            // TODO: Open share dialog
            console.log('Share post:', postId);
            break;
        }

        return newPost;
      })
    );
  };

  return (
    <div className={cn("flex gap-6", className)}>
      {/* Main Feed Column (70%) */}
      <div className="flex-1 max-w-[70%] space-y-6">

        {/* Feed Posts */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <CommunityFeedCard
                    post={post}
                    onVideoClick={onVideoPlay}
                    onEngagement={handleEngagement}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right Sidebar (30%) */}
      <aside className="w-[30%] space-y-6">
        {/* Trending Communities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "sticky top-6 p-6 rounded-[24px]",
            "bg-gradient-to-br from-white/95 via-white/90 to-white/85",
            "dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85",
            "backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50",
            "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]",
            "dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
              Trending Communities
            </h3>
          </div>

          {/* Communities List */}
          <div className="space-y-3">
            {TRENDING_COMMUNITIES.map((community, index) => (
              <motion.button
                key={community.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-[18px]",
                  "hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50",
                  "dark:hover:from-violet-950/30 dark:hover:to-purple-950/30",
                  "transition-all duration-300 group"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar className="h-12 w-12 ring-2 ring-white/50 dark:ring-gray-800/50 shadow">
                  <AvatarImage src={community.avatar} alt={community.name} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
                    {community.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {community.name}
                    </p>
                    {community.trending && (
                      <Sparkles className="w-4 h-4 text-violet-500 fill-violet-500/20" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{community.members.toLocaleString()}</span>
                  </div>
                </div>

                <Badge className="bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 group-hover:bg-violet-200 dark:group-hover:bg-violet-900 transition-colors">
                  Join
                </Badge>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Creator Recommendations - Placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className={cn(
            "p-6 rounded-[24px]",
            "bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-pink-50/80",
            "dark:from-amber-950/30 dark:via-orange-950/20 dark:to-pink-950/30",
            "backdrop-blur-xl border border-amber-200/50 dark:border-amber-800/50",
            "shadow-[0_8px_40px_-12px_rgba(251,146,60,0.15)]"
          )}
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Featured Creators
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Coming soon...
            </p>
          </div>
        </motion.div>
      </aside>
    </div>
  );
};
