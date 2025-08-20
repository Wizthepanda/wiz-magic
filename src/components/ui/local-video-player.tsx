import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isYouTubeAPIEnabled } from '@/lib/feature-flags';
import { LocalXPService } from '@/lib/local-xp-service';
import { VideoCompletionService } from '@/lib/video-completion-service';

interface LocalVideoPlayerProps {
  url: string;
  onXpEarned?: (xp: number, reason: string) => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

export const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = ({
  url,
  onXpEarned,
  onProgress,
  className = "w-full h-full"
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const { user } = useAuth();
  const { addXp } = useXp();
  const [watchTime, setWatchTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastXpTime, setLastXpTime] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [hasCompletionBonus, setHasCompletionBonus] = useState(false);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [videoId, setVideoId] = useState<string>('');

  // Check if video is already completed
  useEffect(() => {
    const checkVideoCompletion = async () => {
      if (!user || !url) return;
      
      const extractedVideoId = url.includes('watch?v=') ? url.split('watch?v=')[1].split('&')[0] : 'unknown';
      setVideoId(extractedVideoId);
      
      if (extractedVideoId !== 'unknown') {
        const completed = await VideoCompletionService.isVideoCompleted(extractedVideoId);
        setIsVideoCompleted(completed);
        if (completed) {
          setHasCompletionBonus(true);
          console.log(`📹 Video ${extractedVideoId} already completed - no XP will be awarded`);
        }
      }
    };
    
    checkVideoCompletion();
  }, [user, url]);

  // Award XP for watching (only if video not completed)
  const awardXP = useCallback(async (amount: number, reason: string) => {
    if (!user || isVideoCompleted) return;

    try {
      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        totalXP: increment(amount),
        lastActivity: new Date(),
        'stats.videosWatched': increment(0), // Don't increment for time-based XP
        'stats.totalWatchTime': increment(30) // Add 30 seconds for each milestone
      });

      // Update XP context (this will update the progress bar immediately)
      addXp(amount);
      
      // Notify parent component
      onXpEarned?.(amount, reason);
      
      console.log(`🎯 Awarded ${amount} XP for ${reason}`);
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [user, addXp, onXpEarned, isVideoCompleted]);

  // Track watch time and award XP
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isWatching && playerRef.current) {
      interval = setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        const currentDuration = playerRef.current?.getDuration() || 0;
        
        setWatchTime(Math.floor(currentTime));
        
        // Update progress for parent component
        if (currentDuration > 0) {
          const progressPercentage = (currentTime / currentDuration) * 100;
          onProgress?.(progressPercentage);
        }
        
        // Award +1 XP every 10 seconds for short videos (under 60s) or every 30s for longer videos
        const interval = currentDuration <= 60 ? 10 : 30;
        if (Math.floor(currentTime) > 0 && Math.floor(currentTime) % interval === 0 && Math.floor(currentTime) !== lastXpTime) {
          setLastXpTime(Math.floor(currentTime));
          awardXP(1, `watching (${interval}s milestone)`);
        }
        
        // Check for completion bonus (90% watched)
        if (currentDuration > 0 && !hasCompletionBonus) {
          const completionPercentage = (currentTime / currentDuration) * 100;
          if (completionPercentage >= 90) {
            setHasCompletionBonus(true);
            // Give meaningful completion bonus based on video length
            let bonusXP;
            if (currentDuration <= 60) {
              bonusXP = Math.max(5, Math.floor(currentDuration / 10)); // At least 5 XP, or 1 XP per 10 seconds
            } else {
              bonusXP = Math.max(10, Math.floor(currentTime / 30 * 0.5)); // At least 10 XP, or 50% of time-based XP
            }
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
  }, [isWatching, lastXpTime, hasCompletionBonus, awardXP, onProgress]);

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
    
    // Ensure progress shows 100% completion
    onProgress?.(100);
    
    if (!hasCompletionBonus && user && !isVideoCompleted && videoId !== 'unknown') {
      try {
        // Use LocalXPService for comprehensive completion tracking
        const completionXP = await LocalXPService.recordLocalVideoView(videoId, watchTime, duration);
        const engagementXP = await LocalXPService.trackLocalVideoEngagement(videoId, 'completion', watchTime);
        const totalXP = completionXP + engagementXP;
        
        // Mark video as completed to prevent future XP farming
        const marked = await VideoCompletionService.markVideoCompleted(videoId, totalXP, watchTime);
        
        if (marked) {
          // Update XP context (this will update the progress bar immediately)
          addXp(totalXP);
          onXpEarned?.(totalXP, 'video completion');
          
          setHasCompletionBonus(true);
          setIsVideoCompleted(true);
          console.log(`🏁 Video completed - ${totalXP} XP earned and marked as completed (${completionXP} view + ${engagementXP} completion)`);
        } else {
          console.log(`⚠️ Video ${videoId} was already completed - no XP awarded`);
        }
      } catch (error) {
        console.error('Error handling video completion:', error);
      }
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
      
      {/* Completed Video Overlay */}
      {isVideoCompleted && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
            ✅ Video Completed - No XP Available
          </div>
        </div>
      )}
      
      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
          <div>Watch: {watchTime}s</div>
          <div>Duration: {Math.floor(duration)}s</div>
          <div>Status: {isWatching ? 'Watching' : 'Paused'}</div>
          <div>Completed: {isVideoCompleted ? 'Yes' : 'No'}</div>
          <div>API: {isYouTubeAPIEnabled() ? 'Enabled' : 'Local Mode'}</div>
        </div>
      )}
    </div>
  );
};