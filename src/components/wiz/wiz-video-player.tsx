import { useState, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FirestoreService } from '@/lib/firestore';
import { YouTubeService } from '@/lib/youtube';
import { motion } from 'framer-motion';

interface WizVideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
  xpReward?: number;
}

export const WizVideoPlayer = ({ videoId, title, description, xpReward = 25 }: WizVideoPlayerProps) => {
  const { user, refreshUserData, addXP } = useAuth();
  const playerRef = useRef<ReactPlayer>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commented, setCommented] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleProgress = ({ playedSeconds, played }: { playedSeconds: number, played: number }) => {
    // Update watch time immediately for instant UI feedback
    setWatchTime(playedSeconds);
    // Force component re-render for instant progress updates
    setForceUpdate(prev => prev + 1);
    
    // Force React to re-render progress components immediately
    const duration = getDuration();
    if (duration > 0) {
      const progress = Math.min(Math.round((playedSeconds / duration) * 1000) / 10, 100);
      console.log('📊 Progress:', { playedSeconds, duration, progress: progress.toFixed(1) + '%' });
      
      // Show XP preview when video is nearly complete (95% or more) - but don't award yet
      if (user && progress >= 95 && xpEarned === 0) {
        console.log('🎯 Video nearly complete:', progress.toFixed(1) + '% - XP will be awarded on completion');
        // Don't award XP here - wait for video completion
      }
    }
    
    // Award XP for watching milestones
    if (user && playedSeconds > 30 && xpEarned === 0) {
      awardXP(10, 'Started watching');
    }
  };

  const handleEnded = async () => {
    console.log('🎬 Video ended!', { videoId, watchTime, user: user?.uid });
    
    if (user && playerRef.current) {
      const duration = getDuration();
      // Force 100% completion when video ends
      setWatchTime(duration);
      const completionPercentage = 100;
      console.log('📊 Video stats:', { 
        duration, 
        watchTime: duration, 
        completion: '100%',
        willAwardXP: true
      });
      
      try {
        // Award fixed XP for video completion (25 XP for demo video)
        const xpGained = xpReward; // Use the prop value (25 XP)
        console.log('🎁 Awarding XP for video completion:', xpGained);
        
        // Show XP animation and update user state instantly FIRST
        setXpEarned(xpGained);
        setShowXpAnimation(true);
        setTimeout(() => setShowXpAnimation(false), 2000);
        
        console.log('⚡ Instantly updating UI with addXP:', xpGained);
        // Update user state instantly for immediate UI feedback
        addXP(xpGained);
        
        // Update XP in Firestore manually (without using YouTube service that also awards XP)
        await FirestoreService.updateUserXP(user.uid, xpGained, 'video_completion', {
          videoId,
          watchTime: duration,
          duration,
          completionPercentage: 100,
        });
        
        // Record engagement in Firestore
        await FirestoreService.recordVideoEngagement({
          videoId,
          userId: user.uid,
          watchTime: duration,
          liked,
          commented,
          completed: true,
          xpEarned: xpGained,
          timestamp: new Date(),
        });
        
        console.log('✅ Video completion recorded in Firestore');
        
        // Update the video card to show as watched with 100% progress
        // This will be handled by the parent component through state management
      } catch (error) {
        console.error('❌ Error in handleEnded:', error);
      }
    } else {
      console.log('⚠️ No user or player ref available');
    }
  };

  const handleLike = async () => {
    if (!user || liked) return;
    
    setLiked(true);
    await YouTubeService.trackVideoEngagement(videoId, 'like');
    awardXP(5, 'Liked video');
  };

  const handleComment = async () => {
    if (!user || commented) return;
    
    setCommented(true);
    await YouTubeService.trackVideoEngagement(videoId, 'comment');
    awardXP(15, 'Commented on video');
  };

  const awardXP = async (amount: number, reason: string) => {
    console.log('🎁 Awarding XP:', { amount, reason, userId: user?.uid });
    
    setXpEarned(prev => prev + amount);
    setShowXpAnimation(true);
    
    setTimeout(() => setShowXpAnimation(false), 2000);
    
    if (user) {
      try {
        // Update XP in Firestore
        await FirestoreService.updateUserXP(user.uid, amount, 'video_watch', {
          videoId,
          reason,
        });
        
        console.log('✅ XP updated in Firestore, refreshing user data...');
        
        // Wait a moment for Firestore to update, then refresh user data
        setTimeout(async () => {
          await refreshUserData();
        }, 500);
        
      } catch (error) {
        console.error('❌ Error awarding XP:', error);
      }
    }
  };

  // Calculate watch progress with improved accuracy
  const getDuration = () => {
    if (!playerRef.current) return 0;
    const duration = playerRef.current.getDuration();
    return duration && !isNaN(duration) ? duration : 0;
  };
  
  const watchProgress = (() => {
    const duration = getDuration();
    if (duration === 0) return 0;
    
    const progress = (watchTime / duration) * 100;
    // Force 100% when video ends or progress is very close to completion
    if (progress >= 99.5) return 100;
    return Math.min(Math.round(progress * 10) / 10, 100);
  })();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
      backdropFilter: 'blur(20px)'
    }}>
      <div className="relative w-full max-w-5xl max-h-[95vh] overflow-auto" style={{ zIndex: 10000 }}>
        {/* Cinematic Background */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse at center, rgba(192, 132, 252, 0.08) 0%, transparent 70%),
              linear-gradient(135deg, rgba(109, 40, 217, 0.05) 0%, rgba(147, 51, 234, 0.03) 100%)
            `,
            backdropFilter: 'blur(40px)',
          }}
        />

        {/* Ultra-Premium Glassmorphic Container */}
        <motion.div 
          className="relative overflow-hidden w-full"
          style={{
            background: `
              linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%),
              rgba(30, 41, 59, 0.9)
            `,
            backdropFilter: 'blur(40px)',
            border: '2px solid rgba(147, 51, 234, 0.3)',
            borderRadius: '24px',
            boxShadow: `
              0 32px 80px rgba(147, 51, 234, 0.4),
              0 16px 40px rgba(109, 40, 217, 0.3),
              inset 0 2px 0 rgba(255, 255, 255, 0.1),
              inset 0 -2px 0 rgba(147, 51, 234, 0.2)
            `,
            minHeight: 'fit-content',
            zIndex: 10001
          }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Clean Video Player - Fixed Container */}
        <div className="relative w-full">
          <div className="aspect-video rounded-t-[20px] overflow-hidden w-full">
            <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${videoId}`}
              width="100%"
              height="100%"
              controls
              onProgress={handleProgress}
              onEnded={handleEnded}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    iv_load_policy: 3,
                  },
                },
              }}
            />
          </div>

          {/* XP Animation Overlay - Positioned Within Container */}
          {showXpAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute top-4 right-4 z-20"
            >
              <div 
                className="px-4 py-2 rounded-full flex items-center space-x-2 text-white font-bold shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #C084FC 0%, #6D28D9 100%)',
                  boxShadow: '0 8px 32px rgba(192, 132, 252, 0.4)'
                }}
              >
                <Zap className="w-4 h-4" />
                <span>+{xpEarned} XP</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content Section - Mobile Responsive */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Watch Progress Bar - Below Video */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span 
                className="text-sm font-medium"
                style={{ color: '#8B5CF6' }}
              >
                Watch Progress
              </span>
              <span 
                className="text-sm font-bold"
                style={{ 
                  background: 'linear-gradient(135deg, #C084FC 0%, #6D28D9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {Math.round(watchProgress)}% Watched
              </span>
            </div>
            
            {/* Pill-shaped Progress Bar with Instant Updates */}
            <div 
              className="relative h-3 md:h-2 rounded-full overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}
            >
              <motion.div 
                key={`progress-${forceUpdate}-${watchTime}-${watchProgress}`}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #C084FC 0%, #6D28D9 100%)',
                  boxShadow: '0 0 10px rgba(192, 132, 252, 0.5)',
                  width: `${watchProgress}%`
                }}
                initial={false}
                animate={{ width: `${watchProgress}%` }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
            </div>
          </div>

          {/* Title & Creator Info Section */}
          <div className="space-y-3">
            <h3 
              className="text-xl font-bold leading-tight"
              style={{
                background: 'linear-gradient(135deg, #C084FC 0%, #6D28D9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {title}
            </h3>
            
            <div className="flex items-center space-x-3">
              {/* Creator Avatar Placeholder */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                }}
              >
                W
              </div>
              
              <span 
                className="text-sm font-medium"
                style={{ 
                  color: '#6B7280',
                  opacity: 0.7,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                WIZ Magic
              </span>
            </div>

            {description && (
              <p 
                className="text-sm leading-relaxed"
                style={{ 
                  color: '#9CA3AF',
                  opacity: 0.8,
                  lineHeight: '1.6'
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* XP Reward Pill - Responsive Layout */}
          <div className="flex justify-center md:justify-end">
            <motion.div
              className="flex items-center space-x-2 px-4 py-3 md:py-2 rounded-full cursor-pointer transition-all duration-300 w-full md:w-auto justify-center md:justify-start"
              style={{
                background: watchProgress >= 100 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, rgba(192, 132, 252, 0.1) 0%, rgba(109, 40, 217, 0.05) 100%)',
                border: '1px solid rgba(192, 132, 252, 0.2)',
                boxShadow: watchProgress >= 100 
                  ? '0 4px 20px rgba(16, 185, 129, 0.3)'
                  : '0 4px 20px rgba(192, 132, 252, 0.1)'
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: watchProgress >= 100 
                  ? '0 6px 25px rgba(16, 185, 129, 0.4)'
                  : '0 6px 25px rgba(192, 132, 252, 0.15)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: watchProgress >= 100 ? '#FFFFFF' : 'linear-gradient(135deg, #C084FC 0%, #6D28D9 100%)'
                }}
              >
                {watchProgress >= 100 ? (
                  <Zap className="w-3 h-3 text-green-600" />
                ) : (
                  <span className="text-white text-xs font-bold">🎯</span>
                )}
              </div>
              
              <span 
                className="text-sm font-bold"
                style={{
                  color: watchProgress >= 100 ? '#FFFFFF' : '#8B5CF6'
                }}
              >
                {watchProgress >= 100 ? `+${xpReward} XP Earned!` : `+${xpReward} XP Reward`}
              </span>
            </motion.div>
          </div>

          {/* XP Earned Summary - Minimal */}
          {xpEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  Session Complete: {xpEarned} XP Added to Your Progress
                </span>
              </div>
            </motion.div>
          )}
        </div>
        </motion.div>
      </div>
    </div>
  );
};
