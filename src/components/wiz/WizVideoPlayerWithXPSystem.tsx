import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Share2 } from 'lucide-react';
import { useWizXPSystem } from '@/hooks/useWizXPSystem';
import { useWatchTimeXP } from '@/hooks/useWatchTimeXP';
import WizXPProgressBar from '@/components/ui/WizXPProgressBar';
import { ShareButton } from '@/components/ui/share-button';
import { BadgeSystem } from '@/components/ui/BadgeSystem';

interface WizVideoPlayerWithXPSystemProps {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  videoDuration: number; // in seconds
  className?: string;
}

export const WizVideoPlayerWithXPSystem: React.FC<WizVideoPlayerWithXPSystemProps> = ({
  videoId,
  videoTitle,
  videoUrl,
  videoDuration,
  className = ''
}) => {
  const { progressBarData, canEarnMoreXP, dailyProgress, dailyXPRemaining } = useWizXPSystem();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showXPEarned, setShowXPEarned] = useState(false);
  const [xpEarnedAmount, setXpEarnedAmount] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);

  // Initialize watch time XP tracking
  const {
    isWatching,
    sessionWatchTime,
    totalWatchTime,
    completionRate,
    potentialXP,
    totalPotentialXP,
    startWatching,
    pauseWatching,
    endWatchingSession,
    canEarnXP
  } = useWatchTimeXP({
    videoId,
    videoDuration,
    enableAntiCheat: true,
    onXPAwarded: (xpAwarded, totalXP) => {
      setXpEarnedAmount(xpAwarded);
      setShowXPEarned(true);
      setTimeout(() => setShowXPEarned(false), 3000);
    },
    onLevelUp: (newLevel, oldLevel) => {
      setNewLevel(newLevel);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 5000);
    }
  });

  // Handle play/pause with XP tracking
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      pauseWatching();
    } else {
      setIsPlaying(true);
      startWatching();
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    endWatchingSession();
  };

  // Update current time for completion tracking
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        if (newTime >= videoDuration) {
          handleVideoEnd();
          return videoDuration;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, videoDuration]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`wiz-video-player-xp relative ${className}`}>
      {/* Main Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {/* Video Placeholder */}
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-300">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </div>
            <p className="text-lg font-medium">{videoTitle}</p>
            <p className="text-sm opacity-75">Video ID: {videoId}</p>
          </div>
        </div>

        {/* XP Earnings Overlay */}
        <AnimatePresence>
          {showXPEarned && (
            <motion.div
              className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
              initial={{ scale: 0, x: 50 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              +{xpEarnedAmount} XP Earned! 🎉
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Overlay */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-xl text-center shadow-xl">
                <div className="text-6xl mb-2">🎉</div>
                <div className="text-2xl font-bold">LEVEL UP!</div>
                <div className="text-xl">Welcome to Level {newLevel}</div>
                <div className="text-sm opacity-90 mt-2">You're becoming a true WIZ!</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center space-x-4 mb-2">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Progress Bar */}
            <div className="flex-1 bg-gray-600 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${(currentTime / videoDuration) * 100}%` }}
              />
            </div>

            {/* Time Display */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </span>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:text-gray-300"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-purple-500"
              />
            </div>

            {/* Share Button */}
            <ShareButton
              videoId={videoId}
              videoTitle={videoTitle}
              size="sm"
              variant="ghost"
              className="text-white"
            />
          </div>
        </div>

        {/* XP Status Indicator */}
        {canEarnXP && isWatching && (
          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Earning XP: +{potentialXP} ({totalPotentialXP} total)</span>
            </div>
            <div className="text-xs opacity-75 mt-1">
              Watch time: {formatTime(sessionWatchTime)} | {Math.round(completionRate * 100)}% complete
            </div>
          </div>
        )}

        {/* Daily XP Cap Warning */}
        {!canEarnMoreXP && (
          <div className="absolute top-4 left-4 bg-orange-500/80 text-white px-3 py-2 rounded-lg text-sm">
            <div>Daily XP Cap Reached!</div>
            <div className="text-xs opacity-90">Come back tomorrow for more XP</div>
          </div>
        )}
      </div>

      {/* XP Progress Section */}
      <div className="mt-6 space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Your Progress</h3>
          
          {/* Level Progress Bar */}
          <WizXPProgressBar className="mb-4" />

          {/* Daily Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{dailyXPRemaining}</div>
              <div className="text-gray-300">Daily XP Remaining</div>
            </div>
            
            <div className="bg-gray-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(completionRate * 100)}%</div>
              <div className="text-gray-300">Video Completion</div>
            </div>
            
            <div className="bg-gray-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{formatTime(totalWatchTime)}</div>
              <div className="text-gray-300">Total Watch Time</div>
            </div>
          </div>
        </div>

        {/* Badge System */}
        <div className="bg-gray-800 rounded-lg p-4">
          <BadgeSystem />
        </div>
      </div>
    </div>
  );
};

export default WizVideoPlayerWithXPSystem;