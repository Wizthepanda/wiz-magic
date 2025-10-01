import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Star,
  Users,
  Heart,
  Share,
  Clock,
  TrendingUp,
  Filter,
  Grid,
  List,
  BookOpen,
  Video,
  Headphones,
  MessageSquare,
  Wrench,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Sparkles,
  Eye,
  Download,
  ExternalLink,
  UserPlus,
  Loader
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WizSidebar } from '@/components/wiz/wiz-sidebar';
import { WizMobileMenu } from '@/components/wiz/WizMobileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { cn } from '@/lib/utils';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Enhanced course data structure for V5.1
interface CourseData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  media: {
    carousel: {
      type: 'video' | 'image';
      thumbnail: string;
      youtubeId?: string;
      duration?: string;
    }[];
  };
  pricing: {
    zapsCost: number;
    usdPrice: number;
    originalPrice: number;
    discount: number;
  };
  stats: {
    rating: number;
    ratingCount: number;
    enrolledCount: number;
    completionRate: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  };
  social: {
    memberAvatars: string[];
    recentClaims: number;
    testimonials: {
      user: string;
      avatar: string;
      comment: string;
      rating: number;
    }[];
  };
  content: {
    lessons: number;
    duration: string;
    modules: {
      title: string;
      lessons: string[];
      duration: string;
    }[];
    features: string[];
  };
  category: 'communities' | 'coaching' | 'digital-products';
  communityTags?: string[];
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;
  isTrending: boolean;
  isNew: boolean;
  isSoldOut?: boolean;
  availability?: {
    total: number;
    remaining: number;
  };
  releaseDate: string;
}

// Placeholder empty array - will be populated from Firestore
const HARDCODED_COURSES: CourseData[] = [
  {
    id: 'ai-mastery-v5-1',
    title: 'AI Mastery Bootcamp 2024',
    description: 'Master AI and machine learning with hands-on projects and real-world applications.',
    longDescription: 'Transform your career with our comprehensive AI Mastery Bootcamp. Learn from industry experts, build real projects, and join a community of AI enthusiasts.',
    creator: {
      name: 'Dr. Sarah Chen',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 45200
    },
    media: {
      carousel: [
        {
          type: 'video',
          thumbnail: '/api/placeholder/800/450',
          youtubeId: 'dQw4w9WgXcQ',
          duration: '2:34'
        },
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        },
        {
          type: 'video',
          thumbnail: '/api/placeholder/800/450',
          youtubeId: 'jNQXAC9IVRw',
          duration: '1:47'
        },
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        },
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        }
      ]
    },
    pricing: {
      zapsCost: 120,
      usdPrice: 89,
      originalPrice: 299,
      discount: 70
    },
    stats: {
      rating: 4.9,
      ratingCount: 2847,
      enrolledCount: 12500,
      completionRate: 87,
      difficulty: 'Intermediate'
    },
    social: {
      memberAvatars: [
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40'
      ],
      recentClaims: 234,
      testimonials: [
        {
          user: 'Alex Kim',
          avatar: '/api/placeholder/40/40',
          comment: 'This course completely changed my career trajectory. Highly recommended!',
          rating: 5
        }
      ]
    },
    content: {
      lessons: 24,
      duration: '8.5 hours',
      modules: [
        {
          title: 'AI Fundamentals',
          lessons: ['Introduction to AI', 'Machine Learning Basics', 'Neural Networks'],
          duration: '2.5 hours'
        }
      ],
      features: [
        '24 comprehensive video lessons',
        'Hands-on coding exercises',
        'Real-world project portfolio'
      ]
    },
    category: 'communities',
    communityTags: ['AI', 'Tech'],
    tags: ['AI', 'Machine Learning', 'Python', 'Deep Learning'],
    isFeatured: true,
    isPopular: true,
    isTrending: true,
    isNew: false,
    releaseDate: '2024-01-15'
  },
  {
    id: 'exclusive-creators-v5-1',
    title: 'Elite Creator Mastermind',
    description: 'Join an exclusive community of top content creators and entrepreneurs.',
    longDescription: 'Connect with like-minded creators, share insights, collaborate on projects, and grow together in our exclusive community.',
    creator: {
      name: 'Creator Hub',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 89500
    },
    media: {
      carousel: [
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        },
        {
          type: 'video',
          thumbnail: '/api/placeholder/800/450',
          youtubeId: 'dQw4w9WgXcQ',
          duration: '3:21'
        },
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        }
      ]
    },
    pricing: {
      zapsCost: 299,
      usdPrice: 149,
      originalPrice: 499,
      discount: 70
    },
    stats: {
      rating: 4.8,
      ratingCount: 1245,
      enrolledCount: 850,
      completionRate: 95,
      difficulty: 'Advanced'
    },
    social: {
      memberAvatars: [
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40'
      ],
      recentClaims: 23,
      testimonials: []
    },
    content: {
      lessons: 0,
      duration: 'Ongoing',
      modules: [],
      features: [
        'Exclusive Discord community',
        'Monthly live masterclasses',
        'Networking events'
      ]
    },
    category: 'communities',
    communityTags: ['Money', 'Self-improvement'],
    tags: ['Community', 'Networking', 'Creator Economy'],
    isFeatured: false,
    isPopular: true,
    isTrending: false,
    isNew: false,
    isSoldOut: true,
    availability: {
      total: 100,
      remaining: 0
    },
    releaseDate: '2023-12-01'
  },
  {
    id: 'business-coaching-v5-1',
    title: '1-on-1 Growth Coaching Session',
    description: 'Personalized business coaching with successful entrepreneurs and mentors.',
    longDescription: 'Get personalized guidance from experienced business coaches who have built and scaled successful companies.',
    creator: {
      name: 'Marcus Williams',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 15600
    },
    media: {
      carousel: [
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        },
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        }
      ]
    },
    pricing: {
      zapsCost: 200,
      usdPrice: 149,
      originalPrice: 299,
      discount: 50
    },
    stats: {
      rating: 4.9,
      ratingCount: 567,
      enrolledCount: 1200,
      completionRate: 95,
      difficulty: 'Advanced'
    },
    social: {
      memberAvatars: [
        '/api/placeholder/40/40',
        '/api/placeholder/40/40'
      ],
      recentClaims: 12,
      testimonials: []
    },
    content: {
      lessons: 1,
      duration: '60 minutes',
      modules: [],
      features: [
        '60-minute 1-on-1 session',
        'Personalized action plan',
        'Follow-up email summary'
      ]
    },
    category: 'coaching',
    tags: ['Business', 'Mentoring', 'Strategy', 'Growth'],
    isFeatured: false,
    isPopular: false,
    isTrending: true,
    isNew: false,
    releaseDate: '2024-02-15'
  },
  {
    id: 'digital-course-v5-1',
    title: 'Complete Digital Marketing Mastery',
    description: 'Master digital marketing from social media to email campaigns and analytics.',
    longDescription: 'Learn the complete digital marketing ecosystem from industry experts who have generated millions in revenue.',
    creator: {
      name: 'Marketing Pro Team',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 32400
    },
    media: {
      carousel: [
        {
          type: 'video',
          thumbnail: '/api/placeholder/800/450',
          youtubeId: 'jNQXAC9IVRw',
          duration: '4:12'
        },
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        },
        {
          type: 'image',
          thumbnail: '/api/placeholder/800/450'
        },
        {
          type: 'video',
          thumbnail: '/api/placeholder/800/450',
          youtubeId: 'dQw4w9WgXcQ',
          duration: '2:56'
        }
      ]
    },
    pricing: {
      zapsCost: 180,
      usdPrice: 97,
      originalPrice: 297,
      discount: 67
    },
    stats: {
      rating: 4.7,
      ratingCount: 1892,
      enrolledCount: 5600,
      completionRate: 83,
      difficulty: 'Intermediate'
    },
    social: {
      memberAvatars: [
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40'
      ],
      recentClaims: 89,
      testimonials: []
    },
    content: {
      lessons: 32,
      duration: '12.5 hours',
      modules: [],
      features: [
        '32 comprehensive lessons',
        'Real campaign templates',
        'Analytics dashboard training'
      ]
    },
    category: 'digital-products',
    tags: ['Marketing', 'Social Media', 'Analytics', 'Business'],
    isFeatured: false,
    isPopular: true,
    isTrending: false,
    isNew: true,
    releaseDate: '2024-03-15'
  }
];

// Category and filter configurations
const categoryConfig = {
  communities: { icon: MessageSquare, label: 'Communities', color: 'purple' },
  coaching: { icon: Users, label: 'Coaching', color: 'green' },
  'digital-products': { icon: BookOpen, label: 'Digital Products', color: 'blue' }
};

const communityFilters = [
  'AI', 'Tech', 'Music', 'Money', 'Health', 'Gaming',
  'Movies', 'News', 'Podcast', 'Art', 'Fashion',
  'Relationships', 'Spirituality', 'Self-improvement'
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'rating', label: 'Highest Rated', icon: Star },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'price', label: 'Price: Low to High', icon: Filter }
];

// Premium ZAPs Balance Component
const ZAPsBalanceBadge: React.FC<{ userZAPs: number }> = ({ userZAPs }) => (
  <motion.div
    className="fixed top-6 right-6 z-40"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
  >
    <div
      className="flex items-center space-x-3 px-5 py-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      }}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="text-sm font-semibold text-gray-800">
        <motion.span
          key={userZAPs}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {userZAPs.toLocaleString()} ZAPs
        </motion.span>
      </div>
    </div>
  </motion.div>
);

// Media Carousel Component for Course Cards
const MediaCarousel: React.FC<{
  media: CourseData['media']['carousel'];
  className?: string;
  autoPlay?: boolean;
}> = ({ media, className, autoPlay = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoPlay, isHovered, media.length]);

  useEffect(() => {
    setImageLoaded(false);
    setLoadingIndex(currentIndex);
  }, [currentIndex]);

  if (media.length === 0) return null;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full"
        >
          <div className="absolute inset-0">
            {/* Loading placeholder */}
            {!imageLoaded && loadingIndex === currentIndex && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <Loader className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            <div
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-all duration-700 hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              style={{ backgroundImage: `url(${media[currentIndex].thumbnail})` }}
              onLoad={() => {
                setImageLoaded(true);
                setLoadingIndex(null);
              }}
            />
            {/* Preload next image */}
            <img
              src={media[(currentIndex + 1) % media.length]?.thumbnail}
              className="hidden"
              alt=""
              loading="lazy"
            />
          </div>

          {/* Media Type Indicator */}
          {media[currentIndex].type === 'video' && (
            <div className="absolute top-3 left-3 z-10">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                <Video className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-medium">
                  {media[currentIndex].duration}
                </span>
              </div>
            </div>
          )}

          {/* Play Button for Video */}
          {media[currentIndex].type === 'video' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/40"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % media.length)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/40"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </>
      )}
    </div>
  );
};

// Dynamic Filter Pills Component
const FilterPills: React.FC<{
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}> = ({ filters, activeFilter, onFilterChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <ScrollArea className="w-full" orientation="horizontal">
        <div
          ref={scrollRef}
          className="flex space-x-3 px-6 py-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filters.map((filter) => (
            <motion.button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={cn(
                "px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-300",
                activeFilter === filter
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter}
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// Enhanced Course Card Component with Media Carousel
const CourseCard: React.FC<{
  course: CourseData;
  userZAPs: number;
  onCourseSelect: (course: CourseData) => void;
  onClaimCourse: (course: CourseData) => void;
  onJoinWaitlist: (course: CourseData) => void;
}> = ({ course, userZAPs, onCourseSelect, onClaimCourse, onJoinWaitlist }) => {
  const canAfford = userZAPs >= course.pricing.zapsCost;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
      onClick={() => onCourseSelect(course)}
    >
      <Card
        className={cn(
          "overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 bg-white/95 backdrop-blur-sm rounded-2xl relative",
          course.isSoldOut && "ring-2 ring-orange-200"
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
        }}
      >
        {/* Media Carousel Section */}
        <div className="relative h-48">
          <MediaCarousel
            media={course.media.carousel}
            className="w-full h-full"
            autoPlay={true}
          />

          {/* Course Badges */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
            {course.isTrending && (
              <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold">
                Trending
              </Badge>
            )}
            {course.isNew && (
              <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs font-bold">
                New
              </Badge>
            )}
            {course.pricing.discount > 0 && (
              <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold">
                {course.pricing.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Sold Out Overlay */}
          {course.isSoldOut && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/50"
              >
                <span className="text-lg font-bold text-gray-900">SOLD OUT</span>
              </motion.div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Creator Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={course.creator.avatar} />
              <AvatarFallback>{course.creator.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {course.creator.name}
                </span>
                {course.creator.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-gray-500">
                {course.creator.followers.toLocaleString()} followers
              </span>
            </div>
          </div>

          {/* Course Title & Description */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
              {course.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Course Stats */}
          <div className="flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(course.stats.rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {course.stats.rating}
              </span>
              <span className="text-xs text-gray-500">
                ({course.stats.ratingCount.toLocaleString()})
              </span>
            </div>

            {/* Difficulty */}
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                course.stats.difficulty === 'Beginner' && "border-green-200 text-green-700",
                course.stats.difficulty === 'Intermediate' && "border-blue-200 text-blue-700",
                course.stats.difficulty === 'Advanced' && "border-red-200 text-red-700"
              )}
            >
              {course.stats.difficulty}
            </Badge>
          </div>

          {/* Social Proof & Pricing */}
          <div className="space-y-3">
            {/* Member Avatars */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {course.social.memberAvatars.slice(0, 4).map((avatar, i) => (
                    <Avatar key={i} className="w-6 h-6 border-2 border-white">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-xs">U</AvatarFallback>
                    </Avatar>
                  ))}
                  {course.social.memberAvatars.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        +{course.social.memberAvatars.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {course.stats.enrolledCount.toLocaleString()} enrolled
                </span>
              </div>

              {/* Course Duration */}
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {course.content.duration}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className={cn(
                    "px-4 py-2 rounded-xl text-white shadow-lg",
                    course.isSoldOut
                      ? "bg-gray-400"
                      : "bg-gradient-to-r from-violet-500 to-purple-600"
                  )}
                  whileHover={{ scale: course.isSoldOut ? 1 : 1.05 }}
                >
                  <span className="font-bold text-sm">
                    {course.pricing.zapsCost} ZAPs
                  </span>
                </motion.div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 line-through">
                      ${course.pricing.originalPrice}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      ${course.pricing.usdPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Share className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Hover Action Button */}
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            initial={false}
          >
            {course.isSoldOut ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinWaitlist(course);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Waitlist
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onClaimCourse(course);
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg"
                disabled={!canAfford}
              >
                {canAfford
                  ? `Claim for ${course.pricing.zapsCost} ZAPs`
                  : 'Insufficient ZAPs'
                }
              </Button>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default function Claim() {
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCommunityFilter, setActiveCommunityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [activeSection, setActiveSection] = useState('claim');
  const [modalLoading, setModalLoading] = useState(false);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useSafeNavigate();
  const isMobile = useIsMobile();
  const userZAPs = 850; // Mock ZAPs - replace with actual user ZAPs

  // Fetch real communities from Firestore
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoadingCourses(true);

        // Query for published communities
        const communitiesQuery = query(
          collection(db, 'communities'),
          where('status', '==', 'published'),
          firestoreLimit(100)
        );

        const snapshot = await getDocs(communitiesQuery);
        const fetchedCourses: CourseData[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Only include if it requires ZAPs or USD (paid communities)
          const zapsRequired = data.zapsRequired || 0;
          const usdCoPay = data.usdCoPay || 0;

          if (zapsRequired > 0 || usdCoPay > 0) {
            fetchedCourses.push({
              id: doc.id,
              title: data.title || 'Untitled Community',
              description: data.shortDescription || data.tagline || '',
              longDescription: data.longDescription || data.shortDescription || '',
              creator: {
                name: data.creatorName || 'Unknown Creator',
                avatar: data.creatorAvatar || '/api/placeholder/60/60',
                verified: false,
                followers: 0
              },
              media: {
                carousel: data.coverMedia?.map((media: any) => ({
                  type: media.type === 'youtube' ? 'video' : 'image',
                  thumbnail: media.thumbnail || media.url || '/api/placeholder/800/450',
                  youtubeId: media.videoId,
                  duration: ''
                })) || []
              },
              pricing: {
                zapsCost: zapsRequired,
                usdPrice: usdCoPay,
                originalPrice: usdCoPay * 2,
                discount: usdCoPay > 0 ? 50 : 0
              },
              stats: {
                rating: 5.0,
                ratingCount: 0,
                enrolledCount: 0,
                completionRate: 0,
                difficulty: 'Beginner' as const
              },
              social: {
                memberAvatars: [],
                recentClaims: 0,
                testimonials: []
              },
              content: {
                lessons: data.modules?.length || 0,
                duration: '',
                modules: data.modules?.map((m: any) => ({
                  title: m.title,
                  lessons: m.videos?.map((v: any) => v.title) || [],
                  duration: ''
                })) || [],
                features: []
              },
              category: 'communities' as const,
              communityTags: data.tags || [],
              tags: data.tags || [],
              isFeatured: false,
              isPopular: false,
              isTrending: true,
              isNew: true,
              releaseDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            });
          }
        });

        console.log(`✅ Loaded ${fetchedCourses.length} published communities for ZAP Rewards`);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Error fetching communities:', error);
        // Fallback to empty array on error
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCommunities();
  }, []);

  const featuredCourses = courses.filter(course => course.isFeatured);

  const filteredCourses = courses.filter(course => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory !== course.category) return false;

    // Apply community filters if communities tab is active
    if (selectedCategory === 'communities' && activeCommunityFilter) {
      return course.communityTags?.includes(activeCommunityFilter);
    }

    return true;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.stats.rating - a.stats.rating;
      case 'newest':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      case 'price':
        return a.pricing.zapsCost - b.pricing.zapsCost;
      default: // popular
        return b.stats.enrolledCount - a.stats.enrolledCount;
    }
  });

  const handleClaimCourse = (course: CourseData) => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    console.log('Claiming course:', course);
  };

  const handleJoinWaitlist = (course: CourseData) => {
    // Handle waitlist join
    console.log('Joining waitlist for:', course);
    // You could show a success message or modal here
  };

  const handleSectionChange = (section: string) => {
    navigate(`/?section=${section}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setActiveCommunityFilter(''); // Reset community filter when changing categories
  };

  const handleCourseSelect = (course: CourseData) => {
    setModalLoading(true);
    // Small delay to show loading state, then set course
    setTimeout(() => {
      setSelectedCourse(course);
      setModalLoading(false);
    }, 100);
  };

  // Redirect if not authenticated
  if (!user && !loading) {
    window.location.href = '/';
    return null;
  }

  // Show loading state during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading ZAPs Marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <WizSidebar
          activeSection="claim"
          onSectionChange={handleSectionChange}
        />
      )}

      {/* ZAPs Balance Badge */}
      <ZAPsBalanceBadge userZAPs={userZAPs} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pb-safe">
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-30 border-b border-white/20 backdrop-blur-xl bg-white/80">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex-shrink-0">
                <WizMobileMenu
                  activeSection={activeSection}
                  onSectionChange={setActiveSection}
                />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">ZAPs Marketplace</h1>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </header>
        )}

        {/* Featured Hero Banner */}
        {featuredCourses.length > 0 && (
          <div className="px-6 pt-6">
            <div className="relative h-[60vh] overflow-hidden rounded-3xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${featuredCourses[0].media.carousel[0].thumbnail})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* Hero Content */}
              <div className="absolute inset-0 flex items-end">
                <div className="p-8 lg:p-12 max-w-3xl">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      {featuredCourses[0].title}
                    </h1>
                    <p className="text-lg text-white/90 mb-6 leading-relaxed max-w-2xl">
                      {featuredCourses[0].description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-5 h-5",
                                i < Math.floor(featuredCourses[0].stats.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-white/40"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-white font-semibold">
                          {featuredCourses[0].stats.rating} ({featuredCourses[0].stats.ratingCount.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-white/80" />
                        <span className="text-white/90">
                          {featuredCourses[0].stats.enrolledCount.toLocaleString()} enrolled
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center space-x-4">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => handleClaimCourse(featuredCourses[0])}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl"
                        >
                          Claim for {featuredCourses[0].pricing.zapsCost} ZAPs
                        </Button>
                      </motion.div>

                      {/* Social Proof */}
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {featuredCourses[0].social.memberAvatars.slice(0, 4).map((avatar, i) => (
                            <Avatar key={i} className="w-8 h-8 border-2 border-white">
                              <AvatarImage src={avatar} />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-white/90 text-sm">
                          +{featuredCourses[0].social.recentClaims} claimed this week
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs & Filters (Sticky) */}
        <div className="sticky top-0 lg:top-0 z-20 backdrop-blur-xl bg-white/90 border-b border-white/20 mt-8">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Browse Marketplace</h2>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center space-x-1 mb-4">
              <button
                onClick={() => handleCategoryChange('all')}
                className={cn(
                  "px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap",
                  selectedCategory === 'all'
                    ? "bg-violet-600 text-white shadow-lg"
                    : "bg-white/60 text-gray-700 hover:bg-white/80"
                )}
              >
                All
              </button>
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={cn(
                      "flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap",
                      selectedCategory === key
                        ? "bg-violet-600 text-white shadow-lg"
                        : "bg-white/60 text-gray-700 hover:bg-white/80"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Community Filters */}
            {selectedCategory === 'communities' && (
              <FilterPills
                filters={communityFilters}
                activeFilter={activeCommunityFilter}
                onFilterChange={setActiveCommunityFilter}
              />
            )}
          </div>
        </div>

        {/* Course Grid */}
        <div className="flex-1 px-6 py-8">
          <div className="grid gap-8 max-w-7xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="wait">
              {sortedCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userZAPs={userZAPs}
                  onCourseSelect={handleCourseSelect}
                  onClaimCourse={handleClaimCourse}
                  onJoinWaitlist={handleJoinWaitlist}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Enhanced Course Detail Modal */}
      <Dialog open={!!selectedCourse || modalLoading} onOpenChange={() => {
        setSelectedCourse(null);
        setModalLoading(false);
      }}>
        <DialogContent
          className="max-w-6xl max-h-[95vh] overflow-hidden p-0 bg-transparent border-0 shadow-none"
          style={{ background: 'transparent' }}
        >
          <AnimatePresence mode="wait">
            {modalLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-96 rounded-3xl bg-white/90 backdrop-blur-xl"
              >
                <div className="text-center">
                  <Loader className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading course details...</p>
                </div>
              </motion.div>
            )}
            {selectedCourse && !modalLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  willChange: 'transform, opacity',
                  contain: 'layout style paint',
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-200 flex items-center justify-center group"
                >
                  <X className="w-5 h-5 text-white group-hover:text-gray-200" />
                </button>

                {/* Hero Media Carousel */}
                <div className="relative h-80">
                  {selectedCourse && (
                    <MediaCarousel
                      media={selectedCourse.media.carousel}
                      className="w-full h-full"
                      autoPlay={false}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Course Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h1 className="text-4xl font-bold text-white mb-4 leading-tight max-w-3xl">
                        {selectedCourse.title}
                      </h1>

                      {/* Stats Row */}
                      <div className="flex items-center space-x-6 text-white/90">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-5 h-5",
                                  i < Math.floor(selectedCourse.stats.rating)
                                    ? "text-yellow-400 fill-current"
                                    : "text-white/40"
                                )}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">
                            {selectedCourse.stats.rating} ({selectedCourse.stats.ratingCount.toLocaleString()})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span>{selectedCourse.stats.enrolledCount.toLocaleString()} enrolled</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5" />
                          <span>{selectedCourse.content.duration}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {/* Creator Info */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedCourse.creator.avatar} />
                      <AvatarFallback className="text-lg font-bold">
                        {selectedCourse.creator.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedCourse.creator.name}
                        </h3>
                        {selectedCourse.creator.verified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-600">
                        {selectedCourse.creator.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">About this course</h4>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {selectedCourse.longDescription}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">What you'll get</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCourse.content.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sticky Action Bar */}
                <div className="sticky bottom-0 p-6 border-t border-gray-200/50 backdrop-blur-xl bg-white/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Pricing */}
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <motion.div
                            className={cn(
                              "px-4 py-2 rounded-xl text-white shadow-lg",
                              selectedCourse.isSoldOut
                                ? "bg-gray-400"
                                : "bg-gradient-to-r from-violet-500 to-purple-600"
                            )}
                            whileHover={{ scale: selectedCourse.isSoldOut ? 1 : 1.05 }}
                          >
                            <span className="font-bold text-lg">
                              {selectedCourse.pricing.zapsCost} ZAPs
                            </span>
                          </motion.div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400 line-through">
                              ${selectedCourse.pricing.originalPrice}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              ${selectedCourse.pricing.usdPrice}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedCourse.pricing.discount}% off limited time
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                        >
                          <Heart className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Save</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                        >
                          <Share className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Share</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Main CTA */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedCourse.isSoldOut ? (
                        <Button
                          onClick={() => handleJoinWaitlist(selectedCourse)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Join Waitlist
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleClaimCourse(selectedCourse)}
                          disabled={userZAPs < selectedCourse.pricing.zapsCost}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {userZAPs >= selectedCourse.pricing.zapsCost
                            ? `Claim for ${selectedCourse.pricing.zapsCost} ZAPs`
                            : 'Insufficient ZAPs'
                          }
                        </Button>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}