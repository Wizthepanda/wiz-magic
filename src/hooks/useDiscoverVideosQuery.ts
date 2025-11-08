import { useQuery } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface DiscoverVideo {
  id: string;
  title: string;
  thumbnailURL?: string;
  thumbnail?: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  creatorUsername?: string;
  category: string;
  subCategory?: string;
  publishedAt: any; // Firestore Timestamp
  visibility: 'public' | 'private' | 'unlisted';
  duration?: string;
  views?: number;
  likes?: number;
  trendingScore?: number;
  [key: string]: any;
}

interface DiscoverFilters {
  category?: string;
  subCategory?: string;
}

/**
 * Fetch public videos from /videos collection
 * NO drafts, NO private content, NO placeholders
 * Enriched with creator metadata from /creators collection
 */
async function fetchDiscoverVideos(filters: DiscoverFilters = {}): Promise<DiscoverVideo[]> {
  try {
    console.log('🎬 Fetching discover videos...', filters);
    
    const videosRef = collection(db, 'videos');
    
    // Build query constraints
    const constraints = [
      where('visibility', '==', 'public'),
    ];
    
    // Add category filter if provided
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    // Add subcategory filter if provided
    if (filters.subCategory) {
      constraints.push(where('subCategory', '==', filters.subCategory));
    }
    
    // Order by publishedAt DESC (most recent first)
    constraints.push(orderBy('publishedAt', 'desc'));
    
    // Limit to 24 videos
    constraints.push(limit(24));
    
    const videosQuery = query(videosRef, ...constraints);
    const snapshot = await getDocs(videosQuery);
    
    if (snapshot.empty) {
      console.log('📭 No discover videos found');
      return [];
    }
    
    // Deduplicate by document ID
    const videosMap = new Map<string, DiscoverVideo>();
    
    // First pass: collect all videos
    snapshot.docs.forEach(doc => {
      if (videosMap.has(doc.id)) {
        console.warn(`⚠️ Duplicate video found: ${doc.id}`);
        return;
      }
      
      const data = doc.data();
      
      const video: DiscoverVideo = {
        id: doc.id,
        title: data.title || 'Untitled Video',
        thumbnailURL: data.thumbnailURL || data.thumbnail,
        thumbnail: data.thumbnail || data.thumbnailURL,
        creatorId: data.creatorId || data.userId || data.creatorUID,
        category: data.category || 'Uncategorized',
        subCategory: data.subCategory,
        publishedAt: data.publishedAt,
        visibility: data.visibility || 'public',
        duration: data.duration,
        views: data.views || 0,
        likes: data.likes || 0,
        trendingScore: data.trendingScore || 0,
        ...data,
      };
      
      videosMap.set(doc.id, video);
    });
    
    const videos = Array.from(videosMap.values());
    
    // Second pass: enrich with creator data
    const enrichedVideos = await Promise.all(
      videos.map(async (video) => {
        try {
          // Try to get creator from /creators collection
          const creatorRef = doc(db, 'creators', video.creatorId);
          const creatorSnap = await getDoc(creatorRef);
          
          if (creatorSnap.exists()) {
            const creatorData = creatorSnap.data();
            return {
              ...video,
              creatorName: creatorData.displayName || creatorData.name || 'Creator',
              creatorAvatar: creatorData.profileImageURL || creatorData.photoURL,
              creatorUsername: creatorData.username,
            };
          }
          
          // Fallback: try /users collection if creator not found
          const userRef = doc(db, 'users', video.creatorId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            return {
              ...video,
              creatorName: userData.displayName || userData.name || 'Creator',
              creatorAvatar: userData.photoURL || userData.avatar,
              creatorUsername: userData.username,
            };
          }
          
          // No creator found, use defaults
          return {
            ...video,
            creatorName: 'Unknown Creator',
            creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creatorId}`,
          };
          
        } catch (error) {
          console.error(`Error fetching creator for video ${video.id}:`, error);
          return {
            ...video,
            creatorName: 'Unknown Creator',
            creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creatorId}`,
          };
        }
      })
    );
    
    console.log(`✅ Fetched ${enrichedVideos.length} unique discover videos`);
    
    return enrichedVideos;
    
  } catch (error) {
    console.error('❌ Error fetching discover videos:', error);
    return [];
  }
}

/**
 * React Query hook for discover videos
 * Includes real-time sync via Firestore listeners
 */
export function useDiscoverVideosQuery(filters: DiscoverFilters = {}) {
  const queryClient = useQueryClient();
  
  // Set up real-time listener
  useEffect(() => {
    console.log('🔄 Setting up real-time discover videos listener...', filters);
    
    const videosRef = collection(db, 'videos');
    
    const constraints = [
      where('visibility', '==', 'public'),
    ];
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.subCategory) {
      constraints.push(where('subCategory', '==', filters.subCategory));
    }
    
    constraints.push(orderBy('publishedAt', 'desc'));
    constraints.push(limit(24));
    
    const videosQuery = query(videosRef, ...constraints);
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      videosQuery,
      (snapshot) => {
        console.log('🔄 Real-time discover videos update received');
        
        // Invalidate and refetch
        queryClient.invalidateQueries({ 
          queryKey: ['discoverVideos', filters] 
        });
      },
      (error) => {
        console.error('❌ Error in discover videos listener:', error);
      }
    );
    
    // Cleanup on unmount
    return () => {
      console.log('🛑 Cleaning up discover videos listener');
      unsubscribe();
    };
  }, [queryClient, filters.category, filters.subCategory]);
  
  return useQuery({
    queryKey: ['discoverVideos', filters],
    queryFn: () => fetchDiscoverVideos(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Real-time listener handles updates
    refetchOnMount: true,
  });
}

/**
 * Force refresh discover videos
 */
export function useRefreshDiscoverVideos() {
  const queryClient = useQueryClient();
  
  return (filters?: DiscoverFilters) => {
    console.log('🔄 Force refreshing discover videos...', filters);
    queryClient.invalidateQueries({ 
      queryKey: filters ? ['discoverVideos', filters] : ['discoverVideos'] 
    });
  };
}

