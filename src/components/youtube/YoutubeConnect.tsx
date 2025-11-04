/**
 * YouTube Connect - Step 1
 *
 * Handles YouTube OAuth connection and fetches user's channel + videos.
 * Premium liquid-glass card with animated gradients.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { YouTubeConnectionService } from '@/lib/youtube-connection-service';
import { youTubeAPI, YouTubeVideo } from '@/lib/youtube-api';

interface YoutubeConnectProps {
  onSuccess: (channelInfo: {
    channelId: string;
    channelTitle: string;
    channelHandle?: string; // YouTube channel handle (customUrl)
    channelThumbnail: string;
    accessToken: string;
    videos: YouTubeVideo[];
  }) => void;
}

export const YoutubeConnect: React.FC<YoutubeConnectProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Connect YouTube using popup flow
      const success = await YouTubeConnectionService.connectYouTubeChannel(user.uid, true);

      if (!success) {
        throw new Error('Failed to connect YouTube channel');
      }

      // Get access token
      const accessToken = await YouTubeConnectionService.getValidAccessToken(user.uid);

      if (!accessToken) {
        throw new Error('Failed to retrieve access token');
      }

      // Set access token on YouTube API instance
      youTubeAPI.setAccessToken(accessToken);

      // Fetch channel info
      const channelInfo = await youTubeAPI.getChannelInfo();

      if (!channelInfo) {
        throw new Error('Failed to fetch channel information');
      }

      // Fetch recent videos
      const videos = await youTubeAPI.getRecentVideos(20);

      // Success! Move to next step
      onSuccess({
        channelId: channelInfo.id,
        channelTitle: channelInfo.name,
        channelHandle: channelInfo.customUrl, // YouTube channel handle
        channelThumbnail: channelInfo.avatar,
        accessToken,
        videos,
      });
    } catch (err: any) {
      console.error('YouTube connection error:', err);
      setError(err.message || 'Failed to connect YouTube. Please try again.');
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-white/50 backdrop-blur-xl border border-gray-200/50 shadow-2xl p-12 text-center"
      >
        {/* Animated Background Gradient Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 space-y-8">
          {/* Animated YouTube Icon */}
          <motion.div
            animate={{
              scale: isConnecting ? [1, 1.1, 1] : 1,
              rotate: isConnecting ? [0, 5, -5, 0] : 0,
            }}
            transition={{
              duration: 2,
              repeat: isConnecting ? Infinity : 0,
              ease: 'easeInOut',
            }}
            className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 items-center justify-center shadow-2xl"
          >
            {isConnecting ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : (
              <Youtube className="w-12 h-12 text-white" />
            )}
          </motion.div>

          {/* Title */}
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
              Connect Your YouTube Channel
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {isConnecting
                ? 'Connecting to YouTube and fetching your videos...'
                : 'One click to sync your channel. We\'ll auto-fetch your videos for easy publishing.'}
            </p>
          </div>

          {/* Connect Button */}
          {!isConnecting && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white font-semibold hover:scale-105 transition-transform shadow-2xl"
              >
                <Youtube className="w-5 h-5 mr-2" />
                Connect YouTube Channel
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {isConnecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-3 text-gray-600"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Setting up your connection...</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Secure OAuth 2.0
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Read-only access
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Revoke anytime
            </span>
          </div>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>1️⃣ You'll authorize read-only access to your YouTube channel</p>
          <p>2️⃣ We'll fetch your public videos automatically</p>
          <p>3️⃣ Select which videos to publish to WIZUP Discover</p>
          <p>4️⃣ Earn ZAPs when users watch your content!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default YoutubeConnect;
