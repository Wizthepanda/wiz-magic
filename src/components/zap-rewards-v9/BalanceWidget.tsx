/**
 * Balance Widget - Glassmorphic ZAP balance display
 * Shows user's ZAP balance in header, collapses to compact chip on mobile
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatZaps } from './utils';
import { GLASS_STYLES } from './constants';

interface BalanceWidgetProps {
  balance: number;
  level?: number;
  isCompact?: boolean;
  onClick?: () => void;
  className?: string;
}

export const BalanceWidget: React.FC<BalanceWidgetProps> = ({
  balance,
  level,
  isCompact = false,
  onClick,
  className,
}) => {
  if (isCompact) {
    return (
      <motion.button
        onClick={onClick}
        className={cn(
          GLASS_STYLES.pill,
          'px-4 py-2 rounded-full flex items-center gap-2 shadow-sm hover:shadow-md transition-all',
          'hover:scale-105 active:scale-95',
          className
        )}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* ZAP Icon with glow */}
        <div className="relative">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <div className="absolute inset-0 bg-yellow-400 blur-md opacity-30" />
        </div>

        {/* Balance */}
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {formatZaps(balance)}
        </span>

        {/* Chevron */}
        <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </motion.button>
    );
  }

  return (
    <motion.div
      className={cn(
        GLASS_STYLES.card,
        'px-6 py-4 rounded-2xl shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
    >
      <div className="flex items-center gap-4">
        {/* Icon with animated glow */}
        <div className="relative">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 20px rgba(250, 204, 21, 0.3)',
                '0 0 30px rgba(250, 204, 21, 0.5)',
                '0 0 20px rgba(250, 204, 21, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-6 h-6 text-white fill-white" />
          </motion.div>
        </div>

        {/* Balance Info */}
        <div className="flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Your Balance
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatZaps(balance)}
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-400">ZAPs</span>
          </div>
          {level !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Level {level}
            </p>
          )}
        </div>

        {/* Optional expand indicator */}
        {onClick && (
          <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </motion.div>
  );
};

/**
 * Wallet Mini Popup - Expanded balance details (optional enhancement)
 */
interface WalletPopupProps {
  balance: number;
  level?: number;
  usdBalance?: number;
  onEarnMore?: () => void;
  onClose?: () => void;
}

export const WalletPopup: React.FC<WalletPopupProps> = ({
  balance,
  level,
  usdBalance,
  onEarnMore,
  onClose,
}) => {
  return (
    <motion.div
      className={cn(
        GLASS_STYLES.modal,
        'absolute top-full right-0 mt-2 p-4 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 z-50 min-w-[280px]'
      )}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Your Wallet
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* ZAP Balance */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">ZAPs Balance</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatZaps(balance)}
            </p>
          </div>
        </div>

        {/* USD Balance (if available) */}
        {usdBalance !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">USD Balance</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              ${usdBalance.toFixed(2)}
            </p>
          </div>
        )}

        {/* Level */}
        {level !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Level {level}
            </p>
          </div>
        )}
      </div>

      {/* Earn More Button */}
      {onEarnMore && (
        <button
          onClick={onEarnMore}
          className="w-full mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-sm hover:shadow-md"
        >
          Earn More ZAPs
        </button>
      )}
    </motion.div>
  );
};
