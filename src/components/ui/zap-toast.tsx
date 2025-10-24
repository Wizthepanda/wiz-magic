import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ZapToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

/**
 * ZAP Toast - Premium toast notification with particle animation
 *
 * Features:
 * - Floating ZAP particles
 * - Gradient background with glow
 * - Auto-dismiss after duration
 * - Smooth enter/exit animations
 */
export const ZapToast: React.FC<ZapToastProps> = ({
  message,
  show,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className="relative">
            {/* Glow Effect */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60"
            />

            {/* Toast Card */}
            <div
              className={cn(
                "relative backdrop-blur-xl rounded-2xl px-6 py-4",
                "bg-gradient-to-r from-purple-600 to-pink-600",
                "border border-white/20 shadow-2xl",
                "flex items-center gap-4 min-w-[320px]"
              )}
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 15,
                  delay: 0.2,
                }}
                className="flex-shrink-0"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Message */}
              <div className="flex-1">
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white font-semibold text-base flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {message}
                </motion.p>
              </div>

              {/* Floating ZAP Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      x: `${20 + (i % 4) * 25}%`,
                      y: '100%',
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      y: [' 100%', '-20%'],
                      x: [
                        `${20 + (i % 4) * 25}%`,
                        `${20 + (i % 4) * 25 + (Math.random() * 30 - 15)}%`,
                      ],
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1, 1, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: 'easeOut',
                    }}
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </motion.div>
                ))}
              </div>

              {/* Sparkle Effects */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute"
                    initial={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      rotate: [0, 180],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.15,
                      ease: 'easeOut',
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ZapToast;
