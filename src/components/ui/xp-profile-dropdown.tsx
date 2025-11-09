/**
 * XP Profile Dropdown - Using HeaderDropdown with Floating UI
 * Matches Wallet/Notifications/Messages Architecture
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Share2, Settings, LogOut, Copy, Check, Zap, Youtube, User, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { useNavigate } from 'react-router-dom';
import { HeaderDropdown } from '@/components/ui/HeaderDropdown';
import { dropdownItemHoverClasses } from '@/lib/dropdown-animations';

interface XPProfileDropdownProps {
  children: React.ReactNode; // The trigger (avatar + XP ring)
  userEmail?: string;
  isYouTubeConnected?: boolean;
}

export const XPProfileDropdown: React.FC<XPProfileDropdownProps> = ({
  children,
  userEmail,
  isYouTubeConnected = true,
}) => {
  const { user, signOut } = useAuth();
  const { zapData, zapProgress, loading } = useZAPSystem();
  const [linkCopied, setLinkCopied] = useState(false);
  const navigate = useNavigate();

  // Use ZAP system data with fallbacks
  const userData = {
    name: user?.displayName || user?.email?.split('@')[0] || "WIZ User",
    email: userEmail || user?.email || "",
    avatar: user?.photoURL || "/api/placeholder/40/40",
    level: zapProgress?.level || 1,
    currentZAPs: zapData?.totalZAPs || 0,
    dailyZAPs: zapData?.dailyZAPs || 0,
    dailyVideosWatched: zapData?.dailyVideosWatched || 0,
    currentStreak: zapData?.currentStreak || 0,
    currentLevelZAPs: zapProgress?.currentLevelZAPs || 0,
    nextLevelZAPs: zapProgress?.nextLevelZAPs || 100,
    progressPercent: zapProgress?.progressPercent || 0,
    zapsToNextLevel: zapProgress?.zapsToNextLevel || 0,
    lifetimeStats: zapData?.lifetimeStats || {
      totalWatchTime: 0,
      totalShares: 0,
      totalReferrals: 0,
      totalVideosCompleted: 0
    }
  };

  // Calculate progress percentage
  const progressPercent = userData.progressPercent;
  const dailyZapsCap = 360;
  const dailyProgress = (userData.dailyZAPs / dailyZapsCap) * 100;
  const watchGoalRemaining = Math.max(0, 3 - userData.dailyVideosWatched);

  // Generate invite link
  const inviteLink = `https://wizxp.com/invite/${userData.name.toLowerCase()}`;

  // Handle copy invite link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state
  if (loading || !user) {
    return <div className="relative">{children}</div>;
  }

  // Dropdown content
  const dropdownContent = (
    <div className="w-[380px] max-w-[calc(100vw-32px)]">
      <div
        style={{
          background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px) saturate(180%)",
        }}
        className="rounded-2xl overflow-hidden"
      >
                {/* HEADER with Purple Gradient */}
                <div className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      <motion.img
                        src={userData.avatar}
                        alt={userData.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/50"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-gray-800">
                        Lv. {userData.level}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg truncate">{userData.name}</h3>
                      <p className="text-gray-400 text-sm truncate">{userData.email}</p>
                    </div>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Level Progress</span>
                      <span className="text-sm font-semibold text-white">
                        {userData.currentZAPs} / {userData.nextLevelZAPs} ZAPs
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {userData.zapsToNextLevel} ZAPs to Level {userData.level + 1}
                    </p>
                  </div>
                </div>

                {/* STATS SECTION */}
                <div className="px-6 py-4 bg-gray-800/50 border-y border-gray-700/50">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Daily ZAPs */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Daily ZAPs</p>
                        <p className="text-sm font-bold text-white">{userData.dailyZAPs}/{dailyZapsCap}</p>
                      </div>
                    </div>

                    {/* Current Streak */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Streak</p>
                        <p className="text-sm font-bold text-white">{userData.currentStreak} days</p>
                      </div>
                    </div>
                  </div>

                  {/* Daily Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Today's Progress</span>
                      <span className="text-xs font-semibold text-white">{dailyProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(dailyProgress, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Watch Goal */}
                  {watchGoalRemaining > 0 && (
                    <div className="mt-3 p-2 bg-gray-700/30 rounded-lg border border-gray-600/30">
                      <p className="text-xs text-gray-300">
                        🎯 Watch <span className="font-bold text-white">{watchGoalRemaining} more video{watchGoalRemaining > 1 ? 's' : ''}</span> to max daily ZAPs
                      </p>
                    </div>
                  )}
                </div>

                {/* MENU ITEMS */}
                <div className="py-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className={cn(
                      "w-full flex items-center px-6 py-3 text-white",
                      dropdownItemHoverClasses
                    )}
                  >
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => navigate('/rewards')}
                    className={cn(
                      "w-full flex items-center px-6 py-3 text-white",
                      dropdownItemHoverClasses
                    )}
                  >
                    <Target className="w-4 h-4 mr-3 text-gray-400" />
                    <span>Rewards & Quests</span>
                  </button>

                  <button
                    onClick={() => navigate('/leaderboard')}
                    className={cn(
                      "w-full flex items-center px-6 py-3 text-white",
                      dropdownItemHoverClasses
                    )}
                  >
                    <BarChart3 className="w-4 h-4 mr-3 text-gray-400" />
                    <span>Leaderboard</span>
                  </button>

                  <div className="h-px bg-gray-700/50 my-2" />

                  {/* Invite Link */}
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      "w-full flex items-center px-6 py-3 text-white",
                      dropdownItemHoverClasses
                    )}
                  >
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-3 text-green-400" />
                        <span className="text-green-400">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-3 text-gray-400" />
                        <span>Share Invite Link</span>
                      </>
                    )}
                  </button>

                  <div className="h-px bg-gray-700/50 my-2" />

                  <button
                    onClick={() => navigate('/profile?tab=settings')}
                    className={cn(
                      "w-full flex items-center px-6 py-3 text-white",
                      dropdownItemHoverClasses
                    )}
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className={cn(
                      "w-full flex items-center px-6 py-3 text-red-400",
                      "hover:bg-red-500/20 transition-all duration-150 cursor-pointer"
                    )}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* FOOTER - YouTube Connection Status */}
                {isYouTubeConnected && (
                  <div className="px-6 py-3 bg-gray-800/50 border-t border-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-gray-400">YouTube Connected</span>
                      <div className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
      </div>
    </div>
  );

  return (
    <HeaderDropdown
      name="profile"
      trigger={children}
      pointerClassName="bg-[#1E202E]/90"
    >
      {dropdownContent}
    </HeaderDropdown>
  );
};
