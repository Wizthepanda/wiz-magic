"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  joinType: "Free" | "Free ZAPs" | "Paid" | "Paid ZAPs" | "ZAPs + USD";
  zapReward?: number;
  onEnterCommunity?: () => void;
  onViewCommunities?: () => void;
  communityLogoUrl?: string; // Optional: for logo glow
}

export default function CommunityJoinSuccessOverlay({
  isOpen,
  onClose,
  communityName,
  joinType,
  zapReward = 50,
  onEnterCommunity,
  onViewCommunities,
  communityLogoUrl,
}: Props) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Color chip logic
  const joinTypeColor =
    joinType === "Free"
      ? "bg-gray-100 text-gray-700"
      : joinType === "Free ZAPs"
      ? "bg-blue-100 text-blue-700"
      : joinType === "Paid"
      ? "bg-green-100 text-green-700"
      : joinType === "Paid ZAPs"
      ? "bg-purple-100 text-purple-700"
      : "bg-yellow-100 text-yellow-700";

  // Optional: handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="relative w-[440px] rounded-3xl bg-white/70 backdrop-blur-2xl shadow-2xl p-8 text-center overflow-hidden"
          >
            {/* Animated Gradient Border */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-[2.5px] border-transparent pointer-events-none"
              style={{
                background:
                  "linear-gradient(120deg, #6B4EFF 0%, #4BC0FF 100%)",
                opacity: 0.35,
                zIndex: 1,
              }}
            />
            {/* Card Content */}
            <div className="relative z-10 flex flex-col items-center space-y-4">
              {/* Success Icon or Community Logo */}
              <div className="mb-2">
                {communityLogoUrl ? (
                  <motion.img
                    src={communityLogoUrl}
                    alt="Community Logo"
                    className="w-16 h-16 rounded-full shadow-lg border-4 border-white"
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1.1, opacity: 1, boxShadow: "0 0 32px #6B4EFF88" }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  />
                ) : (
                  <CheckCircle
                    size={56}
                    className="mx-auto text-transparent bg-clip-text bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] drop-shadow-lg"
                  />
                )}
              </div>
              {/* Header */}
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to <span className="text-[#6B4EFF]">{communityName}</span> ✨
              </h2>
              {/* Subtext */}
              <p className="text-base text-gray-700">
                You’ve successfully joined this community using{" "}
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${joinTypeColor}`}>
                  {joinType}
                </span>
                .
              </p>
              {/* ZAP Reward */}
              <div className="mt-1 text-sm text-gray-700 font-medium flex items-center justify-center gap-1">
                You earned <span className="text-[#6B4EFF] font-bold">+{zapReward} ZAPs</span>
                <span className="ml-1">⚡</span>
              </div>
              {/* CTA Buttons */}
              <div className="flex gap-3 justify-center mt-5">
                <button
                  className="px-5 py-2 rounded-lg text-white text-base font-semibold bg-gradient-to-r from-[#6B4EFF] to-[#4BC0FF] shadow-md hover:opacity-90 transition"
                  onClick={onEnterCommunity || onClose}
                >
                  Enter Community
                </button>
                <button
                  className="px-5 py-2 rounded-lg text-base font-semibold border border-gray-300 text-gray-800 bg-white/60 hover:bg-gray-100 transition"
                  onClick={onViewCommunities || onClose}
                >
                  View My Communities
                </button>
              </div>
            </div>
            {/* Optional: Confetti, Sparkle, or Glow Animations */}
            {/* Add react-confetti or Lottie here if desired */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
