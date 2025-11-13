import React from 'react';
import { cn } from '@/lib/utils';
import { Post } from '@/lib/firestore/queries';
import PremiumMultiFeed from './feed/PremiumMultiFeed';
import RightInsightsPanel from './feed/RightInsightsPanel';

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
    <div className={cn('w-full', className)}>
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-violet-50">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 h-full">
          {/* Left Feed Area - Redesigned Multi-Feed */}
          <div className="overflow-y-auto">
            <PremiumMultiFeed onVideoPlay={handleSingleFeedVideoPlay} />
          </div>
          
          {/* Right Panel */}
          <div className="hidden xl:block overflow-y-auto">
            <RightInsightsPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default WIZUPDashboardV13;
