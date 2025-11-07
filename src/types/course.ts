/**
 * Course Types for WIZUP Platform
 * Matches the design patterns used in Community Creation
 */

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseVisibility = 'public' | 'community-only' | 'private';
export type LessonType = 'video' | 'text' | 'quiz' | 'external-link';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  type: LessonType;
  duration?: string; // e.g., "10:30"
  order: number;
  
  // For video lessons
  videoURL?: string;
  videoId?: string; // YouTube video ID
  thumbnail?: string;
  
  // For text lessons
  textContent?: string; // Rich text HTML
  
  // For quiz lessons
  questions?: QuizQuestion[];
  passingScore?: number; // percentage
  
  // For external links
  externalURL?: string;
  
  // Metadata
  isPreview?: boolean; // Can be viewed without enrollment
  completed?: boolean; // User progress tracking
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
  
  // Metadata
  duration?: string; // Total module duration
  lessonsCount?: number;
}

export interface Course {
  id?: string;
  
  // Step 1: Details
  title: string;
  shortDescription: string;
  longDescription?: string;
  difficulty: CourseDifficulty;
  category: string;
  subcategory?: string;
  tags?: string[];
  
  // Step 2: Branding
  coverURL?: string;
  bannerURL?: string;
  themeColor?: string; // Hex color
  
  // Step 3: Curriculum
  modules: CourseModule[];
  
  // Step 4: Publishing
  visibility: CourseVisibility;
  featuredCommunityID?: string;
  featuredCommunityName?: string;
  
  // Creator Info
  creatorUID: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorUsername?: string;
  
  // Metadata
  status: 'draft' | 'published' | 'archived';
  enrollmentCount?: number;
  rating?: number;
  reviewsCount?: number;
  
  // Timestamps
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  publishedAt?: any;
  
  // Optional: ZAP Rewards & Monetization
  zapRewardOnComplete?: number;
  isPremium?: boolean;
  priceZAPs?: number;
  priceUSD?: number;
}

export interface CourseEnrollment {
  courseId: string;
  userId: string;
  enrolledAt: any; // Firestore Timestamp
  progress: {
    completedLessons: string[]; // lesson IDs
    currentModuleId?: string;
    currentLessonId?: string;
    percentComplete: number;
  };
  completedAt?: any;
  certificateURL?: string;
}

// Draft state for course creation (similar to community creation)
export interface CourseCreateState extends Omit<Course, 'id' | 'creatorUID' | 'creatorName' | 'createdAt' | 'updatedAt' | 'creatorAvatar' | 'creatorUsername'> {
  // State-specific fields
  currentUserId: string | null;
  
  // Actions (will be defined in store)
  setTitle: (title: string) => void;
  setShortDescription: (desc: string) => void;
  setLongDescription: (desc: string) => void;
  setDifficulty: (difficulty: CourseDifficulty) => void;
  setCategory: (category: string) => void;
  setSubcategory: (subcategory: string) => void;
  setTags: (tags: string[]) => void;
  
  setCoverURL: (url: string) => void;
  setBannerURL: (url: string) => void;
  setThemeColor: (color: string) => void;
  
  setModules: (modules: CourseModule[]) => void;
  addModule: (module: CourseModule) => void;
  updateModule: (moduleId: string, updates: Partial<CourseModule>) => void;
  removeModule: (moduleId: string) => void;
  reorderModules: (startIndex: number, endIndex: number) => void;
  
  addLesson: (moduleId: string, lesson: CourseLesson) => void;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<CourseLesson>) => void;
  removeLesson: (moduleId: string, lessonId: string) => void;
  reorderLessons: (moduleId: string, startIndex: number, endIndex: number) => void;
  
  setVisibility: (visibility: CourseVisibility) => void;
  setFeaturedCommunity: (communityId: string | undefined, communityName?: string) => void;
  setStatus: (status: 'draft' | 'published' | 'archived') => void;
  
  // Draft management
  loadDraftForUser: (userId: string | null) => void;
  persistDraftToStorage: () => void;
  clearDraftForUser: (userId: string | null) => void;
  replaceDraft: (state: Partial<CourseCreateState>) => void;
  resetStore: () => void;
}

