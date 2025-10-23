import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Grid3x3, List, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CourseCard } from './CourseCard';
import type { Course } from './Placeholders';

interface CoursesTabProps {
  courses: Course[];
  onEnroll?: (courseId: string) => void;
  onCourseClick?: (courseId: string) => void;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'enrolled' | 'available';

/**
 * CoursesTab Component
 * - Displays all courses available in the community
 * - Grid/List view toggle
 * - Filter by enrollment status
 * - Search functionality
 * - Smooth animations with Framer Motion
 */
export const CoursesTab: React.FC<CoursesTabProps> = ({
  courses: initialCourses,
  onEnroll,
  onCourseClick,
}) => {
  const [courses, setCourses] = useState(initialCourses);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle course enrollment
  const handleEnroll = (courseId: string) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? { ...course, enrolled: true, progress: 0 }
          : course
      )
    );
    onEnroll?.(courseId);

    // Confetti effect (could integrate confetti library)
    console.log('🎉 Enrolled in course:', courseId);
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    // Filter by enrollment status
    if (filter === 'enrolled' && !course.enrolled) return false;
    if (filter === 'available' && course.enrolled) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const enrolledCount = courses.filter((c) => c.enrolled).length;
  const availableCount = courses.filter((c) => !c.enrolled).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Community Courses
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {courses.length} courses • {enrolledCount} enrolled • {availableCount} available
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-xl',
              viewMode === 'grid' && 'bg-purple-100 text-purple-700 border-purple-300'
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-xl',
              viewMode === 'list' && 'bg-purple-100 text-purple-700 border-purple-300'
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="pl-10 bg-white/60 backdrop-blur-xl border-white/20 rounded-xl focus-visible:ring-2 focus-visible:ring-purple-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter('all')}
            className={cn(
              'rounded-xl',
              filter === 'all' && 'bg-purple-100 text-purple-700 border-purple-300'
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            All ({courses.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter('enrolled')}
            className={cn(
              'rounded-xl',
              filter === 'enrolled' && 'bg-green-100 text-green-700 border-green-300'
            )}
          >
            Enrolled ({enrolledCount})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter('available')}
            className={cn(
              'rounded-xl',
              filter === 'available' && 'bg-blue-100 text-blue-700 border-blue-300'
            )}
          >
            Available ({availableCount})
          </Button>
        </div>
      </div>

      {/* Courses Grid/List */}
      <AnimatePresence mode="wait">
        {filteredCourses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20"
          >
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              No courses found
            </p>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CourseCard
                  {...course}
                  onEnroll={handleEnroll}
                  onClick={onCourseClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More (Placeholder) */}
      {filteredCourses.length > 0 && filteredCourses.length < courses.length && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            className="bg-white/60 backdrop-blur-xl border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
          >
            Load More Courses
          </Button>
        </div>
      )}
    </motion.div>
  );
};
