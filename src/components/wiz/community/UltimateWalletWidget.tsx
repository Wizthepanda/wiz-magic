/**
 * Ultimate Wallet Widget - Black Amex x Apple Premium Design
 * Premium wallet experience with titanium card aesthetic
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send, Sparkles, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./wallet-animations.css";

interface Transaction {
  id: string;
  type: "earned" | "spent";
  label: string;
  amount: number;
  timestamp: Date;
  icon?: "earned" | "spent" | "mission" | "purchase";
}

interface UltimateWalletWidgetProps {
  zapBalance: number;
  earnedThisWeek?: number;
  onEarnMore?: () => void;
  onSendZaps?: () => void;
  className?: string;
}

export const UltimateWalletWidget: React.FC<UltimateWalletWidgetProps> = ({
  zapBalance,
  earnedThisWeek = 0,
  onEarnMore,
  onSendZaps,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { user } = useAuth();

  // Shimmer effect every 10 seconds
  useEffect(() => {
    const shimmerInterval = setInterval(() => {
      setShowShimmer(true);
      setTimeout(() => setShowShimmer(false), 2000);
    }, 10000);

    return () => clearInterval(shimmerInterval);
  }, []);

  // Fetch transactions when expanded
  useEffect(() => {
    if (isExpanded && user && transactions.length === 0) {
      fetchTransactions();
    }
  }, [isExpanded, user?.uid]);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoadingTransactions(true);
    try {
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      );

      const snapshot = await getDocs(transactionsQuery);
      const txs: Transaction[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        txs.push({
          id: doc.id,
          type: data.type === "community_purchase" || data.type === "spent" ? "spent" : "earned",
          label: data.communityTitle || data.description || "Transaction",
          amount: Math.abs(data.zapAmount || 0),
          timestamp: data.timestamp?.toDate() || new Date(),
          icon: data.type === "community_purchase" ? "purchase" : data.type === "earned" ? "earned" : "spent",
        });
      });

      setTransactions(txs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Main Wallet Card - Desktop */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "hidden md:flex relative overflow-hidden",
          "bg-gradient-to-tr from-[#0D0D0F]/95 to-[#1A1A1C]/95",
          "backdrop-blur-xl border-[1.5px] border-white/10",
          "rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)]",
          "transition-all duration-500 ease-out",
          "hover:shadow-[0_0_40px_rgba(255,215,0,0.15)]",
          "group cursor-pointer",
          isExpanded ? "px-6 py-4" : "px-8 py-5"
        )}
        style={{
          boxShadow: isExpanded
            ? "0 0 40px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 0 25px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98, y: 0 }}
      >
        {/* Animated Shimmer Pass */}
        <AnimatePresence>
          {showShimmer && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Left: ZAP Logo Orb */}
        <div className="relative flex items-center justify-center mr-4">
          <motion.div
            className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-300/20 backdrop-blur-xl border border-amber-400/30 flex items-center justify-center"
            whileHover={{
              boxShadow: "0 0 30px rgba(251, 191, 36, 0.4)",
            }}
            animate={{
              boxShadow: [
                "0 0 15px rgba(251, 191, 36, 0.2)",
                "0 0 25px rgba(251, 191, 36, 0.3)",
                "0 0 15px rgba(251, 191, 36, 0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
          </motion.div>
        </div>

        {/* Center: Balance Info */}
        <div className="flex-1 flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-medium mb-1">
            Your Balance
          </span>

          {/* Animated Balance Counter */}
          <motion.div
            key={zapBalance}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-3xl font-bold text-white tracking-tight">
              {zapBalance.toLocaleString()}
            </span>
            <span className="text-sm text-white/60 font-medium">ZAPs</span>
          </motion.div>

          {/* Weekly Earnings */}
          {earnedThisWeek > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 mt-1"
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400/80">
                +{earnedThisWeek} this week
              </span>
            </motion.div>
          )}
        </div>

        {/* Right: Earn ZAPs Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onEarnMore?.();
          }}
          className={cn(
            "ml-4 px-5 py-2.5 rounded-full",
            "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200",
            "text-black font-semibold text-sm",
            "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
            "hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]",
            "transition-all duration-300",
            "flex items-center gap-2"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="w-4 h-4" />
          Earn ZAPs
        </motion.button>

        {/* Hover Glow Border */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-silver via-amber-300 to-amber-500 opacity-20 blur-sm" />
        </div>
      </motion.button>

      {/* Mobile Floating Orb */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "md:hidden fixed bottom-6 right-6 z-50",
          "w-16 h-16 rounded-full",
          "bg-gradient-to-br from-[#0D0D0F] to-[#1A1A1C]",
          "border-2 border-amber-400/30",
          "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
          "flex items-center justify-center"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Zap className="w-7 h-7 text-amber-400 fill-amber-400" />
      </motion.button>

      {/* Expanded Wallet Panel (Desktop & Mobile) */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />

            {/* Wallet Panel */}
            <motion.div
              className={cn(
                "absolute md:top-full md:right-0 md:mt-4",
                "md:relative md:block",
                "md:w-[380px]",
                // Mobile: full screen modal
                "fixed md:static inset-x-4 bottom-20 md:inset-auto z-50 md:z-auto",
                "bg-gradient-to-br from-[#0D0D0F]/98 to-[#1A1A1C]/98",
                "backdrop-blur-2xl border border-white/10",
                "rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
                "p-6"
              )}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Section 1: Overview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/90 font-semibold text-lg">Wallet</h3>
                  <motion.div
                    className="text-3xl font-bold text-white"
                    key={zapBalance}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    {zapBalance.toLocaleString()}
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendZaps?.();
                      setIsExpanded(false);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 font-medium text-sm transition-all"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-4 h-4" />
                    Send ZAPs
                  </motion.button>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEarnMore?.();
                      setIsExpanded(false);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-semibold text-sm shadow-lg transition-all"
                    whileHover={{ y: -2, boxShadow: "0 0 25px rgba(251,191,36,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Earn ZAPs
                  </motion.button>
                </div>
              </div>

              {/* Section 2: Activity Log */}
              <div className="mb-4">
                <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">
                  Recent Activity
                </h4>

                <div className="space-y-2">
                  {isLoadingTransactions ? (
                    <div className="text-center py-6 text-white/40 text-sm">
                      Loading transactions...
                    </div>
                  ) : transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <motion.div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              tx.type === "earned"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                            )}
                          >
                            {tx.type === "earned" ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                          </div>

                          {/* Label & Time */}
                          <div className="flex flex-col">
                            <span className="text-white/90 text-sm font-medium truncate max-w-[180px]">
                              {tx.label}
                            </span>
                            <span className="text-white/40 text-xs">
                              {formatTimeAgo(tx.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            tx.type === "earned" ? "text-emerald-400" : "text-red-400"
                          )}
                        >
                          {tx.type === "earned" ? "+" : "-"}
                          {tx.amount}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-white/40 text-sm">
                      No transactions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Earn ZAPs CTA */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onEarnMore?.();
                  setIsExpanded(false);
                }}
                className={cn(
                  "w-full mt-4 px-6 py-4 rounded-2xl",
                  "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
                  "text-white font-bold text-sm",
                  "shadow-[0_0_30px_rgba(139,92,246,0.4)]",
                  "hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]",
                  "transition-all duration-300",
                  "flex items-center justify-center gap-2"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-5 h-5" />
                Explore Missions to Earn ZAPs
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UltimateWalletWidget;
