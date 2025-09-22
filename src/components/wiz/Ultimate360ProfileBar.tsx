'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trophy, ShoppingBag, Sparkles } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { initProgressUI } from '@/lib/wiz-progress-ui';
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown';
import { EnhancedProfileDropdown } from '@/components/ui/enhanced-profile-dropdown';
import { XPRewardsDropdown } from '@/components/ui/xp-rewards-dropdown';
import { LeaderboardDropdownV2 } from '@/components/ui/leaderboard-dropdown-v2';
import { ZAPRewardsDropdown } from '@/components/ui/zap-rewards-dropdown';
import { LuxuryCircularIcon } from '@/components/ui/luxury-circular-icon';

interface Ultimate360ProfileBarProps {
  onNavigateToLeaderboard?: () => void;
  onNavigateToShop?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Ultimate360ProfileBar: React.FC<Ultimate360ProfileBarProps> = ({
  onNavigateToLeaderboard,
  onNavigateToShop,
  darkMode = false,
  onToggleDarkMode
}) => {
  const { user } = useAuth();
  const { totalXP: totalZAPS, level, progressPercent, xpInCurrentLevel: zapsInCurrentLevel, xpToNextLevel: zapsToNextLevel, dailyXP: dailyZAPS, loading } = useXp();
  const [showSparkles, setShowSparkles] = useState(false);
  const [prevTotalZAPS, setPrevTotalZAPS] = useState(totalZAPS);
  const [prevLevel, setPrevLevel] = useState(level);

  // Initialize progress UI and listen for level up events
  useEffect(() => {
    if (!user?.uid) return;

    const cleanup = initProgressUI(user.uid);

    const handleLevelUp = () => {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 3000);
    };

    const handleMilestoneUnlock = (e: CustomEvent) => {
      const { level, badgeName } = e.detail;
      console.log(`🏆 Milestone unlocked: ${badgeName} at level ${level}`);
    };

    window.addEventListener('levelUp', handleLevelUp);
    window.addEventListener('milestoneUnlocked', handleMilestoneUnlock as EventListener);

    return () => {
      cleanup();
      window.removeEventListener('levelUp', handleLevelUp);
      window.removeEventListener('milestoneUnlocked', handleMilestoneUnlock as EventListener);
    };
  }, [user?.uid]);

  // Watch for XP changes and trigger animations
  useEffect(() => {
    if (totalZAPS > 0 && prevTotalZAPS > 0 && totalZAPS > prevTotalZAPS) {
      console.log(`🎯 ZAPs increased from ${prevTotalZAPS} to ${totalZAPS}! Triggering animation...`);

      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);

      if (level > prevLevel) {
        console.log(`🎉 Level up! From ${prevLevel} to ${level}`);
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { oldLevel: prevLevel, newLevel: level } }));
      }
    }

    setPrevTotalZAPS(totalZAPS);
    setPrevLevel(level);
  }, [totalZAPS, level, prevTotalZAPS, prevLevel]);

  // Generate referral code
  const generateReferralCode = (uid: string): string => {
    return btoa(uid).substring(0, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  // Copy referral link
  const copyReferralLink = async () => {
    if (!user?.uid) return;

    const referralCode = generateReferralCode(user.uid);
    const referralLink = `${window.location.origin}?ref=${referralCode}`;

    try {
      await navigator.clipboard.writeText(referralLink);
      console.log('Referral link copied');
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center space-x-3 animate-pulse">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </div>
    );
  }

  // Create user object for enhanced profile dropdown
  const enhancedUser = {
    id: user.uid,
    displayName: user.displayName || 'WIZ User',
    email: user.email || '',
    avatar: user.photoURL || '',
    level: level,
    currentZAPS: totalZAPS,
    zapsForCurrentLevel: totalZAPS - zapsInCurrentLevel,
    zapsForNextLevel: totalZAPS - zapsInCurrentLevel + zapsToNextLevel,
    progressPercent: progressPercent
  };

  return (
    <div className="relative">
      {/* Sparkles Animation Container */}
      <AnimatePresence>
        {showSparkles && (
          <motion.div
            className="absolute -top-8 -left-8 -right-8 -bottom-8 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + (i * 8)}%`,
                  top: `${5 + (i % 4) * 20}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 30 - 15, 0],
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360, 720]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  repeat: 1,
                }}
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Navigation Bar */}
      <motion.div
        className="flex items-center space-x-4 px-6 py-3 rounded-2xl backdrop-blur-xl border shadow-lg"
        style={{
          background: darkMode
            ? 'rgba(15, 23, 42, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        {/* Notifications Dropdown */}
        <NotificationsDropdown
          onMarkAsRead={(id) => console.log('Mark notification as read:', id)}
          onMarkAllAsRead={() => console.log('Mark all notifications as read')}
          onViewAll={() => console.log('View all notifications')}
        />

        {/* Leaderboard Dropdown V2 */}
        <LeaderboardDropdownV2
          onViewFullLeaderboard={onNavigateToLeaderboard}
        />

        {/* ZAP Rewards Dropdown */}
        <ZAPRewardsDropdown
          currentZAPS={totalZAPS}
          onViewAllRewards={onNavigateToShop}
          onRewardClick={(id) => console.log('Purchase item:', id)}
        />

        {/* XP Rewards Dropdown */}
        <XPRewardsDropdown
          totalZAPS={totalZAPS}
          dailyZAPS={dailyZAPS}
          onClaimReward={(id) => console.log('Claim reward:', id)}
          onGoToXPStore={onNavigateToShop}
        />

        {/* Divider */}
        <div
          className="w-px h-8"
          style={{
            background: darkMode
              ? 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent)'
              : 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1), transparent)'
          }}
        />

        {/* Enhanced Profile Dropdown */}
        <EnhancedProfileDropdown
          user={enhancedUser}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          onSignOut={handleSignOut}
          onProfile={() => console.log('Go to profile')}
          onSettings={() => console.log('Go to settings')}
          onCopyReferral={copyReferralLink}
        />
      </motion.div>

      {/* Aurora Glow Effect for Level Ups */}
      <AnimatePresence>
        {showSparkles && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: `
                conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  rgba(59, 130, 246, 0.2) 90deg,
                  rgba(139, 92, 246, 0.3) 180deg,
                  rgba(244, 114, 182, 0.2) 270deg,
                  transparent 360deg
                )
              `,
              filter: "blur(20px)",
              zIndex: -1,
              scale: 1.2
            }}
            animate={{
              rotate: [0, 360],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              rotate: {
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};