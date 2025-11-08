import { useQuery } from '@tanstack/react-query';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedVideo {
  id: string;
  videoId?: string;
  title?: string;
  thumbnail?: string;
  userId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  category?: string;
  subcategory?: string;
  views?: number;
  status?: string;
  publishedAt?: any;
  createdAt?: any;
  [key: string]: any;
}

async function fetchFeaturedVideos(): Promise<FeaturedVideo[]> {
  try {
    const videosRef = collection(db, 'videos');
    const q = query(
      videosRef,
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No featured videos found');
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as FeaturedVideo[];
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    return [];
  }
}

export function useFeaturedVideos() {
  return useQuery({
    queryKey: ['featuredVideos'],
    queryFn: fetchFeaturedVideos,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
}

