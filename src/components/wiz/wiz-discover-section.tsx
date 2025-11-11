import { useState } from 'react';
import { WizVideoPlayer } from './wiz-video-player';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { MultiFeedLayout } from '@/components/multifeed/MultiFeedLayout';
import { VideoItem } from '@/lib/feed-utils';

export const WizDiscoverSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const handleWatchVideo = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  return (
    <div className="relative min-h-screen">
      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Multi-Feed Layout */}
      <div className="relative z-10 py-6">
        <MultiFeedLayout onVideoPlay={handleWatchVideo} />
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold">
              {selectedVideo?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="px-6 pb-6">
              <WizVideoPlayer
                videoId={selectedVideo.videoId}
                title={selectedVideo.title}
                creator={selectedVideo.creator}
                xpReward={selectedVideo.xpReward}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
