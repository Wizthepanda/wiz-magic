import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Share2, Zap } from 'lucide-react';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { useWatchTimeZAPs } from '@/hooks/useWatchTimeZAPs';
import { ZAPProgressBar } from '@/components/ui/zap-progress-bar';
import { ShareButton } from '@/components/ui/share-button';

interface WizVideoPlayerWithZAPSystemProps {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  videoDuration: number; // in seconds
  isBoosted?: boolean;
  className?: string;
  onZAPsEarned?: (zaps: number) => void;
}

export const WizVideoPlayerWithZAPSystem: React.FC<WizVideoPlayerWithZAPSystemProps> = ({
  videoId,
  videoTitle,
  videoUrl,
  videoDuration,
  isBoosted = false,
  className = '',
  onZAPsEarned
}) => {
  const { zapData, zapProgress, awardShareZAPs } = useZAPSystem();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showZAPsEarned, setShowZAPsEarned] = useState(false);
  const [zapsEarnedAmount, setZapsEarnedAmount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize watch time ZAP tracking
  const {
    isTracking,
    watchTime,
    completionRate,
    totalZAPsEarned,
    tabFocused,
    isVideoCompleted,
    hasBeenCompleted,
    progressBarReady,
    currentZAPRate,
    estimatedZAPsForCompletion,
    startTracking,
    stopTracking,
    updateProgress,
    updateVideoTime
  } = useWatchTimeZAPs({
    videoId,
    videoDuration,
    isBoosted,
    actualVideoTime: currentTime,
    isVideoPlaying: isPlaying,
    onZAPsAwarded: (zaps) => {
      setZapsEarnedAmount(zaps);
      setShowZAPsEarned(true);
      onZAPsEarned?.(zaps);
      setTimeout(() => setShowZAPsEarned(false), 3000);
    },
    onProgressUpdate: (progress) => {
      // Update video player progress if needed
    },
    onVideoCompleted: () => {
      console.log('🎉 Video completed! Full ZAPs earned.');
    }
  });

  // Listen for level up events
  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      const { newLevel } = event.detail;
      setNewLevel(newLevel);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 5000);
    };

    window.addEventListener('levelUp', handleLevelUp as EventListener);
    return () => window.removeEventListener('levelUp', handleLevelUp as EventListener);
  }, []);

  // Video control handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      // Don't stop tracking immediately, just pause
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      if (!isTracking) {
        startTracking();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    updateProgress(time);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    stopTracking();
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;

    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleShare = async () => {
    try {
      const zapsEarned = await awardShareZAPs(videoId);
      if (zapsEarned > 0) {
        setZapsEarnedAmount(zapsEarned);
        setShowZAPsEarned(true);
        setTimeout(() => setShowZAPsEarned(false), 3000);
      }
    } catch (error) {
      console.error('Error awarding share ZAPs:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const dailyZAPCap = 360; // From ZAP_CONFIG.DAILY_ZAP_CAP
  const dailyProgress = ((zapData?.dailyZAPs || 0) / dailyZAPCap) * 100;
  const canEarnMoreZAPs = dailyProgress < 100;

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.volume = volume;
          }
        }}
      />

      {/* Video Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-4 left-4 right-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/80 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMuteToggle}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 bg-white/30 rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ShareButton onShare={handleShare} />
              <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <Maximize className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ZAP Progress Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <ZAPProgressBar
          className="mb-3"
          showTooltip
          videoProgress={completionRate * 100}
          isVideoCompleted={isVideoCompleted}
          hasBeenCompleted={hasBeenCompleted}
          progressBarReady={progressBarReady}
        />

        {/* ZAP Earning Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4 text-white/80">
            {isBoosted && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                <Zap className="w-3 h-3 text-yellow-400" fill="currentColor" />
                <span className="text-yellow-400 font-medium">1.5x Boost</span>
              </div>
            )}

            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>{Math.floor(currentZAPRate)}/hr</span>
            </div>

            <div>
              <span className="text-green-400">{totalZAPsEarned}</span> ZAPs earned
            </div>

            <div>
              <span className="text-blue-400">{Math.floor(completionRate * 100)}%</span> complete
            </div>
          </div>

          <div className="text-white/60">
            {canEarnMoreZAPs ? (
              <span>Daily: {zapData?.dailyZAPs || 0}/{dailyZAPCap}</span>
            ) : (
              <span className="text-red-400">Daily cap reached</span>
            )}
          </div>
        </div>

        {/* Tab Focus Warning */}
        {!tabFocused && isTracking && (
          <motion.div
            className="mt-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-red-400 text-xs font-medium">
              ⚠️ Tab not focused - ZAP earning paused
            </div>
          </motion.div>
        )}
      </div>

      {/* ZAPs Earned Animation */}
      <AnimatePresence>
        {showZAPsEarned && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/90 to-pink-500/90 rounded-full border border-white/20">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
              <span className="text-white font-bold">+{zapsEarnedAmount} ZAPs</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">Level Up!</div>
              <div className="text-xl text-white">You reached Level {newLevel}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};