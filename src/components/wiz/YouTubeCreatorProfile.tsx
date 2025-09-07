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
import { TipButton } from './creator/components/TipButton';

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
        {/* Premium Banner with Animated Shimmer */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-2xl overflow-hidden mb-4">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-90">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          {channelInfo.bannerImageUrl && (
            <img 
              src={channelInfo.bannerImageUrl}
              alt={`${channelInfo.name} channel banner`}
              className="w-full h-full object-cover mix-blend-overlay"
            />
          )}
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                animate={{
                  y: ['100%', '-10%'],
                  x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: Math.random() * 3 + 4,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
                style={{
                  left: Math.random() * 100 + '%',
                  top: '100%'
                }}
              />
            ))}
          </div>
          
          {/* Desktop: Profile and actions overlay on banner */}
          {!isMobile && (
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
              {/* Left: Profile info */}
              <div className="flex items-center space-x-4">
                {/* Avatar with XP-based glow ring */}
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.4)',
                        '0 0 40px rgba(236, 72, 153, 0.6)',
                        '0 0 20px rgba(168, 85, 247, 0.4)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <Avatar className="relative w-20 h-20 md:w-24 md:h-24 border-4 border-white/30 shadow-2xl backdrop-blur-sm">
                    <AvatarImage src={channelInfo.avatar} alt={channelInfo.name} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500">
                      {channelInfo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* XP Level Badge */}
                  <motion.div
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                    animate={{
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {creatorStats.wizLevel}
                  </motion.div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{channelInfo.name}</h1>
                    {creatorStats.verified && (
                      <CheckCircle className="w-6 h-6 text-blue-400 fill-current" />
                    )}
                  </div>
                  
                  {/* Enhanced Stats Pills */}
                  <div className="flex items-center gap-3 mt-3">
                    <motion.div 
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-full text-sm font-semibold shadow-lg border border-white/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Users className="w-4 h-4 text-blue-300" />
                      <span>{creatorStats.subscribers}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md rounded-full text-sm font-semibold shadow-lg border border-white/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <VideoIcon className="w-4 h-4 text-green-300" />
                      <span>{creatorStats.videos} videos</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 backdrop-blur-md rounded-full text-sm font-bold shadow-lg border border-yellow-300/30"
                      whileHover={{ scale: 1.05 }}
                      animate={{
                        boxShadow: [
                          '0 4px 20px rgba(251, 191, 36, 0.3)',
                          '0 6px 30px rgba(251, 191, 36, 0.5)',
                          '0 4px 20px rgba(251, 191, 36, 0.3)'
                        ]
                      }}
                      transition={{ 
                        scale: { type: "spring", stiffness: 300 },
                        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Star className="w-4 h-4 text-yellow-200" />
                      <span>Lv. {creatorStats.wizLevel}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Right: Enhanced Action buttons */}
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSubscriptionToggle}
                    disabled={subscriptionLoading || !user}
                    className={cn(
                      "px-6 py-3 font-bold text-sm transition-all duration-300 backdrop-blur-md border shadow-lg",
                      subscriptionStatus?.isSubscribed
                        ? "bg-gradient-to-r from-gray-600/90 to-gray-700/90 hover:from-gray-700 hover:to-gray-800 text-white border-gray-500/30"
                        : "bg-gradient-to-r from-red-600/90 to-red-700/90 hover:from-red-700 hover:to-red-800 text-white border-red-500/30"
                    )}
                  >
                    🔴 {subscriptionStatus?.isSubscribed ? 'Subscribed' : 'Subscribe'}
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="px-6 py-3 bg-white/15 border-2 border-white/30 text-white hover:bg-white/25 backdrop-blur-md font-semibold shadow-lg transition-all duration-300"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                </motion.div>
                
                <TipButton
                  creatorId={channelId}
                  creatorName={channelInfo.name}
                  creatorAvatar={channelInfo.avatar}
                  size="md"
                  variant="default"
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Premium Profile section below banner */}
        {isMobile && (
          <div className="px-6 mb-8">
            {/* Profile info with enhanced premium styling */}
            <div className="flex items-start space-x-5 mb-6">
              {/* Enhanced Mobile Avatar with premium glow ring */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-orange-500/40 blur-lg"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                      '0 0 40px rgba(236, 72, 153, 0.7)',
                      '0 0 60px rgba(251, 146, 60, 0.5)',
                      '0 0 20px rgba(168, 85, 247, 0.5)'
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <Avatar className="relative w-24 h-24 border-4 border-white/40 shadow-2xl -mt-12 z-10 backdrop-blur-sm">
                  <AvatarImage src={channelInfo.avatar} alt={channelInfo.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {channelInfo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Enhanced XP Level Badge with pulsing effect */}
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-xl z-20 border-2 border-white/50"
                  animate={{
                    scale: [1, 1.15, 1],
                    boxShadow: [
                      '0 4px 20px rgba(251, 191, 36, 0.4)',
                      '0 6px 30px rgba(251, 191, 36, 0.8)',
                      '0 4px 20px rgba(251, 191, 36, 0.4)'
                    ]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {creatorStats.wizLevel}
                </motion.div>
              </div>
              
              <div className="flex-1 pt-3">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{channelInfo.name}</h1>
                  {creatorStats.verified && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-6 h-6 text-blue-500 fill-current" />
                    </motion.div>
                  )}
                </div>
                
                {channelInfo.description && (
                  <p className="text-base text-gray-600 line-clamp-3 mb-3 leading-relaxed">
                    {channelInfo.description}
                  </p>
                )}
              </div>
            </div>

            {/* Enhanced Stats pills - scrollable on mobile */}
            <div className="flex space-x-3 mb-4 overflow-x-auto scrollbar-hide pb-2">
              <motion.div 
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full text-sm font-semibold flex-shrink-0 shadow-lg border border-blue-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-gray-800">{creatorStats.subscribers}</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-sm font-semibold flex-shrink-0 shadow-lg border border-green-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <VideoIcon className="w-4 h-4 text-green-600" />
                <span className="text-gray-800">{creatorStats.videos} videos</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full text-sm font-bold flex-shrink-0 shadow-lg border border-yellow-300"
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 4px 15px rgba(251, 191, 36, 0.3)',
                    '0 6px 25px rgba(251, 191, 36, 0.5)',
                    '0 4px 15px rgba(251, 191, 36, 0.3)'
                  ]
                }}
                transition={{ 
                  scale: { type: "spring", stiffness: 300 },
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Star className="w-4 h-4 text-yellow-700" />
                <span className="text-gray-800">Lv. {creatorStats.wizLevel}</span>
              </motion.div>
            </div>

            {/* Action buttons - stacked vertically with Tip as primary CTA */}
            <div className="space-y-3">
              {/* Primary: Tip Button (Hero CTA) */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <TipButton
                  creatorId={channelId}
                  creatorName={channelInfo.name}
                  creatorAvatar={channelInfo.avatar}
                  size="lg"
                  variant="default"
                  className="w-full h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                />
                {/* Enhanced glow effect for tip button */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-2xl blur-xl opacity-70 -z-10" />
              </motion.div>
              
              {/* Secondary: Subscribe Button (Strong CTA) */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  onClick={handleSubscriptionToggle}
                  disabled={subscriptionLoading || !user}
                  className={cn(
                    "w-full h-12 font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl",
                    subscriptionStatus?.isSubscribed
                      ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
                  )}
                >
                  🔴 {subscriptionStatus?.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              </motion.div>
              
              {/* Tertiary: Follow Button (Neutral) */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full h-12 bg-white/80 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold text-base transition-all duration-300 backdrop-blur-sm"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Follow
                </Button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Enhanced Segmented Control Tabs */}
        <div className={cn("mb-8", isMobile ? "px-4" : "")}>
          <div className={cn(
            "relative bg-gray-100/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50",
            isMobile ? "overflow-x-auto scrollbar-hide" : "inline-flex"
          )}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "relative flex items-center space-x-2 px-4 py-3 font-semibold transition-all duration-300 rounded-xl z-10",
                    isMobile ? "flex-shrink-0 text-sm min-w-[100px]" : "text-sm min-w-[120px]",
                    activeTab === tab.id
                      ? "text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-colors duration-300",
                    activeTab === tab.id ? "text-white" : "text-gray-500"
                  )} />
                  <span>{tab.label}</span>
                  
                  {/* Active tab background */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg"
                      layoutId="activeTabBg"
                      transition={{ 
                        type: "spring", 
                        bounce: 0.15, 
                        duration: 0.6 
                      }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  
                  {/* Hover glow effect */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-xl opacity-20 blur-xl"
                      animate={{
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ zIndex: -2 }}
                    />
                  )}
                </motion.button>
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
                  videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/70 backdrop-blur-sm border border-white/50 group">
                        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          <motion.img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            whileHover={{ scale: 1.1 }}
                          />
                          
                          {/* Gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Duration badge */}
                          <motion.div 
                            className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded-md font-medium backdrop-blur-sm"
                            whileHover={{ scale: 1.1 }}
                          >
                            {video.duration}
                          </motion.div>
                          
                          {/* XP badge */}
                          <motion.div 
                            className="absolute top-2 left-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full font-bold shadow-lg"
                            animate={{
                              boxShadow: [
                                '0 4px 15px rgba(147, 51, 234, 0.3)',
                                '0 6px 25px rgba(147, 51, 234, 0.5)',
                                '0 4px 15px rgba(147, 51, 234, 0.3)'
                              ]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            +{Math.floor(Math.random() * 50 + 10)} XP
                          </motion.div>
                          
                          {/* Play button overlay on hover */}
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            whileHover={{ scale: 1.1 }}
                          >
                            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
                              <Play className="w-6 h-6 text-purple-600 ml-1" />
                            </div>
                          </motion.div>
                        </div>
                        
                        <CardContent className="p-4 relative">
                          <h3 className="font-bold text-sm line-clamp-2 mb-2 text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                            {video.title}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{video.views} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{video.publishedAt}</span>
                            </div>
                          </div>
                          
                          {/* Premium glow effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </CardContent>
                      </Card>
                    </motion.div>
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