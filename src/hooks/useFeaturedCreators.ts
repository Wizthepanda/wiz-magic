import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FeaturedCreator {
  id: string;
  displayName: string;
  category: string;
  profileImageURL?: string;
  bannerImageURL?: string;
  subscribersCount?: number;
  videosCount?: number;
  bio?: string;
  username?: string;
  isFeatured?: boolean;
}

// Placeholder creators with friendly names and actual images from public folder
const PLACEHOLDER_CREATORS: FeaturedCreator[] = [
  {
    id: 'placeholder-1',
    displayName: 'Amara Bloom',
    category: 'Wellness & Balance',
    subscribersCount: 4200,
    profileImageURL: '/Amara Wellness Coach.png',
    bannerImageURL: '/Amara Wellness Coach.png',
  },
  {
    id: 'placeholder-5',
    displayName: 'Naya Orion',
    category: 'Dating & Social Skills',
    subscribersCount: 2200,
    profileImageURL: '/Naya Orion Dating.png',
    bannerImageURL: '/Naya Orion Dating.png',
  },
  {
    id: 'placeholder-6',
    displayName: 'Dan Crypto King',
    category: 'Crypto & Finance',
    subscribersCount: 5100,
    profileImageURL: '/Dan Crypto King.png',
    bannerImageURL: '/Dan Crypto King.png',
  },
  {
    id: 'placeholder-7',
    displayName: 'Brandon Leaf',
    category: 'E-commerce & Business',
    subscribersCount: 4800,
    profileImageURL: '/Brandon Leaf Ecommerce.jpg',
    bannerImageURL: '/Brandon Leaf Ecommerce.jpg',
  },
  {
    id: 'placeholder-4',
    displayName: 'Milo Edge',
    category: 'Fitness',
    subscribersCount: 3500,
    profileImageURL: '/Milo Edge Fitness.jpg',
    bannerImageURL: '/Milo Edge Fitness.jpg',
  },
  {
    id: 'placeholder-3',
    displayName: 'Lina Sol',
    category: 'Design & Art',
    subscribersCount: 2800,
    profileImageURL: '/Lina Sol Art .jpg',
    bannerImageURL: '/Lina Sol Art .jpg',
  },
  {
    id: 'placeholder-2',
    displayName: 'Kai Rivers',
    category: 'Music & Sound',
    subscribersCount: 3100,
    profileImageURL: '/Kai Rivers Music.png',
    bannerImageURL: '/Kai Rivers Music.png',
  },
];

/**
 * Fetch featured creators from Firestore
 * Filters by isFeatured === true
 * Returns real creators, or falls back to placeholders if < 5 exist
 */
async function fetchFeaturedCreators(): Promise<FeaturedCreator[]> {
  try {
    console.log('🎨 Fetching featured creators from Firestore...');
    
    const creatorsRef = collection(db, 'creators');
    
    // Query: Featured creators only, ordered by creation date
    const creatorsQuery = query(
      creatorsRef,
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const snapshot = await getDocs(creatorsQuery);
    
    if (snapshot.empty) {
      console.log('📭 No featured creators found, using placeholders');
      return PLACEHOLDER_CREATORS;
    }
    
    // Map Firestore docs to Creator objects
    const creators: FeaturedCreator[] = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        displayName: data.displayName || data.name || 'Creator',
        category: data.category || data.primaryCategory || 'Creator',
        profileImageURL: data.profileImageURL || data.photoURL || data.avatar,
        bannerImageURL: data.bannerImageURL || data.bannerImage || data.coverImage,
        subscribersCount: data.subscribersCount || data.subscriberCount || 0,
        videosCount: data.videosCount || data.videoCount || 0,
        bio: data.bio || data.description || '',
        username: data.username || '',
        isFeatured: data.isFeatured,
      };
    });
    
    // Remove duplicates by ID
    const uniqueCreators = creators.filter(
      (v, i, a) => a.findIndex(t => t.id === v.id) === i
    );
    
    console.log(`✅ Fetched ${uniqueCreators.length} featured creators`);
    
    // If we have fewer than 5 real creators, supplement with placeholders
    if (uniqueCreators.length < 5) {
      const needed = 5 - uniqueCreators.length;
      const supplemental = PLACEHOLDER_CREATORS.slice(0, needed);
      console.log(`📦 Adding ${needed} placeholder creators`);
      return [...uniqueCreators, ...supplemental];
    }
    
    return uniqueCreators;
    
  } catch (error) {
    console.error('❌ Error fetching featured creators:', error);
    console.log('📦 Falling back to placeholder creators');
    return PLACEHOLDER_CREATORS;
  }
}

/**
 * React Query hook for fetching featured creators
 */
export function useFeaturedCreators() {
  return useQuery({
    queryKey: ['featuredCreators'],
    queryFn: fetchFeaturedCreators,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
