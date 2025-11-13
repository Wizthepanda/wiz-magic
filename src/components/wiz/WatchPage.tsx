import React, { useState, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Users, Star, Badge as BadgeIcon, Eye, ChevronRight, ExternalLink, X } from "lucide-react";
import { useXp } from "@/context/XpContext";
import { useAuth } from "@/hooks/useAuth";
import { LocalVideoPlayer } from "@/components/ui/local-video-player";
import { isYouTubeAPIEnabled } from "@/lib/feature-flags";
import { VideoCompletionService } from "@/lib/video-completion-service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { TipModal } from "./creator/components/TipModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSafeNavigate } from "@/hooks/useSafeNavigate";
import { useYouTubeSubscription } from "@/hooks/useYouTubeSubscription";
import { useWizXP } from "@/hooks/useWizXP";
import { YouTubeSubscriptionService } from "@/lib/youtube-subscription-service";

interface WatchPageProps {
  videoId: string;
  title: string;
  creator: string;
  xpReward: number;
  onReward: (xp: number) => void;
  // Enhanced creator info
  creatorAvatar?: string;
  creatorId?: string;
  channelId?: string;
  subscriberCount?: string | number;
  creatorLevel?: number;
  views?: string | number;
  duration?: string;
  description?: string;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  videoId,
  title,
  creator,
  xpReward,
  onReward,
  creatorAvatar,
  creatorId,
  channelId,
  subscriberCount = "0",
  creatorLevel = 1,
  views,
  duration,
  description,
}) => {
  const { addXp } = useXp();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useSafeNavigate();
  
  // YouTube subscription hooks
  const { 
    subscriptionStatus, 
    subscribe, 
    isLoading: subscriptionLoading,
    hasPermissions 
  } = useYouTubeSubscription(channelId || '');
  
  // XP system hook
  const { refreshData: refreshXP } = useWizXP();
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [rewarded, setRewarded] = useState(false);
  const [useLocalPlayer] = useState(!isYouTubeAPIEnabled());
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [showTipModal, setShowTipModal] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [actualSubscriberCount, setActualSubscriberCount] = useState<string | null>(null);
  
  // Progress bar and XP reward states
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showXpReward, setShowXpReward] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // Handle local video player XP
  const handleLocalXpEarned = (xp: number, reason: string) => {
    if (!rewarded) {
      setRewarded(true);
      onReward(xp);
      setEarnedXp(xp);
      setShowXpReward(true);
      setIsVideoCompleted(true);
      
      // Hide XP reward after 3 seconds
      setTimeout(() => {
        setShowXpReward(false);
      }, 3000);
      
      console.log(`🎯 Local XP: ${xp} earned for ${reason}`);
    }
  };

  // Handle local video player progress updates
  const handleLocalProgress = (progressPercentage: number, currentVideoTime?: number, duration?: number) => {
    setProgress(progressPercentage);
    if (currentVideoTime !== undefined) setCurrentTime(currentVideoTime);
    if (duration !== undefined) setVideoDuration(duration);
  };

  // Check if video is already completed
  useEffect(() => {
    const checkCompletion = async () => {
      if (!user || !videoId) return;
      
      const completed = await VideoCompletionService.isVideoCompleted(videoId);
      setIsVideoCompleted(completed);
      if (completed) {
        setRewarded(true);
        console.log(`📹 Video ${videoId} already completed in WatchPage`);
      }
    };
    
    checkCompletion();
  }, [user?.uid, videoId]);

  // Reset rewarded state when video changes
  useEffect(() => {
    setRewarded(false);
    setProgress(0);
    setIsVideoCompleted(false);
    
    if (useLocalPlayer) {
      console.log('🎬 WatchPage using local player mode (YouTube API disabled)');
    }
  }, [videoId, useLocalPlayer]);

  // Fetch actual subscriber count from YouTube API
  useEffect(() => {
    const fetchSubscriberCount = async () => {
      if (channelId) {
        try {
          const count = await YouTubeSubscriptionService.getChannelSubscriberCount(channelId);
          setActualSubscriberCount(count);
        } catch (error) {
          console.error('Failed to fetch subscriber count:', error);
        }
      }
    };

    fetchSubscriberCount();
  }, [channelId]);

  // Track progress without continuous XP rewards
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (player && !isVideoCompleted) {
      interval = setInterval(async () => {
        const duration = player.getDuration();
        const currentVideoTime = player.getCurrentTime();
        
        if (duration > 0) {
          const percent = (currentVideoTime / duration) * 100;
          setProgress(percent);
          setCurrentTime(currentVideoTime);
          setVideoDuration(duration);

          // Only reward XP ONCE when video is completed (≥ 95%)
          if (percent >= 95 && !rewarded && !isVideoCompleted) {
            setRewarded(true);
            
            const actualWatchTime = Math.min(currentVideoTime, duration);
            
            const marked = await VideoCompletionService.markVideoCompleted(videoId, xpReward, actualWatchTime);
            
            if (marked) {
              onReward(xpReward);
              setIsVideoCompleted(true);
              setEarnedXp(xpReward);
              setShowXpReward(true);
              
              // Hide XP reward after 3 seconds
              setTimeout(() => {
                setShowXpReward(false);
              }, 3000);
              
              console.log(`🏁 Video completed: ${videoId} - Watch time: ${actualWatchTime}s`);
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

  // Handler functions for actions
  const handleSubscribe = async () => {
    if (!channelId || subscriptionLoading) return;
    
    try {
      console.log('🔔 Initiating subscription...');
      const result = await subscribe();
      
      if (result.success) {
        console.log('✅ Subscription successful! XP should be awarded automatically.');
        
        // Refresh XP data to show new total
        await refreshXP();
        
        // Show success notification
        window.dispatchEvent(new CustomEvent('wizXPUpdate', {
          detail: {
            userId: user?.uid,
            xpGained: 30, // SUBSCRIPTION_XP amount
            newTotal: null, // Will be updated by refresh
            source: 'subscription',
            message: `+30 XP for subscribing to ${creator}!`
          }
        }));
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  const handleFollow = async () => {
    try {
      setIsFollowed(!isFollowed);
      console.log(`${isFollowed ? 'Unfollowed' : 'Followed'} creator:`, creatorId);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleTip = () => {
    setShowTipModal(true);
  };

  // Mock related videos data matching screenshot
  const relatedVideos = [
    {
      id: 'related1',
      title: 'Advanced React Patterns',
      creator: 'CodeMaster',
      thumbnail: `https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg`,
      views: '1.2M views',
      xp: 150,
      avatar: '/Profile Pics/FERA.jpg'
    },
    {
      id: 'related2', 
      title: 'JavaScript ES2024 Features',
      creator: 'TechGuru',
      thumbnail: `https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg`,
      views: '800K views',
      xp: 120,
      avatar: '/Profile Pics/RoyalKongz.jpg'
    },
    {
      id: 'related3',
      title: 'Building Scalable Apps',
      creator: 'DevExpert',
      thumbnail: `https://img.youtube.com/vi/ZbZSe6N_BXs/maxresdefault.jpg`, 
      views: '650K views',
      xp: 200,
      avatar: '/Profile Pics/Ale.jpg'
    }
  ];

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [navigate]);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      style={{
        background: 'linear-gradient(135deg, #f9fafc 0%, #f3f6f9 40%, #eef1f5 100%)',
        minHeight: '100vh'
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) navigate('/');
      }}
    >
      <div
        className="h-full w-full overflow-y-auto"
        style={{
          background: 'transparent'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Premium Floating Style */}
        <motion.button
          onClick={() => navigate('/')}
          className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)'
          }}
          whileHover={{
            scale: 1.05,
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <X className="w-5 h-5 text-gray-600" />
        </motion.button>

        {/* Two Column Layout - Premium Fade-in Transition */}
        <motion.div
          className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-12 gap-8'} px-8 py-8 max-w-7xl mx-auto min-h-screen`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            staggerChildren: 0.15,
            delayChildren: 0.1
          }}
        >
          
          {/* Left Column - Video & Info */}
          <motion.div
            className={`${isMobile ? 'w-full' : 'col-span-8'}`}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            
            {/* Main Video Player - Glassmorphic Container */}
            <motion.div
              className="relative mb-8 mx-auto max-w-5xl"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            >
              {/* Copy Link Button - Floating Overlay */}
              <motion.button
                className="absolute top-6 right-6 z-20 px-4 py-2 text-sm font-medium rounded-2xl flex items-center space-x-2 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{
                  scale: 1.05,
                  background: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <span className="text-gray-700 font-semibold">Copy link</span>
              </motion.button>

              {/* Main Video Player Container - Glassmorphic */}
              <motion.div
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '16/9',
                  background: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '1.25rem',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 15px rgba(0, 0, 0, 0.04)'
                }}
                whileHover={{
                  scale: 1.005
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div
                  className="absolute inset-3 rounded-2xl overflow-hidden"
                  style={{
                    background: '#000',
                    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {useLocalPlayer ? (
                    <LocalVideoPlayer
                      url={`https://www.youtube.com/watch?v=${videoId}`}
                      onXpEarned={handleLocalXpEarned}
                      onProgress={handleLocalProgress}
                      className="w-full h-full rounded-2xl"
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
                      className="w-full h-full rounded-2xl"
                    />
                  )}

                  {/* Watch on YouTube overlay - Floating Badge */}
                  <div className="absolute bottom-6 left-6">
                    <motion.div
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                      }}
                      whileHover={{
                        scale: 1.05,
                        background: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span className="text-gray-700">Watch on</span>
                      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Seamless Progress Bar */}
              {videoDuration > 0 && (
                <motion.div
                  className="mt-8 mx-auto max-w-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  {/* Ultra-thin Progress Track */}
                  <div
                    className="relative w-full h-1 rounded-full overflow-hidden mb-4"
                    style={{
                      background: 'rgba(139, 92, 246, 0.15)'
                    }}
                  >
                    {/* Progress Fill with Glow */}
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: progress >= 95
                          ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                          : 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                        boxShadow: progress >= 95
                          ? '0 0 15px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2)'
                          : '0 0 15px rgba(124, 58, 237, 0.4), 0 0 30px rgba(124, 58, 237, 0.2)'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>

                  {/* Minimal Time Display */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">
                      {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600 font-medium">
                        {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                      </span>
                      <motion.div
                        className="px-4 py-2 rounded-full text-white text-sm font-bold"
                        style={{
                          background: progress >= 95
                            ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                          boxShadow: progress >= 95
                            ? '0 4px 20px rgba(16, 185, 129, 0.3)'
                            : '0 4px 20px rgba(124, 58, 237, 0.3)'
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {Math.floor(progress)}% complete
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* XP Reward Celebration */}
            <AnimatePresence>
              {showXpReward && (
                <motion.div
                  className="fixed inset-0 z-60 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="bg-black bg-opacity-80 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center space-y-4"
                    style={{
                      background: `
                        linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%),
                        rgba(0, 0, 0, 0.8)
                      `,
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(16, 185, 129, 0.2)',
                      boxShadow: '0 25px 50px rgba(16, 185, 129, 0.2)'
                    }}
                    initial={{ scale: 0.5, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.5, y: 50 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {/* Celebration Icon */}
                    <motion.div
                      className="relative"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="text-6xl">🎉</div>
                      
                      {/* Sparkle Effects */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-emerald-400 rounded-full"
                          style={{
                            top: `${Math.random() * 60 - 30}px`,
                            left: `${Math.random() * 60 - 30}px`,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            y: [0, -20, -40]
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.2,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* XP Reward Text */}
                    <div className="text-center">
                      <motion.div
                        className="text-3xl font-bold text-emerald-400 mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        +{earnedXp} XP
                      </motion.div>
                      <motion.div
                        className="text-white text-lg font-semibold"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        Video Completed!
                      </motion.div>
                      <motion.div
                        className="text-gray-400 text-sm mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                      >
                        Great job watching the full video
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title Row - Seamless with Background */}
            <motion.div
              className="flex items-start justify-between mb-4 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <div className="flex-1">
                <h1 className="text-gray-900 font-bold text-xl leading-tight mb-2">
                  {title}
                </h1>
                {/* Views & Duration */}
                <div className="flex items-center text-gray-600 text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{views} • Duration varies</span>
                </div>
              </div>
              <div
                className="px-4 py-2 rounded-full text-white text-sm font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)'
                }}
              >
                +{xpReward} XP
              </div>
            </motion.div>

            {/* Below Video Section - Creator Info and Action Buttons */}
            <motion.div
              className="flex items-center justify-between mb-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              {/* Left-aligned Creator Info */}
              <div className="flex items-center space-x-5">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={creatorAvatar} alt={creator} />
                  <AvatarFallback
                    className="text-white font-bold text-xl"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    }}
                  >
                    {creator.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-gray-900 font-bold text-lg">
                      {creator}
                    </span>
                    <motion.div
                      className="px-3 py-1 text-white text-xs font-bold rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      ✓ Level {creatorLevel}
                    </motion.div>
                  </div>
                  <span className="text-gray-600 text-base font-semibold">
                    {actualSubscriberCount ? `${actualSubscriberCount} subscribers` :
                     (typeof subscriberCount === 'string' && subscriberCount.includes('subscribers') ?
                      subscriberCount :
                      `${typeof subscriberCount === 'number' ? subscriberCount.toLocaleString() : subscriberCount} subscribers`)}
                  </span>
                </div>
              </div>

              {/* Right-aligned Premium Pill Actions */}
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={handleSubscribe}
                  disabled={subscriptionStatus?.isSubscribed || subscriptionLoading}
                  className="px-6 py-3 text-white text-sm font-bold transition-all"
                  style={{
                    background: subscriptionStatus?.isSubscribed
                      ? 'linear-gradient(90deg, #f3f6f9, #eef1f5)'
                      : 'linear-gradient(90deg, #f3f6f9, #eef1f5)',
                    borderRadius: '9999px',
                    padding: '0.5rem 1.25rem',
                    color: subscriptionStatus?.isSubscribed ? '#4b5563' : '#1f2937',
                    opacity: subscriptionLoading ? 0.7 : 1,
                    cursor: (subscriptionStatus?.isSubscribed || subscriptionLoading) ? 'not-allowed' : 'pointer'
                  }}
                  whileHover={{
                    scale: subscriptionStatus?.isSubscribed ? 1 : 1.02,
                    background: 'linear-gradient(90deg, #e5e7eb, #d1d5db)'
                  }}
                  whileTap={{ scale: subscriptionStatus?.isSubscribed ? 1 : 0.98 }}
                >
                  {subscriptionLoading ? 'Loading...' : (subscriptionStatus?.isSubscribed ? '✓ Subscribed' : 'Subscribe')}
                </motion.button>

                <motion.button
                  onClick={handleTip}
                  className="text-gray-700 text-sm font-bold transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #f3f6f9, #eef1f5)',
                    borderRadius: '9999px',
                    padding: '0.5rem 1.25rem'
                  }}
                  whileHover={{
                    scale: 1.02,
                    background: 'linear-gradient(90deg, #e5e7eb, #d1d5db)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Tip
                </motion.button>

                <motion.button
                  className="text-gray-700 text-sm font-bold transition-all"
                  style={{
                    background: 'linear-gradient(90deg, #f3f6f9, #eef1f5)',
                    borderRadius: '9999px',
                    padding: '0.5rem 1.25rem'
                  }}
                  whileHover={{
                    scale: 1.02,
                    background: 'linear-gradient(90deg, #e5e7eb, #d1d5db)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Share
                </motion.button>

              </div>
            </motion.div>

            {/* Seamless Tab Navigation */}
            <motion.div
              className="relative mb-10 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <div className="flex justify-center space-x-2">
                {[
                  { id: 'videos', label: 'Videos', icon: '🎬' },
                  { id: 'shorts', label: 'Shorts', icon: '⚡' },
                  { id: 'courses', label: 'Courses', icon: '📚' },
                  { id: 'community', label: 'Community', icon: '👥' }
                ].map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-8 py-4 text-sm font-bold rounded-full transition-all ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    style={{
                      background: activeTab === tab.id
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                        : 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: activeTab === tab.id ? 'none' : '1px solid rgba(139, 92, 246, 0.2)',
                      boxShadow: activeTab === tab.id
                        ? '0 8px 25px rgba(139, 92, 246, 0.3)'
                        : '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                    whileHover={{
                      scale: 1.05,
                      background: activeTab === tab.id
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                        : 'rgba(255, 255, 255, 0.6)',
                      boxShadow: activeTab === tab.id
                        ? '0 12px 35px rgba(139, 92, 246, 0.4)'
                        : '0 6px 20px rgba(139, 92, 246, 0.2)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Seamless Tab Content */}
            <motion.div
              className="min-h-[200px] max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              {activeTab === 'videos' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100())'
                    }}
                  >
                    <Play className="w-10 h-10 text-white" fill="currentColor" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg mb-3">Creator's videos will appear here</p>
                  <p className="text-gray-600 text-base">Stay tuned for amazing content!</p>
                </motion.div>
              )}

              {activeTab === 'shorts' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    }}
                  >
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg mb-3">Creator's shorts will appear here</p>
                  <p className="text-gray-600 text-base">Quick, engaging content!</p>
                </motion.div>
              )}

              {activeTab === 'courses' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                  >
                    <BadgeIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg mb-3">Creator's courses will appear here</p>
                  <p className="text-gray-600 text-base">Learn from the best!</p>
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100())'
                    }}
                  >
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-gray-900 font-bold text-lg mb-3">Creator's community posts will appear here</p>
                  <p className="text-gray-600 text-base">Join the conversation!</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Right Panel - Seamless Dashboard Extension */}
          {!isMobile && (
            <motion.div
              className="col-span-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            >
              <div className="sticky top-8">
                {/* No Container - Direct Dashboard Integration */}
                <div className="space-y-6">
                  {/* Section Header */}
                  <motion.div
                    className="flex items-center justify-between mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-gray-800 font-bold text-xl">Up Next</h3>
                    <motion.div whileHover={{ x: 3 }}>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </motion.div>
                  </motion.div>

                  {/* Related Videos - Floating Cards */}
                  <div className="space-y-4">
                    {relatedVideos.map((video, index) => (
                      <motion.div
                        key={video.id}
                        className="group cursor-pointer transition-all duration-300"
                        style={{
                          background: 'rgba(255, 255, 255, 0.4)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.6)',
                          borderRadius: '24px',
                          padding: '20px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)'
                        }}
                        whileHover={{
                          scale: 1.02,
                          background: 'rgba(255, 255, 255, 0.6)',
                          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.08), 0 6px 24px rgba(0, 0, 0, 0.04)',
                          borderColor: 'rgba(139, 92, 246, 0.3)'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      >
                        <div className="flex space-x-5">
                          {/* Thumbnail with Hover Effect */}
                          <div className="relative flex-shrink-0">
                            <motion.img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-32 h-20 object-cover rounded-2xl"
                              style={{
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
                              }}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            />
                            <motion.div
                              className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center"
                              >
                                <Play className="w-4 h-4 text-gray-800" fill="currentColor" />
                              </motion.div>
                            </motion.div>
                          </div>

                          {/* Video Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-gray-900 text-sm font-bold line-clamp-2 flex-1 leading-snug">
                                {video.title}
                              </h4>
                              <motion.div
                                className="px-3 py-1 rounded-full text-white text-xs font-bold ml-3 flex-shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)'
                                }}
                                whileHover={{ scale: 1.05 }}
                              >
                                ⚡ +{video.xp} XP
                              </motion.div>
                            </div>

                            {/* Creator Info */}
                            <div className="flex items-center space-x-3 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={video.avatar} alt={video.creator} />
                                <AvatarFallback
                                  className="text-xs text-white font-bold"
                                  style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100())'
                                  }}
                                >
                                  {video.creator.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-700 text-sm font-semibold">
                                {video.creator}
                              </span>
                            </div>

                            <span className="text-gray-500 text-sm font-medium">
                              {video.views} • 5 days ago
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Premium CTA at Bottom */}
                  <motion.div
                    className="mt-8 p-6 rounded-2xl cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)'
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 12px 48px rgba(139, 92, 246, 0.4)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="text-center text-white">
                      <h4 className="font-bold text-lg mb-2">🚀 Unlock Premium</h4>
                      <p className="text-sm opacity-90">Get unlimited XP access to exclusive content</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mobile Related Videos - Premium Cards */}
          {isMobile && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <h3 className="text-gray-900 font-bold text-lg mb-6">Related Videos</h3>
              <div className="space-y-4">
                {relatedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex space-x-4">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-gray-900 text-sm font-semibold line-clamp-2 flex-1">
                            {video.title}
                          </h4>
                          <div
                            className="px-3 py-1 rounded-full text-white text-xs font-bold ml-2"
                            style={{
                              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                            }}
                          >
                            +{video.xp} XP
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {video.creator} • {video.views}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tip Modal */}
        {channelId && (
          <TipModal 
            isOpen={showTipModal}
            onClose={() => setShowTipModal(false)}
            creatorId={creatorId || channelId}
            creatorName={creator}
            creatorAvatar={creatorAvatar}
          />
        )}
      </div>
    </motion.div>
  );
};