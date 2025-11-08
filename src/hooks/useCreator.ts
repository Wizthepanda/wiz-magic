/**
 * useCreator Hook - Fetches creator profile data with YouTube sync
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface CreatorProfile {
  id: string;
  displayName: string;
  username: string;
  photoURL: string;
  bannerURL?: string;
  bio?: string;
  youtubeConnected: boolean;
  youtubeChannelId?: string;
  verified: boolean;
  subscriberCount?: number;
  videoCount?: number;
  featuredCommunities?: string[];
  socialLinks?: {
    youtube?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface YouTubeChannelData {
  banner?: string;
  title?: string;
  description?: string;
  subscriberCount?: number;
  videoCount?: number;
}

export const useCreator = (creatorId: string | undefined) => {
  return useQuery({
    queryKey: ['creator', creatorId],
    queryFn: async (): Promise<CreatorProfile> => {
      if (!creatorId) throw new Error('Creator ID is required');

      console.log('📊 Fetching creator profile:', creatorId);

      // Fetch base creator document
      const creatorRef = doc(db, 'creators', creatorId);
      const creatorSnap = await getDoc(creatorRef);

      if (!creatorSnap.exists()) {
        // Fallback: try users collection
        const userRef = doc(db, 'users', creatorId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          throw new Error('Creator not found');
        }

        const userData = userSnap.data();
        return {
          id: creatorId,
          displayName: userData.displayName || 'Unknown Creator',
          username: userData.username || creatorId,
          photoURL: userData.photoURL || '/api/placeholder/200/200',
          bannerURL: userData.bannerURL,
          bio: userData.bio || '',
          youtubeConnected: false,
          verified: userData.verified || false,
        };
      }

      const creatorData = creatorSnap.data();
      let profile: CreatorProfile = {
        id: creatorId,
        displayName: creatorData.displayName || 'Unknown Creator',
        username: creatorData.username || creatorId,
        photoURL: creatorData.photoURL || '/api/placeholder/200/200',
        bannerURL: creatorData.bannerURL,
        bio: creatorData.bio || '',
        youtubeConnected: creatorData.youtubeConnected || false,
        youtubeChannelId: creatorData.youtubeChannelId,
        verified: creatorData.verified || false,
        subscriberCount: creatorData.subscriberCount,
        videoCount: creatorData.videoCount,
        featuredCommunities: creatorData.featuredCommunities || [],
        socialLinks: creatorData.socialLinks,
      };

      // If YouTube connected, fetch additional data
      if (creatorData.youtubeConnected && creatorData.youtubeChannelId) {
        try {
          console.log('🎬 Fetching YouTube channel data for:', creatorData.youtubeChannelId);
          const fetchYouTubeChannel = httpsCallable(functions, 'fetchCreatorYouTubeData');
          const result = await fetchYouTubeChannel({ channelId: creatorData.youtubeChannelId });
          const ytData = result.data as YouTubeChannelData;

          // Merge YouTube data (YouTube data takes precedence for these fields)
          profile = {
            ...profile,
            bannerURL: ytData.banner || profile.bannerURL,
            displayName: ytData.title || profile.displayName,
            bio: ytData.description || profile.bio,
            subscriberCount: ytData.subscriberCount || profile.subscriberCount,
            videoCount: ytData.videoCount || profile.videoCount,
          };
        } catch (error) {
          console.error('Failed to fetch YouTube data:', error);
          // Continue with Firestore data only
        }
      }

      return profile;
    },
    enabled: !!creatorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
