import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  saveDraftToLocal,
  loadDraftFromLocal,
  removeDraftFromLocal,
  migrateGlobalDraftToUser
} from '@/lib/draftStorage';

export interface ZAPRewardTier {
  id: string;
  name: string;
  trigger: 'join' | 'milestone' | 'referral' | 'custom';
  amount: number;
  emoji: string;
  description?: string;
  badgeColor: string;
}

export interface CommunityCreateState {
  // Step 1: Details
  title: string;
  tagline: string;
  category: string;
  subCategory?: string;
  description: string;
  longDescription?: string;
  profileIcon?: string;
  bannerUrl?: string;
  coverMedia: Array<{ type: 'image' | 'youtube'; url: string; thumbnail?: string }>;
  tags: string[];
  visibility: 'public' | 'private' | 'token-gated';

  // Step 2: Content
  linkedCourses: Array<{ id: string; name: string; thumbnail?: string }>;
  zapRewardTiers: ZAPRewardTier[];

  // Step 3: Monetization & Access
  pricingModel: 'free' | 'free-zaps' | 'usd' | 'zaps' | 'zaps-usd' | 'crypto' | 'waitlist';
  zapsRequired: number;
  usdAmount: number;
  cryptoTypes: Array<'usdt' | 'btc' | 'usdc' | 'doge'>;
  cryptoAmount: string;
  freeTrialEnabled: boolean;
  freeTrialDays: number;
  accessType: 'open' | 'request' | 'token-gated';

  // Step 4: Publish
  status: 'draft' | 'published' | 'scheduled';
  publishDate?: Date;

  // Community ID for updates
  communityId?: string;

  // Actions
  setTitle: (title: string) => void;
  setTagline: (tagline: string) => void;
  setCategory: (category: string) => void;
  setSubCategory: (subCategory: string) => void;
  setDescription: (description: string) => void;
  setLongDescription: (longDescription: string) => void;
  setProfileIcon: (profileIcon: string) => void;
  setBannerUrl: (bannerUrl: string) => void;
  setCoverMedia: (coverMedia: Array<{ type: 'image' | 'youtube'; url: string; thumbnail?: string }>) => void;
  setTags: (tags: string[]) => void;
  setVisibility: (visibility: 'public' | 'private' | 'token-gated') => void;

  setLinkedCourses: (courses: Array<{ id: string; name: string; thumbnail?: string }>) => void;
  addLinkedCourse: (course: { id: string; name: string; thumbnail?: string }) => void;
  removeLinkedCourse: (courseId: string) => void;

  setZapRewardTiers: (tiers: ZAPRewardTier[]) => void;
  addZapRewardTier: (tier: ZAPRewardTier) => void;
  updateZapRewardTier: (tierId: string, updates: Partial<ZAPRewardTier>) => void;
  removeZapRewardTier: (tierId: string) => void;

  setPricingModel: (model: 'free' | 'free-zaps' | 'usd' | 'zaps' | 'zaps-usd' | 'crypto' | 'waitlist') => void;
  setZapsRequired: (zaps: number) => void;
  setUsdAmount: (amount: number) => void;
  setCryptoTypes: (types: Array<'usdt' | 'btc' | 'usdc' | 'doge'>) => void;
  setCryptoAmount: (amount: string) => void;
  setFreeTrialEnabled: (enabled: boolean) => void;
  setFreeTrialDays: (days: number) => void;
  setAccessType: (type: 'open' | 'request' | 'token-gated') => void;

  setStatus: (status: 'draft' | 'published' | 'scheduled') => void;
  setPublishDate: (date: Date | undefined) => void;

  setCommunityId: (id: string) => void;
  resetStore: () => void;
  
  // Per-user draft management
  currentUserId: string | null;
  loadDraftForUser: (userId: string | null) => void;
  persistDraftToStorage: () => void;
  clearDraftForUser: (userId: string | null) => void;
  replaceDraft: (state: Partial<Omit<CommunityCreateState, 'currentUserId' | 'loadDraftForUser' | 'persistDraftToStorage' | 'clearDraftForUser' | 'replaceDraft'>>) => void;
}

const initialState = {
  title: '',
  tagline: '',
  category: '',
  subCategory: undefined,
  description: '',
  longDescription: '',
  profileIcon: undefined,
  bannerUrl: undefined,
  coverMedia: [],
  tags: [],
  visibility: 'public' as const,

  linkedCourses: [],
  zapRewardTiers: [],

  pricingModel: 'free' as const,
  zapsRequired: 0,
  usdAmount: 0,
  cryptoTypes: [],
  cryptoAmount: '',
  freeTrialEnabled: false,
  freeTrialDays: 7,
  accessType: 'open' as const,

  status: 'draft' as const,
  publishDate: undefined,

  communityId: undefined,
};

export const useCommunityCreateStore = create<CommunityCreateState>()((set, get) => ({
  ...initialState,
  currentUserId: null,

  // Step 1 Actions
  setTitle: (title) => set({ title }),
  setTagline: (tagline) => set({ tagline }),
  setCategory: (category) => set({ category, subCategory: undefined }), // Reset subCategory when category changes
  setSubCategory: (subCategory) => set({ subCategory }),
  setDescription: (description) => set({ description }),
  setVisibility: (visibility) => {
    // Temporarily disable token-gated option, default to public
    if (visibility === 'token-gated') {
      set({ visibility: 'public' });
    } else {
      set({ visibility });
    }
  },
  setLongDescription: (longDescription) => set({ longDescription }),
  setProfileIcon: (profileIcon) => set({ profileIcon }),
  setBannerUrl: (bannerUrl) => set({ bannerUrl }),
  setCoverMedia: (coverMedia) => set({ coverMedia }),
  setTags: (tags) => set({ tags }),

  // Step 2 Actions - Courses
  setLinkedCourses: (linkedCourses) => set({ linkedCourses }),
  addLinkedCourse: (course) => set((state) => ({
    linkedCourses: [...state.linkedCourses, course]
  })),
  removeLinkedCourse: (courseId) => set((state) => ({
    linkedCourses: state.linkedCourses.filter(c => c.id !== courseId)
  })),

  // Step 2 Actions - ZAP Rewards
  setZapRewardTiers: (zapRewardTiers) => set({ zapRewardTiers }),
  addZapRewardTier: (tier) => set((state) => ({
    zapRewardTiers: [...state.zapRewardTiers, tier]
  })),
  updateZapRewardTier: (tierId, updates) => set((state) => ({
    zapRewardTiers: state.zapRewardTiers.map(t =>
      t.id === tierId ? { ...t, ...updates } : t
    )
  })),
  removeZapRewardTier: (tierId) => set((state) => ({
    zapRewardTiers: state.zapRewardTiers.filter(t => t.id !== tierId)
  })),

  // Step 3 Actions
  setPricingModel: (pricingModel) => set({ pricingModel }),
  setZapsRequired: (zapsRequired) => set({ zapsRequired }),
  setUsdAmount: (usdAmount) => set({ usdAmount }),
  setCryptoTypes: (cryptoTypes) => set({ cryptoTypes }),
  setCryptoAmount: (cryptoAmount) => set({ cryptoAmount }),
  setFreeTrialEnabled: (freeTrialEnabled) => set({ freeTrialEnabled }),
  setFreeTrialDays: (freeTrialDays) => set({ freeTrialDays }),
  setAccessType: (accessType) => set({ accessType }),

  // Step 4 Actions
  setStatus: (status) => set({ status }),
  setPublishDate: (publishDate) => set({ publishDate }),

  // Utility Actions
  setCommunityId: (communityId) => set({ communityId }),
  resetStore: () => set({ ...initialState, currentUserId: null }),
  
  // Per-user draft management actions
  loadDraftForUser: (userId) => {
    if (!userId) {
      console.log('🔄 No user - resetting to defaults');
      set({ ...initialState, currentUserId: null });
      return;
    }
    
    // Try to migrate old global draft first (one-time migration)
    const migrated = migrateGlobalDraftToUser(userId);
    
    // Load draft for this user
    const persisted = loadDraftFromLocal(userId);
    
    if (persisted && typeof persisted === 'object') {
      console.log(`📂 Loading draft for user: ${userId}`);
      set({ ...(persisted as any), currentUserId: userId });
    } else {
      console.log(`📭 No draft found for user: ${userId} - starting fresh`);
      set({ ...initialState, currentUserId: userId });
    }
  },
  
  persistDraftToStorage: () => {
    const state = get();
    const { currentUserId, loadDraftForUser, persistDraftToStorage, clearDraftForUser, replaceDraft, ...draftState } = state;
    
    if (!currentUserId) {
      console.warn('⚠️ Cannot persist: No user ID');
      return;
    }
    
    saveDraftToLocal(currentUserId, draftState);
  },
  
  clearDraftForUser: (userId) => {
    if (!userId) {
      console.warn('⚠️ Cannot clear draft: No userId provided');
      return;
    }
    
    removeDraftFromLocal(userId);
    
    // If clearing current user's draft, also reset store
    const state = get();
    if (state.currentUserId === userId) {
      set({ ...initialState, currentUserId: null });
    }
  },
  
  replaceDraft: (newState) => {
    const state = get();
    set({ ...newState, currentUserId: state.currentUserId });
  },
}));
