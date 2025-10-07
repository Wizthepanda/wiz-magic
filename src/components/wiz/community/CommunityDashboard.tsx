import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCommunity } from '@/hooks/useCommunity';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { HeroBanner } from './HeroBanner';
import { CommunityTabs } from './CommunityTabs';
import { AccessCardSidebar } from './AccessCardSidebar';
import { useNavigate } from 'react-router-dom';

interface Props {
  communityId: string;
}

export const CommunityDashboard = ({ communityId }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: community, isLoading } = useCommunity(communityId);
  const [isMember, setIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || !communityId) return;
    const check = async () => {
      // Check both members subcollection AND members array in main document
      const memberRef = doc(db, 'communities', communityId, 'members', user.uid);
      const memberSnap = await getDoc(memberRef);
      
      if (memberSnap.exists()) {
        console.log('✅ User found in members subcollection');
        setIsMember(true);
        return;
      }

      // Also check members array in community document
      const communityRef = doc(db, 'communities', communityId);
      const communitySnap = await getDoc(communityRef);
      
      if (communitySnap.exists()) {
        const members = communitySnap.data().members || [];
        const isMemberInArray = members.includes(user.uid);
        console.log(`📊 Checking members array: ${isMemberInArray ? 'FOUND' : 'NOT FOUND'}`);
        setIsMember(isMemberInArray);
      } else {
        setIsMember(false);
      }
    };
    check();
  }, [user, communityId]);

  if (isLoading || isMember === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-[linear-gradient(180deg,#ffffff,#f7f9fc)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-[linear-gradient(180deg,#ffffff,#f7f9fc)] px-6">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Access Restricted</h2>
          <p className="text-slate-600 mb-6">
            You must join this community to view its content and dashboard.
          </p>
          <button
            onClick={() => navigate('/?section=community')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold hover:shadow-md transition-all"
          >
            Browse Communities
          </button>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center h-screen bg-[linear-gradient(180deg,#ffffff,#f7f9fc)]">
        <p className="text-slate-600">Community not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#EEF2FF] relative overflow-hidden">
      {/* Subtle radial gradient background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 md:px-6 py-8 max-w-7xl">
        <HeroBanner 
          community={community} 
          isJoined={true}
        />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8">
          <main className="space-y-6">
            <CommunityTabs community={community} />
          </main>

          <aside className="lg:sticky lg:top-24 h-fit">
            <AccessCardSidebar community={community} isJoined={true} />
          </aside>
        </div>
      </div>
    </div>
  );
};
