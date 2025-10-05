/**
 * Minimalist ZAP Wallet (V2)
 * Ultra-premium, glassmorphic, Apple-grade elegance
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Sparkles, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZapWalletProps {
  balance: number;
  onEarnMore?: () => void;
  onSendZaps?: () => void;
  className?: string;
}

export const ZapWallet: React.FC<ZapWalletProps> = ({
  balance,
  onEarnMore,
  onSendZaps,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)}>
      {/* Desktop: Wallet Icon + Balance */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "hidden md:flex items-center gap-2.5",
          "text-white/90 hover:text-white transition-all duration-300",
          "group cursor-pointer"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Wallet Icon with Glow */}
        <motion.div
          className="relative"
          animate={
            isOpen
              ? {
                  filter: [
                    "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))",
                    "drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))",
                    "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
        </motion.div>

        {/* Balance Text */}
        <motion.span
          className="font-semibold text-base bg-gradient-to-r from-white via-amber-50 to-white bg-clip-text text-transparent"
          key={balance}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {balance.toLocaleString()} ZAPs
        </motion.span>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-300/20 blur-xl" />
        </div>
      </motion.button>

      {/* Mobile: Floating ZAP Icon */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden fixed top-4 right-4 z-50",
          "w-12 h-12 rounded-full",
          "bg-gradient-to-br from-amber-400/20 to-yellow-300/20",
          "backdrop-blur-xl border border-amber-400/30",
          "flex items-center justify-center",
          "shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
      </motion.button>

      {/* Dropdown Panel (Desktop & Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              ref={dropdownRef}
              className={cn(
                // Desktop: dropdown below icon
                "hidden md:block absolute right-0 top-full mt-3 w-64",
                // Mobile: bottom sheet
                "md:relative md:w-64",
                "rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10",
                "shadow-[0_0_25px_rgba(255,255,255,0.1)]",
                "p-5"
              )}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Balance Display */}
              <div className="mb-4 text-center md:text-left">
                <motion.p
                  className="text-2xl font-bold text-white mb-1"
                  key={balance}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  {balance.toLocaleString()}
                  <span className="text-lg text-white/70 ml-1">ZAPs</span>
                </motion.p>
                <p className="text-xs text-white/50 uppercase tracking-wider">
                  Your Balance
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEarnMore?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "px-4 py-2.5 rounded-full text-sm font-medium",
                    "bg-gradient-to-r from-amber-400/20 to-yellow-300/20",
                    "hover:from-amber-400/30 hover:to-yellow-300/30",
                    "text-white border border-amber-400/20",
                    "transition-all duration-300",
                    "shadow-[0_0_15px_rgba(251,191,36,0.2)]",
                    "hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]"
                  )}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Earn ZAPs
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendZaps?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "px-4 py-2.5 rounded-full text-sm font-medium",
                    "bg-white/10 hover:bg-white/20",
                    "text-white/90 hover:text-white",
                    "border border-white/10",
                    "transition-all duration-300"
                  )}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-4 h-4" />
                  Send ZAPs
                </motion.button>
              </div>
            </motion.div>

            {/* Mobile: Bottom Sheet */}
            <motion.div
              ref={dropdownRef}
              className={cn(
                "md:hidden fixed inset-x-4 bottom-4 z-50",
                "rounded-3xl backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5",
                "border border-white/20",
                "shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
                "p-6"
              )}
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* ZAP Logo */}
              <div className="flex justify-center mb-4">
                <motion.div
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-300/30 backdrop-blur-xl border border-amber-400/40 flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(251, 191, 36, 0.3)",
                      "0 0 30px rgba(251, 191, 36, 0.5)",
                      "0 0 20px rgba(251, 191, 36, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
                </motion.div>
              </div>

              {/* Balance */}
              <div className="text-center mb-6">
                <motion.p
                  className="text-4xl font-bold text-white mb-2"
                  key={balance}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  {balance.toLocaleString()}
                </motion.p>
                <p className="text-sm text-white/60 uppercase tracking-wider">
                  Your ZAP Balance
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEarnMore?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "px-6 py-4 rounded-2xl text-base font-semibold",
                    "bg-gradient-to-r from-amber-400 to-yellow-300",
                    "text-black",
                    "shadow-[0_0_25px_rgba(251,191,36,0.4)]",
                    "hover:shadow-[0_0_35px_rgba(251,191,36,0.6)]",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-5 h-5" />
                  Earn ZAPs
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendZaps?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "px-6 py-4 rounded-2xl text-base font-medium",
                    "bg-white/10 hover:bg-white/20",
                    "text-white border border-white/20",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-5 h-5" />
                  Send ZAPs
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZapWallet;
