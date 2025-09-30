import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Users,
  User,
  Package,
  Settings,
  Plus,
  Check,
  Upload,
  ExternalLink,
  Calendar,
  DollarSign,
  Sparkles,
  Trophy,
  Crown,
  Zap,
  Rocket,
  ArrowLeft,
  ArrowRight,
  FileText,
  Video,
  Image,
  Link,
  Bold,
  Italic,
  List,
  AlignLeft,
  Type,
  Hash,
  Play,
  FileDown,
  Clock,
  Eye,
  Globe,
  Lock,
  Timer,
  Trash2,
  Edit3,
  Save,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Youtube,
  Minus
} from 'lucide-react';
import CreateCommunityPage from './CreateCommunityPage';
import DraftsView from './DraftsView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { EnhancedBannerUpload } from '@/components/ui/enhanced-banner-upload';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CourseService from '@/lib/course-service';

interface CreationHubProps {
  isMobile: boolean;
  onYouTubeConnect?: () => void;
  channelInfo?: any;
  videos?: any[];
  selectedVideos?: any[];
  isConnecting?: boolean;
  isLoadingVideos?: boolean;
  isPublishing?: boolean;
  videoContentTypes?: Record<string, 'short' | 'video'>;
  onToggleVideoSelection?: (video: any) => void;
  onUpdateVideoContentType?: (videoId: string, contentType: 'short' | 'video') => void;
  onUpdateVideoCategory?: (videoId: string, category: string) => void;
  onProceedToCategorize?: () => void;
  onPublishToWiz?: () => void;
  toast?: any;
}

type CreationType = 'course' | 'community' | 'coaching' | 'product' | 'tool' | null;

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'downloads';
  videoUrl?: string;
  content?: string;
  files?: FileItem[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
}

interface BannerPositioning {
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

interface CourseData {
  coverImage: string;
  bannerPositioning?: BannerPositioning;
  title: string;
  description: string;
  category: string;
  tags: string[];
  modules: Module[];
  accessType: 'free' | 'xp' | 'xp-copay' | 'paid';
  xpRequired: number;
  price: number;
  trialEnabled: boolean;
  trialDays: number;
  publishType: 'draft' | 'publish' | 'schedule';
  publishDate?: Date;
}

const categories = [
  'Tech', 'Business', 'Money', 'Design', 'Health', 'Self Improvement',
  'Education', 'Gaming', 'Lifestyle', 'Social', 'DIY', 'Entertainment',
  'Music', 'Fitness', 'Programming', 'Art', 'Finance', 'Marketing',
  'Photography', 'Cooking', 'Language', 'Personal Development'
];

const creationTypes = [
  {
    id: 'community',
    title: 'Community',
    icon: Users,
    description: 'Private groups, collab spaces, networking hubs.',
    gradient: 'from-blue-500 to-indigo-500',
    color: 'text-blue-600'
  },
  {
    id: 'course',
    title: 'Courses',
    icon: BookOpen,
    description: 'Structured lessons, modules, and video learning.',
    gradient: 'from-orange-500 to-red-500',
    color: 'text-orange-600'
  },
  {
    id: 'coaching',
    title: 'Coaching',
    icon: User,
    description: '1-on-1 or group mentorship sessions.',
    gradient: 'from-emerald-500 to-teal-500',
    color: 'text-emerald-600'
  },
  {
    id: 'product',
    title: 'Digital Products',
    icon: Package,
    description: 'Templates, guides, downloads, resources.',
    gradient: 'from-purple-500 to-pink-500',
    color: 'text-purple-600'
  }
];

// YouTube Connect Flow Component
interface YouTubeConnectFlowProps {
  isMobile: boolean;
  onConnect?: () => void;
  channelInfo?: any;
  videos?: any[];
  selectedVideos?: any[];
  isConnecting?: boolean;
  isLoadingVideos?: boolean;
  isPublishing?: boolean;
  videoContentTypes?: Record<string, 'short' | 'video'>;
  onToggleVideoSelection?: (video: any) => void;
  onUpdateVideoContentType?: (videoId: string, contentType: 'short' | 'video') => void;
  onUpdateVideoCategory?: (videoId: string, category: string) => void;
  onProceedToCategorize?: () => void;
  onPublishToWiz?: () => void;
  toast?: any;
}

const YouTubeConnectFlow = ({
  isMobile,
  onConnect,
  channelInfo,
  videos = [],
  selectedVideos = [],
  isConnecting = false,
  isLoadingVideos = false,
  isPublishing = false,
  videoContentTypes = {},
  onToggleVideoSelection,
  onUpdateVideoContentType,
  onUpdateVideoCategory,
  onProceedToCategorize,
  onPublishToWiz,
  toast
}: YouTubeConnectFlowProps) => {
  // Determine current step based on state
  const getCurrentStep = () => {
    if (isLoadingVideos || videos.length > 0 || channelInfo) return 2;
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(() => {
    // Only automatically set initial step, don't override manual progression
    if (videos.length > 0 || channelInfo) return 2;
    return 1;
  });

  // Only update step automatically for the initial load, not during user interaction
  React.useEffect(() => {
    // Only auto-advance to step 2 if we're still on step 1 and have loaded videos
    if (currentStep === 1 && (videos.length > 0 || channelInfo)) {
      setCurrentStep(2);
    }
  }, [channelInfo, videos, currentStep]);

  const stepTitles = [
    { number: 1, title: 'Connect', subtitle: 'YouTube Channel' },
    { number: 2, title: 'Select', subtitle: 'Your Videos' },
    { number: 3, title: 'Publish', subtitle: 'To WIZ' },
    { number: 4, title: 'Success', subtitle: 'All Done!' }
  ];

  const handleConnect = async () => {
    try {
      if (onConnect) {
        await onConnect();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div className="mt-8">
      <Card className="overflow-hidden border-0 shadow-xl">
        <CardContent
          className={`${isMobile ? 'p-6' : 'p-12'} space-y-8`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: isMobile ? '20px' : '24px'
          }}
        >
          {/* Step Progress Indicator */}
          <motion.div
            className={`flex justify-center items-center ${
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
                              ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white border-red-500'
                              : currentStep === step.number
                              ? 'border-red-500 text-red-500 bg-white dark:bg-gray-800'
                              : 'border-gray-300 text-gray-400 bg-gray-50 dark:bg-gray-700'
                          }`}
                          animate={{
                            scale: currentStep === step.number ? 1.1 : 1,
                            boxShadow: currentStep === step.number ? '0 0 15px rgba(255, 0, 0, 0.4)' : '0 0 0px rgba(0,0,0,0)'
                          }}
                        >
                          {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                        </motion.div>
                        <div className="text-left">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{step.subtitle}</div>
                        </div>
                      </div>
                      {index < stepTitles.length - 1 && (
                        <div className={`w-8 h-0.5 mx-3 transition-all duration-300 ${
                          currentStep > step.number ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Desktop: Original horizontal layout
              stepTitles.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center space-y-2">
                    <motion.div
                      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-red-500 to-purple-600 text-white border-red-500'
                          : currentStep === step.number
                          ? 'border-red-500 text-red-500 bg-white dark:bg-gray-800'
                          : 'border-gray-300 text-gray-400 bg-gray-50 dark:bg-gray-700'
                      }`}
                      animate={{
                        scale: currentStep === step.number ? 1.1 : 1,
                        boxShadow: currentStep === step.number ? '0 0 20px rgba(255, 0, 0, 0.4)' : '0 0 0px rgba(0,0,0,0)'
                      }}
                    >
                      {currentStep > step.number ? <Check className="w-6 h-6" /> : step.number}
                    </motion.div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{step.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{step.subtitle}</div>
                    </div>
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))
            )}
          </motion.div>

          {/* Step Content */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              {/* YouTube Icon */}
              <motion.div
                className="relative mx-auto"
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
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-red-500 to-purple-600 rounded-full flex items-center justify-center"
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
              </motion.div>

              {/* Connect Content */}
              <div className="space-y-4">

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
                    onClick={handleConnect}
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

                <div className="text-center space-y-2">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    We'll securely connect to your YouTube channel using Google's authentication.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                    Your credentials are never stored by WIZUP.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Videos */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 dark:text-gray-100">Select Videos to Feature</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
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
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-6"></div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your videos...</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  isMobile
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {videos.map((video: any, index: number) => {
                    const isSelected = selectedVideos.some((v: any) => v.id === video.id);

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
                              ? 'border-red-500 shadow-2xl ring-4 ring-red-500/20'
                              : 'border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                          }`}
                          style={{ borderRadius: '20px' }}
                          onClick={() => onToggleVideoSelection?.(video)}
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
                                    ? 'bg-red-500 text-white scale-110'
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
                                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="p-4 space-y-3">
                              <h3 className="font-semibold text-sm leading-tight line-clamp-2 dark:text-gray-100">
                                {video.title}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
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
                  className={`font-bold bg-gradient-to-r from-red-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isMobile
                      ? 'w-full px-8 py-3 text-base'
                      : 'px-12 py-3'
                  }`}
                  onClick={() => {
                    if (selectedVideos.length === 0) {
                      toast?.({
                        title: "No Videos Selected",
                        description: "Please select at least one video to continue.",
                        duration: 3000,
                      });
                      return;
                    }
                    setCurrentStep(3);
                  }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 dark:text-gray-100">Categorize & Publish</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Assign categories to your videos and publish them to WIZ Discover.
                </p>
              </div>

              <div className="space-y-6 max-w-4xl mx-auto">
                {selectedVideos.map((video: any, index: number) => (
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
                          <h3 className="font-semibold text-lg mb-2 dark:text-gray-100">{video.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{video.views} views</span>
                            <span>{video.duration}</span>
                            <span>{video.publishedAt}</span>
                          </div>
                        </div>
                        <div className="w-48">
                          <Select
                            value={video.category}
                            onValueChange={(value) => onUpdateVideoCategory?.(video.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                { value: 'tech', label: 'Tech' },
                                { value: 'business', label: 'Business' },
                                { value: 'money', label: 'Money' },
                                { value: 'design', label: 'Design' },
                                { value: 'health', label: 'Health' },
                                { value: 'self-improvement', label: 'Self Improvement' },
                                { value: 'education', label: 'Education' },
                                { value: 'gaming', label: 'Gaming' },
                                { value: 'lifestyle', label: 'Lifestyle' },
                                { value: 'social', label: 'Social' },
                                { value: 'diy', label: 'DIY' },
                              ].map(cat => (
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
                <p className="text-gray-600 dark:text-gray-300">
                  Ready to publish {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''} to WIZ Discover
                </p>
                <Button
                  size="lg"
                  className={`font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isMobile
                      ? 'w-full px-8 py-4 text-lg'
                      : 'px-16 py-4 text-xl'
                  }`}
                  onClick={async () => {
                    // Call the publish function and advance to success screen
                    if (onPublishToWiz) {
                      await onPublishToWiz();
                      // Advance to step 4 (success screen) after publishing
                      setCurrentStep(4);
                    }
                  }}
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

          {/* Step 4: Success Screen */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              {/* Confetti Animation */}
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(34, 197, 94, 0.3)',
                        '0 0 40px rgba(34, 197, 94, 0.6)',
                        '0 0 20px rgba(34, 197, 94, 0.3)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Trophy className="w-16 h-16 text-white" />
                  </motion.div>

                  {/* Floating Confetti */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                      animate={{
                        y: [-20, -60, -20],
                        x: [0, (i % 2 === 0 ? 30 : -30), 0],
                        rotate: [0, 360],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                      style={{
                        left: `${20 + (i * 10)}%`,
                        top: '50%'
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Success Message */}
              <div className="space-y-6">
                <motion.h2
                  className="text-4xl font-bold text-green-600 dark:text-green-400"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🎉 Successfully Published!
                </motion.h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Your {selectedVideos.length} video{selectedVideos.length !== 1 ? 's have' : ' has'} been published to WIZ Discover!
                  They will now be available for the community to explore and engage with.
                </p>

                {/* Stats */}
                <div className="flex justify-center space-x-8 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedVideos.length}</div>
                    <div className="text-sm text-gray-500">Videos Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">∞</div>
                    <div className="text-sm text-gray-500">Potential Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+XP</div>
                    <div className="text-sm text-gray-500">Creator Rewards</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => {
                    // Navigate to main page where discover content is shown
                    window.location.href = '/';
                  }}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View on Discover
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-3"
                  onClick={() => {
                    // Reset to step 1 for publishing more videos
                    setCurrentStep(1);
                  }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Publish More Videos
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const CreationHub = ({
  isMobile,
  onYouTubeConnect,
  channelInfo,
  videos,
  selectedVideos,
  isConnecting,
  isLoadingVideos,
  isPublishing,
  videoContentTypes,
  onToggleVideoSelection,
  onUpdateVideoContentType,
  onUpdateVideoCategory,
  onProceedToCategorize,
  onPublishToWiz,
  toast
}: CreationHubProps) => {
  const [selectedType, setSelectedType] = useState<CreationType>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showDrafts, setShowDrafts] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData>({
    coverImage: '',
    title: '',
    description: '',
    category: '',
    tags: [],
    modules: [],
    accessType: 'free',
    xpRequired: 0,
    price: 0,
    trialEnabled: false,
    trialDays: 7,
    publishType: 'draft',
    publishDate: undefined
  });
  const { user } = useAuth();
  const courseService = CourseService.getInstance();

  const handleTypeSelection = (type: CreationType) => {
    setSelectedType(type);
    setCurrentStep(1);
    setCourseData({
      coverImage: '',
      title: '',
      description: '',
      category: '',
      tags: [],
      modules: [],
      accessType: 'free',
      xpRequired: 0,
      price: 0,
      trialEnabled: false,
      trialDays: 7,
      publishType: 'draft',
      publishDate: undefined
    });
  };

  const handleBackToSelection = () => {
    setSelectedType(null);
    setCurrentStep(1);
  };

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: '',
      description: '',
      lessons: []
    };
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (moduleId: string, field: keyof Module, value: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId ? { ...module, [field]: value } : module
      )
    }));
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      description: '',
      type: 'video',
      files: []
    };
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      )
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, field: keyof Lesson, value: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
              )
            }
          : module
      )
    }));
  };

  const removeModule = (moduleId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: module.lessons.filter(lesson => lesson.id !== lessonId) }
          : module
      )
    }));
  };

  const renderCreationTypeCard = (type: typeof creationTypes[0]) => {
    const Icon = type.icon;

    return (
      <motion.div
        key={type.id}
        whileHover={{ scale: 1.03, y: -8 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-pointer group"
        onClick={() => handleTypeSelection(type.id as CreationType)}
      >
        <Card className="h-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative">
          {/* New Tag */}
          <div className="absolute top-4 right-4 z-20">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✨ New
            </motion.div>
          </div>

          {/* Gradient Header Band */}
          <div
            className={`h-16 bg-gradient-to-r ${type.gradient} relative overflow-hidden`}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }}
            />
          </div>

          <CardContent
            className="p-8 text-center space-y-6 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0 0 24px 24px',
              minHeight: '200px'
            }}
          >
            {/* Icon Container - Positioned to overlap header */}
            <motion.div
              className="relative mx-auto w-20 h-20 -mt-14"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center shadow-xl border-4 border-white bg-gradient-to-br ${type.gradient}`}
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
                }}
              >
                <Icon className="w-10 h-10 text-white" />
              </div>

              {/* Floating Sparkle */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 dark:text-gray-100 dark:group-hover:text-white transition-colors">
                {type.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {type.description}
              </p>
            </div>

            {/* Hover Glow Border */}
            <motion.div
              className="absolute inset-0 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, transparent 0%, rgba(168, 85, 247, 0.1) 50%, transparent 100%)',
                border: '2px solid rgba(168, 85, 247, 0.3)',
                borderTop: 'none'
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderStepperTabs = (steps: string[]) => {
    return (
      <div className="mb-8">
        <div
          className="flex bg-white/60 backdrop-blur-sm rounded-full p-1.5 border border-white/20 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
          }}
        >
          {steps.map((step, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentStep(index + 1)}
              className={cn(
                "flex-1 relative px-4 py-3 rounded-full font-semibold transition-all duration-300 text-sm",
                currentStep === index + 1
                  ? "text-white shadow-lg"
                  : currentStep > index + 1
                    ? "text-emerald-600 hover:text-emerald-700"
                    : "text-gray-500 cursor-not-allowed"
              )}
              style={currentStep === index + 1 ? {
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
              } : {}}
              disabled={currentStep < index + 1}
              whileHover={currentStep >= index + 1 ? { scale: 1.02, y: -2 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-2 relative z-10">
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full transition-colors",
                  currentStep === index + 1
                    ? "bg-white/20 text-white"
                    : currentStep > index + 1
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                )}>
                  {currentStep > index + 1 ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span className={isMobile ? "hidden sm:inline" : ""}>{step}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const renderCourseCreation = () => {
    const steps = ['Details', 'Modules', 'Pricing', 'Publish'];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {renderStepperTabs(steps)}

        {/* Step 1: Course Details */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">📝 Course Details</h3>
              <p className="text-gray-600">Set up your course information and visual identity</p>
            </div>

            {/* Enhanced Banner Upload */}
            <EnhancedBannerUpload
              value={courseData.coverImage}
              onChange={(imageUrl, positioning) => {
                setCourseData(prev => ({
                  ...prev,
                  coverImage: imageUrl,
                  bannerPositioning: positioning
                }));
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Course Title</label>
                <Input
                  value={courseData.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    setCourseData(prev => ({ ...prev, title: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="e.g., Complete React Development Course"
                  className="bg-white/80 backdrop-blur-sm border-gray-200"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Category</label>
                <Select
                  value={courseData.category}
                  onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-200">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description with Rich Text Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Course Description</label>
              <div className="border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm">
                {/* Rich Text Toolbar */}
                <div className="flex items-center space-x-1 p-3 border-b border-gray-200">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Link className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={courseData.description}
                  onChange={(e) => {
                    e.stopPropagation();
                    setCourseData(prev => ({ ...prev, description: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="Describe what students will learn in your course. Use rich formatting to make it engaging..."
                  rows={6}
                  className="border-none focus:ring-0 resize-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Tags (Optional)</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add tags separated by commas (e.g., react, javascript, frontend)"
                  className="bg-white/80 backdrop-blur-sm border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value && !courseData.tags.includes(value)) {
                        setCourseData(prev => ({
                          ...prev,
                          tags: [...prev.tags, value]
                        }));
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                {courseData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {courseData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                          onClick={() => {
                            setCourseData(prev => ({
                              ...prev,
                              tags: prev.tags.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button onClick={handleBackToSelection} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Types
              </Button>
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!courseData.title || !courseData.description || !courseData.category}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white disabled:opacity-50"
              >
                Continue to Modules
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Modules & Lessons */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 max-w-6xl mx-auto"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">📚 Modules & Lessons</h3>
              <p className="text-gray-600">Build your course structure with drag-and-drop modules and lessons</p>
            </div>

            {/* Modules */}
            <div className="space-y-6">
              {courseData.modules.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No modules yet</h4>
                  <p className="text-gray-500 mb-4">Start building your course by adding your first module</p>
                </div>
              )}

              {courseData.modules.map((module, moduleIndex) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Module Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {moduleIndex + 1}
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <Input
                            value={module.title}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateModule(module.id, 'title', e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            placeholder="Module title (e.g., Introduction to React Hooks)"
                            className="text-lg font-semibold border-none bg-transparent p-0 focus:ring-0"
                          />
                          <Textarea
                            value={module.description}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateModule(module.id, 'description', e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            placeholder="Brief description of this module..."
                            rows={2}
                            className="text-sm border-none bg-transparent p-0 focus:ring-0 resize-none"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => removeModule(module.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Lessons */}
                  <div className="p-6 space-y-4">
                    {module.lessons.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No lessons yet. Add your first lesson below.</p>
                      </div>
                    )}
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {/* Lesson Header */}
                        <div className="flex items-start space-x-4 p-4 border-b border-gray-100">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab mt-1" />
                          <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                            {lessonIndex + 1}
                          </div>

                          {/* Lesson Type Icon */}
                          <div className={`p-2 rounded-lg ${
                            lesson.type === 'video' ? 'bg-red-100' :
                            lesson.type === 'text' ? 'bg-blue-100' :
                            'bg-green-100'
                          }`}>
                            {lesson.type === 'video' && <Video className="w-4 h-4 text-red-600" />}
                            {lesson.type === 'text' && <FileText className="w-4 h-4 text-blue-600" />}
                            {lesson.type === 'downloads' && <FileDown className="w-4 h-4 text-green-600" />}
                          </div>

                          <div className="flex-1">
                            <Input
                              value={lesson.title}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateLesson(module.id, lesson.id, 'title', e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              placeholder="Lesson title"
                              className="border-none bg-transparent p-0 focus:ring-0 font-semibold text-base"
                            />
                          </div>

                          {/* Lesson Type Selector */}
                          <Select
                            value={lesson.type}
                            onValueChange={(value) => updateLesson(module.id, lesson.id, 'type', value)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">📹 Video</SelectItem>
                              <SelectItem value="text">📝 Text</SelectItem>
                              <SelectItem value="downloads">📁 Downloads</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={() => removeLesson(module.id, lesson.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Lesson Content */}
                        <div className="p-4">
                          {lesson.type === 'video' && (
                            <div className="space-y-3">
                              <Input
                                value={lesson.videoUrl || ''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateLesson(module.id, lesson.id, 'videoUrl', e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                placeholder="Video URL (YouTube, Vimeo, Loom) or upload file"
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2"
                              />
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Or</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'video/*';
                                    input.onchange = (event) => {
                                      const file = (event.target as HTMLInputElement).files?.[0];
                                      if (file) {
                                        const mockUrl = URL.createObjectURL(file);
                                        updateLesson(module.id, lesson.id, 'videoUrl', mockUrl);
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  Upload Video
                                </Button>
                              </div>
                            </div>
                          )}

                          {lesson.type === 'text' && (
                            <Textarea
                              value={lesson.content || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateLesson(module.id, lesson.id, 'content', e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onFocus={(e) => e.stopPropagation()}
                              placeholder="Write your lesson content here..."
                              rows={4}
                              className="text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none"
                            />
                          )}

                          {lesson.type === 'downloads' && (
                            <div className="space-y-3">
                              <div className="text-sm text-gray-600">
                                Upload files for students to download (PDFs, images, documents, etc.)
                              </div>
                              <div className="space-y-2">
                                {lesson.files && lesson.files.length > 0 && (
                                  <div className="space-y-1">
                                    {lesson.files.map((file, fileIndex) => (
                                      <div key={fileIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                          <FileDown className="w-4 h-4 text-gray-500" />
                                          <span className="text-sm font-medium">{file.name}</span>
                                          <span className="text-xs text-gray-500">({file.type})</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedFiles = lesson.files?.filter((_, i) => i !== fileIndex) || [];
                                            updateLesson(module.id, lesson.id, 'files', updatedFiles);
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.multiple = true;
                                    input.accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.epub';
                                    input.onchange = (event) => {
                                      const files = Array.from((event.target as HTMLInputElement).files || []);
                                      const newFiles = files.map(file => ({
                                        id: `file-${Date.now()}-${Math.random()}`,
                                        name: file.name,
                                        type: file.type || 'application/octet-stream',
                                        url: URL.createObjectURL(file)
                                      }));
                                      const existingFiles = lesson.files || [];
                                      updateLesson(module.id, lesson.id, 'files', [...existingFiles, ...newFiles]);
                                    };
                                    input.click();
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add Download Files
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add Lesson Button */}
                    <Button
                      onClick={() => addLesson(module.id)}
                      variant="ghost"
                      className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson to {module.title || `Module ${moduleIndex + 1}`}
                    </Button>
                  </div>
                </motion.div>
              ))}

              {/* Add Module Button */}
              <Button
                onClick={addModule}
                variant="outline"
                className="w-full py-6 border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Module
              </Button>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button onClick={() => setCurrentStep(1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={courseData.modules.length === 0 || !courseData.modules.some(m => m.lessons.length > 0)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white disabled:opacity-50"
              >
                Continue to Pricing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Access & Pricing */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">💰 Access & Pricing</h3>
              <p className="text-gray-600">Configure how learners can access your course</p>
            </div>

            {/* Access Type Options */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'free', title: 'Free', desc: 'Open to all users', icon: Globe },
                  { id: 'xp', title: 'XP Unlock', desc: 'Requires XP only', icon: Zap },
                  { id: 'xp-copay', title: 'XP + Co-Pay', desc: 'XP + $ amount', icon: Crown },
                  { id: 'paid', title: 'Paid Only', desc: '$ amount only', icon: Lock }
                ].map((option) => (
                  <motion.div
                    key={option.id}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      courseData.accessType === option.id
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setCourseData(prev => ({ ...prev, accessType: option.id as any }))}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <option.icon className="w-8 h-8 mb-3 text-orange-500" />
                    <h4 className="font-semibold">{option.title}</h4>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* XP Slider */}
              {(courseData.accessType === 'xp' || courseData.accessType === 'xp-copay') && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">XP Required</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={courseData.xpRequired}
                      onChange={(e) => setCourseData(prev => ({ ...prev, xpRequired: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0 XP</span>
                      <span className="font-semibold text-orange-600">💎 {courseData.xpRequired} XP</span>
                      <span>1000 XP</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Input */}
              {(courseData.accessType === 'paid' || courseData.accessType === 'xp-copay') && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">Price (USD)</label>
                  <Input
                    type="number"
                    value={courseData.price}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCourseData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    placeholder="49.99"
                    className="bg-white/80 backdrop-blur-sm border-gray-200"
                  />
                </div>
              )}

              {/* Trial Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <h4 className="font-semibold">Free Trial</h4>
                  <p className="text-sm text-gray-600">Allow users to try before they commit</p>
                </div>
                <Button
                  variant={courseData.trialEnabled ? "default" : "outline"}
                  onClick={() => setCourseData(prev => ({ ...prev, trialEnabled: !prev.trialEnabled }))}
                >
                  {courseData.trialEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {courseData.trialEnabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Trial Duration (Days)</label>
                  <Input
                    type="number"
                    value={courseData.trialDays}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCourseData(prev => ({ ...prev, trialDays: parseInt(e.target.value) || 7 }));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    placeholder="7"
                    className="bg-white/80 backdrop-blur-sm border-gray-200"
                  />
                </div>
              )}

              {/* Live Preview */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <h4 className="font-semibold mb-4">Live Preview & Publishing Target</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    {courseData.accessType === 'free' && (
                      <p className="text-green-600 font-medium">✅ This course is free for all learners</p>
                    )}
                    {courseData.accessType === 'xp' && (
                      <p className="text-blue-600 font-medium">💎 Learners need {courseData.xpRequired} XP to unlock</p>
                    )}
                    {courseData.accessType === 'xp-copay' && (
                      <p className="text-purple-600 font-medium">
                        💎 Learners need {courseData.xpRequired} XP + ${courseData.price} to unlock
                      </p>
                    )}
                    {courseData.accessType === 'paid' && (
                      <p className="text-orange-600 font-medium">💰 Learners need ${courseData.price} to unlock</p>
                    )}
                    {courseData.trialEnabled && (
                      <p className="text-sm text-gray-600 mt-2">🎁 {courseData.trialDays}-day free trial included</p>
                    )}
                  </div>

                  {/* Publishing Target */}
                  <div className={`p-4 rounded-lg border-2 ${
                    courseData.accessType === 'free' || courseData.accessType === 'paid'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {courseData.accessType === 'free' || courseData.accessType === 'paid' ? (
                        <>
                          <BookOpen className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">Will be published to Learn Tab</span>
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Will be published to Claim Tab (XP Marketplace)</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {courseData.accessType === 'free' || courseData.accessType === 'paid'
                        ? 'This course will appear in the Learn section alongside other educational content.'
                        : 'This course will appear in the Claim section as part of the XP rewards marketplace.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button onClick={() => setCurrentStep(2)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
              >
                Continue to Publish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Preview & Publish */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">🚀 Preview & Publish</h3>
              <p className="text-gray-600">Review your course and choose how to publish</p>
            </div>

            {/* Course Preview Card */}
            <div className="space-y-6">
              <div
                className="p-6 rounded-xl border border-white/30 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h4 className="font-semibold mb-4">Course Preview</h4>
                <div className="space-y-4">
                  {/* Cover Image */}
                  {courseData.coverImage && (
                    <div className="w-full h-48 rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src={courseData.coverImage}
                        alt="Course cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">{courseData.title}</h3>
                    <p className="text-gray-600">{courseData.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {categories.find(c => c.toLowerCase() === courseData.category)?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {courseData.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons
                      </Badge>
                      <Badge variant="outline">
                        {courseData.modules.length} modules
                      </Badge>
                    </div>

                    {courseData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {courseData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Access & Pricing Recap */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <h4 className="font-semibold mb-4">Access & Pricing</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Access Type:</span>
                    <span className="font-medium capitalize">{courseData.accessType.replace('-', ' + ')}</span>
                  </div>
                  {courseData.xpRequired > 0 && (
                    <div className="flex justify-between">
                      <span>XP Required:</span>
                      <span className="font-medium">💎 {courseData.xpRequired}</span>
                    </div>
                  )}
                  {courseData.price > 0 && (
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">${courseData.price}</span>
                    </div>
                  )}
                  {courseData.trialEnabled && (
                    <div className="flex justify-between">
                      <span>Free Trial:</span>
                      <span className="font-medium">{courseData.trialDays} days</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Publish Options */}
              <div className="space-y-4">
                <h4 className="font-semibold">Publish Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'draft', title: 'Save as Draft', desc: 'Private, only you can see', icon: Eye },
                    { id: 'publish', title: 'Publish Now', desc: 'Live immediately', icon: Globe },
                    { id: 'schedule', title: 'Schedule', desc: 'Pick future date', icon: Calendar }
                  ].map((option) => (
                    <motion.div
                      key={option.id}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        courseData.publishType === option.id
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => setCourseData(prev => ({ ...prev, publishType: option.id as any }))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <option.icon className="w-6 h-6 mb-2 text-green-600" />
                      <h5 className="font-semibold">{option.title}</h5>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {courseData.publishType === 'schedule' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Publish Date</label>
                    <Input
                      type="datetime-local"
                      onChange={(e) => {
                        e.stopPropagation();
                        setCourseData(prev => ({
                          ...prev,
                          publishDate: new Date(e.target.value)
                        }));
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="bg-white/80 backdrop-blur-sm border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button onClick={() => setCurrentStep(3)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pricing
              </Button>
              <Button
                onClick={async () => {
                  if (!user) {
                    toast?.({
                      title: "Authentication Required",
                      description: "Please log in to publish your course.",
                      variant: "destructive"
                    });
                    return;
                  }

                  try {
                    // Convert courseData to Course format
                    const course = CourseService.convertCourseData(
                      courseData,
                      user.uid,
                      user.displayName || 'Anonymous Creator',
                      user.photoURL || undefined
                    );

                    let courseId: string;
                    let targetTab: string;

                    if (courseData.publishType === 'draft') {
                      // Save as draft
                      courseId = await courseService.saveDraft(course);
                      targetTab = 'drafts';
                    } else if (courseData.publishType === 'schedule') {
                      // For scheduled courses, save as draft for now
                      courseId = await courseService.saveDraft(course);
                      targetTab = 'scheduled';
                    } else {
                      // Publish to appropriate tab based on access type
                      courseId = await courseService.publishCourse(course);
                      targetTab = course.accessType === 'free' || course.accessType === 'paid' ? 'Learn' : 'Claim';
                    }

                    // Show success message with tab information
                    toast?.({
                      title: courseData.publishType === 'draft' ? "Course saved!" : "Course published!",
                      description: courseData.publishType === 'draft'
                        ? "Your course has been saved as a draft."
                        : courseData.publishType === 'schedule'
                        ? `Your course will be published on ${courseData.publishDate?.toLocaleDateString()}.`
                        : `Your course is now live in the ${targetTab} tab!`,
                    });

                    if (courseData.publishType === 'publish') {
                      console.log(`🎉 Course published to ${targetTab} tab!`, {
                        courseId,
                        accessType: course.accessType,
                        targetTab
                      });
                    }

                    // Reset for next course
                    handleBackToSelection();
                  } catch (error) {
                    console.error('❌ Error publishing course:', error);
                    toast?.({
                      title: "Publishing Failed",
                      description: "There was an error publishing your course. Please try again.",
                      variant: "destructive"
                    });
                  }
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8"
              >
                <Rocket className="w-4 h-4 mr-2" />
                {courseData.publishType === 'draft' ? 'Save Draft' :
                 courseData.publishType === 'schedule' ? 'Schedule Course' :
                 'Publish Course'}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderGenericCreation = (type: string) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 max-w-2xl mx-auto"
      >
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">Create {type}</h3>
          <p className="text-gray-600">This creation type is coming soon with full workflow support</p>
        </div>

        <div className="p-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
          <Rocket className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
          <h4 className="text-lg font-semibold mb-2">Under Development</h4>
          <p className="text-gray-600 mb-4">
            We're building an amazing {type.toLowerCase()} creation experience with step-by-step workflows,
            XP pricing integration, and premium UI components.
          </p>
          <Button
            onClick={handleBackToSelection}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Creation Hub
          </Button>
        </div>
      </motion.div>
    );
  };

  // Show drafts view if requested
  if (showDrafts) {
    return (
      <DraftsView
        onBack={() => {
          setShowDrafts(false);
          setEditingDraftId(null);
        }}
        onEditDraft={(draftId) => {
          setEditingDraftId(draftId);
          setShowDrafts(false);
          setSelectedType('community');
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className={`mt-16 ${isMobile ? 'px-4' : 'max-w-7xl mx-auto'}`}
    >
      <Card className="overflow-hidden border-0 shadow-2xl">
        <CardContent
          className={`${isMobile ? 'p-6' : 'p-12'} space-y-8`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: isMobile ? '20px' : '24px'
          }}
        >
          {!selectedType ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              {/* Creation Type Grid - Moved to top, removed header since it's now in main hero */}
              <div className={`grid gap-6 ${
                isMobile
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-2 lg:grid-cols-4'
              }`}>
                {creationTypes.map(renderCreationTypeCard)}
              </div>

              {/* View Drafts Section - Slim Card Pill */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 max-w-md mx-auto"
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <CardContent
                    className="px-6 py-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50px'
                    }}
                    onClick={() => {
                      setShowDrafts(true);
                    }}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                        <Save className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white transition-colors duration-300">
                        View Drafts
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* YouTube Connect Section - Restored 3-Step Flow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-12"
              >
                <div className="text-center space-y-6">
                  {/* Or Divider */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-600"></div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">or</span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-600"></div>
                  </div>

                  {/* Main Title */}
                  <h3 className={`font-semibold text-gray-800 dark:text-gray-100 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                    Connect your YouTube channel to start creating on WIZ
                  </h3>
                </div>

                {/* YouTube Connect Component */}
                <YouTubeConnectFlow
                  isMobile={isMobile}
                  onConnect={onYouTubeConnect}
                  channelInfo={channelInfo}
                  videos={videos}
                  selectedVideos={selectedVideos}
                  isConnecting={isConnecting}
                  isLoadingVideos={isLoadingVideos}
                  isPublishing={isPublishing}
                  videoContentTypes={videoContentTypes}
                  onToggleVideoSelection={onToggleVideoSelection}
                  onUpdateVideoContentType={onUpdateVideoContentType}
                  onUpdateVideoCategory={onUpdateVideoCategory}
                  onProceedToCategorize={onProceedToCategorize}
                  onPublishToWiz={onPublishToWiz}
                  toast={toast}
                />
              </motion.div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                {selectedType === 'course' ? (
                  renderCourseCreation()
                ) : selectedType === 'community' ? (
                  <CreateCommunityPage
                    onBack={handleBackToSelection}
                    draftId={editingDraftId || undefined}
                  />
                ) : (
                  renderGenericCreation(creationTypes.find(t => t.id === selectedType)?.title || 'Item')
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};