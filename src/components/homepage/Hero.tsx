import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Zap, TrendingUp, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

export function Hero() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = async () => {
    if (user) {
      navigate('/discover');
      return;
    }

    setIsAuthenticating(true);
    try {
      await signInWithGoogleAndRedirect(navigate);
    } catch (err) {
      console.error('Get started failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleForCreators = () => {
    if (user) {
      navigate('/create');
    } else {
      // Scroll to creator benefits section
      const element = document.getElementById('creator-benefits');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16"
      style={{
        background: 'linear-gradient(to bottom, #ffffff 0%, #f7f9fc 50%, #eef1f7 100%)',
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Watch. Earn. Unlock.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Learn from top creators — earn ZAPs as you watch, then unlock courses, coaching, and
              premium communities.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                disabled={isAuthenticating}
                className="relative inline-flex items-center gap-3 px-8 py-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow-xl transform transition hover:scale-[1.02] text-lg"
              >
                {isAuthenticating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Get Started <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleForCreators}
                className="inline-flex items-center gap-3 px-8 py-6 rounded-full border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950 transition text-lg"
              >
                For Creators <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>

            {/* Trust Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold">2,300+</span> creators
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                <span className="font-semibold">90k</span> learners
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">12M</span> ZAPs earned
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Glassmorphic Player Mock + ZAP Orb */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Glassmorphic Player Mock */}
            <div className="relative rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-8 shadow-2xl">
              {/* Video Player Mock */}
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Play button overlay */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-xl cursor-pointer"
                >
                  <Play className="w-10 h-10 text-indigo-600 fill-indigo-600 ml-1" />
                </motion.div>

                {/* Animated particles */}
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-violet-400 rounded-full"
                      initial={{
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        opacity: 0,
                      }}
                      animate={{
                        y: [null, '-100%'],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress Bar Mock */}
              <div className="mt-4 space-y-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '45%' }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>4:32</span>
                  <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                    <Zap className="w-3 h-3 fill-current" />
                    +15 ZAPs earned
                  </span>
                  <span>10:00</span>
                </div>
              </div>
            </div>

            {/* ZAP Balance Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -right-4 -bottom-4 sm:right-4 sm:bottom-4"
            >
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                {/* Glowing background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full blur-xl opacity-50 animate-pulse" />

                {/* Orb */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex flex-col items-center justify-center shadow-2xl">
                  <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white mb-1" />
                  <span className="text-2xl sm:text-3xl font-bold text-white">1,250</span>
                  <span className="text-xs text-white/80">ZAPs</span>
                </div>

                {/* Floating particles around orb */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-violet-300 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos((i * Math.PI * 2) / 8) * 60],
                      y: [0, Math.sin((i * Math.PI * 2) / 8) * 60],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: (i * 2) / 8,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Mini Leaderboard Snapshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-6 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 shadow-xl"
            >
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Top Earners Today
              </div>
              <div className="space-y-2">
                {[
                  { rank: 1, name: 'Alex Chen', zaps: 2450, color: 'text-yellow-600' },
                  { rank: 2, name: 'Maria Garcia', zaps: 2380, color: 'text-gray-400' },
                  { rank: 3, name: 'John Smith', zaps: 2200, color: 'text-orange-600' },
                ].map((leader) => (
                  <div key={leader.rank} className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${leader.color}`}>#{leader.rank}</span>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {leader.name}
                      </span>
                      <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-current" />
                        {leader.zaps.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
