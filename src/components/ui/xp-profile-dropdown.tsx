import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Share2, Settings, LogOut, Copy, Check, ShoppingBag, Link } from 'lucide-react';
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
}

export const XPProfileDropdown: React.FC<XPProfileDropdownProps> = ({
  isOpen,
  onClose,
  triggerRef,
  userXP,
  nextLevelXP,
  userLevel,
  streakDays,
  userName
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
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{
            duration: 0.25,
            ease: [0.175, 0.885, 0.32, 1.1] // Spring easing for premium feel
          }}
          className="fixed z-50 w-[340px] max-w-[calc(100vw-32px)]"
          style={{
            top: position.top,
            right: position.right,
            left: position.left
          }}
        >
          <div
            className={cn(
              "bg-white/95 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden",
              "shadow-2xl"
            )}
            style={{
              boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
            }}
          >
            {/* HEADER — PROFILE & XP SNAPSHOT */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Profile avatar with gradient border glow */}
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full p-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-700">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Name + Level */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {userName} — Lv.{userLevel} Wizard
                    </h3>
                  </div>
                </div>
                {/* XP Badge Pill */}
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                  }}
                >
                  {userXP.toLocaleString()} XP
                </div>
              </div>
            </div>

            {/* XP PROGRESS — MINIMAL RING + BAR COMBO */}
            <div className="px-6 pb-5">
              <div className="flex items-center gap-4">
                {/* Mini progress ring */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      d="M18 3
                         a 15 15 0 0 1 0 30
                         a 15 15 0 0 1 0 -30"
                      fill="none"
                      stroke="rgb(229, 231, 235)"
                      strokeWidth="2"
                    />
                    {/* Progress circle */}
                    <motion.path
                      d="M18 3
                         a 15 15 0 0 1 0 30
                         a 15 15 0 0 1 0 -30"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0, 94.24" }}
                      animate={{ strokeDasharray: `${(progressPercent / 100) * 94.24}, 94.24` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{
                        stroke: 'url(#gradient-progress)'
                      }}
                    />
                    <defs>
                      <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>

                {/* Horizontal XP bar */}
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    {userXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP · {Math.round(progressPercent)}% to Level {userLevel + 1}
                  </p>
                </div>
              </div>
            </div>

            {/* STREAK STATUS — PREMIUM BADGE */}
            <div className="px-6 pb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)'
                  }}
                >
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {streakDays}-Day Streak Active
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    +50 XP bonus tomorrow
                  </p>
                </div>
              </div>
            </div>

            {/* INVITE FRIENDS — REWARD CARD */}
            <div className="px-6 pb-5">
              <motion.div
                className="relative rounded-xl p-4 border"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  borderColor: 'rgba(59, 130, 246, 0.2)'
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                      }}
                    >
                      <Link className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Invite friends, earn +100 XP
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleCopyLink}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200",
                      linkCopied
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-white"
                    )}
                    style={{
                      background: linkCopied
                        ? undefined
                        : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: linkCopied ? undefined : '0 4px 16px rgba(59, 130, 246, 0.4)'
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

            {/* Divider */}
            <div className="mx-6 h-px bg-gray-200/40" />

            {/* QUICK ACTIONS — CLEAN LIST */}
            <div className="p-4">
              <motion.button
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200"
                whileHover={{
                  backgroundColor: "rgba(249, 250, 251, 0.8)",
                  backdropFilter: "blur(8px)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <Settings className="w-4.5 h-4.5 text-gray-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Settings</span>
              </motion.button>

              <motion.button
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 mt-1"
                whileHover={{
                  backgroundColor: "rgba(249, 250, 251, 0.8)",
                  backdropFilter: "blur(8px)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">XP Shop</span>
              </motion.button>

              <motion.button
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 mt-1"
                whileHover={{
                  backgroundColor: "rgba(254, 242, 242, 0.8)",
                  backdropFilter: "blur(8px)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="w-4.5 h-4.5 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-red-700">Logout</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};