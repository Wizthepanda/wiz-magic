/**
 * Header - ZAP Rewards Hub main header
 * Includes title, balance widget, and optional search
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BalanceWidget, WalletPopup } from './BalanceWidget';
import { GLASS_STYLES } from './constants';

interface HeaderProps {
  balance: number;
  level?: number;
  usdBalance?: number;
  onSearch?: (query: string) => void;
  onEarnMore?: () => void;
  showSearch?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  level,
  usdBalance,
  onSearch,
  onEarnMore,
  showSearch = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative z-10', className)}>
      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg"
                animate={{
                  boxShadow: [
                    '0 10px 30px rgba(99, 102, 241, 0.3)',
                    '0 10px 40px rgba(139, 92, 246, 0.4)',
                    '0 10px 30px rgba(99, 102, 241, 0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  ZAP Rewards Hub
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover exclusive rewards, courses & communities
                </p>
              </div>
            </div>

            {/* Right Section: Search + Balance */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              {showSearch && (
                <div
                  className={cn(
                    GLASS_STYLES.pill,
                    'relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200',
                    isSearchFocused
                      ? 'ring-2 ring-indigo-500/50 shadow-md'
                      : 'shadow-sm'
                  )}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search rewards..."
                    className="bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Balance Widget */}
              <div className="relative">
                <BalanceWidget
                  balance={balance}
                  level={level}
                  onClick={() => setShowWalletPopup(!showWalletPopup)}
                />

                {/* Wallet Popup */}
                <AnimatePresence>
                  {showWalletPopup && (
                    <WalletPopup
                      balance={balance}
                      level={level}
                      usdBalance={usdBalance}
                      onEarnMore={onEarnMore}
                      onClose={() => setShowWalletPopup(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="block md:hidden">
        <div className="px-4 py-4">
          {/* Top Row: Title + Balance Chip */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  ZAP Rewards
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Discover & Claim
                </p>
              </div>
            </div>

            {/* Compact Balance Widget */}
            <div className="relative">
              <BalanceWidget
                balance={balance}
                level={level}
                isCompact
                onClick={() => setShowWalletPopup(!showWalletPopup)}
              />

              {/* Wallet Popup */}
              <AnimatePresence>
                {showWalletPopup && (
                  <WalletPopup
                    balance={balance}
                    level={level}
                    usdBalance={usdBalance}
                    onEarnMore={onEarnMore}
                    onClose={() => setShowWalletPopup(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Bar (Mobile) */}
          {showSearch && (
            <div
              className={cn(
                GLASS_STYLES.pill,
                'relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200',
                isSearchFocused
                  ? 'ring-2 ring-indigo-500/50 shadow-md'
                  : 'shadow-sm'
              )}
            >
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search rewards..."
                className="bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 w-full"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
