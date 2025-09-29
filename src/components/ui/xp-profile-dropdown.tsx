import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Share2, Settings, LogOut, Copy, Check, Link, Zap, Youtube, User, Sliders, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';

interface XPProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLDivElement>;
  userXP?: number; // Legacy prop, will be overridden by ZAP system
  nextLevelXP?: number; // Legacy prop
  userLevel?: number; // Legacy prop
  streakDays?: number; // Legacy prop
  userName?: string; // Legacy prop
  userEmail?: string;
  dailyXP?: number; // Legacy prop
  isYouTubeConnected?: boolean;
}

export const XPProfileDropdown: React.FC<XPProfileDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  userEmail,
  isYouTubeConnected = true
}) => {
  const { user } = useAuth();
  const { zapData, zapProgress, loading } = useZAPSystem();
  const [linkCopied, setLinkCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Handle clicks outside dropdown and Esc key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  // Calculate dropdown position with mobile support
  const getDropdownPosition = () => {
    if (!triggerRef.current) return { top: 0, right: 0, left: 'auto' };

    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      return {
        top: rect.bottom + 12,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 380 - 16)),
        right: 'auto'
      };
    }

    return {
      top: rect.bottom + 12,
      right: window.innerWidth - rect.right,
      left: 'auto'
    };
  };

  const position = getDropdownPosition();

  // Show loading state
  if (loading || !user) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 27 }} // 8% of 340px ≈ 27px
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 27 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94] // Smooth premium easing
          }}
          className="fixed z-50 w-[380px] max-w-[calc(100vw-32px)]"
          style={{
            top: position.top,
            right: position.right,
            left: position.left
          }}
        >
          <div
            className="overflow-hidden rounded-2xl bg-white shadow-lg"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* HEADER with Purple Gradient */}
            <div className="p-6">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 p-0.5 flex-shrink-0">
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-full h-full rounded-full object-cover bg-white"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {userData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                {/* Name and Email */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 text-base">{userData.name}</h2>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                </div>
                {/* Level Badge with Purple Gradient */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-white">Lv.{userData.level}</span>
                </div>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Progress to Level {userData.level + 1}</span>
                <span className="text-sm font-medium text-gray-900">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{userData.currentLevelZAPs.toLocaleString()} ZAPs</span>
                <span>+{userData.dailyZAPs} Today</span>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="px-6 pb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{userData.dailyVideosWatched}</p>
                  <p className="text-sm text-gray-500">Videos</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{userData.currentStreak}</p>
                  <p className="text-sm text-gray-500">Streak</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-gray-900">{userData.dailyVideosWatched}</p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
              </div>
            </div>

            {/* DAILY GOAL */}
            <div className="px-6 pb-6">
              {watchGoalRemaining > 0 ? (
                <p className="text-sm text-gray-600">
                  Watch {watchGoalRemaining} more videos to reach your daily goal ({userData.dailyVideosWatched}/3 videos)
                </p>
              ) : (
                <p className="text-sm text-green-600">
                  ✅ Daily goal completed! {userData.dailyVideosWatched}/3 videos
                </p>
              )}
            </div>

            {/* INVITE FRIENDS */}
            <div className="px-6 pb-6">
              <label className="text-sm text-gray-500 block mb-2">Invite friends, earn +100 ZAPs</label>
              <div className="flex">
                <input
                  className="flex-1 text-sm border border-gray-200 rounded-l-lg px-3 py-2 bg-gray-50"
                  value={inviteLink}
                  readOnly
                />
                <button
                  onClick={handleCopyLink}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-r-lg transition-all duration-200",
                    linkCopied
                      ? "bg-green-500 text-white"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
                  )}
                >
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* YOUTUBE STATUS */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between text-base">
                <span className="text-gray-900">YouTube</span>
                <span className={cn(
                  "font-medium",
                  isYouTubeConnected ? "text-green-600" : "text-red-500"
                )}>
                  {isYouTubeConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="mx-6 h-px bg-gray-200 mb-6" />

            {/* ACTIONS */}
            <div className="px-6 pb-6 space-y-3">
              <button className="block w-full text-left text-base text-gray-700 hover:text-purple-600 transition-colors duration-200 py-1">
                Profile Settings
              </button>
              <button className="block w-full text-left text-base text-gray-700 hover:text-purple-600 transition-colors duration-200 py-1">
                Preferences
              </button>
              <button className="block w-full text-left text-base text-red-500 hover:text-red-600 transition-colors duration-200 py-1">
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};