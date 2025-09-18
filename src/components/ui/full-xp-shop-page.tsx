import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Gem, Crown, Sparkles, Gift, Clock, Star,
  Zap, Shield, Palette, Music, Trophy, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'cosmetic' | 'booster' | 'badge' | 'utility';
  isLimited?: boolean;
  isNew?: boolean;
  timeLeft?: number; // seconds
  stock?: number;
  maxStock?: number;
  discount?: number; // percentage
  image?: string;
}

interface FullXPShopPageProps {
  userXP: number;
  shopItems?: ShopItem[];
  onPurchaseItem?: (itemId: string) => void;
  refreshTime?: number; // seconds until next refresh
}

export const FullXPShopPage: React.FC<FullXPShopPageProps> = ({
  userXP,
  shopItems = [],
  onPurchaseItem,
  refreshTime = 3600 // 1 hour
}) => {
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(refreshTime);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock shop items if none provided
  const mockShopItems: ShopItem[] = [
    // Legendary Items
    {
      id: 'crown-legendary',
      name: 'Legendary Crown',
      description: 'Ultimate prestige symbol',
      xpCost: 2500,
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      rarity: 'legendary',
      category: 'cosmetic',
      isLimited: true,
      timeLeft: 7200,
      stock: 2,
      maxStock: 5
    },
    {
      id: 'xp-multiplier-legendary',
      name: 'XP Multiplier x5',
      description: '5x XP for 7 days',
      xpCost: 3000,
      icon: <Zap className="w-6 h-6 text-purple-500" />,
      rarity: 'legendary',
      category: 'booster',
      isLimited: true,
      timeLeft: 3600,
      stock: 1,
      maxStock: 3
    },

    // Epic Items
    {
      id: 'rainbow-badge',
      name: 'Rainbow Badge',
      description: 'Animated rainbow profile badge',
      xpCost: 1200,
      icon: <Palette className="w-5 h-5 text-pink-500" />,
      rarity: 'epic',
      category: 'badge',
      isNew: true
    },
    {
      id: 'speed-boost',
      name: 'Learning Speed Boost',
      description: '2x learning speed for 48h',
      xpCost: 800,
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      rarity: 'epic',
      category: 'booster',
      discount: 20
    },
    {
      id: 'premium-avatar',
      name: 'Animated Avatar Frame',
      description: 'Premium animated border',
      xpCost: 1000,
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      rarity: 'epic',
      category: 'cosmetic'
    },

    // Rare Items
    {
      id: 'star-badge',
      name: 'Star Achiever Badge',
      description: 'Show your excellence',
      xpCost: 500,
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      rarity: 'rare',
      category: 'badge'
    },
    {
      id: 'shield-protection',
      name: 'Streak Protection',
      description: 'Protect your streak for 1 week',
      xpCost: 600,
      icon: <Shield className="w-5 h-5 text-green-500" />,
      rarity: 'rare',
      category: 'utility'
    },
    {
      id: 'trophy-collection',
      name: 'Trophy Collection',
      description: 'Display multiple achievements',
      xpCost: 750,
      icon: <Trophy className="w-5 h-5 text-gold-500" />,
      rarity: 'rare',
      category: 'cosmetic'
    },

    // Common Items
    {
      id: 'xp-boost-small',
      name: 'XP Boost (24h)',
      description: '1.5x XP for 24 hours',
      xpCost: 200,
      icon: <Gem className="w-4 h-4 text-blue-500" />,
      rarity: 'common',
      category: 'booster'
    },
    {
      id: 'music-theme',
      name: 'Study Music Pack',
      description: 'Focus-enhancing soundtracks',
      xpCost: 150,
      icon: <Music className="w-4 h-4 text-purple-500" />,
      rarity: 'common',
      category: 'utility'
    },
    {
      id: 'gift-box',
      name: 'Mystery Gift Box',
      description: 'Random reward surprise',
      xpCost: 100,
      icon: <Gift className="w-4 h-4 text-green-500" />,
      rarity: 'common',
      category: 'utility'
    }
  ];

  const displayItems = shopItems.length > 0 ? shopItems : mockShopItems;

  const categories = [
    { id: 'all', name: 'All Items', icon: ShoppingBag },
    { id: 'cosmetic', name: 'Cosmetics', icon: Palette },
    { id: 'booster', name: 'Boosters', icon: Zap },
    { id: 'badge', name: 'Badges', icon: Star },
    { id: 'utility', name: 'Utilities', icon: Shield }
  ];

  const filteredItems = selectedCategory === 'all'
    ? displayItems
    : displayItems.filter(item => item.category === selectedCategory);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Item-specific timers
  useEffect(() => {
    const itemTimers = displayItems
      .filter(item => item.timeLeft)
      .map(item =>
        setInterval(() => {
          // In a real app, this would update the item's timeLeft
        }, 1000)
      );

    return () => itemTimers.forEach(clearInterval);
  }, [displayItems]);

  const getRarityStyles = (rarity: ShopItem['rarity']) => {
    const styles = {
      common: {
        bg: 'bg-gradient-to-br from-gray-50 to-white',
        border: 'border-gray-200',
        glow: '',
        text: 'text-gray-700',
        shine: 'from-gray-300 to-gray-100'
      },
      rare: {
        bg: 'bg-gradient-to-br from-blue-50 to-white',
        border: 'border-blue-300',
        glow: 'shadow-blue-500/20',
        text: 'text-blue-700',
        shine: 'from-blue-300 to-blue-100'
      },
      epic: {
        bg: 'bg-gradient-to-br from-purple-50 to-white',
        border: 'border-purple-400',
        glow: 'shadow-purple-500/30',
        text: 'text-purple-700',
        shine: 'from-purple-400 to-purple-200'
      },
      legendary: {
        bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
        border: 'border-yellow-500',
        glow: 'shadow-yellow-500/40',
        text: 'text-yellow-800',
        shine: 'from-yellow-400 to-orange-300'
      }
    };

    return styles[rarity];
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const canAfford = (cost: number) => userXP >= cost;

  const handlePurchase = (item: ShopItem) => {
    if (canAfford(item.xpCost) && !purchasedItems.has(item.id)) {
      setPurchasedItems(prev => new Set([...prev, item.id]));
      onPurchaseItem?.(item.id);
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: `
        radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
      `
    }}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <ShoppingBag className="w-10 h-10 text-purple-400" />
              XP Shop
            </h1>
            <p className="text-gray-400">Upgrade your learning experience</p>
          </div>

          {/* Shop Refresh Timer */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white">
              <RefreshCw className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium">Next Refresh</p>
                <p className="text-lg font-bold">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP Balance */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 text-white">
                <Gem className="w-8 h-8" />
                <div>
                  <p className="text-lg font-medium opacity-90">Your Balance</p>
                  <p className="text-3xl font-bold">{userXP.toLocaleString()} XP</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                      : "bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Shop Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const rarityStyles = getRarityStyles(item.rarity);
              const isPurchased = purchasedItems.has(item.id);
              const affordable = canAfford(item.xpCost);
              const isHovered = hoveredItem === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative p-6 rounded-xl transition-all duration-300 cursor-pointer group",
                    rarityStyles.bg,
                    rarityStyles.border,
                    rarityStyles.glow,
                    "border-2 hover:shadow-2xl",
                    isPurchased && "opacity-60 cursor-not-allowed",
                    item.isLimited && "animate-pulse-slow"
                  )}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  onClick={() => handlePurchase(item)}
                  whileHover={!isPurchased ? { y: -8, scale: 1.02 } : {}}
                  whileTap={!isPurchased ? { scale: 0.98 } : {}}
                >
                  {/* Limited/New Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.isLimited && (
                      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        LIMITED
                      </div>
                    )}
                    {item.isNew && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        NEW
                      </div>
                    )}
                    {item.discount && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{item.discount}%
                      </div>
                    )}
                  </div>

                  {/* Stock Indicator */}
                  {item.stock !== undefined && item.maxStock && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {item.stock}/{item.maxStock} left
                      </div>
                    </div>
                  )}

                  {/* Item Icon */}
                  <div className="flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-lg mb-4 mx-auto">
                    {item.icon}
                  </div>

                  {/* Item Details */}
                  <div className="text-center">
                    <h3 className={cn("text-lg font-bold mb-2", rarityStyles.text)}>
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 h-10">
                      {item.description}
                    </p>

                    {/* Time Left */}
                    {item.timeLeft && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600 font-medium">
                          {formatTime(item.timeLeft)}
                        </span>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <motion.button
                      className={cn(
                        "w-full py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                        isPurchased
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : affordable
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      )}
                      whileHover={affordable && !isPurchased ? { scale: 1.05 } : {}}
                      disabled={isPurchased || !affordable}
                    >
                      {isPurchased ? (
                        "✓ Owned"
                      ) : (
                        <>
                          <Gem className="w-4 h-4" />
                          {item.discount
                            ? (
                              <>
                                <span className="line-through opacity-75">{item.xpCost}</span>
                                <span>{Math.floor(item.xpCost * (1 - item.discount / 100))}</span>
                              </>
                            )
                            : item.xpCost.toLocaleString()
                          }
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Rarity Shine Effect */}
                  {isHovered && item.rarity !== 'common' && (
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        background: `linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent)`,
                        transform: 'translateX(-100%)'
                      }}
                      animate={{
                        transform: 'translateX(100%)'
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Legendary Aurora Effect */}
                  {item.rarity === 'legendary' && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `
                          conic-gradient(
                            from 0deg,
                            transparent 0deg,
                            rgba(255, 215, 0, 0.2) 90deg,
                            rgba(255, 140, 0, 0.3) 180deg,
                            rgba(255, 69, 0, 0.2) 270deg,
                            transparent 360deg
                          )
                        `,
                        filter: "blur(2px)",
                        zIndex: -1
                      }}
                      animate={{
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No items in this category</h3>
            <p className="text-gray-500">Try selecting a different category or check back later!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};