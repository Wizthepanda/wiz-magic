/**
 * CreatorFullScreen - Full-screen creator profile view
 * No sidebar, full focus on creator content
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreatorProfile, useCreatorVideos } from '@/hooks/useCreatorProfile';
import { useCreatorCommunity } from '@/hooks/useCreatorCommunity';
import { usePlayer } from '@/contexts/PlayerContext';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { CreatorHeader } from '@/components/creator/CreatorHeader';
import { CreatorVideoGrid } from '@/components/creator/CreatorVideoGrid';
import { TipModal } from '@/components/creator/TipModal';
import { FullscreenPlayer } from '@/components/creator/FullscreenPlayer';
import { trackCreatorProfileView, trackVideoPlayFromProfile } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export default function CreatorFullScreen() {
  const { creatorId: paramCreatorId, username } = useParams<{ creatorId?: string; username?: string }>();
  const navigate = useNavigate();

  // Use either creatorId or username parameter
  const creatorIdentifier = paramCreatorId || username;

  const { data: creatorProfile, isLoading: creatorLoading, error: creatorError } = useCreatorProfile(creatorIdentifier);
  const { data: videos = [], isLoading: videosLoading } = useCreatorVideos(creatorProfile?.id);
  const { data: creatorCommunity, isLoading: communityLoading } = useCreatorCommunity(creatorProfile?.id);
  const { currentVideo, play, setQueue } = usePlayer();
  const { closeAll } = useUIStore();
  const { user } = useAuth();
  const [showTipModal, setShowTipModal] = useState(false);

  // Lock body scroll when on this page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close all dropdowns when component mounts
  useEffect(() => {
    closeAll();
  }, [closeAll]);

  // Track profile view when creator profile loads
  useEffect(() => {
    if (creatorProfile?.id) {
      trackCreatorProfileView(user?.uid, creatorProfile.id);
    }
  }, [creatorProfile?.id, user?.uid]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleVideoClick = (video: any, index: number) => {
    console.log('🎬 Playing video from creator profile:', video.title);

    // Track video play analytics
    if (creatorProfile?.id) {
      trackVideoPlayFromProfile(user?.uid, creatorProfile.id, video.videoId);
    }

    // Set queue to remaining videos
    const upNext = videos.slice(index + 1, index + 11); // Next 10 videos
    setQueue(upNext);

    // Play the selected video
    play(video);
  };

  const handleTipClick = () => {
    closeAll(); // Close any open dropdowns
    setShowTipModal(true);
  };

  if (creatorLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center z-[90]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (creatorError || !creatorProfile) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center z-[90]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Creator not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The creator you're looking for doesn't exist</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Transform CreatorPublicProfile to CreatorProfile format for components
  const creator = {
    id: creatorProfile.id,
    displayName: creatorProfile.displayName,
    username: creatorProfile.username,
    photoURL: creatorProfile.avatar,
    bannerURL: creatorProfile.banner,
    bio: creatorProfile.bio,
    youtubeConnected: !!creatorProfile.creatorData?.channelId,
    youtubeChannelId: creatorProfile.creatorData?.channelId,
    verified: creatorProfile.verified,
    subscriberCount: creatorProfile.stats.followers,
    videoCount: creatorProfile.stats.totalVideos,
    featuredCommunities: [],
    socialLinks: creatorProfile.socials,
    // Community data
    hasCommunity: !!creatorCommunity,
    communityId: creatorCommunity?.id,
    hasCourse: false, // TODO: Add course detection when implemented
    courseId: undefined,
  };

  return (
    <>
      {/* Main Content */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-50 via-white to-violet-50 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950 overflow-y-auto z-[90]">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className={cn(
            'fixed top-4 left-4 z-[100]',
            'w-12 h-12 rounded-full',
            'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
            'border border-white/20',
            'shadow-lg hover:shadow-xl',
            'flex items-center justify-center',
            'transition-all duration-200 hover:scale-110',
            'group'
          )}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-purple-500 transition-colors" />
        </motion.button>

        {/* Creator Header */}
        <CreatorHeader
          creator={creator}
          onTipClick={handleTipClick}
        />

        {/* Videos Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Videos
          </h2>
          {videosLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No videos yet</p>
            </div>
          ) : (
            <CreatorVideoGrid videos={videos} onVideoClick={handleVideoClick} />
          )}
        </div>
      </div>

      {/* Fullscreen Player */}
      {currentVideo && <FullscreenPlayer />}

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={creator.id}
        creatorName={creator.displayName}
        creatorAvatar={creator.photoURL}
      />
    </>
  );
}
