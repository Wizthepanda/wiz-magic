import React, { useState, useEffect } from "react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useXp } from "@/context/XpContext";

interface VideoPanelProps {
  videoId: string;
  title: string;
  creator: string;
  xpReward: number;
  isOpen: boolean;
  onClose: () => void;
  onReward: (xp: number) => void; // callback when XP is earned
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  videoId,
  title,
  creator,
  xpReward,
  isOpen,
  onClose,
  onReward,
}) => {
  const { addXp } = useXp();
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [rewarded, setRewarded] = useState(false);

  // Reset rewarded state when video changes
  useEffect(() => {
    setRewarded(false);
    setProgress(0);
  }, [videoId]);

  // Poll progress every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (player) {
      interval = setInterval(() => {
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        if (duration > 0) {
          const percent = (currentTime / duration) * 100;
          setProgress(percent);

          // Reward XP when fully watched (≥ 95% to account for edge cases)
          if (percent >= 95 && !rewarded) {
            setRewarded(true);
            
            // Add XP to global context (triggers real-time UI updates)
            addXp(xpReward);
            
            // Optional callback for additional handling
            onReward(xpReward);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [player, rewarded, xpReward, onReward]);

  const onReady = (event: YouTubeEvent) => {
    setPlayer(event.target);
  };

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // click outside to close
        >
          <motion.div
            className="relative w-full max-w-2xl mx-4 rounded-2xl bg-[#0d0d0f] shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()} // prevent close on content click
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition z-10"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Video Area */}
            <div className="aspect-video w-full bg-black">
              <YouTube
                videoId={videoId}
                opts={{
                  width: "100%",
                  height: "100%",
                  playerVars: { autoplay: 0 },
                }}
                onReady={onReady}
                className="w-full h-full rounded-t-2xl"
              />
            </div>

            {/* Custom Progress Bar */}
            <div className="relative w-full h-1.5 bg-gray-700">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                style={{ width: `${progress}%` }}
                layout
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>

            {/* Info Section */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{creator}</p>
              </div>
              <span
                className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                  rewarded
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-purple-500 to-purple-700 text-white"
                } shadow-md shadow-purple-500/30`}
              >
                {rewarded ? `+${xpReward} XP Earned` : `+${xpReward} XP`}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};