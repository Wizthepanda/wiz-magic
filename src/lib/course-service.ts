import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Course {
  id?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string;
  modules: Module[];
  accessType: 'free' | 'paid' | 'xp' | 'xp-copay';
  xpRequired: number;
  price: number;
  trialEnabled: boolean;
  trialDays: number;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'draft' | 'published' | 'archived';
  // Categorization for different tabs
  publishedTo: 'learn' | 'claim'; // learn = free/paid, claim = xp/xp-copay
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'downloads';
  videoUrl?: string;
  content?: string;
  files?: FileItem[];
  order: number;
  duration?: number; // in minutes
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
}

export class CourseService {
  private static instance: CourseService;

  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  /**
   * Publish a course to the appropriate tab based on access type
   */
  async publishCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'>): Promise<string> {
    try {
      // Determine which tab to publish to based on access type
      const publishedTo = this.determinePublishTarget(courseData.accessType);

      const course: Omit<Course, 'id'> = {
        ...courseData,
        publishedTo,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0,
        status: 'published'
      };

      // Clean the course object to remove any undefined values
      const cleanedCourse = this.removeUndefinedValues(course);

      // Save to Firestore in the appropriate collection
      const collectionName = publishedTo === 'learn' ? 'courses_learn' : 'courses_claim';
      const docRef = await addDoc(collection(db, collectionName), cleanedCourse);

      console.log(`✅ Course published to ${publishedTo} tab with ID:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error publishing course:', error);
      throw error;
    }
  }

  /**
   * Get courses for the Learn tab (free and paid courses)
   */
  async getLearnCourses(): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses_learn'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
    } catch (error) {
      console.error('❌ Error fetching learn courses:', error);
      return [];
    }
  }

  /**
   * Get courses for the Claim tab (XP and XP+copay courses)
   */
  async getClaimCourses(): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses_claim'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
    } catch (error) {
      console.error('❌ Error fetching claim courses:', error);
      return [];
    }
  }

  /**
   * Get featured courses for a specific tab
   */
  async getFeaturedCourses(tab: 'learn' | 'claim', limit: number = 6): Promise<Course[]> {
    try {
      const collectionName = tab === 'learn' ? 'courses_learn' : 'courses_claim';
      const q = query(
        collection(db, collectionName),
        where('status', '==', 'published'),
        orderBy('rating', 'desc'),
        orderBy('enrollmentCount', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .slice(0, limit)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Course));
    } catch (error) {
      console.error(`❌ Error fetching featured ${tab} courses:`, error);
      return [];
    }
  }

  /**
   * Determine which tab a course should be published to based on access type
   */
  private determinePublishTarget(accessType: Course['accessType']): 'learn' | 'claim' {
    switch (accessType) {
      case 'free':
      case 'paid':
        return 'learn';
      case 'xp':
      case 'xp-copay':
        return 'claim';
      default:
        return 'learn'; // default fallback
    }
  }

  /**
   * Save course as draft
   */
  async saveDraft(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'>): Promise<string> {
    try {
      const course: Omit<Course, 'id'> = {
        ...courseData,
        publishedTo: this.determinePublishTarget(courseData.accessType),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0,
        status: 'draft'
      };

      // Clean the course object to remove any undefined values
      const cleanedCourse = this.removeUndefinedValues(course);

      const docRef = await addDoc(collection(db, 'courses_drafts'), cleanedCourse);
      console.log('✅ Course saved as draft with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error saving course draft:', error);
      throw error;
    }
  }

  /**
   * Remove undefined values from an object recursively
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = this.removeUndefinedValues(value);
      }
    }
    return cleaned;
  }

  /**
   * Convert CourseData from CreationHub to Course interface
   */
  static convertCourseData(courseData: any, creatorId: string, creatorName: string, creatorAvatar?: string): Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'> {
    // Ensure all required fields have proper values, no undefined allowed
    return {
      title: courseData.title || 'Untitled Course',
      description: courseData.description || 'No description provided',
      category: courseData.category || 'general',
      tags: Array.isArray(courseData.tags) ? courseData.tags : [],
      coverImage: courseData.coverImage || '',
      modules: Array.isArray(courseData.modules) ? courseData.modules.map((module: any, moduleIndex: number) => ({
        id: module.id || `module-${moduleIndex}`,
        title: module.title || `Module ${moduleIndex + 1}`,
        description: module.description || '',
        order: moduleIndex,
        lessons: Array.isArray(module.lessons) ? module.lessons.map((lesson: any, lessonIndex: number) => ({
          id: lesson.id || `lesson-${lessonIndex}`,
          title: lesson.title || `Lesson ${lessonIndex + 1}`,
          description: lesson.description || '',
          type: lesson.type || 'video',
          videoUrl: lesson.videoUrl || '',
          content: lesson.content || '',
          files: Array.isArray(lesson.files) ? lesson.files : [],
          order: lessonIndex,
          duration: typeof lesson.duration === 'number' ? lesson.duration : 0
        })) : []
      })) : [],
      accessType: courseData.accessType || 'free',
      xpRequired: typeof courseData.xpRequired === 'number' ? courseData.xpRequired : 0,
      price: typeof courseData.price === 'number' ? courseData.price : 0,
      trialEnabled: Boolean(courseData.trialEnabled),
      trialDays: typeof courseData.trialDays === 'number' ? courseData.trialDays : 7,
      creatorId: creatorId,
      creatorName: creatorName,
      creatorAvatar: creatorAvatar || ''
    };
  }
}

export default CourseService;