import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Star,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  Award,
  Zap,
  Crown,
  Bookmark,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  Badge as BadgeIcon,
  Trophy,
  Target,
  MessageCircle,
  Download,
  Lock,
  Unlock,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface CourseModalProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  userLevel: number;
  userXP: number;
  onEnroll?: () => void;
}

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Alex Rivera',
    avatar: '/Profile Pics/Ale.jpg',
    level: 5,
    rating: 5,
    text: "This course completely changed my career trajectory. The practical projects are incredible!",
    badge: '🎯 AI Expert'
  },
  {
    id: 2,
    name: 'Sarah Kim',
    avatar: '/Profile Pics/FERA.jpg',
    level: 3,
    rating: 5,
    text: "Perfect for beginners! The instructor explains complex concepts in such a clear way.",
    badge: '🚀 Rising Star'
  },
  {
    id: 3,
    name: 'Jordan Tech',
    avatar: '/Profile Pics/Bogdan.jpg',
    level: 7,
    rating: 4,
    text: "Great content and well-structured curriculum. Already implementing what I learned!",
    badge: '👑 Master Level'
  }
];

// Mock achievement badges
const achievementBadges = [
  { id: 1, name: 'AI Novice', icon: '🤖', description: 'Complete your first AI course' },
  { id: 2, name: 'Code Warrior', icon: '⚔️', description: 'Finish 5 programming challenges' },
  { id: 3, name: 'Automation Pro', icon: '🔧', description: 'Build 3 automation projects' },
  { id: 4, name: 'Neural Network Master', icon: '🧠', description: 'Complete advanced neural network module' }
];

// Mock course modules
const courseModules = [
  {
    id: 1,
    title: 'Introduction to AI Fundamentals',
    lessons: [
      { id: 1, title: 'What is Artificial Intelligence?', duration: '12 min', completed: true },
      { id: 2, title: 'History and Evolution of AI', duration: '18 min', completed: true },
      { id: 3, title: 'Types of Machine Learning', duration: '22 min', completed: false }
    ]
  },
  {
    id: 2,
    title: 'Neural Networks Deep Dive',
    lessons: [
      { id: 4, title: 'Understanding Neural Networks', duration: '28 min', completed: false },
      { id: 5, title: 'Building Your First Network', duration: '35 min', completed: false },
      { id: 6, title: 'Training and Optimization', duration: '42 min', completed: false }
    ]
  },
  {
    id: 3,
    title: 'Real-World AI Projects',
    lessons: [
      { id: 7, title: 'Image Recognition Project', duration: '65 min', completed: false },
      { id: 8, title: 'Natural Language Processing', duration: '48 min', completed: false },
      { id: 9, title: 'Deployment and Production', duration: '38 min', completed: false }
    ]
  }
];

export const PremiumCourseModal: React.FC<CourseModalProps> = ({
  course,
  isOpen,
  onClose,
  userLevel,
  userXP,
  onEnroll
}) => {
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMobile = useIsMobile();

  // Early return if no course is provided
  if (!course) {
    return null;
  }

  // Calculate if user can afford and access the course
  const canAfford = userXP >= (course.xpPrice || 0);
  const meetsLevelReq = !course.levelRequirement || userLevel >= course.levelRequirement;
  const isUnlocked = (canAfford && meetsLevelReq) || course.isFree;
  const isFreeForUser = course.isFreeForLevel && userLevel >= course.isFreeForLevel;

  // Mock user progress
  const userProgress = 35; // 35% completed
  const hasStartedCourse = userProgress > 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleEnroll = () => {
    if (isUnlocked) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      onEnroll?.();
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      filter: 'blur(10px)'
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.6
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      filter: 'blur(5px)',
      transition: {
        duration: 0.3
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 200],
                    x: [0, Math.random() * 100 - 50],
                    rotate: [0, 360],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 3,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </div>
          )}

          {/* Modal */}
          <motion.div
            className={cn(
              "relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide",
              isMobile
                ? "w-full h-full rounded-none"
                : "w-[70%] max-w-4xl rounded-3xl"
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
            >
              <X className="w-5 h-5 text-white" />
            </Button>

            {/* Hero Section */}
            <motion.div
              custom={0}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="relative aspect-[2.5/1] overflow-hidden"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=480&fit=crop&auto=format`;
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Hero Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="max-w-3xl">
                  <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {course.title}
                  </h1>

                  {/* Instructor and Stats */}
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 border-2 border-white/30">
                        <AvatarImage src={course.creatorAvatar} />
                        <AvatarFallback>{course.creator?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-semibold flex items-center space-x-2">
                          <span>{course.creator}</span>
                          <BadgeIcon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-white/70 text-sm">Course Instructor</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-white/90">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-lg">{course.rating}</span>
                        <span className="text-sm">({course.reviews?.toLocaleString()} learners)</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {course.category}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {course.difficulty}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="p-8 space-y-8">
              {/* Progress Bar for Started Courses */}
              {hasStartedCourse && (
                <motion.div
                  custom={1}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">Your Progress</h3>
                    <span className="text-green-400 font-bold">{userProgress}% Complete</span>
                  </div>
                  <Progress value={userProgress} className="h-3 bg-white/20" />
                  <p className="text-white/70 text-sm mt-2">Keep going! You're doing great.</p>
                </motion.div>
              )}

              {/* Two Column Layout */}
              <div className={cn(
                "grid gap-8",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}>
                {/* Left Column - Course Overview */}
                <motion.div
                  custom={2}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Description */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4">Course Overview</h3>
                    <p className={cn(
                      "text-white/80 leading-relaxed",
                      !expandedDescription && "line-clamp-3"
                    )}>
                      {course.description} {!expandedDescription && course.description?.length > 150 && "..."}
                    </p>
                    {course.description?.length > 150 && (
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedDescription(!expandedDescription)}
                        className="text-blue-300 hover:text-blue-200 p-0 h-auto mt-2"
                      >
                        {expandedDescription ? 'Read Less' : 'Read More'}
                      </Button>
                    )}
                  </div>

                  {/* What's Inside */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4">What's Inside</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-white/80">
                        <Play className="w-5 h-5 text-blue-400" />
                        <span>{course.lessons || 24} Video Lessons</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <BookOpen className="w-5 h-5 text-green-400" />
                        <span>Hands-on Projects</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <Download className="w-5 h-5 text-purple-400" />
                        <span>Downloadable Resources</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <MessageCircle className="w-5 h-5 text-orange-400" />
                        <span>Community Discord Access</span>
                      </div>
                      <div className="flex items-center space-x-3 text-white/80">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span>Completion Certificate</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - XP Unlock Panel */}
                <motion.div
                  custom={3}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {/* Pricing Panel */}
                  <div
                    className="bg-white/15 backdrop-blur-sm rounded-3xl p-8 border border-white/30 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'
                    }}
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl" />

                    <div className="relative z-10 space-y-6">
                      {/* Price Section */}
                      {isFreeForUser ? (
                        <div className="text-center">
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-2 text-lg mb-4">
                            <Crown className="w-5 h-5 mr-2" />
                            Free for Level {course.isFreeForLevel}+ Users
                          </Badge>
                          <p className="text-white/80 text-sm">Congratulations! Your level grants you free access.</p>
                        </div>
                      ) : course.isFree ? (
                        <div className="text-center">
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-2 text-lg mb-4">
                            🎁 Free Course
                          </Badge>
                          <p className="text-white/80 text-sm">No XP required - start learning immediately!</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="flex items-center justify-center space-x-4">
                            <div className="text-4xl font-bold text-white flex items-center space-x-2">
                              <Zap className="w-8 h-8 text-yellow-400" />
                              <span>💎 {course.xpPrice?.toLocaleString()}</span>
                              <span className="text-2xl text-purple-300">XP</span>
                            </div>
                          </div>
                          {course.originalPrice && (
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-white/60 line-through text-lg">${course.originalPrice} value</span>
                              <Badge className="bg-red-500 text-white">90% OFF</Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Availability Bar */}
                      {course.slotsTotal && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-white/80 text-sm">
                            <span>Enrollment Progress</span>
                            <span>{course.slotsClaimed?.toLocaleString()} / {course.slotsTotal?.toLocaleString()} claimed</span>
                          </div>
                          <Progress
                            value={(course.slotsClaimed / course.slotsTotal) * 100}
                            className="h-2 bg-white/20"
                          />
                        </div>
                      )}

                      {/* CTA Buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={handleEnroll}
                          disabled={!isUnlocked}
                          className={cn(
                            "w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300",
                            isUnlocked
                              ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl hover:scale-105"
                              : "bg-gray-600 text-gray-300 cursor-not-allowed"
                          )}
                          style={{
                            boxShadow: isUnlocked ? '0 0 30px rgba(139, 92, 246, 0.5)' : 'none'
                          }}
                        >
                          {isUnlocked ? (
                            hasStartedCourse ? (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Continue Learning
                              </>
                            ) : (
                              <>
                                <Unlock className="w-5 h-5 mr-2" />
                                {course.isFree || isFreeForUser ? 'Start Learning' : 'Unlock with XP'}
                              </>
                            )
                          ) : (
                            <>
                              <Lock className="w-5 h-5 mr-2" />
                              {!canAfford ? `Need ${course.xpPrice} XP` : `Level ${course.levelRequirement} Required`}
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => setIsBookmarked(!isBookmarked)}
                          variant="outline"
                          className="w-full h-12 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                        >
                          <Bookmark className={cn("w-4 h-4 mr-2", isBookmarked && "fill-current")} />
                          {isBookmarked ? 'Saved to Wishlist' : 'Save to Wishlist'}
                        </Button>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{course.students?.toLocaleString()}</div>
                          <div className="text-white/60 text-sm">Students Enrolled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{course.completionRate}%</div>
                          <div className="text-white/60 text-sm">Completion Rate</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share & Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Course Content Preview */}
              <motion.div
                custom={4}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
              >
                <div className="p-6 border-b border-white/20">
                  <h3 className="text-white font-semibold text-xl">Course Curriculum</h3>
                  <p className="text-white/70 mt-1">{courseModules.length} modules • {courseModules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons</p>
                </div>

                <div className="divide-y divide-white/10">
                  {courseModules.map((module, index) => (
                    <div key={module.id}>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-6 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-white font-medium">Module {index + 1}: {module.title}</h4>
                          <p className="text-white/60 text-sm mt-1">{module.lessons.length} lessons</p>
                        </div>
                        {expandedModules[module.id] ? (
                          <ChevronUp className="w-5 h-5 text-white/60" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/60" />
                        )}
                      </button>

                      {expandedModules[module.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-white/5"
                        >
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between p-4 pl-12 border-t border-white/5">
                              <div className="flex items-center space-x-3">
                                {lesson.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-white/30" />
                                )}
                                <span className="text-white/80">{lesson.title}</span>
                              </div>
                              <span className="text-white/60 text-sm">{lesson.duration}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Social Proof Section */}
              <motion.div
                custom={5}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* Testimonials */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-6">What Learners Say</h3>

                  <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentTestimonial}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-start space-x-4"
                      >
                        <Avatar className="w-12 h-12 border-2 border-white/30">
                          <AvatarImage src={testimonials[currentTestimonial].avatar} />
                          <AvatarFallback>{testimonials[currentTestimonial].name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-white font-medium">{testimonials[currentTestimonial].name}</h4>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                              Level {testimonials[currentTestimonial].level}
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              {testimonials[currentTestimonial].badge}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <p className="text-white/80 italic">"{testimonials[currentTestimonial].text}"</p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Testimonial indicators */}
                  <div className="flex justify-center space-x-2 mt-4">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          currentTestimonial === index ? "bg-white" : "bg-white/30"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-white font-semibold mb-4">Unlock These Achievements</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {achievementBadges.map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                        <div className="text-2xl">{badge.icon}</div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{badge.name}</h4>
                          <p className="text-white/60 text-xs">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};