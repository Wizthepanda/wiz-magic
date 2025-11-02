import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Play, Zap, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [zapCount, setZapCount] = useState(0);

  // Animated ZAP counter (odometer effect)
  useEffect(() => {
    const targetZaps = 25750;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetZaps / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      if (step < steps) {
        current += increment;
        setZapCount(Math.floor(current));
        step++;
      } else {
        setZapCount(targetZaps);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

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

  const handleWatchDemo = () => {
    // Scroll to how it works section
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradient as per spec */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#f7f9fc] to-[#eef1f7]" />

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/30 to-violet-200/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-200/30 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-indigo-200 shadow-lg"
            >
              <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">
                10,000+ creators already earning
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Watch. Earn. Unlock.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl sm:text-2xl text-gray-600 leading-relaxed"
            >
              Turn your attention into rewards. Watch educational content, earn ZAPs,
              and unlock premium courses, coaching, and communities — all for free.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Button
                onClick={handleGetStarted}
                disabled={isAuthenticating}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
              >
                {isAuthenticating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : user ? (
                  'Go to Dashboard'
                ) : (
                  'Start Earning Free'
                )}
              </Button>
              <Button
                onClick={handleWatchDemo}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-semibold border-2 hover:bg-gray-50"
              >
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 pt-6"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Start in 30 seconds</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Mock Player + ZAP Orb */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Glassmorphic Mock Player */}
              <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl p-8 shadow-2xl border border-white/20">
                {/* Video Thumbnail */}
                <div className="relative aspect-video rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 overflow-hidden mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-lg shadow-2xl flex items-center justify-center"
                    >
                      <Play className="w-10 h-10 text-indigo-600 fill-indigo-600 ml-1" />
                    </motion.button>
                  </div>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>

                {/* Mini Leaderboard */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-gray-900">Top Learner</div>
                        <div className="text-xs text-gray-600">+1,250 ZAPs today</div>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-gray-700">Level 5 Unlocked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating ZAP Orb */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, type: 'spring' }}
                className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 shadow-2xl flex flex-col items-center justify-center"
              >
                <Zap className="w-10 h-10 text-white fill-white mb-1" />
                <div className="text-2xl font-bold text-white">
                  {zapCount.toLocaleString()}
                </div>
                <div className="text-xs text-white/90">ZAPs Earned</div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-700">Active Users</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">50K+</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="p-4 rounded-xl bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-semibold text-gray-700">Rewards</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">1,000+</div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
