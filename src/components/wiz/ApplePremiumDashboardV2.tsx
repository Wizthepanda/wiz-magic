import { useState, useEffect, useRef } from 'react';
import { Search, X, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import DiscoverPageV2Premium from './DiscoverPageV2Premium';

// Dynamic styling based on theme
const getDynamicInputClass = (isDark: boolean) =>
  isDark
    ? "bg-dark-bg-tertiary/80 backdrop-blur-sm border border-dark-surface-300 rounded-full shadow-sm text-dark-text-primary placeholder:text-dark-text-muted"
    : "bg-white/80 backdrop-blur-sm border border-gray-200/30 rounded-full shadow-sm";

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

  // Video handling functions
  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
    setVideoProgress(0);
    setPendingXP(0);
    setXpMilestones({ 25: false, 50: false, 75: false, 100: false });
  };

  const handleVideoComplete = (finalXP: number) => {
    setEarnedVideoXP(finalXP);
    setShowRewardCeremony(true);
    setUserZAPS(prev => prev + finalXP);
    addXp(finalXP);

    setTimeout(() => {
      setShowRewardCeremony(false);
      setShowVideoPlayer(false);
      setSelectedVideo(null);
    }, 3000);
  };

  const handleContinueWatching = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
    setXpMilestones({ 25: false, 50: false, 75: false, 100: false });
  };

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden transition-all duration-500",
      isDarkMode
        ? "bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950"
        : "bg-gradient-to-br from-slate-50 via-white to-violet-50",
      className
    )}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn(
          "sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300",
          isDarkMode
            ? "bg-slate-900/90 border-slate-700/30"
            : "bg-white/90 border-gray-200/30"
        )}
      >
        <div className={cn(
          "flex items-center justify-between transition-all duration-300",
          isMobile ? "px-4 py-3" : "px-6 py-4"
        )}>
          {/* Left: Search */}
          <div className="flex-1 max-w-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative"
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

          {/* Right: Premium Luxury Dropdowns + Profile Avatar */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Premium Luxury Dropdown Icons */}
            <div className="flex items-center gap-3">
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
                onClaimReward={(reward) => console.log('Claim reward:', reward)}
                onViewAllRewards={() => onSectionChange?.('claim')}
              />
            </div>

            {/* Premium Profile with XP Ring */}
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
              ref={xpRingRef}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <LuxuryCircularIcon
                  progress={progressPercent}
                  icon={
                    <Avatar className={cn(
                      "transition-all duration-300",
                      isMobile ? "w-9 h-9" : "w-10 h-10"
                    )}>
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback className="font-semibold text-xs bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        {userName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  }
                  size={isMobile ? 48 : 52}
                  strokeWidth={3}
                  onClick={() => setShowXpProfileDropdown(true)}
                  className={cn(
                    "transition-all duration-300 hover:shadow-lg",
                    isDarkMode ? "bg-slate-800" : "bg-white"
                  )}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Area - Discover Page V2 */}
      <DiscoverPageV2Premium
        userZAPS={userZAPS}
        dailyStreak={dailyStreak}
        onVideoSelect={handleWatchVideo}
        onRewardsClick={() => onSectionChange?.('claim')}
      />

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
    </div>
  );
};