import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Zap, TrendingUp, Settings, LogOut, Target, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { useWatchTimeZAPs } from '@/hooks/useWatchTimeZAPs';

interface ProfileZAPDropdownProps {
  // Remove userXP prop since we'll get it from ZAP system
}

export const ProfileXPDropdown: React.FC<ProfileZAPDropdownProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { zapData, zapProgress, loading } = useZAPSystem();

  // Use actual ZAP system data with enhanced metrics
  const userData = {
    name: user?.displayName || user?.email?.split('@')[0] || "WIZ User",
    email: user?.email || "",
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

  const zapsNeededForNextLevel = userData.zapsToNextLevel;
  const dailyZapsCap = 360;
  const dailyProgress = (userData.dailyZAPs / dailyZapsCap) * 100;
  const watchGoalRemaining = Math.max(0, 3 - userData.dailyVideosWatched);

  // Show loading state
  if (loading || !user) {
    return (
      <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gray-200 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex flex-col space-y-1">
          <div className="w-16 h-3 bg-gray-300 rounded"></div>
          <div className="w-12 h-2 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300"
        style={{
          background: `
            linear-gradient(135deg,
              rgba(139, 92, 246, 0.15) 0%,
              rgba(79, 70, 229, 0.1) 100%
            )
          `,
          backdropFilter: 'blur(20px) saturate(150%)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          boxShadow: `
            0 4px 15px rgba(139, 92, 246, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
          `
        }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Profile Image */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 p-0.5">
          <img
            src={userData.avatar}
            alt={userData.name}
            className="w-full h-full rounded-full object-cover bg-white"
          />
        </div>

        {/* User Info */}
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-28">
            {userData.name}
          </span>
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-0.5 bg-purple-100 rounded-full px-2 py-0.5">
              <span className="text-xs font-bold text-purple-700">Lv.{userData.level}</span>
            </div>
            <div className="flex items-center space-x-0.5">
              <Zap className="w-3 h-3 text-amber-500" fill="currentColor" />
              <span className="text-xs font-bold text-gray-700">{userData.currentZAPs.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-3 w-80 rounded-2xl overflow-hidden z-50"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(30, 41, 59, 0.95) 0%,
                  rgba(51, 65, 85, 0.9) 100%
                )
              `,
              backdropFilter: 'blur(25px) saturate(150%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: `
                0 20px 50px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="p-6 space-y-5">
              {/* Profile Header */}
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-500 p-0.5 flex-shrink-0">
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate text-lg">{userData.name}</h3>
                  <p className="text-sm text-gray-300 truncate">{userData.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1 bg-purple-600/30 rounded-full px-2.5 py-1">
                      <span className="text-sm font-bold text-purple-200">Level {userData.level}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-200">Progress to Level {userData.level + 1}</span>
                  <span className="text-sm font-bold text-purple-300">{Math.round(userData.progressPercent)}%</span>
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-700/60 rounded-full h-3 backdrop-blur-sm">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-400 h-3 rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${userData.progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                    </motion.div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-medium">{userData.currentLevelZAPs.toLocaleString()} ZAPs</span>
                  <span className="font-medium text-purple-300">+{zapsNeededForNextLevel.toLocaleString()} to level up</span>
                </div>
              </div>

              {/* ZAP Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                    </div>
                    <span className="text-xs font-medium text-amber-200/90">Total ZAPs</span>
                  </div>
                  <span className="text-xl font-bold text-white">{userData.currentZAPs.toLocaleString()}</span>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <span className="text-xs font-medium text-green-200/90">Daily ZAPs</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-bold text-white">{userData.dailyZAPs}</span>
                    <span className="text-xs text-green-300">/{dailyZapsCap}</span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, dailyProgress)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-gray-400">Streak</span>
                  </div>
                  <span className="text-sm font-bold text-blue-300">{userData.currentStreak}</span>
                </div>

                <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <BarChart3 className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-gray-400">Videos</span>
                  </div>
                  <span className="text-sm font-bold text-purple-300">{userData.lifetimeStats.totalVideosCompleted}</span>
                </div>

                <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-pink-400" />
                    <span className="text-xs text-gray-400">Today</span>
                  </div>
                  <span className="text-sm font-bold text-pink-300">{userData.dailyVideosWatched}</span>
                </div>
              </div>

              {/* Watch Goal */}
              {watchGoalRemaining > 0 ? (
                <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-purple-300" fill="currentColor" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-200 mb-1">
                        Watch {watchGoalRemaining} more video{watchGoalRemaining !== 1 ? 's' : ''} today to max your ZAPs!
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-purple-900/30 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(userData.dailyVideosWatched / 3) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-purple-300 font-medium">{userData.dailyVideosWatched}/3</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-green-300" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-200 mb-0.5">Daily goal achieved!</p>
                      <p className="text-xs text-green-300">Keep watching to build your streak</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-700/60"></div>

              {/* Action Buttons */}
              <div className="space-y-1.5">
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700/40 rounded-xl transition-all duration-200 text-gray-200 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600/50 transition-colors">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-sm font-medium">Profile Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-700/40 rounded-xl transition-all duration-200 text-gray-200 group">
                  <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-gray-600/50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-sm font-medium">Preferences</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500/10 rounded-xl transition-all duration-200 text-red-400 group">
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

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};