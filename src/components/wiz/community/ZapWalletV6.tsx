/**
 * ZAP Wallet V6 — Purple-Blue Gradient Harmony Edition
 * Premium, futuristic, Web2-clean elegance
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, Send, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZapWalletV6Props {
  balance: number;
  earned?: number;
  spent?: number;
  onEarnMore?: () => void;
  onSendZaps?: () => void;
  className?: string;
}

export const ZapWalletV6: React.FC<ZapWalletV6Props> = ({
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
      {/* Wallet Capsule Button - Purple-Blue Gradient */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center gap-2.5 px-5 py-3 rounded-full",
          "transition-all duration-300",
          "group overflow-hidden"
        )}
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #8E66F2 0%, #58D1F4 100%)"
            : "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: isOpen
            ? "0 6px 16px rgba(127, 90, 240, 0.35)"
            : "0 4px 12px rgba(127, 90, 240, 0.25)",
        }}
        whileHover={{
          boxShadow: "0 6px 20px rgba(76, 201, 240, 0.4)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Gradient Shimmer on Hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
          }}
        />

        {/* Wallet Icon with Glow */}
        <motion.div
          whileHover={{
            filter: "drop-shadow(0 0 8px rgba(197, 243, 255, 0.6))",
          }}
          transition={{ duration: 0.3 }}
        >
          <Wallet className="w-[18px] h-[18px] text-white relative z-10" strokeWidth={2} />
        </motion.div>

        {/* Balance Text */}
        <motion.span
          className="font-semibold text-[15px] tracking-tight text-white relative z-10"
          key={balance}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          {balance.toLocaleString()}
          <span className="text-white/85 ml-1 font-medium">ZAPs</span>
        </motion.span>

        {/* Chevron */}
        <motion.div
          className="relative z-10"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-white" strokeWidth={2} />
        </motion.div>

        {/* Outer Glow on Hover */}
        <motion.div
          className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
          style={{
            background: "linear-gradient(135deg, #4CC9F0 0%, #7F5AF0 100%)",
            filter: "blur(8px)",
          }}
        />
      </motion.button>

      {/* Dropdown Panel - Dark Glass Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className={cn("absolute right-0 top-full mt-3 w-[280px] rounded-2xl z-50")}
            style={{
              background: "rgba(30, 32, 46, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
          >
            <div className="p-5">
              {/* Header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#4CC9F0] flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <h3
                  className="text-white font-bold text-base"
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
                  borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              />

              {/* Balance Lines */}
              <div className="space-y-3 mb-4">
                {/* ZAP Balance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD84D] to-[#FFA834] flex items-center justify-center">
                      <Zap
                        className="w-3.5 h-3.5 text-[#1E202E]"
                        strokeWidth={2.5}
                        fill="#1E202E"
                      />
                    </div>
                    <span className="text-white text-sm font-semibold">ZAP Balance</span>
                  </div>
                  <motion.span
                    className="text-white font-bold text-sm"
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
                    <Zap
                      className="w-4 h-4 text-[#4CC9F0]"
                      strokeWidth={2}
                      fill="#4CC9F0"
                    />
                    <span className="text-[#E8E8E8] text-sm font-medium">Earned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">
                      {earned.toLocaleString()}
                    </span>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendZaps?.();
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send
                        className="w-3.5 h-3.5 text-white/70 group-hover:text-[#C5F3FF] transition-colors"
                        strokeWidth={2}
                      />
                    </motion.button>
                  </div>
                </div>

                {/* Spent */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#6B4FD8] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-[#E8E8E8] text-sm font-medium">Spent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-semibold">
                      {spent.toLocaleString()}
                    </span>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendZaps?.();
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send
                        className="w-3.5 h-3.5 text-white/70 group-hover:text-[#C5F3FF] transition-colors"
                        strokeWidth={2}
                      />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                className="mb-4"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              />

              {/* Earn ZAPs Button - Blue-Gold Gradient */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onEarnMore?.();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5",
                  "px-5 py-3 rounded-full",
                  "font-semibold text-sm text-white",
                  "transition-all duration-300 relative overflow-hidden group"
                )}
                style={{
                  background: "linear-gradient(135deg, #4CC9F0 0%, #FFD84D 100%)",
                  boxShadow: "0 4px 12px rgba(76, 201, 240, 0.3)",
                }}
                whileHover={{
                  boxShadow: "0 6px 20px rgba(76, 201, 240, 0.5)",
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Inner Glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                  }}
                />

                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                  }}
                />

                <Zap className="w-4 h-4 relative z-10" strokeWidth={2.5} fill="white" />
                <span className="relative z-10">Earn ZAPs</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZapWalletV6;
