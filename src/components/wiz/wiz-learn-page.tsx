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
  Share2
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

// Mock data for courses
const featuredCourses = [
  {
    id: 1,
    title: "AI Mastery: From Zero to Hero",
    creator: "Dr. Sarah Chen",
    creatorAvatar: "/Profile Pics/FERA.jpg",
    thumbnail: "/course-thumbnails/ai-mastery.jpg",
    description: "Master artificial intelligence from fundamentals to advanced applications. Learn neural networks, machine learning, and deep learning with hands-on projects.",
    category: "AI",
    difficulty: "Beginner",
    duration: "8 weeks",
    students: 15420,
    rating: 4.9,
    reviews: 2834,
    xpReward: 2500,
    isPaid: false,
    price: 0,
    lessons: 24,
    curriculum: [
      { title: "Introduction to AI", duration: "45 min", completed: false },
      { title: "Machine Learning Basics", duration: "60 min", completed: false },
      { title: "Neural Networks Deep Dive", duration: "75 min", completed: false },
      { title: "Practical AI Projects", duration: "90 min", completed: false }
    ],
    introVideo: "dQw4w9WgXcQ"
  },
  {
    id: 2,
    title: "Creative Video Production",
    creator: "Mike Rodriguez",
    creatorAvatar: "/Profile Pics/Bogdan.jpg",
    thumbnail: "/course-thumbnails/video-production.jpg",
    description: "Learn professional video production techniques used by top creators. From scripting to post-production workflows.",
    category: "Video",
    difficulty: "Intermediate",
    duration: "6 weeks",
    students: 8750,
    rating: 4.8,
    reviews: 1256,
    xpReward: 1800,
    isPaid: true,
    price: 99,
    lessons: 18,
    curriculum: [
      { title: "Pre-Production Planning", duration: "40 min", completed: false },
      { title: "Camera Techniques", duration: "55 min", completed: false },
      { title: "Lighting Mastery", duration: "50 min", completed: false },
      { title: "Post-Production Magic", duration: "70 min", completed: false }
    ],
    introVideo: "dQw4w9WgXcQ"
  },
  {
    id: 3,
    title: "Cryptocurrency & DeFi Fundamentals",
    creator: "Alex Thompson",
    creatorAvatar: "/Profile Pics/Ale.jpg",
    thumbnail: "/course-thumbnails/crypto-defi.jpg",
    description: "Understand blockchain technology, cryptocurrencies, and decentralized finance. Navigate the digital economy with confidence.",
    category: "Finance",
    difficulty: "Beginner",
    duration: "4 weeks",
    students: 12300,
    rating: 4.7,
    reviews: 1890,
    xpReward: 1500,
    isPaid: true,
    price: 149,
    lessons: 16,
    curriculum: [
      { title: "Blockchain Basics", duration: "35 min", completed: false },
      { title: "Cryptocurrency Overview", duration: "45 min", completed: false },
      { title: "DeFi Protocols", duration: "60 min", completed: false },
      { title: "Investment Strategies", duration: "50 min", completed: false }
    ],
    introVideo: "dQw4w9WgXcQ"
  }
];

const allCourses = [
  ...featuredCourses,
  {
    id: 4,
    title: "Music Production with AI",
    creator: "Elena Vasquez",
    creatorAvatar: "/Profile Pics/MadPencil.jpg",
    thumbnail: "/course-thumbnails/music-ai.jpg",
    description: "Create professional music using AI tools and traditional production techniques.",
    category: "Music",
    difficulty: "Intermediate",
    duration: "5 weeks",
    students: 6580,
    rating: 4.6,
    reviews: 892,
    xpReward: 1200,
    isPaid: false,
    price: 0,
    lessons: 15,
    curriculum: [
      { title: "AI Music Tools Overview", duration: "30 min", completed: false },
      { title: "Beat Making with AI", duration: "45 min", completed: false },
      { title: "Melody Generation", duration: "40 min", completed: false }
    ],
    introVideo: "dQw4w9WgXcQ"
  },
  {
    id: 5,
    title: "Digital Marketing Mastery",
    creator: "Ryan Park",
    creatorAvatar: "/Profile Pics/FERA.jpg",
    thumbnail: "/course-thumbnails/digital-marketing.jpg",
    description: "Build a comprehensive digital marketing strategy that drives results and grows your audience.",
    category: "Marketing",
    difficulty: "Beginner",
    duration: "7 weeks",
    students: 9840,
    rating: 4.8,
    reviews: 1456,
    xpReward: 2000,
    isPaid: true,
    price: 79,
    lessons: 21,
    curriculum: [
      { title: "Marketing Fundamentals", duration: "40 min", completed: false },
      { title: "Social Media Strategy", duration: "50 min", completed: false },
      { title: "Content Creation", duration: "60 min", completed: false }
    ],
    introVideo: "dQw4w9WgXcQ"
  },
  {
    id: 6,
    title: "Web3 & NFT Creation",
    creator: "Jordan Lee",
    creatorAvatar: "/Profile Pics/Bogdan.jpg",
    thumbnail: "/course-thumbnails/web3-nft.jpg",
    description: "Dive into Web3 technologies and learn how to create, mint, and sell NFTs on various platforms.",
    category: "Tech",
    difficulty: "Advanced",
    duration: "6 weeks",
    students: 4200,
    rating: 4.5,
    reviews: 623,
    xpReward: 1800,
    isPaid: true,
    price: 199,
    lessons: 19,
    curriculum: [
      { title: "Web3 Introduction", duration: "45 min", completed: false },
      { title: "Smart Contracts", duration: "60 min", completed: false },
      { title: "NFT Creation", duration: "55 min", completed: false }
    ],
    introVideo: "dQw4w9WgXcQ"
  }
];

const categories = [
  { id: 'all', label: 'All Courses', color: 'bg-purple-500' },
  { id: 'ai', label: 'AI & ML', color: 'bg-blue-500' },
  { id: 'video', label: 'Video', color: 'bg-red-500' },
  { id: 'music', label: 'Music', color: 'bg-pink-500' },
  { id: 'finance', label: 'Finance', color: 'bg-green-500' },
  { id: 'marketing', label: 'Marketing', color: 'bg-orange-500' },
  { id: 'tech', label: 'Tech', color: 'bg-indigo-500' }
];

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const WizLearnPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLessonViewer, setIsLessonViewer] = useState(false);
  const [expandedCurriculum, setExpandedCurriculum] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('transcript');
  const featuredRef = useRef(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { addXP } = useXp();

  // Filter courses based on search and filters
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDifficulty = selectedDifficulty === 'All' || 
                             course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleEnroll = (course) => {
    // Simulate enrollment
    console.log('Enrolled in:', course.title);
    // Add enrollment logic here
  };

  const handleStartLesson = (course) => {
    setSelectedCourse(course);
    setIsLessonViewer(true);
    setCurrentLesson(0);
    setLessonProgress(0);
  };

  const handleCompleteLesson = () => {
    if (selectedCourse) {
      const xpEarned = Math.floor(selectedCourse.xpReward / selectedCourse.lessons);
      addXP(xpEarned, 'Lesson Completed');
      setLessonProgress(prev => Math.min(prev + (100 / selectedCourse.lessons), 100));
      
      if (currentLesson < selectedCourse.curriculum.length - 1) {
        setCurrentLesson(prev => prev + 1);
      } else {
        // Course completed
        addXP(selectedCourse.xpReward * 0.2, 'Course Completed'); // Bonus XP
      }
    }
  };

  const scrollFeatured = (direction) => {
    if (featuredRef.current) {
      const scrollAmount = 400;
      featuredRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <FloatingParticles />
      
      <div className={cn(
        "max-w-7xl mx-auto space-y-8",
        isMobile ? "p-4" : "p-6"
      )}>
        {/* Header */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              🎓 Learn
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Level up your skills with courses by top creators
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all",
                  isMobile ? "text-base" : "text-sm"
                )}
              />
            </div>

            {/* Category Filter Chips (Mobile-first design) */}
            <div className="space-y-3">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-2 pb-2">
                  <motion.button
                    key="all"
                    onClick={() => setSelectedCategory('all')}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2",
                      selectedCategory === 'all'
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                        : 'bg-white/80 text-gray-700 border-gray-200 hover:border-purple-300'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    All Categories
                  </motion.button>
                  {categories.map(category => (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2",
                        selectedCategory === category.id
                          ? `${category.color} text-white border-transparent shadow-lg`
                          : 'bg-white/80 text-gray-700 border-gray-200 hover:border-purple-300'
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {category.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter Chips */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-2 pb-2">
                  {difficulties.map(difficulty => (
                    <motion.button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2",
                        selectedDifficulty === difficulty
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg'
                          : 'bg-white/80 text-gray-700 border-gray-200 hover:border-indigo-300'
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
          </div>
        </motion.div>

        {/* Featured Courses Carousel */}
        <motion.section 
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Featured Courses</h2>
            {!isMobile && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollFeatured('left')}
                  className="w-10 h-10 rounded-full p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollFeatured('right')}
                  className="w-10 h-10 rounded-full p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div
            ref={featuredRef}
            className={cn(
              "flex gap-6 overflow-x-auto scrollbar-hide",
              isMobile ? "pb-4" : ""
            )}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                className={cn(
                  "flex-shrink-0",
                  isMobile ? "w-72 max-w-[85vw]" : "w-80 max-w-[90vw]"
                )}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group cursor-pointer overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&auto=format`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Course Type Badge */}
                    <div className="absolute top-4 left-4">
                      {course.isPaid ? (
                        <Badge className="bg-yellow-500 text-yellow-900 border-0 flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>Premium</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white border-0 flex items-center space-x-1">
                          <Unlock className="w-3 h-3" />
                          <span>Free</span>
                        </Badge>
                      )}
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <Play className="w-8 h-8 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={course.creatorAvatar} />
                          <AvatarFallback>{course.creator[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-gray-600">{course.creator}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-purple-600 font-semibold">
                        <Zap className="w-4 h-4" />
                        <span>{course.xpReward} XP</span>
                      </div>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                          onClick={() => setSelectedCourse(course)}
                        >
                          View Course
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <CourseDetailModal course={course} onEnroll={handleEnroll} onStartLesson={handleStartLesson} />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Course Library Grid */}
        <motion.section 
          className="space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-800">Course Library</h2>
          
          <div className={cn(
            "grid gap-6",
            "grid-cols-1",
            "sm:grid-cols-2",
            "lg:grid-cols-3",
            "xl:grid-cols-4"
          )}>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <CourseCard course={course} onEnroll={handleEnroll} onStartLesson={handleStartLesson} />
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, onEnroll, onStartLesson }) => {
  const isMobile = useIsMobile();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&auto=format`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Course Type and XP */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              {course.isPaid ? (
                <Badge className="bg-yellow-500/90 text-yellow-900 border-0 text-xs">
                  ${course.price}
                </Badge>
              ) : (
                <Badge className="bg-green-500/90 text-white border-0 text-xs">
                  Free
                </Badge>
              )}
            </div>

            <div className="absolute top-3 right-3">
              <Badge className="bg-purple-500/90 text-white border-0 text-xs flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{course.xpReward}</span>
              </Badge>
            </div>

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-gray-800 ml-0.5" />
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <div>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getCategoryColor(course.category)} text-white border-0 mb-2`}
              >
                {course.category}
              </Badge>
              <h3 className="font-semibold text-base text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {course.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={course.creatorAvatar} />
                  <AvatarFallback className="text-xs">{course.creator[0]}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600 truncate">{course.creator}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{course.rating}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {course.difficulty}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <CourseDetailModal course={course} onEnroll={onEnroll} onStartLesson={onStartLesson} />
      </DialogContent>
    </Dialog>
  );
};

// Course Detail Modal Component
const CourseDetailModal = ({ course, onEnroll, onStartLesson }) => {
  const [expandedCurriculum, setExpandedCurriculum] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const isMobile = useIsMobile();

  const handleEnroll = () => {
    onEnroll(course);
    setIsEnrolled(true);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-800 pr-8">
          {course.title}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">Course Introduction</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About This Course</h3>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>

          {/* Curriculum */}
          <div>
            <Button
              variant="ghost"
              onClick={() => setExpandedCurriculum(!expandedCurriculum)}
              className="flex items-center justify-between w-full p-0 h-auto"
            >
              <h3 className="text-lg font-semibold">Curriculum ({course.lessons} lessons)</h3>
              {expandedCurriculum ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
            
            <AnimatePresence>
              {expandedCurriculum && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-2"
                >
                  {course.curriculum.map((lesson, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{lesson.title}</p>
                          <p className="text-sm text-gray-500">{lesson.duration}</p>
                        </div>
                      </div>
                      {lesson.completed && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Reviews</h3>
            <div className="space-y-4">
              {[
                { name: "Sarah M.", rating: 5, text: "Excellent course! Very comprehensive and easy to follow." },
                { name: "Mike R.", rating: 4, text: "Great content, learned a lot. Would recommend to others." },
                { name: "Anna K.", rating: 5, text: "Perfect for beginners. The instructor explains everything clearly." }
              ].map((review, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">{review.name}</p>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Instructor */}
          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={course.creatorAvatar} />
                <AvatarFallback>{course.creator[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-800">{course.creator}</p>
                <p className="text-sm text-gray-500">Course Instructor</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Card>

          {/* Course Stats */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Students</span>
              <span className="font-medium">{course.students.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Duration</span>
              <span className="font-medium">{course.duration}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Lessons</span>
              <span className="font-medium">{course.lessons}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Difficulty</span>
              <Badge variant="outline" className="text-xs">
                {course.difficulty}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">XP Reward</span>
              <div className="flex items-center space-x-1 text-purple-600 font-semibold">
                <Zap className="w-4 h-4" />
                <span>{course.xpReward}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rating</span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{course.rating}</span>
                <span className="text-sm text-gray-500">({course.reviews})</span>
              </div>
            </div>
          </Card>

          {/* Enrollment */}
          <Card className="p-4 space-y-4">
            {course.isPaid && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">${course.price}</p>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
            )}
            
            {isEnrolled ? (
              <Button 
                onClick={() => onStartLesson(course)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Start Learning
              </Button>
            ) : (
              <Button 
                onClick={handleEnroll}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {course.isPaid ? 'Enroll Now' : 'Enroll Free'}
              </Button>
            )}

            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>Save</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function for category colors
const getCategoryColor = (category) => {
  const colors = {
    AI: 'bg-blue-500',
    Video: 'bg-red-500',
    Music: 'bg-pink-500',
    Finance: 'bg-green-500',
    Marketing: 'bg-orange-500',
    Tech: 'bg-indigo-500'
  };
  return colors[category] || 'bg-purple-500';
};

export default WizLearnPage;