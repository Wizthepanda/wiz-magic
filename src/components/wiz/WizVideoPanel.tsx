import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

interface WizVideoPanelProps {
  videoId: string;
  title: string;
  creator: string;
  xpReward: number;
  isOpen: boolean;
  onClose: () => void;
  onXpEarned?: (xp: number) => void;
}

export const WizVideoPanel: React.FC<WizVideoPanelProps> = ({
  videoId,
  title,
  creator,
  xpReward,
  isOpen,
  onClose,
  onXpEarned,
}) => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [xpEarned, setXpEarned] = useState(false);

  // Close modal on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Simulate progress tracking (in real app, you'd integrate with YouTube API)
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.5;
        
        // Trigger XP reward when video is 95% complete
        if (newProgress >= 95 && !xpEarned) {
          setXpEarned(true);
          onXpEarned?.(xpReward);
        }
        
        return Math.min(newProgress, 100);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, xpEarned, xpReward, onXpEarned]);

  // Reset state when panel opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setXpEarned(false);
      setIsLoading(true);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[720px] rounded-2xl bg-[#0d0d0f] shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} className="text-white" />
            </motion.button>

            {/* Video Container */}
            <div className="p-5">
              {/* Video Area */}
              <div className="relative aspect-video w-full mb-4 rounded-xl overflow-hidden bg-gray-900">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <motion.div
                      className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
                
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1`}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  onLoad={() => setIsLoading(false)}
                />
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                />
              </div>

              {/* Info Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left: Title & Creator */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white leading-tight truncate mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center">
                    <Play className="w-3 h-3 mr-1" />
                    {creator}
                  </p>
                </div>

                {/* Right: XP Badge */}
                <motion.div
                  className="flex-shrink-0"
                  animate={xpEarned ? { scale: [1, 1.1, 1] } : {}}
                  transition={xpEarned ? { duration: 0.5 } : {}}
                >
                  <span 
                    className={`px-3 py-1.5 text-sm font-medium rounded-full shadow-md transition-all duration-300 ${
                      xpEarned 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30' 
                        : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-purple-500/30'
                    }`}
                  >
                    {xpEarned ? `+${xpReward} XP Earned!` : `+${xpReward} XP`}
                  </span>
                </motion.div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-500">
                  {progress < 100 ? `${Math.round(progress)}% watched` : 'Video completed!'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};