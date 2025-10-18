import { collection, doc, getDoc, updateDoc, query, where, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { CourseService, type Course, type Module as CourseModule } from './course-service';

export interface CommunityContentModule {
  id: string;
  title: string;
  description: string;
  sourceType: 'course' | 'manual';
  sourceCourseId?: string;
  lessons: {
    id: string;
    title: string;
    description: string;
    type: 'video' | 'text' | 'downloads';
    videoUrl?: string;
    content?: string;
    duration?: number;
  }[];
  order: number;
}

export class CommunityService {
  private static instance: CommunityService;
  private courseSubscriptions: Map<string, Unsubscribe> = new Map();

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  /**
   * Sync course content to community
   * This fetches the linked course and updates the community's content
   */
  async syncCourseToComm(communityId: string, courseId: string): Promise<void> {
    try {
      console.log(`🔄 Syncing course ${courseId} to community ${communityId}...`);

      // Get the course data
      const courseService = CourseService.getInstance();
      const course = await this.getCourseById(courseId);

      if (!course) {
        console.error('❌ Course not found:', courseId);
        return;
      }

      // Convert course modules to community content format
      const syncedModules: CommunityContentModule[] = course.modules.map((module, index) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        sourceType: 'course' as const,
        sourceCourseId: courseId,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          videoUrl: lesson.videoUrl,
          content: lesson.content,
          duration: lesson.duration
        })),
        order: index
      }));

      // Update community document with synced content
      const communityRef = doc(db, 'communities', communityId);
      await updateDoc(communityRef, {
        syncedCourseContent: syncedModules,
        lastSyncedAt: new Date(),
        linkedCourseId: courseId,
        linkedCourseName: course.title
      });

      console.log(`✅ Successfully synced ${syncedModules.length} modules from course to community`);
    } catch (error) {
      console.error('❌ Error syncing course to community:', error);
      throw error;
    }
  }

  /**
   * Get course by ID from all collections
   */
  private async getCourseById(courseId: string): Promise<Course | null> {
    try {
      // Try courses_learn first
      let courseDoc = await getDoc(doc(db, 'courses_learn', courseId));

      if (courseDoc.exists()) {
        return { id: courseDoc.id, ...courseDoc.data() } as Course;
      }

      // Try courses_claim
      courseDoc = await getDoc(doc(db, 'courses_claim', courseId));

      if (courseDoc.exists()) {
        return { id: courseDoc.id, ...courseDoc.data() } as Course;
      }

      console.warn('Course not found in any collection:', courseId);
      return null;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  /**
   * Setup real-time sync listener for course updates
   * When course updates, automatically sync to all linked communities
   */
  setupCourseSync(courseId: string): void {
    // Clean up existing subscription if any
    this.unsubscribeCourseSync(courseId);

    console.log(`👂 Setting up real-time sync listener for course ${courseId}...`);

    // Listen to course updates in courses_learn
    const learnRef = doc(db, 'courses_learn', courseId);
    const unsubscribeLearn = onSnapshot(learnRef, async (snapshot) => {
      if (snapshot.exists()) {
        console.log('🔔 Course updated in courses_learn, syncing to communities...');
        await this.syncCourseToLinkedCommunities(courseId);
      }
    });

    // Listen to course updates in courses_claim
    const claimRef = doc(db, 'courses_claim', courseId);
    const unsubscribeClaim = onSnapshot(claimRef, async (snapshot) => {
      if (snapshot.exists()) {
        console.log('🔔 Course updated in courses_claim, syncing to communities...');
        await this.syncCourseToLinkedCommunities(courseId);
      }
    });

    // Store unsubscribe functions
    this.courseSubscriptions.set(courseId, () => {
      unsubscribeLearn();
      unsubscribeClaim();
    });
  }

  /**
   * Remove sync listener for a course
   */
  unsubscribeCourseSync(courseId: string): void {
    const unsubscribe = this.courseSubscriptions.get(courseId);
    if (unsubscribe) {
      unsubscribe();
      this.courseSubscriptions.delete(courseId);
      console.log(`✅ Unsubscribed from course sync: ${courseId}`);
    }
  }

  /**
   * Sync a course to all communities that have it linked
   */
  private async syncCourseToLinkedCommunities(courseId: string): Promise<void> {
    try {
      // Find all communities that have this course linked
      const communitiesQuery = query(
        collection(db, 'communities'),
        where('linkedCourseId', '==', courseId)
      );

      const snapshot = await getDocs(communitiesQuery);

      console.log(`📦 Found ${snapshot.size} communities linked to course ${courseId}`);

      // Sync to each community
      const syncPromises = snapshot.docs.map(doc =>
        this.syncCourseToComm(doc.id, courseId)
      );

      await Promise.all(syncPromises);
      console.log(`✅ Synced course to ${snapshot.size} communities`);
    } catch (error) {
      console.error('❌ Error syncing course to linked communities:', error);
    }
  }

  /**
   * Get synced course content for a community
   */
  async getCommunityCourseContent(communityId: string): Promise<CommunityContentModule[]> {
    try {
      const communityRef = doc(db, 'communities', communityId);
      const communityDoc = await getDoc(communityRef);

      if (!communityDoc.exists()) {
        return [];
      }

      const data = communityDoc.data();
      return data.syncedCourseContent || [];
    } catch (error) {
      console.error('Error fetching community course content:', error);
      return [];
    }
  }

  /**
   * Unlink course from community
   */
  async unlinkCourseFromCommunity(communityId: string): Promise<void> {
    try {
      const communityRef = doc(db, 'communities', communityId);
      await updateDoc(communityRef, {
        linkedCourseId: null,
        linkedCourseName: null,
        syncedCourseContent: [],
        lastSyncedAt: null
      });

      console.log(`✅ Unlinked course from community ${communityId}`);
    } catch (error) {
      console.error('❌ Error unlinking course from community:', error);
      throw error;
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.courseSubscriptions.forEach((unsubscribe) => unsubscribe());
    this.courseSubscriptions.clear();
    console.log('✅ Cleaned up all course sync subscriptions');
  }
}

export default CommunityService;
