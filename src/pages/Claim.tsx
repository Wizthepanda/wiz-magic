import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WizSidebar } from '@/components/wiz/wiz-sidebar';
import { WizMobileMenu } from '@/components/wiz/WizMobileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { cn } from '@/lib/utils';

// Enhanced course data structure for V5.0
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
    type: 'video' | 'image' | 'carousel';
    thumbnail: string;
    videoUrl?: string;
    youtubeId?: string;
    images?: string[];
    duration?: string;
  };
  pricing: {
    xpCost: number;
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
  category: 'courses' | 'coaching' | 'communities' | 'tools';
  tags: string[];
  isFeatured: boolean;
  isPopular: boolean;
  isTrending: boolean;
  isNew: boolean;
  releaseDate: string;
}

// Mock V5.0 course data with rich content
const courses: CourseData[] = [
  {
    id: 'ai-mastery-v5',
    title: 'AI Mastery Bootcamp 2024',
    description: 'Master AI and machine learning with hands-on projects and real-world applications.',
    longDescription: 'Transform your career with our comprehensive AI Mastery Bootcamp. Learn from industry experts, build real projects, and join a community of AI enthusiasts. This course covers everything from fundamentals to advanced deep learning techniques.',
    creator: {
      name: 'Dr. Sarah Chen',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 45200
    },
    media: {
      type: 'video',
      thumbnail: '/api/placeholder/800/450',
      youtubeId: 'dQw4w9WgXcQ',
      duration: '2:34'
    },
    pricing: {
      xpCost: 120,
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
        },
        {
          user: 'Maria Rodriguez',
          avatar: '/api/placeholder/40/40',
          comment: 'Excellent content and amazing community support.',
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
        },
        {
          title: 'Deep Learning',
          lessons: ['CNN Architecture', 'RNN and LSTM', 'Transformer Models'],
          duration: '3.2 hours'
        },
        {
          title: 'Real-World Projects',
          lessons: ['Image Classification', 'NLP Applications', 'Deployment Strategies'],
          duration: '2.8 hours'
        }
      ],
      features: [
        '24 comprehensive video lessons',
        'Hands-on coding exercises',
        'Real-world project portfolio',
        'Certificate of completion',
        'Lifetime access',
        'Community forum access'
      ]
    },
    category: 'courses',
    tags: ['AI', 'Machine Learning', 'Python', 'Deep Learning'],
    isFeatured: true,
    isPopular: true,
    isTrending: true,
    isNew: false,
    releaseDate: '2024-01-15'
  },
  {
    id: 'digital-storytelling-v5',
    title: 'Cinematic Digital Storytelling',
    description: 'Create compelling narratives that captivate audiences across digital platforms.',
    longDescription: 'Learn the art of digital storytelling from award-winning filmmakers and content creators. Master the techniques used by top brands and creators to engage millions of viewers.',
    creator: {
      name: 'James Morrison',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 28700
    },
    media: {
      type: 'video',
      thumbnail: '/api/placeholder/800/450',
      youtubeId: 'jNQXAC9IVRw',
      duration: '1:47'
    },
    pricing: {
      xpCost: 95,
      usdPrice: 79,
      originalPrice: 199,
      discount: 60
    },
    stats: {
      rating: 4.8,
      ratingCount: 1892,
      enrolledCount: 8400,
      completionRate: 92,
      difficulty: 'Beginner'
    },
    social: {
      memberAvatars: [
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40'
      ],
      recentClaims: 156,
      testimonials: [
        {
          user: 'Sophie Turner',
          avatar: '/api/placeholder/40/40',
          comment: 'My storytelling skills improved dramatically. Amazing course!',
          rating: 5
        }
      ]
    },
    content: {
      lessons: 18,
      duration: '6.2 hours',
      modules: [
        {
          title: 'Story Fundamentals',
          lessons: ['Hero\'s Journey', 'Character Development', 'Plot Structure'],
          duration: '2.1 hours'
        },
        {
          title: 'Digital Techniques',
          lessons: ['Visual Narrative', 'Sound Design', 'Editing Mastery'],
          duration: '2.3 hours'
        },
        {
          title: 'Platform Optimization',
          lessons: ['YouTube Storytelling', 'Instagram Stories', 'TikTok Narratives'],
          duration: '1.8 hours'
        }
      ],
      features: [
        '18 expert-led lessons',
        'Story template library',
        'Peer feedback community',
        'Live monthly Q&A sessions',
        'Mobile-friendly content'
      ]
    },
    category: 'courses',
    tags: ['Storytelling', 'Content Creation', 'Video', 'Creative'],
    isFeatured: false,
    isPopular: true,
    isTrending: false,
    isNew: true,
    releaseDate: '2024-03-01'
  },
  {
    id: 'business-coaching-v5',
    title: '1-on-1 Growth Coaching Session',
    description: 'Personalized business coaching with successful entrepreneurs and mentors.',
    longDescription: 'Get personalized guidance from experienced business coaches who have built and scaled successful companies. Each session is tailored to your specific challenges and goals.',
    creator: {
      name: 'Marcus Williams',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 15600
    },
    media: {
      type: 'image',
      thumbnail: '/api/placeholder/800/450'
    },
    pricing: {
      xpCost: 200,
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
        '/api/placeholder/40/40',
        '/api/placeholder/40/40'
      ],
      recentClaims: 23,
      testimonials: [
        {
          user: 'David Chen',
          avatar: '/api/placeholder/40/40',
          comment: 'Marcus helped me scale my startup to 7 figures. Incredible value!',
          rating: 5
        }
      ]
    },
    content: {
      lessons: 1,
      duration: '60 minutes',
      modules: [
        {
          title: 'Personalized Coaching Session',
          lessons: ['1-on-1 Strategy Session', 'Action Plan Development', 'Follow-up Resources'],
          duration: '60 minutes'
        }
      ],
      features: [
        '60-minute 1-on-1 session',
        'Personalized action plan',
        'Follow-up email summary',
        'Resource recommendations',
        'LinkedIn connection'
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
    id: 'creator-community-v5',
    title: 'Elite Creator Community',
    description: 'Join an exclusive community of top content creators and entrepreneurs.',
    longDescription: 'Connect with like-minded creators, share insights, collaborate on projects, and grow together in our exclusive community. Access monthly masterclasses, networking events, and collaboration opportunities.',
    creator: {
      name: 'Creator Hub',
      avatar: '/api/placeholder/60/60',
      verified: true,
      followers: 89500
    },
    media: {
      type: 'carousel',
      thumbnail: '/api/placeholder/800/450',
      images: [
        '/api/placeholder/800/450',
        '/api/placeholder/800/450',
        '/api/placeholder/800/450'
      ]
    },
    pricing: {
      xpCost: 150,
      usdPrice: 49,
      originalPrice: 99,
      discount: 51
    },
    stats: {
      rating: 4.7,
      ratingCount: 3245,
      enrolledCount: 5600,
      completionRate: 78,
      difficulty: 'Beginner'
    },
    social: {
      memberAvatars: [
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40',
        '/api/placeholder/40/40'
      ],
      recentClaims: 89,
      testimonials: [
        {
          user: 'Emma Wilson',
          avatar: '/api/placeholder/40/40',
          comment: 'The networking opportunities alone are worth 10x the price!',
          rating: 5
        }
      ]
    },
    content: {
      lessons: 0,
      duration: 'Ongoing',
      modules: [
        {
          title: 'Community Access',
          lessons: ['Discord Server', 'Monthly Masterclasses', 'Networking Events'],
          duration: 'Ongoing'
        }
      ],
      features: [
        'Exclusive Discord community',
        'Monthly live masterclasses',
        'Networking events',
        'Collaboration board',
        'Resource library',
        'Creator spotlight opportunities'
      ]
    },
    category: 'communities',
    tags: ['Community', 'Networking', 'Collaboration', 'Creator Economy'],
    isFeatured: false,
    isPopular: true,
    isTrending: false,
    isNew: false,
    releaseDate: '2023-12-01'
  }
];

// Category icons and filters
const categoryConfig = {
  courses: { icon: BookOpen, label: 'Courses', color: 'blue' },
  coaching: { icon: Users, label: 'Coaching', color: 'green' },
  communities: { icon: MessageSquare, label: 'Communities', color: 'purple' },
  tools: { icon: Wrench, label: 'Tools', color: 'orange' }
};

const sortOptions = [
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'rating', label: 'Highest Rated', icon: Star },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'price', label: 'Price: Low to High', icon: Filter }
];

// Premium XP Balance Component
const XPBalanceBadge: React.FC<{ userXP: number }> = ({ userXP }) => (
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
          key={userXP}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {userXP.toLocaleString()} XP
        </motion.span>
      </div>
    </div>
  </motion.div>
);

// Hero Section with Rotating Featured Courses
const HeroSection: React.FC<{
  featuredCourses: CourseData[];
  onCourseSelect: (course: CourseData) => void;
  onClaimCourse: (course: CourseData) => void;
}> = ({ featuredCourses, onCourseSelect, onClaimCourse }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || featuredCourses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredCourses.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredCourses.length]);

  const currentCourse = featuredCourses[currentIndex];
  if (!currentCourse) return null;

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-3xl mx-6 mt-6 mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCourse.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          {/* Background Image/Video */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentCourse.media.thumbnail})` }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          {/* Play Button Overlay */}
          {currentCourse.media.type === 'video' && (
            <motion.button
              className="absolute inset-0 flex items-center justify-center group"
              onClick={() => onCourseSelect(currentCourse)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:bg-white transition-all duration-300 shadow-2xl">
                <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
              </div>
            </motion.button>
          )}

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="p-8 lg:p-12 max-w-3xl">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {/* Course Badges */}
                <div className="flex items-center space-x-3 mb-4">
                  {currentCourse.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                      Featured
                    </Badge>
                  )}
                  {currentCourse.isTrending && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold">
                      Trending
                    </Badge>
                  )}
                  {currentCourse.isNew && (
                    <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold">
                      New
                    </Badge>
                  )}
                </div>

                {/* Course Title */}
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {currentCourse.title}
                </h1>

                {/* Course Description */}
                <p className="text-lg lg:text-xl text-white/90 mb-6 leading-relaxed max-w-2xl">
                  {currentCourse.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center space-x-6 mb-8">
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i < Math.floor(currentCourse.stats.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-white/40"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-white font-semibold">
                      {currentCourse.stats.rating} ({currentCourse.stats.ratingCount.toLocaleString()})
                    </span>
                  </div>

                  {/* Enrolled Count */}
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-white/80" />
                    <span className="text-white/90">
                      {currentCourse.stats.enrolledCount.toLocaleString()} enrolled
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-white/80" />
                    <span className="text-white/90">
                      {currentCourse.content.duration}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => onClaimCourse(currentCourse)}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl"
                    >
                      Claim for {currentCourse.pricing.xpCost} XP
                    </Button>
                  </motion.div>

                  <Button
                    variant="outline"
                    onClick={() => onCourseSelect(currentCourse)}
                    className="border-white/30 text-white hover:bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm"
                  >
                    Learn More
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center space-x-4 mt-6">
                  <div className="flex -space-x-2">
                    {currentCourse.social.memberAvatars.slice(0, 5).map((avatar, i) => (
                      <Avatar key={i} className="w-10 h-10 border-2 border-white">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-white/90 text-sm">
                    +{currentCourse.social.recentClaims} claimed this week
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      {featuredCourses.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredCourses.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {featuredCourses.length > 1 && (
        <>
          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev - 1 + featuredCourses.length) % featuredCourses.length);
              setIsAutoPlaying(false);
            }}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % featuredCourses.length);
              setIsAutoPlaying(false);
            }}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}
    </div>
  );
};

export default function Claim() {
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeSection, setActiveSection] = useState('claim');
  const { user, loading } = useAuth();
  const navigate = useSafeNavigate();
  const isMobile = useIsMobile();
  const userXP = 850; // Mock XP - replace with actual user XP

  const featuredCourses = courses.filter(course => course.isFeatured);

  const filteredCourses = courses.filter(course => {
    if (selectedCategory === 'all') return true;
    return course.category === selectedCategory;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.stats.rating - a.stats.rating;
      case 'newest':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      case 'price':
        return a.pricing.xpCost - b.pricing.xpCost;
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
    // Handle course claim logic
  };

  const handleSectionChange = (section: string) => {
    navigate(`/?section=${section}`);
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
          <p className="text-sm text-gray-600">Loading XP Marketplace...</p>
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

      {/* XP Balance Badge */}
      <XPBalanceBadge userXP={userXP} />

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
              <h1 className="text-lg font-semibold text-gray-900">XP Marketplace</h1>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </header>
        )}

        {/* Hero Section */}
        <HeroSection
          featuredCourses={featuredCourses}
          onCourseSelect={setSelectedCourse}
          onClaimCourse={handleClaimCourse}
        />

        {/* Filter & Category Bar (Sticky) */}
        <div className="sticky top-0 lg:top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Browse Courses</h2>

            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === 'grid'
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === 'list'
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

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
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
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
                  onClick={() => setSelectedCategory(key)}
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
        </div>

        {/* Course Grid */}
        <div className="flex-1 px-6 py-8">
          <div className={cn(
            "grid gap-6 max-w-7xl mx-auto",
            viewMode === 'grid'
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          )}>
            <AnimatePresence mode="wait">
              {sortedCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  {/* Premium Course Card with Social Proof */}
                  <Card
                    className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 bg-white/95 backdrop-blur-sm rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    {/* Media Section */}
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${course.media.thumbnail})` }}
                      />

                      {/* Media Type Indicator */}
                      {course.media.type === 'video' && (
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                            <Video className="w-3 h-3 text-white" />
                            <span className="text-xs text-white font-medium">
                              {course.media.duration}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Course Badges */}
                      <div className="absolute top-4 right-4 flex flex-col space-y-2">
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

                      {/* Play Button Overlay */}
                      {course.media.type === 'video' && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                            <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                          </div>
                        </motion.div>
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
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                              whileHover={{ scale: 1.05 }}
                            >
                              <span className="font-bold text-sm">
                                {course.pricing.xpCost} XP
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
                            >
                              <Heart className="w-4 h-4 text-gray-600" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
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
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimCourse(course);
                          }}
                          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg"
                          disabled={userXP < course.pricing.xpCost}
                        >
                          {userXP >= course.pricing.xpCost
                            ? `Claim for ${course.pricing.xpCost} XP`
                            : 'Insufficient XP'
                          }
                        </Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Cinematic Course Detail Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent
          className="max-w-6xl max-h-[95vh] overflow-hidden p-0 bg-transparent border-0 shadow-none"
          style={{
            background: 'transparent',
          }}
        >
          <AnimatePresence>
            {selectedCourse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-200 flex items-center justify-center group"
                >
                  <X className="w-5 h-5 text-white group-hover:text-gray-200" />
                </button>

                {/* Hero Section */}
                <div className="relative h-80 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedCourse.media.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Video Play Button */}
                  {selectedCourse.media.type === 'video' && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl cursor-pointer">
                        <Play className="w-10 h-10 text-gray-900 ml-2" fill="currentColor" />
                      </div>
                    </motion.div>
                  )}

                  {/* Course Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Badges */}
                      <div className="flex items-center space-x-3 mb-4">
                        {selectedCourse.isFeatured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold">
                            Featured
                          </Badge>
                        )}
                        {selectedCourse.isTrending && (
                          <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold">
                            Trending
                          </Badge>
                        )}
                        {selectedCourse.isNew && (
                          <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold">
                            New
                          </Badge>
                        )}
                      </div>

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
                        <Badge variant="outline" className="border-white/30 text-white">
                          {selectedCourse.stats.difficulty}
                        </Badge>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
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

                  {/* Tabs */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-2xl p-1">
                      <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="content" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Content
                      </TabsTrigger>
                      <TabsTrigger value="community" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Community
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
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

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-2xl">
                          <div className="text-2xl font-bold text-violet-600">
                            {selectedCourse.content.lessons}
                          </div>
                          <div className="text-sm text-gray-600">Lessons</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-2xl">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedCourse.stats.completionRate}%
                          </div>
                          <div className="text-sm text-gray-600">Completion</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-2xl">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedCourse.stats.enrolledCount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Students</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-2xl">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedCourse.content.duration}
                          </div>
                          <div className="text-sm text-gray-600">Duration</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="content" className="space-y-6 mt-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Course modules</h4>
                        <div className="space-y-4">
                          {selectedCourse.content.modules.map((module, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 border border-gray-200 rounded-2xl hover:border-violet-200 transition-colors duration-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-gray-900">{module.title}</h5>
                                <span className="text-sm text-gray-500">{module.duration}</span>
                              </div>
                              <div className="space-y-2">
                                {module.lessons.map((lesson, lessonIndex) => (
                                  <div key={lessonIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Video className="w-4 h-4 text-violet-500" />
                                    <span>{lesson}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="community" className="space-y-6 mt-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Student testimonials</h4>
                        <div className="space-y-4">
                          {selectedCourse.social.testimonials.map((testimonial, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 bg-gray-50 rounded-2xl"
                            >
                              <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={testimonial.avatar} />
                                  <AvatarFallback>{testimonial.user[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900">{testimonial.user}</div>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "w-4 h-4",
                                          i < testimonial.rating
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                            </motion.div>
                          ))}
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center justify-center space-x-4 p-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl">
                          <div className="flex -space-x-2">
                            {selectedCourse.social.memberAvatars.slice(0, 8).map((avatar, i) => (
                              <Avatar key={i} className="w-10 h-10 border-2 border-white">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">
                              +{selectedCourse.social.recentClaims} students joined this week
                            </div>
                            <div className="text-sm text-gray-600">
                              Join the community of learners
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sticky Action Bar */}
                <div className="sticky bottom-0 p-6 border-t border-gray-200/50 backdrop-blur-xl bg-white/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Pricing */}
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <motion.div
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className="font-bold text-lg">
                              {selectedCourse.pricing.xpCost} XP
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

                    {/* Claim Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleClaimCourse(selectedCourse)}
                        disabled={userXP < selectedCourse.pricing.xpCost}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {userXP >= selectedCourse.pricing.xpCost
                          ? `Claim for ${selectedCourse.pricing.xpCost} XP`
                          : 'Insufficient XP'
                        }
                      </Button>
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