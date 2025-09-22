import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  Copy,
  Check,
  Gift,
  Sparkles,
  Crown,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedIconTrigger } from './enhanced-icon-trigger';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';

interface User {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

interface EnhancedProfileDropdownProps {
  user: User;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onSignOut?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onCopyReferral?: () => void;
}

export const EnhancedProfileDropdown: React.FC<EnhancedProfileDropdownProps> = ({
  user,
  darkMode = false,
  onToggleDarkMode,
  onSignOut,
  onProfile,
  onSettings,
  onCopyReferral
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = async () => {
    if (onCopyReferral) {
      onCopyReferral();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get level badge color based on tier
  const getLevelBadgeColor = (level: number): string => {
    if (level >= 1 && level <= 4) return 'from-purple-500 to-purple-600';
    if (level >= 5 && level <= 6) return 'from-blue-500 to-blue-600';
    if (level >= 7 && level <= 9) return 'from-pink-500 to-pink-600';
    if (level === 10) return 'from-yellow-400 to-yellow-500';
    return 'from-gray-500 to-gray-600';
  };

  const levelBadgeColor = getLevelBadgeColor(user.level);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-300 group"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(248, 250, 252, 0.15) 100%)'
              : 'transparent',
            backdropFilter: isOpen ? 'blur(10px)' : 'none',
            border: isOpen ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Avatar with level ring */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden relative">
              {/* Animated progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                  fill="none"
                />
                <motion.circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="url(#progressGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: user.progressPercent / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    pathLength: user.progressPercent / 100,
                    strokeDasharray: 113, // 2π * 18
                    strokeDashoffset: 113 * (1 - user.progressPercent / 100)
                  }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Avatar image */}
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover absolute top-1 left-1"
              />
            </div>

            {/* Level badge */}
            <motion.div
              className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${levelBadgeColor} shadow-lg`}
              animate={isOpen ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {user.level}
            </motion.div>
          </div>

          {/* User info */}
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-white truncate max-w-24">
              {user.displayName}
            </span>
            <span className="text-xs text-white/70">
              {Math.floor(user.currentXP)} XP
            </span>
          </div>

          {/* Dropdown indicator */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white/80" />
          </motion.div>
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        variant="premium"
        className="w-80 max-w-[90vw]"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-1">
          {/* Hero Row */}
          <div className="px-1 py-4">
            <div className="flex items-center space-x-4">
              {/* Large avatar with animated progress ring */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden relative">
                  {/* Animated progress ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(156, 163, 175, 0.3)"
                      strokeWidth="3"
                      fill="none"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="url(#heroProgressGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: user.progressPercent / 100 }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.4))'
                      }}
                    />
                    <defs>
                      <linearGradient id="heroProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Avatar image */}
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full object-cover absolute top-2 left-2"
                  />
                </div>

                {/* Level badge with crown for high levels */}
                <motion.div
                  className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${levelBadgeColor} shadow-lg flex items-center gap-1`}
                  whileHover={{ scale: 1.1 }}
                >
                  {user.level >= 7 && <Crown className="w-3 h-3" />}
                  {user.level}
                </motion.div>
              </div>

              {/* User details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {user.displayName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {user.email}
                </p>

                {/* XP Progress */}
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">Level Progress</span>
                    <span className="text-xs text-gray-600">
                      {Math.round(user.progressPercent)}%
                    </span>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${levelBadgeColor} rounded-full relative overflow-hidden`}
                      initial={{ width: 0 }}
                      animate={{ width: `${user.progressPercent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '100%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Math.floor(user.currentXP)} XP</span>
                    <span>{Math.floor(user.xpForNextLevel)} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Menu Items */}
          <div className="space-y-1 px-1">
            <DropdownMenuItem
              variant="premium"
              onClick={onProfile}
              className="cursor-pointer"
            >
              <User className="w-4 h-4 mr-3 text-gray-600" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="premium"
              onClick={onSettings}
              className="cursor-pointer"
            >
              <Settings className="w-4 h-4 mr-3 text-gray-600" />
              <span>Settings</span>
            </DropdownMenuItem>


            <DropdownMenuItem
              variant="premium"
              onClick={handleCopyReferral}
              className="cursor-pointer"
            >
              <Gift className="w-4 h-4 mr-3 text-purple-600" />
              <span>Invite Friends</span>
              <div className="ml-auto">
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          {/* Sign Out */}
          <div className="px-1">
            <DropdownMenuItem
              variant="premium"
              onClick={onSignOut}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50/50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};