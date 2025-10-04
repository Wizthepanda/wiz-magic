import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Wallet, TrendingUp, DollarSign, ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedBalanceWidgetProps {
  zapBalance: number;
  usdEquivalent: number;
  className?: string;
}

export const EnhancedBalanceWidget: React.FC<EnhancedBalanceWidgetProps> = ({
  zapBalance,
  usdEquivalent,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <motion.div
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.05 }}
        className="cursor-pointer"
      >
        <div className="relative group">
          {/* Glowing crystal-like ZAP coin */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 blur-xl opacity-60"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Crystal facets */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/30 to-transparent" />

            {/* ZAP icon */}
            <Zap className="w-8 h-8 text-white fill-current relative z-10 drop-shadow-lg" />
          </div>

          {/* Balance badge */}
          <motion.div
            className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold shadow-lg whitespace-nowrap"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            {zapBalance.toLocaleString()} ⚡
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Dropdown panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute right-0 top-20 w-80 bg-gradient-to-br from-gray-900 via-purple-900/50 to-cyan-900/50 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Your Balance</h3>
                      <p className="text-xs text-gray-400">ZAP Wallet</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Balance display */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                      {zapBalance.toLocaleString()}
                    </span>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <DollarSign className="w-4 h-4" />
                    <span>≈ ${usdEquivalent.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="p-6 grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-300 font-medium">Earned</span>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    +{Math.floor(zapBalance * 0.3)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-300 font-medium">Spent</span>
                  </div>
                  <div className="text-xl font-bold text-blue-400">
                    {Math.floor(zapBalance * 0.1)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 space-y-2">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold rounded-xl">
                  <Wallet className="w-4 h-4 mr-2" />
                  View Wallet
                </Button>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-semibold rounded-xl">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Earn ZAPs
                </Button>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedBalanceWidget;
