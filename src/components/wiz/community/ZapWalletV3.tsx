/**
 * ZAP Wallet V3 — Seamless Premium Integration
 * Ultra-minimal, glassmorphic, Apple-level smoothness
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZapWalletV3Props {
  balance: number;
  onEarnMore?: () => void;
  onSendZaps?: () => void;
  className?: string;
}

export const ZapWalletV3: React.FC<ZapWalletV3Props> = ({
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

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      {/* Desktop: Inline Icon + Balance */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "hidden md:inline-flex items-center gap-2",
          "text-white/90 hover:text-white",
          "transition-all duration-300 ease-out",
          "group relative"
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* ZAP Icon with Glow */}
        <motion.div
          className="relative"
          whileHover={{
            filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.35))",
          }}
        >
          <Zap className="w-[18px] h-[18px] text-white fill-white" strokeWidth={2.5} />
        </motion.div>

        {/* Balance Text */}
        <motion.span
          className="font-semibold text-[15px] tracking-tight"
          key={balance}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {balance.toLocaleString()} ZAPs
        </motion.span>

        {/* Subtle hover glow */}
        <motion.div
          className="absolute -inset-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
          }}
        />
      </motion.button>

      {/* Mobile: Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden w-10 h-10 rounded-full",
          "bg-white/10 backdrop-blur-xl border border-white/20",
          "flex items-center justify-center",
          "shadow-lg"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap className="w-5 h-5 text-white fill-white" strokeWidth={2.5} />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Desktop Dropdown */}
            <motion.div
              ref={dropdownRef}
              className={cn(
                // Desktop positioning
                "hidden md:block absolute right-0 top-full mt-2",
                "w-[240px]",
                // Glassmorphic styling
                "backdrop-blur-2xl bg-gradient-to-br from-white/5 via-[#f7f9fb]/10 to-[#eef2f7]/20",
                "border border-white/10 rounded-2xl",
                "shadow-[0_0_20px_rgba(255,255,255,0.08)]",
                "p-4",
                "z-50"
              )}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.25,
              }}
            >
              {/* Header - Balance Display */}
              <div className="mb-3">
                <motion.div
                  className="flex items-baseline gap-1.5 mb-1"
                  key={balance}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {balance.toLocaleString()}
                  </span>
                  <Zap className="w-4 h-4 text-white fill-white mb-1" strokeWidth={2.5} />
                </motion.div>
                <p className="text-xs text-white/50 uppercase tracking-wide font-medium">
                  Your ZAP Balance
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-3" />

              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                {/* Earn ZAPs Button - Gradient Glow */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEarnMore?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "px-4 py-2.5 rounded-full",
                    "bg-gradient-to-r from-indigo-500 to-violet-500",
                    "text-white text-sm font-semibold",
                    "shadow-[0_0_15px_rgba(99,102,241,0.3)]",
                    "hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]",
                    "transition-all duration-300"
                  )}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4" />
                  Earn ZAPs
                </motion.button>

                {/* Send ZAPs Button - Outlined with Glow */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendZaps?.();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "px-4 py-2.5 rounded-full",
                    "bg-white/5 hover:bg-white/10",
                    "border border-white/20 hover:border-white/30",
                    "text-white/90 hover:text-white text-sm font-semibold",
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
                "md:hidden fixed inset-x-0 bottom-0 z-50",
                "backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5",
                "border-t border-white/20",
                "rounded-t-3xl",
                "shadow-[0_-20px_60px_rgba(0,0,0,0.3)]",
                "p-6 pb-8"
              )}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
            >
              {/* Handle Bar */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-1 rounded-full bg-white/30" />
              </div>

              {/* ZAP Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white fill-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Balance */}
              <div className="text-center mb-6">
                <motion.p
                  className="text-4xl font-bold text-white mb-1 tracking-tight"
                  key={balance}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {balance.toLocaleString()}
                </motion.p>
                <p className="text-sm text-white/60 uppercase tracking-wider font-medium">
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
                    "px-6 py-4 rounded-2xl",
                    "bg-gradient-to-r from-indigo-500 to-violet-500",
                    "text-white text-base font-bold",
                    "shadow-[0_0_25px_rgba(99,102,241,0.4)]",
                    "hover:shadow-[0_0_35px_rgba(99,102,241,0.6)]",
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
                    "flex items-center justify-center gap-2.5",
                    "px-6 py-4 rounded-2xl",
                    "bg-white/10 hover:bg-white/20",
                    "border border-white/30",
                    "text-white text-base font-semibold",
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

export default ZapWalletV3;
