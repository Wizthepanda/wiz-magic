/**
 * YouTube Success - Step 4
 *
 * Success confirmation with animated checkmark and confetti effect.
 * Provides next steps and navigation options.
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface YoutubeSuccessProps {
  publishedCount: number;
  onReset: () => void;
}

export const YoutubeSuccess: React.FC<YoutubeSuccessProps> = ({ publishedCount, onReset }) => {
  const navigate = useNavigate();

  // Trigger confetti on mount
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ['#ff416c', '#ff4b2b', '#9333ea', '#ec4899'],
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Main Success Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-white border border-purple-100 shadow-2xl p-12 text-center"
      >
        {/* Animated Background Gradient Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Animated Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="inline-flex w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 items-center justify-center shadow-2xl"
          >
            <CheckCircle2 className="w-14 h-14 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Videos Published Successfully!
            </h2>
            <p className="text-gray-700 text-xl">
              {publishedCount} video{publishedCount !== 1 ? 's are' : ' is'} now live on WIZUP Discover 🎉
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-8 flex-wrap"
          >
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {publishedCount}
              </div>
              <div className="text-sm text-gray-600">Videos Published</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ∞
              </div>
              <div className="text-sm text-gray-600">Potential ZAPs</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Next Steps Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          What's Next?
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 font-semibold text-xs">1</span>
            </div>
            <p>Your videos are discoverable on the Discover page</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 font-semibold text-xs">2</span>
            </div>
            <p>Users will earn ZAPs for watching and engaging</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 font-semibold text-xs">3</span>
            </div>
            <p>Track performance in your Published tab</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 font-semibold text-xs">4</span>
            </div>
            <p>Earn ZAPs based on engagement metrics</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        <Button
          onClick={() => navigate('/discover')}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white font-semibold hover:scale-105 transition-transform shadow-xl"
        >
          <Eye className="w-4 h-4 mr-2" />
          View on Discover
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-semibold hover:border-purple-400 hover:bg-purple-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Publish More Videos
        </Button>
      </motion.div>
    </div>
  );
};

export default YoutubeSuccess;
