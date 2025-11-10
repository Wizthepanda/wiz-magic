import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import WIZUPDashboardV12_5 from './WIZUPDashboardV12_5';
import { CommunityWeightedFeed } from './feed/CommunityWeightedFeed';
import { CommunityFeedPost } from './feed/CommunityFeedCard';
import { WatchVideoData } from './WatchDialogV4';

interface WIZUPDashboardV13Props {
  className?: string;
  onVideoSelect?: (video: any) => void;
  videos?: any[];
  loading?: boolean;
}

type ViewMode = 'grid' | 'feed';

const WIZUPDashboardV13: React.FC<WIZUPDashboardV13Props> = ({
  className,
  onVideoSelect,
  videos,
  loading
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('feed');

  const handleFeedVideoPlay = (post: CommunityFeedPost) => {
    // Convert CommunityFeedPost to WatchVideoData format
    if (post.type === 'video' && post.content.videoId) {
      const videoData = {
        id: post.id,
        videoId: post.content.videoId,
        title: post.content.title,
        thumbnail: post.content.videoThumbnail || '',
        description: post.content.body || '',
        duration: post.content.videoDuration || '',
        views: `${post.meta.views} views`,
        xpReward: post.meta.xpEarned || 0,
        creator: {
          id: post.author.id,
          name: post.author.username,
          avatar: post.author.avatar,
          subscribers: `${post.community.memberCount} members`,
          isVerified: post.community.verified,
          level: post.author.level || 1
        },
        tags: [],
        relatedVideos: []
      };

      onVideoSelect?.(videoData);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6 px-6">
        <div className={cn(
          "inline-flex items-center gap-1 p-1.5 rounded-[16px]",
          "bg-gradient-to-br from-white/95 via-white/90 to-white/85",
          "dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/85",
          "backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50",
          "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)]"
        )}>
          <motion.button
            onClick={() => setViewMode('feed')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-medium text-sm transition-all duration-300",
              viewMode === 'feed'
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <List className="w-4 h-4" strokeWidth={2.5} />
            <span>Community Feed</span>
          </motion.button>

          <motion.button
            onClick={() => setViewMode('grid')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-medium text-sm transition-all duration-300",
              viewMode === 'grid'
                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Grid3x3 className="w-4 h-4" strokeWidth={2.5} />
            <span>Video Grid</span>
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'feed' ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CommunityWeightedFeed
              className="px-6"
              onVideoPlay={handleFeedVideoPlay}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <WIZUPDashboardV12_5
              onVideoSelect={onVideoSelect}
              videos={videos}
              loading={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WIZUPDashboardV13;
