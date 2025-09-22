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

  // Premium ZAP Rewards marketplace items
  const marketplaceItems: MarketplaceItem[] = [
    {
      id: 'ai-mastery-community',
      name: 'AI Mastery Community',
      subtitle: 'Join 200+ learners',
      description: 'Connect with AI enthusiasts and industry experts',
      cost: 1200,
      icon: <Users className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-blue-400 via-purple-500 to-pink-500',
      category: 'communities',
      banner: '/api/placeholder/300/160',
      creator: '@aiexpert',
      rating: 4.8,
      memberCount: 245,
      isVideo: false
    },
    {
      id: 'personal-coaching-xyz',
      name: 'Personal Coaching with XYZ',
      subtitle: '1-on-1 sessions',
      description: 'Personalized growth coaching with certified professionals',
      cost: 800,
      icon: <Award className="w-5 h-5" />,
      status: 'limited',
      timeRemaining: '8h',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      category: 'coaching',
      banner: '/api/placeholder/300/160',
      creator: '@coachxyz',
      rating: 4.9,
      memberCount: 89,
      isVideo: true
    },
    {
      id: 'crypto-beginners-guide',
      name: 'Crypto for Beginners',
      subtitle: 'Digital Guide',
      description: 'Complete guide to cryptocurrency trading and investing',
      cost: 500,
      icon: <BookOpen className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-orange-400 via-red-500 to-pink-500',
      category: 'digital-products',
      banner: '/api/placeholder/300/160',
      creator: '@cryptoguru',
      rating: 4.7,
      memberCount: 156,
      isVideo: false
    },
    {
      id: 'ai-revolution-course',
      name: 'AI Revolution: The Future is Here',
      subtitle: 'Premium Course',
      description: 'Explore cutting-edge AI developments and machine learning',
      cost: 900,
      icon: <Monitor className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-indigo-400 via-purple-500 to-pink-500',
      category: 'courses',
      banner: '/api/placeholder/300/160',
      creator: '@techguru',
      rating: 4.9,
      memberCount: 312,
      isVideo: true
    },
    {
      id: 'design-systems-course',
      name: 'Design Systems Deep Dive',
      subtitle: 'Advanced Course',
      description: 'Learn to build scalable and maintainable design systems',
      cost: 750,
      icon: <Sparkles className="w-5 h-5" />,
      status: 'available',
      gradient: 'from-pink-400 via-purple-500 to-indigo-500',
      category: 'courses',
      banner: '/api/placeholder/300/160',
      creator: '@designpro',
      rating: 4.8,
      memberCount: 198,
      isVideo: true
    },
    {
      id: 'elite-mentorship',
      name: 'Elite Mentorship Program',
      subtitle: 'Exclusive Access',
      description: 'Monthly sessions with industry leaders and top performers',
      cost: 2500,
      icon: <Crown className="w-5 h-5" />,
      status: 'sold-out',
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      category: 'coaching',
      banner: '/api/placeholder/300/160',
      creator: '@elitementor',
      rating: 5.0,
      memberCount: 45,
      isVideo: false
    }
  ];

  const tabs = [
    { id: 'all' as const, label: 'All', icon: Gift },
    { id: 'communities' as const, label: 'Communities', icon: Users },
    { id: 'courses' as const, label: 'Courses', icon: BookOpen },
    { id: 'coaching' as const, label: 'Coaching', icon: Award },
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
        className="w-[420px] max-w-[90vw] p-0 border-0"
        align="end"
        sideOffset={12}
        style={{
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.97)'
            : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(40px) saturate(200%)',
          border: theme === 'dark'
            ? '1px solid rgba(148, 163, 184, 0.1)'
            : '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '20px',
          boxShadow: theme === 'dark'
            ? '0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(148, 163, 184, 0.05), inset 0 1px 0 rgba(148, 163, 184, 0.1)'
            : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(203, 213, 225, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
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
            <div className="flex items-center space-x-3">
              <h2 className={cn(
                "text-xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                ⚡ ZAPs
              </h2>
              {/* ZAPS Balance Pill */}
              <motion.div
                className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}
                whileHover={{ scale: 1.05 }}
                animate={{
                  boxShadow: [
                    '0 4px 20px rgba(99, 102, 241, 0.4)',
                    '0 8px 30px rgba(139, 92, 246, 0.5)',
                    '0 4px 20px rgba(99, 102, 241, 0.4)'
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
                <Zap className="w-4 h-4 text-white" fill="white" />
                <span className="text-white font-bold text-sm">
                  {(currentZAPS || 0).toLocaleString()}
                </span>
              </motion.div>
            </div>

            <div className="flex items-center">
              {/* View All Link */}
              <motion.button
                onClick={handleViewAllRewards}
                className={cn(
                  "text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200",
                  theme === 'dark'
                    ? 'text-violet-400 hover:text-violet-300 hover:bg-violet-400/10'
                    : 'text-violet-600 hover:text-violet-700 hover:bg-violet-100'
                )}
                whileHover={{ x: 2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View All →
              </motion.button>
            </div>
          </div>

          {/* Tab Filters */}
          <div className="flex space-x-1 mb-6 p-1 rounded-xl overflow-x-auto scrollbar-hide" style={{
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-white shadow-lg"
                    : theme === 'dark'
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-800"
                )}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                } : {}}
                whileHover={{ scale: activeTab !== tab.id ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Premium Marketplace Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredItems.slice(0, 4).map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleRewardClick(item)}
                  onMouseEnter={() => setHoveredReward(item.id)}
                  onMouseLeave={() => setHoveredReward(null)}
                  className={cn(
                    "relative p-0 rounded-xl transition-all duration-300 group text-left overflow-hidden",
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
                      ? '0 20px 40px rgba(139, 92, 246, 0.3)'
                      : '0 20px 40px rgba(139, 92, 246, 0.25)'
                  } : {}}
                  whileTap={item.status !== 'sold-out' ? { scale: 0.98 } : {}}
                >
                  {/* Enhanced Glow Ring Effect */}
                  {hoveredReward === item.id && item.status !== 'sold-out' && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-xl",
                        `bg-gradient-to-r ${item.gradient}`
                      )}
                      style={{
                        filter: 'blur(20px)',
                        opacity: 0.4
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Banner/Thumbnail */}
                  <div className="relative h-24 overflow-hidden rounded-t-xl">
                    {item.banner && (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.banner})`,
                          background: `linear-gradient(135deg, ${item.gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ')[0]} 0%, ${item.gradient.split(' ').pop()} 100%)`
                        }}
                      />
                    )}

                    {/* Video Play Indicator */}
                    {item.isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-gray-800 ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {/* Limited Time Badge */}
                    {item.status === 'limited' && item.timeRemaining && (
                      <div className="absolute top-2 left-2">
                        <motion.div
                          className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-500 text-white"
                          animate={{
                            boxShadow: [
                              '0 0 0 rgba(239, 68, 68, 0.4)',
                              '0 0 15px rgba(239, 68, 68, 0.6)',
                              '0 0 0 rgba(239, 68, 68, 0.4)'
                            ]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{item.timeRemaining}</span>
                        </motion.div>
                      </div>
                    )}
                  </div>

                  {/* Sold Out Overlay */}
                  {item.status === 'sold-out' && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-10">
                      <span className="text-white font-bold text-sm uppercase tracking-wide">
                        SOLD OUT
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-4">
                    {/* Item Name & Creator */}
                    <h3 className={cn(
                      "text-sm font-bold mb-1 line-clamp-1",
                      item.status === 'sold-out'
                        ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {item.name}
                    </h3>

                    {item.creator && (
                      <p className={cn(
                        "text-xs mb-2",
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      )}>
                        by {item.creator}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <div className="flex items-center space-x-3">
                        {/* Rating */}
                        {item.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {item.rating}
                            </span>
                          </div>
                        )}

                        {/* Member Count */}
                        {item.memberCount && (
                          <div className="flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-green-400" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {item.memberCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ZAPS Cost Pill */}
                    <div className={cn(
                      "inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold",
                      item.status === 'sold-out'
                        ? "bg-gray-400/20 text-gray-500 border border-gray-400/20"
                        : "text-white border-0"
                    )}
                    style={item.status !== 'sold-out' ? {
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                    } : {}}
                    >
                      <Zap className="w-3 h-3" fill="currentColor" />
                      <span>{item.cost}</span>
                    </div>
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
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Explore ZAP Rewards</span>
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

// Export with backward compatibility
export const XPShopDropdown = ZAPRewardsDropdown;