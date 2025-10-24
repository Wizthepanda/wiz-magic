import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Youtube, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreationHubV2 } from './CreationHubV2';
import { PublishedCreationsManagerV2 } from './PublishedCreationsManagerV2';

type StudioTab = 'creation' | 'youtube' | 'published';

/**
 * Creator Studio - World-Class Redesign
 *
 * Features:
 * - Premium glassmorphic navigation pills with glow effects
 * - Animated gradient hero section
 * - Smooth tab transitions with AnimatePresence
 * - Responsive layout optimized for all devices
 * - Maintains WIZUP brand palette (purples, pinks, whites)
 */
export const CreatorStudio: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<StudioTab>('creation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Panel with Animated Gradient Border */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Animated Gradient Underline */}
          <div className="relative pb-6 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Creator Studio
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Your all-in-one command center — powered by ZAPs.
            </p>

            {/* Animated Gradient Border */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: '100%',
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                width: { duration: 0.8, ease: 'easeOut' },
                backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
              }}
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>

          {/* Navigation Pills */}
          <div className={cn(
            "flex gap-3",
            isMobile ? "overflow-x-auto scrollbar-hide pb-2" : ""
          )}>
            <NavigationPill
              icon={Sparkles}
              label="Creation Hub"
              isActive={activeTab === 'creation'}
              onClick={() => setActiveTab('creation')}
            />
            <NavigationPill
              icon={Youtube}
              label="YouTube"
              isActive={activeTab === 'youtube'}
              onClick={() => setActiveTab('youtube')}
            />
            <NavigationPill
              icon={CheckCircle2}
              label="Published"
              isActive={activeTab === 'published'}
              onClick={() => setActiveTab('published')}
            />
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'creation' && (
            <motion.div
              key="creation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <CreationHubV2 />
            </motion.div>
          )}

          {activeTab === 'youtube' && (
            <motion.div
              key="youtube"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <YouTubeSection />
            </motion.div>
          )}

          {activeTab === 'published' && (
            <motion.div
              key="published"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <PublishedCreationsManagerV2 />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ========================================
// NAVIGATION PILL COMPONENT
// ========================================
interface NavigationPillProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavigationPill: React.FC<NavigationPillProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300",
        "flex items-center gap-2 whitespace-nowrap",
        isActive
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          : "bg-white/60 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
      )}
    >
      {/* Soft Glow Effect for Active Tab */}
      {isActive && (
        <motion.div
          layoutId="activeTabGlow"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-60"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <Icon
        className={cn(
          "w-4 h-4 relative z-10",
          isActive && "animate-pulse"
        )}
      />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};

// ========================================
// YOUTUBE SECTION (PLACEHOLDER)
// ========================================
const YouTubeSection: React.FC = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 p-12 text-center border border-gray-200/50"
      >
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 items-center justify-center shadow-2xl"
          >
            <Youtube className="w-12 h-12 text-white" />
          </motion.div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Connect Your YouTube Channel
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto">
              One click to connect. We'll auto-fetch your videos for easy publishing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatorStudio;
