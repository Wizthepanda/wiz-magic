import { useState, useEffect, useRef } from 'react';
import { Search, Flame, Trophy, Target, Gift, Zap, Crown, Users, ChevronRight, X, ShoppingBag, TrendingUp, Sparkles, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { PremiumWatchExperience } from './PremiumWatchExperience';
import { LuxuryCircularIcon } from '@/components/ui/luxury-circular-icon';
import { LeaderboardDropdownV2 } from '@/components/ui/leaderboard-dropdown-v2';
import { ZAPRewardsDropdown } from '@/components/ui/zap-rewards-dropdown';
import { NotificationsDropdown } from '@/components/ui/notifications-dropdown';
import { XPRewardsDropdown } from '@/components/ui/xp-rewards-dropdown';
import { EnhancedProfileDropdown } from '@/components/ui/enhanced-profile-dropdown';
import { XPProfileDropdown } from '@/components/ui/xp-profile-dropdown';
import CommunityVideoHubV6 from './CommunityVideoHubV6';
import PremiumDashboardV8 from './PremiumDashboardV8';
import PremiumDashboardV9 from './PremiumDashboardV9';
import PremiumDashboardV10 from './PremiumDashboardV10';
import PremiumDashboardV11 from './PremiumDashboardV11';
import WIZUPDashboardV12_5 from './WIZUPDashboardV12_5';

// Ultra-Premium Design System with Enhanced Dark Mode
const premiumCard = "bg-white/20 dark:bg-dark-bg-secondary/95 backdrop-blur-md border border-white/30 dark:border-dark-surface-300 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-xl dark:shadow-dark-accent-purple/10";
const luxuryHover = "hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out hover:bg-white dark:hover:bg-dark-bg-elevated";
const cleanInput = "bg-white/15 dark:bg-dark-bg-tertiary/80 backdrop-blur-md border border-white/20 dark:border-dark-surface-300 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.04)]";
const auroraAccent = "bg-gradient-to-r from-blue-500 via-violet-500 to-amber-400 dark:from-dark-accent-blue dark:via-dark-accent-purple dark:to-dark-accent-orange";
const subtleGlass = "backdrop-blur-md bg-white/10 dark:bg-dark-bg-secondary/60 border border-white/25 dark:border-dark-surface-200";
const floatingCard = "bg-white dark:bg-dark-bg-secondary shadow-lg dark:shadow-xl dark:shadow-dark-accent-purple/10 border border-gray-100 dark:border-dark-surface-300 rounded-xl";

// Dynamic card styling based on theme
const getDynamicCardClass = (isDark: boolean) =>
  isDark
    ? "bg-dark-bg-secondary/95 backdrop-blur-sm border border-dark-surface-300 rounded-xl shadow-xl shadow-dark-accent-purple/10"
    : "bg-white/15 backdrop-blur-md border border-white/25 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.06)]";

const getDynamicInputClass = (isDark: boolean) =>
  isDark
    ? "bg-dark-bg-tertiary/80 backdrop-blur-sm border border-dark-surface-300 rounded-full shadow-sm text-dark-text-primary placeholder:text-dark-text-muted"
    : "bg-white/15 backdrop-blur-md border border-white/20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.04)]";

const getDynamicFloatingClass = (isDark: boolean) =>
  isDark
    ? "bg-dark-bg-secondary shadow-xl shadow-dark-accent-purple/10 border border-dark-surface-300 rounded-xl"
    : "bg-white shadow-lg border border-gray-100 rounded-xl";

interface ApplePremiumDashboardProps {
  className?: string;
  onSectionChange?: (section: string) => void;
}

export const ApplePremiumDashboard = ({ className, onSectionChange }: ApplePremiumDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [userLevel, setUserLevel] = useState(7);
  const [userZAPS, setUserZAPS] = useState(2450);
  const [nextLevelZAPS] = useState(3000);
  const [dailyStreak, setDailyStreak] = useState(12);
  const [showLeaderboardDrawer, setShowLeaderboardDrawer] = useState(false);
  const [showQuestsDrawer, setShowQuestsDrawer] = useState(false);
  const [showShopDrawer, setShowShopDrawer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [xpMilestones, setXpMilestones] = useState({ 25: false, 50: false, 75: false, 100: false });
  const [pendingXP, setPendingXP] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showRewardCeremony, setShowRewardCeremony] = useState(false);
  const [earnedVideoXP, setEarnedVideoXP] = useState(0);
  const [showXpProfileDropdown, setShowXpProfileDropdown] = useState(false);

  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { addXp } = useXp();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Refs
  const xpRingRef = useRef<HTMLDivElement>(null);

  const userName = user?.displayName || 'Champion';
  const progressPercent = (userZAPS / nextLevelZAPS) * 100;


  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);

    // Simulate video progress and XP earning for demo
    setTimeout(() => {
      setVideoProgress(25);
      handleXPMilestone(25);
    }, 2000);

    setTimeout(() => {
      setVideoProgress(50);
      handleXPMilestone(50);
    }, 4000);

    setTimeout(() => {
      setVideoProgress(75);
      handleXPMilestone(75);
    }, 6000);

    setTimeout(() => {
      setVideoProgress(100);
      handleXPMilestone(100);
      triggerRewardCeremony();
    }, 8000);
  };

  const handleVideoComplete = (video: any) => {
    console.log('Video completed:', video.title);
    // Add XP logic here
  };

  const handleContinueWatching = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
    setXpMilestones({ 25: false, 50: false, 75: false, 100: false });
    setPendingXP(0);
    setVideoProgress(0);
    setShowRewardCeremony(false);
    setEarnedVideoXP(0);
  };


  // Enhanced XP handling
  const handleXPMilestone = (milestone: number) => {
    if (!xpMilestones[milestone as keyof typeof xpMilestones]) {
      const milestoneXP = Math.floor((selectedVideo?.xpReward || 0) * (milestone / 100));
      setPendingXP(prev => prev + milestoneXP);
      setXpMilestones(prev => ({ ...prev, [milestone]: true }));

      // Trigger sparkle animation toward nav bar
      // This would be handled by the animation system
    }
  };

  const triggerRewardCeremony = () => {
    setEarnedVideoXP(selectedVideo?.xpReward || 0);
    setShowRewardCeremony(true);
    addXp(selectedVideo?.xpReward || 0);

    setTimeout(() => {
      setShowRewardCeremony(false);
    }, 3000);
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-500 ease-out",
      "bg-transparent",
      className
    )}>

      {/* Ultra-Premium Top Bar - Unified Left Baseline */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-transparent backdrop-blur-none"
      >
        <div className="flex items-center justify-between py-4 px-8 lg:px-10 xl:px-12">
          {/* Search Bar - Flush Left with Content Wrapper */}
          <div className="search-row w-full max-w-xl">
            <motion.div
              whileHover={{
                scale: 1.01,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              <div
                className={cn(
                  "relative rounded-full transition-all duration-300 overflow-hidden",
                  getDynamicInputClass(isDarkMode),
                  searchFocused && (isDarkMode ? "ring-1 ring-violet-400/30" : "ring-1 ring-blue-400/30")
                )}
                style={{
                  boxShadow: searchFocused
                    ? isDarkMode
                      ? `0 4px 20px rgba(139, 92, 246, 0.15),
                         inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                      : `0 4px 20px rgba(99, 102, 241, 0.15),
                         inset 0 1px 0 rgba(255, 255, 255, 0.4)`
                    : isDarkMode
                      ? `0 2px 10px rgba(0, 0, 0, 0.2),
                         inset 0 1px 0 rgba(255, 255, 255, 0.03)`
                      : `0 2px 10px rgba(0, 0, 0, 0.04),
                         inset 0 1px 0 rgba(255, 255, 255, 0.6)`
                }}
              >
                <div className={cn(
                  "flex items-center",
                  isMobile ? "px-4 py-2.5" : "px-5 py-3"
                )}>
                  <Search
                    size={18}
                    className={cn(
                      "flex-shrink-0 mr-3 transition-colors duration-300",
                      searchFocused
                        ? "text-slate-600"
                        : isDarkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                    )}
                    style={{ opacity: 0.7 }}
                  />

                  <input
                    type="text"
                    placeholder="Search videos, creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={cn(
                      "flex-1 bg-transparent outline-none transition-all duration-300",
                      isDarkMode
                        ? "text-white placeholder-slate-400"
                        : "text-slate-800 placeholder-slate-500",
                      "font-normal text-sm",
                      "placeholder:font-normal"
                    )}
                    style={{
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                    }}
                  />

                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery('')}
                        className={cn(
                          "ml-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                          "hover:bg-slate-200/20 text-slate-400 hover:text-slate-600"
                        )}
                      >
                        <X size={12} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Profile Elements - Within Screen Bounds */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Clean Icon Dropdowns - No Red Circles */}
            <div className="flex items-center gap-2">
              {/* Notifications Dropdown */}
              <NotificationsDropdown
                onMarkAsRead={(id) => console.log('Mark notification as read:', id)}
                onMarkAllAsRead={() => console.log('Mark all notifications as read')}
                onViewAll={() => console.log('View all notifications')}
              />

              {/* Leaderboard Dropdown */}
              <LeaderboardDropdownV2
                onViewFullLeaderboard={() => onSectionChange?.('leaderboard')}
              />

              {/* ZAP Rewards Dropdown */}
              <ZAPRewardsDropdown
                currentZAPS={userZAPS}
                onViewAllRewards={() => setShowShopDrawer(true)}
                onRewardClick={(id) => console.log('Purchase item:', id)}
              />
            </div>

            {/* Divider - Subtle */}
            <div
              className="w-px h-6 mx-2"
              style={{
                background: isDarkMode
                  ? 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.15), transparent)'
                  : 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.08), transparent)'
              }}
            />

            {/* Profile Avatar with Circular XP Progress */}
            <motion.div
              ref={xpRingRef}
              whileHover={{ scale: 1.02 }}
              className="relative cursor-pointer group"
              onClick={() => setShowXpProfileDropdown(!showXpProfileDropdown)}
            >
              {/* Circular XP Progress Ring */}
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                {/* Background Ring */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={isDarkMode ? "#374151" : "#E5E7EB"}
                  strokeWidth="3"
                  fill="none"
                  className="transition-colors duration-300"
                />
                {/* Dynamic XP Progress Ring */}
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#dynamicXpGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 1.76} 176`}
                  initial={{ strokeDasharray: "0 176" }}
                  animate={{ strokeDasharray: `${progressPercent * 1.76} 176` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="dynamicXpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={userLevel < 5 ? "#3B82F6" : userLevel < 10 ? "#8B5CF6" : "#F59E0B"} />
                    <stop offset="50%" stopColor={userLevel < 5 ? "#8B5CF6" : userLevel < 10 ? "#EC4899" : "#F97316"} />
                    <stop offset="100%" stopColor={userLevel < 5 ? "#EC4899" : userLevel < 10 ? "#F59E0B" : "#EF4444"} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Avatar */}
              <Avatar className="absolute inset-2 w-12 h-12 ring-2 ring-white/20 transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={user?.photoURL || `https://ui-avatars.com/api/?name=${userName}&background=8B5CF6&color=ffffff&size=128`} />
                <AvatarFallback className={cn(
                  "bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold",
                  "transition-all duration-300"
                )}>
                  {userName[0]}
                </AvatarFallback>
              </Avatar>

              {/* Level Badge */}
              <motion.div
                className={cn(
                  "absolute -bottom-1 -right-1 rounded-full px-2 py-1 text-xs font-bold transition-all duration-300",
                  isDarkMode
                    ? "bg-slate-800 text-white border border-slate-600"
                    : "bg-white text-gray-900 border border-gray-200",
                  "shadow-lg"
                )}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Lv.{userLevel}
              </motion.div>

              {/* XP Tooltip on Hover */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                whileHover={{ opacity: 1, y: -5, scale: 1 }}
                className={cn(
                  "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shadow-xl border transition-all duration-200",
                  isDarkMode
                    ? "bg-slate-800/95 text-white border-slate-700/50"
                    : "bg-white/95 text-gray-900 border-gray-200/50",
                  "backdrop-blur-lg pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100"
                )}
              >
                {userZAPS}/{nextLevelZAPS} ZAPs
                <div className={cn(
                  "absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45",
                  isDarkMode ? "bg-slate-800" : "bg-white"
                )} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard Content - Baseline Grid */}
      <main className="flex-1 transition-all duration-300 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          {/* WIZUP Dashboard V12.5 - Premium Final Version */}
          <WIZUPDashboardV12_5
            className="w-full"
          />
        </motion.div>
      </main>

      {/* Hidden Gamification Drawers */}

      {/* Leaderboard Drawer */}
      <AnimatePresence>
        {showLeaderboardDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowLeaderboardDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed right-0 top-0 h-full w-96 z-50 shadow-2xl border-l",
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700/50"
                  : "bg-white/95 border-gray-200/50",
                "backdrop-blur-xl"
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Trophy className={cn("w-6 h-6", isDarkMode ? "text-yellow-400" : "text-yellow-600")} />
                    <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                      Leaderboard
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLeaderboardDrawer(false)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                    )}
                  >
                    <X size={18} className={isDarkMode ? "text-slate-400" : "text-gray-600"} />
                  </motion.button>
                </div>

                {/* Leaderboard Content */}
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "CryptoKing", xp: 15420, avatar: "🥇" },
                    { rank: 2, name: "AIExpert", xp: 12890, avatar: "🥈" },
                    { rank: 3, name: "CodeMaster", xp: 11240, avatar: "🥉" },
                    { rank: 4, name: userName, xp: userZAPS, avatar: "👤", isUser: true },
                    { rank: 5, name: "TechGuru", xp: 9850, avatar: "🎯" }
                  ].map((player, index) => (
                    <motion.div
                      key={player.rank}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                        player.isUser
                          ? isDarkMode
                            ? "bg-blue-500/20 border border-blue-500/30"
                            : "bg-blue-50 border border-blue-200"
                          : isDarkMode
                            ? "bg-slate-800/60 hover:bg-slate-800/80"
                            : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          player.rank <= 3
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                            : isDarkMode ? "bg-slate-700 text-white" : "bg-gray-200 text-gray-900"
                        )}>
                          #{player.rank}
                        </div>
                        <div>
                          <p className={cn("font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
                            {player.name}
                          </p>
                          <p className={cn("text-sm", isDarkMode ? "text-slate-400" : "text-gray-600")}>
                            {player.xp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl">{player.avatar}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quests Drawer */}
      <AnimatePresence>
        {showQuestsDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowQuestsDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed right-0 top-0 h-full w-96 z-50 shadow-2xl border-l overflow-y-auto",
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700/50"
                  : "bg-white/95 border-gray-200/50",
                "backdrop-blur-xl"
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Target className={cn("w-6 h-6", isDarkMode ? "text-green-400" : "text-green-600")} />
                    <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                      Daily Quests
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowQuestsDrawer(false)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                    )}
                  >
                    <X size={18} className={isDarkMode ? "text-slate-400" : "text-gray-600"} />
                  </motion.button>
                </div>

                {/* Quests Content */}
                <div className="space-y-4">
                  {[
                    { title: "Watch 3 Videos", progress: 2, total: 3, xp: 50, icon: "🎥" },
                    { title: "Maintain Streak", progress: 1, total: 1, xp: 100, icon: "🔥", completed: true },
                    { title: "Learn Something New", progress: 0, total: 1, xp: 75, icon: "🎓" },
                    { title: "Share a Video", progress: 0, total: 2, xp: 25, icon: "📤" }
                  ].map((quest, index) => (
                    <motion.div
                      key={quest.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300",
                        quest.completed
                          ? isDarkMode
                            ? "bg-green-500/20 border-green-500/30"
                            : "bg-green-50 border-green-200"
                          : isDarkMode
                            ? "bg-slate-800/60 border-slate-700/50"
                            : "bg-gray-50 border-gray-200"
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="text-2xl">{quest.icon}</div>
                        <div className="flex-1">
                          <h4 className={cn("font-semibold mb-1", isDarkMode ? "text-white" : "text-gray-900")}>
                            {quest.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
                              {quest.progress}/{quest.total}
                            </span>
                            <Zap size={12} className="text-yellow-500" />
                            <span className="font-bold text-yellow-600">+{quest.xp} XP</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className={cn(
                        "h-2 rounded-full overflow-hidden",
                        isDarkMode ? "bg-slate-700" : "bg-gray-200"
                      )}>
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            quest.completed
                              ? "bg-gradient-to-r from-green-400 to-green-500"
                              : "bg-gradient-to-r from-blue-400 to-purple-500"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${(quest.progress / quest.total) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Shop Drawer */}
      <AnimatePresence>
        {showShopDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={() => setShowShopDrawer(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "fixed right-0 top-0 h-full w-96 z-50 shadow-2xl border-l overflow-y-auto",
                isDarkMode
                  ? "bg-slate-900/95 border-slate-700/50"
                  : "bg-white/95 border-gray-200/50",
                "backdrop-blur-xl"
              )}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Gift className={cn("w-6 h-6", isDarkMode ? "text-purple-400" : "text-purple-600")} />
                    <h2 className={cn("text-xl font-bold", isDarkMode ? "text-white" : "text-gray-900")}>
                      Rewards Shop
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowShopDrawer(false)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDarkMode ? "hover:bg-slate-800" : "hover:bg-gray-100"
                    )}
                  >
                    <X size={18} className={isDarkMode ? "text-slate-400" : "text-gray-600"} />
                  </motion.button>
                </div>

                {/* Shop Content */}
                <div className="space-y-4">
                  {[
                    { title: "Premium Course Access", price: 500, icon: "📚", available: true },
                    { title: "Custom Avatar Frame", price: 200, icon: "🖼️", available: true },
                    { title: "Exclusive Badge", price: 300, icon: "🎖️", available: false },
                    { title: "Priority Support", price: 150, icon: "🎧", available: true },
                    { title: "Special Effects", price: 400, icon: "✨", available: false }
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02]",
                        item.available
                          ? userZAPS >= item.price
                            ? isDarkMode
                              ? "bg-green-500/20 border-green-500/30 hover:bg-green-500/30"
                              : "bg-green-50 border-green-200 hover:bg-green-100"
                            : isDarkMode
                              ? "bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          : isDarkMode
                            ? "bg-slate-800/40 border-slate-700/30 opacity-60"
                            : "bg-gray-50 border-gray-200 opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{item.icon}</div>
                          <div>
                            <h4 className={cn(
                              "font-semibold",
                              isDarkMode ? "text-white" : "text-gray-900"
                            )}>
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1 text-sm">
                              <Crown size={12} className="text-yellow-500" />
                              <span className="font-bold text-yellow-600">{item.price} XP</span>
                            </div>
                          </div>
                        </div>
                        {item.available ? (
                          userZAPS >= item.price ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold"
                            >
                              Claim
                            </motion.button>
                          ) : (
                            <div className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              isDarkMode ? "bg-slate-700 text-slate-400" : "bg-gray-200 text-gray-600"
                            )}>
                              Need {item.price - userZAPS} ZAPs
                            </div>
                          )
                        ) : (
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            isDarkMode ? "bg-slate-700 text-slate-500" : "bg-gray-200 text-gray-500"
                          )}>
                            Coming Soon
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Full-Screen Watch Experience */}
      {selectedVideo && (
        <PremiumWatchExperience
          video={selectedVideo}
          isOpen={showVideoPlayer}
          onClose={handleContinueWatching}
          onComplete={handleVideoComplete}
          progress={videoProgress}
          isDarkMode={isDarkMode}
        />
      )}

      {/* XP Profile Dropdown */}
      <XPProfileDropdown
        isOpen={showXpProfileDropdown}
        onClose={() => setShowXpProfileDropdown(false)}
        triggerRef={xpRingRef}
        userZAPS={userZAPS}
        nextLevelZAPS={nextLevelZAPS}
        userLevel={userLevel}
        streakDays={dailyStreak}
        userName={userName}
      />

      {/* Dark Mode Toggle (Hidden but available for development) */}
      <motion.button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={cn(
          "fixed bottom-4 left-4 w-12 h-12 rounded-full transition-all duration-300 border shadow-lg backdrop-blur-lg",
          isDarkMode
            ? "bg-slate-800/80 border-slate-700/50 text-yellow-400"
            : "bg-white/80 border-gray-200/50 text-gray-600",
          "opacity-20 hover:opacity-100"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </motion.button>
    </div>
  );
};