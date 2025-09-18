import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Gem, Sparkles, Crown, Gift, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LuxuryCircularIcon } from './luxury-circular-icon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './dropdown-menu';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  xpCost: number;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isLimited?: boolean;
  timeLeft?: string; // e.g., "2h 30m"
  image?: string;
  inStock: boolean;
}

interface XPShopDropdownProps {
  userXP: number;
  featuredItems?: ShopItem[];
  onPurchaseItem?: (itemId: string) => void;
  onVisitShop?: () => void;
}

export const XPShopDropdown: React.FC<XPShopDropdownProps> = ({
  userXP,
  featuredItems = [],
  onPurchaseItem,
  onVisitShop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());

  // Mock featured items if none provided
  const mockFeaturedItems: ShopItem[] = [
    {
      id: '1',
      name: 'Golden Crown',
      description: 'Exclusive profile badge',
      xpCost: 500,
      icon: <Crown className="w-4 h-4 text-yellow-500" />,
      rarity: 'legendary',
      isLimited: true,
      timeLeft: '2h 30m',
      inStock: true
    },
    {
      id: '2',
      name: 'XP Booster',
      description: '2x XP for 24 hours',
      xpCost: 200,
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      rarity: 'epic',
      inStock: true
    },
    {
      id: '3',
      name: 'Premium Avatar',
      description: 'Animated profile avatar',
      xpCost: 300,
      icon: <Gift className="w-4 h-4 text-blue-500" />,
      rarity: 'rare',
      inStock: true
    },
    {
      id: '4',
      name: 'Gem Bundle',
      description: '100 bonus gems',
      xpCost: 150,
      icon: <Gem className="w-4 h-4 text-green-500" />,
      rarity: 'common',
      inStock: false
    }
  ];

  const displayItems = featuredItems.length > 0 ? featuredItems : mockFeaturedItems;

  const getRarityStyles = (rarity: ShopItem['rarity'], isLimited?: boolean) => {
    const baseStyles = {
      common: {
        border: 'border-gray-200',
        bg: 'bg-white',
        glow: '',
        text: 'text-gray-700'
      },
      rare: {
        border: 'border-blue-300',
        bg: 'bg-gradient-to-br from-blue-50 to-white',
        glow: 'shadow-blue-500/20',
        text: 'text-blue-700'
      },
      epic: {
        border: 'border-purple-300',
        bg: 'bg-gradient-to-br from-purple-50 to-white',
        glow: 'shadow-purple-500/20',
        text: 'text-purple-700'
      },
      legendary: {
        border: 'border-yellow-400',
        bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
        glow: 'shadow-yellow-500/30',
        text: 'text-yellow-700'
      }
    };

    const styles = baseStyles[rarity];

    if (isLimited) {
      return {
        ...styles,
        border: 'border-gradient-to-r from-pink-400 to-purple-500',
        glow: `${styles.glow} shadow-lg animate-pulse`
      };
    }

    return styles;
  };

  const canAfford = (cost: number) => userXP >= cost;

  const handlePurchase = (item: ShopItem) => {
    if (canAfford(item.xpCost) && item.inStock) {
      setPurchasedItems(prev => new Set([...prev, item.id]));
      onPurchaseItem?.(item.id);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <LuxuryCircularIcon
            icon={ShoppingBag}
            isActive={isOpen}
            variant="premium"
            size="md"
            hasNotification={displayItems.some(item => item.isLimited)}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        variant="premium"
        className="w-80 max-w-[90vw]"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Header with XP Balance */}
          <div className="px-1 py-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
                XP Shop
              </h3>
              <div className="text-xs text-gray-500 font-medium">
                Featured Items
              </div>
            </div>

            {/* XP Balance */}
            <motion.div
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 rounded-xl text-white shadow-lg"
              whileHover={{ scale: 1.02 }}
              animate={{
                boxShadow: [
                  '0 4px 15px rgba(147, 51, 234, 0.3)',
                  '0 8px 25px rgba(147, 51, 234, 0.4)',
                  '0 4px 15px rgba(147, 51, 234, 0.3)'
                ]
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <Gem className="w-5 h-5" />
              <span className="text-lg font-bold">
                {userXP.toLocaleString()}
              </span>
              <span className="text-sm opacity-90">XP</span>
            </motion.div>
          </div>

          {/* Featured Items Grid */}
          <div className="px-1">
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
              <AnimatePresence>
                {displayItems.map((item, index) => {
                  const rarityStyles = getRarityStyles(item.rarity, item.isLimited);
                  const isPurchased = purchasedItems.has(item.id);
                  const affordable = canAfford(item.xpCost);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "relative p-3 rounded-lg transition-all duration-300 cursor-pointer group",
                        rarityStyles.bg,
                        rarityStyles.border,
                        rarityStyles.glow,
                        !item.inStock && "opacity-50 cursor-not-allowed",
                        isPurchased && "opacity-60"
                      )}
                      onClick={() => handlePurchase(item)}
                      whileHover={item.inStock && !isPurchased ? { scale: 1.02, y: -2 } : {}}
                      whileTap={item.inStock && !isPurchased ? { scale: 0.98 } : {}}
                    >
                      {/* Limited Time Indicator */}
                      {item.isLimited && (
                        <motion.div
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          LIMITED
                        </motion.div>
                      )}

                      {/* Item Icon */}
                      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm mb-2 mx-auto">
                        {item.icon}
                      </div>

                      {/* Item Details */}
                      <div className="text-center">
                        <h4 className={cn("text-sm font-semibold truncate", rarityStyles.text)}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">
                          {item.description}
                        </p>

                        {/* Time Left */}
                        {item.timeLeft && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">
                              {item.timeLeft}
                            </span>
                          </div>
                        )}

                        {/* Purchase Button */}
                        <motion.div
                          className={cn(
                            "mt-2 px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1",
                            isPurchased
                              ? "bg-green-500 text-white"
                              : affordable && item.inStock
                              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
                              : "bg-gray-200 text-gray-500"
                          )}
                          whileHover={affordable && item.inStock && !isPurchased ? { scale: 1.05 } : {}}
                        >
                          {isPurchased ? (
                            "✓ Owned"
                          ) : !item.inStock ? (
                            "Out of Stock"
                          ) : (
                            <>
                              <Gem className="w-3 h-3" />
                              {item.xpCost}
                            </>
                          )}
                        </motion.div>
                      </div>

                      {/* Rarity Glow Effect */}
                      {item.rarity === 'legendary' && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            background: "linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.1), transparent)",
                            filter: "blur(1px)",
                            zIndex: -1
                          }}
                          animate={{
                            opacity: [0.3, 0.7, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Visit Shop CTA */}
          <div className="px-1">
            <motion.button
              onClick={onVisitShop}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 group shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingBag className="w-4 h-4" />
              Visit Shop
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>

          {/* Empty State */}
          {displayItems.length === 0 && (
            <div className="text-center py-8 px-4">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">No items available</p>
              <p className="text-xs text-gray-500 mt-1">Check back later for new rewards!</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};