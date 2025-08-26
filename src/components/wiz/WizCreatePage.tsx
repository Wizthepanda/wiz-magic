import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Check, Play, Eye, Plus, Minus, ChevronDown, Sparkles, Trophy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([]);

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
      const existingProfile = await CreatorService.getCreatorProfile(user.uid);
      if (!existingProfile) {
        await CreatorService.saveCreatorProfile({
          userId: user.uid,
          channelId: channelInfo.id,
          channelName: channelInfo.name,
          channelAvatar: channelInfo.avatar,
          subscriberCount: channelInfo.subscriberCount,
          primaryCategory: selectedVideos[0]?.category || 'tech',
          onboardingComplete: true,
          totalVideos: selectedVideos.length
        });
        console.log('✅ Creator profile created');
      } else {
        // Update existing profile with latest channel info
        await CreatorService.saveCreatorProfile({
          ...existingProfile,
          channelName: channelInfo.name,
          channelAvatar: channelInfo.avatar,
          subscriberCount: channelInfo.subscriberCount,
          totalVideos: (existingProfile.totalVideos || 0) + selectedVideos.length
        });
        console.log('✅ Creator profile updated');
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

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 
            className="text-5xl md:text-6xl font-bold"
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
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect your channel, select videos, and share them with the WIZ community.
          </p>
        </motion.div>

        {/* Step Progress Indicator */}
        <motion.div 
          className="flex justify-center items-center space-x-8 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {stepTitles.map((step, index) => (
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
          ))}
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
              className="max-w-2xl mx-auto"
            >
              <Card className="overflow-hidden border-0 shadow-2xl">
                <CardContent 
                  className="p-12 text-center space-y-8"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '24px'
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
                      <Youtube className="w-32 h-32 mx-auto text-red-500" />
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
                    <h2 className="text-3xl font-bold">Connect your YouTube channel to start creating on WIZ.</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
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
                      className="h-20 px-16 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #FF0000 0%, #8B5CF6 100%)',
                        borderRadius: '20px',
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                className="w-full h-48 object-cover"
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
                  className="px-12 py-3 font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                  className="px-16 py-4 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                <div className="w-40 h-40 mx-auto relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Trophy className="w-20 h-20 text-white" />
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
                <h1 className="text-5xl font-bold">
                  🎉 You're Live on WIZ!
                </h1>
                <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
                  Your videos are now featured in Discover. Viewers can watch and earn XP immediately.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-wiz-primary">{selectedVideos.length}</div>
                  <div className="text-gray-600">Videos Live</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-wiz-primary">
                    {new Set(selectedVideos.map(v => v.category)).size}
                  </div>
                  <div className="text-gray-600">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-wiz-primary">∞</div>
                  <div className="text-gray-600">Potential XP</div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  className="px-8 py-3 font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                  className="px-8 py-3 font-bold border-2 border-wiz-primary text-wiz-primary hover:bg-wiz-primary hover:text-white transition-all duration-300"
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
      </div>
    </div>
  );
};