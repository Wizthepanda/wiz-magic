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
import { YouTubeSubscriptionService } from "@/lib/youtube-subscription-service";
import { useYouTubeSubscription } from "@/hooks/useYouTubeSubscription";
import { useWizXP } from "@/hooks/useWizXP";

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
  
  // YouTube subscription hook
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

  // Handle local video player XP
  const handleLocalXpEarned = (xp: number, reason: string) => {
    if (!rewarded) {
      setRewarded(true);
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

  // Fetch actual subscriber count from YouTube API
  useEffect(() => {
    const fetchSubscriberCount = async () => {
      if (channelId && isYouTubeAPIEnabled()) {
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
        const currentTime = player.getCurrentTime();
        
        if (duration > 0) {
          const percent = (currentTime / duration) * 100;
          setProgress(percent);

          // Only reward XP ONCE when video is completed (≥ 95%)
          if (percent >= 95 && !rewarded && !isVideoCompleted) {
            setRewarded(true);
            
            const actualWatchTime = Math.min(currentTime, duration);
            
            const marked = await VideoCompletionService.markVideoCompleted(videoId, xpReward, actualWatchTime);
            
            if (marked) {
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
              
              {/* Left Content Region - 8 Columns */}
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
                
                {/* Metadata Block - Exact Hierarchy */}
                <div className="space-y-4">
                  
                  {/* A. Video Title + B. XP Badge */}
                  <div className="flex items-start justify-between">
                    <h1 
                      className="text-white font-bold leading-tight flex-1 mr-4"
                      style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        lineHeight: 1.15
                      }}
                    >
                      {title}
                    </h1>
                    
                    {xpReward && (
                      <motion.div
                        className="px-4 py-2 rounded-full text-white font-semibold text-xs flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                          boxShadow: '0 0 24px rgba(124, 58, 237, 0.28)',
                          fontWeight: 600
                        }}
                        animate={{
                          boxShadow: [
                            '0 0 24px rgba(124, 58, 237, 0.28)',
                            '0 0 32px rgba(124, 58, 237, 0.35)',
                            '0 0 24px rgba(124, 58, 237, 0.28)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        +{xpReward} XP
                      </motion.div>
                    )}
                  </div>

                  {/* C. Creator Bar + Actions + Views */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Creator Info */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={creatorAvatar} alt={creator} />
                          <AvatarFallback 
                            className="text-white font-medium"
                            style={{ background: '#343846' }}
                          >
                            {creator.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex items-center space-x-3">
                          <span 
                            className="text-white font-semibold"
                            style={{ fontSize: '16px', fontWeight: 600 }}
                          >
                            {creator}
                          </span>
                          
                          <span 
                            className="font-medium"
                            style={{ color: '#B0B3C7', fontSize: '13px' }}
                          >
                            {actualSubscriberCount ? `${actualSubscriberCount} subscribers` : 
                             (typeof subscriberCount === 'string' && subscriberCount.includes('subscribers') ? 
                              subscriberCount : 
                              `${typeof subscriberCount === 'number' ? subscriberCount.toLocaleString() : subscriberCount} subscribers`)}
                          </span>
                          
                          {creatorLevel && (
                            <div 
                              className="px-2 py-1 rounded-md text-white text-xs font-medium"
                              style={{
                                background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                                fontSize: '12px'
                              }}
                            >
                              Level {creatorLevel}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <Button
                          onClick={handleSubscribe}
                          disabled={subscriptionStatus?.isSubscribed || subscriptionLoading}
                          className="px-4 py-2 font-semibold rounded-xl border-0 transition-all duration-200"
                          style={{
                            background: subscriptionStatus?.isSubscribed ? '#343846' : '#FF3B30',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: 600,
                            opacity: subscriptionLoading ? 0.7 : 1
                          }}
                        >
                          {subscriptionLoading ? 'Loading...' : (subscriptionStatus?.isSubscribed ? 'Subscribed' : 'Subscribe')}
                        </Button>
                        
                        <Button
                          onClick={handleFollow}
                          className="px-4 py-2 font-semibold rounded-xl border-0 transition-all duration-200"
                          style={{
                            background: '#343846',
                            color: 'rgba(255, 255, 255, 0.88)',
                            fontSize: '14px',
                            fontWeight: 600
                          }}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </Button>
                        
                        <motion.div
                          whileHover={{
                            boxShadow: '0 8px 25px rgba(124, 58, 237, 0.25)'
                          }}
                        >
                          <Button
                            onClick={handleTip}
                            className="px-4 py-2 font-semibold rounded-xl border-0 transition-all duration-200"
                            style={{
                              background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                              color: '#FFFFFF',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            Tip
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Views Count */}
                    {views && (
                      <div className="flex justify-end">
                        <span 
                          className="flex items-center"
                          style={{ color: '#B0B3C7', fontSize: '13px' }}
                        >
                          <Eye className="w-4 h-4 mr-1.5" style={{ color: '#B0B3C7' }} />
                          {typeof views === 'number' ? views.toLocaleString() : views} views
                        </span>
                      </div>
                    )}
                  </div>

                  {/* D. Tabs */}
                  <div className="mt-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <div 
                        className="inline-flex p-1.5 rounded-2xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <TabsList className="bg-transparent p-0 space-x-1">
                          {['videos', 'shorts', 'courses', 'community'].map((tab) => (
                            <TabsTrigger 
                              key={tab}
                              value={tab}
                              className="relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200"
                              style={{
                                background: activeTab === tab ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                                color: activeTab === tab ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 600
                              }}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              {activeTab === tab && (
                                <motion.div
                                  className="absolute bottom-0 left-1/2 w-8 h-0.5 rounded-full"
                                  style={{
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                                    boxShadow: '0 0 8px rgba(124, 58, 237, 0.6)',
                                    transform: 'translateX(-50%)'
                                  }}
                                  layoutId="activeTab"
                                />
                              )}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      <div className="mt-6">
                        <TabsContent value="videos">
                          <div className="text-center py-12">
                            <Play className="w-12 h-12 mx-auto mb-4" style={{ color: '#7C3AED' }} />
                            <p className="text-white text-lg font-medium">Creator's videos will appear here</p>
                            <p className="text-sm mt-2" style={{ color: '#B0B3C7' }}>Stay tuned for amazing content!</p>
                          </div>
                        </TabsContent>
                        <TabsContent value="shorts">
                          <div className="text-center py-12">
                            <Star className="w-12 h-12 mx-auto mb-4" style={{ color: '#7C3AED' }} />
                            <p className="text-white text-lg font-medium">Creator's shorts will appear here</p>
                            <p className="text-sm mt-2" style={{ color: '#B0B3C7' }}>Quick, engaging content!</p>
                          </div>
                        </TabsContent>
                        <TabsContent value="courses">
                          <div className="text-center py-12">
                            <BadgeIcon className="w-12 h-12 mx-auto mb-4" style={{ color: '#7C3AED' }} />
                            <p className="text-white text-lg font-medium">Creator's courses will appear here</p>
                            <p className="text-sm mt-2" style={{ color: '#B0B3C7' }}>Learn from the best!</p>
                          </div>
                        </TabsContent>
                        <TabsContent value="community">
                          <div className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#7C3AED' }} />
                            <p className="text-white text-lg font-medium">Creator's community posts will appear here</p>
                            <p className="text-sm mt-2" style={{ color: '#B0B3C7' }}>Join the conversation!</p>
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - 4 Columns */}
              {!isMobile && (
                <div className="col-span-4">
                  <div 
                    className="sticky rounded-2xl p-6"
                    style={{ 
                      top: '96px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid #2A2D3A'
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 
                        className="text-white font-bold"
                        style={{ fontSize: '16px', fontWeight: 700 }}
                      >
                        Up next
                      </h3>
                      <ChevronRight className="w-5 h-5" style={{ color: '#B0B3C7' }} />
                    </div>

                    <div className="space-y-4">
                      {relatedVideos.map((video, index) => (
                        <motion.div
                          key={video.id}
                          className="p-3 rounded-2xl cursor-pointer transition-all duration-200"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid #2A2D3A'
                          }}
                          whileHover={{
                            y: -2,
                            boxShadow: '0 8px 25px rgba(124, 58, 237, 0.18)'
                          }}
                        >
                          <div className="flex space-x-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-24 h-16 object-cover rounded-xl"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 
                                  className="text-white font-semibold line-clamp-2 flex-1"
                                  style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.35 }}
                                >
                                  {video.title}
                                </h4>
                                <div 
                                  className="px-2 py-1 rounded-full text-white text-xs font-semibold ml-2"
                                  style={{
                                    background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
                                    fontSize: '12px'
                                  }}
                                >
                                  +{video.xp} XP
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-1">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={video.avatar} alt={video.creator} />
                                  <AvatarFallback className="text-xs" style={{ background: '#343846' }}>
                                    {video.creator.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span 
                                  className="text-xs font-medium truncate"
                                  style={{ color: '#B0B3C7' }}
                                >
                                  {video.creator}
                                </span>
                              </div>
                              
                              <span 
                                className="text-xs"
                                style={{ color: '#B0B3C7' }}
                              >
                                {video.views} views
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Related Videos */}
              {isMobile && (
                <div className="mt-8">
                  <h3 className="text-white text-lg font-bold mb-4">Up next</h3>
                  <div className="space-y-3">
                    {relatedVideos.map((video) => (
                      <div
                        key={video.id}
                        className="p-3 rounded-2xl"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid #2A2D3A'
                        }}
                      >
                        <div className="flex space-x-3">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-medium line-clamp-2 mb-1">
                              {video.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-400">
                                {video.creator} • {video.views} views
                              </div>
                              <div className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                                +{video.xp} XP
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};