import { useState, useEffect } from 'react';
import { Play, Star, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SubtleBackground } from '@/components/ui/subtle-background';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface WizHomepageProps {
  onEnterPlatform: () => void;
}

export const WizHomepage = ({ onEnterPlatform }: WizHomepageProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({ wizards: 0, xp: 0, creators: 0 });
  const { user, signInWithGoogle } = useAuth();

  const handleEnterPlatform = () => {
    if (user) {
      onEnterPlatform();
    } else {
      // Allow entry without authentication for demo purposes
      // Try to sign in, but if it fails, still enter the platform
      signInWithGoogle().catch(() => {
        console.log('Authentication not configured, entering as demo user');
        onEnterPlatform();
      });
    }
  };

  // Animate stats numbers on load
  useEffect(() => {
    const targets = { wizards: 12500, xp: 2300000, creators: 150 };
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedValues({
        wizards: Math.floor(targets.wizards * progress),
        xp: Math.floor(targets.xp * progress),
        creators: Math.floor(targets.creators * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues(targets);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number, suffix: string) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${suffix}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${suffix}`;
    }
    return `${num}${suffix}`;
  };

  const stats = [
    { 
      icon: Users, 
      label: 'Active Wizards', 
      value: formatNumber(animatedValues.wizards, '+'),
      gradient: 'from-purple-400 to-purple-600',
      iconBg: 'from-purple-500 to-purple-700'
    },
    { 
      icon: TrendingUp, 
      label: 'XP Earned Today', 
      value: formatNumber(animatedValues.xp, '+'),
      gradient: 'from-blue-400 to-purple-600',
      iconBg: 'from-blue-500 to-purple-700'
    },
    { 
      icon: Star, 
      label: 'Featured Creators', 
      value: formatNumber(animatedValues.creators, '+'),
      gradient: 'from-pink-400 to-purple-600',
      iconBg: 'from-pink-500 to-purple-700'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-lavender-50 to-white">
      <SubtleBackground />
      
      {/* Enhanced Header */}
      <header className="relative z-10 p-8">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center shadow-glow"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Star className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent tracking-wide">
            WIZ
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-8">
        <div className="text-center max-w-5xl mx-auto space-y-12">
          {/* Enhanced Hero Title */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-black bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              style={{
                textShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)',
                filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.3))'
              }}
            >
              WIZ
              {/* 3D Shadow Effect */}
              <div 
                className="absolute inset-0 text-7xl md:text-9xl font-black text-gray-400/20 -z-10"
                style={{ transform: 'translate(3px, 3px)' }}
              >
                WIZ
              </div>
            </motion.h1>
            <motion.h2 
              className="text-3xl md:text-4xl font-light text-gray-700 tracking-[0.2em] uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Watch YouTube, Earn Rewards
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Wiz turns your watch time into XP & cash - just keep watching what you love
            </motion.p>
          </motion.div>

          {/* Enhanced Play Button */}
          <motion.div 
            className="flex justify-center py-8"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.0, type: "spring", stiffness: 200 }}
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <Button
                size="lg"
                onClick={handleEnterPlatform}
                className="h-24 w-24 rounded-full p-0 relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-glow-lg border-4 border-white/30 transition-all duration-300"
                style={{
                  boxShadow: isHovering 
                    ? '0 0 40px rgba(147, 51, 234, 0.6), 0 0 80px rgba(147, 51, 234, 0.3)' 
                    : '0 0 20px rgba(147, 51, 234, 0.4)'
                }}
              >
                <motion.div
                  animate={{
                    scale: isHovering ? 1.2 : 1,
                    rotate: isHovering ? 5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Play 
                    className="w-10 h-10 text-white ml-1" 
                    fill="currentColor"
                  />
                </motion.div>
                
                {/* Glow overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full opacity-0"
                  animate={{ opacity: isHovering ? 0.3 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 + index * 0.2 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl">
                  <CardContent className="p-8 text-center relative">
                    {/* Icon with gradient background */}
                    <motion.div 
                      className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.iconBg} flex items-center justify-center shadow-lg`}
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)'
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    {/* Animated Value */}
                    <motion.div 
                      className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, delay: 1.6 + index * 0.2 }}
                    >
                      {stat.value}
                    </motion.div>
                    
                    {/* Label */}
                    <div className="text-sm font-medium text-gray-600 tracking-wide uppercase">
                      {stat.label}
                    </div>
                    
                    {/* Subtle hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 p-8 text-center mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="inline-block"
        >
          <motion.div
            whileHover={{ 
              scale: 1.05,
              y: -2,
              transition: { duration: 0.3 }
            }}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-100 to-blue-100 border border-purple-200/50 shadow-lg backdrop-blur-sm"
          >
            <p className="text-lg font-medium bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ✨ Start your magical learning journey today
            </p>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  );
};