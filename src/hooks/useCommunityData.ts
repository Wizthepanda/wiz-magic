import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CommunityData {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  bannerUrl?: string;
  profileIconUrl?: string;
  profileIcon?: string; // New field for uploaded profile icons
  icon?: string;
  coverMedia?: Array<{ url: string; thumbnail?: string; type?: string }>;
  modules?: any[];
  memberCount?: number;
  creatorId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const useCommunityData = (communityId: string | undefined) => {
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    const fetchCommunity = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching community data for:', communityId);

        // Try to fetch from 'communities' collection
        const communityRef = doc(db, 'communities', communityId);
        const communitySnap = await getDoc(communityRef);

        if (communitySnap.exists()) {
          const data = { id: communitySnap.id, ...communitySnap.data() } as CommunityData;
          console.log('✅ Community data loaded:', data.name);
          setCommunity(data);
        } else {
          console.log('❌ Community not found in Firestore:', communityId);
          setError('Community not found');
          setCommunity(null);
        }
      } catch (err) {
        console.error('❌ Error fetching community:', err);
        setError('Failed to load community');
        setCommunity(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  return { community, loading, error };
};
