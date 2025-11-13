import React, { useState, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Heart, Users, Star, Badge as BadgeIcon, Eye, ChevronRight, ExternalLink } from "lucide-react";
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

interface VideoPanelProps {
  videoId: string;
  title: string;
  creator: string;
  xpReward: number;
  isOpen: boolean;
  onClose: () => void;
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

export const VideoPanel: React.FC<VideoPanelProps> = ({
  videoId,
  title,
  creator,
  xpReward,
  isOpen,
  onClose,
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
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [rewarded, setRewarded] = useState(false);
  const [useLocalPlayer] = useState(!isYouTubeAPIEnabled());
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [showTipModal, setShowTipModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

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
  }, [user?.uid, videoId]);

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
            
            // Calculate actual watch time (use current position as approximate watch time)
            const actualWatchTime = Math.min(currentTime, duration);
            
            // Mark video as completed and award XP through Firebase Functions
            const marked = await VideoCompletionService.markVideoCompleted(videoId, xpReward, actualWatchTime);
            
            if (marked) {
              // Use callback for UI feedback
              onReward(xpReward);
              setIsVideoCompleted(true);
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
    if (!channelId) return;
    try {
      // YouTube subscription logic (readonly integration)
      window.open(`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`, '_blank');
      setIsSubscribed(true);
    } catch (error) {
      console.error('Subscribe error:', error);
    }
  };

  const handleFollow = async () => {
    try {
      // WizXP platform follow logic
      setIsFollowed(!isFollowed);
      console.log(`${isFollowed ? 'Unfollowed' : 'Followed'} creator:`, creatorId);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleTip = () => {
    setShowTipModal(true);
  };

  // Mock related videos data
  const relatedVideos = [
    {
      id: 'related1',
      title: 'Advanced React Patterns',
      creator: 'CodeMaster',
      thumbnail: `https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg`,
      views: '1.2M',
      xp: 150,
      avatar: '/Profile Pics/FERA.jpg'
    },
    {
      id: 'related2', 
      title: 'JavaScript ES2024 Features',
      creator: 'TechGuru',
      thumbnail: `https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg`,
      views: '890K',
      xp: 120,
      avatar: '/Profile Pics/RoyalKongz.jpg'
    },
    {
      id: 'related3',
      title: 'Building Scalable Apps',
      creator: 'DevExpert',
      thumbnail: `https://img.youtube.com/vi/ZbZSe6N_BXs/maxresdefault.jpg`, 
      views: '650K',
      xp: 200,
      avatar: '/Profile Pics/Ale.jpg'
    }
  ];

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
          className="fixed inset-0 z-50 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #0D0D16 0%, #1A1A26 100%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >

          <motion.div
            className="relative w-full h-screen overflow-auto"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Premium Dark Watch Screen - Design-Locked to Reference A */}
            <div className="relative w-full h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
              
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-2 rounded-full transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF'
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'rgba(255, 255, 255, 0.12)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* 12-Column Fluid Grid Layout */}
              <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-12 gap-6'} px-6 py-8 max-w-screen-2xl mx-auto h-full`}>
                
                {/* Left Content Region - 8 Columns (Video + Metadata) */}
                <div className={`${isMobile ? 'w-full' : 'col-span-8'}`}>
                  
                  {/* Video Player Container */}
                  <div className="relative mb-5">
                    <motion.div 
                      className="relative w-full aspect-video rounded-2xl overflow-hidden"
                      style={{
                        background: '#0D0D16',
                        padding: '12px',
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.18)'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Copy Link Button */}
                      <motion.button
                        className="absolute top-4 right-4 z-10 p-2 rounded-xl transition-all duration-200"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF'
                        }}
                        whileHover={{
                          background: 'rgba(255, 255, 255, 0.18)'
                        }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                      </motion.button>
                      {useLocalPlayer ? (
                        <LocalVideoPlayer
                          url={`https://www.youtube.com/watch?v=${videoId}`}
                          onXpEarned={handleLocalXpEarned}
                          onProgress={handleLocalProgress}
                          className="w-full h-full rounded-xl"
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
                          className="w-full h-full rounded-xl"
                        />
                      )}
                    
                  </motion.div>
                </div>
                
                {/* Video Title and Stats - Directly under video */}
                <div className="px-6 py-4">
                  <h2 className="text-white text-lg font-medium mb-2">{title}</h2>
                  <div className="flex items-center text-gray-400 text-sm mb-4">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{typeof views === 'number' ? views.toLocaleString() : views} views • 0:00</span>
                    {xpReward && (
                      <div className="ml-auto px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                        +{xpReward} XP
                      </div>
                    )}
                  </div>
                </div>


                {/* Creator Row */}
                <div className="px-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={creatorAvatar} alt={creator} />
                        <AvatarFallback className="bg-gray-600 text-white text-sm font-medium">
                          {creator.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-white font-medium text-sm">{creator}</h3>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{typeof subscriberCount === 'number' ? subscriberCount.toLocaleString() : subscriberCount} followers</span>
                          {creatorLevel && (
                            <span className="px-2 py-0.5 bg-gray-700 text-white rounded text-xs">
                              Level {creatorLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSubscribe}
                        disabled={isSubscribed}
                        className="px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                        style={{
                          background: isSubscribed ? '#4a5568' : '#e53e3e',
                          color: '#ffffff',
                          border: 'none'
                        }}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </Button>
                      
                      <Button
                        onClick={handleFollow}
                        className="px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                        style={{
                          background: isFollowed ? '#4a5568' : '#4a5568',
                          color: '#ffffff',
                          border: 'none'
                        }}
                      >
                        {isFollowed ? 'Following' : 'Follow'}
                      </Button>
                      
                      <Button
                        onClick={handleTip}
                        className="px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
                          color: '#ffffff',
                          border: 'none'
                        }}
                      >
                        Tip Crypto
                      </Button>
                      
                    </div>
                  </div>
                </div>

                {/* Purple Pill Tabs - Exactly as shown */}
                <div className="px-6 py-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full bg-transparent p-1 rounded-full" style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      {['videos', 'shorts', 'courses', 'community'].map((tab) => (
                        <TabsTrigger 
                          key={tab}
                          value={tab} 
                          className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                            activeTab === tab 
                              ? 'text-white' 
                              : 'text-gray-300 hover:text-white'
                          }`}
                          style={{
                            background: activeTab === tab ? '#8b5cf6' : 'transparent'
                          }}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <div className="mt-4">
                      <TabsContent value="videos" className="mt-0">
                        <div className="text-center py-8 text-gray-400">
                          <Play className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                          <p className="text-white text-base">Creator's videos will appear here</p>
                          <p className="text-sm text-gray-500 mt-1">Stay tuned for amazing content!</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="shorts" className="mt-0">
                        <div className="text-center py-8 text-gray-400">
                          <Star className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                          <p className="text-white text-base">Creator's shorts will appear here</p>
                          <p className="text-sm text-gray-500 mt-1">Quick, engaging content coming soon!</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="courses" className="mt-0">
                        <div className="text-center py-8 text-gray-400">
                          <BadgeIcon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                          <p className="text-white text-base">Creator's courses will appear here</p>
                          <p className="text-sm text-gray-500 mt-1">Learn from the best educators!</p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="community" className="mt-0">
                        <div className="text-center py-8 text-gray-400">
                          <Users className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                          <p className="text-white text-base">Creator's community posts will appear here</p>
                          <p className="text-sm text-gray-500 mt-1">Join the conversation and connect!</p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>

              {/* Futuristic Related Videos Sidebar */}
              {!isMobile && (
                <div className="w-80 flex-shrink-0 overflow-y-auto">
                  <motion.div 
                    className="backdrop-blur-xl rounded-2xl m-4 p-6 border border-white/10 shadow-2xl overflow-hidden relative"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {/* Dark animated background pattern */}
                    <motion.div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(167, 139, 250, 0.05) 50%, transparent 70%)'
                      }}
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                    
                    <div className="relative z-10">
                      <h3 className="font-bold text-white text-lg mb-6 drop-shadow-lg flex items-center">
                        <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mr-2">Up next</span>
                        <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
                      </h3>
                      <div className="space-y-4">
                        {relatedVideos.map((video, index) => (
                          <motion.div
                            key={video.id}
                            whileHover={{ y: -3, scale: 1.03, rotateX: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className="cursor-pointer group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                          >
                            <motion.div 
                              className="backdrop-blur-lg rounded-xl p-3 border border-white/10 transition-all duration-300 relative overflow-hidden"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                              }}
                              whileHover={{
                                y: -4,
                                boxShadow: '0 8px 30px rgba(124, 58, 237, 0.2), 0 4px 15px rgba(0, 0, 0, 0.4)',
                                background: 'rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              {/* Violet shimmer hover effect */}
                              <motion.div
                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)'
                                }}
                              />
                              <div className="relative z-10 flex flex-col">
                                <div className="relative w-full aspect-video overflow-hidden rounded-lg border border-white/10">
                                  <img 
                                    src={video.thumbnail} 
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      whileHover={{ scale: 1, opacity: 1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="backdrop-blur-md rounded-full p-3 border border-white/30 shadow-xl"
                                      style={{
                                        background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.4) 0%, rgba(196, 132, 252, 0.4) 100%)'
                                      }}
                                    >
                                      <Play className="w-5 h-5 text-white drop-shadow-lg" />
                                    </motion.div>
                                  </div>
                                  
                                  {/* Dark gradient overlay on corners */}
                                  <div className="absolute top-0 left-0 w-6 h-6 bg-gradient-to-br from-purple-500/20 to-transparent rounded-br-lg" />
                                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-tl-lg" />
                                </div>
                              
                                <div className="pt-3 space-y-3">
                                  {/* White Title */}
                                  <h4 className="font-semibold text-white line-clamp-2 text-sm leading-tight group-hover:text-gray-100 transition-all duration-300 drop-shadow-sm">
                                    {video.title}
                                  </h4>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                      <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Avatar className="w-6 h-6 ring-1 ring-white/20 shadow-lg">
                                          <AvatarImage src={video.avatar} alt={video.creator} />
                                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs font-bold">
                                            {video.creator.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </motion.div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-medium truncate" style={{ color: '#B0B3C7' }}>{video.creator}</span>
                                        <span className="text-xs" style={{ color: '#B0B3C7' }}>{video.views} views</span>
                                      </div>
                                    </div>
                                    
                                    {/* Violet XP Badge with Glow */}
                                    <motion.div 
                                      className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-lg border border-violet-400/30 shadow-lg flex-shrink-0"
                                      style={{
                                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.5) 0%, rgba(167, 139, 250, 0.5) 100%)',
                                        color: '#FFFFFF',
                                        boxShadow: '0 3px 12px rgba(124, 58, 237, 0.4)'
                                      }}
                                      whileHover={{ 
                                        scale: 1.05,
                                        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.6), 0 0 15px rgba(167, 139, 250, 0.4)'
                                      }}
                                    >
                                      +{video.xp} XP
                                    </motion.div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                      ))}
                    </div>
                    </div>
                  </motion.div>
                </div>
              )}

            {/* Futuristic Mobile Related Videos */}
            {isMobile && (
              <motion.div 
                className="backdrop-blur-xl rounded-t-2xl mx-4 mt-6 p-6 border border-white/10 border-b-0 shadow-2xl relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {/* Dark mobile background pattern */}
                <motion.div
                  className="absolute inset-0 opacity-5"
                  style={{
                    background: 'linear-gradient(45deg, transparent 40%, rgba(167, 139, 250, 0.1) 50%, transparent 60%)'
                  }}
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
                
                <div className="relative z-10">
                  <h2 className="text-lg font-bold text-white mb-6 drop-shadow-lg flex items-center">
                    <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mr-2">Related Videos</span>
                    <ExternalLink className="w-4 h-4" style={{ color: '#A78BFA' }} />
                  </h2>
                  <div className="space-y-4">
                    {relatedVideos.slice(0, 3).map((video, index) => (
                      <motion.div
                        key={video.id}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="backdrop-blur-lg rounded-xl p-3 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 relative overflow-hidden"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          {/* Dark mobile hover glow */}
                          <motion.div
                            className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-100 transition-opacity duration-200"
                            style={{
                              background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.06) 0%, rgba(124, 58, 237, 0.06) 100%)'
                            }}
                          />
                          <div className="relative z-10 flex space-x-3">
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-active:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center">
                                <motion.div
                                  animate={{
                                    scale: [0.9, 1, 0.9]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <Play className="w-4 h-4 text-white opacity-80 drop-shadow-lg" />
                                </motion.div>
                              </div>
                              
                              {/* Dark mobile gradient corners */}
                              <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-br from-purple-500/15 to-transparent" />
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-tl from-purple-500/15 to-transparent" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* White Title */}
                              <h4 className="font-semibold text-white line-clamp-2 text-sm leading-tight drop-shadow-sm group-active:text-gray-100 transition-colors duration-300">
                                {video.title}
                              </h4>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <span className="text-xs font-medium truncate" style={{ color: '#B0B3C7' }}>{video.creator}</span>
                                  <span className="text-xs" style={{ color: '#B0B3C7' }}>•</span>
                                  <span className="text-xs" style={{ color: '#B0B3C7' }}>{video.views} views</span>
                                </div>
                                {/* Violet XP Badge */}
                                <motion.div 
                                  className="px-2 py-1 text-xs font-bold rounded-full backdrop-blur-lg border border-violet-400/30 flex-shrink-0 shadow-lg"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.5) 0%, rgba(167, 139, 250, 0.5) 100%)',
                                    color: '#FFFFFF'
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  +{video.xp} XP
                                </motion.div>
                              </div>
                            </div>
                          </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                </div>
              </motion.div>
            )}
            </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};