import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPProgressHeaderProps {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  onXPIncrease?: (amount: number) => void;
}

/**
 * XPProgressHeader Component (Phase 7)
 * Animated XP progress bar with level display and sparkle effects
 */
export const XPProgressHeader: React.FC<XPProgressHeaderProps> = ({
  currentLevel,
  currentXP,
  nextLevelXP,
  onXPIncrease,
}) => {
  const [displayXP, setDisplayXP] = useState(currentXP);
  const [showSparkle, setShowSparkle] = useState(false);
  const progressPercent = (currentXP / nextLevelXP) * 100;

  // Animated XP counter
  useEffect(() => {
    if (currentXP > displayXP) {
      setShowSparkle(true);
      const diff = currentXP - displayXP;
      const duration = 1500;
      const steps = 60;
      const increment = diff / steps;
      let current = displayXP;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;
        if (step >= steps) {
          setDisplayXP(currentXP);
          clearInterval(timer);
          setTimeout(() => setShowSparkle(false), 1000);
        } else {
          setDisplayXP(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [currentXP]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 shadow-2xl">
      {/* Animated Background */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="absolute inset-0 opacity-30 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">🎁</span>
            Your Progress
          </h1>
          <p className="text-lg text-purple-100">
            Keep earning XP to unlock exclusive rewards!
          </p>
        </motion.div>

        {/* Level & XP Display */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Level Badge */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-white">
              <div className="text-center">
                <div className="text-xs text-white/80 font-semibold">Level</div>
                <div className="text-4xl md:text-5xl font-bold text-white">{currentLevel}</div>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 text-3xl"
            >
              ✨
            </motion.div>
          </motion.div>

          {/* XP Stats */}
          <div className="flex-1 w-full">
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                <motion.span
                  key={displayXP}
                  initial={{ scale: 1.2, color: '#fbbf24' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  className="text-4xl font-bold text-white"
                >
                  {displayXP.toLocaleString()}
                </motion.span>
                <span className="text-xl text-purple-200">
                  / {nextLevelXP.toLocaleString()} XP
                </span>
              </div>

              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {(nextLevelXP - currentXP).toLocaleString()} to go
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-8 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 relative"
              >
                {/* Shimmer Effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>

              {/* Percentage Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white drop-shadow-lg">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Next Level Preview */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl px-6 py-4"
          >
            <Award className="w-8 h-8 text-amber-400" />
            <div className="text-center">
              <div className="text-xs text-purple-200">Next Level</div>
              <div className="text-3xl font-bold text-white">{currentLevel + 1}</div>
            </div>
          </motion.div>
        </div>

        {/* Sparkle Burst on XP Gain */}
        <AnimatePresence>
          {showSparkle && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 1 }}
              exit={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none"
            >
              ✨
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
