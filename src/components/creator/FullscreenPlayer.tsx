/**
 * FullscreenPlayer - Single global video player with Up Next rail
 * Includes "Back to Profile" button for seamless creator navigation
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, ArrowLeft } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { UpNextRail } from './UpNextRail';
import { cn } from '@/lib/utils';

export const FullscreenPlayer: React.FC = () => {
  const { currentVideo, queue, playNext, close } = usePlayer();
  const navigate = useNavigate();
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showUpNext, setShowUpNext] = useState(true);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Lock body scroll when player is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.playVideo();
    setIsPlaying(true);
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (event.data === 0) {
      // Video ended, play next
      playNext();
    }
    setIsPlaying(event.data === 1);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      fs: 1,
    },
  };

  if (!currentVideo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[150]"
      onMouseMove={handleMouseMove}
    >
      {/* Quick Close Button - Top Left (Always Visible) */}
      <button
        onClick={close}
        className="absolute top-4 left-4 z-[3000] p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Video Player */}
      <div className={cn('absolute inset-0', showUpNext ? 'right-96' : 'right-0')}>
        <YouTube
          videoId={currentVideo.videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between pointer-events-auto">
              {/* Back to Profile Button */}
              <button
                onClick={() => {
                  close();
                  navigate(`/creator/id/${currentVideo.creator.id}`);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white transition-all ml-14"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Profile</span>
              </button>

              <div className="flex-1 mx-6">
                <h2 className="text-xl font-bold text-white mb-2 line-clamp-1">{currentVideo.title}</h2>
                <div className="flex items-center gap-3">
                  <img
                    src={currentVideo.creator.avatar}
                    alt={currentVideo.creator.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{currentVideo.creator.name}</p>
                    {currentVideo.creator.subscribers && (
                      <p className="text-gray-300 text-xs">{currentVideo.creator.subscribers}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={close}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all flex-shrink-0"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center gap-4 pointer-events-auto">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                )}
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Skip to Next */}
              {queue.length > 0 && (
                <button
                  onClick={playNext}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <SkipForward className="w-6 h-6 text-white" />
                </button>
              )}

              <div className="flex-1" />

              {/* Toggle Up Next */}
              <button
                onClick={() => setShowUpNext(!showUpNext)}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold transition-all"
              >
                {showUpNext ? 'Hide' : 'Show'} Up Next
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Up Next Rail */}
      <UpNextRail isVisible={showUpNext} />
    </motion.div>
  );
};
