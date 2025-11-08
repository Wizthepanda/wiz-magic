import { useQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface Creator {
  id: string;
  uid?: string;
  displayName: string;
  profileImageURL?: string;
  bannerImageURL?: string;
  category?: string;
  subscribersCount: number;
  videosCount: number;
  bio?: string;
  username?: string;
  isVerified?: boolean;
  recentlyActive?: any; // Firestore Timestamp
  createdAt?: any;
  [key: string]: any;
}

/**
 * Deduplicate creators by unique identifier
 * Uses doc.id as primary key, username as fallback
 */
function dedupeCreators(creators: Creator[]): Creator[] {
  const map = new Map<string, Creator>();
  
  creators.forEach(creator => {
    // Use doc.id as primary key (most reliable)
    const key = creator.id || creator.username || creator.uid;
    
    // Only add if not already in map
    if (key && !map.has(key)) {
      // Skip creators missing required fields
      if (creator.displayName && creator.profileImageURL) {
        map.set(key, creator);
      } else {
        console.warn(`⚠️ Skipping creator ${key} - missing required fields`, {
          hasDisplayName: !!creator.displayName,
          hasProfileImage: !!creator.profileImageURL
        });
      }
    }
  });
  
  return Array.from(map.values());
}

/**
 * Fetch creators from /creators collection ONLY
 * NO fallback to /users collection
 * Deduplicates by Firestore document ID
 * Orders by subscribersCount DESC
 */
async function fetchCreators(): Promise<Creator[]> {
  try {
    console.log('🎨 Fetching creators from /creators collection...');
    
    const creatorsRef = collection(db, 'creators');
    
    // Query: Order by subscribers DESC, limit to 12
    const creatorsQuery = query(
      creatorsRef,
      orderBy('subscribersCount', 'desc'),
      limit(12)
    );
    
    const snapshot = await getDocs(creatorsQuery);
    
    if (snapshot.empty) {
      console.log('📭 No creators found in /creators collection');
      return [];
    }
    
    // Map Firestore docs to Creator objects
    const creators: Creator[] = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        uid: data.uid || doc.id,
        displayName: data.displayName || data.name || 'Creator',
        profileImageURL: data.profileImageURL || data.photoURL || data.avatar || '',
        bannerImageURL: data.bannerImageURL || data.bannerImage || data.coverImage || '',
        category: data.category || data.primaryCategory || 'Creator',
        subscribersCount: data.subscribersCount || data.subscriberCount || 0,
        videosCount: data.videosCount || data.videoCount || 0,
        bio: data.bio || data.description || '',
        username: data.username || '',
        isVerified: data.isVerified || false,
        recentlyActive: data.recentlyActive,
        createdAt: data.createdAt,
        ...data,
      };
    });
    
    // Apply deduplication
    const dedupedCreators = dedupeCreators(creators);
    
    console.log(`✅ Fetched ${snapshot.docs.length} creators, ${dedupedCreators.length} unique after deduplication`);
    
    // Already sorted by subscribersCount DESC from Firestore query
    return dedupedCreators;
    
  } catch (error) {
    console.error('❌ Error fetching creators:', error);
    return [];
  }
}

/**
 * React Query hook for fetching creators
 * Includes real-time sync via Firestore listeners
 */
export function useCreatorsQuery() {
  const queryClient = useQueryClient();
  
  // Set up real-time listener
  useEffect(() => {
    console.log('🔄 Setting up real-time creators listener...');
    
    const creatorsRef = collection(db, 'creators');
    
    // Listen to creators collection
    const creatorsQuery = query(
      creatorsRef,
      orderBy('subscribersCount', 'desc'),
      limit(12)
    );
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      creatorsQuery,
      (snapshot) => {
        console.log('🔄 Real-time creators update received');
        
        // Map and dedupe the snapshot data
        const creators: Creator[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid || doc.id,
            displayName: data.displayName || data.name || 'Creator',
            profileImageURL: data.profileImageURL || data.photoURL || data.avatar || '',
            bannerImageURL: data.bannerImageURL || data.bannerImage || data.coverImage || '',
            category: data.category || data.primaryCategory || 'Creator',
            subscribersCount: data.subscribersCount || data.subscriberCount || 0,
            videosCount: data.videosCount || data.videoCount || 0,
            bio: data.bio || data.description || '',
            username: data.username || '',
            isVerified: data.isVerified || false,
            recentlyActive: data.recentlyActive,
            createdAt: data.createdAt,
            ...data,
          };
        });
        
        // Apply deduplication
        const dedupedCreators = dedupeCreators(creators);
        
        console.log(`🔄 Real-time update: ${snapshot.docs.length} creators, ${dedupedCreators.length} unique`);
        
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['creators'] });
      },
      (error) => {
        console.error('❌ Error in creators listener:', error);
      }
    );
    
    // Cleanup on unmount
    return () => {
      console.log('🛑 Cleaning up creators listener');
      unsubscribe();
    };
  }, [queryClient]);
  
  return useQuery({
    queryKey: ['creators'],
    queryFn: fetchCreators,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false, // Real-time listener handles updates
    refetchOnMount: true,
  });
}

/**
 * Force refresh creators data
 */
export function useRefreshCreators() {
  const queryClient = useQueryClient();
  
  return () => {
    console.log('🔄 Force refreshing creators...');
    queryClient.invalidateQueries({ queryKey: ['creators'] });
  };
}

