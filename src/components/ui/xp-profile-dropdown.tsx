import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Share2, Settings, LogOut, Copy, Check, Link, Zap, Youtube, User, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLDivElement>;
  userXP: number;
  nextLevelXP: number;
  userLevel: number;
  streakDays: number;
  userName: string;
  userEmail?: string;
  dailyXP?: number;
  isYouTubeConnected?: boolean;
}

export const XPProfileDropdown: React.FC<XPProfileDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  userXP,
  nextLevelXP,
  userLevel,
  streakDays,
  userName,
  userEmail = "dean@wizxp.com",
  dailyXP = 45,
  isYouTubeConnected = true
}) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate progress percentage
  const progressPercent = (userXP / nextLevelXP) * 100;

  // Generate invite link
  const inviteLink = `https://wizxp.com/invite/${userName.toLowerCase()}`;

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
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 340 - 16)),
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
          className="fixed z-50 w-[340px] max-w-[calc(100vw-32px)]"
          style={{
            top: position.top,
            right: position.right,
            left: position.left
          }}
        >
          <div
            className="overflow-hidden rounded-2xl backdrop-blur-xl border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 40px rgba(139, 92, 246, 0.1)'
            }}
          >
            {/* HEADER */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar with gradient glow border */}
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full p-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Name and Email */}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {userName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {userEmail}
                    </p>
                  </div>
                </div>
                {/* Level Badge */}
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  Lv. {userLevel}
                </div>
              </div>
            </div>

            {/* XP PROGRESS */}
            <div className="px-6 pb-5">
              <h4 className="text-sm font-medium text-gray-300 mb-3">
                Progress to Level {userLevel + 1}
              </h4>
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 mr-4">
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
                        boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {userXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP · {Math.round(progressPercent)}% complete
                  </p>
                </div>
                {/* Mini XP counter pill */}
                <div
                  className="px-2 py-1 rounded-full text-xs font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  {userXP}
                </div>
              </div>
            </div>

            {/* DAILY XP & STREAK */}
            <div className="px-6 pb-5">
              <div className="grid grid-cols-2 gap-3">
                {/* Daily XP Box */}
                <div
                  className="p-3 rounded-xl border border-white/10 backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <p className="text-lg font-bold text-white">{dailyXP}</p>
                  <p className="text-xs text-gray-400">Daily XP</p>
                </div>
                {/* Day Streak Box */}
                <div
                  className="p-3 rounded-xl border border-white/10 backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)'
                      }}
                    >
                      <Flame className="w-2.5 h-2.5 text-white" />
                    </div>
                    <p className="text-lg font-bold text-white">{streakDays}</p>
                  </div>
                  <p className="text-xs text-gray-400">Day Streak</p>
                </div>
              </div>
            </div>

            {/* XP TASK REMINDER */}
            <div className="px-6 pb-5">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-400">
                    Watch 3 more videos today to max your XP!
                  </p>
                  <p className="text-xs text-gray-400">
                    +150 XP bonus if completed
                  </p>
                </div>
              </div>
            </div>

            {/* INVITE FRIENDS */}
            <div className="px-6 pb-5">
              <motion.div
                className="rounded-xl p-4 border"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderColor: 'rgba(139, 92, 246, 0.2)'
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.2)'
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                      }}
                    >
                      <Link className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Invite friends, earn +100 XP
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleCopyLink}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200",
                      linkCopied
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-white border border-transparent"
                    )}
                    style={{
                      background: linkCopied
                        ? undefined
                        : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: linkCopied ? undefined : '0 4px 16px rgba(139, 92, 246, 0.4)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-1.5">
                      {linkCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* CONNECTION STATUS */}
            <div className="px-6 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Youtube className="w-6 h-6 text-red-500" />
                  <span className="text-sm font-medium text-gray-300">YouTube</span>
                </div>
                <div
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold",
                    isYouTubeConnected
                      ? "text-emerald-400 border border-emerald-500/30"
                      : "text-red-400 border border-red-500/30"
                  )}
                  style={{
                    background: isYouTubeConnected
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    boxShadow: isYouTubeConnected
                      ? '0 0 10px rgba(16, 185, 129, 0.2)'
                      : '0 0 10px rgba(239, 68, 68, 0.2)'
                  }}
                >
                  {isYouTubeConnected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              className="mx-6 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
                boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)'
              }}
            />

            {/* ACTIONS */}
            <div className="p-4">
              <motion.button
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200"
                whileHover={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(8px)",
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-full bg-slate-700/50 flex items-center justify-center backdrop-blur-sm">
                  <User className="w-4.5 h-4.5 text-gray-300" />
                </div>
                <span className="text-sm font-semibold text-gray-200">Profile Settings</span>
              </motion.button>

              <motion.button
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 mt-1"
                whileHover={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(8px)",
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-full bg-slate-700/50 flex items-center justify-center backdrop-blur-sm">
                  <Sliders className="w-4.5 h-4.5 text-gray-300" />
                </div>
                <span className="text-sm font-semibold text-gray-200">Preferences</span>
              </motion.button>

              <motion.button
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 mt-1"
                whileHover={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  backdropFilter: "blur(8px)",
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center backdrop-blur-sm">
                  <LogOut className="w-4.5 h-4.5 text-red-400" />
                </div>
                <span className="text-sm font-semibold text-red-400">Sign Out</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};