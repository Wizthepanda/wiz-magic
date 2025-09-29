'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  Copy,
  Check,
  Gift,
  Youtube,
  Flame,
  Sparkles,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { initProgressUI } from '@/lib/wiz-progress-ui';
import { XPRewardsDropdown2 } from '@/components/ui/xp-rewards-dropdown-2';

interface UserZAPData {
  currentZAPs: number;
  level: number;
  displayName: string;
  email: string;
  avatarUrl?: string;
  dailyZAPsEarned: number;
  dailyVideosWatched: number;
  youtubeConnected?: boolean;
  referralCode?: string;
}

interface ProgressData {
  zapsForCurrentLevel: number;
  zapsForNextLevel: number;
  progressPercent: number;
  zapsInCurrentLevel: number;
  zapsNeededForNextLevel: number;
}

export const WizProfileBar: React.FC = () => {
  const { user } = useAuth();
  const { zapData, zapProgress, loading } = useZAPSystem();
  const [isOpen, setIsOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [prevTotalZAPs, setPrevTotalZAPs] = useState(zapData?.totalZAPs || 0);
  const [prevLevel, setPrevLevel] = useState(zapProgress?.level || 1);

  const dropdownRef = useRef<HTMLDivElement>(null);

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
      // Could trigger special milestone UI here
    };

    window.addEventListener('levelUp', handleLevelUp);
    window.addEventListener('milestoneUnlocked', handleMilestoneUnlock as EventListener);

    return () => {
      cleanup();
      window.removeEventListener('levelUp', handleLevelUp);
      window.removeEventListener('milestoneUnlocked', handleMilestoneUnlock as EventListener);
    };
  }, [user?.uid]);

  // Watch for ZAP changes and trigger animations
  useEffect(() => {
    const currentTotalZAPs = zapData?.totalZAPs || 0;
    const currentLevel = zapProgress?.level || 1;

    // Check if ZAPs increased (not on initial load)
    if (currentTotalZAPs > 0 && prevTotalZAPs > 0 && currentTotalZAPs > prevTotalZAPs) {
      console.log(`🎯 ZAPs increased from ${prevTotalZAPs} to ${currentTotalZAPs}! Triggering animation...`);

      // Trigger sparkles for ZAP gain
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);

      // Check if level increased
      if (currentLevel > prevLevel) {
        console.log(`🎉 Level up! From ${prevLevel} to ${currentLevel}`);
        // Dispatch level up event for other listeners
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { oldLevel: prevLevel, newLevel: currentLevel } }));
      }
    }

    // Update previous values
    setPrevTotalZAPs(currentTotalZAPs);
    setPrevLevel(currentLevel);
  }, [zapData?.totalZAPs, zapProgress?.level, prevTotalZAPs, prevLevel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Get level badge color based on tier
  const getLevelBadgeColor = (level: number): string => {
    if (level >= 1 && level <= 4) return 'from-purple-500 to-purple-600 shadow-purple-500/50';
    if (level >= 5 && level <= 6) return 'from-blue-500 to-blue-600 shadow-blue-500/50';
    if (level >= 7 && level <= 9) return 'from-pink-500 to-pink-600 shadow-pink-500/50';
    if (level === 10) return 'from-yellow-400 to-yellow-500 shadow-yellow-500/50';
    return 'from-gray-500 to-gray-600 shadow-gray-500/50';
  };

  // Get progress bar color based on tier
  const getProgressBarColor = (level: number): string => {
    if (level >= 1 && level <= 4) return 'from-purple-500 to-purple-600';
    if (level >= 5 && level <= 6) return 'from-blue-500 to-blue-600';
    if (level >= 7 && level <= 9) return 'from-pink-500 to-pink-600';
    if (level === 10) return 'from-yellow-400 to-yellow-500';
    return 'from-gray-500 to-gray-600';
  };

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Create zapData object from ZAP system for compatibility
  const userZAPData = user ? {
    currentZAPs: zapData?.totalZAPs || 0,
    level: zapProgress?.level || 1,
    dailyZAPsEarned: zapData?.dailyZAPs || 0,
    displayName: user.displayName || 'WIZ User',
    email: user.email || '',
    avatarUrl: user.photoURL || '',
    progressPercent: zapProgress?.progressPercent || 0,
    zapsForCurrentLevel: zapProgress?.zapsForCurrentLevel || 0,
    zapsForNextLevel: zapProgress?.zapsForNextLevel || 100,
    zapsInCurrentLevel: zapProgress?.currentLevelZAPs || 0,
    zapsNeededForNextLevel: zapProgress?.zapsToNextLevel || 100,
    dailyZAPsRemaining: Math.max(0, 360 - (zapData?.dailyZAPs || 0))
  } : null;

  // Calculate daily progress message based on daily ZAPs
  const getDailyProgressMessage = (): string => {
    if (!userZAPData) return "⚡ Watch videos to earn ZAPs today";

    const dailyProgress = (userZAPData.dailyZAPsEarned / 360) * 100;
    if (dailyProgress >= 100) {
      return "🎉 Daily ZAP cap reached!";
    }
    if (dailyProgress >= 75) {
      return "⚡ Almost at daily cap! Keep going!";
    }
    if (dailyProgress >= 50) {
      return "⚡ Halfway to daily cap!";
    }
    return "⚡ Start watching to earn ZAPs today";
  };

  if (loading || !userZAPData || !user) {
    return (
      <div className="flex items-center space-x-3 animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </div>
    );
  }

  const levelBadgeColor = getLevelBadgeColor(userZAPData.level);

  return (
    <div className="flex items-center space-x-3">
      {/* XP Rewards Shop Dropdown */}
      <XPRewardsDropdown2
        isOpen={shopDropdownOpen}
        onOpenChange={setShopDropdownOpen}
      />

      {/* Profile Section */}
      <div className="relative" ref={dropdownRef}>
        {/* Sparkles Animation on Level Up */}
        <AnimatePresence>
          {showSparkles && (
            <motion.div
              className="absolute -top-2 -left-2 -right-2 -bottom-2 pointer-events-none z-50"
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

        {/* Top-Bar Minimal Version */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group"
        >
        {/* Avatar */}
        <div className="relative">
          <img
            src={userZAPData.avatarUrl || user?.photoURL || '/default-avatar.png'}
            alt={userZAPData.displayName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
          />
        </div>

        {/* Username, Level, and Progress */}
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white truncate max-w-20">
              {userZAPData.displayName}
            </span>
            <motion.div
              id="level-badge"
              className={`px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${levelBadgeColor} shadow-lg`}
              animate={showSparkles ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: showSparkles ? 3 : 0 }}
            >
              ⚡ Lv.{userZAPData.level}
            </motion.div>
          </div>

          {/* Slim Progress Bar */}
          <div className="flex items-center space-x-2 w-full mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm min-w-24">
              <motion.div
                id="progress-bar-fill"
                className={`h-full bg-gradient-to-r ${getProgressBarColor(userZAPData.level)} rounded-full shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${userZAPData.progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span id="level-progress" className="text-xs text-white/80 font-mono">
              {Math.floor(userZAPData.zapsInCurrentLevel)} / {Math.floor(userZAPData.zapsNeededForNextLevel)}
            </span>
          </div>
        </div>

        {/* Dropdown Indicator */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white/80" />
        </motion.div>
      </button>

      {/* Dropdown Expansion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl z-50"
          >
            <div className="p-6 space-y-5">
              {/* Profile Header */}
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 p-0.5 flex-shrink-0">
                  <img
                    src={userZAPData.avatarUrl || user?.photoURL || '/default-avatar.png'}
                    alt={userZAPData.displayName}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate text-lg">{userZAPData.displayName}</h3>
                  <p className="text-sm text-white/70 truncate">{userZAPData.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1 bg-purple-600/30 rounded-full px-2.5 py-1">
                      <span className="text-sm font-bold text-purple-200">Level {userZAPData.level}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/90">Progress to Level {userZAPData.level + 1}</span>
                  <span className="text-sm font-bold text-purple-300">{Math.round(userZAPData.progressPercent)}%</span>
                </div>

                <div className="relative">
                  <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
                    <motion.div
                      className={`bg-gradient-to-r ${getProgressBarColor(userZAPData.level)} h-3 rounded-full relative overflow-hidden`}
                      initial={{ width: 0 }}
                      animate={{ width: `${userZAPData.progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </motion.div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="font-medium">{userZAPData.zapsInCurrentLevel.toLocaleString()} ZAPs</span>
                  <span className="font-medium text-purple-300">+{userZAPData.zapsNeededForNextLevel.toLocaleString()} to level up</span>
                </div>
              </div>

              {/* ZAP Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-xs font-medium text-amber-200/90">Total ZAPs</span>
                  </div>
                  <span className="text-xl font-bold text-white">{userZAPData.currentZAPs.toLocaleString()}</span>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Flame className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <span className="text-xs font-medium text-green-200/90">Daily ZAPs</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-bold text-white">{userZAPData.dailyZAPsEarned}</span>
                    <span className="text-xs text-green-300">/360</span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (userZAPData.dailyZAPsEarned / 360) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Daily Progress Message */}
              <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-200 mb-1">
                      {getDailyProgressMessage()}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-purple-900/30 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (userZAPData.dailyZAPsEarned / 360) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-purple-300 font-medium">{userZAPData.dailyZAPsEarned}/360</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invite Friends */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-white">Invite Friends (+50 ZAPs)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm font-mono text-white/80">
                    wizxp.com?ref={user?.uid ? generateReferralCode(user.uid) : 'WIZCODE'}
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors duration-200 text-white text-sm font-medium min-w-16"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mx-auto" />
                    ) : (
                      <Copy className="w-4 h-4 mx-auto" />
                    )}
                  </button>
                </div>
              </div>


              {/* Divider */}
              <div className="border-t border-white/20"></div>

              {/* Action Buttons */}
              <div className="space-y-1.5">
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/10 rounded-xl transition-all duration-200 text-white group">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <User className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="text-sm font-medium">Profile Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/10 rounded-xl transition-all duration-200 text-white group">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <Settings className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="text-sm font-medium">Preferences</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500/10 rounded-xl transition-all duration-200 text-red-400 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};