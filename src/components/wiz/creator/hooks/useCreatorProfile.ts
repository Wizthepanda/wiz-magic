import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CreatorProfile {
  // Basic Profile
  wizName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    discord?: string;
  };
  
  // YouTube Integration
  youtubeData?: {
    channelId: string;
    handle: string;
    customUrl?: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    bannerUrl?: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    publishedAt: string;
    lastSyncedAt: string;
    isConnected: boolean;
  };
  
  // Platform Stats
  joinedAt: string;
  streakDays?: number;
  lastActiveAt: string;
  
  // Settings
  profileVisibility: 'public' | 'private';
  allowMessages: boolean;
  showEarnings: boolean;
  
  // Content Preferences
  categories: string[];
  targetAudience: string[];
  
  loading?: boolean;
}

export interface UpdateCreatorProfileData {
  wizName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: CreatorProfile['socialLinks'];
  profileVisibility?: 'public' | 'private';
  allowMessages?: boolean;
  showEarnings?: boolean;
  categories?: string[];
  targetAudience?: string[];
}

export const useCreatorProfile = (userId: string) => {
  const [data, setData] = useState<CreatorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const profileDoc = await getDoc(doc(db, 'creatorProfiles', userId));
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data() as CreatorProfile;
        setData({
          ...profileData,
          loading: false
        });
        console.log('📋 Creator profile loaded:', profileData);
      } else {
        // Create default profile for new creators
        const defaultProfile: CreatorProfile = {
          wizName: '',
          bio: '',
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          profileVisibility: 'public',
          allowMessages: true,
          showEarnings: false,
          categories: [],
          targetAudience: [],
          loading: false
        };
        
        await setDoc(doc(db, 'creatorProfiles', userId), defaultProfile);
        setData(defaultProfile);
        console.log('📋 Created default creator profile');
      }
    } catch (err) {
      console.error('❌ Error fetching creator profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: UpdateCreatorProfileData) => {
    if (!userId || !data) return;

    try {
      const updatedData = {
        ...updates,
        lastActiveAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'creatorProfiles', userId), updatedData);
      
      setData(prev => prev ? { ...prev, ...updatedData } : null);
      console.log('📋 Creator profile updated:', updatedData);
    } catch (err) {
      console.error('❌ Error updating creator profile:', err);
      throw err;
    }
  };

  const syncYouTubeData = async (youtubeData: CreatorProfile['youtubeData']) => {
    if (!userId) return;

    try {
      const updatedData = {
        youtubeData: {
          ...youtubeData,
          lastSyncedAt: new Date().toISOString(),
          isConnected: true
        },
        lastActiveAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'creatorProfiles', userId), updatedData);
      
      setData(prev => prev ? { ...prev, ...updatedData } : null);
      console.log('🔄 YouTube data synced:', youtubeData);
    } catch (err) {
      console.error('❌ Error syncing YouTube data:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    data,
    isLoading,
    error,
    updateProfile,
    syncYouTubeData,
    refetch: fetchProfile
  };
};