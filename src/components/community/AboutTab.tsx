import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UserPlus, Users, Zap, BookOpen, Calendar, Trophy, Target, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AboutTabProps {
  // Community/Project data
  community?: {
    id: string;
    name: string;
    description: string;
    bannerUrl?: string;
    profileIconUrl?: string;
    tags?: string[];
    createdDate?: string;
    rating?: number;
    isFollowing?: boolean;
  };
  // Legacy creator data (optional for backward compatibility)
  creator?: {
    id: string;
    name: string;
    avatar: string;
    tagline: string;
    bio: string;
    isFollowing?: boolean;
  };
  milestones: {
    id: string;
    title: string;
    description: string;
    date: string;
    icon: string;
  }[];
  stats: {
    memberCount: number;
    totalXP: number;
    coursesLaunched: number;
    postsCount: number;
  };
  onFollowCreator?: (creatorId: string) => void;
  onFollowProject?: (communityId: string) => void;
}

/**
 * AboutTab Component (Phase 4 Enhanced)
 * - Displays "About the Project" section with community details
 * - Auto-syncs with community creation/edit data
 * - Hero with community banner/icon and Follow Project CTA
 * - Two-column layout: Project Description + Milestones timeline
 * - Community stats footer
 * - Parallax scroll effects
 * - Backward compatible with creator mode
 */
export const AboutTab: React.FC<AboutTabProps> = ({
  community,
  creator,
  milestones,
  stats,
  onFollowCreator,
  onFollowProject,
}) => {
  // Use community data if available, fallback to creator data
  const isProjectMode = !!community;
  const displayData = isProjectMode ? {
    id: community!.id,
    name: community!.name,
    tagline: community!.description?.split('\n')[0] || 'Learn more about this amazing project',
    bio: community!.description || 'This project\'s story is being written. Stay tuned as the creator updates their description!',
    avatar: community!.profileIconUrl || community!.bannerUrl || '',
    isFollowing: community!.isFollowing,
  } : {
    id: creator!.id,
    name: creator!.name,
    tagline: creator!.tagline,
    bio: creator!.bio,
    avatar: creator!.avatar,
    isFollowing: creator!.isFollowing,
  };

  const [isFollowing, setIsFollowing] = useState(displayData.isFollowing || false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  const handleFollowClick = () => {
    setIsFollowing((prev) => !prev);
    if (isProjectMode) {
      onFollowProject?.(community!.id);
    } else {
      onFollowCreator?.(creator!.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"
            style={{ backgroundSize: '200% 200%' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar/Profile Icon with Glowing Ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255, 255, 255, 0.3)',
                  '0 0 60px rgba(255, 255, 255, 0.6)',
                  '0 0 20px rgba(255, 255, 255, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-r from-white via-purple-200 to-white"
            >
              <Avatar className="w-full h-full border-4 border-white shadow-2xl">
                <AvatarImage src={displayData.avatar} alt={displayData.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold text-4xl">
                  {displayData.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Floating Badge - Community Rating */}
            {isProjectMode && community?.rating ? (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1.5 shadow-lg border-2 border-amber-400"
              >
                <div className="flex items-center gap-1">
                  <span className="text-amber-500">⭐</span>
                  <span className="text-xs font-bold text-gray-900">{community.rating.toFixed(1)}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1.5 shadow-lg border-2 border-purple-400"
              >
                <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {isProjectMode ? 'Project' : 'Creator'}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Project/Creator Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-5xl font-bold text-white mb-2"
            >
              {displayData.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-purple-100 mb-6"
            >
              {displayData.tagline}
            </motion.p>
            {/* Tags for Project Mode */}
            {isProjectMode && community?.tags && community.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-2 justify-center md:justify-start mb-6"
              >
                {community.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleFollowClick}
                size="lg"
                className={cn(
                  'rounded-xl font-semibold shadow-xl transition-all duration-300',
                  isFollowing
                    ? 'bg-white text-purple-600 hover:bg-purple-50'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600'
                )}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {isFollowing ? 'Following' : `Follow ${isProjectMode ? 'Project' : 'Creator'}`}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Two-Column Layout: Bio + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: About the Project/Creator */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-purple-600" />
            {isProjectMode ? 'About the Project' : 'About this Creator'}
          </h2>
          {isProjectMode && community?.createdDate && (
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Created {new Date(community.createdDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          <div className="prose prose-purple max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {displayData.bio}
            </p>
          </div>
          {isProjectMode && (
            <p className="text-sm text-gray-500 italic mt-4">
              Learn more about the mission, goals, and story behind this community.
            </p>
          )}
        </motion.div>

        {/* Right: Milestones Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Milestones
          </h2>

          {/* Vertical Timeline */}
          <div className="relative space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-500" />

            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="relative flex gap-4"
              >
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg border-4 border-white"
                  >
                    <span className="text-xl">{milestone.icon}</span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{milestone.title}</h3>
                      <span className="text-xs text-gray-600 whitespace-nowrap flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {milestone.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{milestone.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Community Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl"
      >
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          Community Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Members */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 text-center border border-white/20"
          >
            <Users className="w-8 h-8 text-white mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">
              {stats.memberCount.toLocaleString()}
            </p>
            <p className="text-sm text-purple-200">Members</p>
          </motion.div>

          {/* Total ZAPs */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 text-center border border-white/20"
          >
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">
              {(stats.totalXP / 1000).toFixed(1)}K⚡
            </p>
            <p className="text-sm text-purple-200">Total ZAPs Earned</p>
          </motion.div>

          {/* Courses Launched */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 text-center border border-white/20"
          >
            <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">
              {stats.coursesLaunched}
            </p>
            <p className="text-sm text-purple-200">Courses Launched</p>
          </motion.div>

          {/* Posts */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 text-center border border-white/20"
          >
            <Target className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">
              {stats.postsCount.toLocaleString()}
            </p>
            <p className="text-sm text-purple-200">Total Posts</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
