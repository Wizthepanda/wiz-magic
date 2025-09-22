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
import { CreationHub } from './CreationHub';

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
  contentType?: 'short' | 'video';
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
  { value: 'art', label: 'Art' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'movie', label: 'Movie' },
];

// Helper function to detect if video is a short based on duration
const isShortVideo = (duration: string): boolean => {
  // Parse YouTube duration format (PT1M30S = 1 minute 30 seconds)
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;
  
  const minutes = parseInt(match[1] || '0', 10);
  const seconds = parseInt(match[2] || '0', 10);
  const totalSeconds = minutes * 60 + seconds;
  
  return totalSeconds < 60; // Less than 60 seconds = short
};

// Helper function to auto-detect content type
const detectContentType = (duration: string): 'short' | 'video' | undefined => {
  if (!duration) return undefined;
  return isShortVideo(duration) ? 'short' : 'video';
};

// Content Type Toggle Component
const ContentTypeToggle = ({ 
  videoId, 
  currentType, 
  onTypeChange, 
  autoDetected 
}: { 
  videoId: string; 
  currentType?: 'short' | 'video'; 
  onTypeChange: (videoId: string, type: 'short' | 'video') => void;
  autoDetected?: boolean;
}) => {
  return (
    <div className="flex items-center justify-center space-x-1 bg-gray-50 rounded-full p-1 border border-gray-200">
      <button
        onClick={() => onTypeChange(videoId, 'short')}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
          currentType === 'short'
            ? 'bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        Short (&lt;60s)
      </button>
      <button
        onClick={() => onTypeChange(videoId, 'video')}
        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
          currentType === 'video'
            ? 'bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        Full Video (≥60s)
      </button>
      {autoDetected && (
        <span className="ml-2 text-xs text-green-600 font-medium">Auto-detected</span>
      )}
    </div>
  );
};

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
  
  // Content type state for each selected video
  const [videoContentTypes, setVideoContentTypes] = useState<Record<string, 'short' | 'video'>>({});

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
      // Remove content type when deselecting
      setVideoContentTypes(prev => {
        const updated = { ...prev };
        delete updated[video.id];
        return updated;
      });
    } else {
      // Auto-detect category based on title/description
      const autoCategory = detectCategory(video.title + ' ' + (video.description || ''));
      // Auto-detect content type based on duration
      const autoContentType = detectContentType(video.duration);
      
      const selectedVideo: SelectedVideo = {
        ...video,
        category: autoCategory,
        contentType: autoContentType
      };
      
      setSelectedVideos(prev => [...prev, selectedVideo]);
      
      // Set auto-detected content type if available
      if (autoContentType) {
        setVideoContentTypes(prev => ({
          ...prev,
          [video.id]: autoContentType
        }));
      }
    }
  };

  // Function to update content type for a specific video
  const updateVideoContentType = (videoId: string, contentType: 'short' | 'video') => {
    setVideoContentTypes(prev => ({
      ...prev,
      [videoId]: contentType
    }));
    
    // Also update the selectedVideos array
    setSelectedVideos(prev => prev.map(video => 
      video.id === videoId ? { ...video, contentType } : video
    ));
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
    
    // Check if all videos have content types assigned
    const videosWithoutContentType = selectedVideos.filter(video => !videoContentTypes[video.id]);
    if (videosWithoutContentType.length > 0) {
      toast({
        title: "Content Type Required",
        description: "Please select content type (Short or Full Video) for all videos before continuing.",
        duration: 4000,
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
        originalYouTubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
        // Add content type metadata
        contentType: videoContentTypes[video.id] || video.contentType || detectContentType(video.duration) || 'video'
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
        {/* Hero Section - V2 Design */}
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
            What Do You Want to Create?
          </h1>
          <p className={`text-gray-600 dark:text-gray-300 max-w-3xl mx-auto ${
            isMobile ? 'text-lg px-2' : 'text-xl'
          }`}>
            Build thriving communities, design courses, coach members, and share digital products — all powered by ZAPS + co-pay system.
          </p>
        </motion.div>

        {/* Main Content - CreationHub only */}

        {/* What Do You Want to Create Hub */}
        <CreationHub
          isMobile={isMobile}
          onYouTubeConnect={handleConnectYouTube}
          channelInfo={channelInfo}
          videos={videos}
          selectedVideos={selectedVideos}
          isConnecting={isConnecting}
          isLoadingVideos={isLoadingVideos}
          isPublishing={isPublishing}
          videoContentTypes={videoContentTypes}
          onToggleVideoSelection={toggleVideoSelection}
          onUpdateVideoContentType={updateVideoContentType}
          onUpdateVideoCategory={updateVideoCategory}
          onProceedToCategorize={proceedToCategorize}
          onPublishToWiz={publishToWiz}
          toast={toast}
        />
      </div>
    </div>
  );
};
