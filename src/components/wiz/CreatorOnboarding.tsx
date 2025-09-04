import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, Youtube, Gamepad2, Laptop, Bot, Music, Dumbbell, DollarSign, Mic, ArrowRight, ArrowLeft, Sparkles, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreatorService, CreatorVideo } from '@/lib/creator-service';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreatorProfile {
  channelId: string;
  channelName: string;
  profilePicture: string;
  subscriberCount: string;
  videoCount: number;
}

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ElementType;
  gradient: string;
  shadow: string;
  description: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  duration: string;
  publishedAt: string;
}

const categories: CategoryOption[] = [
  {
    id: 'gaming',
    label: 'Gaming',
    icon: Gamepad2,
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    shadow: 'rgba(139, 92, 246, 0.3)',
    description: 'Gaming content, reviews, and tutorials'
  },
  {
    id: 'tech',
    label: 'Tech',
    icon: Laptop,
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    shadow: 'rgba(6, 182, 212, 0.3)',
    description: 'Technology, programming, and tutorials'
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Bot,
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
    shadow: 'rgba(59, 130, 246, 0.3)',
    description: 'Artificial Intelligence and machine learning'
  },
  {
    id: 'music',
    label: 'Music',
    icon: Music,
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    shadow: 'rgba(236, 72, 153, 0.3)',
    description: 'Music production, tutorials, and performances'
  },
  {
    id: 'health',
    label: 'Health',
    icon: Dumbbell,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    shadow: 'rgba(16, 185, 129, 0.3)',
    description: 'Fitness, nutrition, and wellness'
  },
  {
    id: 'money',
    label: 'Money',
    icon: DollarSign,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    shadow: 'rgba(245, 158, 11, 0.3)',
    description: 'Finance, investing, and business'
  },
  {
    id: 'podcast',
    label: 'Podcasts',
    icon: Mic,
    gradient: 'linear-gradient(135deg, #84CC16 0%, #65A30D 100%)',
    shadow: 'rgba(132, 204, 22, 0.3)',
    description: 'Podcast content and discussions'
  }
];

export const CreatorOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [secondaryCategory, setSecondaryCategory] = useState<string>('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  const stepTitles = [
    { number: 1, title: 'Connect', subtitle: 'YouTube Channel' },
    { number: 2, title: 'Category', subtitle: 'Choose Content Type' },
    { number: 3, title: 'Live', subtitle: 'Your Videos Ready' }
  ];

  const handleYouTubeConnect = async () => {
    if (!user?.uid) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to connect your YouTube channel.",
        duration: 3000,
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Mock profile data (replace with actual YouTube API when available)
      const mockProfile = {
        channelId: 'UCexample123',
        channelName: user.displayName || 'WIZ Creator Channel',
        profilePicture: user.photoURL || 'https://yt3.ggpht.com/example.jpg',
        subscriberCount: '10.5K',
        videoCount: 42
      };

      // Update user document in Firestore with creator data (using setDoc with merge to handle new users)
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        // Creator role and enrollment flags
        role: 'creator',
        hasCreatedContent: true,
        
        // YouTube connection data
        youtubeConnected: true,
        youtubeProfile: {
          channelId: mockProfile.channelId,
          channelName: mockProfile.channelName,
          profilePicture: mockProfile.profilePicture,
          subscriberCount: mockProfile.subscriberCount,
          videoCount: mockProfile.videoCount
        },
        
        // Enrollment timestamps
        creatorEnrolledAt: serverTimestamp(),
        youtubeConnectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Initialize creator metrics
        coursesCreated: 0,
        videosUploaded: 0,
        totalEarnings: 0
      }, { merge: true });

      console.log(`✅ Creator enrollment successful for user ${user.uid}`);
      
      setCreatorProfile(mockProfile);
      setIsConnecting(false);
      setCurrentStep(2);
      
      toast({
        title: "🎉 YouTube Connected!",
        description: "You're now enrolled as a creator on WIZ! Visit your profile to see your creator dashboard.",
        duration: 5000,
      });
    } catch (error) {
      console.error('❌ Error enrolling creator:', error);
      setIsConnecting(false);
      
      toast({
        title: "Connection Failed",
        description: "Failed to connect YouTube channel. Please try again.",
        duration: 3000,
      });
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory('');
    } else if (selectedCategory === '') {
      setSelectedCategory(categoryId);
    } else if (secondaryCategory === categoryId) {
      setSecondaryCategory('');
    } else {
      setSecondaryCategory(categoryId);
    }
  };

  const proceedToVideoSelection = async () => {
    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select at least one primary category.",
        duration: 3000,
      });
      return;
    }

    setIsLoadingVideos(true);
    setCurrentStep(3);

    // Mock video fetching (replace with actual YouTube API)
    setTimeout(() => {
      const mockVideos: Video[] = [
        {
          id: '1',
          title: 'Getting Started with AI Development',
          thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
          views: '12.5K',
          duration: '15:32',
          publishedAt: '2 days ago'
        },
        {
          id: '2',
          title: 'React 19 New Features Explained',
          thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
          views: '8.9K',
          duration: '12:45',
          publishedAt: '5 days ago'
        },
        {
          id: '3',
          title: 'Building a Full-Stack App in 2024',
          thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
          views: '23.1K',
          duration: '28:17',
          publishedAt: '1 week ago'
        }
      ];
      setVideos(mockVideos);
      setIsLoadingVideos(false);
    }, 2000);
  };

  const completeOnboarding = async () => {
    if (!user?.uid || !creatorProfile) {
      toast({
        title: "Error",
        description: "Missing user information. Please try again.",
        duration: 3000,
      });
      return;
    }

    try {
      // Save creator profile
      await CreatorService.saveCreatorProfile({
        userId: user.uid,
        channelId: creatorProfile.channelId,
        channelName: creatorProfile.channelName,
        channelAvatar: creatorProfile.profilePicture,
        subscriberCount: creatorProfile.subscriberCount,
        primaryCategory: selectedCategory,
        secondaryCategory: secondaryCategory || undefined,
        onboardingComplete: true,
        totalVideos: videos.length
      });

      // Save videos to database - using publishVideosToDiscover to ensure they appear in Discover
      const creatorVideos: Omit<CreatorVideo, 'addedToWiz' | 'lastUpdated'>[] = videos.map(video => ({
        id: video.id,
        videoId: video.id,
        title: video.title,
        description: video.title, // Use title as description for mock videos
        thumbnail: video.thumbnail,
        duration: video.duration,
        publishedAt: video.publishedAt,
        views: video.views,
        categoryTags: secondaryCategory ? [selectedCategory, secondaryCategory] : [selectedCategory],
        creatorId: user.uid,
        channelId: creatorProfile.channelId,
        status: 'active' as const,
        isFeatured: true,
        originalYouTubeUrl: `https://www.youtube.com/watch?v=${video.id}`
      }));

      await CreatorService.publishVideosToDiscover(creatorVideos);

      setCurrentStep(4); // Success screen

      toast({
        title: "🚀 Welcome to WIZ Creators!",
        description: "Your channel is now live on WIZ Discover!",
        duration: 5000,
      });

      console.log('✅ Creator onboarding completed successfully');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        duration: 5000,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 
          className="text-4xl md:text-5xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #e879f9 0%, #a855f7 30%, #6366f1 70%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))'
          }}
        >
          Become a Creator on WIZ
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect your YouTube channel and share your videos instantly with the WIZ community.
        </p>
      </motion.div>

      {/* Step Progress Indicator */}
      <motion.div 
        className="flex justify-center items-center space-x-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {stepTitles.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center space-y-2">
              <motion.div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ${
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
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </motion.div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-500">{step.subtitle}</div>
              </div>
            </div>
            {index < stepTitles.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                currentStep > step.number ? 'bg-wiz-primary' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent 
                className="p-8 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="space-y-6">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Youtube className="w-24 h-24 mx-auto text-red-500" />
                    </motion.div>
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-wiz-primary rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-2">Connect Your YouTube Channel</h2>
                    <p className="text-gray-600">
                      We'll securely connect to your channel with read-only permissions to fetch your video metadata.
                    </p>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full font-bold py-4 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
                        boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)'
                      }}
                      onClick={handleYouTubeConnect}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Youtube className="w-5 h-5" />
                          <span>Connect YouTube Channel</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Secure OAuth authentication</p>
                    <p>✓ Read-only permissions only</p>
                    <p>✓ No access to private data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-8"
          >
            {/* Connected Channel Confirmation */}
            {creatorProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="p-6 border-green-200 bg-green-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-green-800">{creatorProfile.channelName}</h3>
                      <p className="text-green-600">{creatorProfile.subscriberCount} subscribers • {creatorProfile.videoCount} videos</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Category Selection */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Choose Your Content Category</h2>
                <p className="text-gray-600">Select a primary category and optionally a secondary one for your videos.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  const isSecondary = secondaryCategory === category.id;
                  
                  return (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 border-2 ${
                          isSelected 
                            ? 'border-wiz-primary shadow-2xl' 
                            : isSecondary
                            ? 'border-wiz-secondary shadow-xl'
                            : 'border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                        style={isSelected || isSecondary ? {
                          background: `${category.gradient.replace(')', ', 0.05)')}, rgba(255, 255, 255, 0.95)`,
                          boxShadow: `0 8px 32px ${category.shadow}`
                        } : {}}
                      >
                        <CardContent className="p-6 text-center space-y-4">
                          <div 
                            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center"
                            style={{ background: category.gradient }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg flex items-center justify-center space-x-2">
                              <span>{category.label}</span>
                              {isSelected && <Badge className="bg-wiz-primary text-white text-xs">Primary</Badge>}
                              {isSecondary && <Badge className="bg-wiz-secondary text-white text-xs">Secondary</Badge>}
                            </h3>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="px-8 py-3 font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={proceedToVideoSelection}
                  disabled={!selectedCategory}
                >
                  Continue to Video Preview
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Your Videos are Ready!</h2>
              <p className="text-gray-600">
                Preview how your videos will appear in WIZ Discover. They'll be auto-tagged with your selected categories.
              </p>
            </div>

            {isLoadingVideos ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wiz-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your videos...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => {
                    const selectedCat = categories.find(c => c.id === selectedCategory);
                    
                    return (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-0">
                            <div className="relative">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute top-3 left-3">
                                <Badge 
                                  className="text-white text-xs font-bold"
                                  style={{ background: selectedCat?.gradient }}
                                >
                                  {selectedCat?.label.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {video.duration}
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                                {video.title}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>{video.views} views</span>
                                <span>{video.publishedAt}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    {videos.length} videos ready to go live on WIZ Discover
                  </p>
                  <Button
                    size="lg"
                    className="px-8 py-3 font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={completeOnboarding}
                  >
                    🚀 Launch My Creator Profile
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative w-32 h-32 mx-auto">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="w-16 h-16 text-white" />
                </motion.div>
                {/* Sparkles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: `${50 + 40 * Math.cos((i * 45) * Math.PI / 180)}%`,
                      top: `${50 + 40 * Math.sin((i * 45) * Math.PI / 180)}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
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
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold">
                🎉 You're Now a Creator on WIZ!
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your videos are now live in WIZ Discover. Fans can start watching and earning XP immediately.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-4 max-w-md mx-auto"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-wiz-primary">{videos.length}</div>
                <div className="text-sm text-gray-600">Videos Live</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-wiz-primary">1</div>
                <div className="text-sm text-gray-600">Category</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-wiz-primary">∞</div>
                <div className="text-sm text-gray-600">Potential XP</div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                size="lg"
                className="px-8 py-3 font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  // Navigate to creator dashboard
                  console.log('Navigate to creator dashboard');
                }}
              >
                <Users className="w-5 h-5 mr-2" />
                Go to My Creator Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};