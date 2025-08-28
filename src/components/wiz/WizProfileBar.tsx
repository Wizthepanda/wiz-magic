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
  ChevronDown
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useSimpleXP } from '@/hooks/useSimpleXP';
import { initProgressUI } from '@/lib/wiz-progress-ui';

interface UserXPData {
  currentXP: number;
  level: number;
  displayName: string;
  email: string;
  avatarUrl?: string;
  dailyXpEarned: number;
  dailyVideosWatched: number;
  youtubeConnected?: boolean;
  referralCode?: string;
}

interface ProgressData {
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
}

export const WizProfileBar: React.FC = () => {
  const { user } = useAuth();
  const { xpData, loading, error } = useSimpleXP();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  
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

  // Calculate daily progress message based on daily XP
  const getDailyProgressMessage = (): string => {
    if (!xpData) return "🔥 Watch videos to earn XP today";
    
    const dailyProgress = (xpData.dailyXpEarned / 360) * 100;
    if (dailyProgress >= 100) {
      return "🎉 Daily XP cap reached!";
    }
    if (dailyProgress >= 75) {
      return "🔥 Almost at daily cap! Keep going!";
    }
    if (dailyProgress >= 50) {
      return "🔥 Halfway to daily cap!";
    }
    return "🔥 Start watching to earn XP today";
  };

  if (loading || !xpData) {
    return (
      <div className="flex items-center space-x-3 animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div className="h-4 bg-gray-300 rounded w-20"></div>
      </div>
    );
  }

  const levelBadgeColor = getLevelBadgeColor(xpData.level);

  return (
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
            src={xpData.avatarUrl || user?.photoURL || '/default-avatar.png'}
            alt={xpData.displayName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20"
          />
        </div>
        </div>

        {/* Username, Level, and Progress */}
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-white truncate max-w-20">
              {xpData.displayName}
            </span>
            <motion.div
              id="level-badge"
              className={`px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${levelBadgeColor} shadow-lg`}
              animate={showSparkles ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: showSparkles ? 3 : 0 }}
            >
              🏅 Lv.{xpData.level}
            </motion.div>
          </div>
          
          {/* Slim Progress Bar */}
          <div className="flex items-center space-x-2 w-full mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm min-w-24">
              <motion.div
                id="progress-bar-fill"
                className={`h-full bg-gradient-to-r ${getProgressBarColor(xpData.level)} rounded-full shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${xpData.progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span id="level-progress" className="text-xs text-white/80 font-mono">
              {Math.floor(xpData.xpInCurrentLevel)} / {Math.floor(xpData.xpNeededForNextLevel)}
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
            <div className="p-6 space-y-6">
              {/* Profile Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={xpData.avatarUrl || user?.photoURL || '/default-avatar.png'}
                  alt={xpData.displayName}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-white/20"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {xpData.displayName}
                  </h3>
                  <p className="text-sm text-white/70 truncate">
                    {xpData.email}
                  </p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${levelBadgeColor} mt-2`}>
                    🏅 Level {xpData.level}
                  </div>
                </div>
              </div>

              {/* Full XP Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">XP Progress</span>
                  <span className="text-sm text-white/70">
                    {Math.round(xpData.progressPercent)}% complete
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getProgressBarColor(xpData.level)} rounded-full shadow-lg relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${xpData.progressPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-xs text-white/60">
                  <span id="xp-text">{Math.floor(xpData.currentXP)} XP</span>
                  <span>{Math.floor(xpData.xpForNextLevel)} XP</span>
                </div>
              </div>

              {/* Daily Streak */}
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-white">
                  {getDailyProgressMessage()}
                </span>
              </div>

              {/* Invite Friends */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-white">Invite Friends (+50 XP)</span>
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

              {/* Daily XP Progress */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-white">Daily XP</span>
                </div>
                <span className="text-sm font-medium text-blue-400">
                  {Math.floor(xpData.dailyXpEarned)}/360 XP
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10"></div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/5 rounded-lg transition-colors duration-200 text-white">
                  <User className="w-5 h-5 text-white/60" />
                  <span className="text-sm font-medium">Profile</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-white/5 rounded-lg transition-colors duration-200 text-white">
                  <Settings className="w-5 h-5 text-white/60" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500/10 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};