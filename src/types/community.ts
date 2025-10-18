export type Community = {
  id: string;
  title: string;
  subtitle?: string;
  bannerUrl?: string;
  longDescription?: string;
  shortDescription?: string;
  description?: string;
  accessType: "Free" | "Free ZAPs" | "Paid" | "Paid ZAPs" | "ZAPs + USD";
  rewardType?: string;
  joined?: boolean;
  claimCost?: number | null;
  zapCost?: number;
  zapReward?: number;
  slotsClaimed?: number;
  slotsTotal?: number;
  slotsAvailable?: number;
  progress?: number;
  creator: { 
    name: string; 
    avatarUrl?: string; 
    level?: number;
    uid?: string;
  };
  duration?: string;
  privacy?: string;
  category?: string;
  itemType?: string;
  tags?: string[];
  coverMedia?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  modules?: Module[];
  members?: string[];
  membersCount?: number;
  limit?: {
    claimed: number;
    seats: number | string;
  };
  slug?: string;
  linkedCourseId?: string;
  linkedCourseName?: string;
};

export type Module = {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  progress?: number;
  duration?: string;
  order?: number;
};

export type Lesson = {
  id: string;
  title: string;
  description?: string;
  duration: string;
  zaps?: number;
  type?: 'video' | 'article' | 'quiz' | 'assignment';
  url?: string;
  thumbnailUrl?: string;
  completed?: boolean;
  order?: number;
};

export type Discussion = {
  id: string;
  title: string;
  content: string;
  author: {
    uid: string;
    name: string;
    avatarUrl?: string;
    level?: number;
  };
  createdAt: Date;
  replies?: number;
  likes?: number;
  isPinned?: boolean;
};

export type Member = {
  uid: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
  photoURL?: string;
  level?: number;
  role?: 'admin' | 'moderator' | 'member';
  joinedAt?: Date;
  progress?: number;
};

export type Reward = {
  id: string;
  title: string;
  description?: string;
  zaps: number;
  type?: 'download' | 'access' | 'event' | 'badge';
  claimed?: boolean;
  claimedAt?: Date;
  available?: boolean;
};

