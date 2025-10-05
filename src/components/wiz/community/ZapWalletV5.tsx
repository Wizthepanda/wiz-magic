/**
 * ZAP Wallet V5 — Light Mode Visible Version
 * Premium, minimalistic, optimized for white/bright backgrounds
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZapWalletV5Props {
  balance: number;
  earned?: number;
  spent?: number;
  onEarnMore?: () => void;
  onSendZaps?: () => void;
  className?: string;
}

export const ZapWalletV5: React.FC<ZapWalletV5Props> = ({
  balance,
  earned = 0,
  spent = 0,
  onEarnMore,
  onSendZaps,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
          "relative flex items-center gap-2.5 px-4 py-2.5 rounded-full",
          "border transition-all duration-300",
          "group"
        )}
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,245,245,0.65))",
          borderColor: isOpen ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.08)",
          boxShadow: isOpen
            ? "0 6px 16px rgba(0,0,0,0.08)"
            : "0 4px 12px rgba(0,0,0,0.05)",
        }}
        whileHover={{
          borderColor: "rgba(0,0,0,0.12)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Wallet Icon */}
        <Wallet className="w-[18px] h-[18px] text-[#111111]" strokeWidth={2} />

        {/* Balance Text */}
        <motion.span
          className="font-semibold text-[15px] tracking-tight text-[#111111]"
          key={balance}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {balance.toLocaleString()}
          <span className="text-[#5E5E5E] ml-1 font-medium">ZAPs</span>
        </motion.span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-[#111111]" strokeWidth={2} />
        </motion.div>

        {/* Hover glow accent */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(255, 216, 77, 0.06) 0%, transparent 70%)",
          }}
        />
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className={cn(
              "absolute right-0 top-full mt-2 w-[280px]",
              "rounded-2xl border z-50"
            )}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderColor: "rgba(0, 0, 0, 0.08)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
          >
            <div className="p-5">
              {/* Header */}
              <div className="mb-4">
                <h3
                  className="text-[#111111] font-bold text-base"
                  style={{
                    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  My Wallet
                </h3>
              </div>

              {/* Divider */}
              <div
                className="mb-4"
                style={{
                  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              />

              {/* Balance Lines */}
              <div className="space-y-3 mb-4">
                {/* ZAP Balance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFE877] to-[#FFD84D] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-[#111111]" strokeWidth={2.5} fill="#111111" />
                    </div>
                    <span className="text-[#111111] text-sm font-semibold">ZAP Balance</span>
                  </div>
                  <motion.span
                    className="text-[#111111] font-bold text-sm"
                    key={balance}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  >
                    {balance.toLocaleString()}
                  </motion.span>
                </div>

                {/* Earned */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FFD84D]" strokeWidth={2} fill="#FFD84D" />
                    <span className="text-[#5E5E5E] text-sm font-medium">Earned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#111111] text-sm font-semibold">
                      {earned.toLocaleString()}
                    </span>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendZaps?.();
                      }}
                      className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="w-3.5 h-3.5 text-[#5E5E5E] hover:text-[#FFD84D]" strokeWidth={2} />
                    </motion.button>
                  </div>
                </div>

                {/* Spent */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#5E5E5E]" />
                    </div>
                    <span className="text-[#5E5E5E] text-sm font-medium">Spent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#111111] text-sm font-semibold">
                      {spent.toLocaleString()}
                    </span>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendZaps?.();
                      }}
                      className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="w-3.5 h-3.5 text-[#5E5E5E] hover:text-[#FFD84D]" strokeWidth={2} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                className="mb-4"
                style={{
                  borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              />

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
                  "font-semibold text-sm text-[#111111]",
                  "transition-all duration-300 relative overflow-hidden group"
                )}
                style={{
                  background: "linear-gradient(135deg, #FFE877 0%, #FFD84D 100%)",
                  boxShadow: "0 2px 8px rgba(255, 216, 77, 0.25)",
                }}
                whileHover={{
                  boxShadow: "0 4px 16px rgba(255, 216, 77, 0.4)",
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Hover shimmer */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)",
                  }}
                />

                <Zap className="w-4 h-4 relative z-10" strokeWidth={2.5} fill="#111111" />
                <span className="relative z-10">Earn ZAPs</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZapWalletV5;
