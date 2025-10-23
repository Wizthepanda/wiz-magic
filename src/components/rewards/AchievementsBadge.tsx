import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementsBadgeProps {
  achievement: Achievement;
}

/**
 * AchievementsBadge Component (Phase 7)
 * Individual achievement badge with sparkle effects and tooltips
 */
export const AchievementsBadge: React.FC<AchievementsBadgeProps> = ({ achievement }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-orange-600',
  };

  const rarityGlow = {
    common: 'shadow-gray-500/30',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-amber-500/70',
  };

  const gradient = rarityColors[achievement.rarity || 'common'];
  const glow = rarityGlow[achievement.rarity || 'common'];

  return (
    <div className="relative">
      <motion.div
        whileHover={{ scale: 1.1, y: -4 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        className={cn(
          'w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300',
          achievement.unlocked
            ? `bg-gradient-to-br ${gradient} shadow-lg ${glow}`
            : 'bg-gray-200 shadow-sm'
        )}
      >
        {achievement.unlocked ? (
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            {achievement.icon}
          </motion.div>
        ) : (
          <Lock className="w-8 h-8 text-gray-400" />
        )}

        {/* Sparkle Effect for Unlocked */}
        {achievement.unlocked && (
          <>
            <motion.div
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="absolute top-0 right-0 text-xl"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                delay: 1,
              }}
              className="absolute bottom-0 left-0 text-xl"
            >
              ⭐
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64"
          >
            <div className="bg-gray-900 text-white rounded-xl p-4 shadow-2xl border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.unlocked ? achievement.icon : '🔒'}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-gray-300">{achievement.description}</p>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!achievement.unlocked && (
                    <p className="text-xs text-gray-400 mt-2 italic">Locked</p>
                  )}
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="border-8 border-transparent border-t-gray-900" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AchievementsShowcaseProps {
  achievements: Achievement[];
}

/**
 * AchievementsShowcase Component (Phase 7)
 * Grid display of all achievements
 */
export const AchievementsShowcase: React.FC<AchievementsShowcaseProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">🏆</span>
            Achievements
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Unlock badges by completing milestones
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Unlocked</div>
          <div className="text-2xl font-bold text-purple-600">
            {unlockedCount} / {achievements.length}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <AchievementsBadge achievement={achievement} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
