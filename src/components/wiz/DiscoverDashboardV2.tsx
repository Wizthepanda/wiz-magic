import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { SmartDiscoverLayout } from './discover/SmartDiscoverLayout';
import { WatchDialogV4, WatchVideoData } from './WatchDialogV4';
import type { Video } from '@/hooks/useCategoryInfinite';

interface DiscoverDashboardV2Props {
  className?: string;
}

/**
 * DiscoverDashboardV2 Component
 *
 * The next generation Discover dashboard with:
 * - 3-column responsive grid
 * - Infinite scroll per category
 * - Sidebar-aware layout
 * - Cinematic video cards with hover previews
 * - Glassmorphic design
 */
export function DiscoverDashboardV2({ className }: DiscoverDashboardV2Props) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedVideo, setSelectedVideo] = useState<WatchVideoData | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Convert Video type to WatchVideoData type
  const handleVideoSelect = (video: Video) => {
    const watchVideoData: WatchVideoData = {
      id: video.id,
      videoId: video.videoId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      duration: video.duration,
      views: video.views,
      xpReward: video.xpReward,
      creator: {
        id: video.creator.id,
        name: video.creator.name,
        avatar: video.creator.avatar,
        subscribers: video.creator.subscribers,
        isVerified: video.creator.isVerified,
        level: video.creator.level
      },
      tags: video.tags,
      relatedVideos: []
    };

    setSelectedVideo(watchVideoData);
    setShowVideoPlayer(true);
  };

  const handleVideoClose = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
  };

  const handleVideoComplete = (video: WatchVideoData) => {
    console.log('✅ Video completed:', video.title);
    // TODO: Add XP reward logic here
  };

  const handleVideoChange = (newVideo: WatchVideoData) => {
    setSelectedVideo(newVideo);
  };

  return (
    <div
      className={cn(
        "min-h-screen w-full",
        className
      )}
      style={{
        background: isDark
          ? 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)'
          : 'linear-gradient(to bottom right, #ffffff, #f7f9fc, #eef1f7)'
      }}
    >
      {/* Smart Discover Layout */}
      <SmartDiscoverLayout onVideoSelect={handleVideoSelect} />

      {/* Watch Video Dialog */}
      <AnimatePresence>
        {showVideoPlayer && selectedVideo && (
          <WatchDialogV4
            video={selectedVideo}
            isOpen={showVideoPlayer}
            onClose={handleVideoClose}
            onVideoComplete={handleVideoComplete}
            onVideoChange={handleVideoChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default DiscoverDashboardV2;
