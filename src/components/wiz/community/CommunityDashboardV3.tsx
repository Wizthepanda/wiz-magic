import { useAuth } from '@/hooks/useAuth';
import { useCommunity } from '@/hooks/useCommunity';
import { useJoinedCommunities } from '@/hooks/useJoinedCommunities';
import { Loader2 } from 'lucide-react';
import { HeroBannerV3 } from './HeroBannerV3';
import { CommunityTabsV2 } from './CommunityTabsV2';
import { EnhancedCreatorSidebarV3 } from './EnhancedCreatorSidebarV3';
import { CommunityFeedV3 } from './CommunityFeedV3';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  communityId: string;
}

export const CommunityDashboardV3 = ({ communityId }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: community, isLoading } = useCommunity(communityId);
  const { data: joinedCommunities = [], isLoading: isLoadingJoined } = useJoinedCommunities();

  // Check if user is a member
  const isMember = joinedCommunities.some(c => c.id === communityId);

  // Check if user is the creator
  const isCreator = user?.uid === community?.creatorId;

  if (isLoading || isLoadingJoined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-xl">
            <svg
              className="w-10 h-10 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
            Access Restricted
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            You must join this community to view its content and participate in discussions.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/?section=community')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            Browse Communities
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <p className="text-slate-600 text-lg">Community not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden w-full">
      {/* Decorative Background Orbs - Use absolute to respect parent container */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/3 to-purple-400/3 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Responsive Container - Adjusts with sidebar */}
      <div className="relative w-full mx-auto px-4 md:px-6 py-8 transition-all duration-300 ease-in-out" style={{ maxWidth: 'min(1280px, 100vw - 2rem)' }}>
        {/* Hero Banner V3 (no creator card) */}
        <HeroBannerV3
          community={community}
          isJoined={true}
        />

        {/* Main Content Grid - Responsive flex layout */}
        <div className="mt-8 flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          {/* Main Content Column */}
          <main className="flex-1 min-w-0 space-y-6">
            <CommunityTabsV2
              community={community}
              feedComponent={
                <CommunityFeedV3
                  communityId={communityId}
                  isCreator={isCreator}
                />
              }
            />
          </main>

          {/* Enhanced Right Sidebar V3 - Fixed width on desktop */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 hidden lg:block">
            <EnhancedCreatorSidebarV3
              community={community}
              isJoined={true}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};
