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
    <div className={cn("relative", className)}>
      {/* Enhanced Visibility Wallet Icon */}
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
            className="text-transparent bg-clip-text relative z-10"
            style={{
              backgroundImage: "linear-gradient(135deg, #6B4EFF, #4BC0FF)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "0.6px #4A4A4A",
            }}
          />
          {/* Subtle gradient outline for visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] opacity-60 blur-[2px] rounded-full -z-10" />
        </div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className={cn("absolute right-0 top-full mt-3 w-[320px] rounded-xl z-[9999] overflow-hidden shadow-xl border border-gray-100 backdrop-blur-md")}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
            }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Total ZAPs</span>
                <span className="text-sm font-bold text-[#6B4EFF]">{balance.toLocaleString()}</span>
              </div>

              {/* ZAP Friends Button */}
              <button
                onClick={handleCopyReferralLink}
                className="w-full bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] text-white text-sm py-2 rounded-lg font-medium hover:opacity-90 transition"
              >
                ZAP Friends ⚡
              </button>

              {/* Send ZAPs Button */}
              <AnimatePresence>
                {!isSendMode ? (
                  <button
                    onClick={() => setIsSendMode(true)}
                    className="w-full bg-gray-100 text-gray-800 text-sm py-2 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    Send ZAPs 💬
                  </button>
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
                        <Send className="w-4 h-4 text-gray-700" strokeWidth={2} />
                        <span className="text-gray-800 text-sm font-semibold">Send ZAPs</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsSendMode(false);
                          setSearchQuery("");
                          setSelectedUser(null);
                          setZapAmount("");
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-gray-600" strokeWidth={2} />
                      </button>
                    </div>

                    <div className="border-t border-gray-200" />

                    {selectedUser ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
                        <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-9 h-9 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-800 text-sm font-semibold truncate">{selectedUser.displayName}</span>
                            {selectedUser.verified && <CheckCircle2 className="w-3.5 h-3.5 text-[#4BC0FF] flex-shrink-0" fill="#4BC0FF" />}
                          </div>
                          <span className="text-gray-600 text-xs">@{selectedUser.username}</span>
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5 text-gray-600" strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search username..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:border-[#6B4EFF] focus:bg-white transition-all outline-none"
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
                                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-gray-800 text-xs font-medium truncate">{user.displayName}</span>
                                    {user.verified && <CheckCircle2 className="w-3 h-3 text-[#4BC0FF]" fill="#4BC0FF" />}
                                  </div>
                                  <span className="text-gray-500 text-xs">@{user.username}</span>
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )}

                    {selectedUser && (
                      <div>
                        <div className="relative">
                          <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" strokeWidth={2} fill="currentColor" />
                          <input
                            type="number"
                            value={zapAmount}
                            onChange={(e) => setZapAmount(e.target.value)}
                            placeholder="Amount"
                            min="1"
                            max={balance}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 focus:border-[#6B4EFF] focus:bg-white transition-all outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5 px-1">
                          <span className="text-gray-500 text-xs">Available: {balance} ZAPs</span>
                          <button onClick={() => setZapAmount(balance.toString())} className="text-[#6B4EFF] text-xs font-medium hover:text-[#4BC0FF] transition-colors">
                            Max
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedUser && zapAmount && (
                      <button
                        onClick={handleSendZaps}
                        disabled={isSending}
                        className={cn(
                          "w-full bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] text-white text-sm py-2 rounded-lg font-medium hover:opacity-90 transition",
                          isSending && "opacity-70 cursor-not-allowed"
                        )}
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
                        {isSending ? "Sending..." : "Send ZAPs"}
                      </button>
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
