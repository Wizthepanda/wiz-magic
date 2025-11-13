import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Post } from '@/lib/firestore/queries';
import PremiumMultiFeed from './feed/PremiumMultiFeed';
import RightInsightsPanel from './feed/RightInsightsPanel';
import { CommunityPostViewScreen } from './feed/CommunityPostViewScreen';
import { CommunityRightPanel } from './right/CommunityRightPanel';
import { usePostViewStore } from '@/store/postViewStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface WIZUPDashboardV13Props {
  className?: string;
  onVideoSelect?: (video: any) => void;
  videos?: any[];
  loading?: boolean;
}

const WIZUPDashboardV13: React.FC<WIZUPDashboardV13Props> = ({
  className,
  onVideoSelect,
  videos,
  loading
}) => {
  const [zapToast, setZapToast] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });
  const { activePost } = usePostViewStore();

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    console.log('Vote:', postId, voteType);
    // Handle voting logic here
    // Could trigger ZAP toast for upvotes
    if (voteType === 'up') {
      showZapToast(10); // Example ZAP reward for upvoting
    }
  };

  const showZapToast = (amount: number) => {
    setZapToast({ amount, show: true });
    setTimeout(() => setZapToast({ amount: 0, show: false }), 3000);
  };

  // Unified premium multi-feed — no view selector

  // Removed view mode persistence and toggle  unified feed only


  const handleSingleFeedVideoPlay = (post: Post) => {
    // Convert Post to WatchVideoData format
    if (post.media.type === 'video' && post.media.videoId) {
      const videoData = {
        id: post.id,
        videoId: post.media.videoId,
        title: post.title,
        thumbnail: post.media.thumbnail || '',
        description: post.excerpt || post.content || '',
        duration: post.media.duration || '',
        views: '0 views', // Can be added to Post schema if needed
        xpReward: post.zapsReward || 0,
        creator: {
          id: post.authorId,
          name: post.authorName,
          avatar: post.authorAvatar,
          subscribers: `${post.communityMemberCount} members`,
          isVerified: post.communityVerified,
          level: post.authorLevel
        },
        tags: [],
        relatedVideos: []
      };

      onVideoSelect?.(videoData);
    }
  };

  return (
    <div className={cn('w-full relative', className)}>
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-violet-50">
        <motion.div
          animate={activePost ? { x: -20, opacity: 0.7 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 xl:grid-cols-[70%_30%] gap-8 h-full max-w-7xl mx-auto px-8"
        >
          {/* Left Feed Area - Redesigned Multi-Feed */}
          <div className="overflow-y-auto">
            <PremiumMultiFeed
              onVideoPlay={handleSingleFeedVideoPlay}
              onZapEarned={showZapToast}
            />
          </div>

          {/* Right Panel */}
          <div className="hidden xl:block overflow-y-auto">
            {activePost ? (
              <CommunityRightPanel community={activePost.community || {
                name: activePost.communityName || 'Community',
                description: 'Community description',
                members: activePost.communityMemberCount || 0
              }} />
            ) : (
              <RightInsightsPanel />
            )}
          </div>
        </motion.div>
      </main>

      {/* Seamless post screen */}
      <CommunityPostViewScreen />

      {/* Floating ZAP Toast */}
      <AnimatePresence>
        {zapToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[100] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <Zap className="w-6 h-6" />
            </motion.div>
            <span>+{zapToast.amount} ZAPs Earned!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WIZUPDashboardV13;
