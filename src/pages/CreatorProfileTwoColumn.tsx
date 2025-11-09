/**
 * CreatorProfileTwoColumn - Two-column creator workspace
 * Left: Communities & Posts (30%)
 * Right: Vertical Video Panel (70%)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreatorProfile, useCreatorVideos } from '@/hooks/useCreatorProfile';
import { usePlayer } from '@/contexts/PlayerContext';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { CreatorHeaderInline } from '@/components/creator/CreatorHeaderInline';
import { CommunitiesColumn } from '@/components/creator/CommunitiesColumn';
import { VerticalVideoList } from '@/components/creator/VerticalVideoList';
import { TipModal } from '@/components/creator/TipModal';
import { FullscreenPlayer } from '@/components/creator/FullscreenPlayer';
import { trackCreatorProfileView, trackVideoPlayFromProfile } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export default function CreatorProfileTwoColumn() {
  const { creatorId: paramCreatorId, username } = useParams<{ creatorId?: string; username?: string }>();
  const navigate = useNavigate();

  // Use either creatorId or username parameter
  const creatorIdentifier = paramCreatorId || username;

  const { data: creatorProfile, isLoading: creatorLoading, error: creatorError } = useCreatorProfile(creatorIdentifier);
  const { data: videos = [], isLoading: videosLoading } = useCreatorVideos(creatorProfile?.id);
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

    // Set queue to remaining videos (Up Next)
    const upNext = videos.slice(index + 1, index + 11); // Next 10 videos
    setQueue(upNext);

    // Play the selected video (opens existing fullscreen player)
    play(video);
  };

  const handleTipClick = () => {
    closeAll(); // Close any open dropdowns
    setShowTipModal(true);
  };

  if (creatorLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-neutral-900 flex items-center justify-center z-[90]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (creatorError || !creatorProfile) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-neutral-900 flex items-center justify-center z-[90]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Creator not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The creator you're looking for doesn't exist</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full hover:from-indigo-700 hover:to-violet-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="fixed inset-0 bg-white dark:bg-neutral-900 overflow-y-auto z-[90]">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className={cn(
            'fixed top-4 left-4 z-[100]',
            'w-12 h-12 rounded-full',
            'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl',
            'border border-zinc-200 dark:border-zinc-800',
            'shadow-lg hover:shadow-xl',
            'flex items-center justify-center',
            'transition-all duration-200 hover:scale-110',
            'group'
          )}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </motion.button>

        {/* Creator Header with Inline Actions */}
        <CreatorHeaderInline
          creatorId={creatorProfile.id}
          displayName={creatorProfile.displayName}
          username={creatorProfile.username}
          photoURL={creatorProfile.avatar}
          bannerURL={creatorProfile.banner}
          verified={creatorProfile.verified}
          subscriberCount={creatorProfile.stats.followers}
          videoCount={creatorProfile.stats.totalVideos}
          onTipClick={handleTipClick}
        />

        {/* Two-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Communities & Posts (30%) */}
            <div className="lg:w-[30%] order-2 lg:order-1">
              <div className="sticky top-4 bg-white dark:bg-neutral-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-[calc(100vh-200px)]">
                <CommunitiesColumn creatorId={creatorProfile.id} />
              </div>
            </div>

            {/* Right Column: Vertical Video List (70%) */}
            <div className="lg:w-[70%] order-1 lg:order-2">
              {videosLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <VerticalVideoList
                  videos={videos}
                  onVideoClick={handleVideoClick}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Player (Unchanged) */}
      {currentVideo && <FullscreenPlayer />}

      {/* Tip Modal (Fixed Positioning) */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={creatorProfile.id}
        creatorName={creatorProfile.displayName}
        creatorAvatar={creatorProfile.avatar}
      />
    </>
  );
}
