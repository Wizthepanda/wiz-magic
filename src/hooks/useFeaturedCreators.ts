import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedCreator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  category: string;
  followers: number;
  videos: number;
  zapsDistributed: number;
  verified: boolean;
  createdAt: Date;
}

// Mock fallback data for offline/error scenarios
const mockFeaturedCreators: FeaturedCreator[] = [
  {
    id: 'mock-1',
    name: 'Sarah Chen',
    username: '@sarahcodes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    category: 'Web Development',
    followers: 125000,
    videos: 324,
    zapsDistributed: 1250000,
    verified: true,
    createdAt: new Date(),
  },
  {
    id: 'mock-2',
    name: 'Michael Torres',
    username: '@coachmikey',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    coverImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop',
    category: 'Career Coaching',
    followers: 87000,
    videos: 156,
    zapsDistributed: 875000,
    verified: true,
    createdAt: new Date(),
  },
  {
    id: 'mock-3',
    name: 'Emma Wilson',
    username: '@designemma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    category: 'UI/UX Design',
    followers: 203000,
    videos: 445,
    zapsDistributed: 2030000,
    verified: true,
    createdAt: new Date(),
  },
  {
    id: 'mock-4',
    name: 'David Kim',
    username: '@davidteaches',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    category: 'Data Science',
    followers: 156000,
    videos: 267,
    zapsDistributed: 1560000,
    verified: true,
    createdAt: new Date(),
  },
  {
    id: 'mock-5',
    name: 'Lisa Anderson',
    username: '@lisacreates',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
    category: 'Content Creation',
    followers: 94000,
    videos: 189,
    zapsDistributed: 940000,
    verified: true,
    createdAt: new Date(),
  },
  {
    id: 'mock-6',
    name: 'James Martinez',
    username: '@jamescodes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    category: 'Mobile Development',
    followers: 178000,
    videos: 389,
    zapsDistributed: 1780000,
    verified: true,
    createdAt: new Date(),
  },
];

async function fetchFeaturedCreators(): Promise<FeaturedCreator[]> {
  try {
    const creatorsRef = collection(db, 'creators');
    const q = query(
      creatorsRef,
      where('featured', '==', true),
      where('isActive', '==', true),
      orderBy('followers', 'desc'),
      limit(8)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No featured creators found, using mock data');
      return mockFeaturedCreators;
    }

    const creators = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FeaturedCreator[];

    return creators;
  } catch (error) {
    console.error('Error fetching featured creators:', error);
    // Return mock data on error
    return mockFeaturedCreators;
  }
}

export function useFeaturedCreators() {
  return useQuery({
    queryKey: ['featured-creators'],
    queryFn: fetchFeaturedCreators,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 1,
    placeholderData: mockFeaturedCreators, // Show mock data while loading
  });
}
