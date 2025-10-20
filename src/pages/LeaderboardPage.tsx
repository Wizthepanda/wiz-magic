import { motion } from 'framer-motion';
import { WizLeaderboardPage } from '@/components/wiz/wiz-leaderboard-page';

/**
 * LeaderboardPage - Top creators and earners
 *
 * Shows global leaderboards for XP, earnings, and community engagement
 * Accessible via: /leaderboard
 */
const LeaderboardPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <WizLeaderboardPage />
    </motion.div>
  );
};

export default LeaderboardPage;
