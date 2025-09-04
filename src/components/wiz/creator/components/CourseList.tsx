import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  GraduationCap,
  Users,
  DollarSign,
  Star,
  Clock,
  Play,
  Edit,
  MoreVertical,
  Plus,
  BookOpen
} from 'lucide-react';

interface CourseListProps {
  userId: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  duration: string;
  lessonCount: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  earnings: number;
}

export const CreatorCourseList: React.FC<CourseListProps> = ({ userId }) => {
  const isMobile = useIsMobile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch user's courses from Firebase
        const coursesQuery = query(
          collection(db, 'courses'),
          where('creatorId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(coursesQuery);
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        
        setCourses(coursesData);
        console.log(`📚 Loaded ${coursesData.length} courses for creator`);
        
      } catch (error) {
        console.error('❌ Error fetching courses:', error);
        // Fall back to empty array if there's an error
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'archived': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const totalEarnings = courses.reduce((sum, course) => sum + course.earnings, 0);
  const totalStudents = courses.reduce((sum, course) => sum + course.enrolledCount, 0);
  const avgRating = courses.filter(c => c.rating > 0).reduce((sum, course, _, arr) => sum + course.rating / arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Courses</h2>
          <p className="text-slate-600">Create and manage your educational content</p>
        </div>
        
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Course Stats */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-4"
      )}>
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">${totalEarnings.toLocaleString()}</div>
                <div className="text-xs text-slate-600">Total Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{totalStudents.toLocaleString()}</div>
                <div className="text-xs text-slate-600">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{avgRating.toFixed(1)}</div>
                <div className="text-xs text-slate-600">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{courses.length}</div>
                <div className="text-xs text-slate-600">Total Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mr-3"></div>
          <p className="text-slate-600">Loading your courses...</p>
        </div>
      )}

      {/* Course List */}
      {!loading && (
        <div className="space-y-4">
          {courses.map((course) => (
          <Card key={course.id} className="group border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              <div className={cn(
                "flex gap-4 p-6",
                isMobile ? "flex-col" : "flex-row"
              )}>
                {/* Course Thumbnail */}
                <div className={cn(
                  "relative overflow-hidden rounded-lg",
                  isMobile ? "w-full aspect-video" : "w-48 aspect-video flex-shrink-0"
                )}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={cn("text-xs", getStatusColor(course.status))}>
                      {course.status}
                    </Badge>
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                      <p className="text-slate-600 text-sm line-clamp-2">{course.description}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Course Meta */}
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.lessonCount} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                    <Badge className={cn("text-xs", getLevelColor(course.level))}>
                      {course.level}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className={cn(
                    "flex items-center justify-between",
                    isMobile ? "flex-col gap-3" : "flex-row"
                  )}>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700">{course.enrolledCount.toLocaleString()} students</span>
                      </div>
                      
                      {course.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-slate-700">{course.rating} ({course.reviewCount} reviews)</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-green-600">${course.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {course.status === 'published' && (
                        <span className="text-sm font-medium text-green-600">
                          ${course.earnings.toLocaleString()} earned
                        </span>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Course
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap className="w-16 h-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses yet</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              Create comprehensive courses to share your magical knowledge and earn from your expertise.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};