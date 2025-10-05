/**
 * Community Wallet V4 — Premium Glassmorphic Design
 * Luxurious, visible, and seamlessly integrated
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, Send, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunityWalletV4Props {
  balance: number;
  earned?: number;
  spent?: number;
  onEarnMore?: () => void;
  onSendZaps?: () => void;
  className?: string;
}

export const CommunityWalletV4: React.FC<CommunityWalletV4Props> = ({
  balance,
  earned = 0,
  spent = 0,
  onEarnMore,
  onSendZaps,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Pulse animation every 3 seconds
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 3000);

    return () => clearInterval(pulseInterval);
  }, []);

  // Close dropdown on outside click
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
      {/* Wallet Capsule Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center gap-3 px-5 py-3 rounded-full",
          "backdrop-blur-[20px]",
          "border border-white/10",
          "transition-all duration-300",
          "group overflow-hidden"
        )}
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.15) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
        whileHover={{
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 6px 16px rgba(255, 216, 77, 0.15)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Hover Glow Underlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255, 216, 77, 0.1) 0%, transparent 70%)",
          }}
        />

        {/* Wallet Icon */}
        <div className="relative z-10">
          <Wallet className="w-5 h-5 text-white opacity-80" strokeWidth={2} />
        </div>

        {/* ZAP Balance with Pulsing Orb */}
        <div className="relative flex items-center gap-2 z-10">
          {/* Pulsing Orb Background */}
          <motion.div
            className="absolute -left-1 -top-1 w-8 h-8 rounded-full pointer-events-none"
            animate={
              isPulsing
                ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0],
                  }
                : {}
            }
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(255, 216, 77, 0.4) 0%, transparent 70%)",
            }}
          />

          {/* Balance Text */}
          <motion.span
            className="font-semibold text-[15px] text-white tracking-tight"
            key={balance}
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {balance.toLocaleString()}
            <span className="text-white/70 ml-1 font-medium">ZAPs</span>
          </motion.span>
        </div>

        {/* Chevron Icon */}
        <motion.div
          className="relative z-10"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-white opacity-60" strokeWidth={2} />
        </motion.div>

        {/* Inner Shimmer Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)",
          }}
        />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className={cn(
              "absolute right-0 top-full mt-3 w-[280px]",
              "backdrop-blur-[24px] rounded-2xl",
              "border border-white/10",
              "p-5 z-50"
            )}
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.12) 100%)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Particle Shimmer on Open */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 1.5 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(255, 216, 77, 0.2) 0%, transparent 50%)",
                }}
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </motion.div>

            {/* Header */}
            <div className="mb-4">
              <h3 className="text-white font-semibold text-base mb-1">My Wallet</h3>
            </div>

            {/* Balance Lines */}
            <div className="space-y-3 mb-4">
              {/* ZAP Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FFD84D] fill-[#FFD84D]" strokeWidth={2} />
                  <span className="text-white text-sm font-medium">ZAP Balance</span>
                </div>
                <motion.span
                  className="text-white font-semibold text-sm"
                  key={balance}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                >
                  {balance.toLocaleString()}
                </motion.span>
              </div>

              {/* Earned */}
              <div className="flex items-center justify-between">
                <span className="text-[#B5B5B5] text-sm">Earned</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    {earned.toLocaleString()}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendZaps?.();
                    }}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send className="w-3.5 h-3.5 text-white opacity-80" strokeWidth={2} />
                  </motion.button>
                </div>
              </div>

              {/* Spent */}
              <div className="flex items-center justify-between">
                <span className="text-[#B5B5B5] text-sm">Spent</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    {spent.toLocaleString()}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendZaps?.();
                    }}
                    className="p-1 rounded-md hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send className="w-3.5 h-3.5 text-white opacity-80" strokeWidth={2} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-4" />

            {/* Earn ZAPs Button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onEarnMore?.();
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "px-5 py-3 rounded-full",
                "backdrop-blur-[16px]",
                "border border-[#FFD84D]/20",
                "font-semibold text-sm text-white",
                "transition-all duration-300 relative overflow-hidden group"
              )}
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 216, 77, 0.15) 0%, rgba(255, 216, 77, 0.25) 100%)",
                boxShadow:
                  "0 0 20px rgba(255, 216, 77, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
              whileHover={{
                boxShadow:
                  "0 0 30px rgba(255, 216, 77, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                scale: 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Hover Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255, 216, 77, 0.3) 0%, transparent 70%)",
                }}
              />

              <Sparkles className="w-4 h-4 text-[#FFD84D] relative z-10" strokeWidth={2} />
              <span className="relative z-10">Earn ZAPs</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityWalletV4;
