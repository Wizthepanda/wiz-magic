import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface MinimalRewardToastProps {
  xp: number;
}

export const MinimalRewardToast = memo<MinimalRewardToastProps>(({ xp }) => {
  return (
    <motion.div
      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg gpu-accelerated"
      initial={{ scale: 0.6, opacity: 0, y: 10 }}
      animate={{
        scale: [0.6, 1.1, 1.0],
        opacity: [0, 1, 1, 0],
        y: [10, -5, -10, -20]
      }}
      transition={{
        duration: 1.6,
        times: [0, 0.3, 0.7, 1],
        ease: "easeOut"
      }}
    >
      <motion.div
        animate={{
          rotate: [0, -10, 10, -5, 5, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 0.9,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1]
        }}
      >
        <Zap
          className="w-5 h-5 text-yellow-300"
          fill="currentColor"
          style={{ filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.8))' }}
        />
      </motion.div>

      <motion.span
        className="font-bold text-sm"
        animate={{
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 0.6,
          delay: 0.2
        }}
      >
        +{xp} ⚡ ZAPs
      </motion.span>
    </motion.div>
  );
});

MinimalRewardToast.displayName = 'MinimalRewardToast';