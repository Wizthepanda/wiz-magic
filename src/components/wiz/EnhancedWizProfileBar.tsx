'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Gem, Sparkles } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { initProgressUI } from '@/lib/wiz-progress-ui';
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown';
import { EnhancedProfileDropdown } from '@/components/ui/enhanced-profile-dropdown';
import { XPRewardsDropdown } from '@/components/ui/xp-rewards-dropdown';
import { EnhancedIconTrigger } from '@/components/ui/enhanced-icon-trigger';

export const EnhancedWizProfileBar: React.FC = () => {
  const { user } = useAuth();
  const { totalXP, level, progressPercent, xpInCurrentLevel, xpToNextLevel, dailyXP, loading } = useXp();
  const [showSparkles, setShowSparkles] = useState(false);
  const [prevTotalXP, setPrevTotalXP] = useState(totalXP);
  const [prevLevel, setPrevLevel] = useState(level);

  // Initialize progress UI and listen for level up events
  useEffect(() => {
    if (!user?.uid) return;

    // Initialize polished progress UI system
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
    if (totalXP > 0 && prevTotalXP > 0 && totalXP > prevTotalXP) {
      console.log(`🎯 XP increased from ${prevTotalXP} to ${totalXP}! Triggering animation...`);

      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);

      if (level > prevLevel) {
        console.log(`🎉 Level up! From ${prevLevel} to ${level}`);
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { oldLevel: prevLevel, newLevel: level } }));
      }
    }

    setPrevTotalXP(totalXP);
    setPrevLevel(level);
  }, [totalXP, level, prevTotalXP, prevLevel]);

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
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
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
    currentXP: totalXP,
    xpForCurrentLevel: totalXP - xpInCurrentLevel,
    xpForNextLevel: totalXP - xpInCurrentLevel + xpToNextLevel,
    progressPercent: progressPercent
  };

  return (
    <div className="relative flex items-center space-x-3">
      {/* Sparkles Animation Container */}
      <AnimatePresence>
        {showSparkles && (
          <motion.div
            className="absolute -top-4 -left-4 -right-4 -bottom-4 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${10 + (i % 3) * 20}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: 2,
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Dropdown */}
      <NotificationsDropdown
        onMarkAsRead={(id) => console.log('Mark notification as read:', id)}
        onMarkAllAsRead={() => console.log('Mark all notifications as read')}
        onViewAll={() => console.log('View all notifications')}
      />

      {/* XP Rewards Dropdown */}
      <XPRewardsDropdown
        totalXP={totalXP}
        dailyXP={dailyXP}
        onClaimReward={(id) => console.log('Claim reward:', id)}
        onGoToXPStore={() => console.log('Go to XP store')}
      />

      {/* Enhanced Profile Dropdown */}
      <EnhancedProfileDropdown
        user={enhancedUser}
        onSignOut={handleSignOut}
        onProfile={() => console.log('Go to profile')}
        onSettings={() => console.log('Go to settings')}
        onCopyReferral={copyReferralLink}
      />
    </div>
  );
};