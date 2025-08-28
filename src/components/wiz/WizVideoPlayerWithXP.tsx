import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { useWatchTracker } from '@/hooks/useWatchTracker';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WizVideoPlayerWithXPProps {
  videoUrl: string;
  videoId: string;
  title?: string;
  description?: string;
  className?: string;
}

export const WizVideoPlayerWithXP: React.FC<WizVideoPlayerWithXPProps> = ({
  videoUrl,
  videoId,
  title,
  description,
  className = ''
}) => {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number>(0);
  const [showXpNotification, setShowXpNotification] = useState(false);

  const playerRef = useRef<ReactPlayer>(null);
  
  const watchTracker = useWatchTracker(videoId, {
    minWatchTime: 5, // 5 seconds minimum
    updateInterval: 1000, // Update every second
    completionThreshold: 0.9 // 90% completion for bonus
  });

  // Handle player ready
  const handleReady = () => {
    setPlayerReady(true);
    if (playerRef.current && duration > 0 && user) {
      console.log('🎬 Player ready, starting watch tracking for video:', videoId);
      watchTracker.startTracking(playerRef.current, duration);
    }
  };

  // Handle duration load
  const handleDuration = (duration: number) => {
    setDuration(duration);
    console.log('🎬 Video duration loaded:', duration);
    
    // Start tracking if player is ready and user is logged in
    if (playerReady && playerRef.current && user) {
      watchTracker.startTracking(playerRef.current, duration);
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  // Handle progress
  const handleProgress = (state: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => {
    setPlayed(state.played);
    watchTracker.onProgress(state);
  };

  // Handle XP notifications
  useEffect(() => {
    const handleXpUpdate = (event: CustomEvent) => {
      const { xpGained } = event.detail;
      if (xpGained > 0) {
        setXpAwarded(prev => prev + xpGained);
        setShowXpNotification(true);
        setTimeout(() => setShowXpNotification(false), 3000);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('xpUpdated', handleXpUpdate as EventListener);
      return () => window.removeEventListener('xpUpdated', handleXpUpdate as EventListener);
    }
  }, []);

  // Cleanup tracking on unmount
  useEffect(() => {
    return () => {
      if (watchTracker.isTracking) {
        watchTracker.stopTracking();
      }
    };
  }, [videoId]);

  if (!user) {
    return (
      <div className={`relative ${className}`}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="100%"
          playing={playing}
          muted={muted}
          volume={volume}
          onReady={handleReady}
          onDuration={handleDuration}
          onProgress={handleProgress}
          onPlay={watchTracker.onPlay}
          onPause={watchTracker.onPause}
          onEnded={watchTracker.onEnded}
          controls={false}
        />
        
        {/* Demo mode overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center p-6 bg-black/50 rounded-lg backdrop-blur-sm">
            <p className="text-white mb-2">🎬 Sign in to earn XP while watching!</p>
            <Badge variant="outline" className="text-white border-white/30">
              Demo Mode - No XP Tracking
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* React Player */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        onReady={handleReady}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onPlay={watchTracker.onPlay}
        onPause={watchTracker.onPause}
        onEnded={watchTracker.onEnded}
        controls={false}
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center space-x-4">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            className="text-white hover:bg-white/20"
          >
            {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-wiz-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${played * 100}%` }}
              />
            </div>
          </div>

          {/* Volume */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMuted(!muted)}
            className="text-white hover:bg-white/20"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (playerRef.current) {
                // @ts-ignore
                playerRef.current.getInternalPlayer()?.requestFullscreen?.();
              }
            }}
            className="text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Watch Time Tracker Display */}
      {watchTracker.isTracking && (
        <div className="absolute top-4 left-4">
          <Badge 
            variant="secondary" 
            className="bg-black/50 text-white border-wiz-primary/50 backdrop-blur-sm"
          >
            <Zap className="w-3 h-3 mr-1" />
            {Math.floor(watchTracker.watchTime)}s watched
          </Badge>
        </div>
      )}

      {/* Completion Progress */}
      {watchTracker.completionRate > 0 && (
        <div className="absolute top-4 right-4">
          <Badge 
            variant={watchTracker.completionRate >= 0.9 ? "default" : "secondary"}
            className="bg-black/50 text-white border-wiz-primary/50 backdrop-blur-sm"
          >
            {Math.floor(watchTracker.completionRate * 100)}% complete
            {watchTracker.completionRate >= 0.9 && " 🎉"}
          </Badge>
        </div>
      )}

      {/* XP Notification */}
      <AnimatePresence>
        {showXpNotification && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-wiz-primary to-wiz-secondary px-6 py-3 rounded-full shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Zap className="w-5 h-5" />
                <span>+{xpAwarded} XP</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Info Overlay */}
      {(title || description) && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
          {title && <h3 className="text-white font-bold text-lg mb-1">{title}</h3>}
          {description && <p className="text-white/80 text-sm">{description}</p>}
        </div>
      )}
    </div>
  );
};