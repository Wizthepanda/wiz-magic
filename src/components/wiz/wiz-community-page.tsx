import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Play,
  Users,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Zap,
  X,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FileText,
  Eye,
  Lock,
  Unlock,
  Heart,
  Share2,
  Crown,
  TrendingUp,
  Bookmark,
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { JoinCommunityModal } from '@/components/ui/join-community-modal';

// Enhanced course data with gamification
const featuredHeroCommunity = {
  id: 'hero-ai-mastery',
  title: 'AI Mastery Community',
  creator: 'Dr. Sarah Chen',
  role: 'AI Expert & Educator',
  creatorAvatar: '/Profile Pics/FERA.jpg',
  thumbnail: '/course-thumbnails/ai-mastery.jpg',
  description: 'Join an exclusive community of AI practitioners and experts. Get direct access to Dr. Sarah Chen\'s insights, weekly Q&As, project reviews, and collaboration opportunities with fellow AI enthusiasts.',
  category: 'AI & ML',
  difficulty: 'Beginner',
  duration: '8 weeks',
  members: 15420,
  rating: 4.9,
  reviews: 2834,
  xpRequired: 2500,
  originalPrice: 199,
  isPaid: false,
  lessons: 24,
  completionRate: 78,
  slotsTotal: 5000,
  slotsClaimed: 1200,
  levelRequirement: null,
  isFreeForLevel: 3,
  tags: ['Neural Networks', 'Machine Learning', 'Deep Learning', 'Python'],
  introVideo: 'dQw4w9WgXcQ',
  features: [
    'Weekly live Q&A sessions with Dr. Sarah Chen',
    'Exclusive project collaboration opportunities',
    'Direct access to industry insights and trends',
    'Personalized feedback on your AI projects',
    'Private Discord community with 24/7 support',
    'Monthly guest expert sessions'
  ]
};

const allCourses = [
  {
    id: 1,
    title: 'Creative Video Production Community',
    creator: 'Mike Rodriguez',
    role: 'Video Producer & Creator',
    creatorAvatar: '/Profile Pics/Bogdan.jpg',
    thumbnail: '/course-thumbnails/video-production.jpg',
    description: 'Join a thriving community of video creators. Share projects, get feedback, and collaborate with fellow content creators in this exclusive community.',
    category: 'Video',
    difficulty: 'Intermediate',
    duration: '6 weeks',
    members: 8750,
    rating: 4.8,
    reviews: 1256,
    xpRequired: 1800,
    originalPrice: 149,
    isPaid: false,
    lessons: 18,
    completionRate: 65,
    levelRequirement: 2,
    tags: ['Editing', 'Color Grading', 'Audio'],
    isPopular: true,
    features: [
      'Weekly video critique sessions',
      'Access to premium editing tools and plugins',
      'Collaboration on real client projects',
      'Industry networking opportunities',
      '24/7 creative support community'
    ]
  },
  {
    id: 2,
    title: 'Cryptocurrency & DeFi Fundamentals',
    creator: 'Alex Thompson',
    creatorAvatar: '/Profile Pics/Ale.jpg',
    thumbnail: '/course-thumbnails/crypto-defi.jpg',
    description: 'Navigate the digital economy with confidence and build generational wealth.',
    category: 'Finance',
    difficulty: 'Beginner',
    duration: '4 weeks',
    students: 12300,
    rating: 4.7,
    reviews: 1890,
    xpRequired: 0,
    originalPrice: 99,
    isPaid: false,
    lessons: 16,
    completionRate: 82,
    levelRequirement: null,
    tags: ['Blockchain', 'DeFi', 'Investment'],
    isFree: true
  },
  {
    id: 3,
    title: 'Music Production with AI Tools',
    creator: 'Elena Vasquez',
    creatorAvatar: '/Profile Pics/MadPencil.jpg',
    thumbnail: '/course-thumbnails/music-ai.jpg',
    description: 'Create professional music using cutting-edge AI tools and traditional production.',
    category: 'Music',
    difficulty: 'Intermediate',
    duration: '5 weeks',
    students: 6580,
    rating: 4.6,
    reviews: 892,
    xpRequired: 1200,
    originalPrice: 79,
    isPaid: false,
    lessons: 15,
    completionRate: 71,
    levelRequirement: 1,
    tags: ['AI Music', 'Beat Making', 'Audio Design']
  },
  {
    id: 4,
    title: 'Digital Marketing Strategy 2024',
    creator: 'Ryan Park',
    creatorAvatar: '/Profile Pics/FERA.jpg',
    thumbnail: '/course-thumbnails/digital-marketing.jpg',
    description: 'Build a comprehensive digital marketing strategy that drives real results.',
    category: 'Marketing',
    difficulty: 'Beginner',
    duration: '7 weeks',
    students: 9840,
    rating: 4.8,
    reviews: 1456,
    xpRequired: 2000,
    originalPrice: 159,
    isPaid: false,
    lessons: 21,
    completionRate: 69,
    levelRequirement: null,
    tags: ['Social Media', 'SEO', 'Analytics'],
    isPopular: true
  },
  {
    id: 5,
    title: 'Web3 & NFT Creation Workshop',
    creator: 'Jordan Lee',
    creatorAvatar: '/Profile Pics/Bogdan.jpg',
    thumbnail: '/course-thumbnails/web3-nft.jpg',
    description: 'Dive into Web3 technologies and learn to create, mint, and sell NFTs.',
    category: 'Tech',
    difficulty: 'Advanced',
    duration: '6 weeks',
    students: 4200,
    rating: 4.5,
    reviews: 623,
    xpRequired: 3200,
    originalPrice: 249,
    isPaid: false,
    lessons: 19,
    completionRate: 58,
    levelRequirement: 3,
    tags: ['Smart Contracts', 'NFTs', 'Blockchain']
  },
  {
    id: 6,
    title: 'Advanced Python for Data Science',
    creator: 'Dr. Sarah Chen',
    creatorAvatar: '/Profile Pics/FERA.jpg',
    thumbnail: '/course-thumbnails/python-data.jpg',
    description: 'Master Python for data analysis, visualization, and machine learning applications.',
    category: 'Programming',
    difficulty: 'Advanced',
    duration: '10 weeks',
    students: 7890,
    rating: 4.9,
    reviews: 1234,
    xpRequired: 2800,
    originalPrice: 199,
    isPaid: false,
    lessons: 28,
    completionRate: 74,
    levelRequirement: 2,
    tags: ['Python', 'Data Analysis', 'ML'],
    isPopular: true
  }
];

const categories = [
  { id: 'all', label: 'All Courses', color: 'from-purple-500 to-pink-500', icon: BookOpen },
  { id: 'ai', label: 'AI & ML', color: 'from-blue-500 to-cyan-500', icon: Zap },
  { id: 'video', label: 'Video', color: 'from-red-500 to-orange-500', icon: Play },
  { id: 'music', label: 'Music', color: 'from-pink-500 to-rose-500', icon: Heart },
  { id: 'finance', label: 'Finance', color: 'from-green-500 to-emerald-500', icon: TrendingUp },
  { id: 'marketing', label: 'Marketing', color: 'from-orange-500 to-yellow-500', icon: Target },
  { id: 'tech', label: 'Tech', color: 'from-indigo-500 to-purple-500', icon: BookOpen },
  { id: 'programming', label: 'Programming', color: 'from-gray-600 to-gray-800', icon: FileText }
];

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// XP Balance Component
const XPBalanceCard = ({ xpData }: { xpData: any }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <div
        className="px-6 py-3 rounded-2xl border border-white/20 shadow-lg backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 font-medium">Available XP</div>
            <div className="text-xl font-bold text-purple-600">
              💎 {xpData?.totalXP || 250} XP
            </div>
          </div>
        </div>
      </div>

      {/* Floating sparkles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            y: [-10, -20, -10],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5
          }}
        />
      ))}
    </motion.div>
  );
};

// Featured Hero Course Component
const FeaturedHeroCourse = ({ course, userLevel, setSelectedCourse, setIsModalOpen }: { course: any, userLevel: number, setSelectedCourse: any, setIsModalOpen: any }) => {
  const isFreeForUser = course.isFreeForLevel && userLevel >= course.isFreeForLevel;
  const progressPercentage = (course.slotsClaimed / course.slotsTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      <Card
        className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        onMouseEnter={() => {
          // Add subtle tilt animation
        }}
      >
        <div className="relative aspect-[2.5/1] overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=480&fit=crop&auto=format`;
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />

          {/* Featured badge */}
          <div className="absolute top-6 left-6">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-4 py-2 text-sm font-bold">
              <Sparkles className="w-4 h-4 mr-2" />
              🌟 Featured
            </Badge>
          </div>

          {/* Bookmark save button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
          >
            <Bookmark className="w-4 h-4 text-white" />
          </Button>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-bold text-white mb-3 leading-tight">
                {course.title}
              </h2>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                {course.description}
              </p>

              {/* Instructor and stats */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10 border-2 border-white/30">
                    <AvatarImage src={course.creatorAvatar} />
                    <AvatarFallback>{course.creator[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold">{course.creator}</div>
                    <div className="text-white/70 text-sm">Course Instructor</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-sm">({course.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                </div>
              </div>

              {/* XP Pricing and CTA */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  {isFreeForUser ? (
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-1">
                        <Crown className="w-4 h-4 mr-2" />
                        Free for Level {course.isFreeForLevel}+ users
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl font-bold text-white">
                        💎 {(course.xpRequired || 0).toLocaleString()} XP
                      </div>
                      {course.originalPrice && (
                        <div className="text-white/70 line-through text-lg">
                          ${course.originalPrice}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Availability progress */}
                  <div className="text-white/80 text-sm">
                    {course.slotsClaimed.toLocaleString()} / {course.slotsTotal.toLocaleString()} slots claimed
                  </div>
                  <Progress value={progressPercentage} className="w-64 h-2 bg-white/20" />
                </div>

                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
                  }}
                  onClick={() => {
                    setSelectedCourse(course);
                    setIsModalOpen(true);
                  }}
                >
                  <Play className="w-5 h-5 mr-3" />
                  Start Learning
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Premium Course Card Component
const PremiumCourseCard = ({ course, userLevel, userXP, setSelectedCourse, setIsModalOpen }: { course: any, userLevel: number, userXP: number, setSelectedCourse?: any, setIsModalOpen?: any }) => {
  const canAfford = userXP >= (course?.xpRequired || 0);
  const meetsLevelReq = !course.levelRequirement || userLevel >= course.levelRequirement;
  const isUnlocked = canAfford && meetsLevelReq;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Card
        className={`overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full ${
          !isUnlocked ? 'opacity-75' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Bookmark save button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/60 hover:bg-white/80 backdrop-blur-sm"
        >
          <Bookmark className="w-3 h-3 text-gray-600" />
        </Button>

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format`;
            }}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {course.isPopular && (
              <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 text-xs">
                🔥 Popular
              </Badge>
            )}
            {course.isFree && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 text-xs">
                Free
              </Badge>
            )}
            {course.levelRequirement && (
              <Badge className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white border-0 text-xs">
                Level {course.levelRequirement}+
              </Badge>
            )}
          </div>

          {/* Lock overlay for locked courses */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <Lock className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium">
                  {!canAfford ? `Need ${(course?.xpRequired || 0).toLocaleString()} XP` : `Level ${course.levelRequirement} Required`}
                </div>
              </div>
            </div>
          )}

          {/* Play button overlay */}
          {isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Category and title */}
          <div>
            <Badge variant="secondary" className="text-xs mb-2 bg-blue-100 text-blue-800">
              {course.category}
            </Badge>
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors">
              {course.title}
            </h3>
          </div>

          {/* Instructor */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={course.creatorAvatar} />
              <AvatarFallback className="text-xs">{course.creator[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-700">{course.creator}</p>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{course.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{(course.students / 1000).toFixed(1)}k</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {course.difficulty}
            </Badge>
          </div>

          {/* Completion rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Community completion rate</span>
              <span>{course.completionRate}%</span>
            </div>
            <Progress value={course.completionRate} className="h-2" />
          </div>

          {/* Pricing and CTA */}
          <div className="space-y-3 pt-2">
            {course.isFree ? (
              <div className="text-center">
                <Badge className="bg-green-100 text-green-800 px-4 py-1">Free Course</Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-purple-600">
                      💎 {(course?.xpRequired || 0).toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">XP</span>
                  </div>
                  {course.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ${course.originalPrice}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              className={`w-full rounded-xl font-semibold transition-all duration-300 ${
                isUnlocked
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked && setSelectedCourse && setIsModalOpen) {
                  setSelectedCourse(course);
                  setIsModalOpen(true);
                }
              }}
            >
              {isUnlocked ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  View Course
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Locked
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Category Carousel Component
const CategoryCarousel = ({ title, courses, userLevel, userXP, setSelectedCourse, setIsModalOpen }: { title: string, courses: any[], userLevel: number, userXP: number, setSelectedCourse: any, setIsModalOpen: any }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full p-0 bg-white/80 hover:bg-white border-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full p-0 bg-white/80 hover:bg-white border-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {courses.map((course, index) => (
          <div key={course.id} className="flex-shrink-0 w-80">
            <PremiumCourseCard
              course={course}
              userLevel={userLevel}
              userXP={userXP}
              setSelectedCourse={setSelectedCourse}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

interface WizCommunityPageProps {
  onSectionChange?: (section: string) => void;
}

export const WizCommunityPage = ({ onSectionChange }: WizCommunityPageProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { xpData } = useXp();

  // Mock user level - in real app, get from user profile
  const userLevel = xpData?.currentLevel || 1;
  const userXP = xpData?.totalXP || 250;

  // Filter courses based on search and filters
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           course.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' ||
                             course.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get courses by category for carousels
  const popularCourses = allCourses.filter(course => course.isPopular);
  const freeCourses = allCourses.filter(course => course.isFree);
  const advancedCourses = allCourses.filter(course => course.difficulty === 'Advanced');

  return (
    <div className="relative min-h-screen">
      {/* Floating particles background */}
      <FloatingParticles />

      {/* Premium gradient background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, rgba(250, 250, 255, 0.8) 0%, rgba(245, 245, 255, 0.9) 100%)
          `
        }}
      />

      <div className={cn(
        "max-w-7xl mx-auto space-y-12",
        isMobile ? "p-4 py-8" : "p-6 py-12"
      )}>
        {/* Premium Header */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent",
              isMobile ? "text-4xl" : "text-5xl md:text-6xl"
            )}>
              Community
            </h1>
            <p className={cn(
              "text-gray-600 max-w-3xl leading-relaxed",
              isMobile ? "text-lg" : "text-xl"
            )}>
              Level up your skills with insider-only communities from top creators — unlocked with XP{' '}
              <span
                className="font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent cursor-pointer hover:underline transition-all duration-200"
                onClick={() => {
                  onSectionChange?.('create');
                }}
              >
                or create your own
              </span>.
            </p>
          </div>

          {/* XP Balance Badge */}
          <XPBalanceCard xpData={xpData} />
        </motion.div>

        {/* Search and Premium Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, creators, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-500",
                isMobile ? "text-base" : "text-lg"
              )}
              style={{
                boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)'
              }}
            />
          </div>

          {/* Premium Category Filter Chips */}
          <div className="space-y-4">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-3 pb-2">
                {categories.map(category => {
                  const IconComponent = category.icon;
                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border-2 backdrop-blur-sm",
                        selectedCategory === category.id
                          ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                          : 'bg-white/60 text-gray-700 border-white/40 hover:border-white/60 hover:bg-white/80'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        boxShadow: selectedCategory === category.id
                          ? '0 8px 25px rgba(147, 51, 234, 0.3)'
                          : '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-3 pb-2">
                {difficulties.map(difficulty => (
                  <motion.button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border backdrop-blur-sm",
                      selectedDifficulty === difficulty
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-lg'
                        : 'bg-white/60 text-gray-600 border-white/40 hover:border-white/60 hover:bg-white/80'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {difficulty}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Hero Course */}
        <FeaturedHeroCourse
          course={featuredHeroCommunity}
          userLevel={userLevel}
          setSelectedCourse={setSelectedCourse}
          setIsModalOpen={setIsModalOpen}
        />

        {/* Category Spotlight Carousels */}
        <div className="space-y-12">
          <CategoryCarousel
            title="🔥 Popular This Week"
            courses={popularCourses}
            userLevel={userLevel}
            userXP={userXP}
            setSelectedCourse={setSelectedCourse}
            setIsModalOpen={setIsModalOpen}
          />

          <CategoryCarousel
            title="🎁 Free Courses"
            courses={freeCourses}
            userLevel={userLevel}
            userXP={userXP}
            setSelectedCourse={setSelectedCourse}
            setIsModalOpen={setIsModalOpen}
          />

          <CategoryCarousel
            title="🎯 Advanced Mastery"
            courses={advancedCourses}
            userLevel={userLevel}
            userXP={userXP}
            setSelectedCourse={setSelectedCourse}
            setIsModalOpen={setIsModalOpen}
          />
        </div>

        {/* Course Marketplace Grid */}
        <motion.section
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-800">All Courses</h2>
            <Badge variant="outline" className="px-4 py-2 text-sm">
              {filteredCourses.length} courses found
            </Badge>
          </div>

          <div className={cn(
            "grid gap-8",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <PremiumCourseCard
                  course={course}
                  userLevel={userLevel}
                  userXP={userXP}
                  setSelectedCourse={setSelectedCourse}
                  setIsModalOpen={setIsModalOpen}
                />
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('All');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.section>
      </div>

      {/* Join Community Modal */}
      <JoinCommunityModal
        community={selectedCourse}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
        }}
        userXP={userXP}
        onJoin={() => {
          console.log('Joined community:', selectedCourse?.title);
          // Handle XP deduction and community enrollment
        }}
      />
    </div>
  );
};

export default WizCommunityPage;