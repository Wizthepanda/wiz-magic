/**
 * CreatorFullScreen - Full-screen creator profile view
 * No sidebar, full focus on creator content
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCreatorProfile, useCreatorVideos } from '@/hooks/useCreatorProfile';
import { useCreatorCommunities } from '@/hooks/useCreatorCommunities';
import { usePlayer } from '@/contexts/PlayerContext';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { CreatorHeaderMinimal } from '@/components/creator/CreatorHeaderMinimal';
import { CreatorActionsBar } from '@/components/creator/CreatorActionsBar';
import { SocialLinksRow } from '@/components/creator/SocialLinksRow';
import { CreatorVideoGrid } from '@/components/creator/CreatorVideoGrid';
import { CommunityList } from '@/components/creator/CommunityList';
import { AboutSection } from '@/components/creator/AboutSection';
import { TipModal } from '@/components/creator/TipModal';
import { JoinCommunitiesModal } from '@/components/creator/JoinCommunitiesModal';
import { FullscreenPlayer } from '@/components/creator/FullscreenPlayer';
import { trackCreatorProfileView, trackVideoPlayFromProfile } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import * as Tabs from '@radix-ui/react-tabs';

export default function CreatorFullScreen() {
  const { creatorId: paramCreatorId, username } = useParams<{ creatorId?: string; username?: string }>();
  const navigate = useNavigate();

  // Use either creatorId or username parameter
  const creatorIdentifier = paramCreatorId || username;

  const { data: creatorProfile, isLoading: creatorLoading, error: creatorError } = useCreatorProfile(creatorIdentifier);
  const { data: videos = [], isLoading: videosLoading } = useCreatorVideos(creatorProfile?.id);
  const { data: creatorCommunities = [], isLoading: communitiesLoading } = useCreatorCommunities(creatorProfile?.id);
  const { currentVideo, play, setQueue } = usePlayer();
  const { closeAll } = useUIStore();
  const { user } = useAuth();
  const [showTipModal, setShowTipModal] = useState(false);
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');

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

  const handleJoinCommunityClick = () => {
    if (creatorCommunities.length === 1) {
      // If only one community, auto-navigate to Communities tab
      setActiveTab('communities');
    } else {
      // If multiple communities, open modal
      setShowCommunitiesModal(true);
    }
  };

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
            'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
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

        {/* Creator Header (Minimal) */}
        <CreatorHeaderMinimal
          displayName={creatorProfile.displayName}
          username={creatorProfile.username}
          photoURL={creatorProfile.avatar}
          bannerURL={creatorProfile.banner}
          verified={creatorProfile.verified}
          subscriberCount={creatorProfile.stats.followers}
          videoCount={creatorProfile.stats.totalVideos}
          communityCount={creatorCommunities.length}
        />

        {/* Actions Bar + Social Links + Tabs */}
        <div className="bg-white dark:bg-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Actions Row */}
            <div className="py-6 border-b border-zinc-200 dark:border-zinc-800">
              <CreatorActionsBar
                creatorId={creatorProfile.id}
                creatorName={creatorProfile.displayName}
                hasCommunity={creatorCommunities.length > 0}
                hasMultipleCommunities={creatorCommunities.length > 1}
                onTipClick={handleTipClick}
                onJoinCommunityClick={handleJoinCommunityClick}
              />
            </div>

            {/* Social Links Row */}
            {creatorProfile.socials && creatorProfile.socials.length > 0 && (
              <div className="py-4 border-b border-zinc-200 dark:border-zinc-800">
                <SocialLinksRow links={creatorProfile.socials} />
              </div>
            )}

            {/* Tabs */}
            <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
              <Tabs.List className="flex items-center gap-8 border-b border-zinc-200 dark:border-zinc-800">
                <Tabs.Trigger
                  value="videos"
                  className={cn(
                    'relative py-4 text-sm font-medium transition-colors',
                    'data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400',
                    'data-[state=inactive]:text-zinc-600 dark:data-[state=inactive]:text-zinc-400',
                    'hover:text-zinc-900 dark:hover:text-zinc-200',
                    'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                    'after:bg-indigo-600 dark:after:bg-indigo-400',
                    'after:transition-transform after:duration-200',
                    'data-[state=active]:after:scale-x-100 data-[state=inactive]:after:scale-x-0'
                  )}
                >
                  Videos
                </Tabs.Trigger>

                {creatorCommunities.length > 0 && (
                  <Tabs.Trigger
                    value="communities"
                    className={cn(
                      'relative py-4 text-sm font-medium transition-colors',
                      'data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400',
                      'data-[state=inactive]:text-zinc-600 dark:data-[state=inactive]:text-zinc-400',
                      'hover:text-zinc-900 dark:hover:text-zinc-200',
                      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                      'after:bg-indigo-600 dark:after:bg-indigo-400',
                      'after:transition-transform after:duration-200',
                      'data-[state=active]:after:scale-x-100 data-[state=inactive]:after:scale-x-0'
                    )}
                  >
                    Communities
                  </Tabs.Trigger>
                )}

                <Tabs.Trigger
                  value="about"
                  className={cn(
                    'relative py-4 text-sm font-medium transition-colors',
                    'data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400',
                    'data-[state=inactive]:text-zinc-600 dark:data-[state=inactive]:text-zinc-400',
                    'hover:text-zinc-900 dark:hover:text-zinc-200',
                    'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                    'after:bg-indigo-600 dark:after:bg-indigo-400',
                    'after:transition-transform after:duration-200',
                    'data-[state=active]:after:scale-x-100 data-[state=inactive]:after:scale-x-0'
                  )}
                >
                  About
                </Tabs.Trigger>
              </Tabs.List>

              {/* Tab Content */}
              <div className="py-8">
                {/* Videos Tab */}
                <Tabs.Content value="videos" className="focus:outline-none">
                  {videosLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">No videos yet</p>
                    </div>
                  ) : (
                    <CreatorVideoGrid videos={videos} onVideoClick={handleVideoClick} />
                  )}
                </Tabs.Content>

                {/* Communities Tab */}
                <Tabs.Content value="communities" className="focus:outline-none">
                  {communitiesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                  ) : (
                    <CommunityList
                      communities={creatorCommunities}
                      creatorId={creatorProfile.id}
                      creatorName={creatorProfile.displayName}
                      creatorAvatar={creatorProfile.avatar}
                    />
                  )}
                </Tabs.Content>

                {/* About Tab */}
                <Tabs.Content value="about" className="focus:outline-none">
                  <AboutSection
                    bio={creatorProfile.bio}
                    socialLinks={creatorProfile.socials}
                    joinedDate={creatorProfile.createdAt}
                  />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </div>
      </div>

      {/* Fullscreen Player */}
      {currentVideo && <FullscreenPlayer />}

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={creatorProfile.id}
        creatorName={creatorProfile.displayName}
        creatorAvatar={creatorProfile.avatar}
      />

      {/* Join Communities Modal */}
      <JoinCommunitiesModal
        isOpen={showCommunitiesModal}
        onClose={() => setShowCommunitiesModal(false)}
        communities={creatorCommunities}
        creatorId={creatorProfile.id}
        creatorName={creatorProfile.displayName}
        creatorAvatar={creatorProfile.avatar}
      />
    </>
  );
}
