import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Sparkles,
  Crown,
  Gift,
  ExternalLink,
  Clock,
  Diamond,
  Zap,
  BookOpen,
  Users,
  Monitor,
  Star,
  UserCheck,
  Play,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LuxuryCircularIcon } from './luxury-circular-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
  status: 'available' | 'limited' | 'sold-out';
  timeRemaining?: string;
  gradient: string;
  category: 'all' | 'communities' | 'courses' | 'coaching' | 'digital-products';
  subtitle?: string;
  banner?: string;
  creator?: string;
  rating?: number;
  memberCount?: number;
  isVideo?: boolean;
}

interface ZAPRewardsDropdownProps {
  currentZAPS?: number;
  onRewardClick?: (rewardId: string) => void;
  onViewAllRewards?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ZAPRewardsDropdown: React.FC<ZAPRewardsDropdownProps> = ({
  currentZAPS = 850,
  onRewardClick,
  onViewAllRewards,
  isOpen,
  onOpenChange
}) => {
  const { theme } = useTheme();
  const navigate = useSafeNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const [hoveredReward, setHoveredReward] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'communities' | 'courses' | 'coaching' | 'digital-products'>('all');

  // Use controlled or uncontrolled state
  const dropdownOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setDropdownOpen = onOpenChange || setInternalOpen;

  // Premium marketplace items
  const marketplaceItems: MarketplaceItem[] = [
    {
      id: 'wiz-communities-premium',
      name: 'WIZ Communities',
      subtitle: 'Premium Access',
      description: 'Connect with exclusive mastermind groups and industry leaders',
      cost: 1200,
      icon: <Users className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-blue-400 via-purple-500 to-pink-500',
      category: 'communities'
    },
    {
      id: 'ai-coaching-sessions',
      name: 'AI Coaching Sessions',
      subtitle: '1-on-1 Personalized',
      description: 'Advanced AI-powered coaching with industry experts',
      cost: 800,
      icon: <BookOpen className="w-5 h-5" />,
      status: 'limited',
      timeRemaining: '12h',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      category: 'coaching'
    },
    {
      id: 'digital-course-bundle',
      name: 'Digital Course Bundle',
      subtitle: 'Complete Collection',
      description: 'Access to premium course library and exclusive content',
      cost: 500,
      icon: <Monitor className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      category: 'digital-products'
    },
    {
      id: 'xp-multiplier-boost',
      name: 'XP Multiplier Boost',
      subtitle: '3x XP for 48h',
      description: 'Triple your XP gains for the next 48 hours',
      cost: 300,
      icon: <Zap className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-yellow-400 via-orange-500 to-red-500',
      category: 'all'
    },
    {
      id: 'premium-mentorship',
      name: 'Premium Mentorship',
      subtitle: 'Elite Program',
      description: 'Monthly 1-on-1 sessions with top industry mentors',
      cost: 2000,
      icon: <Crown className="w-5 h-5" />,
      status: 'sold-out',
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      category: 'coaching'
    },
    {
      id: 'crypto-masterclass',
      name: 'Crypto Masterclass',
      subtitle: 'Advanced Trading',
      description: 'Learn advanced cryptocurrency trading strategies',
      cost: 600,
      icon: <Diamond className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-indigo-400 via-blue-500 to-purple-500',
      category: 'digital-products'
    }
  ];

  const tabs = [
    { id: 'all' as const, label: 'All', icon: Gift },
    { id: 'communities' as const, label: 'Communities', icon: Users },
    { id: 'coaching' as const, label: 'Coaching', icon: BookOpen },
    { id: 'digital-products' as const, label: 'Digital Products', icon: Monitor }
  ];

  const filteredItems = activeTab === 'all'
    ? marketplaceItems
    : marketplaceItems.filter(item => item.category === activeTab);

  const handleRewardClick = (reward: MarketplaceItem) => {
    if (reward.status === 'sold-out') return;
    onRewardClick?.(reward.id);
  };

  const handleViewAllRewards = () => {
    navigate('/claim');
    onViewAllRewards?.();
    setDropdownOpen(false);
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <LuxuryCircularIcon
            icon={ShoppingBag}
            isActive={dropdownOpen}
            variant="premium"
            size="md"
            hasNotification={marketplaceItems.some(item => item.status === 'limited')}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 max-w-[90vw] p-0 border-0"
        align="end"
        sideOffset={12}
        style={{
          background: theme === 'dark'
            ? 'rgba(17, 24, 39, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: theme === 'dark'
            ? '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="p-6"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={cn(
                "text-xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                XP Rewards
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* XP Balance Pill */}
              <motion.div
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 16px rgba(79, 70, 229, 0.3)'
                }}
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 4px 16px rgba(79, 70, 229, 0.3)',
                    '0 8px 24px rgba(79, 70, 229, 0.4)',
                    '0 4px 16px rgba(79, 70, 229, 0.3)'
                  ]
                }}
                transition={{
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Gem className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">
                  {(currentXP || 0).toLocaleString()}
                </span>
              </motion.div>

              {/* View All Link */}
              <motion.button
                onClick={handleViewAllRewards}
                className={cn(
                  "text-sm font-medium transition-colors",
                  theme === 'dark'
                    ? 'text-violet-400 hover:text-violet-300'
                    : 'text-violet-600 hover:text-violet-700'
                )}
                whileHover={{ x: 2 }}
              >
                View All
              </motion.button>
            </div>
          </div>

          {/* Tab Filters */}
          <div className="flex space-x-1 mb-6 p-1 rounded-xl" style={{
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : theme === 'dark'
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-800"
                )}
                whileHover={{ scale: activeTab !== tab.id ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Premium Marketplace Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleRewardClick(item)}
                  onMouseEnter={() => setHoveredReward(item.id)}
                  onMouseLeave={() => setHoveredReward(null)}
                  className={cn(
                    "relative p-4 rounded-xl transition-all duration-300 group text-left",
                    item.status === 'sold-out'
                      ? "cursor-not-allowed"
                      : "cursor-pointer",
                    theme === 'dark'
                      ? "bg-white/5 hover:bg-white/10 border border-white/10"
                      : "bg-white/30 hover:bg-white/50 border border-white/20"
                  )}
                  style={{
                    backdropFilter: 'blur(8px)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={item.status !== 'sold-out' ? {
                    scale: 1.02,
                    y: -4,
                    boxShadow: theme === 'dark'
                      ? '0 12px 24px rgba(139, 92, 246, 0.2)'
                      : '0 12px 24px rgba(139, 92, 246, 0.15)'
                  } : {}}
                  whileTap={item.status !== 'sold-out' ? { scale: 0.98 } : {}}
                >
                  {/* Glow Ring Effect */}
                  {hoveredReward === item.id && item.status !== 'sold-out' && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-xl",
                        `bg-gradient-to-r ${item.gradient}`
                      )}
                      style={{
                        filter: 'blur(12px)',
                        opacity: 0.3
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Sold Out Overlay */}
                  {item.status === 'sold-out' && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-10">
                      <span className="text-white font-bold text-xs uppercase tracking-wide">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  <div className="relative z-10">
                    {/* Item Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white",
                      item.status === 'sold-out'
                        ? "bg-gray-400"
                        : `bg-gradient-to-r ${item.gradient}`
                    )}>
                      {item.icon}
                    </div>

                    {/* Item Name & Subtitle */}
                    <h3 className={cn(
                      "text-sm font-bold mb-1",
                      item.status === 'sold-out'
                        ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.name}
                    </h3>

                    {item.subtitle && (
                      <p className={cn(
                        "text-xs font-medium mb-2",
                        item.status === 'sold-out'
                          ? theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
                          : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      )}>
                        {item.subtitle}
                      </p>
                    )}

                    {/* Cost Pill */}
                    <div className={cn(
                      "inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold",
                      item.status === 'sold-out'
                        ? "bg-gray-400/20 text-gray-500 border border-gray-400/20"
                        : theme === 'dark'
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                          : "bg-violet-100 text-violet-700 border border-violet-200"
                    )}>
                      <Gem className="w-3 h-3" />
                      <span>{item.cost}</span>
                    </div>

                    {/* Limited Time Indicator */}
                    {item.status === 'limited' && item.timeRemaining && (
                      <motion.div
                        className="flex items-center space-x-1 mt-2 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                          color: 'white'
                        }}
                        animate={{
                          boxShadow: [
                            '0 0 0 rgba(124, 58, 237, 0.4)',
                            '0 0 20px rgba(124, 58, 237, 0.6)',
                            '0 0 0 rgba(124, 58, 237, 0.4)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{item.timeRemaining} left</span>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer CTA */}
          <motion.button
            onClick={handleViewAllRewards}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl text-white font-bold transition-all duration-300 group"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)'
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 12px 32px rgba(124, 58, 237, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Visit Rewards Marketplace</span>
            <motion.div
              className="flex items-center"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <ExternalLink className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};