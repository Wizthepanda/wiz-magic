/**
 * FullscreenPlayer - Single global video player with Up Next rail
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { usePlayer } from '@/contexts/PlayerContext';
import { UpNextRail } from './UpNextRail';
import { cn } from '@/lib/utils';

export const FullscreenPlayer: React.FC = () => {
  const { currentVideo, queue, playNext, close } = usePlayer();
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
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{currentVideo.title}</h2>
                <div className="flex items-center gap-3">
                  <img
                    src={currentVideo.creator.avatar}
                    alt={currentVideo.creator.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">{currentVideo.creator.name}</p>
                    <p className="text-gray-300 text-sm">{currentVideo.creator.subscribers}</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={close}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6 text-white" />
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
