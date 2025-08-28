/**
 * XPProgress React Component
 * Provides real-time XP tracking with dual update mechanism:
 * 1. onSnapshot for persistent Firestore sync
 * 2. Custom window events for instant UI feedback
 */

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import authSingleton from '../lib/authSingleton';

// Level thresholds (matches transaction system)
const LEVEL_THRESHOLDS = {
  1: 100, 2: 300, 3: 800, 4: 1600, 5: 3000,
  6: 6000, 7: 12000, 8: 24000, 9: 50000, 10: 100000
};

function calculateLevel(xp) {
  let level = 1;
  for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xp >= threshold) {
      level = parseInt(lvl) + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 10);
}

function getProgressWithinLevel(currentXp, level) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[10];
  
  if (level >= 10) return 100; // Max level
  
  const progressXp = currentXp - currentThreshold;
  const neededXp = nextThreshold - currentThreshold;
  return Math.min(100, Math.max(0, (progressXp / neededXp) * 100));
}

export default function XPProgress({ className = "", showDetails = true }) {
  const [xpData, setXpData] = useState({
    currentXP: 0,
    level: 1,
    progress: 0,
    nextThreshold: 100,
    dailyXpEarned: 0,
    canEarnMoreXP: true,
    loading: true
  });
  
  const [instantFeedback, setInstantFeedback] = useState({
    show: false,
    earnedXp: 0,
    message: ''
  });

  useEffect(() => {
    let firestoreUnsubscribe = null;
    let authUnsubscribe = null;

    // Handle auth state changes
    authUnsubscribe = authSingleton.addListener((user) => {
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }

      if (!user) {
        setXpData({
          currentXP: 0,
          level: 1,
          progress: 0,
          nextThreshold: 100,
          dailyXpEarned: 0,
          canEarnMoreXP: true,
          loading: false
        });
        return;
      }

      // Subscribe to user's Firestore document
      const userRef = doc(db, 'users', user.uid);
      firestoreUnsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const currentXP = data.currentXP || 0;
          const level = calculateLevel(currentXP);
          const progress = getProgressWithinLevel(currentXP, level);
          const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[10];
          const dailyXpEarned = data.dailyXpEarned || 0;
          const canEarnMoreXP = dailyXpEarned < 360;

          setXpData({
            currentXP,
            level,
            progress,
            nextThreshold,
            dailyXpEarned,
            canEarnMoreXP,
            loading: false
          });

          console.log('📊 XPProgress: Firestore sync', { currentXP, level, dailyXpEarned });
        } else {
          // User document doesn't exist yet
          setXpData({
            currentXP: 0,
            level: 1,
            progress: 0,
            nextThreshold: 100,
            dailyXpEarned: 0,
            canEarnMoreXP: true,
            loading: false
          });
        }
      }, (error) => {
        console.error('❌ XPProgress: Firestore listener error:', error);
        setXpData(prev => ({ ...prev, loading: false }));
      });
    });

    return () => {
      if (authUnsubscribe) authUnsubscribe();
      if (firestoreUnsubscribe) firestoreUnsubscribe();
    };
  }, []);

  useEffect(() => {
    // Listen for instant XP update events
    const handleXpUpdated = (event) => {
      const { earnedXp, totalXp, levelUp, newLevel } = event.detail;
      
      console.log('⚡ XPProgress: Instant update event', event.detail);

      // Show instant feedback
      let message = `+${earnedXp} XP earned!`;
      if (levelUp) {
        message = `🎉 Level ${newLevel}! +${earnedXp} XP`;
      }

      setInstantFeedback({
        show: true,
        earnedXp,
        message
      });

      // Update UI instantly (will be overridden by Firestore soon)
      if (totalXp) {
        const newLevel = calculateLevel(totalXp);
        const progress = getProgressWithinLevel(totalXp, newLevel);
        const nextThreshold = LEVEL_THRESHOLDS[newLevel] || LEVEL_THRESHOLDS[10];

        setXpData(prev => ({
          ...prev,
          currentXP: totalXp,
          level: newLevel,
          progress,
          nextThreshold,
          dailyXpEarned: prev.dailyXpEarned + earnedXp,
          canEarnMoreXP: (prev.dailyXpEarned + earnedXp) < 360
        }));
      }

      // Hide feedback after 3 seconds
      setTimeout(() => {
        setInstantFeedback({ show: false, earnedXp: 0, message: '' });
      }, 3000);
    };

    const handleLevelUp = (event) => {
      console.log('🆙 XPProgress: Level up event', event.detail);
      // Additional level-up specific handling can go here
    };

    window.addEventListener('xpUpdated', handleXpUpdated);
    window.addEventListener('levelUp', handleLevelUp);

    return () => {
      window.removeEventListener('xpUpdated', handleXpUpdated);
      window.removeEventListener('levelUp', handleLevelUp);
    };
  }, []);

  if (xpData.loading) {
    return (
      <div className={`xp-progress loading ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const { currentXP, level, progress, nextThreshold, dailyXpEarned, canEarnMoreXP } = xpData;
  const xpToNextLevel = nextThreshold - currentXP;
  const dailyRemaining = 360 - dailyXpEarned;

  return (
    <div className={`xp-progress ${className}`} style={{ position: 'relative' }}>
      {/* Instant feedback overlay */}
      {instantFeedback.show && (
        <div 
          className="instant-feedback"
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            animation: 'slideInDown 0.3s ease-out'
          }}
        >
          {instantFeedback.message}
        </div>
      )}

      {/* Level and XP Display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-purple-600">
            Level {level}
          </span>
          <span className="text-sm text-gray-600">
            {currentXP.toLocaleString()} XP
          </span>
        </div>
        
        {showDetails && (
          <div className="text-xs text-gray-500">
            {level < 10 ? `${xpToNextLevel} to Level ${level + 1}` : 'Max Level!'}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Daily XP Status */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs">
          <span className={canEarnMoreXP ? 'text-green-600' : 'text-orange-600'}>
            Daily: {dailyXpEarned}/360 XP
          </span>
          
          <span className="text-gray-500">
            {canEarnMoreXP 
              ? `${dailyRemaining} XP left today`
              : 'Daily limit reached'
            }
          </span>
        </div>
      )}

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes slideInDown {
          from {
            transform: translate(-50%, -10px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        
        .xp-progress {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .xp-progress.loading {
          min-height: 60px;
        }
      `}</style>
    </div>
  );
}

export { calculateLevel, getProgressWithinLevel, LEVEL_THRESHOLDS };