/**
 * ZAP Wallet Icon - Dashboard Header Version
 * Compact glassmorphic icon button with full V8 wallet dropdown
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Send, Zap, Search, CheckCircle2, X, Link2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ZapWalletIconProps {
  balance: number;
  earned?: number;
  spent?: number;
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

export const ZapWalletIcon: React.FC<ZapWalletIconProps> = ({
  balance,
  earned = 0,
  spent = 0,
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
  const { user } = useAuth();

  // Generate referral link
  const referralLink = user ? `${window.location.origin}?ref=${user.uid}` : "";

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

  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied to clipboard! ⚡",
        description: "Share with your friends",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

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
    <div className={cn("relative z-[10000]", className)}>
      {/* Gradient Outline Wallet Icon */}
      <button
        ref={buttonRef}
        aria-label="ZAP Wallet"
        onClick={() => setIsOpen(!isOpen)}
        className="relative group hover:opacity-90 transition-all duration-200"
      >
        <div className="relative">
          <Wallet
            size={22}
            strokeWidth={1.8}
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, #6B4EFF, #4BC0FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "0.6px #4A4A4A",
            }}
          />
          {/* Subtle gradient outline for visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] opacity-60 blur-[2px] rounded-full -z-10" />
        </div>
      </button>

      {/* Dropdown Panel - Dark Glass Theme */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className={cn("absolute right-0 top-full mt-3 w-[320px] rounded-2xl overflow-hidden")}
            style={{
              zIndex: 10000,
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
                <h3 className="text-white font-bold text-base" style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}>
                  My Wallet
                </h3>
              </div>

              {/* Divider */}
              <div className="mb-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)" }} />

              {/* Balance Display */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD84D] to-[#FFA834] flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-[#1E202E]" strokeWidth={2.5} fill="#1E202E" />
                    </div>
                    <span className="text-white text-sm font-semibold">Balance</span>
                  </div>
                  <motion.span className="text-white font-bold text-sm" key={balance} initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                    {balance.toLocaleString()}
                  </motion.span>
                </div>
              </div>

              <div className="mb-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)" }} />

              {/* ZAP Friends Section */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-white/85" strokeWidth={2} />
                  <span className="text-white font-bold text-sm">ZAP Friends</span>
                </div>
                <p className="text-white/80 text-xs mb-3 leading-relaxed">
                  Invite your friends and earn together
                </p>
                <motion.button
                  onClick={handleCopyReferralLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm text-white transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
                    boxShadow: "0 4px 12px rgba(127, 90, 240, 0.3)",
                  }}
                  whileHover={{ boxShadow: "0 6px 20px rgba(127, 90, 240, 0.5)", scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link2 className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">Copy My Referral Link</span>
                </motion.button>
                <p className="text-white/60 text-xs mt-2.5 text-center">
                  Friend joins → <span className="text-[#4CC9F0] font-semibold">+50 ZAPs</span> each!
                </p>
              </div>

              <div className="mb-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }} />

              {/* Send ZAPs Section */}
              <AnimatePresence>
                {!isSendMode ? (
                  <motion.button
                    onClick={() => setIsSendMode(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white/85 text-sm font-medium hover:bg-white/10 transition-all duration-200"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                    <span>Send ZAPs</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 280 }}
                    className="space-y-3"
                  >
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

                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }} />

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
                        <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-9 h-9 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white text-sm font-semibold truncate">{selectedUser.displayName}</span>
                            {selectedUser.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#4CC9F0] flex-shrink-0" fill="#4CC9F0" />}
                          </div>
                          <span className="text-white/60 text-xs">@{selectedUser.username}</span>
                        </div>
                        <motion.button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <X className="w-3.5 h-3.5 text-white/60" strokeWidth={2} />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" strokeWidth={2} />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search username..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/40 bg-white/5 border border-white/10 focus:border-[#7F5AF0] focus:bg-white/8 transition-all outline-none"
                          style={{ backdropFilter: "blur(4px)" }}
                        />
                        {searchResults.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-1 max-h-32 overflow-y-auto">
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
                                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-white text-xs font-medium truncate">{user.displayName}</span>
                                    {user.verified && <CheckCircle2 className="w-3 h-3 text-[#4CC9F0]" fill="#4CC9F0" />}
                                  </div>
                                  <span className="text-white/50 text-xs">@{user.username}</span>
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {selectedUser && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
                            style={{ backdropFilter: "blur(4px)" }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5 px-1">
                          <span className="text-white/40 text-xs">Available: {balance} ZAPs</span>
                          <motion.button onClick={() => setZapAmount(balance.toString())} className="text-[#4CC9F0] text-xs font-medium hover:text-[#58D1F4] transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Max
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {selectedUser && zapAmount && (
                      <motion.button
                        onClick={handleSendZaps}
                        disabled={isSending}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 relative overflow-hidden",
                          isSending && "opacity-70 cursor-not-allowed"
                        )}
                        style={{
                          background: "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
                          boxShadow: "0 4px 12px rgba(127, 90, 240, 0.3)",
                        }}
                        whileHover={!isSending ? { boxShadow: "0 6px 20px rgba(127, 90, 240, 0.5)", scale: 1.02 } : {}}
                        whileTap={!isSending ? { scale: 0.98 } : {}}
                      >
                        {isSending && (
                          <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%)" }}
                          />
                        )}
                        <Send className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                        <span className="relative z-10">{isSending ? "Sending..." : "Send ZAPs"}</span>
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

export default ZapWalletIcon;
