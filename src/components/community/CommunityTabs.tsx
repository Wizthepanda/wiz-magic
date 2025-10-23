import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Trophy, Info, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'community' | 'courses' | 'leaderboard' | 'about' | 'rewards';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CommunityTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: Tab[] = [
  { id: 'community', label: 'Community', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'about', label: 'About', icon: Info },
  { id: 'rewards', label: 'Rewards', icon: Gift },
];

/**
 * Community Tabs Component
 * - Animated tab switching with Framer Motion
 * - Floating gradient underline
 * - Icons + labels
 * - Glassmorphism background
 */
export const CommunityTabs: React.FC<CommunityTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-2">
      <div className="flex items-center justify-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                isActive
                  ? 'text-purple-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              )}
            >
              {/* Icon */}
              <Icon className={cn('w-5 h-5', isActive && 'text-purple-600')} />

              {/* Label */}
              <span className="hidden sm:inline">{tab.label}</span>

              {/* Animated underline for active tab */}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg shadow-purple-500/50"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              {/* Glow effect on active tab */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 -z-10"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
