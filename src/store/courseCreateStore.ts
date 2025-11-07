import { create } from 'zustand';
import type { CourseCreateState, CourseModule, CourseLesson, CourseDifficulty, CourseVisibility } from '@/types/course';
import {
  saveCourseDraftToLocal,
  loadCourseDraftFromLocal,
  removeCourseDraftFromLocal
} from '@/lib/courseDraftStorage';

const initialState = {
  title: '',
  shortDescription: '',
  longDescription: '',
  difficulty: 'beginner' as CourseDifficulty,
  category: '',
  subcategory: undefined,
  tags: [],
  
  coverURL: undefined,
  bannerURL: undefined,
  themeColor: '#6366f1', // Default indigo
  
  modules: [],
  
  visibility: 'public' as CourseVisibility,
  featuredCommunityID: undefined,
  featuredCommunityName: undefined,
  
  status: 'draft' as const,
  enrollmentCount: 0,
  rating: undefined,
  reviewsCount: undefined,
  
  publishedAt: undefined,
  zapRewardOnComplete: undefined,
  isPremium: false,
  priceZAPs: undefined,
  priceUSD: undefined,
};

export const useCourseCreateStore = create<CourseCreateState>()((set, get) => ({
  ...initialState,
  currentUserId: null,
  
  // Step 1: Details Actions
  setTitle: (title) => set({ title }),
  setShortDescription: (shortDescription) => set({ shortDescription }),
  setLongDescription: (longDescription) => set({ longDescription }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setCategory: (category) => set({ category, subcategory: undefined }),
  setSubcategory: (subcategory) => set({ subcategory }),
  setTags: (tags) => set({ tags }),
  
  // Step 2: Branding Actions
  setCoverURL: (coverURL) => set({ coverURL }),
  setBannerURL: (bannerURL) => set({ bannerURL }),
  setThemeColor: (themeColor) => set({ themeColor }),
  
  // Step 3: Curriculum Actions
  setModules: (modules) => set({ modules }),
  
  addModule: (module) => set((state) => ({
    modules: [...state.modules, module]
  })),
  
  updateModule: (moduleId, updates) => set((state) => ({
    modules: state.modules.map(m =>
      m.id === moduleId ? { ...m, ...updates } : m
    )
  })),
  
  removeModule: (moduleId) => set((state) => ({
    modules: state.modules.filter(m => m.id !== moduleId)
  })),
  
  reorderModules: (startIndex, endIndex) => set((state) => {
    const modules = [...state.modules];
    const [removed] = modules.splice(startIndex, 1);
    modules.splice(endIndex, 0, removed);
    
    // Update order property
    return {
      modules: modules.map((m, idx) => ({ ...m, order: idx }))
    };
  }),
  
  addLesson: (moduleId, lesson) => set((state) => ({
    modules: state.modules.map(m =>
      m.id === moduleId
        ? { ...m, lessons: [...m.lessons, lesson] }
        : m
    )
  })),
  
  updateLesson: (moduleId, lessonId, updates) => set((state) => ({
    modules: state.modules.map(m =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map(l =>
              l.id === lessonId ? { ...l, ...updates } : l
            )
          }
        : m
    )
  })),
  
  removeLesson: (moduleId, lessonId) => set((state) => ({
    modules: state.modules.map(m =>
      m.id === moduleId
        ? {
            ...m,
            lessons: m.lessons.filter(l => l.id !== lessonId)
          }
        : m
    )
  })),
  
  reorderLessons: (moduleId, startIndex, endIndex) => set((state) => ({
    modules: state.modules.map(m => {
      if (m.id !== moduleId) return m;
      
      const lessons = [...m.lessons];
      const [removed] = lessons.splice(startIndex, 1);
      lessons.splice(endIndex, 0, removed);
      
      // Update order property
      return {
        ...m,
        lessons: lessons.map((l, idx) => ({ ...l, order: idx }))
      };
    })
  })),
  
  // Step 4: Publishing Actions
  setVisibility: (visibility) => set({ visibility }),
  setFeaturedCommunity: (featuredCommunityID, featuredCommunityName) =>
    set({ featuredCommunityID, featuredCommunityName }),
  setStatus: (status) => set({ status }),
  
  // Draft Management Actions
  loadDraftForUser: (userId) => {
    if (!userId) {
      console.log('🔄 No user - resetting course draft to defaults');
      set({ ...initialState, currentUserId: null });
      return;
    }
    
    const persisted = loadCourseDraftFromLocal(userId);
    
    if (persisted && typeof persisted === 'object') {
      console.log(`📂 Loading course draft for user: ${userId}`);
      set({ ...(persisted as any), currentUserId: userId });
    } else {
      console.log(`📭 No course draft found for user: ${userId} - starting fresh`);
      set({ ...initialState, currentUserId: userId });
    }
  },
  
  persistDraftToStorage: () => {
    const state = get();
    const {
      currentUserId,
      loadDraftForUser,
      persistDraftToStorage,
      clearDraftForUser,
      replaceDraft,
      resetStore,
      setTitle,
      setShortDescription,
      setLongDescription,
      setDifficulty,
      setCategory,
      setSubcategory,
      setTags,
      setCoverURL,
      setBannerURL,
      setThemeColor,
      setModules,
      addModule,
      updateModule,
      removeModule,
      reorderModules,
      addLesson,
      updateLesson,
      removeLesson,
      reorderLessons,
      setVisibility,
      setFeaturedCommunity,
      setStatus,
      ...draftState
    } = state;
    
    if (!currentUserId) {
      console.warn('⚠️ Cannot persist course draft: No user ID');
      return;
    }
    
    saveCourseDraftToLocal(currentUserId, draftState);
  },
  
  clearDraftForUser: (userId) => {
    if (!userId) {
      console.warn('⚠️ Cannot clear course draft: No userId provided');
      return;
    }
    
    removeCourseDraftFromLocal(userId);
    
    // If clearing current user's draft, also reset store
    const state = get();
    if (state.currentUserId === userId) {
      set({ ...initialState, currentUserId: null });
    }
  },
  
  replaceDraft: (newState) => {
    const state = get();
    set({ ...newState, currentUserId: state.currentUserId } as any);
  },
  
  resetStore: () => set({ ...initialState, currentUserId: null }),
}));

