import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Gem, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProfileXPDropdownProps {
  userXP: number;
}

export const ProfileXPDropdown: React.FC<ProfileXPDropdownProps> = ({ userXP }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Mock user data - replace with actual user data
  const user = {
    name: "Alex Chen",
    avatar: "/api/placeholder/40/40",
    level: 7,
    currentXP: userXP,
    nextLevelXP: 500,
    availableForClaims: userXP
  };

  const progressToNextLevel = (user.currentXP % 100) / 100 * 100; // Mock calculation
  const xpNeededForNextLevel = user.nextLevelXP - user.currentXP;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-full transition-all duration-300"
        style={{
          background: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.7) 0%,
              rgba(248, 250, 252, 0.6) 100%
            )
          `,
          backdropFilter: 'blur(25px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: `
            0 4px 15px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
          `
        }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Profile Image */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-cyan-400 p-0.5">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover bg-white"
          />
        </div>

        {/* XP Badge */}
        <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold">
          <Gem className="w-3 h-3" />
          <span>{user.currentXP}</span>
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
            className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 255, 255, 0.9) 0%,
                  rgba(248, 250, 252, 0.85) 100%
                )
              `,
              backdropFilter: 'blur(25px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: `
                0 20px 50px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.5)
              `
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-cyan-400 p-0.5">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">Level {user.level}</p>
                </div>
              </div>

              {/* XP Balance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">XP Balance</span>
                  <div className="flex items-center space-x-1">
                    <Gem className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-lg text-gray-900">{user.currentXP} XP</span>
                  </div>
                </div>

                {/* Progress to Next Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Progress to Level {user.level + 1}</span>
                    <span>{xpNeededForNextLevel} XP needed</span>
                  </div>
                  <Progress
                    value={progressToNextLevel}
                    className="h-2"
                    style={{
                      background: 'rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </div>
              </div>

              {/* Available for Claims */}
              <div className="p-4 rounded-xl" style={{
                background: `
                  linear-gradient(135deg,
                    rgba(139, 92, 246, 0.1) 0%,
                    rgba(59, 130, 246, 0.08) 100%
                  )
                `,
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Available for Claims</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Gem className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-purple-700">{user.availableForClaims} XP</span>
                  </div>
                </div>
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