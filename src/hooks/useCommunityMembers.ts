import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MemberData {
  id: string;
  username: string;
  displayName?: string;
  profilePic?: string;
  photoURL?: string;
  avatar?: string;
  level?: number;
  xp?: number;
}

/**
 * Hook to fetch real member data from Firestore
 * @param communityId - The community ID
 * @param memberLimit - Maximum number of members to fetch (default: 12)
 */
export const useCommunityMembers = (communityId: string | undefined, memberLimit: number = 12) => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching members for community:', communityId);

        // Query the members subcollection for this community
        const membersRef = collection(db, 'communities', communityId, 'members');
        const membersQuery = query(membersRef, limit(memberLimit));
        const membersSnap = await getDocs(membersQuery);

        if (!membersSnap.empty) {
          const memberData = membersSnap.docs.map(doc => {
            const data = doc.data();
            // Normalize profile picture field (handle multiple field names)
            const profilePic = data.profilePic || data.photoURL || data.avatarUrl || data.avatar;
            return {
              id: doc.id,
              ...data,
              profilePic,
              avatar: profilePic, // Ensure avatar field is set for compatibility
            };
          }) as MemberData[];

          console.log('✅ Loaded', memberData.length, 'members');
          console.log('👤 Member avatars:', memberData.map(m => ({ name: m.displayName, pic: m.profilePic })));
          setMembers(memberData);
        } else {
          console.log('⚠️ No members found in subcollection');
          setMembers([]);
        }
      } catch (err) {
        console.error('❌ Error fetching members:', err);
        setError('Failed to load members');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [communityId, memberLimit]);

  return { members, loading, error };
};
