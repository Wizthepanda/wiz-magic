/**
 * ZAP Wallet Icon - Premium Redesigned Version
 * Now using HeaderDropdown with Floating UI positioning
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Send, Zap, Search, CheckCircle2, X, Link2, Users, TrendingUp, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { HeaderDropdown } from "@/components/ui/HeaderDropdown";

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
  const [isSendMode, setIsSendMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [zapAmount, setZapAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const referralLink = user ? `${window.location.origin}?ref=${user.uid}` : "";

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSendMode) {
        setIsSendMode(false);
      }
    };
    if (isSendMode) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSendMode]);

  useEffect(() => {
    if (isSendMode && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSendMode]);

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
      setLinkCopied(true);
      toast({
        title: "Copied! ⚡",
        description: "Share with your friends",
      });
      setTimeout(() => setLinkCopied(false), 2000);
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
      toast({
        title: "⚡ ZAP Sent!",
        description: `Successfully sent ${amount} ZAPs to ${selectedUser.displayName}`,
      });
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

  // Trigger button
  const triggerButton = (
    <button
      type="button"
      aria-label="ZAP Wallet"
      className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#6B4EFF] via-[#7C5FFF] to-[#4BC0FF] hover:from-[#7C5FFF] hover:via-[#8D6FFF] hover:to-[#5DD1FF] transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl hover:scale-105"
    >
      <Wallet size={20} strokeWidth={2.5} className="text-white" />
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </button>
  );

  // Dropdown content
  const dropdownContent = (
    <div className="w-[380px] max-w-[calc(100vw-2rem)]">
      <div
        style={{
          background: "linear-gradient(180deg, rgba(30, 32, 46, 0.98) 0%, rgba(20, 22, 36, 0.98) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(107, 78, 255, 0.2)",
        }}
      >
        {/* Premium Header with Gradient */}
        <div className="relative p-6 bg-gradient-to-r from-[#6B4EFF]/20 via-[#7C5FFF]/10 to-[#4BC0FF]/20 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6B4EFF]/5 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B4EFF] to-[#4BC0FF] flex items-center justify-center shadow-lg shadow-[#6B4EFF]/30">
                <Wallet className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">My Wallet</h3>
                <p className="text-white/60 text-xs">Manage your ZAPs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Display - Premium Card */}
        <div className="p-6">
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#FFD84D]/20 via-[#FFA834]/20 to-[#FF6B35]/20 border border-[#FFD84D]/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFD84D] to-[#FFA834] flex items-center justify-center shadow-lg">
                    <Zap className="w-4 h-4 text-[#1E202E]" strokeWidth={3} fill="#1E202E" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Total Balance</span>
                </div>
                {earned > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/30"
                  >
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs font-semibold">+{earned}</span>
                  </motion.div>
                )}
              </div>
              <motion.h2
                key={balance}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold bg-gradient-to-r from-[#FFD84D] via-[#FFA834] to-[#FF6B35] bg-clip-text text-transparent"
              >
                {balance.toLocaleString()}
              </motion.h2>
              <p className="text-white/50 text-xs mt-1">ZAPs available</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setIsSendMode(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              <span className="text-white/90 text-sm font-medium">Send</span>
            </motion.button>
            <motion.button
              onClick={handleCopyReferralLink}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#6B4EFF]/20 to-[#4BC0FF]/20 hover:from-[#6B4EFF]/30 hover:to-[#4BC0FF]/30 border border-[#6B4EFF]/30 transition-all duration-200 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {linkCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Link2 className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
              )}
              <span className="text-white/90 text-sm font-medium">
                {linkCopied ? "Copied!" : "Refer"}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Send ZAPs Section */}
        <AnimatePresence>
          {isSendMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="border-t border-white/10 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-white/70" />
                    <span className="text-white font-semibold text-sm">Send ZAPs</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsSendMode(false);
                      setSearchQuery("");
                      setSelectedUser(null);
                      setZapAmount("");
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>

                {selectedUser ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-[#6B4EFF]/20 to-[#4BC0FF]/20 border border-[#6B4EFF]/30"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={selectedUser.photoURL}
                        alt={selectedUser.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#6B4EFF]/50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-semibold text-sm truncate">
                            {selectedUser.displayName}
                          </span>
                          {selectedUser.verified && (
                            <CheckCircle2 className="w-4 h-4 text-[#4BC0FF] flex-shrink-0" fill="#4BC0FF" />
                          )}
                        </div>
                        <span className="text-white/60 text-xs">@{selectedUser.username}</span>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>

                    <div className="relative">
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD84D]" fill="#FFD84D" />
                      <input
                        type="number"
                        value={zapAmount}
                        onChange={(e) => setZapAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        max={balance}
                        className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-white/40 bg-white/5 border border-white/10 focus:border-[#4BC0FF] focus:bg-white/8 transition-all outline-none font-semibold"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 px-1">
                      <span className="text-white/50 text-xs">Available: {balance.toLocaleString()} ZAPs</span>
                      <button
                        onClick={() => setZapAmount(balance.toString())}
                        className="text-[#4BC0FF] text-xs font-semibold hover:text-[#5DD1FF] transition-colors"
                      >
                        Use Max
                      </button>
                    </div>

                    {zapAmount && parseInt(zapAmount) > 0 && (
                      <motion.button
                        onClick={handleSendZaps}
                        disabled={isSending}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full mt-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] hover:shadow-lg hover:shadow-[#6B4EFF]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSending ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send {parseInt(zapAmount).toLocaleString()} ZAPs</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by username..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder-white/40 bg-white/5 border border-white/10 focus:border-[#6B4EFF] focus:bg-white/8 transition-all outline-none"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 space-y-2 max-h-48 overflow-y-auto"
                      >
                        {searchResults.map((user) => (
                          <motion.button
                            key={user.uid}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchQuery("");
                              setSearchResults([]);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                            />
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-white text-sm font-medium truncate">
                                  {user.displayName}
                                </span>
                                {user.verified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4BC0FF]" fill="#4BC0FF" />
                                )}
                              </div>
                              <span className="text-white/50 text-xs">@{user.username}</span>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Referral Section */}
        {!isSendMode && (
          <div className="px-6 pb-6 border-t border-white/10 pt-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#6B4EFF]/10 to-[#4BC0FF]/10 border border-[#6B4EFF]/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#4BC0FF]" />
                <span className="text-white font-semibold text-sm">Invite Friends</span>
              </div>
              <p className="text-white/70 text-xs mb-3 leading-relaxed">
                Share your referral link and earn <span className="text-[#4BC0FF] font-semibold">+50 ZAPs</span> for each friend who joins!
              </p>
              <motion.button
                onClick={handleCopyReferralLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] hover:shadow-lg hover:shadow-[#6B4EFF]/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Referral Link</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <HeaderDropdown
      name="wallet"
      trigger={triggerButton}
      className={className}
      pointerClassName="bg-gradient-to-br from-[#6B4EFF] to-[#4BC0FF]"
    >
      {dropdownContent}
    </HeaderDropdown>
  );
};

export default ZapWalletIcon;
