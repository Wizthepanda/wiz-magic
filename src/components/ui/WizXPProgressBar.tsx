import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useXPProgress } from '@/hooks/useXPProgress';

interface WizXPProgressBarProps {
  className?: string;
  showTooltip?: boolean;
  animate?: boolean;
}

export const WizXPProgressBar: React.FC<WizXPProgressBarProps> = ({
  className = '',
  showTooltip = true,
  animate = true
}) => {
  const { xpData, loading, error, getProgressBarColor } = useXPProgress();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Animate progress bar fill
  useEffect(() => {
    if (!xpData || !animate) return;

    const targetProgress = xpData.progressPercent;
    const duration = 1000; // 1 second animation
    const steps = 60; // 60fps
    const increment = (targetProgress - animatedProgress) / steps;

    let step = 0;
    const timer = setInterval(() => {
      if (step >= steps) {
        setAnimatedProgress(targetProgress);
        clearInterval(timer);
        return;
      }

      setAnimatedProgress(prev => prev + increment);
      step++;
    }, duration / steps);

    return () => clearInterval(timer);
  }, [xpData?.progressPercent, animate, animatedProgress]);

  // Listen for XP updates and level up events
  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      console.log('🆙 WizXPProgressBar received level up:', event.detail);
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000); // Hide after 3 seconds
    };

    const handleXpUpdated = (event: CustomEvent) => {
      console.log('📊 WizXPProgressBar received XP update:', event.detail);
      // Force re-render to update progress bar
      setAnimatedProgress(prev => prev); // Trigger useEffect
    };

    window.addEventListener('levelUp', handleLevelUp as EventListener);
    window.addEventListener('xpUpdated', handleXpUpdated as EventListener);
    
    return () => {
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
      window.removeEventListener('xpUpdated', handleXpUpdated as EventListener);
    };
  }, []);

  // Set initial progress without animation
  useEffect(() => {
    if (xpData && !animate) {
      setAnimatedProgress(xpData.progressPercent);
    }
  }, [xpData?.progressPercent, animate]);

  if (loading) {
    return (
      <div className={`wiz-xp-progress-bar loading ${className}`}>
        <div className="loading-skeleton animate-pulse bg-gray-300 h-4 rounded-full"></div>
      </div>
    );
  }

  if (error || !xpData) {
    return (
      <div className={`wiz-xp-progress-bar error ${className}`}>
        <div className="text-red-500 text-sm">Unable to load XP data</div>
      </div>
    );
  }

  const {
    level,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    progressPercent,
    xpInCurrentLevel,
    xpNeededForNextLevel
  } = xpData;

  const displayProgress = animate ? animatedProgress : progressPercent;

  return (
    <div className={`wiz-xp-progress-bar relative ${className}`}>
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="level-up-animation bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold animate-bounce">
            🎉 LEVEL UP! Level {level}
          </div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Level Indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Level {level}
          </span>
          <span className="text-xs text-gray-500">
            {Math.floor(xpInCurrentLevel)} / {Math.floor(xpNeededForLevel)} XP
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-20"></div>
          
          {/* Progress Fill */}
          <motion.div
            className={`h-full bg-gradient-to-r ${getProgressBarColor(level)} rounded-full relative`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          </motion.div>

          {/* Progress percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow-lg">
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>

        {/* Tooltip/Label */}
        {showTooltip && (
          <div className="mt-2 text-center">
            <div className="text-sm text-gray-600">
              Level {level} — {Math.floor(currentXP)}/{Math.floor(xpForNextLevel)} XP
            </div>
            <div className="text-xs text-gray-500">
              {Math.floor(xpNeededForNextLevel)} XP to next level
            </div>
          </div>
        )}

        {/* Level Milestones (show markers for upcoming levels) */}
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          {level < 10 && (
            <>
              <span>Lv {level}</span>
              <span>Lv {level + 1}</span>
            </>
          )}
          {level === 10 && (
            <span className="w-full text-center text-yellow-600 font-semibold">
              🏆 MAX LEVEL REACHED! 🏆
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WizXPProgressBar;