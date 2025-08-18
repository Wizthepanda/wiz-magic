import { useState } from 'react';
import { Play, Eye, Star, Users, Video, Crown, CheckCircle, ExternalLink, Clock, Zap, DollarSign, Award, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatorProfileProps {
  creatorId: string;
  creatorName: string;
  onBack: () => void;
}

export const WizCreatorProfile = ({ creatorId, creatorName, onBack }: CreatorProfileProps) => {
  const [activeTab, setActiveTab] = useState('free');

  // Mock creator data
  const creatorData = {
    name: creatorName || 'CodeMaster',
    username: '@codemaster',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop',
    followers: '203K',
    videos: 234,
    totalViews: '4.1M',
    rating: 4.8,
    verified: true,
    specialty: 'Web Development & AI',
    bio: 'Passionate educator sharing cutting-edge web development techniques and AI integration. Join me on the journey to master modern development!',
    joinDate: 'March 2022'
  };

  const freeContent = [
    {
      id: 1,
      title: 'React 19 Features You Need to Know',
      duration: '15:20',
      views: '32K',
      xpReward: 180,
      thumbnail: '⚛️',
      category: 'React',
      difficulty: 'Intermediate',
      description: 'Explore the latest React features and how they can improve your development workflow.',
      watched: true
    },
    {
      id: 2,
      title: 'Advanced TypeScript Patterns',
      duration: '22:45',
      views: '28K',
      xpReward: 250,
      thumbnail: '📘',
      category: 'TypeScript',
      difficulty: 'Advanced',
      description: 'Deep dive into advanced TypeScript patterns for better code quality.',
      watched: false
    },
    {
      id: 3,
      title: 'Building Modern APIs with Node.js',
      duration: '18:30',
      views: '45K',
      xpReward: 200,
      thumbnail: '🚀',
      category: 'Node.js',
      difficulty: 'Intermediate',
      description: 'Learn to build scalable and efficient APIs using modern Node.js practices.',
      watched: false
    },
    {
      id: 4,
      title: 'CSS Grid Mastery',
      duration: '25:15',
      views: '52K',
      xpReward: 220,
      thumbnail: '🎨',
      category: 'CSS',
      difficulty: 'Beginner',
      description: 'Master CSS Grid layout system with practical examples and projects.',
      watched: false
    }
  ];

  const premiumContent = [
    {
      id: 1,
      title: 'Complete Full-Stack Development Course',
      duration: '12h 30m',
      price: 299,
      students: '1.2K',
      thumbnail: '🎓',
      category: 'Full-Stack',
      difficulty: 'All Levels',
      description: 'Comprehensive course covering React, Node.js, databases, and deployment.',
      modules: 25,
      rating: 4.9,
      bestseller: true
    },
    {
      id: 2,
      title: 'AI Integration for Web Developers',
      duration: '8h 45m',
      price: 199,
      students: '890',
      thumbnail: '🤖',
      category: 'AI',
      difficulty: 'Advanced',
      description: 'Learn to integrate AI capabilities into your web applications.',
      modules: 18,
      rating: 4.7,
      bestseller: false
    },
    {
      id: 3,
      title: 'Microservices Architecture Masterclass',
      duration: '15h 20m',
      price: 399,
      students: '650',
      thumbnail: '⚡',
      category: 'Architecture',
      difficulty: 'Expert',
      description: 'Build scalable microservices with Docker, Kubernetes, and more.',
      modules: 30,
      rating: 4.8,
      bestseller: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'from-green-400 to-emerald-500';
      case 'Intermediate': return 'from-blue-400 to-cyan-500';
      case 'Advanced': return 'from-purple-400 to-pink-500';
      case 'Expert': return 'from-red-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Liquid Glass Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, rgba(230, 230, 250, 0.3) 0%, rgba(25, 25, 112, 0.05) 100%)
          `
        }}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-15 border border-white/30 flex items-center justify-center">
            ←
          </div>
          <span className="font-medium">Back to Discover</span>
        </motion.button>

        {/* Creator Header */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            background: `
              linear-gradient(135deg, rgba(230, 230, 250, 0.15) 0%, rgba(25, 25, 112, 0.05) 100%),
              rgba(255, 255, 255, 0.1)
            `,
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '32px',
            boxShadow: '0 20px 60px rgba(147, 51, 234, 0.1)'
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Banner */}
          <div 
            className="h-48 bg-cover bg-center relative"
            style={{ 
              backgroundImage: `url(${creatorData.banner})`,
              borderRadius: '32px 32px 0 0'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Profile Info */}
          <div className="p-8 pt-0">
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16 relative z-10">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                  <AvatarImage src={creatorData.avatar} alt={creatorData.name} />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                    {creatorData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Creator Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-800">{creatorData.name}</h1>
                    {creatorData.verified && (
                      <CheckCircle className="w-8 h-8 text-blue-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-lg">{creatorData.username}</p>
                  <p className="text-indigo-600 font-medium">{creatorData.specialty}</p>
                </div>

                <p className="text-gray-700 max-w-2xl leading-relaxed">{creatorData.bio}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{creatorData.followers}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{creatorData.videos}</div>
                    <div className="text-sm text-gray-600">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{creatorData.totalViews}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold text-yellow-600">{creatorData.rating}</span>
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <motion.button
                    className="px-6 py-3 font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                      backdropFilter: 'blur(15px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Users className="w-5 h-5 inline mr-2" />
                    Follow
                  </motion.button>
                  <motion.button
                    className="p-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(15px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Share2 className="w-5 h-5 text-gray-700" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="inline-flex p-1 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <button
              onClick={() => setActiveTab('free')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'free'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/10'
              }`}
            >
              🎬 Free Content
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'premium'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/10'
              }`}
            >
              👑 Premium Content
            </button>
          </div>
        </motion.div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          {activeTab === 'free' ? (
            <motion.div
              key="free"
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {freeContent.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div
                    className="h-80 overflow-hidden transition-all duration-500 group-hover:shadow-2xl"
                    style={{
                      background: `
                        linear-gradient(135deg, rgba(230, 230, 250, 0.15) 0%, rgba(25, 25, 112, 0.05) 100%),
                        rgba(255, 255, 255, 0.1)
                      `,
                      backdropFilter: 'blur(25px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '24px',
                      boxShadow: '0 12px 40px rgba(147, 51, 234, 0.1)'
                    }}
                  >
                    {/* Thumbnail */}
                    <div 
                      className="relative h-40 flex items-center justify-center text-4xl"
                      style={{
                        borderRadius: '24px 24px 0 0',
                        background: `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)`
                      }}
                    >
                      {video.thumbnail}
                      
                      {/* Difficulty Badge */}
                      <div 
                        className="absolute top-3 left-3 px-2 py-1 text-xs font-bold text-white rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${getDifficultyColor(video.difficulty)})`
                        }}
                      >
                        {video.difficulty}
                      </div>

                      {/* XP Badge */}
                      <div 
                        className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 text-xs font-bold text-black rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        }}
                      >
                        <Zap className="w-3 h-3" />
                        <span>{video.xpReward}</span>
                      </div>

                      {/* Duration */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-semibold">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {video.duration}
                      </div>

                      {/* Play Button */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white"
                          style={{
                            background: 'rgba(147, 51, 234, 0.9)',
                            backdropFilter: 'blur(15px)'
                          }}
                        >
                          <Play className="w-6 h-6 ml-1" fill="currentColor" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {video.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{video.views}</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {video.category}
                        </Badge>
                      </div>

                      <motion.button
                        className={`w-full py-2 font-semibold rounded-lg transition-all duration-300 ${
                          video.watched 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-purple-600 hover:to-indigo-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Play className="w-4 h-4 inline mr-2" />
                        {video.watched ? 'Watched' : 'Watch Free'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="premium"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {premiumContent.map((course, index) => (
                <motion.div
                  key={course.id}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div
                    className="h-96 overflow-hidden transition-all duration-500 group-hover:shadow-2xl relative"
                    style={{
                      background: `
                        linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%),
                        rgba(255, 255, 255, 0.1)
                      `,
                      backdropFilter: 'blur(25px)',
                      border: '2px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '24px',
                      boxShadow: '0 12px 40px rgba(255, 215, 0, 0.2)'
                    }}
                  >
                    {/* Premium Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <div 
                        className="flex items-center space-x-1 px-3 py-1 text-xs font-bold text-black rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        }}
                      >
                        <Crown className="w-3 h-3" />
                        <span>PREMIUM</span>
                      </div>
                    </div>

                    {/* Bestseller Badge */}
                    {course.bestseller && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                          BESTSELLER
                        </div>
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div 
                      className="relative h-48 flex items-center justify-center text-5xl"
                      style={{
                        borderRadius: '24px 24px 0 0',
                        background: `linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)`
                      }}
                    >
                      {course.thumbnail}

                      {/* Play Button */}
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center text-black"
                          style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            backdropFilter: 'blur(15px)'
                          }}
                        >
                          <Play className="w-8 h-8 ml-1" fill="currentColor" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="font-bold text-xl text-gray-800 line-clamp-2 leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-gray-600">{course.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{course.modules} modules</span>
                        <span>{course.students} students</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-green-600">
                          ${course.price}
                        </div>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                          {course.category}
                        </Badge>
                      </div>

                      <motion.button
                        className="w-full py-3 font-bold text-black rounded-lg transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <DollarSign className="w-5 h-5 inline mr-2" />
                        Enroll Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};