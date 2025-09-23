import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, Zap, Star, TrendingUp, Gift, ChevronRight, Flame, ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';

interface DiscoverPageV2PremiumProps {
  userZAPS: number;
  dailyStreak: number;
  onVideoSelect: (video: any) => void;
  onRewardsClick: () => void;
  className?: string;
}

const DiscoverPageV2Premium: React.FC<DiscoverPageV2PremiumProps> = ({
  userZAPS,
  dailyStreak,
  onVideoSelect,
  onRewardsClick,
  className
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Enhanced category pills - Apple-like clean look
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'ai', label: 'AI' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'health', label: 'Health' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'diy', label: 'DIY' },
    { id: 'music', label: 'Music' },
    { id: 'money', label: 'Money' },
    { id: 'tech', label: 'Tech' },
    { id: 'art', label: 'Art' },
    { id: 'self-improvement', label: 'Self-Improvement' }
  ];

  // Sample tutorial data with enhanced metadata - Premium formatting
  const tutorials = [
    {
      id: 1,
      title: "AI Revolution: The Future is Here",
      creator: "TechGuru",
      avatar: "🤖",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "8m",
      zaps: 85,
      category: "ai",
      trending: true,
      featured: false
    },
    {
      id: 2,
      title: "Crypto Trading Mastery Guide",
      creator: "CryptoExpert",
      avatar: "₿",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "12m",
      zaps: 120,
      category: "crypto",
      featured: true,
      trending: false
    },
    {
      id: 3,
      title: "Health Optimization Secrets",
      creator: "HealthPro",
      avatar: "💪",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "15m",
      zaps: 95,
      category: "health",
      trending: false,
      featured: false
    },
    {
      id: 4,
      title: "Gaming Strategy Masterclass",
      creator: "GameMaster",
      avatar: "🎮",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "18m",
      zaps: 110,
      category: "gaming",
      trending: true,
      featured: false
    },
    {
      id: 5,
      title: "DIY Home Projects Made Easy",
      creator: "DIYExpert",
      avatar: "🔨",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "11m",
      zaps: 75,
      category: "diy",
      trending: false,
      featured: false
    },
    {
      id: 6,
      title: "Music Production Fundamentals",
      creator: "MusicPro",
      avatar: "🎵",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "22m",
      zaps: 130,
      category: "music",
      trending: false,
      featured: false
    },
    {
      id: 7,
      title: "Investment Strategies for Beginners",
      creator: "MoneyWise",
      avatar: "💰",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "3m",
      zaps: 45,
      category: "money",
      trending: false,
      featured: false
    },
    {
      id: 8,
      title: "Advanced React Patterns",
      creator: "CodeMaster",
      avatar: "⚛️",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      duration: "25m",
      zaps: 200,
      category: "tech",
      trending: true,
      featured: false
    }
  ];

  // Filter tutorials based on active category
  const filteredTutorials = activeCategory === 'all'
    ? tutorials
    : tutorials.filter(tutorial => tutorial.category === activeCategory);

  // Trending tutorials for dynamic sections
  const trendingTutorials = tutorials.filter(tutorial => tutorial.trending);

  // Featured creator
  const featuredCreator = tutorials.find(tutorial => tutorial.featured);

  // Hero carousel content - Featured creators and trending
  const heroContent = [
    { type: 'featured', data: featuredCreator },
    ...trendingTutorials.map(tutorial => ({ type: 'trending', data: tutorial }))
  ].filter(item => item.data);

  // Rotating carousels
  useEffect(() => {
    if (trendingTutorials.length > 1) {
      const interval = setInterval(() => {
        setTrendingIndex((prev) => (prev + 1) % trendingTutorials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [trendingTutorials.length]);

  useEffect(() => {
    if (heroContent.length > 1) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % heroContent.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [heroContent.length]);

  return (
    <div className={cn(
      "flex-1 overflow-hidden",
      className
    )}>
      {/* Progress + Incentive Layer - Top Right Mini Strip */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "sticky top-0 z-30 backdrop-blur-xl border-b transition-all duration-300",
          isDarkMode
            ? "bg-slate-900/95 border-slate-700/20"
            : "bg-white/95 border-gray-200/20"
        )}
      >
        <div className="flex items-center justify-between px-6 py-2">
          {/* Left: Hero Banner (Desktop only) */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-blue-500" />
              <span className={cn(
                "text-sm font-medium tracking-tight",
                isDarkMode ? "text-slate-300" : "text-slate-600"
              )}>
                Watch. Earn. Unlock.
              </span>
            </motion.div>
          )}

          {/* Right: Progress Strip - Apple-level hierarchy */}
          <div className="flex items-center gap-3 ml-auto">
            {/* ZAP Balance */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/30"
                  : "bg-gray-50/80 border border-gray-200/50"
              )}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-500" />
              <span className={cn(
                "text-sm font-bold tracking-tight",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                {userZAPS.toLocaleString()}
              </span>
            </motion.div>

            {/* Streak Tracker */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                isDarkMode
                  ? "bg-slate-800/50 border border-slate-700/30"
                  : "bg-gray-50/80 border border-gray-200/50"
              )}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className={cn(
                "text-sm font-bold tracking-tight",
                isDarkMode ? "text-white" : "text-slate-900"
              )}>
                {dailyStreak}d
              </span>
            </motion.div>

            {/* ZAP Rewards Link */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRewardsClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-sm"
            >
              <Gift className="w-3.5 h-3.5" />
              <span className="text-sm font-medium tracking-tight">ZAP Rewards</span>
              <ChevronRight className="w-3 h-3" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 pt-6">

          {/* Top Category Tabs - Sticky, Apple-like clean look */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-20 mb-6 -mx-6 px-6 py-3 backdrop-blur-xl"
            style={{
              background: isDarkMode
                ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.8))'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))'
            }}
          >
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex space-x-2 px-1 py-1 overflow-x-auto scrollbar-hide">
                {categories.map((category, index) => {
                  const isActive = activeCategory === category.id;

                  return (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        "flex items-center px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap relative overflow-hidden",
                        isActive
                          ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                          : isDarkMode
                            ? "bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/20 hover:border-slate-600/30"
                            : "bg-white/60 hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 border border-gray-200/50 hover:border-gray-300/60 shadow-sm"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategory"
                          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 tracking-tight">{category.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Hero Row - Desktop only, subtle rotating carousel */}
          {!isMobile && heroContent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className={cn(
                "relative overflow-hidden rounded-2xl p-6 transition-all duration-500",
                isDarkMode
                  ? "bg-gradient-to-r from-slate-800/40 to-slate-700/40 border border-slate-700/30"
                  : "bg-gradient-to-r from-white/80 to-gray-50/80 border border-gray-200/40 shadow-sm"
              )}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    {heroContent[heroIndex]?.data && (
                      <>
                        <div className="text-3xl">{heroContent[heroIndex].data.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {heroContent[heroIndex].type === 'featured' ? (
                              <Star className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-orange-500" />
                            )}
                            <span className={cn(
                              "text-xs font-medium uppercase tracking-wider",
                              isDarkMode ? "text-slate-400" : "text-slate-500"
                            )}>
                              {heroContent[heroIndex].type === 'featured' ? 'Featured Creator' : 'Trending Now'}
                            </span>
                          </div>
                          <h3 className={cn(
                            "font-bold text-lg mb-1",
                            isDarkMode ? "text-white" : "text-slate-900"
                          )}>
                            {heroContent[heroIndex].data.creator}
                          </h3>
                          <p className={cn(
                            "text-sm",
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          )}>
                            {heroContent[heroIndex].data.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{heroContent[heroIndex].data.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-3 py-1 rounded-full">
                            <Zap className="w-3.5 h-3.5" />
                            <span>+{heroContent[heroIndex].data.zaps}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation dots */}
                <div className="absolute bottom-3 right-6 flex items-center gap-1">
                  {heroContent.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setHeroIndex(index)}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        index === heroIndex
                          ? "bg-purple-500 w-4"
                          : isDarkMode
                            ? "bg-slate-600"
                            : "bg-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Double ZAPs Banner - Thin, playful, sticky when active */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "sticky top-20 z-10 mb-6 p-4 rounded-xl transition-all duration-300",
              isDarkMode
                ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
                : "bg-gradient-to-r from-yellow-50/80 to-orange-50/80 border border-yellow-300/30 shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold text-base",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}>
                    ⚡ Double ZAPs Today!
                  </h3>
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  )}>
                    Earn 2x rewards on all tutorials
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl"
              >
                ⚡
              </motion.div>
            </div>
          </motion.div>

          {/* Dynamic Section: Trending Tutorials - Horizontally scrollable */}
          {trendingTutorials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h2 className={cn(
                  "text-xl font-bold tracking-tight",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>
                  🔥 Trending Tutorials
                </h2>
              </div>

              <ScrollArea className="w-full" orientation="horizontal">
                <div className="flex space-x-4 pb-4">
                  {trendingTutorials.map((tutorial, index) => (
                    <TutorialCard
                      key={tutorial.id}
                      tutorial={tutorial}
                      index={index}
                      onVideoSelect={onVideoSelect}
                      isDarkMode={isDarkMode}
                      isHorizontal={true}
                    />
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          {/* Main Grid - 2-4 column responsive, Premium cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "grid gap-6 mb-8",
              isMobile
                ? "grid-cols-1"
                : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}
          >
            {filteredTutorials.map((tutorial, index) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                index={index}
                onVideoSelect={onVideoSelect}
                isDarkMode={isDarkMode}
                isHorizontal={false}
              />
            ))}
          </motion.div>

          {/* Featured Creator Spotlight - Auto-inject in feed */}
          {featuredCreator && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h2 className={cn(
                  "text-xl font-bold tracking-tight",
                  isDarkMode ? "text-white" : "text-slate-900"
                )}>
                  ⭐ Featured Creator
                </h2>
              </div>

              <motion.div
                whileHover={{ scale: 1.01, y: -2 }}
                onClick={() => onVideoSelect(featuredCreator)}
                className={cn(
                  "p-6 rounded-xl cursor-pointer transition-all duration-300",
                  isDarkMode
                    ? "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/40"
                    : "bg-white/80 hover:bg-white border border-gray-200/50 hover:border-gray-300/60 shadow-sm hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{featuredCreator.avatar}</div>
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-bold text-lg mb-1",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}>
                      {featuredCreator.creator}
                    </h3>
                    <p className={cn(
                      "text-sm mb-2",
                      isDarkMode ? "text-slate-400" : "text-slate-600"
                    )}>
                      Featured Tutorial: {featuredCreator.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{featuredCreator.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-2 py-1 rounded-full">
                        <Zap className="w-3 h-3" />
                        <span>+{featuredCreator.zaps}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Load More Trigger */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center pb-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-8 py-3 rounded-full font-medium transition-all duration-300 tracking-tight",
                isDarkMode
                  ? "bg-slate-800/40 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/30"
                  : "bg-white/80 hover:bg-gray-100/80 text-gray-700 hover:text-gray-900 border border-gray-200/50 shadow-sm hover:shadow-md"
              )}
            >
              Load More Tutorials
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Premium Tutorial Card Component - Rounded-xl, frosted shadow, ultra-clean spacing
interface TutorialCardProps {
  tutorial: any;
  index: number;
  onVideoSelect: (video: any) => void;
  isDarkMode: boolean;
  isHorizontal: boolean;
}

const TutorialCard: React.FC<TutorialCardProps> = ({
  tutorial,
  index,
  onVideoSelect,
  isDarkMode,
  isHorizontal
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      onClick={() => onVideoSelect(tutorial)}
      className={cn(
        "group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 backdrop-blur-sm",
        isHorizontal ? "flex-shrink-0 w-80" : "",
        isDarkMode
          ? "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/40"
          : "bg-white/80 hover:bg-white border border-gray-200/50 hover:border-gray-300/60 shadow-sm hover:shadow-lg"
      )}
    >
      {/* Thumbnail - Dominant 16:9 ratio */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={tutorial.thumbnail}
          alt={tutorial.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Play Overlay - Soft zoom on hover */}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-slate-800 ml-0.5" />
          </div>
        </div>

        {/* Duration - Bottom right */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          ⏱ {tutorial.duration}
        </div>

        {/* ZAP Badge - Pill style with glow on hover */}
        <motion.div
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(147, 51, 234, 0.4)"
          }}
          className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm"
        >
          <Zap className="w-3 h-3" />
          <span>+{tutorial.zaps}</span>
        </motion.div>
      </div>

      {/* Content - Ultra-clean spacing */}
      <div className="p-4">
        {/* Bold title - 2 lines max, Apple-level hierarchy */}
        <h3 className={cn(
          "font-bold text-base line-clamp-2 mb-3 leading-tight tracking-tight",
          isDarkMode ? "text-white" : "text-slate-900"
        )}>
          {tutorial.title}
        </h3>

        {/* Meta row - Creator avatar + name (subtle) */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{tutorial.avatar}</span>
          <span className={cn(
            "text-sm font-medium tracking-tight",
            isDarkMode ? "text-slate-300" : "text-slate-600"
          )}>
            {tutorial.creator}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscoverPageV2Premium;