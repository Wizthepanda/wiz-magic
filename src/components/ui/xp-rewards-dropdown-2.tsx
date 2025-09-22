import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ExternalLink,
  Crown,
  Users,
  BookOpen,
  Zap,
  Star,
  Gem,
  Play,
  Lock,
  TrendingUp,
  MessageCircle,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';

interface PremiumAccess {
  id: string;
  title: string;
  creator: string;
  type: 'community' | 'coaching' | 'digital-product';
  price: number;
  rating: number;
  members: number;
  imageUrl?: string;
  videoUrl?: string;
  status: 'available' | 'sold-out' | 'limited';
  description: string;
  gradient: string;
}

interface XPRewardsDropdown2Props {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const XPRewardsDropdown2: React.FC<XPRewardsDropdown2Props> = ({
  isOpen = false,
  onOpenChange
}) => {
  const { theme } = useTheme();
  const navigate = useSafeNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'communities' | 'coaching' | 'digital-products'>('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Premium access data
  const premiumAccess: PremiumAccess[] = [
    {
      id: 'ai-mastery-community',
      title: 'AI Mastery Community',
      creator: 'TechGuru',
      type: 'community',
      price: 1200,
      rating: 4.9,
      members: 247,
      imageUrl: '/api/placeholder/400/225',
      status: 'available',
      description: 'Join 200+ learners mastering AI tools and techniques',
      gradient: 'from-blue-500 via-purple-500 to-pink-500'
    },
    {
      id: 'personal-coaching',
      title: 'Personal Coaching Sessions',
      creator: 'CoachPro',
      type: 'coaching',
      price: 2500,
      rating: 5.0,
      members: 89,
      imageUrl: '/api/placeholder/400/225',
      status: 'limited',
      description: '1:1 sessions with industry experts',
      gradient: 'from-orange-500 via-red-500 to-pink-500'
    },
    {
      id: 'crypto-guide',
      title: 'Crypto for Beginners Guide',
      creator: 'CryptoExpert',
      type: 'digital-product',
      price: 800,
      rating: 4.7,
      members: 156,
      imageUrl: '/api/placeholder/400/225',
      status: 'available',
      description: 'Complete digital guide to cryptocurrency trading',
      gradient: 'from-green-500 via-emerald-500 to-teal-500'
    },
    {
      id: 'design-masterclass',
      title: 'Design Systems Masterclass',
      creator: 'DesignPro',
      type: 'digital-product',
      price: 1500,
      rating: 4.8,
      members: 134,
      imageUrl: '/api/placeholder/400/225',
      status: 'sold-out',
      description: 'Learn scalable design system principles',
      gradient: 'from-purple-500 via-indigo-500 to-blue-500'
    },
    {
      id: 'startup-community',
      title: 'Startup Founders Circle',
      creator: 'EntrepreneurHub',
      type: 'community',
      price: 2000,
      rating: 4.9,
      members: 78,
      imageUrl: '/api/placeholder/400/225',
      status: 'available',
      description: 'Exclusive network for startup founders',
      gradient: 'from-yellow-500 via-orange-500 to-red-500'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All', icon: ShoppingBag },
    { id: 'communities', label: 'Communities', icon: Users },
    { id: 'coaching', label: 'Coaching', icon: MessageCircle },
    { id: 'digital-products', label: 'Digital Products', icon: FileText }
  ];

  const filteredAccess = activeTab === 'all'
    ? premiumAccess
    : premiumAccess.filter(item =>
        activeTab === 'communities' ? item.type === 'community' :
        activeTab === 'coaching' ? item.type === 'coaching' :
        activeTab === 'digital-products' ? item.type === 'digital-product' :
        true
      );

  const displayedAccess = filteredAccess.slice(0, 3); // Show only 3 cards

  const handleViewAll = () => {
    navigate('/claim');
    onOpenChange?.(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'community': return <Users className="w-4 h-4" />;
      case 'coaching': return <MessageCircle className="w-4 h-4" />;
      case 'digital-product': return <FileText className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'community': return 'from-blue-500 to-purple-500';
      case 'coaching': return 'from-green-500 to-emerald-500';
      case 'digital-product': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <motion.button
          className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 group",
            theme === 'dark'
              ? "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
              : "bg-gray-100/50 hover:bg-gray-200/60 text-gray-600 hover:text-gray-900"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />

          {/* Subtle glow effect when active */}
          {isOpen && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20"
              style={{ filter: 'blur(8px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[420px] max-w-[90vw] p-0 border-0 md:w-[420px]"
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
            : '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          maxHeight: '540px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col h-full"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/10 dark:border-gray-700/10">
            <div>
              <h2 className={cn(
                "text-xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                XP Rewards
              </h2>
              <p className={cn(
                "text-sm mt-1",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                Discover premium access
              </p>
            </div>

            <motion.button
              onClick={handleViewAll}
              className={cn(
                "text-sm font-medium transition-colors flex items-center space-x-1",
                theme === 'dark'
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-indigo-600 hover:text-indigo-700'
              )}
              whileHover={{ x: 2 }}
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </motion.button>
          </div>

          {/* Tab Filters */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : theme === 'dark'
                          ? "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                          : "bg-gray-100/50 hover:bg-gray-200/60 text-gray-600 hover:text-gray-900"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Featured Grid */}
          <div className="flex-1 px-6 py-2 overflow-y-auto">
            <div className="space-y-3">
              {displayedAccess.map((access, index) => (
                <motion.div
                  key={access.id}
                  onMouseEnter={() => setHoveredCard(access.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={cn(
                    "relative p-4 rounded-xl transition-all duration-300 cursor-pointer group",
                    access.status === 'sold-out'
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
                  whileHover={access.status !== 'sold-out' ? {
                    scale: 1.02,
                    y: -4,
                    boxShadow: theme === 'dark'
                      ? '0 12px 24px rgba(79, 70, 229, 0.2)'
                      : '0 12px 24px rgba(79, 70, 229, 0.15)'
                  } : {}}
                >
                  {/* Glow Effect */}
                  {hoveredCard === access.id && access.status !== 'sold-out' && (
                    <motion.div
                      className={cn(
                        "absolute inset-0 rounded-xl opacity-30",
                        `bg-gradient-to-r ${access.gradient}`
                      )}
                      style={{ filter: 'blur(12px)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Sold Out Overlay */}
                  {access.status === 'sold-out' && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center z-10 backdrop-blur-sm">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-white/80 mx-auto mb-2" />
                        <span className="text-white font-bold text-sm uppercase tracking-wide">
                          SOLD OUT
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex space-x-4">
                    {/* Banner/Thumbnail */}
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 relative">
                      {access.videoUrl ? (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className={cn(
                          "w-full h-full flex items-center justify-center",
                          `bg-gradient-to-br ${access.gradient}`
                        )}>
                          {getTypeIcon(access.type)}
                        </div>
                      )}

                      {/* Type indicator */}
                      <div className={cn(
                        "absolute top-1 right-1 w-2 h-2 rounded-full",
                        `bg-gradient-to-r ${getTypeColor(access.type)}`
                      )} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "text-sm font-bold mb-1 truncate",
                        access.status === 'sold-out'
                          ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {access.title}
                      </h3>

                      {/* Creator pill */}
                      <div className={cn(
                        "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium mb-2",
                        access.status === 'sold-out'
                          ? "bg-gray-400/20 text-gray-500"
                          : theme === 'dark'
                            ? "bg-white/10 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                      )}>
                        {access.creator}
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className={cn(
                            "w-3 h-3",
                            access.status === 'sold-out' ? 'text-gray-500' : 'text-yellow-500'
                          )} fill="currentColor" />
                          <span className={cn(
                            "text-xs font-medium",
                            access.status === 'sold-out'
                              ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                              : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          )}>
                            {access.rating}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Users className={cn(
                            "w-3 h-3",
                            access.status === 'sold-out'
                              ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          )} />
                          <span className={cn(
                            "text-xs",
                            access.status === 'sold-out'
                              ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                              : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          )}>
                            {access.members} members
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className={cn(
                          "flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold",
                          access.status === 'sold-out'
                            ? "bg-gray-400/20 text-gray-500 border border-gray-400/20"
                            : theme === 'dark'
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                              : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        )}>
                          <Gem className="w-3 h-3" />
                          <span>{access.price}</span>
                        </div>

                        {access.status === 'limited' && (
                          <motion.div
                            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white"
                            animate={{
                              boxShadow: [
                                '0 0 0 rgba(249, 115, 22, 0.4)',
                                '0 0 20px rgba(249, 115, 22, 0.6)',
                                '0 0 0 rgba(249, 115, 22, 0.4)'
                              ]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>Limited</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 border-t border-gray-200/10 dark:border-gray-700/10">
            <motion.button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl text-white font-bold transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)'
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 12px 32px rgba(79, 70, 229, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Explore Full Marketplace</span>
              <motion.div
                className="flex items-center"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};