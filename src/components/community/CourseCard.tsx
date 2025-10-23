import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Play, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: number;
  duration: string;
  enrolled: boolean;
  progress?: number;
  xpReward: number;
  studentCount: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  onEnroll?: (courseId: string) => void;
  onClick?: (courseId: string) => void;
}

/**
 * CourseCard Component
 * - Beautiful course display card
 * - Hover effects with gradient glow
 * - Enrollment status and progress tracking
 * - XP rewards display
 * - Smooth animations
 */
export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  thumbnail,
  lessons,
  duration,
  enrolled,
  progress = 0,
  xpReward,
  studentCount,
  difficulty = 'Beginner',
  onEnroll,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleEnroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll?.(id);
  };

  const handleClick = () => {
    onClick?.(id);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      className={cn(
        'group relative bg-white/60 backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer',
        'border-2 transition-all duration-300',
        isHovered
          ? 'border-purple-400 shadow-2xl shadow-purple-500/30'
          : 'border-white/20 shadow-lg'
      )}
    >
      {/* Thumbnail Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500">
        <img
          src={thumbnail}
          alt={title}
          className={cn(
            'w-full h-full object-cover transition-transform duration-700',
            isHovered && 'scale-110'
          )}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Play Button Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
          </div>
        </motion.div>

        {/* Enrolled Badge */}
        {enrolled && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 shadow-lg flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Enrolled
          </Badge>
        )}

        {/* Difficulty Badge */}
        <Badge
          className={cn(
            'absolute top-3 left-3 border shadow-lg',
            getDifficultyColor(difficulty)
          )}
        >
          {difficulty}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Progress Bar (if enrolled) */}
        {enrolled && progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-bold text-purple-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </Progress>
          </div>
        )}

        {/* Course Meta */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{lessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{studentCount}</span>
          </div>
        </div>

        {/* Footer: XP + Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* XP Reward */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700">
              {xpReward} XP
            </span>
          </div>

          {/* Action Button */}
          {enrolled ? (
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-purple-50 text-purple-700 border-purple-300 rounded-xl font-semibold"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleEnroll}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/30 font-semibold"
            >
              Join Course
            </Button>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 pointer-events-none rounded-2xl"
        />
      )}
    </motion.div>
  );
};
