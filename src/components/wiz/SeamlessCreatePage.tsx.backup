/**
 * Seamless Create Page with Popup OAuth
 *
 * Example implementation of Create page using:
 * - Popup-based YouTube OAuth (no routing redirects)
 * - React Query for instant data fetching
 * - Animated skeleton loaders
 * - Server-side token management (no localStorage)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, CheckCircle, Video, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useYouTubeConnect } from '@/hooks/useYouTubeConnect';
import {
  useYouTubeConnectionStatus,
  useYouTubeVideos,
  useYouTubeChannel,
} from '@/lib/api/youtube-api-client';
import {
  VideoGridSkeleton,
  ChannelHeaderSkeleton,
} from '@/components/ui/video-grid-skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VideoSelectionProps {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  selected: boolean;
  onToggle: () => void;
}

const VideoCard = ({
  videoId,
  title,
  thumbnail,
  duration,
  views,
  selected,
  onToggle,
}: VideoSelectionProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    className={cn(
      'relative cursor-pointer rounded-2xl overflow-hidden',
      'border-2 transition-all duration-200',
      selected
        ? 'border-purple-500 shadow-lg shadow-purple-500/20'
        : 'border-transparent hover:border-purple-300'
    )}
    onClick={onToggle}
  >
    {/* Thumbnail */}
    <div className="relative aspect-video overflow-hidden bg-slate-200">
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover"
      />
      {/* Duration badge */}
      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
        {duration}
      </div>
      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
        >
          <CheckCircle className="w-5 h-5 text-white" />
        </motion.div>
      )}
    </div>

    {/* Content */}
    <div className="p-4 bg-white dark:bg-slate-900">
      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{title}</h3>
      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <Video className="w-3 h-3" />
        <span>{views}</span>
      </div>
    </div>
  </motion.div>
);

export const SeamlessCreatePage = () => {
  const { toast } = useToast();
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

  // YouTube OAuth hook (popup-based, no redirects)
  const { openPopup, isConnecting, isConnected } = useYouTubeConnect();

  // React Query hooks (auto-refresh after OAuth)
  const { data: connectionStatus, isLoading: statusLoading } = useYouTubeConnectionStatus();
  const {
    data: channelData,
    isLoading: channelLoading,
    refetch: refetchChannel,
  } = useYouTubeChannel();
  const {
    data: videosData,
    isLoading: videosLoading,
    isFetching: videosFetching,
  } = useYouTubeVideos({
    maxResults: 50,
    enabled: connectionStatus?.connected === true,
  });

  const connected = connectionStatus?.connected || isConnected;
  const videos = videosData?.videos || [];

  // Toggle video selection
  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) {
        next.delete(videoId);
      } else {
        if (next.size >= 30) {
          toast({
            title: 'Maximum Reached',
            description: 'You can select up to 30 videos maximum.',
            variant: 'destructive',
          });
          return prev;
        }
        next.add(videoId);
      }
      return next;
    });
  };

  // Publish selected videos
  const handlePublish = async () => {
    if (selectedVideoIds.size === 0) {
      toast({
        title: 'No Videos Selected',
        description: 'Please select at least one video to publish.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const selectedVideos = videos.filter((v) => selectedVideoIds.has(v.id));

      // TODO: Call your publish API endpoint
      const response = await fetch('/api/videos/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ videos: selectedVideos }),
      });

      if (!response.ok) throw new Error('Publish failed');

      toast({
        title: 'Videos Published! 🚀',
        description: `${selectedVideoIds.size} videos are now live on WIZ.`,
      });

      setSelectedVideoIds(new Set());
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create on WIZ
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Connect your YouTube channel and share your content with the world
          </p>
        </motion.div>

        {/* Connection Status / CTA */}
        <AnimatePresence mode="wait">
          {!connected ? (
            // Not Connected State
            <motion.div
              key="not-connected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Youtube className="w-10 h-10 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Connect Your YouTube Channel
                      </h2>
                      <p className="text-slate-600">
                        Import your videos instantly with one click. We'll open a secure popup
                        to authorize access - your page won't reload.
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      onClick={openPopup}
                      disabled={isConnecting}
                      className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      {isConnecting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Youtube className="w-5 h-5 mr-2" />
                          Connect YouTube
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Connected State
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Channel Header */}
              {channelLoading ? (
                <ChannelHeaderSkeleton />
              ) : channelData ? (
                <Card className="border-2 border-green-200 bg-gradient-to-br from-white to-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={channelData.avatar}
                        alt={channelData.title}
                        className="w-16 h-16 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{channelData.title}</h3>
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {channelData.subscriberCount} subscribers • {channelData.videoCount} videos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Video Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your Videos</h2>
                    <p className="text-sm text-slate-600">
                      {selectedVideoIds.size > 0
                        ? `${selectedVideoIds.size} of 30 videos selected`
                        : 'Select videos to publish to WIZ'}
                    </p>
                  </div>

                  {selectedVideoIds.size > 0 && (
                    <Button
                      size="lg"
                      onClick={handlePublish}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 rounded-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Publish {selectedVideoIds.size} Video{selectedVideoIds.size !== 1 ? 's' : ''}
                    </Button>
                  )}
                </div>

                {/* Video Grid */}
                {videosLoading || videosFetching ? (
                  <VideoGridSkeleton count={12} />
                ) : videos.length === 0 ? (
                  <Card className="border-2 border-yellow-200 bg-yellow-50">
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        No Videos Found
                      </h3>
                      <p className="text-slate-600">
                        We couldn't find any videos on your channel. Make sure you have
                        published videos on YouTube.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                      <VideoCard
                        key={video.id}
                        videoId={video.id}
                        title={video.title}
                        thumbnail={video.thumbnail}
                        duration={video.duration}
                        views={video.views}
                        selected={selectedVideoIds.has(video.id)}
                        onToggle={() => toggleVideoSelection(video.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {[
              {
                icon: '⚡',
                title: 'Instant Connection',
                description: 'Connect in seconds with our seamless popup flow',
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Your tokens are encrypted and stored server-side',
              },
              {
                icon: '🎬',
                title: 'Full Control',
                description: 'Choose exactly which videos to share with your audience',
              },
            ].map((feature, i) => (
              <Card key={i} className="border-0 bg-white/50 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SeamlessCreatePage;
