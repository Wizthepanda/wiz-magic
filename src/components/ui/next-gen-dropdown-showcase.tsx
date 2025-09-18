import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Palette } from 'lucide-react';
import { NotificationsDropdown } from './notifications-dropdown';
import { EnhancedProfileDropdown } from './enhanced-profile-dropdown';
import { XPRewardsDropdown } from './xp-rewards-dropdown';
import { EnhancedIconTrigger } from './enhanced-icon-trigger';

interface NextGenDropdownShowcaseProps {
  className?: string;
}

export const NextGenDropdownShowcase: React.FC<NextGenDropdownShowcaseProps> = ({
  className
}) => {
  const [darkMode, setDarkMode] = useState(false);

  // Mock user data
  const mockUser = {
    id: '1',
    displayName: 'Alex Chen',
    email: 'alex@wizxp.com',
    avatar: '/api/placeholder/40/40',
    level: 7,
    currentXP: 2450,
    xpForCurrentLevel: 2000,
    xpForNextLevel: 3000,
    progressPercent: 75
  };

  return (
    <div className={`${className} ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen transition-all duration-500" style={{
        background: darkMode
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        {/* Demo Header */}
        <div className="relative">
          {/* Background blur overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: darkMode
                ? 'rgba(30, 41, 59, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px) saturate(150%)',
            }}
          />

          <div className="relative z-10 px-6 py-4">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              {/* Logo/Title */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">W</span>
                </div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Next-Gen Dropdowns
                </h1>
              </div>

              {/* Dropdown Collection */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <EnhancedIconTrigger
                  icon={darkMode ? Sun : Moon}
                  variant="glass"
                  onClick={() => setDarkMode(!darkMode)}
                />

                {/* Notifications Dropdown */}
                <NotificationsDropdown
                  onMarkAsRead={(id) => console.log('Mark as read:', id)}
                  onMarkAllAsRead={() => console.log('Mark all as read')}
                  onViewAll={() => console.log('View all notifications')}
                />

                {/* XP Rewards Dropdown */}
                <XPRewardsDropdown
                  totalXP={mockUser.currentXP}
                  dailyXP={180}
                  onClaimReward={(id) => console.log('Claim reward:', id)}
                  onGoToXPStore={() => console.log('Go to XP store')}
                />

                {/* Enhanced Profile Dropdown */}
                <EnhancedProfileDropdown
                  user={mockUser}
                  darkMode={darkMode}
                  onToggleDarkMode={() => setDarkMode(!darkMode)}
                  onSignOut={() => console.log('Sign out')}
                  onProfile={() => console.log('Go to profile')}
                  onSettings={() => console.log('Go to settings')}
                  onCopyReferral={() => console.log('Copy referral')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <motion.div
                className="p-6 rounded-2xl border backdrop-blur-xl"
                style={{
                  background: darkMode
                    ? 'rgba(30, 41, 59, 0.3)'
                    : 'rgba(255, 255, 255, 0.3)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  🔔 Smart Notifications
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Elegant notification cards with XP chips, timestamps, and smooth animations. Includes unread indicators and batch actions.
                </p>
              </motion.div>

              {/* Feature Card 2 */}
              <motion.div
                className="p-6 rounded-2xl border backdrop-blur-xl"
                style={{
                  background: darkMode
                    ? 'rgba(30, 41, 59, 0.3)'
                    : 'rgba(255, 255, 255, 0.3)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  👤 Premium Profile
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Hero profile layout with animated XP progress rings, level badges with crown indicators, and frosted glass effects.
                </p>
              </motion.div>

              {/* Feature Card 3 */}
              <motion.div
                className="p-6 rounded-2xl border backdrop-blur-xl"
                style={{
                  background: darkMode
                    ? 'rgba(30, 41, 59, 0.3)'
                    : 'rgba(255, 255, 255, 0.3)',
                  borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  💎 XP Rewards Hub
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Gradient XP counters, stackable reward chips, and animated claim interactions with daily progress tracking.
                </p>
              </motion.div>
            </div>

            {/* Design Features */}
            <div className="mt-16">
              <h2 className={`text-2xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Design Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: '🎨', title: 'Frosted Glass', desc: 'Backdrop blur with subtle gradients' },
                  { icon: '✨', title: 'Smooth Animations', desc: 'Spring physics and micro-interactions' },
                  { icon: '🌙', title: 'Dark/Light Mode', desc: 'Adaptive color schemes' },
                  { icon: '💫', title: 'Glowing Effects', desc: 'Subtle shadows and highlights' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-4 rounded-xl"
                    style={{
                      background: darkMode
                        ? 'rgba(30, 41, 59, 0.2)'
                        : 'rgba(255, 255, 255, 0.2)',
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};