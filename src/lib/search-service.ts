// Search service for videos and creators
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface Video {
  id: number;
  title: string;
  creator: string;
  avatar: string;
  thumbnail: string;
  duration: string;
  xpReward: number;
  category: string;
  categoryLabel: string;
  views: string;
  watched: boolean;
  progress: number;
  videoId: string;
  isNew: boolean;
}

export interface Creator {
  id: number;
  name: string;
  username: string;
  followers: string;
  videos: number;
  totalViews: string;
  specialty: string;
  thumbnail: string;
  avatar: string;
  verified: boolean;
  rating: number;
  twitterUrl?: string;
}

export interface SearchResult {
  id: string;
  type: 'video' | 'creator';
  title: string;
  subtitle?: string;
  thumbnail?: string;
  avatar?: string;
  data?: Video | Creator;
}

// Static data - in a real app, this would come from your database
const videos: Video[] = [
  {
    id: 1,
    title: 'WIZ Magic Demo Video',
    creator: 'WIZ Magic',
    avatar: '',
    thumbnail: '',
    duration: '0:27',
    xpReward: 25,
    category: 'ai',
    categoryLabel: 'AI',
    views: '1K',
    watched: false,
    progress: 0,
    videoId: '2M4asXviuoo',
    isNew: true
  },
  {
    id: 2,
    title: 'Building Wealth Through Tech Investments',
    creator: 'MoneyWizard',
    avatar: '',
    thumbnail: '',
    duration: '18:30',
    xpReward: 220,
    category: 'money',
    categoryLabel: 'MONEY',
    views: '78K',
    watched: false,
    progress: 65,
    videoId: 'jNQXAC9IVRw',
    isNew: false
  },
  {
    id: 3,
    title: 'React 19 Features You Need to Know',
    creator: 'CodeMaster',
    avatar: '',
    thumbnail: '',
    duration: '15:20',
    xpReward: 180,
    category: 'tech',
    categoryLabel: 'TECH',
    views: '32K',
    watched: true,
    progress: 100,
    videoId: 'ScMzIvxBSi4',
    isNew: false
  },
  {
    id: 4,
    title: 'Music Production Secrets Revealed',
    creator: 'BeatCreator',
    avatar: '',
    thumbnail: '',
    duration: '22:15',
    xpReward: 280,
    category: 'music',
    categoryLabel: 'MUSIC',
    views: '56K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: true
  },
  {
    id: 5,
    title: 'Advanced Machine Learning Techniques',
    creator: 'MLExpert',
    avatar: '',
    thumbnail: '',
    duration: '25:40',
    xpReward: 320,
    category: 'ai',
    categoryLabel: 'AI',
    views: '89K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
    isNew: false
  },
  {
    id: 6,
    title: 'Cryptocurrency Trading Strategies',
    creator: 'CryptoKing',
    avatar: '',
    thumbnail: '',
    duration: '19:55',
    xpReward: 240,
    category: 'money',
    categoryLabel: 'MONEY',
    views: '67K',
    watched: false,
    progress: 30,
    videoId: 'jNQXAC9IVRw',
    isNew: false
  },
  {
    id: 7,
    title: 'Fitness Transformation in 30 Days',
    creator: 'HealthGuru',
    avatar: '',
    thumbnail: '',
    duration: '16:45',
    xpReward: 200,
    category: 'health',
    categoryLabel: 'HEALTH',
    views: '91K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: false
  },
  {
    id: 8,
    title: 'Electronic Music Composition',
    creator: 'SynthMaster',
    avatar: '',
    thumbnail: '',
    duration: '24:30',
    xpReward: 260,
    category: 'music',
    categoryLabel: 'MUSIC',
    views: '54K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
    isNew: true
  }
];

const creators: Creator[] = [
  {
    id: 1,
    name: 'FERA',
    username: '@imagineFERA',
    followers: '125K',
    videos: 89,
    totalViews: '2.3M',
    specialty: 'Creative Visionary',
    thumbnail: '/Profile Pics/FERA.jpg',
    avatar: '/Profile Pics/FERA.jpg',
    verified: true,
    rating: 4.9,
    twitterUrl: 'https://x.com/imagineFERA'
  },
  {
    id: 2,
    name: 'Captain HaHaa',
    username: '@CaptainHaHaa',
    followers: '89K',
    videos: 156,
    totalViews: '1.8M',
    specialty: 'Gaming & Entertainment',
    thumbnail: '/Profile Pics/Captain Hahaa.jpg',
    avatar: '/Profile Pics/Captain Hahaa.jpg',
    verified: true,
    rating: 4.7,
    twitterUrl: 'https://x.com/CaptainHaHaa'
  },
  {
    id: 3,
    name: 'TechNinja',
    username: '@TechNinja',
    followers: '156K',
    videos: 203,
    totalViews: '4.1M',
    specialty: 'Technology Reviews',
    thumbnail: '/Profile Pics/Tech Ninja.jpg',
    avatar: '/Profile Pics/Tech Ninja.jpg',
    verified: true,
    rating: 4.8
  },
  {
    id: 4,
    name: 'MoneyWizard',
    username: '@MoneyWizard',
    followers: '78K',
    videos: 124,
    totalViews: '1.9M',
    specialty: 'Financial Education',
    thumbnail: '',
    avatar: '',
    verified: false,
    rating: 4.6
  },
  {
    id: 5,
    name: 'CodeMaster',
    username: '@CodeMaster',
    followers: '92K',
    videos: 167,
    totalViews: '2.1M',
    specialty: 'Programming Tutorials',
    thumbnail: '',
    avatar: '',
    verified: true,
    rating: 4.9
  },
  {
    id: 6,
    name: 'BeatCreator',
    username: '@BeatCreator',
    followers: '67K',
    videos: 89,
    totalViews: '1.5M',
    specialty: 'Music Production',
    thumbnail: '',
    avatar: '',
    verified: false,
    rating: 4.5
  }
];

export class SearchService {
  static async searchVideos(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    const matchedVideos = videos
      .filter(video => 
        video.title.toLowerCase().includes(searchTerm) ||
        video.creator.toLowerCase().includes(searchTerm) ||
        video.categoryLabel.toLowerCase().includes(searchTerm)
      )
      .slice(0, maxResults)
      .map(video => ({
        id: `video-${video.id}`,
        type: 'video' as const,
        title: video.title,
        subtitle: `${video.creator} • ${video.views} views • ${video.duration}`,
        thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
        data: video
      }));

    return matchedVideos;
  }

  static async searchCreators(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    const matchedCreators = creators
      .filter(creator => 
        creator.name.toLowerCase().includes(searchTerm) ||
        creator.username.toLowerCase().includes(searchTerm) ||
        creator.specialty.toLowerCase().includes(searchTerm)
      )
      .slice(0, maxResults)
      .map(creator => ({
        id: `creator-${creator.id}`,
        type: 'creator' as const,
        title: creator.name,
        subtitle: `${creator.followers} followers • ${creator.videos} videos • ${creator.specialty}`,
        avatar: creator.avatar || creator.thumbnail,
        data: creator
      }));

    return matchedCreators;
  }

  static async search(query: string, maxResults: number = 8): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const [videoResults, creatorResults] = await Promise.all([
      this.searchVideos(query, Math.ceil(maxResults * 0.7)), // Prioritize videos
      this.searchCreators(query, Math.floor(maxResults * 0.3))
    ]);

    // Combine and limit results
    const combinedResults = [...videoResults, ...creatorResults];
    return combinedResults.slice(0, maxResults);
  }

  static async getPopularSearches(): Promise<string[]> {
    // Return popular search terms
    return [
      'AI Revolution',
      'React 19',
      'Music Production',
      'Tech Investments',
      'Machine Learning',
      'Cryptocurrency',
      'FERA',
      'Captain HaHaa'
    ];
  }
}