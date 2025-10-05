/**
 * ZAP Wallet V7 — Send ZAPs Integration
 * Preserves V6 gradient harmony with seamless send functionality
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ChevronDown, Send, Zap, Search, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface ZapWalletV7Props {
  balance: number;
  earned?: number;
  spent?: number;
  onEarnMore?: () => void;
  onSendZaps?: (recipient: string, amount: number) => Promise<void>;
  className?: string;
}

interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  verified?: boolean;
}

export const ZapWalletV7: React.FC<ZapWalletV7Props> = ({
  balance,
  earned = 0,
  spent = 0,
  onEarnMore,
  onSendZaps,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSendMode, setIsSendMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [zapAmount, setZapAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        setIsSendMode(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isSendMode) {
          setIsSendMode(false);
        } else {
          setIsOpen(false);
        }
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
  }, [isOpen, isSendMode]);

  // Auto-focus search input when send mode opens
  useEffect(() => {
    if (isSendMode && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSendMode]);

  // Search users with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("username", ">=", searchQuery.toLowerCase()),
          where("username", "<=", searchQuery.toLowerCase() + "\uf8ff"),
          limit(5)
        );

        const snapshot = await getDocs(q);
        const results: UserProfile[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          results.push({
            uid: doc.id,
            username: data.username || "",
            displayName: data.displayName || data.username || "Unknown User",
            photoURL: data.photoURL || "/Profile Pics/FERA.jpg",
            verified: data.verified || false,
          });
        });

        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSendZaps = async () => {
    if (!selectedUser || !zapAmount || parseInt(zapAmount) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a user and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const amount = parseInt(zapAmount);
    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${balance} ZAPs available`,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      await onSendZaps?.(selectedUser.uid, amount);

      // Success animation
      toast({
        title: "⚡ ZAP Sent!",
        description: `Successfully sent ${amount} ZAPs to ${selectedUser.displayName}`,
      });

      // Reset form
      setSearchQuery("");
      setZapAmount("");
      setSelectedUser(null);
      setIsSendMode(false);
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Unable to send ZAPs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

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
            className={cn("absolute right-0 top-full mt-3 w-[280px] rounded-2xl z-50 overflow-hidden")}
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
                  <span className="text-white text-sm font-semibold">
                    {earned.toLocaleString()}
                  </span>
                </div>

                {/* Spent */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#7F5AF0] to-[#6B4FD8] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-[#E8E8E8] text-sm font-medium">Spent</span>
                  </div>
                  <span className="text-white text-sm font-semibold">
                    {spent.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                className="mb-4"
                style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.15)",
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

              {/* Send ZAPs Section */}
              <AnimatePresence>
                {!isSendMode ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3"
                  >
                    {/* Divider */}
                    <div
                      className="mb-3"
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    />

                    {/* Send ZAPs Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSendMode(true);
                      }}
                      className={cn(
                        "w-full flex items-center justify-center gap-2",
                        "px-4 py-2.5 rounded-xl",
                        "text-white/85 text-sm font-medium",
                        "hover:bg-white/10 transition-all duration-200"
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Send className="w-4 h-4" strokeWidth={2} />
                      <span>Send ZAPs</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 280 }}
                    className="mt-4 space-y-3"
                  >
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-white/85" strokeWidth={2} />
                        <span className="text-white/85 text-sm font-semibold">Send ZAPs</span>
                      </div>
                      <motion.button
                        onClick={() => {
                          setIsSendMode(false);
                          setSearchQuery("");
                          setSelectedUser(null);
                          setZapAmount("");
                        }}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-3.5 h-3.5 text-white/60" strokeWidth={2} />
                      </motion.button>
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }} />

                    {/* Selected User or Search Input */}
                    {selectedUser ? (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: "rgba(127, 90, 240, 0.15)",
                          border: "1px solid rgba(127, 90, 240, 0.3)",
                        }}
                      >
                        <img
                          src={selectedUser.photoURL}
                          alt={selectedUser.displayName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white text-sm font-semibold truncate">
                              {selectedUser.displayName}
                            </span>
                            {selectedUser.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4CC9F0] flex-shrink-0" fill="#4CC9F0" />
                            )}
                          </div>
                          <span className="text-white/60 text-xs">@{selectedUser.username}</span>
                        </div>
                        <motion.button
                          onClick={() => setSelectedUser(null)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="w-3.5 h-3.5 text-white/60" strokeWidth={2} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <>
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" strokeWidth={2} />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search username..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 bg-white/5 border border-white/10 focus:border-[#7F5AF0] focus:bg-white/8 transition-all outline-none"
                            style={{
                              backdropFilter: "blur(4px)",
                            }}
                          />
                        </div>

                        {/* Search Results */}
                        <AnimatePresence>
                          {searchResults.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-1 max-h-40 overflow-y-auto"
                            >
                              {searchResults.map((user) => (
                                <motion.button
                                  key={user.uid}
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setSearchQuery("");
                                    setSearchResults([]);
                                  }}
                                  className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                  whileHover={{ x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="text-white text-xs font-medium truncate">
                                        {user.displayName}
                                      </span>
                                      {user.verified && (
                                        <CheckCircle2 className="w-3 h-3 text-[#4CC9F0] flex-shrink-0" fill="#4CC9F0" />
                                      )}
                                    </div>
                                    <span className="text-white/50 text-xs">@{user.username}</span>
                                  </div>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                    {/* Amount Input */}
                    {selectedUser && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="relative">
                          <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFD84D]" strokeWidth={2} fill="#FFD84D" />
                          <input
                            type="number"
                            value={zapAmount}
                            onChange={(e) => setZapAmount(e.target.value)}
                            placeholder="Amount"
                            min="1"
                            max={balance}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 bg-white/5 border border-white/10 focus:border-[#4CC9F0] focus:bg-white/8 transition-all outline-none"
                            style={{
                              backdropFilter: "blur(4px)",
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5 px-1">
                          <span className="text-white/40 text-xs">Available: {balance} ZAPs</span>
                          <motion.button
                            onClick={() => setZapAmount(balance.toString())}
                            className="text-[#4CC9F0] text-xs font-medium hover:text-[#58D1F4] transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Max
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {/* Send Button */}
                    {selectedUser && zapAmount && (
                      <motion.button
                        onClick={handleSendZaps}
                        disabled={isSending}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={cn(
                          "w-full flex items-center justify-center gap-2",
                          "px-4 py-2.5 rounded-xl",
                          "font-semibold text-sm text-white",
                          "transition-all duration-300 relative overflow-hidden",
                          isSending && "opacity-70 cursor-not-allowed"
                        )}
                        style={{
                          background: "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
                          boxShadow: "0 4px 12px rgba(127, 90, 240, 0.3)",
                        }}
                        whileHover={!isSending ? {
                          boxShadow: "0 6px 20px rgba(127, 90, 240, 0.5)",
                          scale: 1.02,
                        } : {}}
                        whileTap={!isSending ? { scale: 0.98 } : {}}
                      >
                        {/* Pulse animation when sending */}
                        {isSending && (
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{
                              background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
                            }}
                          />
                        )}

                        <Send className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                        <span className="relative z-10">
                          {isSending ? "Sending..." : "Send ZAPs"}
                        </span>
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZapWalletV7;
