import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AuthLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

/**
 * ChatGPT-style premium loading overlay for authentication
 * Features:
 * - Smooth fade in/out animations
 * - Elegant spinner with gradient
 * - Premium glassmorphic backdrop
 * - No page reload or jarring transitions
 */
export const AuthLoadingOverlay = ({ isVisible, message = 'Signing you in...' }: AuthLoadingOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Premium Spinner */}
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-4 border-transparent"
                style={{
                  borderTopColor: '#C29FFF',
                  borderRightColor: '#A78BFA',
                  borderBottomColor: '#8B5CF6',
                }}
              />

              {/* Inner glow */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="w-12 h-12 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(194, 159, 255, 0.4) 0%, transparent 70%)',
                  }}
                />
              </motion.div>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </motion.div>
              </div>
            </div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-center"
            >
              <p className="text-lg font-medium text-gray-800">{message}</p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm text-gray-500 mt-1"
              >
                This will only take a moment
              </motion.p>
            </motion.div>

            {/* Decorative dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 rounded-full bg-purple-400"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
