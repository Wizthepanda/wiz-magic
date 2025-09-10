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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [rewarded, setRewarded] = useState(false);
  const [useLocalPlayer] = useState(!isYouTubeAPIEnabled());
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [showTipModal, setShowTipModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  
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
  }, [user, videoId]);

  // Reset rewarded state when video changes
  useEffect(() => {
    setRewarded(false);
    setProgress(0);
    setIsVideoCompleted(false);
    
    if (useLocalPlayer) {
      console.log('🎬 WatchPage using local player mode (YouTube API disabled)');
    }
  }, [videoId, useLocalPlayer]);

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
    if (!channelId) return;
    try {
      window.open(`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`, '_blank');
      setIsSubscribed(true);
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
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) navigate('/');
      }}
    >
      <div 
        className="h-full w-full overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #0A0F1C 0%, #1A1B2E 100%)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Top Right */}
        <button
          onClick={() => navigate('/')}
          className="fixed top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Two Column Layout */}
        <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-12 gap-6'} px-6 py-4 max-w-7xl mx-auto min-h-screen`}>
          
          {/* Left Column - Video & Info */}
          <div className={`${isMobile ? 'w-full' : 'col-span-8'}`}>
            
            {/* Video Player Section */}
            <div className="relative mb-4">
              {/* Copy Link Button */}
              <button 
                className="absolute top-3 right-3 z-10 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded flex items-center space-x-1 hover:bg-opacity-80 transition-all"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <span>Copy link</span>
              </button>

              <div 
                className="relative w-full rounded-xl overflow-hidden"
                style={{
                  aspectRatio: '16/9',
                  background: '#000'
                }}
              >
                {useLocalPlayer ? (
                  <LocalVideoPlayer
                    url={`https://www.youtube.com/watch?v=${videoId}`}
                    onXpEarned={handleLocalXpEarned}
                    onProgress={handleLocalProgress}
                    className="w-full h-full"
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
                    className="w-full h-full"
                  />
                )}
                
                {/* Watch on YouTube overlay */}
                <div className="absolute bottom-3 left-3">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                    <span>Watch on</span>
                    <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Premium Progress Bar */}
              {videoDuration > 0 && (
                <motion.div
                  className="mt-3 px-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Progress Bar Container */}
                  <div className="relative">
                    {/* Background Track */}
                    <div 
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {/* Progress Fill */}
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: progress >= 95 
                            ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
                            : 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
                          boxShadow: progress >= 95 
                            ? '0 0 10px rgba(16, 185, 129, 0.4)' 
                            : '0 0 10px rgba(124, 58, 237, 0.4)'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-400 font-medium">
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-medium">
                          {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                        </span>
                        <div className="text-purple-400 font-semibold">
                          {Math.floor(progress)}% complete
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

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

            {/* Title Row */}
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-white font-bold text-lg leading-tight flex-1 mr-4">
                Faceless Concert - Short Trailer
              </h1>
              <div 
                className="px-3 py-1 rounded-full text-white text-sm font-semibold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)'
                }}
              >
                +10 XP
              </div>
            </div>

            {/* Views & Duration */}
            <div className="flex items-center text-gray-400 text-sm mb-4">
              <Eye className="w-4 h-4 mr-1" />
              <span>3.7 views • 0:05</span>
            </div>

            {/* Creator Section */}
            <div className="flex items-center justify-between mb-6">
              {/* Creator Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={creatorAvatar} alt={creator} />
                  <AvatarFallback className="bg-gray-600 text-white font-semibold">
                    {creator.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold text-sm">
                      Faceless Avatars
                    </span>
                    <div className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">
                      Level 1
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">
                    0 followers
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSubscribe}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
                >
                  Subscribe
                </button>
                
                <button
                  onClick={handleFollow}
                  className="px-4 py-2 border border-gray-500 hover:border-white text-white text-sm font-semibold rounded transition-colors"
                >
                  Follow
                </button>
                
                <button
                  onClick={handleTip}
                  className="px-4 py-2 text-white text-sm font-semibold rounded transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
                  }}
                >
                  Tip Crypto
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="relative mb-6">
              <div className="flex space-x-6 border-b border-gray-700">
                {[
                  { id: 'videos', label: 'Videos' },
                  { id: 'shorts', label: 'Shorts' },
                  { id: 'courses', label: 'Courses' },
                  { id: 'community', label: 'Community' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
                        layoutId="activeTab"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === 'videos' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" fill="currentColor" />
                  </div>
                  <p className="text-white font-semibold mb-2">Creator's videos will appear here</p>
                  <p className="text-gray-400 text-sm">Stay tuned for amazing content!</p>
                </motion.div>
              )}
              
              {activeTab === 'shorts' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-semibold mb-2">Creator's shorts will appear here</p>
                  <p className="text-gray-400 text-sm">Quick, engaging content!</p>
                </motion.div>
              )}
              
              {activeTab === 'courses' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <BadgeIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-semibold mb-2">Creator's courses will appear here</p>
                  <p className="text-gray-400 text-sm">Learn from the best!</p>
                </motion.div>
              )}
              
              {activeTab === 'community' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-semibold mb-2">Creator's community posts will appear here</p>
                  <p className="text-gray-400 text-sm">Join the conversation!</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column - Related Videos */}
          {!isMobile && (
            <div className="col-span-4">
              <div className="sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Related Videos</h3>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-3">
                  {relatedVideos.map((video) => (
                    <div
                      key={video.id}
                      className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-800/50"
                      style={{ background: 'rgba(26, 27, 46, 0.6)' }}
                    >
                      <div className="flex space-x-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-24 h-16 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-white text-sm font-medium line-clamp-2 flex-1">
                              {video.title}
                            </h4>
                            <div 
                              className="px-2 py-1 rounded-full text-white text-xs font-semibold ml-2"
                              style={{
                                background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)'
                              }}
                            >
                              +{video.xp} XP
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={video.avatar} alt={video.creator} />
                              <AvatarFallback className="text-xs bg-gray-600">
                                {video.creator.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-400 text-xs">
                              {video.creator}
                            </span>
                          </div>
                          
                          <span className="text-gray-400 text-xs">
                            {video.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Related Videos */}
          {isMobile && (
            <div className="mt-8">
              <h3 className="text-white font-semibold mb-4">Related Videos</h3>
              <div className="space-y-3">
                {relatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="p-3 rounded-lg"
                    style={{ background: 'rgba(26, 27, 46, 0.6)' }}
                  >
                    <div className="flex space-x-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-white text-sm font-medium line-clamp-2 flex-1">
                            {video.title}
                          </h4>
                          <div 
                            className="px-2 py-1 rounded-full text-white text-xs font-semibold ml-2"
                            style={{
                              background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)'
                            }}
                          >
                            +{video.xp} XP
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {video.creator} • {video.views}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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