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
    <div className={cn("relative flex-shrink-0", className)}>
      {/* Desktop: Wallet Icon + Balance - Inline Minimal */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "hidden md:flex items-center gap-2",
          "text-gray-700 hover:text-gray-900 transition-all duration-300",
          "group cursor-pointer",
          "relative"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Wallet Icon with Subtle Glow */}
        <motion.div
          className="relative w-5 h-5"
          whileHover={{
            filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))"
          }}
        >
          <Wallet className="w-5 h-5 text-violet-600" strokeWidth={2} />
        </motion.div>

        {/* Balance Text - Pearl Gradient */}
        <motion.span
          className="font-semibold text-base text-gray-800"
          key={balance}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ letterSpacing: '-0.01em' }}
        >
          {balance.toLocaleString()}
          <span className="text-gray-500 ml-1 font-medium">ZAPs</span>
        </motion.span>

        {/* Subtle Hover Pulse */}
        <motion.div
          className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)'
          }}
        />
      </motion.button>

      {/* Mobile: Floating Wallet Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden fixed top-4 right-4 z-50",
          "w-12 h-12 rounded-full",
          "bg-white/60 backdrop-blur-xl border border-white/40",
          "flex items-center justify-center",
          "shadow-lg"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wallet className="w-5 h-5 text-violet-600" strokeWidth={2} />
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

            {/* Dropdown - Frosted Glass Panel */}
            <motion.div
              ref={dropdownRef}
              className={cn(
                // Desktop: dropdown below icon
                "hidden md:block absolute right-0 top-full mt-3 w-72",
                // Glassmorphic styling
                "rounded-2xl backdrop-blur-xl bg-white/5 border border-white/20",
                "shadow-[0_0_15px_rgba(255,255,255,0.1)]",
                "p-6"
              )}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
            >
              {/* Balance Display */}
              <div className="mb-5">
                <motion.p
                  className="text-3xl font-bold text-gray-900 mb-1"
                  key={balance}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {balance.toLocaleString()}
                  <span className="text-xl text-gray-600 ml-1.5 font-semibold">ZAPs</span>
                </motion.p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Your Balance
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2.5">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEarnMore?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2.5",
                    "px-5 py-3 rounded-full text-sm font-semibold",
                    "bg-white/10 hover:bg-white/15",
                    "text-gray-800 hover:text-gray-900",
                    "border border-white/30",
                    "transition-all duration-300",
                    "shadow-sm hover:shadow-md"
                  )}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  Earn ZAPs
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendZaps?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2.5",
                    "px-5 py-3 rounded-full text-sm font-semibold",
                    "bg-white/10 hover:bg-white/15",
                    "text-gray-800 hover:text-gray-900",
                    "border border-white/30",
                    "transition-all duration-300",
                    "shadow-sm hover:shadow-md"
                  )}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-4 h-4 text-violet-600" />
                  Send ZAPs
                </motion.button>
              </div>
            </motion.div>

            {/* Mobile: Bottom Sheet - Apple Pay Style */}
            <motion.div
              ref={dropdownRef}
              className={cn(
                "md:hidden fixed inset-x-4 bottom-4 z-50",
                "rounded-3xl backdrop-blur-2xl bg-white/10",
                "border border-white/30",
                "shadow-[0_20px_60px_rgba(0,0,0,0.3)]",
                "p-8"
              )}
              initial={{ opacity: 0, y: 100, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.92 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Wallet Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-violet-600" strokeWidth={2} />
                </div>
              </div>

              {/* Balance */}
              <div className="text-center mb-8">
                <motion.p
                  className="text-4xl font-bold text-gray-900 mb-2"
                  key={balance}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {balance.toLocaleString()}
                </motion.p>
                <p className="text-sm text-gray-600 font-medium uppercase tracking-wider">
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
                    "flex items-center justify-center gap-2.5",
                    "px-6 py-4 rounded-2xl text-base font-semibold",
                    "bg-white/20 hover:bg-white/30",
                    "text-gray-900",
                    "border border-white/40",
                    "shadow-lg hover:shadow-xl",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  Earn ZAPs
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendZaps?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2.5",
                    "px-6 py-4 rounded-2xl text-base font-semibold",
                    "bg-white/20 hover:bg-white/30",
                    "text-gray-900",
                    "border border-white/40",
                    "shadow-lg hover:shadow-xl",
                    "transition-all duration-300"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Send className="w-5 h-5 text-violet-600" />
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
