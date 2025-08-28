import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useXp } from '@/context/XpContext';
import { useAuth } from '@/hooks/useAuth';
import { XPSystem } from '@/lib/xp-system';
import { YouTubeXPService } from '@/lib/youtube-xp-service';

interface WizVideoPlayerWithEnhancedXPProps {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  creatorId?: string;
  isBoosted?: boolean;
  onVideoEnd?: () => void;
  autoPlay?: boolean;
}

export const WizVideoPlayerWithEnhancedXP: React.FC<WizVideoPlayerWithEnhancedXPProps> = ({
  videoId,
  title,
  thumbnail,
  duration,
  creatorId,
  isBoosted = false,
  onVideoEnd,
  autoPlay = false,
}) => {
  const { user } = useAuth();
  const { awardWatchXP, canEarnMoreXP, dailyProgress } = useXp();

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // XP tracking state
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionStartTime] = useState(new Date());
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [lastPingTime, setLastPingTime] = useState(Date.now());
  const [xpEarned, setXpEarned] = useState(0);
  const [tabFocused, setTabFocused] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const xpPingIntervalRef = useRef<NodeJS.Timeout>();

  // XP heartbeat system - Enhanced with deduplication check
  const sendXPHeartbeat = useCallback(async () => {
    if (!user || !tabFocused || !isPlaying || !canEarnMoreXP) return;

    const now = Date.now();
    const timeSinceLastPing = (now - lastPingTime) / 1000;
    const completionRate = duration > 0 ? currentTime / duration : 0;

    // Check for duplicate XP from YouTube API
    const isDuplicate = await XPSystem.checkForDuplicateXP(
      user.uid,
      videoId,
      new Date(),
      'embed'
    );

    if (isDuplicate) {
      console.log(`⚠️ Duplicate XP detected for ${videoId}, skipping heartbeat`);
      return;
    }

    if (timeSinceLastPing >= 10) { // Send heartbeat every 10 seconds
      try {
        const result = await awardWatchXP(videoId, timeSinceLastPing, completionRate > 0.9, sessionId);
        
        if (result?.xpAwarded) {
          setXpEarned(prev => prev + result.xpAwarded);
          setTotalWatchTime(prev => prev + timeSinceLastPing);
        }
        
        setLastPingTime(now);
      } catch (error) {
        console.error('Error sending XP heartbeat:', error);
      }
    }
  }, [user, tabFocused, isPlaying, canEarnMoreXP, currentTime, duration, videoId, lastPingTime, awardWatchXP, sessionId]);

  // Tab focus tracking
  useEffect(() => {
    const handleFocus = () => {
      setTabFocused(true);
      setLastPingTime(Date.now()); // Reset ping timer when refocusing
    };
    
    const handleBlur = () => setTabFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // XP heartbeat interval
  useEffect(() => {
    if (isPlaying && tabFocused && user && canEarnMoreXP) {
      xpPingIntervalRef.current = setInterval(sendXPHeartbeat, 10000); // 10 second intervals
    } else {
      if (xpPingIntervalRef.current) {
        clearInterval(xpPingIntervalRef.current);
        xpPingIntervalRef.current = undefined;
      }
    }

    return () => {
      if (xpPingIntervalRef.current) {
        clearInterval(xpPingIntervalRef.current);
      }
    };
  }, [isPlaying, tabFocused, user, canEarnMoreXP, sendXPHeartbeat]);

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setLastPingTime(Date.now());
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      sendXPHeartbeat(); // Send final heartbeat on pause
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    
    // Award completion bonus
    const completionRate = duration > 0 ? currentTime / duration : 1;
    if (completionRate > 0.9) {
      sendXPHeartbeat(); // Final XP award with completion bonus
    }
    
    onVideoEnd?.();
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    if (autoPlay) {
      handlePlay();
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Controls visibility
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Mouse movement handler
  const handleMouseMove = () => {
    if (isPlaying) {
      showControlsTemporarily();
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const completionRate = duration > 0 ? currentTime / duration : 0;

  // XP status
  const xpRate = 0.1; // 1 XP per 10 seconds
  const potentialXP = Math.floor(totalWatchTime * xpRate);
  const isNearCompletion = completionRate > 0.8;

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'w-screen h-screen' : 'w-full'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={thumbnail}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedData={handleLoadedData}
        muted={isMuted}
        volume={volume}
        playsInline
      >
        <source src={`/api/videos/${videoId}/stream`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* XP Status Overlay */}
      {user && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <div className="text-green-400 font-bold">+{xpEarned} XP</div>
            {isBoosted && (
              <span className="bg-yellow-500 text-black px-1 py-0.5 rounded text-xs font-bold">
                BOOSTED 1.5x
              </span>
            )}
          </div>
          <div className="text-xs opacity-75">
            {!canEarnMoreXP && 'Daily cap reached'}
            {canEarnMoreXP && `${Math.floor(dailyProgress)}% daily progress`}
          </div>
          {isNearCompletion && (
            <div className="text-yellow-400 text-xs mt-1">
              🎯 Completion bonus available!
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Progress
            value={progressPercent}
            className="h-2 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newTime = (clickX / rect.width) * duration;
              handleSeek(newTime);
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={isPlaying ? handlePause : handlePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20"
            />

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Restart Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSeek(0)}
              className="text-white hover:bg-white/20"
              title="Restart video"
            >
              <RotateCcw size={20} />
            </Button>

            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className={`absolute top-4 left-4 text-white transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        {creatorId && (
          <div className="text-sm opacity-75">Creator content</div>
        )}
        <div className="text-sm opacity-75">
          Completion: {Math.round(completionRate * 100)}%
        </div>
      </div>
    </div>
  );
};