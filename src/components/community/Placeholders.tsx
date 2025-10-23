/**
 * Placeholder data for Community Page visual QA
 * Used in development mode to preview UI without API calls
 */

import { Eye, MessageCircle, Share2, Users, Trophy, Target } from 'lucide-react';

export interface CommunityData {
  id: string;
  name: string;
  bannerUrl: string;
  profileIconUrl: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  accessType: 'Free' | 'Free ZAPs' | 'ZAPs' | 'ZAPs+USD' | 'USD';
  zapsCost?: number;
  usdCost?: number;
  slots: {
    claimed: number;
    total: number;
  };
  progress: number;
  publishedAt: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorBio: string;
  creatorLevel: number;
  memberCount: number;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  content: string;
  embedUrl?: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  content: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'file';
    url: string;
    thumbnail?: string;
    name?: string;
  }>;
  embedUrl?: string;
  embedPreview?: {
    title: string;
    thumbnail: string;
    provider: string;
  };
  isPinned: boolean;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  reactions: Record<string, number>; // emoji -> count
  userReactions: string[]; // emojis user has reacted with
  replies?: Reply[];
  commentCount: number;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'Creator' | 'Moderator' | 'Member';
  level: number;
  zaps: number;
  isOnline: boolean;
  joinedAt: string;
}

export interface Course {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  progress: number;
  duration: string;
  lessons: number; // Previously 'modules'
  xpReward: number;
  studentCount: number; // New field
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'; // New field
  zapsCost?: number;
  enrolled: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  xpRequired: number;
  icon: string;
  benefit: string;
  claimed: boolean;
  claimedCount: number;
  totalCount: number;
  progress: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  zaps: number;
  xp?: number; // Backward compatibility
  level: number;
  badges: string[];
  postCount: number; // New field
  commentCount: number; // New field
  trend?: 'up' | 'down' | 'same'; // New field
}

// Sample community data
export const placeholderCommunity: CommunityData = {
  id: 'sample-1',
  name: 'How We Launched "SoulScapes" NFT',
  bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
  profileIconUrl: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=200&h=200&fit=crop',
  tags: ['NFT', 'Art', 'Web3', 'Creator Economy'],
  rating: 4.8,
  ratingCount: 234,
  accessType: 'Free ZAPs',
  zapsCost: 500,
  slots: {
    claimed: 847,
    total: 2000
  },
  progress: 42,
  publishedAt: '2024-12-15',
  description: 'Learn how we built and launched SoulScapes NFT from concept to 10k holders. This community includes exclusive behind-the-scenes content, AMA sessions, and direct access to the core team.',
  creatorId: 'creator-1',
  creatorName: 'Irfan Dean',
  creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
  creatorBio: 'NFT artist & community builder. Founder of SoulScapes. Helping creators monetize their passion.',
  creatorLevel: 45,
  memberCount: 847
};

// Sample posts (2 pinned + 8 normal)
export const placeholderPosts: Post[] = [
  // Pinned post 1 - with video embed
  {
    id: 'post-pinned-1',
    authorId: 'creator-1',
    authorName: 'Irfan Dean',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
    authorLevel: 45,
    content: '🎉 Welcome to the SoulScapes community! Watch this video to learn what we\'re building together.',
    embedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    embedPreview: {
      title: 'SoulScapes Launch Announcement',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      provider: 'YouTube'
    },
    isPinned: true,
    upvotes: 342,
    downvotes: 8,
    userVote: null,
    reactions: { '🔥': 156, '❤️': 89, '🚀': 67, '👏': 43 },
    userReactions: [],
    commentCount: 45,
    createdAt: '2024-12-15T10:00:00Z'
  },
  // Pinned post 2 - with image
  {
    id: 'post-pinned-2',
    authorId: 'creator-1',
    authorName: 'Irfan Dean',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
    authorLevel: 45,
    content: '📋 Community Guidelines: Be respectful, help each other grow, and share your wins! Full guidelines in the About tab.',
    attachments: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop'
    }],
    isPinned: true,
    upvotes: 234,
    downvotes: 3,
    userVote: 'up',
    reactions: { '👍': 124, '🙌': 56, '💯': 34 },
    userReactions: ['👍'],
    commentCount: 28,
    createdAt: '2024-12-16T14:00:00Z'
  },
  // Normal posts
  {
    id: 'post-1',
    authorId: 'user-1',
    authorName: 'Sarah Mitchell',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    authorLevel: 32,
    content: 'Just minted my first SoulScapes NFT! The community here is incredible. Thanks @IrfanDean for creating this space 🎨✨',
    attachments: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=300&h=300&fit=crop'
    }],
    isPinned: false,
    upvotes: 187,
    downvotes: 2,
    userVote: null,
    reactions: { '🎨': 45, '✨': 32, '🔥': 28 },
    userReactions: [],
    commentCount: 23,
    createdAt: '2024-12-18T09:30:00Z'
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    authorName: 'Marcus Chen',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    authorLevel: 28,
    content: 'Quick question for the community: What\'s the best approach for promoting your NFT collection? Looking for real experiences, not theory!',
    isPinned: false,
    upvotes: 156,
    downvotes: 5,
    userVote: null,
    reactions: { '🤔': 34, '💡': 21 },
    userReactions: [],
    commentCount: 67,
    createdAt: '2024-12-18T11:45:00Z'
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    authorName: 'Luna Park',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
    authorLevel: 41,
    content: 'Sharing my latest artwork from the SoulScapes collection! Took me 3 days but I\'m super proud of how it turned out 💜',
    attachments: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=300&h=300&fit=crop'
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1620503374956-c942862f0372?w=600&h=600&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1620503374956-c942862f0372?w=300&h=300&fit=crop'
      }
    ],
    isPinned: false,
    upvotes: 298,
    downvotes: 4,
    userVote: 'up',
    reactions: { '💜': 87, '🎨': 54, '🔥': 43, '😍': 32 },
    userReactions: ['💜', '🔥'],
    commentCount: 41,
    createdAt: '2024-12-18T15:20:00Z'
  },
  {
    id: 'post-4',
    authorId: 'user-4',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    authorLevel: 36,
    content: 'Pro tip: Always test your smart contracts on testnet first! Saved me from a costly mistake. Here\'s a quick tutorial I made:',
    embedUrl: 'https://www.youtube.com/watch?v=xyz123',
    embedPreview: {
      title: 'Smart Contract Testing Tutorial',
      thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop',
      provider: 'YouTube'
    },
    isPinned: false,
    upvotes: 213,
    downvotes: 3,
    userVote: null,
    reactions: { '💡': 56, '👍': 43, '🙏': 28 },
    userReactions: [],
    commentCount: 34,
    createdAt: '2024-12-19T08:15:00Z'
  },
  {
    id: 'post-5',
    authorId: 'user-5',
    authorName: 'Emma Davis',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    authorLevel: 24,
    content: 'Milestone reached! 🎉 Just hit 100 holders for my collection. Thank you to this amazing community for all the support and guidance!',
    isPinned: false,
    upvotes: 178,
    downvotes: 1,
    userVote: null,
    reactions: { '🎉': 67, '👏': 45, '🚀': 34 },
    userReactions: [],
    commentCount: 52,
    createdAt: '2024-12-19T12:00:00Z'
  },
  {
    id: 'post-6',
    authorId: 'user-6',
    authorName: 'Jordan Kim',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    authorLevel: 19,
    content: 'Does anyone have experience with OpenSea vs Rarible? Trying to decide which platform to use for my first drop.',
    isPinned: false,
    upvotes: 92,
    downvotes: 7,
    userVote: null,
    reactions: { '🤔': 23 },
    userReactions: [],
    commentCount: 48,
    createdAt: '2024-12-19T16:30:00Z'
  },
  {
    id: 'post-7',
    authorId: 'user-7',
    authorName: 'Sophia Lee',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
    authorLevel: 38,
    content: 'Just finished the Smart Contract Basics course! 🎓 My mind is blown. If you haven\'t taken it yet, highly recommend!',
    isPinned: false,
    upvotes: 145,
    downvotes: 2,
    userVote: null,
    reactions: { '🎓': 34, '💯': 28, '🔥': 21 },
    userReactions: [],
    commentCount: 19,
    createdAt: '2024-12-20T09:00:00Z'
  },
  {
    id: 'post-8',
    authorId: 'user-8',
    authorName: 'Ryan Martinez',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
    authorLevel: 29,
    content: 'Weekend project update! Building a minting dashboard for my collection. Progress screenshots attached 📸',
    attachments: [{
      type: 'image',
      url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=200&fit=crop'
    }],
    isPinned: false,
    upvotes: 167,
    downvotes: 4,
    userVote: null,
    reactions: { '💻': 45, '👨‍💻': 32, '🚀': 28 },
    userReactions: [],
    commentCount: 31,
    createdAt: '2024-12-20T14:45:00Z'
  }
];

// Sample members
export const placeholderMembers: Member[] = [
  {
    id: 'creator-1',
    name: 'Irfan Dean',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
    role: 'Creator',
    level: 45,
    zaps: 15670,
    isOnline: true,
    joinedAt: '2024-12-15'
  },
  {
    id: 'user-1',
    name: 'Sarah Mitchell',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: 'Moderator',
    level: 32,
    zaps: 9240,
    isOnline: true,
    joinedAt: '2024-12-15'
  },
  {
    id: 'user-2',
    name: 'Marcus Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    role: 'Member',
    level: 28,
    zaps: 7890,
    isOnline: false,
    joinedAt: '2024-12-16'
  },
  {
    id: 'user-3',
    name: 'Luna Park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
    role: 'Member',
    level: 41,
    zaps: 13420,
    isOnline: true,
    joinedAt: '2024-12-16'
  },
  {
    id: 'user-4',
    name: 'Alex Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    role: 'Member',
    level: 36,
    zaps: 10890,
    isOnline: true,
    joinedAt: '2024-12-17'
  },
  {
    id: 'user-5',
    name: 'Emma Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    role: 'Member',
    level: 24,
    zaps: 6120,
    isOnline: false,
    joinedAt: '2024-12-17'
  },
  {
    id: 'user-6',
    name: 'Jordan Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    role: 'Member',
    level: 19,
    zaps: 4560,
    isOnline: true,
    joinedAt: '2024-12-18'
  },
  {
    id: 'user-7',
    name: 'Sophia Lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
    role: 'Member',
    level: 38,
    zaps: 11980,
    isOnline: false,
    joinedAt: '2024-12-18'
  },
  {
    id: 'user-8',
    name: 'Ryan Martinez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
    role: 'Member',
    level: 29,
    zaps: 8340,
    isOnline: true,
    joinedAt: '2024-12-19'
  },
  {
    id: 'user-9',
    name: 'Olivia Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
    role: 'Member',
    level: 22,
    zaps: 5670,
    isOnline: false,
    joinedAt: '2024-12-19'
  },
  {
    id: 'user-10',
    name: 'Noah Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noah',
    role: 'Member',
    level: 26,
    zaps: 7120,
    isOnline: true,
    joinedAt: '2024-12-20'
  },
  {
    id: 'user-11',
    name: 'Ava Taylor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ava',
    role: 'Member',
    level: 31,
    zaps: 8890,
    isOnline: true,
    joinedAt: '2024-12-20'
  }
];

// Sample courses
export const placeholderCourses: Course[] = [
  {
    id: 'course-1',
    title: 'NFT Smart Contracts Masterclass',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop',
    description: 'Learn to build, deploy, and optimize NFT smart contracts from scratch',
    progress: 65,
    duration: '8h 30m',
    lessons: 12,
    xpReward: 500,
    studentCount: 234,
    difficulty: 'Advanced',
    zapsCost: 250,
    enrolled: true
  },
  {
    id: 'course-2',
    title: 'Marketing Your NFT Collection',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
    description: 'Proven strategies to grow your NFT community and drive sales',
    progress: 30,
    duration: '5h 45m',
    lessons: 8,
    xpReward: 350,
    studentCount: 456,
    difficulty: 'Intermediate',
    zapsCost: 200,
    enrolled: true
  },
  {
    id: 'course-3',
    title: 'Advanced Digital Art Techniques',
    thumbnail: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400&h=250&fit=crop',
    description: 'Elevate your art with pro techniques used by top NFT artists',
    progress: 0,
    duration: '10h 15m',
    lessons: 15,
    xpReward: 600,
    studentCount: 189,
    difficulty: 'Advanced',
    zapsCost: 300,
    enrolled: false
  },
  {
    id: 'course-4',
    title: 'NFT Basics for Beginners',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=250&fit=crop',
    description: 'Start your NFT journey from zero to hero with this comprehensive guide',
    progress: 0,
    duration: '3h 20m',
    lessons: 6,
    xpReward: 250,
    studentCount: 678,
    difficulty: 'Beginner',
    enrolled: false
  },
  {
    id: 'course-5',
    title: 'Community Building Mastery',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop',
    description: 'Learn how to build and grow an engaged community around your project',
    progress: 0,
    duration: '6h 50m',
    lessons: 10,
    xpReward: 450,
    studentCount: 312,
    difficulty: 'Intermediate',
    enrolled: false
  },
  {
    id: 'course-6',
    title: 'Web3 Developer Bootcamp',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    description: 'Complete Web3 development course covering Solidity, React, and more',
    progress: 0,
    duration: '15h 40m',
    lessons: 24,
    xpReward: 1000,
    studentCount: 145,
    difficulty: 'Advanced',
    zapsCost: 500,
    enrolled: false
  }
];

// Sample rewards
export const placeholderRewards: Reward[] = [
  {
    id: 'reward-1',
    title: 'Early Adopter',
    description: 'Joined within first 100 members',
    xpRequired: 0,
    icon: '🏆',
    benefit: 'Exclusive Discord role + 100 bonus ZAPs',
    claimed: true,
    claimedCount: 98,
    totalCount: 100,
    progress: 100
  },
  {
    id: 'reward-2',
    title: 'Community Champion',
    description: 'Reached 1000 XP in this community',
    xpRequired: 1000,
    icon: '⭐',
    benefit: 'Featured member spotlight + custom badge',
    claimed: false,
    claimedCount: 0,
    totalCount: 1,
    progress: 45
  },
  {
    id: 'reward-3',
    title: 'Content Creator',
    description: 'Posted 10 helpful contributions',
    xpRequired: 500,
    icon: '✍️',
    benefit: 'Unlock private Creator channel',
    claimed: false,
    claimedCount: 0,
    totalCount: 1,
    progress: 70
  }
];

// Sample leaderboard
export const placeholderLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'creator-1',
    name: 'Irfan Dean',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
    zaps: 15670,
    level: 45,
    badges: ['Creator', '👑', '🏆'],
    postCount: 87,
    commentCount: 234,
    trend: 'up'
  },
  {
    rank: 2,
    userId: 'user-3',
    name: 'Luna Park',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
    zaps: 13420,
    level: 41,
    badges: ['Moderator', '🎨', '⭐'],
    postCount: 64,
    commentCount: 189,
    trend: 'up'
  },
  {
    rank: 3,
    userId: 'user-7',
    name: 'Sophia Lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
    zaps: 11980,
    level: 38,
    badges: ['Member', '🎓', '💯'],
    postCount: 52,
    commentCount: 167,
    trend: 'same'
  },
  {
    rank: 4,
    userId: 'user-4',
    name: 'Alex Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    zaps: 10890,
    level: 36,
    badges: ['Member', '💡'],
    postCount: 45,
    commentCount: 143,
    trend: 'down'
  },
  {
    rank: 5,
    userId: 'user-1',
    name: 'Sarah Mitchell',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    zaps: 9240,
    level: 32,
    badges: ['Member', '🛡️'],
    postCount: 38,
    commentCount: 124,
    trend: 'up'
  },
  {
    rank: 6,
    userId: 'user-8',
    name: 'Ryan Martinez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
    zaps: 8340,
    level: 29,
    badges: ['Member', '💻'],
    postCount: 31,
    commentCount: 98,
    trend: 'same'
  },
  {
    rank: 7,
    userId: 'user-2',
    name: 'Marcus Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
    zaps: 7890,
    level: 28,
    badges: ['Member'],
    postCount: 27,
    commentCount: 86,
    trend: 'down'
  },
  {
    rank: 8,
    userId: 'user-10',
    name: 'Noah Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noah',
    zaps: 7120,
    level: 26,
    badges: ['Member'],
    postCount: 24,
    commentCount: 71,
    trend: 'up'
  },
  {
    rank: 9,
    userId: 'user-5',
    name: 'Emma Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    zaps: 6120,
    level: 24,
    badges: ['Member', '🎉'],
    postCount: 19,
    commentCount: 56,
    trend: 'same'
  },
  {
    rank: 10,
    userId: 'user-9',
    name: 'Olivia Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
    zaps: 5670,
    level: 22,
    badges: ['Member'],
    postCount: 16,
    commentCount: 43,
    trend: 'up'
  }
];

// Phase 4: About Tab Data
export const placeholderCreator = {
  id: 'creator-1',
  name: 'Irfan Dean',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=irfan',
  tagline: 'Empowering the next wave of AI creators',
  bio: `I'm a passionate NFT artist and community builder with over 5 years of experience in the Web3 space. My journey started with a simple dream: to democratize digital art and help creators monetize their passion.

Through SoulScapes, I've helped hundreds of artists launch their collections, build engaged communities, and achieve financial independence. I believe in the power of community, creativity, and blockchain technology to transform lives.

When I'm not creating or teaching, you'll find me exploring new AI tools, collaborating with fellow artists, or sharing insights on Twitter. My mission is to empower 10,000 creators to build sustainable Web3 businesses by 2025.

Let's build the future of digital creativity together! 🚀`,
  isFollowing: false,
};

export const placeholderMilestones = [
  {
    id: 'milestone-1',
    title: 'Launched SoulScapes NFT',
    description: 'Released our flagship 10k NFT collection, selling out in 48 hours',
    date: 'Jan 2024',
    icon: '🚀',
  },
  {
    id: 'milestone-2',
    title: 'Reached 1000 Members',
    description: 'Community grew to 1000+ active members across Discord and platforms',
    date: 'Mar 2024',
    icon: '🎉',
  },
  {
    id: 'milestone-3',
    title: 'Launched Course Platform',
    description: 'Released 6 comprehensive courses teaching NFT creation and marketing',
    date: 'Jun 2024',
    icon: '📚',
  },
  {
    id: 'milestone-4',
    title: 'Partnership with OpenSea',
    description: 'Became featured creator on OpenSea with verified collection status',
    date: 'Sep 2024',
    icon: '🤝',
  },
  {
    id: 'milestone-5',
    title: 'Hit $1M in Sales',
    description: 'Community members collectively generated over $1M in NFT sales',
    date: 'Nov 2024',
    icon: '💎',
  },
  {
    id: 'milestone-6',
    title: 'AI Tools Integration',
    description: 'Launched AI-powered tools suite for automated NFT generation',
    date: 'Dec 2024',
    icon: '🤖',
  },
];

export const placeholderCommunityStats = {
  memberCount: 847,
  totalXP: 125000,
  coursesLaunched: 6,
  postsCount: 1243,
};

// Phase 4: Rewards Tab Data
export const placeholderRewardTiers = [
  {
    id: 'tier-bronze',
    tier: 'Bronze' as const,
    title: 'Bronze Tier',
    xpRequired: 1000,
    rewards: [
      'Bronze tier badge on profile',
      'Access to exclusive Bronze channels',
      '10% discount on all courses',
      'Early access to new content',
    ],
    icon: '🥉',
    isClaimed: false,
  },
  {
    id: 'tier-silver',
    tier: 'Silver' as const,
    title: 'Silver Tier',
    xpRequired: 5000,
    rewards: [
      'Silver tier badge on profile',
      'Priority support in community',
      '20% discount on all courses',
      'Monthly exclusive webinars',
      'Custom profile themes',
    ],
    icon: '🥈',
    isClaimed: false,
  },
  {
    id: 'tier-gold',
    tier: 'Gold' as const,
    title: 'Gold Tier',
    xpRequired: 15000,
    rewards: [
      'Gold tier badge with special effects',
      '1-on-1 consultation with Irfan',
      '40% discount on all courses',
      'Exclusive Gold member events',
      'Featured in community spotlight',
      'Early access to new NFT drops',
    ],
    icon: '🥇',
    isClaimed: false,
  },
  {
    id: 'tier-diamond',
    tier: 'Diamond' as const,
    title: 'Diamond Tier',
    xpRequired: 50000,
    rewards: [
      'Diamond tier badge with animations',
      'Free access to all courses (lifetime)',
      'Monthly 1-on-1 mentorship sessions',
      'Co-create content with Irfan',
      'Exclusive Diamond retreat invite',
      'Revenue share opportunities',
      'Custom NFT airdrop',
    ],
    icon: '💎',
    isClaimed: false,
  },
];

export const placeholderEarnActions = [
  {
    icon: Eye,
    action: 'Watch',
    xpAmount: 10,
    color: 'purple',
  },
  {
    icon: MessageCircle,
    action: 'Comment',
    xpAmount: 15,
    color: 'blue',
  },
  {
    icon: Share2,
    action: 'Share',
    xpAmount: 20,
    color: 'green',
  },
  {
    icon: Users,
    action: 'Refer',
    xpAmount: 100,
    color: 'amber',
  },
  {
    icon: Trophy,
    action: 'Post',
    xpAmount: 50,
    color: 'pink',
  },
  {
    icon: Target,
    action: 'Complete',
    xpAmount: 500,
    color: 'purple',
  },
];

export const placeholderUserProgress = {
  currentXP: 8450,
  currentLevel: 28,
  nextLevelXP: 10000,
};

// Phase 5: Side Panel Communities Data
export const placeholderUserCommunities = [
  {
    id: 'sample-1',
    name: 'How We Launched "SoulScapes" NFT',
    icon: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=200&h=200&fit=crop',
    memberCount: 847,
    status: 'Published' as const,
  },
  {
    id: 'community-2',
    name: 'AI Creators Hub',
    icon: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop',
    memberCount: 1243,
    status: 'Published' as const,
  },
  {
    id: 'community-3',
    name: 'Web3 Marketing Mastery',
    icon: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop',
    memberCount: 567,
    status: 'Published' as const,
  },
  {
    id: 'community-4',
    name: 'Digital Art Collective',
    icon: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=200&h=200&fit=crop',
    memberCount: 89,
    status: 'Draft' as const,
  },
  {
    id: 'community-5',
    name: 'Crypto Trading Academy',
    icon: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&h=200&fit=crop',
    memberCount: 2156,
    status: 'Published' as const,
  },
];

// Phase 7: Quests & Achievements Data
export const placeholderQuests = [
  {
    id: 'quest-1',
    title: 'Post your first message',
    description: 'Welcome to the community! Introduce yourself',
    icon: '💬',
    progress: 1,
    target: 1,
    xpReward: 50,
    completed: false,
  },
  {
    id: 'quest-2',
    title: 'React to 5 posts',
    description: 'Show some love to fellow community members',
    icon: '❤️',
    progress: 3,
    target: 5,
    xpReward: 30,
    completed: false,
  },
  {
    id: 'quest-3',
    title: 'Complete a course lesson',
    description: 'Continue your learning journey',
    icon: '📚',
    progress: 0,
    target: 1,
    xpReward: 100,
    completed: false,
  },
  {
    id: 'quest-4',
    title: 'Watch 30 minutes of content',
    description: 'Keep watching to earn XP',
    icon: '🎥',
    progress: 18,
    target: 30,
    xpReward: 75,
    completed: false,
  },
  {
    id: 'quest-5',
    title: 'Invite a friend',
    description: 'Share the community with someone special',
    icon: '🤝',
    progress: 0,
    target: 1,
    xpReward: 150,
    completed: false,
  },
  {
    id: 'quest-6',
    title: 'Upvote 3 helpful posts',
    description: 'Support quality content in the community',
    icon: '👍',
    progress: 1,
    target: 3,
    xpReward: 25,
    completed: false,
  },
];

export const placeholderAchievements = [
  {
    id: 'achievement-1',
    icon: '🎯',
    title: 'First Steps',
    description: 'Complete your first quest',
    unlocked: true,
    unlockedAt: '2024-12-15T10:00:00Z',
    rarity: 'common' as const,
  },
  {
    id: 'achievement-2',
    icon: '🔥',
    title: '7-Day Streak',
    description: 'Visit the community 7 days in a row',
    unlocked: true,
    unlockedAt: '2024-12-20T08:00:00Z',
    rarity: 'rare' as const,
  },
  {
    id: 'achievement-3',
    icon: '💬',
    title: 'Chatterbox',
    description: 'Post 50 messages in the community',
    unlocked: false,
    rarity: 'common' as const,
  },
  {
    id: 'achievement-4',
    icon: '❤️',
    title: 'Loved',
    description: 'Receive 100 reactions on your posts',
    unlocked: true,
    unlockedAt: '2024-12-18T15:30:00Z',
    rarity: 'rare' as const,
  },
  {
    id: 'achievement-5',
    icon: '🎓',
    title: 'Scholar',
    description: 'Complete 3 courses',
    unlocked: false,
    rarity: 'epic' as const,
  },
  {
    id: 'achievement-6',
    icon: '⭐',
    title: 'Rising Star',
    description: 'Reach Level 10',
    unlocked: true,
    unlockedAt: '2024-12-16T12:00:00Z',
    rarity: 'common' as const,
  },
  {
    id: 'achievement-7',
    icon: '🏆',
    title: 'Champion',
    description: 'Reach Level 25',
    unlocked: true,
    unlockedAt: '2024-12-19T09:00:00Z',
    rarity: 'epic' as const,
  },
  {
    id: 'achievement-8',
    icon: '👑',
    title: 'Legend',
    description: 'Reach Level 50',
    unlocked: false,
    rarity: 'legendary' as const,
  },
  {
    id: 'achievement-9',
    icon: '🎨',
    title: 'Creative Soul',
    description: 'Share 10 artworks with the community',
    unlocked: false,
    rarity: 'rare' as const,
  },
  {
    id: 'achievement-10',
    icon: '🚀',
    title: 'Early Adopter',
    description: 'Join within the first 100 members',
    unlocked: true,
    unlockedAt: '2024-12-15T10:30:00Z',
    rarity: 'legendary' as const,
  },
  {
    id: 'achievement-11',
    icon: '💎',
    title: 'VIP Member',
    description: 'Unlock Diamond tier',
    unlocked: false,
    rarity: 'legendary' as const,
  },
  {
    id: 'achievement-12',
    icon: '📝',
    title: 'Helpful Guide',
    description: 'Write 25 helpful comments',
    unlocked: false,
    rarity: 'rare' as const,
  },
  {
    id: 'achievement-13',
    icon: '🎯',
    title: 'Quest Master',
    description: 'Complete 100 quests',
    unlocked: false,
    rarity: 'epic' as const,
  },
  {
    id: 'achievement-14',
    icon: '🌟',
    title: 'Influencer',
    description: 'Get 10 people to join via your referral',
    unlocked: false,
    rarity: 'epic' as const,
  },
  {
    id: 'achievement-15',
    icon: '💪',
    title: 'Consistent',
    description: '30-day activity streak',
    unlocked: false,
    rarity: 'epic' as const,
  },
  {
    id: 'achievement-16',
    icon: '🎭',
    title: 'Personality',
    description: 'Customize your profile fully',
    unlocked: true,
    unlockedAt: '2024-12-15T11:00:00Z',
    rarity: 'common' as const,
  },
  {
    id: 'achievement-17',
    icon: '🔮',
    title: 'Visionary',
    description: 'Share a post that gets 500+ views',
    unlocked: false,
    rarity: 'rare' as const,
  },
  {
    id: 'achievement-18',
    icon: '🎪',
    title: 'Event Host',
    description: 'Host a community event',
    unlocked: false,
    rarity: 'epic' as const,
  },
  {
    id: 'achievement-19',
    icon: '💝',
    title: 'Generous',
    description: 'Tip other members 10 times',
    unlocked: false,
    rarity: 'rare' as const,
  },
  {
    id: 'achievement-20',
    icon: '🌈',
    title: 'Collector',
    description: 'Unlock all badges',
    unlocked: false,
    rarity: 'legendary' as const,
  },
];

/**
 * Hook to load placeholder data in development mode
 */
export function usePlaceholderData() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    community: isDevelopment ? placeholderCommunity : null,
    posts: isDevelopment ? placeholderPosts : null,
    members: isDevelopment ? placeholderMembers : null,
    courses: isDevelopment ? placeholderCourses : null,
    rewards: isDevelopment ? placeholderRewards : null,
    leaderboard: isDevelopment ? placeholderLeaderboard : null,
    creator: isDevelopment ? placeholderCreator : null,
    milestones: isDevelopment ? placeholderMilestones : null,
    communityStats: isDevelopment ? placeholderCommunityStats : null,
    rewardTiers: isDevelopment ? placeholderRewardTiers : null,
    earnActions: isDevelopment ? placeholderEarnActions : null,
    userProgress: isDevelopment ? placeholderUserProgress : null,
    userCommunities: isDevelopment ? placeholderUserCommunities : null,
    quests: isDevelopment ? placeholderQuests : null,
    achievements: isDevelopment ? placeholderAchievements : null,
  };
}
