import React, { useState, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useXp } from "@/context/XpContext";
import { useAuth } from "@/hooks/useAuth";
import { LocalVideoPlayer } from "@/components/ui/local-video-player";
import { isYouTubeAPIEnabled } from "@/lib/feature-flags";
import { VideoCompletionService } from "@/lib/video-completion-service";

interface VideoPanelProps {
  videoId: string;
  title: string;
  creator: string;
  xpReward: number;
  isOpen: boolean;
  onClose: () => void;
  onReward: (xp: number) => void; // callback when XP is earned
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  videoId,
  title,
  creator,
  xpReward,
  isOpen,
  onClose,
  onReward,
}) => {
  const { addXp } = useXp();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [rewarded, setRewarded] = useState(false);
  const [useLocalPlayer] = useState(!isYouTubeAPIEnabled());
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);

  // Handle local video player XP
  const handleLocalXpEarned = (xp: number, reason: string) => {
    if (!rewarded) {
      setRewarded(true);
      // Don't call addXp here - LocalVideoPlayer already handles it
      onReward(xp);
      console.log(`🎯 Local XP: ${xp} earned for ${reason}`);
    }
  };

  // Handle local video player progress updates
  const handleLocalProgress = (progressPercentage: number) => {
    setProgress(progressPercentage);
  };

  // Check if video is already completed
  useEffect(() => {
    const checkCompletion = async () => {
      if (!user || !videoId) return;
      
      const completed = await VideoCompletionService.isVideoCompleted(videoId);
      setIsVideoCompleted(completed);
      if (completed) {
        setRewarded(true);
        console.log(`📹 Video ${videoId} already completed in VideoPanel`);
      }
    };
    
    checkCompletion();
  }, [user, videoId]);

  // Reset rewarded state when video changes
  useEffect(() => {
    setRewarded(false);
    setProgress(0);
    setIsVideoCompleted(false);
    
    if (useLocalPlayer) {
      console.log('🎬 VideoPanel using local player mode (YouTube API disabled)');
    }
  }, [videoId, useLocalPlayer]);

  // Track progress without continuous XP rewards
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (player && !isVideoCompleted) {
      interval = setInterval(async () => {
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        
        if (duration > 0) {
          const percent = (currentTime / duration) * 100;
          setProgress(percent);

          // Only reward XP ONCE when video is completed (≥ 95%)
          if (percent >= 95 && !rewarded && !isVideoCompleted) {
            setRewarded(true);
            
            // Fixed XP reward based on video's designated XP value
            const earnedXp = xpReward;
            
            // Mark video as completed to prevent future XP farming
            const marked = await VideoCompletionService.markVideoCompleted(videoId, earnedXp, currentTime);
            
            if (marked) {
              // Use callback to handle XP (prevents double-adding)
              onReward(earnedXp);
              
              // Also directly dispatch event to ensure XP Context gets updated
              if (typeof window !== 'undefined') {
                // Get current user XP and add the earned amount
                const event = new CustomEvent('xpUpdated', { 
                  detail: { totalXP: (user?.totalXP || 0) + earnedXp } 
                });
                window.dispatchEvent(event);
                console.log('🔄 VideoPanel dispatched xpUpdated event with earnedXp:', earnedXp);
              }
              
              setIsVideoCompleted(true);
              console.log(`🏁 Video completed: ${videoId} - Earned ${earnedXp} XP`);
            } else {
              console.log(`⚠️ YouTube video ${videoId} was already completed - no XP awarded`);
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [player, rewarded, xpReward, onReward, videoId, isVideoCompleted]);

  const onReady = (event: YouTubeEvent) => {
    setPlayer(event.target);
  };

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed z-50 flex items-center justify-center bg-black backdrop-blur-sm"
          style={{ 
            position: 'fixed',
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // click outside to close
        >
          <motion.div
            className="relative w-full max-w-sm sm:max-w-2xl rounded-xl sm:rounded-2xl bg-[#0d0d0f] shadow-xl overflow-hidden mx-4 my-4"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()} // prevent close on content click
          >
            {/* Close Button - Mobile responsive */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/60 transition z-10"
            >
              <X size={16} className="sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Video Area */}
            <div className="aspect-video w-full bg-black">
              {useLocalPlayer ? (
                <LocalVideoPlayer
                  url={`https://www.youtube.com/watch?v=${videoId}`}
                  onXpEarned={handleLocalXpEarned}
                  onProgress={handleLocalProgress}
                  className="w-full h-full rounded-t-xl sm:rounded-t-2xl"
                />
              ) : (
                <YouTube
                  videoId={videoId}
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: { autoplay: 0 },
                  }}
                  onReady={onReady}
                  className="w-full h-full rounded-t-xl sm:rounded-t-2xl"
                />
              )}
            </div>

            {/* Custom Progress Bar */}
            <div className="relative w-full h-1.5 bg-gray-700">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                style={{ width: `${progress}%` }}
                layout
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>

            {/* Info Section - Mobile responsive */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-5 py-3 sm:py-4 gap-3 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{creator}</p>
              </div>
              <motion.div
                className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap flex items-center space-x-2 ${
                  isVideoCompleted
                    ? "relative overflow-hidden"
                    : rewarded
                    ? "bg-green-500 text-white shadow-md shadow-green-500/30"
                    : "bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-md shadow-purple-500/30"
                }`}
                style={
                  isVideoCompleted
                    ? {
                        background: `
                          linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%),
                          rgba(30, 41, 59, 0.6)
                        `,
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(147, 51, 234, 0.3)',
                        boxShadow: `
                          0 8px 32px rgba(147, 51, 234, 0.3),
                          0 4px 16px rgba(59, 130, 246, 0.2),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2)
                        `,
                      }
                    : {}
                }
                whileHover={
                  isVideoCompleted
                    ? {
                        scale: 1.05,
                        boxShadow: `
                          0 12px 40px rgba(147, 51, 234, 0.4),
                          0 6px 20px rgba(59, 130, 246, 0.3),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)
                        `,
                      }
                    : { scale: 1.02 }
                }
                whileTap={isVideoCompleted ? { scale: 0.98 } : { scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isVideoCompleted && (
                  <>
                    {/* Glassmorphic Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full opacity-30"
                      style={{
                        background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.6) 0%, rgba(59, 130, 246, 0.6) 100%)',
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    
                    {/* XP Spark Particles */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                          left: `${20 + i * 20}%`,
                          top: `${20 + i * 10}%`,
                        }}
                        animate={{
                          y: [-2, -8, -2],
                          x: [0, Math.sin(i) * 4, 0],
                          opacity: [0.8, 0.3, 0.8],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5 + i * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </>
                )}
                
                {/* Content */}
                <span className="relative z-10 flex items-center space-x-1.5">
                  {isVideoCompleted ? (
                    <>
                      <motion.span
                        className="text-sm"
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      >
                        ✅
                      </motion.span>
                      <span className="text-white font-bold">Watched</span>
                    </>
                  ) : rewarded ? (
                    <span>+{xpReward} XP Earned</span>
                  ) : (
                    <span>+{xpReward} XP</span>
                  )}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};