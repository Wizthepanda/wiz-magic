import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isYouTubeAPIEnabled } from '@/lib/feature-flags';
import { LocalXPService } from '@/lib/local-xp-service';

interface LocalVideoPlayerProps {
  url: string;
  onXpEarned?: (xp: number, reason: string) => void;
  className?: string;
}

export const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = ({
  url,
  onXpEarned,
  className = "w-full h-full"
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const { user, addXP } = useAuth();
  const [watchTime, setWatchTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastXpTime, setLastXpTime] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [hasCompletionBonus, setHasCompletionBonus] = useState(false);

  // Award XP for watching
  const awardXP = useCallback(async (amount: number, reason: string) => {
    if (!user) return;

    try {
      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalXP: increment(amount),
        lastActivity: new Date(),
        'stats.videosWatched': increment(0), // Don't increment for time-based XP
        'stats.totalWatchTime': increment(30) // Add 30 seconds for each milestone
      });

      // Update local state
      addXP(amount);
      
      // Notify parent component
      onXpEarned?.(amount, reason);
      
      console.log(`🎯 Awarded ${amount} XP for ${reason}`);
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [user, addXP, onXpEarned]);

  // Track watch time and award XP
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWatching && playerRef.current) {
      interval = setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        const currentDuration = playerRef.current?.getDuration() || 0;
        
        setWatchTime(Math.floor(currentTime));
        
        // Award +1 XP every 30 seconds
        if (Math.floor(currentTime) > 0 && Math.floor(currentTime) % 30 === 0 && Math.floor(currentTime) !== lastXpTime) {
          setLastXpTime(Math.floor(currentTime));
          awardXP(1, 'watching (30s milestone)');
        }
        
        // Check for completion bonus (90% watched)
        if (currentDuration > 0 && !hasCompletionBonus) {
          const completionPercentage = (currentTime / currentDuration) * 100;
          if (completionPercentage >= 90) {
            setHasCompletionBonus(true);
            const bonusXP = Math.floor(Math.floor(currentTime) / 30 * 0.1); // 10% bonus
            awardXP(bonusXP, 'completion bonus (90%+ watched)');
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isWatching, lastXpTime, hasCompletionBonus, awardXP]);

  const handlePlay = () => {
    setIsWatching(true);
    console.log('▶️ Video started - tracking watch time for XP');
  };

  const handlePause = () => {
    setIsWatching(false);
    console.log('⏸️ Video paused - watch time tracking paused');
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleEnded = async () => {
    setIsWatching(false);
    
    if (!hasCompletionBonus && user) {
      // Extract video ID from URL for proper tracking
      const videoId = url.includes('watch?v=') ? url.split('watch?v=')[1].split('&')[0] : 'unknown';
      
      // Use LocalXPService for comprehensive completion tracking
      const completionXP = await LocalXPService.recordLocalVideoView(videoId, watchTime, duration);
      const engagementXP = await LocalXPService.trackLocalVideoEngagement(videoId, 'completion', watchTime);
      
      const totalXP = completionXP + engagementXP;
      
      // Update local state
      addXP(totalXP);
      onXpEarned?.(totalXP, 'video completion');
      
      setHasCompletionBonus(true);
      console.log(`🏁 Video completed - ${totalXP} XP earned (${completionXP} view + ${engagementXP} completion)`);
    }
  };

  // Show feature flag status
  useEffect(() => {
    if (!isYouTubeAPIEnabled()) {
      console.log('🎬 Using local video player (YouTube API disabled)');
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls={true}
        width="100%"
        height="100%"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onDuration={handleDuration}
        config={{
          youtube: {
            playerVars: {
              origin: window.location.origin,
              modestbranding: 1,
              rel: 0
            }
          }
        }}
      />
      
      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
          <div>Watch: {watchTime}s</div>
          <div>Duration: {Math.floor(duration)}s</div>
          <div>Status: {isWatching ? 'Watching' : 'Paused'}</div>
          <div>API: {isYouTubeAPIEnabled() ? 'Enabled' : 'Local Mode'}</div>
        </div>
      )}
    </div>
  );
};