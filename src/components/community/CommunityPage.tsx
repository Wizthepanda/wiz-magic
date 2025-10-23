import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CommunityHeader } from './CommunityHeader';
import { CommunityTabs } from './CommunityTabs';
import { CommunityFeed } from './CommunityFeed';
import { CoursesTab } from './CoursesTab';
import { LeaderboardTab } from './LeaderboardTab';
import { AboutTab } from './AboutTab';
import { RewardsTab } from './RewardsTab';
import { usePlaceholderData } from './Placeholders';
import { useCommunityData } from '@/hooks/useCommunityData';

type TabType = 'community' | 'courses' | 'leaderboard' | 'about' | 'rewards';

/**
 * Main Community Page Component (Phase 3 Complete)
 * Coordinates all sub-sections and manages tab state
 * Now includes Courses and Leaderboard tabs
 */
export const CommunityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('community');

  // Fetch real community data from Firestore
  const { community: firestoreCommunity, loading, error } = useCommunityData(id);

  // Load placeholder data for other sections (posts, courses, etc.)
  const placeholderData = usePlaceholderData();

  // Use Firestore data if available, otherwise fall back to placeholder data
  const community = firestoreCommunity || placeholderData.community;
  const posts = placeholderData.posts || [];
  const members = placeholderData.members || [];
  const courses = placeholderData.courses || [];
  const leaderboard = placeholderData.leaderboard || [];
  const creator = placeholderData.creator || {
    id: community?.creatorId || 'unknown',
    name: community?.creatorName || 'Community Creator',
    avatar: community?.creatorAvatar || community?.profileIconUrl || community?.icon || 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
    tagline: community?.category || 'Community Builder',
    bio: community?.description || 'Welcome to our community!',
    isFollowing: false,
  };
  const milestones = placeholderData.milestones || [];
  const communityStats = placeholderData.communityStats || {
    memberCount: community?.memberCount || 0,
    totalXP: 0,
    coursesLaunched: 0,
    postsCount: 0,
  };
  const rewardTiers = placeholderData.rewardTiers || [];
  const earnActions = placeholderData.earnActions || [];
  const userProgress = placeholderData.userProgress || {
    currentXP: 0,
    currentLevel: 1,
    nextLevelXP: 1000,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg text-muted-foreground">Community not found</p>
        <p className="text-sm text-gray-500">The community you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Responsive container that adapts to sidebar width */}
      <div
        className="w-full mx-auto px-4 md:px-6 py-6 transition-all duration-300"
        style={{
          maxWidth: 'calc(100vw - 320px - 4rem)', // Account for sidebar (280px) + padding
        }}
      >
        {/* Community Header */}
        <CommunityHeader community={community} />

        {/* Navigation Tabs */}
        <div className="sticky top-0 z-40 bg-transparent pt-4 pb-4">
          <CommunityTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {activeTab === 'community' && (
            <CommunityFeed
              posts={posts || []}
              communityId={id || ''}
              currentUserId="current-user"
              isCreatorOrMod={true}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesTab
              courses={courses || []}
              onEnroll={(courseId) => console.log('Enroll in course:', courseId)}
              onCourseClick={(courseId) => console.log('View course:', courseId)}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab
              leaderboard={leaderboard || []}
              currentUserId="current-user"
              onProfileClick={(userId) => console.log('View profile:', userId)}
            />
          )}

          {activeTab === 'about' && (
            <AboutTab
              creator={creator}
              milestones={milestones}
              stats={communityStats}
              onFollowCreator={(creatorId) => console.log('Follow creator:', creatorId)}
            />
          )}

          {activeTab === 'rewards' && (
            <RewardsTab
              currentXP={userProgress.currentXP}
              currentLevel={userProgress.currentLevel}
              nextLevelXP={userProgress.nextLevelXP}
              rewardTiers={rewardTiers}
              earnActions={earnActions}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPage;
