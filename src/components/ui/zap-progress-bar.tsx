import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { useZAPSystem } from '@/hooks/useZAPSystem';

interface ZAPProgressBarProps {
  className?: string;
  showTooltip?: boolean;
  videoProgress?: number; // 0-100 for video completion progress
  isVideoCompleted?: boolean;
  hasBeenCompleted?: boolean;
  progressBarReady?: boolean; // Whether the progress bar should update
}

export const ZAPProgressBar: React.FC<ZAPProgressBarProps> = ({
  className = '',
  showTooltip = false,
  videoProgress = 0,
  isVideoCompleted = false,
  hasBeenCompleted = false,
  progressBarReady = true
}) => {
  const { zapData, zapProgress, loading } = useZAPSystem();

  const [previousZAPs, setPreviousZAPs] = useState(zapData?.totalZAPs || 0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate progress percentage within current level
  const progressPercent = zapProgress?.progressPercent || 0;
  const currentLevelZAPs = zapProgress?.currentLevelZAPs || 0;
  const nextLevelZAPs = zapProgress?.nextLevelZAPs || 100;
  const level = zapProgress?.level || 1;
  const totalZAPs = zapData?.totalZAPs || 0;
  const dailyZAPs = zapData?.dailyZAPs || 0;
  const currentStreak = zapData?.currentStreak || 0;
  const longestStreak = zapData?.longestStreak || 0;

  // Detect ZAP gain and level up
  useEffect(() => {
    if (totalZAPs > previousZAPs) {
      // ZAPs gained - show sparkles
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 2000);

      return () => clearTimeout(timer);
    }
    setPreviousZAPs(totalZAPs);
  }, [totalZAPs, previousZAPs]);

  // Listen for level up animations from ZAP system
  useEffect(() => {
    const handleLevelUpAnimation = (event: CustomEvent) => {
      const { newLevel, oldLevel } = event.detail;
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('levelUp', handleLevelUpAnimation as EventListener);
      return () => window.removeEventListener('levelUp', handleLevelUpAnimation as EventListener);
    }
  }, []);

  if (loading) {
    return (
      <div className={`relative animate-pulse ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
          <div className="flex-1 h-1.5 bg-gray-300 rounded-full"></div>
          <div className="w-20 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minimal ZAP Progress Layout */}
      <div className="flex items-center space-x-3">
        {/* Level Badge */}
        <motion.div
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            backdropFilter: 'blur(10px)'
          }}
          animate={showLevelUp ? {
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 0 rgba(147, 51, 234, 0.5)',
              '0 0 20px rgba(147, 51, 234, 0.8)',
              '0 0 0 rgba(147, 51, 234, 0.5)'
            ]
          } : {}}
          transition={{ duration: 0.6, repeat: showLevelUp ? 2 : 0 }}
        >
          <span className="text-xs font-bold text-purple-200">⚡</span>
          <span className="text-xs font-bold text-white">Level {level}</span>
        </motion.div>

        {/* Progress Bar Container - 60% width */}
        <div className="flex-1 relative">
          {/* Thin Progress Bar Background */}
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Animated Progress Fill */}
            <motion.div
              className="h-full relative overflow-hidden rounded-full"
              style={{
                background: `linear-gradient(90deg,
                  rgba(147, 51, 234, 0.9) 0%,
                  rgba(168, 85, 247, 0.9) 25%,
                  rgba(219, 39, 119, 0.9) 50%,
                  rgba(99, 102, 241, 0.9) 75%,
                  rgba(59, 130, 246, 0.9) 100%
                )`,
                boxShadow: `0 0 15px rgba(147, 51, 234, 0.5)`
              }}
              initial={{ width: 0 }}
              animate={{
                width: `${progressPercent}%`,
                boxShadow: [
                  '0 0 15px rgba(147, 51, 234, 0.5)',
                  '0 0 25px rgba(147, 51, 234, 0.8)',
                  '0 0 15px rgba(147, 51, 234, 0.5)'
                ]
              }}
              transition={{
                width: { duration: 1.2, ease: [0.4, 0.0, 0.2, 1] },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {/* Flowing Shimmer Effect */}
              <motion.div
                className="absolute inset-0 opacity-60"
                style={{
                  background: `linear-gradient(90deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.6) 50%,
                    transparent 100%
                  )`
                }}
                animate={{ x: ['-100%', '300%'] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* ZAP Label with Status */}
        <div className="flex items-center space-x-2 text-xs font-medium text-gray-300 whitespace-nowrap">
          <span>{currentLevelZAPs} / {nextLevelZAPs} ⚡</span>
          {hasBeenCompleted && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
              ✓ Completed
            </span>
          )}
          {isVideoCompleted && !hasBeenCompleted && (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30">
              🎉 Just Completed!
            </span>
          )}
        </div>
      </div>

      {/* Video Progress Bar (if video data provided and ready) */}
      {videoProgress > 0 && progressBarReady && (
        <motion.div
          className="mt-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Video Progress</span>
            <span className="text-xs text-gray-300">{Math.floor(videoProgress)}%</span>
          </div>

          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${videoProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {hasBeenCompleted && (
            <div className="text-xs text-amber-400 mt-1 flex items-center space-x-1">
              <span>🔄</span>
              <span>Rewatching - Limited ZAPs (10% rate)</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Sparkle Animation for ZAP Gain */}
      <AnimatePresence>
        {showSparkles && (
          <motion.div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + i * 12}%`,
                  top: '-8px',
                }}
                initial={{
                  opacity: 0,
                  y: 0,
                  scale: 0,
                  rotate: 0
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-15, -30, -45],
                  scale: [0, 1, 0.5],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 1.8,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                <Sparkles
                  className="w-2.5 h-2.5 text-yellow-400"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))'
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Burst Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            {/* Confetti Burst */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: `hsl(${i * 18}, 80%, 60%)`,
                  left: '50%',
                  top: '50%'
                }}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: [1, 1, 0],
                  scale: [0, 1, 0.3],
                  x: Math.cos(i * 18 * Math.PI / 180) * 120,
                  y: Math.sin(i * 18 * Math.PI / 180) * 120,
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Level Up Badge */}
            <motion.div
              className="flex items-center space-x-2 px-4 py-2 rounded-full z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95) 0%, rgba(255, 193, 7, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.6)',
                border: '1px solid rgba(255, 215, 0, 0.4)'
              }}
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 8px 32px rgba(255, 215, 0, 0.6)',
                  '0 12px 48px rgba(255, 215, 0, 0.9)',
                  '0 8px 32px rgba(255, 215, 0, 0.6)'
                ]
              }}
              transition={{
                duration: 1.2,
                repeat: 2,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-3 h-3 text-white" />
              <span className="text-white font-bold text-xs">Level {level}!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {isHovered && showTooltip && (
          <motion.div
            className="absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg z-50 min-w-max"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(50, 50, 50, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.2)'
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-2">
              <div className="text-sm font-semibold text-white">⚡ ZAP Progress</div>

              <div className="text-xs text-gray-300 space-y-1">
                <div>Current Level: <span className="text-yellow-400 font-medium">Level {level}</span></div>
                <div>Progress: <span className="text-purple-400 font-medium">{currentLevelZAPs} / {nextLevelZAPs} ZAPs</span></div>
                <div>Total ZAPs: <span className="text-blue-400 font-medium">{totalZAPs.toLocaleString()}</span></div>
                <div>Daily ZAPs: <span className="text-green-400 font-medium">{dailyZAPs}</span></div>
                <div>Current Streak: <span className="text-orange-400 font-medium">{currentStreak} days</span></div>
                <div>Best Streak: <span className="text-pink-400 font-medium">{longestStreak} days</span></div>
              </div>

              <div className="pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-400">⚡ Watch videos to earn ZAPs & level up!</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Export with backward compatibility
export const XpProgressBar = ZAPProgressBar;