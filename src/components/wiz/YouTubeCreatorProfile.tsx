import { useState, useEffect } from 'react';
import { Heart, Share2, DollarSign, Users, VideoIcon, GraduationCap, MessageCircle, CheckCircle, Star, Play, Eye, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useYouTubeSubscription } from '@/hooks/useYouTubeSubscription';
import { youTubeAPI, YouTubeChannelInfo, YouTubeVideo } from '@/lib/youtube-api';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface YouTubeCreatorProfileProps {
  channelId: string;
  className?: string;
}

// Helper functions for fallback mock data (only used when API key is not configured)
const getChannelNameFromId = (channelId: string): string => {
  return `Creator ${channelId.slice(-8)}`;
};

const getChannelAvatarFromId = (channelId: string): string => {
  const avatars = [
    '/Profile Pics/FERA.jpg',
    '/Profile Pics/Captain Hahaa.jpg', 
    '/Profile Pics/RoyalKongz.jpg',
    '/Profile Pics/Ale.jpg'
  ];
  const hash = channelId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return avatars[hash % avatars.length];
};

const getMockSubscriberCount = (channelId: string): string => {
  return '???';
};

const getMockBannerFromId = (channelId: string): string | undefined => {
  return undefined; // Always use gradient fallback for mock data
};

export const YouTubeCreatorProfile: React.FC<YouTubeCreatorProfileProps> = ({
  channelId,
  className
}) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [channelInfo, setChannelInfo] = useState<YouTubeChannelInfo | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'shorts' | 'courses' | 'community'>('videos');
  
  // YouTube subscription hook (only if user has YouTube auth)
  const {
    subscriptionStatus,
    isLoading: subscriptionLoading,
    subscribe,
    unsubscribe,
    hasPermissions
  } = useYouTubeSubscription(user ? channelId : '');

  // Function to fetch internal videos from our database
  const fetchInternalVideos = async (creatorId: string): Promise<YouTubeVideo[]> => {
    try {
      // First try to find the creator by channel ID in creatorProfiles
      const profileQuery = query(
        collection(db, 'creatorProfiles'),
        where('youtubeData.channelId', '==', creatorId),
        limit(1)
      );
      
      const profileSnapshot = await getDocs(profileQuery);
      let actualCreatorId = creatorId;
      
      if (profileSnapshot.docs.length > 0) {
        actualCreatorId = profileSnapshot.docs[0].id; // Use the actual user ID
        console.log(`📋 Found creator profile: ${actualCreatorId} for channel: ${creatorId}`);
      }
      
      // Fetch videos from creatorVideos collection
      const videosQuery = query(
        collection(db, 'creatorVideos'),
        where('creatorId', '==', actualCreatorId),
        orderBy('addedToWiz', 'desc'),
        limit(10)
      );
      
      const videosSnapshot = await getDocs(videosQuery);
      const internalVideos = videosSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert our internal video format to YouTubeVideo format
        return {
          id: data.videoId,
          title: data.title || 'Untitled Video',
          description: data.description || '',
          thumbnailUrl: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
          publishedAt: data.publishedAt || data.addedToWiz?.toDate?.()?.toISOString() || new Date().toISOString(),
          channelId: data.channelId || creatorId,
          channelTitle: data.channelName || data.creatorName || 'Creator',
          viewCount: data.views ? parseInt(data.views.toString()) : 0,
          likeCount: data.likes || Math.floor(Math.random() * 100),
          commentCount: data.comments || Math.floor(Math.random() * 20),
          duration: data.duration || 'PT0M0S'
        } as YouTubeVideo;
      });
      
      return internalVideos;
    } catch (error) {
      console.error('❌ Error fetching internal videos:', error);
      return [];
    }
  };

  // Load channel data on mount
  useEffect(() => {
    const loadChannelData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Loading channel data for ID: ${channelId}`);

        // First try to resolve if this is actually a user ID instead of channel ID
        let actualChannelId = channelId;
        try {
          // Check if this channelId is actually a user ID in our database
          const userDoc = await getDoc(doc(db, 'users', channelId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.youtubeProfile?.channelId) {
              actualChannelId = userData.youtubeProfile.channelId;
              console.log(`🔄 Resolved user ID ${channelId} to channel ID: ${actualChannelId}`);
            }
          }
        } catch (resolveError) {
          console.log('⚠️ Could not resolve channel ID, using original:', channelId);
        }

        // Fetch real channel info using public YouTube API
        const channelData = await youTubeAPI.getPublicChannelInfo(actualChannelId);
        console.log('✅ Channel data loaded:', channelData);
        setChannelInfo(channelData);

        // Fetch real videos from the channel and internal database
        const channelVideos = await youTubeAPI.getPublicChannelVideos(actualChannelId, 10);
        console.log(`✅ Loaded ${channelVideos.length} YouTube videos for channel`);
        
        // Also fetch videos from our internal database (use original channelId for user lookup)
        const internalVideos = await fetchInternalVideos(channelId);
        console.log(`✅ Loaded ${internalVideos.length} internal videos for channel`);
        
        // Combine and deduplicate videos
        const allVideos = [...channelVideos, ...internalVideos];
        const uniqueVideos = allVideos.filter((video, index, self) => 
          index === self.findIndex(v => v.id === video.id)
        );
        
        setVideos(uniqueVideos);
        
      } catch (err) {
        console.error('❌ Error loading channel data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load channel data';
        
        // Check if it's an API key issue or invalid channel ID
        if (errorMessage.includes('API Key not configured') || errorMessage.includes('No YouTube channel found')) {
          setError(errorMessage.includes('API Key not configured') 
            ? 'YouTube API not configured. Using fallback data.' 
            : 'Loading creator profile with internal data.');
          
          // Try to get creator info from our database first
          let creatorName = getChannelNameFromId(channelId);
          let creatorAvatar = getChannelAvatarFromId(channelId);
          
          try {
            const userDoc = await getDoc(doc(db, 'users', channelId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              creatorName = userData.displayName || userData.youtubeProfile?.channelName || creatorName;
              creatorAvatar = userData.youtubeProfile?.profilePicture || creatorAvatar;
            }
            
            const creatorProfileDoc = await getDoc(doc(db, 'creatorProfiles', channelId));
            if (creatorProfileDoc.exists()) {
              const profileData = creatorProfileDoc.data();
              creatorName = profileData.wizName || profileData.youtubeData?.title || creatorName;
              creatorAvatar = profileData.youtubeData?.thumbnailUrl || creatorAvatar;
            }
          } catch (dbError) {
            console.log('Could not fetch creator data from database:', dbError);
          }
          
          // Fall back to data (real if available, mock if not)
          const fallbackChannelInfo: YouTubeChannelInfo = {
            id: channelId,
            name: creatorName,
            avatar: creatorAvatar,
            subscriberCount: getMockSubscriberCount(channelId),
            customUrl: `@${channelId.slice(-8)}`,
            description: `WIZ Magic creator profile`,
            bannerImageUrl: getMockBannerFromId(channelId),
            publishedAt: '2020-01-01T00:00:00Z'
          };
          setChannelInfo(fallbackChannelInfo);
          // Still try to load internal videos even if YouTube API fails
          const internalVideos = await fetchInternalVideos(channelId);
          setVideos(internalVideos);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      loadChannelData();
    }
  }, [channelId]);

  // Handle subscription toggle
  const handleSubscriptionToggle = async () => {
    if (!hasPermissions) {
      // Show a helpful message instead of just logging
      alert('Please connect your YouTube account first to subscribe to creators!');
      return;
    }

    try {
      if (subscriptionStatus?.isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      alert('Failed to update subscription. Please try again.');
    }
  };

  // Handle tip button click
  const handleTip = () => {
    // TODO: Implement tipping modal
    alert('💜 Tipping feature coming soon! This will open a modal to tip the creator with $USDT or fiat.');
    console.log('Tip button clicked - implement tipping modal');
  };

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="animate-pulse">
          {/* Banner skeleton */}
          <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-4" />
          
          {/* Profile section skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-300 rounded w-48" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-2">Error loading creator profile</p>
            <p className="text-sm text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!channelInfo) {
    return (
      <div className={cn("w-full", className)}>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Channel information not available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock stats for demo - in production, these would come from your backend
  const creatorStats = {
    subscribers: channelInfo.subscriberCount,
    videos: videos.length,
    wizLevel: 42, // Mock WIZ level
    verified: true // Mock verification status
  };

  const tabs = [
    { id: 'videos', label: 'Videos', icon: VideoIcon },
    { id: 'shorts', label: 'Shorts', icon: Star },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'community', label: 'Community', icon: MessageCircle }
  ];

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      {/* Hero Banner Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Banner Image */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
          {channelInfo.bannerImageUrl ? (
            <img 
              src={channelInfo.bannerImageUrl}
              alt={`${channelInfo.name} channel banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            // Fallback gradient banner
            <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500" />
          )}
          
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Desktop: Profile and actions overlay on banner */}
          {!isMobile && (
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              {/* Left: Profile info */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/20 shadow-2xl">
                  <AvatarImage src={channelInfo.avatar} alt={channelInfo.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500">
                    {channelInfo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{channelInfo.name}</h1>
                    {creatorStats.verified && (
                      <CheckCircle className="w-6 h-6 text-blue-400 fill-current" />
                    )}
                  </div>
                  
                  {/* Stats Pills */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                      <Users className="w-4 h-4" />
                      <span>{creatorStats.subscribers}</span>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                      <VideoIcon className="w-4 h-4" />
                      <span>{creatorStats.videos}</span>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                      <Star className="w-4 h-4" />
                      <span>Level {creatorStats.wizLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right: Action buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleSubscriptionToggle}
                  disabled={subscriptionLoading || !user}
                  className={cn(
                    "px-6 py-2 font-semibold transition-all duration-300",
                    subscriptionStatus?.isSubscribed
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  )}
                >
                  🔴 {subscriptionStatus?.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
                
                <Button
                  variant="outline"
                  className="px-6 py-2 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Follow
                </Button>
                
                <Button
                  onClick={handleTip}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Tip
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Profile section below banner */}
        {isMobile && (
          <div className="px-4 mb-6">
            {/* Profile info */}
            <div className="flex items-start space-x-4 mb-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg -mt-10 relative z-10">
                <AvatarImage src={channelInfo.avatar} alt={channelInfo.name} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {channelInfo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">{channelInfo.name}</h1>
                  {creatorStats.verified && (
                    <CheckCircle className="w-5 h-5 text-blue-500 fill-current" />
                  )}
                </div>
                
                {channelInfo.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {channelInfo.description}
                  </p>
                )}
              </div>
            </div>

            {/* Stats pills - scrollable on mobile */}
            <div className="flex space-x-3 mb-4 overflow-x-auto scrollbar-hide pb-2">
              <div className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-full text-sm flex-shrink-0">
                <Users className="w-4 h-4" />
                <span>{creatorStats.subscribers}</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-full text-sm flex-shrink-0">
                <VideoIcon className="w-4 h-4" />
                <span>{creatorStats.videos}</span>
              </div>
              <div className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-full text-sm flex-shrink-0">
                <Star className="w-4 h-4" />
                <span>Level {creatorStats.wizLevel}</span>
              </div>
            </div>

            {/* Action buttons - stacked vertically on mobile */}
            <div className="space-y-3">
              <Button
                onClick={handleSubscriptionToggle}
                disabled={subscriptionLoading || !user}
                className={cn(
                  "w-full font-semibold transition-all duration-300",
                  subscriptionStatus?.isSubscribed
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                🔴 {subscriptionStatus?.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Follow
                </Button>
                
                <Button
                  onClick={handleTip}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Tip
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className={cn("mb-6", isMobile ? "px-4" : "")}>
          <div className={cn(
            "flex border-b border-gray-200",
            isMobile ? "overflow-x-auto scrollbar-hide" : "justify-start"
          )}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 font-medium transition-all duration-200 relative",
                    isMobile ? "flex-shrink-0 text-sm" : "text-base",
                    activeTab === tab.id
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  
                  {/* Active tab gradient underline */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                      layoutId="activeTab"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Display */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(isMobile ? "px-4" : "")}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'videos' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="relative aspect-video bg-gray-200">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                          {video.duration}
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded font-semibold">
                          +{Math.floor(Math.random() * 50 + 10)} XP
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{video.title}</h3>
                        <p className="text-xs text-gray-600">{video.views} views • {video.publishedAt}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <VideoIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No videos available</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'shorts' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Shorts content will be displayed here</p>
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Courses content will be displayed here</p>
              </motion.div>
            )}

            {activeTab === 'community' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Community content will be displayed here</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};