import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles } from 'lucide-react';
import { awardVideoCompletion } from '@/lib/xp/awardXpClient';
import { createPlayerStateChangeHandler, loadYouTubeAPI } from '@/lib/youtube-completion-helpers';

// YouTube Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerWithXPProps {
  videoId: string;
  videoTitle?: string;
  className?: string;
  autoplay?: boolean;
  showXPIndicator?: boolean;
}

const PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
};

export const YouTubePlayerWithXP: React.FC<YouTubePlayerWithXPProps> = ({
  videoId,
  videoTitle = 'WIZ Video',
  className = '',
  autoplay = false,
  showXPIndicator = true
}) => {
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Load YouTube API using our helper
  useEffect(() => {
    loadYouTubeAPI()
      .then(() => {
        initializePlayer();
      })
      .catch((error) => {
        console.error('❌ Failed to load YouTube API:', error);
      });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, initializePlayer]);

  // Listen for XP events from our new system
  useEffect(() => {
    const handleXpUpdated = (event) => {
      const { earnedXp, levelUp, newLevel } = event.detail;
      console.log('⚡ YouTube player received XP event:', event.detail);
      
      setXpEarned(earnedXp);
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 2000);
      
      if (levelUp) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    };

    window.addEventListener('xpUpdated', handleXpUpdated);
    
    return () => {
      window.removeEventListener('xpUpdated', handleXpUpdated);
    };
  }, []);

  // Initialize YouTube player with correct origin and new XP system
  const initializePlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player || !playerRef.current) return;

    // Create enhanced state change handler with XP integration
    const stateChangeHandler = createPlayerStateChangeHandler({
      enableXpAwarding: true,
      minWatchTimeForXp: 30, // 30 seconds minimum
      onVideoEnd: (event, data) => {
        console.log(`🏁 Video ${data.videoId} completed! Watch time: ${data.totalWatchTime}s`);
        setTotalWatchTime(Math.floor(data.totalWatchTime));
      }
    });

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        origin: window.location.origin, // ✅ fixes cross-domain as specified
        enablejsapi: 1,
        autoplay: autoplay ? 1 : 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        fs: 1,
        cc_load_policy: 0,
        playsinline: 1
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: stateChangeHandler,
        onError: handleError
      }
    });

    setPlayer(newPlayer);
  }, [videoId, autoplay]);

  // Simplified handlers since XP is now handled by our helper functions
  const handlePlayerReady = (event: any) => {
    setPlayerReady(true);
    setDuration(event.target.getDuration());
    console.log(`🎬 YouTube player ready for video: ${videoId}`);
  };

  const handleStateChange = (event: any) => {
    const state = event.data;
    console.log(`🎬 Player state changed:`, state);

    switch (state) {
      case PLAYER_STATES.PLAYING:
        setIsPlaying(true);
        break;

      case PLAYER_STATES.PAUSED:
      case PLAYER_STATES.BUFFERING:
        setIsPlaying(false);
        break;

      case PLAYER_STATES.ENDED:
        setIsPlaying(false);
        // XP awarding is now handled by createPlayerStateChangeHandler
        break;
    }
  };

  const handleError = (event: any) => {
    console.error('YouTube player error:', event.data);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completionRate = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`youtube-player-xp relative ${className}`}>
      {/* YouTube Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div
          ref={playerRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* XP Indicator Overlay */}
        {showXPIndicator && isPlaying && (
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              className="bg-green-500/90 text-white px-3 py-2 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Earning XP</span>
              </div>
              <div className="text-xs opacity-90">
                {Math.floor(totalWatchTime)}s watched • {Math.round(completionRate)}% complete
              </div>
            </motion.div>
          </div>
        )}


        {/* XP Earned Animation */}
        <AnimatePresence>
          {showXPAnimation && (
            <motion.div
              className="absolute top-4 right-4 z-10"
              initial={{ scale: 0, y: 0 }}
              animate={{ 
                scale: [0, 1.2, 1], 
                y: [-10, -20, -30],
                opacity: [1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2,
                times: [0, 0.1, 1],
                ease: "easeOut"
              }}
            >
              <div className="bg-green-500 text-white text-sm px-3 py-2 rounded-lg font-bold shadow-lg">
                +{xpEarned > 0 ? Math.floor(xpEarned) : 1} XP
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Up Celebration */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-8 py-6 rounded-xl text-center shadow-xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotateY: [0, 360, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: 1
                }}
              >
                <div className="text-6xl mb-2">🎉</div>
                <div className="text-2xl font-bold">LEVEL UP!</div>
                <div className="text-xl">Welcome to Level Up!</div>
                <div className="text-sm opacity-90 mt-2">Keep watching to earn more XP!</div>
              </motion.div>

              {/* Sparkle effects */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${20 + (i * 5)}%`,
                    top: `${10 + (i % 4) * 20}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 40 - 20, 0],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.1,
                    repeat: 1,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-lg font-medium">{videoTitle}</div>
              <div className="text-sm opacity-75">Loading YouTube player...</div>
            </div>
          </div>
        )}
      </div>

      {/* Player Stats */}
      {showXPIndicator && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-center">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xl font-bold text-green-400">
              {Math.floor(totalWatchTime)}s
            </div>
            <div className="text-gray-400">Watch Time</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-400">
              {Math.round(completionRate)}%
            </div>
            <div className="text-gray-400">Complete</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xl font-bold text-purple-400">
              {Math.floor(xpEarned)}
            </div>
            <div className="text-gray-400">XP Earned</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayerWithXP;