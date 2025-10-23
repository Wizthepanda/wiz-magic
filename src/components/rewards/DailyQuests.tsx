import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Quest {
  id: string;
  title: string;
  icon: string;
  xpReward: number;
  progress: number;
  total: number;
  completed: boolean;
}

interface DailyQuestsProps {
  quests: Quest[];
  onQuestClick?: (questId: string) => void;
}

/**
 * DailyQuests Component (Phase 7)
 * Game-like daily missions with progress tracking
 */
export const DailyQuests: React.FC<DailyQuestsProps> = ({ quests, onQuestClick }) => {
  const completedCount = quests.filter((q) => q.completed).length;
  const totalXPAvailable = quests.reduce((sum, q) => sum + q.xpReward, 0);
  const earnedXP = quests.filter((q) => q.completed).reduce((sum, q) => sum + q.xpReward, 0);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">📋</span>
            How to Earn XP
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete these actions to boost your XP and climb the leaderboard
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Progress</div>
          <div className="text-2xl font-bold text-purple-600">
            {completedCount} / {quests.length}
          </div>
        </div>
      </div>

      {/* Total XP Bar */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            Pro Tips for Maximum XP
          </span>
          <span className="text-lg font-bold text-purple-600">
            {earnedXP} / {totalXPAvailable} XP
          </span>
        </div>
        <Progress value={(earnedXP / totalXPAvailable) * 100} className="h-2" />
      </div>

      {/* Quests List */}
      <div className="space-y-3">
        {quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            onClick={() => onQuestClick?.(quest.id)}
            className={cn(
              'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
              quest.completed
                ? 'bg-green-50 border-green-300 shadow-green-100'
                : 'bg-white/60 border-white/40 hover:border-purple-300 hover:shadow-lg'
            )}
          >
            {/* Completion Icon */}
            <div className="flex-shrink-0">
              {quest.completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
              ) : (
                <Circle className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* Quest Icon */}
            <div className="text-3xl">{quest.icon}</div>

            {/* Quest Details */}
            <div className="flex-1 min-w-0">
              <h3 className={cn('font-semibold text-gray-900 mb-1', quest.completed && 'line-through text-gray-600')}>
                {quest.title}
              </h3>
              {!quest.completed && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {quest.progress} / {quest.total}
                    </span>
                  </div>
                </div>
              )}
              {quest.completed && (
                <span className="text-xs text-green-600 font-medium">✓ Completed</span>
              )}
            </div>

            {/* XP Reward */}
            <div className={cn(
              'flex-shrink-0 px-4 py-2 rounded-lg font-bold text-sm',
              quest.completed
                ? 'bg-green-200 text-green-700'
                : 'bg-amber-100 text-amber-700'
            )}>
              +{quest.xpReward} XP
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Message */}
      {completedCount === quests.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-bold text-green-700">All quests completed!</p>
          <p className="text-sm text-green-600 mt-1">Check back tomorrow for new missions</p>
        </motion.div>
      )}
    </div>
  );
};
