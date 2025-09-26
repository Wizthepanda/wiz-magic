import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { VideoContainer } from './watch-components/VideoContainer';
import { ActionRow } from './watch-components/ActionRow';
import { CreatorCard } from './watch-components/CreatorCard';
import { RelatedPanel } from './watch-components/RelatedPanel';
import { MinimalRewardToast } from './watch-components/MinimalRewardToast';

// Video data interface
export interface WatchVideoData {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  xpReward: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
    subscribers: string;
    isVerified: boolean;
    level?: number;
  };
  tags: string[];
  relatedVideos?: WatchVideoData[];
  watchProgress?: number;
}

interface WatchDialogV4Props {
  video: WatchVideoData | null;
  isOpen: boolean;
  onClose: () => void;
  onVideoComplete?: (video: WatchVideoData) => void;
  onVideoChange?: (video: WatchVideoData) => void;
}

export const WatchDialogV4: React.FC<WatchDialogV4Props> = ({
  video,
  isOpen,
  onClose,
  onVideoComplete,
  onVideoChange
}) => {
  const isMobile = useIsMobile();
  const [xpProgress, setXpProgress] = useState(0);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Reset state when video changes
  useEffect(() => {
    if (video) {
      setXpProgress(video.watchProgress || 0);
      setIsSubscribed(false);
      setEarnedXP(0);
      setShowRewardToast(false);
    }
  }, [video?.id]);

  // Handle XP progress updates (simulate video watching)
  useEffect(() => {
    if (!isOpen || !video) return;

    const interval = setInterval(() => {
      setXpProgress(prev => {
        const newProgress = Math.min(prev + 2, 100);

        // Award XP at milestones
        if (newProgress >= 25 && prev < 25) {
          handleXPReward(Math.floor(video.xpReward * 0.25));
        } else if (newProgress >= 50 && prev < 50) {
          handleXPReward(Math.floor(video.xpReward * 0.25));
        } else if (newProgress >= 75 && prev < 75) {
          handleXPReward(Math.floor(video.xpReward * 0.25));
        } else if (newProgress >= 100 && prev < 100) {
          handleXPReward(Math.floor(video.xpReward * 0.25));
          onVideoComplete?.(video);
        }

        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, video, onVideoComplete]);

  const handleXPReward = useCallback((xp: number) => {
    setEarnedXP(xp);
    setShowRewardToast(true);

    // Hide toast after animation
    setTimeout(() => {
      setShowRewardToast(false);
    }, 1600);
  }, []);

  const handleSubscribe = useCallback(() => {
    setIsSubscribed(!isSubscribed);
  }, [isSubscribed]);

  const handleRelatedVideoSelect = useCallback((relatedVideo: WatchVideoData) => {
    if (onVideoChange) {
      onVideoChange(relatedVideo);
    }
  }, [onVideoChange]);

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        {/* Custom backdrop with light gradient */}
        <DialogOverlay className="watch-modal-backdrop" />

        {/* Main dialog content */}
        <DialogContent
          className={cn(
            "fixed z-50 gap-0 border-0 p-0 shadow-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-bottom-[48%] data-[state=open]:slide-in-from-bottom-[48%]",
            "sm:data-[state=closed]:slide-out-to-bottom-[48%] sm:data-[state=open]:slide-in-from-bottom-[48%]",
            isMobile
              ? "inset-0 w-screen h-screen max-w-none max-h-none rounded-none"
              : "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-6xl h-[85vh] rounded-2xl"
          )}
          aria-describedby={undefined}
        >
          <motion.div
            className="h-full overflow-hidden gpu-accelerated"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 z-50 h-10 w-10 rounded-full",
                "bg-white/80 backdrop-blur-md border border-white/50",
                "hover:bg-white/90 hover:scale-105 transition-all duration-200",
                "flex items-center justify-center gpu-accelerated"
              )}
              aria-label="Close video"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>

            {isMobile ? (
              /* Mobile Layout - Full screen stacked */
              <div className="h-full flex flex-col bg-transparent">
                {/* Video section */}
                <div className="relative flex-1 p-4">
                  <VideoContainer
                    video={video}
                    xpProgress={xpProgress}
                    className="h-full"
                  />

                  {/* Reward toast */}
                  <AnimatePresence>
                    {showRewardToast && (
                      <div className="watch-reward-toast">
                        <MinimalRewardToast xp={earnedXP} />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Creator + Actions bar */}
                <div className="p-4 bg-white/90 backdrop-blur-xl border-t border-white/50">
                  <CreatorCard
                    creator={video.creator}
                    isSubscribed={isSubscribed}
                    className="mb-4"
                  />
                  <ActionRow
                    isSubscribed={isSubscribed}
                    onSubscribe={handleSubscribe}
                    video={video}
                    className="mb-4"
                  />
                </div>

                {/* Related content - collapsible */}
                <div className="flex-1 bg-white/70 backdrop-blur-md">
                  <RelatedPanel
                    videos={video.relatedVideos || []}
                    onVideoSelect={handleRelatedVideoSelect}
                    isMobile={true}
                  />
                </div>
              </div>
            ) : (
              /* Desktop Layout - Centered dialog with sidebar */
              <div className="h-full flex bg-transparent">
                {/* Left: Main video area */}
                <div className="flex-1 p-6 pr-3">
                  <div className="relative h-full">
                    <VideoContainer
                      video={video}
                      xpProgress={xpProgress}
                      className="h-full"
                    />

                    {/* Reward toast */}
                    <AnimatePresence>
                      {showRewardToast && (
                        <div className="watch-reward-toast">
                          <MinimalRewardToast xp={earnedXP} />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Creator card and actions below video */}
                  <div className="mt-4">
                    <CreatorCard
                      creator={video.creator}
                      isSubscribed={isSubscribed}
                      className="mb-4"
                    />
                    <ActionRow
                      isSubscribed={isSubscribed}
                      onSubscribe={handleSubscribe}
                      video={video}
                    />
                  </div>
                </div>

                {/* Right: Related panel */}
                <div className="w-80 p-6 pl-3 border-l border-white/20">
                  <RelatedPanel
                    videos={video.relatedVideos || []}
                    onVideoSelect={handleRelatedVideoSelect}
                    isMobile={false}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};