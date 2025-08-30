import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Check, Play, Eye, Plus, Minus, ChevronDown, Sparkles, Trophy, ExternalLink, BookOpen, Upload, Rocket, Video, FileText, Settings, Link, ArrowUp, ArrowDown, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreatorService, CreatorVideo } from '@/lib/creator-service';
import { youTubeAPI, YouTubeChannelInfo, YouTubeVideo } from '@/lib/youtube-api';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  publishedAt: string;
  description?: string;
}

interface SelectedVideo extends Video {
  category: string;
}

type ChannelInfo = YouTubeChannelInfo;

const categories = [
  { value: 'gaming', label: 'Gaming' },
  { value: 'ai', label: 'AI' },
  { value: 'tech', label: 'Tech' },
  { value: 'music', label: 'Music' },
  { value: 'health', label: 'Health' },
  { value: 'money', label: 'Money' },
  { value: 'podcast', label: 'Podcasts' },
];

export const WizCreatePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([]);

  // Course creation state
  const [courseStep, setCourseStep] = useState(1);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    videoUrl: '',
    videoType: 'upload', // 'upload' or 'youtube'
    duration: '',
    description: ''
  });
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    coverImage: '',
    isPaid: false,
    price: 0,
    xpReward: 100,
    lessons: [] as Array<{
      id: string;
      title: string;
      videoUrl: string;
      videoType: 'upload' | 'youtube';
      duration: string;
      description: string;
      thumbnail?: string;
    }>
  });

  const stepTitles = [
    { number: 1, title: 'Connect', subtitle: 'YouTube Channel' },
    { number: 2, title: 'Select', subtitle: 'Your Videos' },
    { number: 3, title: 'Publish', subtitle: 'To WIZ' }
  ];

  // Real YouTube OAuth connection
  const handleConnectYouTube = async () => {
    setIsConnecting(true);

    try {
      // Initiate OAuth flow using Google Identity Services
      const tokenResponse = await youTubeAPI.initiateOAuth();
      
      // Get channel information
      const channelInfo = await youTubeAPI.getChannelInfo();
      
      // Save tokens to database
      if (user?.uid) {
        await CreatorService.saveCreatorTokens(
          user.uid, 
          tokenResponse.access_token, 
          undefined, // no refresh token with implicit flow
          tokenResponse.expires_in
        );
      }
      
      setChannelInfo(channelInfo);
      setIsConnecting(false);
      
      toast({
        title: "🎉 Connected Successfully!",
        description: `Connected to ${channelInfo.name}!`,
        duration: 3000,
      });

      setTimeout(() => {
        setCurrentStep(2);
        loadVideos();
      }, 1500);
      
    } catch (error) {
      console.error('YouTube connection error:', error);
      setIsConnecting(false);
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to YouTube. Please try again.",
        duration: 5000,
      });
    }
  };

  // Real video loading from YouTube API
  const loadVideos = async () => {
    setIsLoadingVideos(true);

    try {
      if (!youTubeAPI.isAuthenticated()) {
        throw new Error('Not authenticated with YouTube');
      }

      const youtubeVideos = await youTubeAPI.getRecentVideos(20);
      
      // Convert YouTube videos to our Video interface
      const convertedVideos: Video[] = youtubeVideos.map((ytVideo: YouTubeVideo) => ({
        id: ytVideo.id,
        title: ytVideo.title,
        thumbnail: ytVideo.thumbnail,
        duration: ytVideo.duration,
        views: ytVideo.views,
        publishedAt: ytVideo.publishedAt,
        description: ytVideo.description
      }));

      setVideos(convertedVideos);
      setIsLoadingVideos(false);
      
      toast({
        title: "Videos Loaded!",
        description: `Found ${convertedVideos.length} videos from your channel.`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Error loading videos:', error);
      setIsLoadingVideos(false);
      
      toast({
        title: "Failed to Load Videos",
        description: error instanceof Error ? error.message : "Could not load videos from your channel.",
        duration: 5000,
      });
      
      // Don't set fallback videos - let user retry the connection
      setVideos([]);
    }
  };

  const toggleVideoSelection = (video: Video) => {
    const isSelected = selectedVideos.some(v => v.id === video.id);
    
    if (isSelected) {
      setSelectedVideos(prev => prev.filter(v => v.id !== video.id));
    } else {
      // Auto-detect category based on title/description
      const autoCategory = detectCategory(video.title + ' ' + (video.description || ''));
      
      const selectedVideo: SelectedVideo = {
        ...video,
        category: autoCategory
      };
      
      setSelectedVideos(prev => [...prev, selectedVideo]);
    }
  };

  const detectCategory = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('react') || lowerText.includes('web') || lowerText.includes('javascript') || lowerText.includes('development')) return 'tech';
    if (lowerText.includes('ai') || lowerText.includes('machine learning') || lowerText.includes('artificial intelligence')) return 'ai';
    if (lowerText.includes('game') || lowerText.includes('gaming')) return 'gaming';
    if (lowerText.includes('music') || lowerText.includes('audio') || lowerText.includes('sound')) return 'music';
    if (lowerText.includes('health') || lowerText.includes('fitness') || lowerText.includes('workout')) return 'health';
    if (lowerText.includes('money') || lowerText.includes('finance') || lowerText.includes('crypto')) return 'money';
    if (lowerText.includes('podcast') || lowerText.includes('talk')) return 'podcast';
    
    return 'tech'; // default
  };

  const updateVideoCategory = (videoId: string, category: string) => {
    setSelectedVideos(prev => 
      prev.map(video => 
        video.id === videoId ? { ...video, category } : video
      )
    );
  };

  const proceedToCategorize = () => {
    if (selectedVideos.length === 0) {
      toast({
        title: "No Videos Selected",
        description: "Please select at least one video to continue.",
        duration: 3000,
      });
      return;
    }
    setCurrentStep(3);
  };

  const publishToWiz = async () => {
    if (!user?.uid || !channelInfo) return;

    setIsPublishing(true);

    try {
      console.log('🚀 Starting video publishing process...');
      console.log('📊 Selected videos:', selectedVideos.length);
      console.log('👤 User ID:', user.uid);
      console.log('📺 Channel Info:', channelInfo);

      // Save videos to database using CreatorService
      const creatorVideos: Omit<CreatorVideo, 'addedToWiz' | 'lastUpdated'>[] = selectedVideos.map(video => ({
        id: video.id,
        videoId: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        duration: video.duration,
        publishedAt: video.publishedAt,
        views: video.views,
        categoryTags: [video.category],
        creatorId: user.uid,
        channelId: channelInfo.id,
        status: 'active' as const,
        isFeatured: true,
        originalYouTubeUrl: `https://www.youtube.com/watch?v=${video.id}`
      }));

      console.log('📝 Prepared creator videos for publishing:', creatorVideos);

      // First, ensure creator profile is saved so videos can get proper creator info
      console.log('👤 Saving/updating creator profile...');
      console.log('📊 Channel Info Data:', channelInfo);
      
      // Validate and sanitize channel info with deep inspection
      console.log('🔍 Deep inspection of channelInfo:');
      console.log('channelInfo keys:', channelInfo ? Object.keys(channelInfo) : 'channelInfo is null/undefined');
      console.log('channelInfo.id type:', typeof channelInfo?.id, 'value:', channelInfo?.id);
      console.log('channelInfo.name type:', typeof channelInfo?.name, 'value:', channelInfo?.name);
      console.log('channelInfo.avatar type:', typeof channelInfo?.avatar, 'value:', channelInfo?.avatar);
      console.log('channelInfo.subscriberCount type:', typeof channelInfo?.subscriberCount, 'value:', channelInfo?.subscriberCount);
      
      const safeChannelInfo = {
        id: channelInfo?.id || `channel_${user.uid}`,
        name: channelInfo?.name || user.displayName || 'Unknown Creator',
        avatar: channelInfo?.avatar || user.photoURL || '',
        subscriberCount: channelInfo?.subscriberCount || '0'
      };
      
      console.log('✅ Sanitized Channel Info:', safeChannelInfo);
      console.log('🔍 selectedVideos[0] category:', selectedVideos[0]?.category);
      
      const existingProfile = await CreatorService.getCreatorProfile(user.uid);
      
      try {
        if (!existingProfile) {
          const profileData = {
            userId: user.uid,
            channelId: safeChannelInfo.id,
            channelName: safeChannelInfo.name,
            channelAvatar: safeChannelInfo.avatar,
            subscriberCount: safeChannelInfo.subscriberCount,
            primaryCategory: selectedVideos[0]?.category || 'tech',
            onboardingComplete: true,
            totalVideos: selectedVideos.length
          };
          
          console.log('🔍 Profile data to save (new profile):', profileData);
          await CreatorService.saveCreatorProfile(profileData);
          console.log('✅ Creator profile created');
        } else {
          const updateData = {
            ...existingProfile,
            channelName: safeChannelInfo.name,
            channelAvatar: safeChannelInfo.avatar,
            subscriberCount: safeChannelInfo.subscriberCount,
            totalVideos: (existingProfile.totalVideos || 0) + selectedVideos.length
          };
          
          console.log('🔍 Profile data to save (update):', updateData);
          await CreatorService.saveCreatorProfile(updateData);
          console.log('✅ Creator profile updated');
        }
      } catch (profileError) {
        console.error('❌ Failed to save creator profile, trying minimal fallback:', profileError);
        
        // Fallback: try to save minimal profile data
        try {
          const minimalProfile = {
            userId: user.uid,
            channelId: user.uid, // Use user ID as channel ID fallback
            channelName: user.displayName || 'Creator',
            primaryCategory: 'tech',
            onboardingComplete: true,
            totalVideos: selectedVideos.length
          };
          
          console.log('🔄 Attempting minimal profile save:', minimalProfile);
          await CreatorService.saveCreatorProfile(minimalProfile);
          console.log('✅ Minimal creator profile saved');
        } catch (fallbackError) {
          console.error('❌ Even minimal profile save failed:', fallbackError);
          // Continue anyway - we can still try to publish videos
        }
      }

      // Now publish videos to Discover - they'll get proper creator info from the profile
      console.log('⏳ Publishing videos to Discover feed...');
      await CreatorService.publishVideosToDiscover(creatorVideos);
      console.log('✅ Videos successfully published to Discover!');

      setCurrentStep(4); // Success screen

      toast({
        title: "🚀 Videos Published!",
        description: `${selectedVideos.length} videos are now live on WIZ Discover!`,
        duration: 5000,
      });

    } catch (error) {
      console.error('Error publishing videos:', error);
      toast({
        title: "Error",
        description: "Failed to publish videos. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 50% 20%, rgba(230, 230, 250, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, rgba(246, 240, 255, 0.4) 0%, rgba(255, 255, 255, 0.95) 100%)
          `
        }}
      />

      <div className={`max-w-7xl mx-auto space-y-12 ${
        isMobile ? 'px-4 py-8' : 'px-6 py-12'
      }`}>
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 
            className={`font-bold ${
              isMobile ? 'text-4xl' : 'text-5xl md:text-6xl'
            }`}
            style={{
              background: 'linear-gradient(135deg, #e879f9 0%, #a855f7 30%, #6366f1 70%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))'
            }}
          >
            Create on WIZ
          </h1>
          <p className={`text-gray-600 max-w-3xl mx-auto ${
            isMobile ? 'text-lg px-2' : 'text-xl'
          }`}>
            Connect your channel, select videos, and share them with the WIZ community.
          </p>
        </motion.div>

        {/* Step Progress Indicator */}
        <motion.div 
          className={`flex justify-center items-center mb-8 ${
            isMobile ? 'mb-6 px-4' : 'space-x-8 mb-16'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {isMobile ? (
            // Mobile: Horizontal scrollable stepper
            <div className="w-full overflow-x-auto scrollbar-hide">
              <div className="flex items-center space-x-4 min-w-max px-2 py-4">
                {stepTitles.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                          currentStep >= step.number
                            ? 'bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white border-wiz-primary'
                            : currentStep === step.number
                            ? 'border-wiz-primary text-wiz-primary bg-white'
                            : 'border-gray-300 text-gray-400 bg-gray-50'
                        }`}
                        animate={{
                          scale: currentStep === step.number ? 1.1 : 1,
                          boxShadow: currentStep === step.number ? '0 0 15px rgba(168, 85, 247, 0.4)' : '0 0 0px rgba(0,0,0,0)'
                        }}
                      >
                        {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                      </motion.div>
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                        <div className="text-xs text-gray-500">{step.subtitle}</div>
                      </div>
                    </div>
                    {index < stepTitles.length - 1 && (
                      <div className={`w-8 h-0.5 mx-3 transition-all duration-300 ${
                        currentStep > step.number ? 'bg-wiz-primary' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Desktop: Original vertical layout
            stepTitles.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center space-y-2">
                  <motion.div
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white border-wiz-primary'
                        : currentStep === step.number
                        ? 'border-wiz-primary text-wiz-primary bg-white'
                        : 'border-gray-300 text-gray-400 bg-gray-50'
                    }`}
                    animate={{
                      scale: currentStep === step.number ? 1.1 : 1,
                      boxShadow: currentStep === step.number ? '0 0 20px rgba(168, 85, 247, 0.4)' : '0 0 0px rgba(0,0,0,0)'
                    }}
                  >
                    {currentStep > step.number ? <Check className="w-6 h-6" /> : step.number}
                  </motion.div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{step.title}</div>
                    <div className="text-sm text-gray-500">{step.subtitle}</div>
                  </div>
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.number ? 'bg-wiz-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))
          )}
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Connect YouTube */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`max-w-2xl mx-auto ${
                isMobile ? 'flex items-center justify-center min-h-[60vh] px-4' : ''
              }`}
            >
              <Card className="overflow-hidden border-0 shadow-2xl w-full">
                <CardContent 
                  className={`text-center space-y-8 ${
                    isMobile ? 'p-6' : 'p-12'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: isMobile ? '20px' : '24px'
                  }}
                >
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Youtube className={`mx-auto text-red-500 ${
                        isMobile ? 'w-24 h-24' : 'w-32 h-32'
                      }`} />
                    </motion.div>
                    <motion.div
                      className="absolute -top-4 -right-4 w-8 h-8 bg-wiz-primary rounded-full flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <h2 className={`font-bold ${
                      isMobile ? 'text-2xl' : 'text-3xl'
                    }`}>Connect your YouTube channel to start creating on WIZ.</h2>
                    <p className={`text-gray-600 leading-relaxed ${
                      isMobile ? 'text-base' : 'text-lg'
                    }`}>
                      We'll securely connect to your YouTube channel using Google's authentication. Your credentials are never stored by WIZ.
                    </p>
                    {!import.meta.env.VITE_YOUTUBE_CLIENT_ID && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          ⚠️ YouTube API not configured. Please set VITE_YOUTUBE_CLIENT_ID in your environment variables to enable real YouTube connections.
                        </p>
                      </div>
                    )}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className={`font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${
                        isMobile 
                          ? 'w-full h-16 px-8 text-lg' 
                          : 'h-20 px-16 text-xl'
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, #FF0000 0%, #8B5CF6 100%)',
                        borderRadius: isMobile ? '16px' : '20px',
                        boxShadow: '0 8px 32px rgba(255, 0, 0, 0.3)'
                      }}
                      onClick={handleConnectYouTube}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Youtube className="w-6 h-6" />
                          <span>Connect YouTube Channel</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  {channelInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-green-800">{channelInfo.name}</h3>
                          <p className="text-green-600">{channelInfo.subscriberCount} subscribers</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Videos */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Select Videos to Feature</h2>
                <p className="text-gray-600 text-lg">
                  Choose the videos you'd like to share with the WIZ community.
                </p>
                <div className="mt-4">
                  <Badge variant="outline" className="text-sm px-4 py-2">
                    {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''} selected
                  </Badge>
                </div>
              </div>

              {isLoadingVideos ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-wiz-primary mx-auto mb-6"></div>
                  <p className="text-gray-600 text-lg">Loading your videos...</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  isMobile 
                    ? 'grid-cols-1' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {videos.map((video, index) => {
                    const isSelected = selectedVideos.some(v => v.id === video.id);
                    
                    return (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <Card 
                          className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden ${
                            isSelected 
                              ? 'border-wiz-primary shadow-2xl ring-4 ring-wiz-primary/20' 
                              : 'border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                          }`}
                          style={{ borderRadius: '20px' }}
                          onClick={() => toggleVideoSelection(video)}
                        >
                          <CardContent className="p-0">
                            <div className="relative">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className={`w-full object-cover ${
                                  isMobile ? 'h-44' : 'h-48'
                                }`}
                              />
                              
                              {/* Selection Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isSelected 
                                    ? 'bg-wiz-primary text-white scale-110' 
                                    : 'bg-white/90 text-gray-800 hover:scale-110'
                                }`}>
                                  {isSelected ? <Minus className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                                </div>
                              </div>

                              {/* Duration */}
                              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {video.duration}
                              </div>

                              {/* Selection Badge */}
                              {isSelected && (
                                <div className="absolute top-3 right-3">
                                  <div className="w-8 h-8 bg-wiz-primary rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4 space-y-3">
                              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                                {video.title}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{video.views} views</span>
                                </div>
                                <span>{video.publishedAt}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="text-center">
                <Button
                  size="lg"
                  className={`font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isMobile 
                      ? 'w-full px-8 py-3 text-base' 
                      : 'px-12 py-3'
                  }`}
                  onClick={proceedToCategorize}
                  disabled={selectedVideos.length === 0}
                >
                  Continue to Categorize ({selectedVideos.length})
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Categorize & Publish */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Categorize & Publish</h2>
                <p className="text-gray-600 text-lg">
                  Assign categories to your videos and publish them to WIZ Discover.
                </p>
              </div>

              <div className="space-y-6 max-w-4xl mx-auto">
                {selectedVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center space-x-6">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{video.views} views</span>
                            <span>{video.duration}</span>
                            <span>{video.publishedAt}</span>
                          </div>
                        </div>
                        <div className="w-48">
                          <Select
                            value={video.category}
                            onValueChange={(value) => updateVideoCategory(video.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Ready to publish {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''} to WIZ Discover
                </p>
                <Button
                  size="lg"
                  className={`font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isMobile 
                      ? 'w-full px-8 py-4 text-lg' 
                      : 'px-16 py-4 text-xl'
                  }`}
                  onClick={publishToWiz}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Publishing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Sparkles className="w-6 h-6" />
                      <span>Publish to WIZ</span>
                    </div>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              {/* Success Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className={`mx-auto relative ${
                  isMobile ? 'w-32 h-32' : 'w-40 h-40'
                }`}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Trophy className={`text-white ${
                      isMobile ? 'w-16 h-16' : 'w-20 h-20'
                    }`} />
                  </motion.div>
                  
                  {/* Sparkles */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                      style={{
                        left: `${50 + 60 * Math.cos((i * 30) * Math.PI / 180)}%`,
                        top: `${50 + 60 * Math.sin((i * 30) * Math.PI / 180)}%`,
                      }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <h1 className={`font-bold ${
                  isMobile ? 'text-3xl' : 'text-5xl'
                }`}>
                  🎉 You're Live on WIZ!
                </h1>
                <p className={`text-gray-600 max-w-3xl mx-auto ${
                  isMobile ? 'text-lg px-4' : 'text-2xl'
                }`}>
                  Your videos are now featured in Discover. Viewers can watch and earn XP immediately.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`grid grid-cols-3 max-w-lg mx-auto ${
                  isMobile ? 'gap-4 px-4' : 'gap-8'
                }`}
              >
                <div className="text-center">
                  <div className={`font-bold text-wiz-primary ${
                    isMobile ? 'text-3xl' : 'text-4xl'
                  }`}>{selectedVideos.length}</div>
                  <div className={`text-gray-600 ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>Videos Live</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold text-wiz-primary ${
                    isMobile ? 'text-3xl' : 'text-4xl'
                  }`}>
                    {new Set(selectedVideos.map(v => v.category)).size}
                  </div>
                  <div className={`text-gray-600 ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>Categories</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold text-wiz-primary ${
                    isMobile ? 'text-3xl' : 'text-4xl'
                  }`}>∞</div>
                  <div className={`text-gray-600 ${
                    isMobile ? 'text-sm' : 'text-base'
                  }`}>Potential XP</div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`flex gap-4 justify-center ${
                  isMobile ? 'flex-col px-4' : 'flex-col sm:flex-row'
                }`}
              >
                <Button
                  size="lg"
                  className={`font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isMobile ? 'w-full px-8 py-3' : 'px-8 py-3'
                  }`}
                  onClick={() => {
                    // Navigate to creator profile to view published videos
                    if (channelInfo) {
                      toast({
                        title: "Creator Profile",
                        description: `Your ${selectedVideos.length} videos are now live on WIZ! Check the Discover page to see them.`,
                        duration: 5000,
                      });
                    }
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  View My Videos
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className={`font-bold border-2 border-wiz-primary text-wiz-primary hover:bg-wiz-primary hover:text-white transition-all duration-300 ${
                    isMobile ? 'w-full px-8 py-3' : 'px-8 py-3'
                  }`}
                  onClick={() => {
                    // Navigate to Discover page to see published videos
                    window.location.hash = 'discover';
                    window.location.reload();
                  }}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Go to Discover
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course Creation Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className={`mt-16 ${
            isMobile ? 'px-4' : 'max-w-2xl mx-auto'
          }`}
        >
          {/* Course Creation Card - Matching YouTube Card Styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent 
                className={`text-center space-y-8 ${
                  isMobile ? 'p-6' : 'p-12'
                }`}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: isMobile ? '20px' : '24px'
                }}
              >
                {/* Header Section */}
                <div className="space-y-6">
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <div className={`mx-auto relative ${
                        isMobile ? 'w-24 h-24' : 'w-32 h-32'
                      }`}>
                        <div 
                          className="w-full h-full rounded-full flex items-center justify-center shadow-2xl border border-white/20"
                          style={{
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                          }}
                        >
                          <span className={`${isMobile ? 'text-4xl' : 'text-6xl'}`}>🎓</span>
                        </div>
                      </div>
                    </motion.div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <h2 className={`font-bold ${
                      isMobile ? 'text-2xl' : 'text-3xl'
                    }`}>Create a Course on WIZ</h2>
                    <p className={`text-gray-600 leading-relaxed ${
                      isMobile ? 'text-base' : 'text-lg'
                    }`}>
                      Structure your content into courses, reward students with XP, and build a learning community.
                    </p>
                  </div>
                </div>
                {/* Sleek Pill-Shaped Progress Tracker */}
                <div className="mb-8">
                  <div 
                    className="flex bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-white/20 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
                    }}
                  >
                    {[
                      { number: 1, title: 'Course Details', icon: BookOpen },
                      { number: 2, title: 'Lessons', icon: Video },
                      { number: 3, title: 'Publish', icon: Rocket }
                    ].map((step) => (
                      <motion.button
                        key={step.number}
                        onClick={() => {
                          if (step.number < courseStep || 
                              (step.number === 2 && courseData.title && courseData.category) ||
                              (step.number === 3 && courseData.lessons.length > 0)) {
                            setCourseStep(step.number);
                          }
                        }}
                        className={cn(
                          "flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-full font-medium transition-all duration-300",
                          isMobile ? "text-xs" : "text-sm",
                          courseStep === step.number
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                            : courseStep > step.number
                            ? 'text-amber-600 hover:bg-amber-50/50'
                            : 'text-gray-500 hover:bg-gray-50/50'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{
                          boxShadow: courseStep === step.number ? '0 4px 16px rgba(245, 158, 11, 0.3)' : '0 0 0px rgba(0,0,0,0)'
                        }}
                      >
                        <step.icon className="w-4 h-4" />
                        {!isMobile && <span>{step.title}</span>}
                        {courseStep > step.number && <Check className="w-4 h-4" />}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Step Title - Below Progress Tracker */}
                  <div className="mt-6 text-center">
                    <div className={`font-semibold text-gray-800 ${
                      isMobile ? 'text-lg' : 'text-xl'
                    }`}>
                      {courseStep === 1 ? 'Course Details' : 
                       courseStep === 2 ? 'Structure Your Lessons' : 
                       'Publish Your Course'}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {courseStep === 1 ? 'Set up your course information and category' : 
                       courseStep === 2 ? 'Add videos and organize your curriculum' : 
                       'Review and publish your course to WIZ Learn'}
                    </p>
                  </div>
                </div>

                {/* Course Creation Steps */}
                <AnimatePresence mode="wait">
                  {/* Step 1: Course Details */}
                  {courseStep === 1 && (
                    <motion.div
                      key="course-step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center space-y-4">
                        <h3 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                          📘 Course Details
                        </h3>
                        <p className="text-gray-600">
                          Set up your course information and choose your category
                        </p>
                      </div>

                      <div className="grid gap-6 max-w-2xl mx-auto">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Course Title</label>
                          <input
                            type="text"
                            placeholder="e.g., Complete React Development Course"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                            value={courseData.title}
                            onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            placeholder="Describe what students will learn in your course..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                            value={courseData.description}
                            onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>

                        <div className={cn(
                          "grid gap-4",
                          isMobile ? "grid-cols-1" : "grid-cols-2"
                        )}>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Category</label>
                            <Select
                              value={courseData.category}
                              onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger className={cn(
                                "w-full px-4 py-3",
                                isMobile ? "text-base" : "text-sm"
                              )}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">XP Reward</label>
                            <input
                              type="number"
                              min="50"
                              max="500"
                              step="25"
                              placeholder="100"
                              className={cn(
                                "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all",
                                isMobile ? "text-base" : "text-sm"
                              )}
                              value={courseData.xpReward || ''}
                              onChange={(e) => setCourseData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 100 }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">Course Access</label>
                          <div className={cn(
                            "flex",
                            isMobile ? "flex-col space-y-3" : "flex-row space-x-4"
                          )}>
                            <button
                              type="button"
                              onClick={() => setCourseData(prev => ({ ...prev, isPaid: false }))}
                              className={cn(
                                "flex-1 px-4 py-4 rounded-lg border-2 transition-all font-medium",
                                isMobile ? "min-h-[60px]" : "",
                                !courseData.isPaid 
                                  ? 'border-green-500 bg-green-50 text-green-700' 
                                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
                              )}
                            >
                              <div className="text-center">
                                <div className={cn(
                                  "font-semibold",
                                  isMobile ? "text-base" : "text-sm"
                                )}>Free</div>
                                <div className={cn(
                                  "text-xs",
                                  isMobile ? "text-sm" : ""
                                )}>Open to all students</div>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCourseData(prev => ({ ...prev, isPaid: true }))}
                              className={cn(
                                "flex-1 px-4 py-4 rounded-lg border-2 transition-all font-medium",
                                isMobile ? "min-h-[60px]" : "",
                                courseData.isPaid 
                                  ? 'border-amber-500 bg-amber-50 text-amber-700' 
                                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
                              )}
                            >
                              <div className="text-center">
                                <div className={cn(
                                  "font-semibold",
                                  isMobile ? "text-base" : "text-sm"
                                )}>Paid</div>
                                <div className={cn(
                                  "text-xs",
                                  isMobile ? "text-sm" : ""
                                )}>Premium content</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button
                          size="lg"
                          className={`font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                            isMobile ? 'w-full px-8 py-3' : 'px-12 py-3'
                          }`}
                          onClick={() => setCourseStep(2)}
                          disabled={!courseData.title || !courseData.category}
                        >
                          Continue to Lessons
                          <Video className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Lessons */}
                  {courseStep === 2 && (
                    <motion.div
                      key="course-step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Lessons List */}
                      {courseData.lessons.length > 0 && (
                        <div className="space-y-3">
                          {courseData.lessons.map((lesson, index) => (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="group"
                            >
                              <Card className="overflow-hidden border border-gray-200 hover:border-amber-300 transition-all duration-300">
                                <CardContent className="p-4">
                                  <div className="flex items-center space-x-4">
                                    {/* Lesson Number */}
                                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                      {index + 1}
                                    </div>
                                    
                                    {/* Video Thumbnail/Icon */}
                                    <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                      {lesson.videoType === 'youtube' ? (
                                        <Youtube className="w-6 h-6 text-red-500" />
                                      ) : (
                                        <Video className="w-6 h-6 text-gray-500" />
                                      )}
                                    </div>
                                    
                                    {/* Lesson Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-900 truncate">{lesson.title}</div>
                                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                                        <span>{lesson.duration}</span>
                                        <span>•</span>
                                        <span className="capitalize">{lesson.videoType}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (index > 0) {
                                            const newLessons = [...courseData.lessons];
                                            [newLessons[index], newLessons[index - 1]] = [newLessons[index - 1], newLessons[index]];
                                            setCourseData(prev => ({ ...prev, lessons: newLessons }));
                                          }
                                        }}
                                        disabled={index === 0}
                                      >
                                        <ArrowUp className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (index < courseData.lessons.length - 1) {
                                            const newLessons = [...courseData.lessons];
                                            [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
                                            setCourseData(prev => ({ ...prev, lessons: newLessons }));
                                          }
                                        }}
                                        disabled={index === courseData.lessons.length - 1}
                                      >
                                        <ArrowDown className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setCourseData(prev => ({
                                            ...prev,
                                            lessons: prev.lessons.filter(l => l.id !== lesson.id)
                                          }));
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Add New Lesson Modal */}
                      <Dialog open={showLessonModal} onOpenChange={setShowLessonModal}>
                        <DialogTrigger asChild>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-300 transition-all cursor-pointer bg-gray-50/50 hover:bg-amber-50/50">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div 
                                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.1) 100%)',
                                }}
                              >
                                <Plus className="w-8 h-8 text-amber-600" />
                              </div>
                              <h4 className="font-semibold text-lg mb-2 text-gray-800">Add New Lesson</h4>
                              <p className="text-gray-600 mb-4">Upload video or paste YouTube URL</p>
                              <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:shadow-lg transition-all"
                                onClick={() => setShowLessonModal(true)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Lesson
                              </Button>
                            </motion.div>
                          </div>
                        </DialogTrigger>
                        
                        <DialogContent className={cn(
                          "max-w-2xl",
                          isMobile && "w-[95vw] h-[90vh] max-h-[90vh] flex flex-col"
                        )}>
                          <DialogHeader>
                            <DialogTitle>Add New Lesson</DialogTitle>
                          </DialogHeader>
                          
                          <Tabs defaultValue="upload" className={isMobile ? "flex-1 flex flex-col" : ""}>
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                              <TabsTrigger value="upload" className="flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Upload Video</span>
                              </TabsTrigger>
                              <TabsTrigger value="youtube" className="flex items-center space-x-2">
                                <Link className="w-4 h-4" />
                                <span>YouTube URL</span>
                              </TabsTrigger>
                            </TabsList>
                            
                            <div className={isMobile ? "flex-1 overflow-y-auto" : ""}>
                              <TabsContent value="upload" className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-300 transition-all">
                                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                  <h4 className="font-medium text-lg mb-2">Drag & Drop Video</h4>
                                  <p className="text-gray-500 mb-4">or click to browse files</p>
                                  <Button variant="outline">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Choose File
                                  </Button>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Lesson Title</label>
                                    <input
                                      type="text"
                                      placeholder="e.g., Introduction to React Hooks"
                                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                                      value={newLessonData.title}
                                      onChange={(e) => setNewLessonData(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Duration</label>
                                    <input
                                      type="text"
                                      placeholder="e.g., 15:30"
                                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                                      value={newLessonData.duration}
                                      onChange={(e) => setNewLessonData(prev => ({ ...prev, duration: e.target.value }))}
                                    />
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="youtube" className="space-y-4">
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">YouTube URL</label>
                                    <div className="relative mt-1">
                                      <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                                      <input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                                        value={newLessonData.videoUrl}
                                        onChange={(e) => setNewLessonData(prev => ({ ...prev, videoUrl: e.target.value, videoType: 'youtube' }))}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Lesson Title</label>
                                    <input
                                      type="text"
                                      placeholder="Auto-filled from YouTube or enter manually"
                                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                                      value={newLessonData.title}
                                      onChange={(e) => setNewLessonData(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Duration</label>
                                    <input
                                      type="text"
                                      placeholder="Auto-detected or enter manually"
                                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                                      value={newLessonData.duration}
                                      onChange={(e) => setNewLessonData(prev => ({ ...prev, duration: e.target.value }))}
                                    />
                                  </div>
                                </div>
                              </TabsContent>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                              <Button variant="outline" onClick={() => setShowLessonModal(false)}>
                                Cancel
                              </Button>
                              <Button
                                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                onClick={() => {
                                  if (newLessonData.title && (newLessonData.videoUrl || newLessonData.videoType === 'upload')) {
                                    const newLesson = {
                                      id: Date.now().toString(),
                                      title: newLessonData.title,
                                      videoUrl: newLessonData.videoUrl,
                                      videoType: newLessonData.videoType as 'upload' | 'youtube',
                                      duration: newLessonData.duration || '10:00',
                                      description: newLessonData.description
                                    };
                                    
                                    setCourseData(prev => ({
                                      ...prev,
                                      lessons: [...prev.lessons, newLesson]
                                    }));
                                    
                                    setNewLessonData({
                                      title: '',
                                      videoUrl: '',
                                      videoType: 'upload',
                                      duration: '',
                                      description: ''
                                    });
                                    
                                    setShowLessonModal(false);
                                  }
                                }}
                                disabled={!newLessonData.title}
                              >
                                Add Lesson
                              </Button>
                            </div>
                          </Tabs>
                        </DialogContent>
                      </Dialog>

                      {/* Navigation Buttons */}
                      <div className="flex justify-center gap-4 pt-6">
                        <Button
                          variant="outline"
                          onClick={() => setCourseStep(1)}
                          className="px-8"
                        >
                          Back
                        </Button>
                        <Button
                          size="lg"
                          className="font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-12 py-3"
                          onClick={() => setCourseStep(3)}
                          disabled={courseData.lessons.length === 0}
                        >
                          Ready to Publish
                          <Rocket className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Publish */}
                  {courseStep === 3 && (
                    <motion.div
                      key="course-step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        "space-y-8",
                        isMobile ? "pb-24" : "" // Add bottom padding for mobile sticky CTA
                      )}
                    >
                      <div className="text-center space-y-4">
                        <h3 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                          🚀 Publish Your Course
                        </h3>
                        <p className="text-gray-600">
                          Review your course details and publish to WIZ Learn
                        </p>
                      </div>

                      {/* Course Preview */}
                      <div className="max-w-2xl mx-auto">
                        <Card className="p-6 shadow-lg">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-xl font-bold mb-2">{courseData.title}</h4>
                                <p className="text-gray-600 mb-3">{courseData.description}</p>
                                <div className="flex items-center space-x-4 text-sm">
                                  <Badge variant="secondary">{categories.find(c => c.value === courseData.category)?.label}</Badge>
                                  <span className="text-gray-500">{courseData.lessons.length} lessons</span>
                                  <span className="text-amber-600 font-medium">+{courseData.xpReward} XP</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  courseData.isPaid 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {courseData.isPaid ? 'Paid' : 'Free'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>

{isMobile ? (
                        /* Mobile: Sticky Bottom CTA */
                        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setCourseStep(2)}
                              className="px-6"
                            >
                              Back
                            </Button>
                            <Button
                              size="lg"
                              className="flex-1 font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-4"
                              onClick={() => {
                                toast({
                                  title: "🎉 Course Published!",
                                  description: `"${courseData.title}" is now live in WIZ Learn!`,
                                  duration: 5000,
                                });
                                setCourseStep(1);
                                setCourseData({
                                  title: '',
                                  description: '',
                                  category: '',
                                  coverImage: '',
                                  isPaid: false,
                                  price: 0,
                                  xpReward: 100,
                                  lessons: []
                                });
                              }}
                            >
                              <Sparkles className="w-6 h-6 mr-2" />
                              Publish to WIZ Learn
                            </Button>
                          </div>
                          <div className="h-4"></div> {/* Safe area for mobile bottom bar */}
                        </div>
                      ) : (
                        /* Desktop: Regular CTA */
                        <div className="flex justify-center gap-4">
                          <Button
                            variant="outline"
                            onClick={() => setCourseStep(2)}
                            className="px-8"
                          >
                            Back
                          </Button>
                          <Button
                            size="lg"
                            className="font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-16 py-4 text-xl"
                            onClick={() => {
                              toast({
                                title: "🎉 Course Published!",
                                description: `"${courseData.title}" is now live in WIZ Learn!`,
                                duration: 5000,
                              });
                              setCourseStep(1);
                              setCourseData({
                                title: '',
                                description: '',
                                category: '',
                                coverImage: '',
                                isPaid: false,
                                price: 0,
                                xpReward: 100,
                                lessons: []
                              });
                            }}
                          >
                            <Sparkles className="w-6 h-6 mr-2" />
                            Publish to WIZ Learn
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};