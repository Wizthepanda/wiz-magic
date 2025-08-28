import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createYouTubeCompletionHandler, loadYouTubeAPI, isVideoCompleted } from '@/lib/youtube-video-completion';

// YouTube Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface WizYouTubePlayerProps {
  videoId: string;
  videoTitle?: string;
  className?: string;
  onXPAwarded?: (xp: number, reason: string) => void;
}

const PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
};

export const WizYouTubePlayer: React.FC<WizYouTubePlayerProps> = ({
  videoId,
  videoTitle = 'WIZ Video',
  className = '',
  onXPAwarded
}) => {
  const { user } = useAuth();
  const playerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [lastXPAward, setLastXPAward] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpNotificationText, setXpNotificationText] = useState('');

  const watchTimeRef = useRef<NodeJS.Timeout | null>(null);
  const watchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check completion status from Firestore on mount
  useEffect(() => {
    if (user && videoId) {
      isVideoCompleted(videoId, user.uid).then((completed) => {
        setHasCompleted(completed);
        if (completed) {
          console.log(`📋 Video ${videoId} already completed according to Firestore`);
        }
      });
    }
  }, [videoId, user]);

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
      if (watchTimeRef.current) {
        clearInterval(watchTimeRef.current);
      }
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
      }
    };
  }, [videoId, initializePlayer]);

  // Listen for XP events from our new system
  useEffect(() => {
    const handleXpUpdated = (event: any) => {
      const { videoId: eventVideoId, xpAwarded, newXpBalance } = event.detail;
      console.log('⚡ YouTube player received XP event:', event.detail);
      
      // Only update if this event is for our video
      if (eventVideoId === videoId) {
        setHasCompleted(true);
        showXPAnimation(`+${xpAwarded} XP earned!`);
      }
    };

    window.addEventListener('xpUpdated', handleXpUpdated);
    
    return () => {
      window.removeEventListener('xpUpdated', handleXpUpdated);
    };
  }, [videoId]);

  // Initialize YouTube player with bulletproof XP system
  const initializePlayer = useCallback(() => {
    if (!window.YT || !window.YT.Player || !playerRef.current) return;

    // Create bulletproof state change handler
    const stateChangeHandler = createYouTubeCompletionHandler();

    const newPlayer = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        enablejsapi: 1,
        origin: window.location.origin, // ✅ fixes cross-domain as specified
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3,
        fs: 1,
        cc_load_policy: 0,
        playsinline: 1
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': stateChangeHandler,
        'onError': (event: any) => {
          console.error('❌ YouTube player error:', event.data);
        }
      }
    });

    setPlayer(newPlayer);
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    console.log(`🎬 YouTube player ready for video: ${videoId}`);
  };

  // Simplified state tracking for UI only
  const onPlayerStateChange = (event: any) => {
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
        // XP awarding is handled by createYouTubeCompletionHandler automatically
        console.log(`🎬 Video ${videoId} reached 100%`);
        break;
    }
  };

  // Show XP notification animation
  const showXPAnimation = (text: string) => {
    setXpNotificationText(text);
    setShowXPNotification(true);
    setTimeout(() => setShowXPNotification(false), 3000);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`wiz-youtube-player relative ${className}`}>
      {/* YouTube Player Container */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div
          ref={playerRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* XP Notification */}
        <AnimatePresence>
          {showXPNotification && (
            <motion.div
              className="absolute top-4 right-4 z-20 bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
              initial={{ scale: 0, x: 50 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {xpNotificationText}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Watch Time Indicator */}
        {isPlaying && user && (
          <div className="absolute top-4 left-4 z-10 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Earning XP: {formatTime(watchTime)} watched</span>
            </div>
          </div>
        )}

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

      {/* Video Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-center">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xl font-bold text-green-400">
            {formatTime(watchTime)}
          </div>
          <div className="text-gray-400">Watch Time</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xl font-bold text-blue-400">
            {Math.floor(watchTime / 10)}
          </div>
          <div className="text-gray-400">XP Earned</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-xl font-bold text-purple-400">
            {hasCompleted ? '✅' : '⏳'}
          </div>
          <div className="text-gray-400">Completed</div>
        </div>
      </div>
    </div>
  );
};