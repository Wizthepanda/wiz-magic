import { Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorLevel?: number;
  title: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  votes?: number;
  zaps?: number;
  communityName?: string;
  createdAgo?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  isPinned?: boolean;
  reactions?: Record<string, number>;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorLevel?: number;
  text: string;
  createdAgo?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  upvotes?: number;
  downvotes?: number;
  parentId?: string;
  replies?: Comment[];
}

export interface Community {
  id: string;
  name: string;
  about?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  memberCount?: number;
  topContributors?: Array<{
    id: string;
    username: string;
    avatar: string;
    zaps: number;
  }>;
}
