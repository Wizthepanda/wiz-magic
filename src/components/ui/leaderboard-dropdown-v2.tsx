import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ExternalLink, Zap, Eye, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LuxuryCircularIcon } from './luxury-circular-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  metric: number;
  rank: number;
  category: 'creators' | 'viewers' | 'earners';
  metricType: 'zaps' | 'followers' | 'earnings';
}

interface LeaderboardDropdownV2Props {
  onViewFullLeaderboard?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const LeaderboardDropdownV2: React.FC<LeaderboardDropdownV2Props> = ({
  onViewFullLeaderboard,
  isOpen,
  onOpenChange
}) => {
  const { theme } = useTheme();
  const navigate = useSafeNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'creators' | 'viewers' | 'earners'>('creators');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  // Use controlled or uncontrolled state
  const dropdownOpen = isOpen !== undefined ? isOpen : internalOpen;
  const setDropdownOpen = onOpenChange || setInternalOpen;

  // Mock data for today's highlights
  const mockData: Record<string, LeaderboardUser[]> = {
    creators: [
      {
        id: '1',
        username: '@AIwizard',
        avatar: '/api/placeholder/40/40',
        metric: 2340,
        rank: 1,
        category: 'creators',
        metricType: 'zaps'
      },
      {
        id: '2',
        username: '@CryptoSensei',
        avatar: '/api/placeholder/40/40',
        metric: 1890,
        rank: 2,
        category: 'creators',
        metricType: 'zaps'
      },
      {
        id: '3',
        username: '@DesignNinja',
        avatar: '/api/placeholder/40/40',
        metric: 1200,
        rank: 3,
        category: 'creators',
        metricType: 'zaps'
      }
    ],
    viewers: [
      {
        id: '4',
        username: '@WatchMaster',
        avatar: '/api/placeholder/40/40',
        metric: 15600,
        rank: 1,
        category: 'viewers',
        metricType: 'zaps'
      },
      {
        id: '5',
        username: '@StreamFan',
        avatar: '/api/placeholder/40/40',
        metric: 12400,
        rank: 2,
        category: 'viewers',
        metricType: 'zaps'
      },
      {
        id: '6',
        username: '@ContentLover',
        avatar: '/api/placeholder/40/40',
        metric: 9800,
        rank: 3,
        category: 'viewers',
        metricType: 'zaps'
      }
    ],
    earners: [
      {
        id: '7',
        username: '@ProfitPro',
        avatar: '/api/placeholder/40/40',
        metric: 890,
        rank: 1,
        category: 'earners',
        metricType: 'earnings'
      },
      {
        id: '8',
        username: '@MoneyMaker',
        avatar: '/api/placeholder/40/40',
        metric: 750,
        rank: 2,
        category: 'earners',
        metricType: 'earnings'
      },
      {
        id: '9',
        username: '@CashKing',
        avatar: '/api/placeholder/40/40',
        metric: 620,
        rank: 3,
        category: 'earners',
        metricType: 'earnings'
      }
    ]
  };

  const tabs = [
    { id: 'creators' as const, label: 'Creators', icon: TrendingUp },
    { id: 'viewers' as const, label: 'Viewers', icon: Eye },
    { id: 'earners' as const, label: 'Earners', icon: DollarSign }
  ];

  const getRankEmoji = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const formatMetric = (user: LeaderboardUser): string => {
    if (user.metricType === 'earnings') {
      return `$${user.metric.toLocaleString()}`;
    }
    return `⚡ ${user.metric.toLocaleString()} ZAPs`;
  };

  const handleViewFullLeaderboard = () => {
    // Call the passed callback function (should set activeSection to 'leaderboard')
    onViewFullLeaderboard?.();
    setDropdownOpen(false);
  };

  const currentUsers = mockData[activeTab] || [];

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <LuxuryCircularIcon
            icon={Trophy}
            isActive={dropdownOpen}
            variant="aurora"
            size="md"
            hasNotification={true}
            progressPercent={75}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[400px] max-w-[90vw] p-0 border-0"
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
            <div>
              <h2 className={cn(
                "text-xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                🏆 Leaderboard
              </h2>
              <p className={cn(
                "text-sm mt-1",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                Today's Highlights
              </p>
            </div>

            <div className="flex items-center">
              <motion.button
                onClick={handleViewFullLeaderboard}
                className={cn(
                  "text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200",
                  theme === 'dark'
                    ? 'text-violet-400 hover:text-violet-300 hover:bg-violet-400/10'
                    : 'text-violet-600 hover:text-violet-700 hover:bg-violet-100'
                )}
                whileHover={{ x: 2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Full →
              </motion.button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 mb-6 p-1 rounded-xl overflow-x-auto scrollbar-hide" style={{
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap relative overflow-hidden",
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
                {/* Lightning glow animation for active tab */}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-blue-500/20 to-yellow-400/20"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}

                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Leaderboard Cards */}
          <div className="space-y-3 mb-6">
            <AnimatePresence mode="wait">
              {currentUsers.map((user, index) => (
                <motion.div
                  key={`${activeTab}-${user.id}`}
                  initial={{ opacity: 0, y: 20, x: -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  onMouseEnter={() => setHoveredUser(user.id)}
                  onMouseLeave={() => setHoveredUser(null)}
                  className={cn(
                    "relative p-4 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                    theme === 'dark'
                      ? "bg-white/5 hover:bg-white/10 border border-white/10"
                      : "bg-white/30 hover:bg-white/50 border border-white/20"
                  )}
                  style={{
                    backdropFilter: 'blur(8px)'
                  }}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    boxShadow: theme === 'dark'
                      ? '0 12px 24px rgba(139, 92, 246, 0.2)'
                      : '0 12px 24px rgba(139, 92, 246, 0.15)'
                  }}
                >
                  {/* Hover glow effect */}
                  {hoveredUser === user.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-violet-500/10 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Rank Badge */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getRankEmoji(user.rank)}</span>
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img
                            src={user.avatar || '/default-avatar.png'}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className={cn(
                          "font-bold text-sm",
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        )}>
                          {user.username}
                        </h3>
                      </div>
                    </div>

                    {/* Metric Pill */}
                    <motion.div
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{
                        background: user.metricType === 'earnings'
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%)',
                        boxShadow: user.metricType === 'earnings'
                          ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                          : '0 2px 8px rgba(59, 130, 246, 0.3)'
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {user.metricType === 'earnings' ? (
                        <DollarSign className="w-3 h-3" />
                      ) : (
                        <Zap className="w-3 h-3" fill="currentColor" />
                      )}
                      <span>{formatMetric(user)}</span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer CTA */}
          <motion.button
            onClick={handleViewFullLeaderboard}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl text-white font-bold transition-all duration-300 group relative overflow-hidden"
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
            {/* Premium glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <Trophy className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Explore Full Leaderboard</span>
            <motion.div
              className="flex items-center relative z-10"
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
export const LeaderboardDropdown = LeaderboardDropdownV2;