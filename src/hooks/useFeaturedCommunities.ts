import { useQuery } from '@tanstack/react-query';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedCommunity {
  id: string;
  name?: string;
  banner?: string;
  category?: string;
  memberCount?: number;
  description?: string;
  isActive?: boolean;
  [key: string]: any;
}

async function fetchFeaturedCommunities(): Promise<FeaturedCommunity[]> {
  try {
    const communitiesRef = collection(db, 'communities');
    const q = query(
      communitiesRef,
      orderBy('memberCount', 'desc'),
      limit(3)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No featured communities found');
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.title || data.name,
        banner: data.coverMedia?.[0]?.url || data.coverMedia?.[0]?.thumbnail || data.banner,
        category: data.category,
        memberCount: data.memberCount || 0,
        description: data.shortDescription || data.description,
        isActive: data.isActive,
        ...data,
      };
    }) as FeaturedCommunity[];
  } catch (error) {
    console.error('Error fetching featured communities:', error);
    return [];
  }
}

export function useFeaturedCommunities() {
  return useQuery({
    queryKey: ['featuredCommunities'],
    queryFn: fetchFeaturedCommunities,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}

