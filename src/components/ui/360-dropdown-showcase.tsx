import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Trophy, ShoppingBag, Bell, User, Sparkles,
  Crown, Gem, Star, Settings, BarChart3
} from 'lucide-react';
import { NotificationsDropdown } from './notifications-dropdown';
import { EnhancedProfileDropdown } from './enhanced-profile-dropdown';
import { XPRewardsDropdown } from './xp-rewards-dropdown';
import { LeaderboardDropdown } from './leaderboard-dropdown';
import { XPShopDropdown } from './xp-shop-dropdown';
import { LuxuryCircularIcon } from './luxury-circular-icon';
import { FullLeaderboardPage } from './full-leaderboard-page';
import { FullXPShopPage } from './full-xp-shop-page';

interface Showcase360Props {
  className?: string;
}

export const Showcase360: React.FC<Showcase360Props> = ({ className }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'header' | 'leaderboard' | 'shop'>('header');

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

  const features = [
    {
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      title: "Luxury Circular Icons",
      description: "Frosted glass containers with gradient halos and micro progress rings"
    },
    {
      icon: <Bell className="w-6 h-6 text-blue-500" />,
      title: "Smart Notifications",
      description: "Elegant cards with XP chips, timestamps, and batch actions"
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-600" />,
      title: "Futuristic Leaderboards",
      description: "Game lobby aesthetics with animated rankings and XP rings"
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-purple-500" />,
      title: "Premium XP Shop",
      description: "Fortnite-style grid with rarity effects and scarcity mechanics"
    },
    {
      icon: <User className="w-6 h-6 text-indigo-500" />,
      title: "Hero Profile Dropdowns",
      description: "Animated progress rings, level badges, and gradient shimmer"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-pink-500" />,
      title: "Magical Animations",
      description: "Spring physics, magnetic collapse, and aurora effects"
    }
  ];

  const iconDemoItems = [
    { icon: Bell, label: "Notifications", hasNotification: true, count: 3 },
    { icon: Trophy, label: "Leaderboard", progressPercent: 65 },
    { icon: ShoppingBag, label: "Shop", hasNotification: true },
    { icon: Star, label: "Achievements", progressPercent: 85 },
    { icon: Settings, label: "Settings", variant: "aurora" as const },
    { icon: BarChart3, label: "Analytics", progressPercent: 40 }
  ];

  return (
    <div className={`${className} ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen transition-all duration-500" style={{
        background: darkMode
          ? `
            radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 100%)
          `
          : `
            radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)
          `
      }}>

        {/* Navigation Header */}
        <AnimatePresence mode="wait">
          {currentView === 'header' && (
            <motion.div
              key="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Frosted Header Bar */}
              <div
                className="sticky top-0 z-50"
                style={{
                  background: darkMode
                    ? 'rgba(15, 23, 42, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px) saturate(150%)',
                  borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}
              >
                <div className="container mx-auto px-6 py-4">
                  <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                      className="flex items-center space-x-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">W</span>
                      </div>
                      <div>
                        <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          360° Dropdown System
                        </h1>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Luxury UI Components
                        </p>
                      </div>
                    </motion.div>

                    {/* Icon Navigation */}
                    <div className="flex items-center space-x-4">
                      {/* Theme Toggle */}
                      <LuxuryCircularIcon
                        icon={darkMode ? Sun : Moon}
                        variant="premium"
                        onClick={() => setDarkMode(!darkMode)}
                      />

                      {/* Notifications Dropdown */}
                      <NotificationsDropdown
                        onMarkAsRead={(id) => console.log('Mark as read:', id)}
                        onMarkAllAsRead={() => console.log('Mark all as read')}
                        onViewAll={() => console.log('View all notifications')}
                      />

                      {/* Leaderboard Dropdown */}
                      <LeaderboardDropdown
                        onViewFullLeaderboard={() => setCurrentView('leaderboard')}
                      />

                      {/* XP Shop Dropdown */}
                      <XPShopDropdown
                        userXP={mockUser.currentXP}
                        onVisitShop={() => setCurrentView('shop')}
                      />

                      {/* XP Rewards Dropdown */}
                      <XPRewardsDropdown
                        totalXP={mockUser.currentXP}
                        dailyXP={180}
                        onClaimReward={(id) => console.log('Claim reward:', id)}
                        onGoToXPStore={() => setCurrentView('shop')}
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

              {/* Hero Section */}
              <div className="container mx-auto px-6 py-16">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className={`text-5xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Next-Generation Dropdowns
                  </h2>
                  <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Luxury Apple-inspired UI with premium micro-interactions
                  </p>

                  {/* View Switcher */}
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      onClick={() => setCurrentView('leaderboard')}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trophy className="w-5 h-5 mr-2 inline" />
                      View Leaderboard
                    </motion.button>
                    <motion.button
                      onClick={() => setCurrentView('shop')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ShoppingBag className="w-5 h-5 mr-2 inline" />
                      Visit XP Shop
                    </motion.button>
                  </div>
                </motion.div>

                {/* Icon Demo Grid */}
                <motion.div
                  className="mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className={`text-2xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Luxury Circular Icons
                  </h3>
                  <div className="flex items-center justify-center gap-8 flex-wrap">
                    {iconDemoItems.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <LuxuryCircularIcon
                          icon={item.icon}
                          variant={item.variant || "premium"}
                          size="lg"
                          hasNotification={item.hasNotification}
                          notificationCount={item.count}
                          progressPercent={item.progressPercent}
                        />
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {item.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className={`text-2xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Design Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="p-6 rounded-2xl backdrop-blur-xl border shadow-lg"
                        style={{
                          background: darkMode
                            ? 'rgba(30, 41, 59, 0.3)'
                            : 'rgba(255, 255, 255, 0.3)',
                          borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                      >
                        <div className="mb-4">
                          {feature.icon}
                        </div>
                        <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {feature.title}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Full Leaderboard Page */}
          {currentView === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <button
                onClick={() => setCurrentView('header')}
                className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  darkMode
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-black/10 text-gray-900 border border-black/20'
                } backdrop-blur-xl hover:scale-105`}
              >
                ← Back to Overview
              </button>
              <FullLeaderboardPage />
            </motion.div>
          )}

          {/* Full XP Shop Page */}
          {currentView === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
            >
              <button
                onClick={() => setCurrentView('header')}
                className="fixed top-4 left-4 z-50 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg font-medium transition-all duration-200 backdrop-blur-xl hover:scale-105"
              >
                ← Back to Overview
              </button>
              <FullXPShopPage userXP={mockUser.currentXP} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};