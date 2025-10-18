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

  // Enhanced Pricing Model
  pricingModel: 'free' | 'free-zaps' | 'usd' | 'zaps' | 'zaps-usd' | 'crypto';
  zapsRequired: number;
  usdCoPay: number;
  splitPayEnabled?: boolean;
  slotsAvailable?: number | null;

  // Crypto payment fields
  cryptoTypes?: ('usdt' | 'btc' | 'usdc' | 'doge')[];
  cryptoAmount?: string;

  // Reward Members fields
  offerZAPsToNewMembers?: boolean;
  newMemberZAPsReward?: number;

  // Free Trial (for paid models only)
  trialEnabled: boolean;
  trialDuration: number;
  trialUnit: 'days' | 'weeks';

  // Waitlist
  waitlistEnabled?: boolean;

  // Additional Options
  accessDuration?: string; // 'lifetime', '30days', '90days', '1year'

  // Creator info
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;

  // Stats
  enrollmentCount: number;
  rating: number;
  reviewCount: number;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'draft' | 'published' | 'archived';

  // Categorization for different tabs
  publishedTo: 'community' | 'claim'; // community = free/paid, claim = zaps/zaps-usd

  // Duplicate Prevention & Version Control
  contentHash?: string; // SHA256 hash of primary content (for manual uploads)
  youtubeVideoIds?: string[]; // YouTube video IDs from course modules
  sourceType?: 'youtube' | 'manual' | 'hybrid'; // Source of course content
  version?: number; // Version number for updates (starts at 1)
  originalCourseId?: string; // Reference to original course if this is an update
  isLatestVersion?: boolean; // Flag to indicate if this is the latest version
  previousVersionId?: string; // Reference to previous version
  zapRewardAwarded?: boolean; // Track if ZAP reward has been awarded for this unique course

  // Legacy fields (kept for backwards compatibility)
  accessType?: 'free' | 'paid' | 'xp' | 'xp-copay';
  xpRequired?: number;
  price?: number;
  trialDays?: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingCourse?: Course;
  duplicateType?: 'youtube' | 'content-hash' | 'title-similarity';
  matchPercentage?: number;
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
   * Extract YouTube video IDs from course modules
   */
  private extractYouTubeVideoIds(modules: Module[]): string[] {
    const videoIds: string[] = [];

    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.type === 'video' && lesson.videoUrl) {
          // Extract YouTube video ID from various URL formats
          const videoId = this.extractYouTubeId(lesson.videoUrl);
          if (videoId) {
            videoIds.push(videoId);
          }
        }
      });
    });

    return [...new Set(videoIds)]; // Remove duplicates
  }

  /**
   * Extract YouTube video ID from URL
   */
  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Generate content hash for manual uploads
   */
  private async generateContentHash(modules: Module[]): Promise<string> {
    // Create a content signature from non-YouTube content
    const contentSignature = modules.map(module => ({
      title: module.title,
      description: module.description,
      lessons: module.lessons
        .filter(lesson => lesson.type !== 'video' || !this.extractYouTubeId(lesson.videoUrl || ''))
        .map(lesson => ({
          title: lesson.title,
          type: lesson.type,
          content: lesson.content || '',
          files: lesson.files?.map(f => f.name).join(',') || ''
        }))
    }));

    const contentString = JSON.stringify(contentSignature);

    // Use Web Crypto API to generate SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(contentString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }

  /**
   * Determine source type of course content
   */
  private determineSourceType(modules: Module[]): 'youtube' | 'manual' | 'hybrid' {
    let hasYouTube = false;
    let hasManual = false;

    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.type === 'video' && lesson.videoUrl) {
          if (this.extractYouTubeId(lesson.videoUrl)) {
            hasYouTube = true;
          } else {
            hasManual = true;
          }
        } else if (lesson.type === 'text' || lesson.type === 'downloads') {
          hasManual = true;
        }
      });
    });

    if (hasYouTube && hasManual) return 'hybrid';
    if (hasYouTube) return 'youtube';
    return 'manual';
  }

  /**
   * Check for duplicate courses by creator
   */
  async checkForDuplicates(
    courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'>,
    creatorId: string
  ): Promise<DuplicateCheckResult> {
    try {
      // Extract YouTube video IDs
      const youtubeVideoIds = this.extractYouTubeVideoIds(courseData.modules);

      // Generate content hash for manual content
      const contentHash = await this.generateContentHash(courseData.modules);

      // Search across all course collections
      const collections = ['courses_community', 'courses_claim', 'courses_drafts'];

      for (const collectionName of collections) {
        // Check for YouTube video ID matches
        if (youtubeVideoIds.length > 0) {
          const youtubeQuery = query(
            collection(db, collectionName),
            where('creatorId', '==', creatorId),
            where('youtubeVideoIds', 'array-contains-any', youtubeVideoIds.slice(0, 10)) // Firestore limit
          );

          const youtubeSnapshot = await getDocs(youtubeQuery);

          if (!youtubeSnapshot.empty) {
            const existingCourse = {
              id: youtubeSnapshot.docs[0].id,
              ...youtubeSnapshot.docs[0].data()
            } as Course;

            // Calculate match percentage
            const existingVideoIds = existingCourse.youtubeVideoIds || [];
            const matchingIds = youtubeVideoIds.filter(id => existingVideoIds.includes(id));
            const matchPercentage = (matchingIds.length / Math.max(youtubeVideoIds.length, existingVideoIds.length)) * 100;

            return {
              isDuplicate: true,
              existingCourse,
              duplicateType: 'youtube',
              matchPercentage
            };
          }
        }

        // Check for content hash matches (for manual uploads)
        if (contentHash) {
          const hashQuery = query(
            collection(db, collectionName),
            where('creatorId', '==', creatorId),
            where('contentHash', '==', contentHash)
          );

          const hashSnapshot = await getDocs(hashQuery);

          if (!hashSnapshot.empty) {
            const existingCourse = {
              id: hashSnapshot.docs[0].id,
              ...hashSnapshot.docs[0].data()
            } as Course;

            return {
              isDuplicate: true,
              existingCourse,
              duplicateType: 'content-hash',
              matchPercentage: 100
            };
          }
        }

        // Check for similar titles (as a fallback)
        const titleQuery = query(
          collection(db, collectionName),
          where('creatorId', '==', creatorId),
          where('title', '==', courseData.title)
        );

        const titleSnapshot = await getDocs(titleQuery);

        if (!titleSnapshot.empty) {
          const existingCourse = {
            id: titleSnapshot.docs[0].id,
            ...titleSnapshot.docs[0].data()
          } as Course;

          return {
            isDuplicate: true,
            existingCourse,
            duplicateType: 'title-similarity',
            matchPercentage: 100
          };
        }
      }

      return { isDuplicate: false };

    } catch (error) {
      console.error('❌ Error checking for duplicates:', error);
      return { isDuplicate: false };
    }
  }

  /**
   * Update an existing course in-place (does NOT create new version)
   * Use this when editing a course to make changes
   */
  async updateCourseInPlace(
    courseId: string,
    courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'>,
    collectionName: 'courses_community' | 'courses_claim' | 'courses_drafts'
  ): Promise<void> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');

      // Prepare updated data (keep existing metadata like version, createdAt)
      const youtubeVideoIds = this.extractYouTubeVideoIds(courseData.modules);
      const contentHash = await this.generateContentHash(courseData.modules);
      const sourceType = this.determineSourceType(courseData.modules);

      const updatedFields = {
        // Content fields
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        tags: courseData.tags,
        coverImage: courseData.coverImage,
        modules: courseData.modules,

        // Pricing fields
        pricingModel: courseData.pricingModel,
        zapsRequired: courseData.zapsRequired,
        usdCoPay: courseData.usdCoPay,
        splitPayEnabled: courseData.splitPayEnabled,
        slotsAvailable: courseData.slotsAvailable,

        // Optional fields
        cryptoTypes: courseData.cryptoTypes,
        cryptoAmount: courseData.cryptoAmount,
        offerZAPsToNewMembers: courseData.offerZAPsToNewMembers,
        newMemberZAPsReward: courseData.newMemberZAPsReward,
        trialEnabled: courseData.trialEnabled,
        trialDuration: courseData.trialDuration,
        trialUnit: courseData.trialUnit,
        waitlistEnabled: courseData.waitlistEnabled,
        accessDuration: courseData.accessDuration,

        // Creator info
        creatorId: courseData.creatorId,
        creatorName: courseData.creatorName,
        creatorAvatar: courseData.creatorAvatar,

        // Duplicate detection metadata
        youtubeVideoIds,
        contentHash,
        sourceType,

        // Update timestamp
        updatedAt: Timestamp.now()
      };

      // Remove undefined values
      const cleanedUpdate = this.removeUndefinedValues(updatedFields);

      const courseRef = doc(db, collectionName, courseId);
      await updateDoc(courseRef, cleanedUpdate);

      console.log(`✅ Course updated in-place with ID:`, courseId);
    } catch (error) {
      console.error('❌ Error updating course in-place:', error);
      throw error;
    }
  }

  /**
   * Create a new version of an existing course (version control)
   * Use this when you want to maintain version history
   */
  async createNewVersion(
    existingCourseId: string,
    courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'>,
    collectionName: 'courses_community' | 'courses_claim' | 'courses_drafts'
  ): Promise<string> {
    try {
      const { doc, getDoc, updateDoc } = await import('firebase/firestore');

      // Get the existing course
      const existingCourseRef = doc(db, collectionName, existingCourseId);
      const existingCourseSnap = await getDoc(existingCourseRef);

      if (!existingCourseSnap.exists()) {
        throw new Error('Existing course not found');
      }

      const existingCourse = existingCourseSnap.data() as Course;
      const currentVersion = existingCourse.version || 1;

      // Mark the existing course as not the latest version
      await updateDoc(existingCourseRef, {
        isLatestVersion: false,
        updatedAt: Timestamp.now()
      });

      // Prepare course data for new version
      const youtubeVideoIds = this.extractYouTubeVideoIds(courseData.modules);
      const contentHash = await this.generateContentHash(courseData.modules);
      const sourceType = this.determineSourceType(courseData.modules);
      const publishedTo = this.determinePublishTarget(courseData.pricingModel);

      const updatedCourse: Omit<Course, 'id'> = {
        ...courseData,
        publishedTo,
        youtubeVideoIds,
        contentHash,
        sourceType,
        version: currentVersion + 1,
        originalCourseId: existingCourse.originalCourseId || existingCourseId,
        previousVersionId: existingCourseId,
        isLatestVersion: true,
        zapRewardAwarded: false, // Updates are eligible for new ZAP rewards
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        enrollmentCount: 0,
        rating: 0,
        reviewCount: 0,
        status: 'published'
      };

      // Clean the course object
      const cleanedCourse = this.removeUndefinedValues(updatedCourse);

      // Save to the appropriate collection
      const targetCollection = publishedTo === 'community' ? 'courses_community' : 'courses_claim';
      const docRef = await addDoc(collection(db, targetCollection), cleanedCourse);

      console.log(`✅ Course updated to version ${currentVersion + 1} with ID:`, docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('❌ Error updating course:', error);
      throw error;
    }
  }

  /**
   * Publish a course to the appropriate tab based on pricing model
   */
  async publishCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'>): Promise<string> {
    try {
      // Determine which tab to publish to based on pricing model
      const publishedTo = this.determinePublishTarget(courseData.pricingModel);

      // Extract duplicate prevention metadata
      const youtubeVideoIds = this.extractYouTubeVideoIds(courseData.modules);
      const contentHash = await this.generateContentHash(courseData.modules);
      const sourceType = this.determineSourceType(courseData.modules);

      const course: Omit<Course, 'id'> = {
        ...courseData,
        publishedTo,
        youtubeVideoIds,
        contentHash,
        sourceType,
        version: 1, // First version
        isLatestVersion: true,
        zapRewardAwarded: false, // No ZAP reward yet
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
      const collectionName = publishedTo === 'community' ? 'courses_community' : 'courses_claim';
      const docRef = await addDoc(collection(db, collectionName), cleanedCourse);

      console.log(`✅ Course published to ${publishedTo} tab with ID:`, docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error publishing course:', error);
      throw error;
    }
  }

  /**
   * Get courses for the Community tab (free and paid courses)
   */
  async getCommunityCourses(): Promise<Course[]> {
    try {
      const q = query(
        collection(db, 'courses_community'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
    } catch (error) {
      console.error('❌ Error fetching community courses:', error);
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
  async getFeaturedCourses(tab: 'community' | 'claim', limit: number = 6): Promise<Course[]> {
    try {
      const collectionName = tab === 'community' ? 'courses_community' : 'courses_claim';
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
   * Get all courses created by a specific user (published and drafts)
   */
  async getUserCourses(creatorId: string): Promise<Course[]> {
    try {
      const courses: Course[] = [];

      // Fetch from courses_community
      const communityQuery = query(
        collection(db, 'courses_community'),
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc')
      );
      const communitySnapshot = await getDocs(communityQuery);
      courses.push(...communitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course)));

      // Fetch from courses_claim
      const claimQuery = query(
        collection(db, 'courses_claim'),
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc')
      );
      const claimSnapshot = await getDocs(claimQuery);
      courses.push(...claimSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course)));

      // Fetch from courses_drafts
      const draftQuery = query(
        collection(db, 'courses_drafts'),
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc')
      );
      const draftSnapshot = await getDocs(draftQuery);
      courses.push(...draftSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course)));

      // Sort all courses by creation date descending
      return courses.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('❌ Error fetching user courses:', error);
      return [];
    }
  }

  /**
   * Determine which tab a course should be published to based on pricing model
   * All courses now go to the Community tab
   */
  private determinePublishTarget(pricingModel: Course['pricingModel']): 'community' | 'claim' {
    // All courses are published to the Community tab regardless of pricing model
    return 'community';
  }

  /**
   * Save course as draft
   */
  async saveDraft(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'publishedTo'>): Promise<string> {
    try {
      const course: Omit<Course, 'id'> = {
        ...courseData,
        publishedTo: this.determinePublishTarget(courseData.pricingModel),
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

      // Enhanced Pricing Model
      pricingModel: courseData.pricingModel || 'free',
      zapsRequired: typeof courseData.zapsRequired === 'number' ? courseData.zapsRequired : 0,
      usdCoPay: typeof courseData.usdCoPay === 'number' ? courseData.usdCoPay : 0,
      splitPayEnabled: Boolean(courseData.splitPayEnabled),
      slotsAvailable: typeof courseData.slotsAvailable === 'number' ? courseData.slotsAvailable : null,

      // Crypto fields
      cryptoTypes: Array.isArray(courseData.cryptoTypes) ? courseData.cryptoTypes : undefined,
      cryptoAmount: courseData.cryptoAmount || undefined,

      // Reward Members
      offerZAPsToNewMembers: Boolean(courseData.offerZAPsToNewMembers),
      newMemberZAPsReward: typeof courseData.newMemberZAPsReward === 'number' ? courseData.newMemberZAPsReward : undefined,

      // Free Trial
      trialEnabled: Boolean(courseData.trialEnabled),
      trialDuration: typeof courseData.trialDuration === 'number' ? courseData.trialDuration : 7,
      trialUnit: courseData.trialUnit || 'days',

      // Waitlist
      waitlistEnabled: Boolean(courseData.waitlistEnabled),

      // Additional Options
      accessDuration: courseData.accessDuration || 'lifetime',

      // Creator info
      creatorId: creatorId,
      creatorName: creatorName,
      creatorAvatar: creatorAvatar || '',

      // Legacy fields for backwards compatibility
      accessType: courseData.accessType,
      xpRequired: typeof courseData.xpRequired === 'number' ? courseData.xpRequired : undefined,
      price: typeof courseData.price === 'number' ? courseData.price : undefined,
      trialDays: typeof courseData.trialDays === 'number' ? courseData.trialDays : undefined
    };
  }
}

export default CourseService;