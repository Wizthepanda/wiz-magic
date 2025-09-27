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
import { isYouTubeAPIEnabled } from '@/lib/feature-flags';
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
  const { user, connectYouTube } = useAuth();
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

  // Check for YouTube auth redirect and continue flow
  useEffect(() => {
    const checkYouTubeRedirect = async () => {
      // Debug: Show current user state
      console.log('🔍 WizCreatePage - Current user state:', {
        userId: user?.uid,
        email: user?.email,
        youtubeConnected: user?.youtubeConnected,
        wasConnectingFlag: localStorage.getItem('wizxp_youtube_connect')
      });

      // Check if user was connecting to YouTube (stored in localStorage during redirect)
      const wasConnecting = localStorage.getItem('wizxp_youtube_connect');

      if (wasConnecting && user?.youtubeConnected) {
        console.log('🎉 Detected successful YouTube connection after redirect');

        // Clear the flag
        localStorage.removeItem('wizxp_youtube_connect');

        // Check if we need to acquire access token
        await acquireYouTubeAccessTokenIfNeeded();

        // Show success message
        toast({
          title: "🎉 Connected Successfully!",
          description: "YouTube channel connected! Loading your videos...",
          duration: 3000,
        });

        // Continue to step 2 and load videos
        setCurrentStep(2);
        loadVideos();
      } else if (user?.youtubeConnected) {
        console.log('✅ User already has YouTube connected, proceeding to video selection');
        setCurrentStep(2);
        loadVideos();
      } else {
        console.log('❌ User not YouTube connected yet');
      }
    };

    if (user) {
      checkYouTubeRedirect();
    }
  }, [user, toast]);

  // Function to acquire YouTube access token if needed
  const acquireYouTubeAccessTokenIfNeeded = async () => {
    if (!user?.uid) return;

    try {
      // Check if we already have a valid access token
      const { getDoc, doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (userData?.youtubeAccessToken) {
        console.log('✅ YouTube access token already exists in database');
        return;
      }

      console.log('🔍 No access token found, setting up re-authorization prompt...');

      // Since we don't have an access token, we need to prompt the user to re-authorize
      // with a popup flow that will provide the access token

      // Mark user as needing YouTube API access re-authorization
      await setDoc(doc(db, 'users', user.uid), {
        needsYouTubeTokenAcquisition: true,
        lastTokenAttempt: new Date(),
        tokenAcquisitionReason: 'Initial redirect auth did not provide access token'
      }, { merge: true });

      console.log('📋 User marked as needing YouTube API re-authorization for token access');
      console.log('💡 User will be prompted to complete authorization on video loading attempts');

    } catch (error) {
      console.error('❌ Error in acquireYouTubeAccessTokenIfNeeded:', error);
    }
  };

  // Function to handle YouTube re-authorization with popup for API access
  const handleYouTubeReauthorization = async () => {
    try {
      console.log('🔄 Starting YouTube re-authorization with popup...');

      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProviderWithYouTube } = await import('@/lib/firebase');
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');

      // Use popup authentication to get access token
      const result = await signInWithPopup(auth, googleProviderWithYouTube);

      if (result.credential) {
        const accessToken = (result.credential as any).accessToken;

        if (accessToken) {
          console.log('✅ Successfully obtained YouTube access token via popup');

          // Save the token to the database
          await setDoc(doc(db, 'users', user!.uid), {
            youtubeAccessToken: accessToken,
            youtubeTokenAcquiredAt: new Date(),
            needsYouTubeTokenAcquisition: false // Clear the flag
          }, { merge: true });

          // Also store in localStorage for immediate use
          localStorage.setItem('youtube_access_token', accessToken);

          console.log('💾 YouTube access token saved, retrying video load...');

          // Show success message
          toast({
            title: "✅ Authorization Complete",
            description: "YouTube API access granted! Loading your videos...",
            duration: 3000,
          });

          // Retry loading videos
          setTimeout(() => loadVideos(), 1000);
        } else {
          throw new Error('No access token in popup result');
        }
      } else {
        throw new Error('No credential returned from popup');
      }
    } catch (error) {
      console.error('❌ YouTube re-authorization failed:', error);

      toast({
        title: "Authorization Failed",
        description: error instanceof Error ? error.message : "Failed to authorize YouTube access. Please try again.",
        duration: 5000,
      });

      // Fall back to demo videos
      handleUseDemoVideos();
    }
  };

  // Function to handle fallback to demo videos
  const handleUseDemoVideos = () => {
    console.log('🎭 Using demo videos as fallback');

    // Create some demo videos for the user to select from
    const demoVideos: Video[] = [
      {
        id: 'demo1',
        title: 'Demo Video: Getting Started with WIZ',
        thumbnail: 'https://via.placeholder.com/320x180?text=Demo+Video+1',
        duration: '5:30',
        views: '1.2K views',
        publishedAt: '2 days ago',
        description: 'This is a demo video to showcase the platform functionality.',
        tags: ['demo', 'tutorial', 'getting-started'],
        channelTitle: 'WIZ Demo Channel',
        channelThumbnail: 'https://via.placeholder.com/40x40?text=WIZ',
        channelId: 'demo_channel'
      },
      {
        id: 'demo2',
        title: 'Demo Video: Advanced Features',
        thumbnail: 'https://via.placeholder.com/320x180?text=Demo+Video+2',
        duration: '8:45',
        views: '950 views',
        publishedAt: '1 week ago',
        description: 'Explore advanced features of the WIZ platform.',
        tags: ['demo', 'advanced', 'features'],
        channelTitle: 'WIZ Demo Channel',
        channelThumbnail: 'https://via.placeholder.com/40x40?text=WIZ',
        channelId: 'demo_channel'
      }
    ];

    setVideos(demoVideos);

    toast({
      title: "Using Demo Videos",
      description: "Demo videos loaded. Connect YouTube for your actual videos.",
      duration: 4000,
    });
  };

  // Original working YouTube OAuth connection using Firebase Auth
  const handleConnectYouTube = async () => {
    setIsConnecting(true);

    try {
      // Use the original working connectYouTube method from useAuth
      const success = await connectYouTube();

      if (success) {
        // Try to get channel info after successful connection
        try {
          const channelInfo = await youTubeAPI.getChannelInfo();
          setChannelInfo(channelInfo);

          toast({
            title: "🎉 Connected Successfully!",
            description: `Connected to ${channelInfo.name}!`,
            duration: 3000,
          });

          setTimeout(() => {
            setCurrentStep(2);
            loadVideos();
          }, 1500);
        } catch (channelError) {
          // Connection succeeded but couldn't get channel info - that's ok
          console.log('YouTube connected but channel info unavailable:', channelError);
          toast({
            title: "🎉 Connected Successfully!",
            description: "YouTube channel connected!",
            duration: 3000,
          });

          setTimeout(() => {
            setCurrentStep(2);
            loadVideos();
          }, 1500);
        }
      } else {
        toast({
          title: "Connection Failed",
          description: "Failed to connect to YouTube. Please try again.",
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('YouTube connection error:', error);

      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to YouTube. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Real video loading from YouTube API
  const loadVideos = async () => {
    setIsLoadingVideos(true);

    try {
      // Debug: Check user state and stored tokens
      console.log('🔍 LoadVideos Debug Info:');
      console.log('  User:', {
        uid: user?.uid,
        email: user?.email,
        youtubeConnected: user?.youtubeConnected
      });

      // Try to get and set the access token
      const accessToken = localStorage.getItem('youtube_access_token');
      console.log('  Access token in localStorage:', accessToken ? 'present' : 'null');

      if (!accessToken) {
        // Try to get from user document
        if (user?.uid) {
          try {
            console.log('  Fetching user document from Firestore...');
            const { getDoc, doc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            console.log('  User document exists:', userDoc.exists());
            console.log('  User data keys:', userData ? Object.keys(userData) : 'no data');
            console.log('  youtubeAccessToken in DB:', userData?.youtubeAccessToken ? 'present' : 'null');
            console.log('  youtubeConnected in DB:', userData?.youtubeConnected);

            if (userData?.youtubeAccessToken) {
              localStorage.setItem('youtube_access_token', userData.youtubeAccessToken);
              youTubeAPI.setAccessToken(userData.youtubeAccessToken);
              console.log('📺 Retrieved and set YouTube access token from database');
            } else if (userData?.needsYouTubeTokenAcquisition) {
              console.log('🔄 User needs YouTube token re-authorization');

              // Prompt user to complete authorization with popup that provides access token
              const shouldReauthorize = confirm(
                'YouTube API access is required to load your videos.\n\n' +
                'Click OK to complete the authorization process, or Cancel to use demo videos.'
              );

              if (shouldReauthorize) {
                console.log('🚀 Starting popup re-authorization for YouTube API access...');
                await handleYouTubeReauthorization();
                return; // Exit this function, will be called again after reauth
              } else {
                console.log('👤 User chose to skip, using demo videos');
                throw new Error('YouTube authorization skipped by user');
              }
            } else {
              console.error('❌ No youtubeAccessToken field in user document');
              throw new Error('No YouTube access token found in database');
            }
          } catch (error) {
            console.error('Failed to get access token from database:', error);
            throw new Error('Not authenticated with YouTube');
          }
        } else {
          console.error('❌ No user UID available');
          throw new Error('Not authenticated with YouTube');
        }
      } else {
        youTubeAPI.setAccessToken(accessToken);
        console.log('📺 Set YouTube access token from localStorage');
      }

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
