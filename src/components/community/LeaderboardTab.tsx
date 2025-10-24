import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LeaderboardCard } from './LeaderboardCard';
import { ProfileModal } from './ProfileModal';
import type { LeaderboardEntry } from './Placeholders';

interface LeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  onProfileClick?: (userId: string) => void;
}

type TimeFilter = 'all-time' | 'monthly' | 'weekly';

/**
 * LeaderboardTab Component (Phase 9 Enhanced)
 * - Displays community leaderboard ranked by ZAPs
 * - Top 3 podium design with crown glows
 * - Time-based filtering (All-Time, Monthly, Weekly)
 * - Profile modal for member details
 * - Live ZAPs updates simulation
 */
export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  leaderboard: initialLeaderboard,
  currentUserId,
  onProfileClick,
}) => {
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simulate live ZAPs updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      setLeaderboard((prev) =>
        prev.map((entry) => ({
          ...entry,
          xp: entry.xp + Math.floor(Math.random() * 50),
        }))
      );
      setTimeout(() => setIsUpdating(false), 1000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Handle profile click
  const handleProfileClick = (userId: string) => {
    const member = leaderboard.find((entry) => entry.userId === userId);
    if (member) {
      setSelectedMember(member);
      setIsModalOpen(true);
    }
    onProfileClick?.(userId);
  };

  // Filter and sort leaderboard by ZAPs
  const filteredLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp);

  const topThree = filteredLeaderboard.slice(0, 3);
  const rest = filteredLeaderboard.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            🏆 Top Wizards of the Community
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Ranked by total ZAPs⚡ earned through posts, replies, and engagement
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeFilter('all-time')}
            className={cn(
              'rounded-xl',
              timeFilter === 'all-time' && 'bg-purple-100 text-purple-700 border-purple-300'
            )}
          >
            <Trophy className="w-4 h-4 mr-2" />
            All-Time
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeFilter('monthly')}
            className={cn(
              'rounded-xl',
              timeFilter === 'monthly' && 'bg-purple-100 text-purple-700 border-purple-300'
            )}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Monthly
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeFilter('weekly')}
            className={cn(
              'rounded-xl',
              timeFilter === 'weekly' && 'bg-purple-100 text-purple-700 border-purple-300'
            )}
          >
            <Clock className="w-4 h-4 mr-2" />
            Weekly
          </Button>
        </div>
      </div>

      {/* Live Update Indicator */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl border border-purple-200"
          >
            <TrendingUp className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-sm font-medium text-purple-700">
              Leaderboard updating...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            Top 3 Champions
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {topThree.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LeaderboardCard
                  {...entry}
                  rank={index + 1}
                  isCurrentUser={entry.userId === currentUserId}
                  onProfileClick={handleProfileClick}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Rest of Leaderboard */}
      {rest.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <span className="text-xl">📊</span>
            Rankings
          </h3>

          <div className="space-y-3">
            {rest.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 3) * 0.05 }}
              >
                <LeaderboardCard
                  {...entry}
                  rank={index + 4}
                  isCurrentUser={entry.userId === currentUserId}
                  onProfileClick={handleProfileClick}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredLeaderboard.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20"
        >
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No rankings yet
          </p>
          <p className="text-gray-600">
            Be the first to earn ZAPs⚡ and claim the top spot!
          </p>
        </motion.div>
      )}

      {/* Load More / Show Top 50 */}
      {rest.length > 10 && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            className="bg-white/60 backdrop-blur-xl border-purple-300 text-purple-700 hover:bg-purple-50 rounded-xl"
          >
            Show Top 50
          </Button>
        </div>
      )}

      {/* How to Earn ZAPs Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200"
      >
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          How to Earn ZAPs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">📝 Create Posts:</span>
            <span className="text-gray-600 ml-2">+50⚡ ZAPs</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">💬 Comment:</span>
            <span className="text-gray-600 ml-2">+10⚡ ZAPs</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">📚 Complete Courses:</span>
            <span className="text-gray-600 ml-2">+500⚡ ZAPs</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">⬆️ Receive Upvotes:</span>
            <span className="text-gray-600 ml-2">+5⚡ ZAPs</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">🎯 Daily Login:</span>
            <span className="text-gray-600 ml-2">+25⚡ ZAPs</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">🏆 Win Challenges:</span>
            <span className="text-gray-600 ml-2">+1000⚡ ZAPs</span>
          </div>
        </div>
      </motion.div>

      {/* Profile Modal */}
      {selectedMember && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={{
            userId: selectedMember.userId,
            name: selectedMember.name,
            avatar: selectedMember.avatar,
            bio: selectedMember.bio,
            xp: selectedMember.xp,
            level: selectedMember.level,
            rank: selectedMember.rank,
            badges: selectedMember.badges,
            postCount: selectedMember.postCount,
            commentCount: selectedMember.commentCount,
            joinedDate: selectedMember.joinedDate,
          }}
        />
      )}
    </motion.div>
  );
};
