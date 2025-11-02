import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedDeal {
  id: string;
  title: string;
  creator: string;
  zapCost: number;
  images: string[];
  claimed: number;
  total: number;
  rating: number;
  category: string;
  isSoldOut?: boolean;
  createdAt: Date;
}

// Mock fallback data for offline/error scenarios
const mockFeaturedDeals: FeaturedDeal[] = [
  {
    id: 'mock-1',
    title: 'Full-Stack Web Development Bootcamp',
    creator: 'Sarah Chen',
    zapCost: 15000,
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
    ],
    claimed: 1247,
    total: 2000,
    rating: 4.9,
    category: 'Course',
    createdAt: new Date(),
  },
  {
    id: 'mock-2',
    title: '1-on-1 Career Coaching Session',
    creator: 'Michael Torres',
    zapCost: 8500,
    images: [
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    ],
    claimed: 89,
    total: 100,
    rating: 5.0,
    category: 'Coaching',
    createdAt: new Date(),
  },
  {
    id: 'mock-3',
    title: 'Premium Design Community Access',
    creator: 'Emma Wilson',
    zapCost: 5000,
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
    ],
    claimed: 2340,
    total: 5000,
    rating: 4.8,
    category: 'Community',
    createdAt: new Date(),
  },
];

async function fetchFeaturedDeals(): Promise<FeaturedDeal[]> {
  try {
    const dealsRef = collection(db, 'rewards');
    const q = query(
      dealsRef,
      where('featured', '==', true),
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      limit(6)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No featured deals found, using mock data');
      return mockFeaturedDeals;
    }

    const deals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as FeaturedDeal[];

    return deals;
  } catch (error) {
    console.error('Error fetching featured deals:', error);
    // Return mock data on error
    return mockFeaturedDeals;
  }
}

export function useFeaturedDeals() {
  return useQuery({
    queryKey: ['featured-deals'],
    queryFn: fetchFeaturedDeals,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 1,
    placeholderData: mockFeaturedDeals, // Show mock data while loading
  });
}
