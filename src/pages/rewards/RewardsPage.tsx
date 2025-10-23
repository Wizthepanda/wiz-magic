import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XPProgressHeader } from '@/components/rewards/XPProgressHeader';
import { RewardTierCard } from '@/components/rewards/RewardTierCard';
import { DailyQuests } from '@/components/rewards/DailyQuests';
import { AchievementsShowcase } from '@/components/rewards/AchievementsBadge';
import {
  placeholderUserProgress,
  placeholderRewardTiers,
  placeholderQuests,
  placeholderAchievements,
} from '@/components/community/Placeholders';
import { toast } from 'sonner';

/**
 * RewardsPage Component (Phase 7)
 * Immersive rewards page with gamification elements
 */
export const RewardsPage: React.FC = () => {
  const [userProgress, setUserProgress] = useState(placeholderUserProgress);
  const [quests, setQuests] = useState(placeholderQuests);
  const [achievements, setAchievements] = useState(placeholderAchievements);
  const [tiers, setTiers] = useState(placeholderRewardTiers);

  const handleClaimReward = (tierId: string) => {
    setTiers((prev) =>
      prev.map((tier) =>
        tier.id === tierId ? { ...tier, isClaimed: true } : tier
      )
    );

    // Add XP for claiming
    setUserProgress((prev) => ({
      ...prev,
      currentXP: prev.currentXP + 100,
    }));

    toast.success('🎉 Reward claimed! +100 XP', {
      description: 'Keep up the great work!',
    });
  };

  const handleQuestClick = (questId: string) => {
    setQuests((prev) =>
      prev.map((quest) =>
        quest.id === questId ? { ...quest, completed: true } : quest
      )
    );

    const quest = quests.find((q) => q.id === questId);
    if (quest && !quest.completed) {
      setUserProgress((prev) => ({
        ...prev,
        currentXP: prev.currentXP + quest.xpReward,
      }));

      toast.success(`✅ Quest completed! +${quest.xpReward} XP`, {
        description: quest.title,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-300 rounded-full blur-3xl"
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <XPProgressHeader
            currentLevel={userProgress.currentLevel}
            currentXP={userProgress.currentXP}
            nextLevelXP={userProgress.nextLevelXP}
          />
        </motion.div>

        {/* Reward Tiers Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            Reward Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <RewardTierCard
                  {...tier}
                  currentXP={userProgress.currentXP}
                  onClaim={handleClaimReward}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Daily Quests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <DailyQuests quests={quests} onQuestClick={handleQuestClick} />
        </motion.section>

        {/* Achievements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <AchievementsShowcase achievements={achievements} />
        </motion.section>

        {/* Footer Motivational Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center py-8"
        >
          <p className="text-lg text-gray-600 font-medium">
            💜 Keep watching, keep earning, keep growing!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Every moment counts towards your next reward
          </p>
        </motion.div>
      </div>
    </div>
  );
};
