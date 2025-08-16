import { useState, useEffect, useRef } from 'react';
import { Play, Star, TrendingUp, Users, Sparkles, Zap, Award, DollarSign, ChevronLeft, ChevronRight, Target, BarChart3, Gift, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface WizHomepageProps {
  onEnterPlatform: () => void;
}

// Hero Background Component
const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 40%, rgba(246, 240, 255, 0.4) 0%, transparent 70%),
            linear-gradient(135deg, #F6F0FF 0%, #FFFFFF 100%)
          `
        }}
      />
    </div>
  );
};

// Why WIZ Section Background
const WhyWizBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(249, 246, 255, 0.6) 0%, transparent 80%),
            linear-gradient(135deg, #F9F6FF 0%, rgba(255, 255, 255, 0.95) 100%)
          `,
          backdropFilter: 'blur(1px)'
        }}
      />
    </div>
  );
};

// Featured Content Background
const FeaturedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 30%, rgba(245, 247, 255, 0.7) 0%, transparent 85%),
            linear-gradient(135deg, #F5F7FF 0%, rgba(255, 255, 255, 0.92) 100%)
          `,
          backdropFilter: 'blur(2px)'
        }}
      />
      {/* Subtle glassmorphic depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)'
        }}
      />
    </div>
  );
};

// Apple-Style Minimal Icons Component
const MinimalIcon = ({ type, color }: { type: string; color: string }) => {
  const iconStyle = {
    color: color,
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
  };

  switch (type) {
    case 'target':
      return <Target className="w-7 h-7" style={iconStyle} strokeWidth={1.5} />;
    case 'graph':
      return <BarChart3 className="w-7 h-7" style={iconStyle} strokeWidth={1.5} />;
    case 'gift':
      return <Gift className="w-7 h-7" style={iconStyle} strokeWidth={1.5} />;
    case 'lightning':
      return <Zap className="w-7 h-7" style={iconStyle} strokeWidth={1.5} />;
    default:
      return <Target className="w-7 h-7" style={iconStyle} strokeWidth={1.5} />;
  }
};

export const WizHomepage = ({ onEnterPlatform }: WizHomepageProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({ wizards: 0, xp: 0, creators: 0 });
  const carouselRef = useRef<HTMLDivElement>(null);
  const { user, signInWithGoogle, connectYouTube } = useAuth();

  const handleEnterPlatform = async () => {
    console.log('🎯 handleEnterPlatform called');
    console.log('🔍 Current user state:', user ? `${user.email} (YouTube: ${user.youtubeConnected})` : 'No user');

    try {
      // 1) If not signed in, require Google sign-in (with YouTube scopes)
      if (!user) {
        console.log('🚀 User not signed in, triggering Google OAuth with YouTube scopes...');
        const signedIn = await signInWithGoogle(true);
        if (!signedIn) {
          throw new Error('Google sign-in did not return a user.');
        }
        console.log('✅ Authentication successful');
      }

      // 2) If signed in but not connected to YouTube, try to connect (non-blocking)
      if (user && !user.youtubeConnected) {
        console.log('🔗 User signed in but YouTube not connected, connecting...');
        try {
          await connectYouTube();
          console.log('✅ YouTube connection attempted');
        } catch (ytError) {
          console.warn('⚠️ YouTube connection failed (continuing signed-in):', ytError);
        }
      }

      // 3) Only now proceed to the platform
      console.log('🏁 Proceeding to platform...');
      onEnterPlatform();
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      alert('Authentication failed. Please configure Firebase Authentication and Google sign-in, then try again.');
      // Do NOT navigate to dashboard on auth failure
    }
  };

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleEnterPlatform();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user]);

  // Animate stats numbers on load
  useEffect(() => {
    const targets = { wizards: 12500, xp: 2300000, creators: 150 };
    const duration = 2000;
    const steps = 60;
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
      gradient: 'from-purple-500 to-violet-600',
      iconColors: ['#C29FFF', '#8B5CF6', '#7C3AED'],
      hoverAnimation: 'pop'
    },
    { 
      icon: TrendingUp, 
      label: 'XP Earned Today', 
      value: formatNumber(animatedValues.xp, '+'),
      gradient: 'from-violet-500 to-blue-500',
      iconColors: ['#C29FFF', '#60A5FA', '#3B82F6'],
      hoverAnimation: 'pulse-up'
    },
    { 
      icon: Star, 
      label: 'Featured Creators', 
      value: formatNumber(animatedValues.creators, '+'),
      gradient: 'from-purple-600 to-indigo-600',
      iconColors: ['#C29FFF', '#A855F7', '#6366F1'],
      hoverAnimation: 'twinkle'
    }
  ];

  const features = [
    {
      icon: 'target',
      title: 'Earn While You Learn',
      description: 'Turn your curiosity into rewards. Every second counts toward your XP journey.',
      gradient: 'linear-gradient(135deg, #C29FFF 0%, #A855F7 50%, #9333EA 100%)',
      iconColor: '#C29FFF'
    },
    {
      icon: 'graph',
      title: 'Track Your Journey', 
      description: 'Visualize your progress with beautiful, live XP dashboards.',
      gradient: 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 50%, #7C3AED 100%)',
      iconColor: '#A855F7'
    },
    {
      icon: 'gift',
      title: 'Unlock Creator Perks',
      description: 'Exclusive drops, private streams, and community recognition await.',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%)',
      iconColor: '#EC4899'
    },
    {
      icon: 'lightning',
      title: 'Cash Out Instantly',
      description: 'From XP to currency — instant, seamless withdrawals.',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
      iconColor: '#8B5CF6'
    }
  ];

  const showcaseItems = [
    { 
      title: 'Master AI Prompting in 2025',
      creator: 'AIGuru42',
      description: 'Learn how to harness the latest AI tools for unstoppable creativity.',
      category: 'AI & Tech',
      duration: '12:34',
      views: '2.3M',
      thumbnail: '🤖',
      xpValue: '1,250 XP',
      categoryColor: 'from-blue-400 to-cyan-500',
      featured: true
    },
    { 
      title: 'Wealth Through Web3',
      creator: 'MoneyWizard',
      description: 'Strategies to build generational wealth in the digital era.',
      category: 'Finance',
      duration: '18:45',
      views: '3.1M',
      thumbnail: '💎',
      xpValue: '1,890 XP',
      categoryColor: 'from-emerald-400 to-green-500',
      featured: true
    },
    { 
      title: 'React 19 Deep Dive',
      creator: 'CodeMaster',
      description: 'The hidden features and performance secrets you need to know.',
      category: 'Programming',
      duration: '25:12',
      views: '1.8M',
      thumbnail: '⚛️',
      xpValue: '980 XP',
      categoryColor: 'from-purple-400 to-pink-500',
      featured: false
    },
    { 
      title: 'Behind the Beat',
      creator: 'BeatCreator',
      description: 'From rhythm to melody, decode music production like a pro.',
      category: 'Music',
      duration: '15:28',
      views: '2.7M',
      thumbnail: '🎵',
      xpValue: '1,560 XP',
      categoryColor: 'from-violet-400 to-purple-500',
      featured: true
    }
  ];

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Top Left Navigation Links */}
      <motion.div 
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* About Link */}
        <motion.a
          href="/about.html"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center px-4 py-2 rounded-2xl transition-all duration-500 text-sm font-medium"
          style={{
            background: `
              linear-gradient(135deg, rgba(246, 240, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%),
              rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 6px 24px rgba(194, 159, 255, 0.06), 0 3px 12px rgba(194, 159, 255, 0.03)',
            color: '#7C3AED'
          }}
          whileHover={{ 
            y: -1,
            boxShadow: '0 8px 32px rgba(194, 159, 255, 0.08), 0 4px 16px rgba(194, 159, 255, 0.04)',
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          About
          
          {/* Prismatic Edge Glow on Hover */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.08) 0%, rgba(157, 78, 221, 0.04) 100%)',
              filter: 'blur(0.5px)'
            }}
          />
        </motion.a>

        {/* Separator - hidden on mobile */}
        <span className="hidden sm:inline" style={{ color: '#A78BFA', fontSize: '14px' }}>|</span>

        {/* Privacy Link */}
        <motion.a
          href="/privacypolicy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center px-4 py-2 rounded-2xl transition-all duration-500 text-sm font-medium"
          style={{
            background: `
              linear-gradient(135deg, rgba(246, 240, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%),
              rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 6px 24px rgba(194, 159, 255, 0.06), 0 3px 12px rgba(194, 159, 255, 0.03)',
            color: '#7C3AED'
          }}
          whileHover={{ 
            y: -1,
            boxShadow: '0 8px 32px rgba(194, 159, 255, 0.08), 0 4px 16px rgba(194, 159, 255, 0.04)',
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Privacy
          
          {/* Prismatic Edge Glow on Hover */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.08) 0%, rgba(157, 78, 221, 0.04) 100%)',
              filter: 'blur(0.5px)'
            }}
          />
        </motion.a>

        {/* Separator - hidden on mobile */}
        <span className="hidden sm:inline" style={{ color: '#A78BFA', fontSize: '14px' }}>|</span>

        {/* Learn More Link */}
        <motion.a
          href="/google-data-usage.html"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center px-4 py-2 rounded-2xl transition-all duration-500 text-sm font-medium"
          style={{
            background: `
              linear-gradient(135deg, rgba(246, 240, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%),
              rgba(255, 255, 255, 0.15)
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 6px 24px rgba(194, 159, 255, 0.06), 0 3px 12px rgba(194, 159, 255, 0.03)',
            color: '#7C3AED'
          }}
          whileHover={{ 
            y: -1,
            boxShadow: '0 8px 32px rgba(194, 159, 255, 0.08), 0 4px 16px rgba(194, 159, 255, 0.04)',
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Google Auth
          
          {/* Prismatic Edge Glow on Hover */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.08) 0%, rgba(157, 78, 221, 0.04) 100%)',
              filter: 'blur(0.5px)'
            }}
          />
        </motion.a>
      </motion.div>

      {/* Top Right Enter Button */}
      <motion.div 
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.button
          onClick={handleEnterPlatform}
          className="group flex items-center px-6 py-3 rounded-3xl transition-all duration-500"
          style={{
            background: `
              linear-gradient(135deg, rgba(246, 240, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%),
              rgba(255, 255, 255, 0.2)
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(194, 159, 255, 0.08), 0 4px 16px rgba(194, 159, 255, 0.04)'
          }}
          whileHover={{ 
            y: -2,
            boxShadow: '0 12px 40px rgba(194, 159, 255, 0.12), 0 6px 20px rgba(194, 159, 255, 0.08)',
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Magic Wand Icon */}
          <motion.div 
            className="relative mr-3"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Wand2 
              className="w-5 h-5"
              style={{ 
                color: '#7C3AED',
                filter: 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.2))'
              }} 
            />
            
            {/* Magical Sparkles */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: 'linear-gradient(45deg, #C29FFF, #9D4EDD)',
                  boxShadow: '0 0 4px rgba(194, 159, 255, 0.6)',
                  top: `${-2 + i * 2}px`,
                  right: `${-4 + i * 1}px`
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </motion.div>
          
          {/* Enter Text */}
          <span 
            className="font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #9D4EDD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            Enter
          </span>
          
          {/* Prismatic Edge Glow on Hover */}
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.1) 0%, rgba(157, 78, 221, 0.05) 100%)',
              filter: 'blur(0.5px)'
            }}
          />
          
          {/* Glowing Edge Sweep */}
          <motion.div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none"
            animate={{
              background: [
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)'
              ],
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3
            }}
            style={{ transform: 'skewX(-10deg)' }}
          />
        </motion.button>
      </motion.div>

      {/* Hero Section with dedicated background */}
      <div className="relative">
        <HeroBackground />

      {/* Ultra Premium Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        <div className="text-center max-w-5xl mx-auto space-y-12">
          {/* Luxury WIZ Logo */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-8xl md:text-9xl font-black relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, #C29FFF 0%, #5A2D82 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.05em',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '900'
              }}
            >
              WIZ
            </motion.h1>
            
            {/* Premium Tagline */}
            <motion.h2 
              className="text-2xl md:text-3xl font-medium tracking-[0.3em] uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, #C29FFF 0%, #5A2D82 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              Watch YouTube, Earn Rewards
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              style={{
                color: '#2B2B2B',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              Wiz turns your watch time into XP & cash — just keep watching what you love
            </motion.p>
          </motion.div>

          {/* Ultra Premium Glassmorphic CTA */}
          <motion.div 
            className="flex justify-center py-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Button
                size="lg"
                onClick={handleEnterPlatform}
                className="h-24 w-24 rounded-full p-0 relative overflow-hidden transition-all duration-300 border-0"
                style={{
                  background: 'rgba(194, 159, 255, 0.15)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  boxShadow: isHovering 
                    ? '0 0 60px rgba(194, 159, 255, 0.6), 0 0 120px rgba(194, 159, 255, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.2)' 
                    : '0 8px 40px rgba(194, 159, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                }}
                >
                  <Play 
                  className="w-10 h-10 ml-1" 
                    fill="currentColor"
                  style={{ color: '#FFFFFF' }}
                  />
                
                {/* Radial glow overlay */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  animate={{ 
                    opacity: isHovering ? 0.3 : 0,
                    scale: isHovering ? 1.2 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: 'radial-gradient(circle, rgba(194, 159, 255, 0.4) 0%, transparent 70%)',
                    filter: 'blur(20px)'
                  }}
                />
              </Button>
            </motion.div>
          </motion.div>

          {/* YouTube Connection Status */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex justify-center mt-6"
            >
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full"
                style={{
                  background: user.youtubeConnected 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${user.youtubeConnected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: user.youtubeConnected ? '#22C55E' : '#EF4444'
                  }}
                />
                <span 
                  className="text-sm font-medium"
                  style={{
                    color: user.youtubeConnected ? '#22C55E' : '#EF4444'
                  }}
                >
                  {user.youtubeConnected ? 'YouTube Connected' : 'YouTube Disconnected'}
                </span>
              </div>
            </motion.div>
          )}

                    {/* Ultra Premium Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ 
                  y: -4, 
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group"
              >
                <Card 
                  className="relative overflow-hidden transition-all duration-500 rounded-3xl border-0"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(194, 159, 255, 0.15)',
                    boxShadow: '0 12px 48px rgba(194, 159, 255, 0.08), 0 4px 16px rgba(194, 159, 255, 0.04)'
                  }}
                >
                  <CardContent className="p-8 text-center relative">
                    {/* Premium Gradient Icon */}
                    <motion.div 
                      className="w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-xl"
                      style={{
                        background: `linear-gradient(135deg, ${stat.iconColors[0]} 0%, ${stat.iconColors[1]} 50%, ${stat.iconColors[2]} 100%)`,
                        boxShadow: '0 8px 32px rgba(194, 159, 255, 0.3)'
                      }}
                      whileHover={{ 
                        scale: 1.1, 
                        boxShadow: '0 0 40px rgba(194, 159, 255, 0.4)',
                        ...(stat.hoverAnimation === 'twinkle' && {
                          rotate: [0, -5, 5, 0],
                          transition: { duration: 0.6 }
                        })
                      }}
                      animate={
                        stat.hoverAnimation === 'pulse-up' 
                          ? { y: [0, -3, 0] }
                          : stat.hoverAnimation === 'pop'
                          ? { scale: [1, 1.05, 1] }
                          : { y: [0, -1, 0] }
                      }
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    >
                      <stat.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    
                    {/* Elegant Value */}
                    <div 
                      className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3`}
                      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                    >
                      {stat.value}
                    </div>
                    
                    {/* Refined Label */}
                    <div 
                      className="text-sm font-medium tracking-wide uppercase"
                      style={{ 
                        color: '#2B2B2B',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {stat.label}
                    </div>
                    
                    {/* Subtle lavender overlay on hover */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.08) 0%, transparent 100%)'
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      </div>

      {/* Why WIZ is Different Section with dedicated background */}
      <div className="relative">
        <WhyWizBackground />
        
        <section className="relative z-20 py-32 px-8">
          <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, #C29FFF 0%, #5A2D82 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                filter: 'drop-shadow(0 4px 8px rgba(194, 159, 255, 0.1))'
              }}
            >
              Why WIZ
            </h3>
            <p 
              className="text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ 
                color: '#5C5C5C',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                lineHeight: '1.7'
              }}
            >
              Experience the future of content consumption with rewards
            </p>
          </motion.div>

          {/* Premium Glass Grid - 2x2 Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
            whileHover={{ 
                  y: -5,
                  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                }}
              >
                {/* Floating Glassmorphic Panel */}
                <div 
                  className="relative p-8 rounded-2xl overflow-hidden transition-all duration-500"
                  style={{
                    background: `
                      linear-gradient(135deg, rgba(246, 240, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%),
                      rgba(255, 255, 255, 0.12)
                    `,
                    backdropFilter: 'blur(25px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 12px 40px rgba(194, 159, 255, 0.06), 0 4px 16px rgba(194, 159, 255, 0.04)'
                  }}
                >
                  {/* Subtle Prismatic Edge Highlights */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.06) 0%, rgba(236, 72, 153, 0.03) 50%, transparent 100%)',
                      filter: 'blur(0.5px)'
                    }}
                  />
                  
                  {/* Gentle Shimmer on Hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut"
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
                      transform: 'skewX(-15deg)'
                    }}
                  />

                  {/* Floating Apple-Style Icon */}
                  <motion.div
                    className="relative mb-6"
                    animate={{ 
                      y: [0, -2, 0]
                    }}
                    transition={{ 
                      duration: 6, 
                      repeat: Infinity,
                      delay: index * 1.5,
                      ease: "easeInOut"
                    }}
                  >
                    <div 
                      className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center relative"
                      style={{
                        background: feature.gradient,
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-4px)'
                      }}
                    >
                      <MinimalIcon type={feature.icon} color="rgba(255, 255, 255, 0.9)" />
                      
                      {/* Icon Floating Shadow */}
                      <div 
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-3 rounded-full opacity-20"
                        style={{
                          background: 'radial-gradient(ellipse, rgba(194, 159, 255, 0.4) 0%, transparent 70%)',
                          filter: 'blur(4px)'
                        }}
                      />
                      
                      {/* Subtle Icon Pulse on Hover */}
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          opacity: [0, 0.2, 0]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                        style={{
                          background: feature.gradient,
                          filter: 'blur(8px)'
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Clean Typography */}
                  <div className="relative z-10 text-center">
                    <h4 
                      className="text-xl font-semibold mb-4"
                      style={{ 
                        color: '#2B2B2B',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {feature.title}
                    </h4>
                    
                    <p 
                      className="text-sm leading-relaxed"
                      style={{ 
                        color: '#5C5C5C',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                        lineHeight: '1.6'
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </section>
      </div>

      {/* Featured Content Section with dedicated background */}
      <div className="relative">
        <FeaturedBackground />
        
        <section className="relative z-30 py-32 px-8 overflow-hidden">
          {/* Very Subtle Drifting Light Streaks */}
          {Array.from({ length: 2 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 opacity-15"
              animate={{
                background: [
                  `linear-gradient(${60 + i * 40}deg, transparent 0%, rgba(245, 247, 255, 0.2) 50%, transparent 100%)`,
                  `linear-gradient(${60 + i * 40}deg, transparent 40%, rgba(245, 247, 255, 0.2) 60%, transparent 100%)`,
                  `linear-gradient(${60 + i * 40}deg, transparent 0%, rgba(245, 247, 255, 0.2) 50%, transparent 100%)`
                ]
              }}
              transition={{
                duration: 15 + i * 5,
                repeat: Infinity,
                delay: i * 4,
                ease: "easeInOut"
              }}
            />
          ))}

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, #C29FFF 0%, #5A2D82 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                filter: 'drop-shadow(0 4px 8px rgba(194, 159, 255, 0.1))'
              }}
            >
              Featured Content
            </h3>
            <p 
              className="text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ 
                color: '#2B2B2B',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              Cinema-quality content that earns you XP
            </p>
          </motion.div>

          {/* 1x4 Cinematic Strip - Netflix Originals Style */}
          <div className="relative">
            {/* Horizontal Scroll Container */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto scrollbar-hide gap-8 px-8 py-4 snap-x snap-mandatory"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth'
              }}
            >
              {showcaseItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="group cursor-pointer flex-shrink-0 w-80 snap-start"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  }}
                >
                {/* Glassmorphic Poster Frame */}
                <div 
                  className="relative rounded-2xl overflow-hidden transition-all duration-500"
                  style={{
                    background: `
                      linear-gradient(135deg, rgba(246, 240, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%),
                      rgba(255, 255, 255, 0.08)
                    `,
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 16px 64px rgba(194, 159, 255, 0.04), 0 8px 32px rgba(194, 159, 255, 0.02)'
                  }}
                >
                  {/* Cinematic Thumbnail with Screen Effect */}
                  <div className="relative aspect-video overflow-hidden">
                    <div 
                      className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center text-7xl relative"
                      style={{
                        background: `
                          linear-gradient(135deg, rgba(246, 240, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%),
                          linear-gradient(45deg, #F6F0FF 0%, #FFEEF8 50%, #F0F8FF 100%)
                        `
                      }}
                    >
                      <motion.span
                        animate={{ 
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ 
                          duration: 8, 
                          repeat: Infinity,
                          delay: index * 1,
                          ease: "easeInOut"
                        }}
                        className="relative z-10"
                      >
                        {item.thumbnail}
                      </motion.span>
                      
                      {/* Light Bloom on Edges */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                        style={{
                          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255, 255, 255, 0.06) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      />
                      
                      {/* Subtle Play Icon Fade-in */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0.9 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(15px)',
                            boxShadow: '0 4px 24px rgba(194, 159, 255, 0.15)'
                          }}
                        >
                          <Play className="w-6 h-6 text-purple-600 ml-0.5" fill="currentColor" />
                        </div>
                      </motion.div>
                      
                      {/* Tiny Frosted Duration Pill */}
                      <div 
                        className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(8px)',
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}
                      >
                        {item.duration}
                      </div>
                    </div>
                  </div>

                  {/* Clean Content Section */}
                  <div className="p-6 relative">
                    {/* Floating Category & XP Pills */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Light Gradient Category */}
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{
                          background: item.category === 'AI & Tech' 
                            ? 'linear-gradient(135deg, rgba(194, 159, 255, 0.8) 0%, rgba(147, 197, 253, 0.8) 100%)'
                            : item.category === 'Finance'
                            ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)'
                            : item.category === 'Programming'
                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%)'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(168, 85, 247, 0.8) 100%)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        {item.category}
                      </span>
                      
                      {/* Jewel-like XP Reward */}
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: item.featured 
                            ? 'linear-gradient(135deg, rgba(230, 200, 126, 0.9) 0%, rgba(212, 175, 55, 0.9) 100%)' 
                            : 'linear-gradient(135deg, rgba(194, 159, 255, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
                          color: item.featured ? '#8B4513' : '#5A2D82',
                          boxShadow: item.featured 
                            ? '0 2px 12px rgba(230, 200, 126, 0.2)' 
                            : '0 2px 8px rgba(194, 159, 255, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {item.xpValue}
                      </div>
                    </div>

                    {/* Large Clean Typography */}
                    <h4 
                      className="text-lg font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300"
                      style={{ 
                        color: '#2B2B2B',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {item.title}
                    </h4>
                    
                    <p 
                      className="text-sm mb-3"
                      style={{ 
                        color: '#5C5C5C',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      by {item.creator}
                    </p>

                    <p 
                      className="text-sm leading-relaxed mb-4"
                      style={{ 
                        color: '#5C5C5C',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                        lineHeight: '1.6'
                      }}
                    >
                      {item.description}
                    </p>

                    {/* Views & Status */}
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: '#5C5C5C', opacity: 0.8 }}
                      >
                        {item.views} views
                      </span>
                      
                      {item.featured && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                          <span 
                            className="text-sm font-medium"
                            style={{ color: '#E6C87E' }}
                          >
                            Most Viewed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Faint Prismatic Glow on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.04) 0%, rgba(236, 72, 153, 0.02) 50%, transparent 100%)',
                      filter: 'blur(0.5px)'
                    }}
                  />

                  {/* Subtle Prismatic Sweep Animation */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 5,
                      ease: "easeInOut"
                    }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)',
                      transform: 'skewX(-10deg)'
                    }}
                  />
                </div>
                </motion.div>
              ))}
            </div>
            
            {/* Cinematic Navigation Arrows */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center group"
              style={{
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 255, 0.8) 100%),
                  rgba(255, 255, 255, 0.3)
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(194, 159, 255, 0.08)'
              }}
            >
              <ChevronLeft className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </button>
            
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center group"
              style={{
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 255, 0.8) 100%),
                  rgba(255, 255, 255, 0.3)
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 8px 32px rgba(194, 159, 255, 0.08)'
              }}
            >
              <ChevronRight className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </button>
          </div>
        </div>
        </section>
      </div>

            {/* Liquid Glass Footer */}
      <footer className="relative z-40 py-20 px-8">
        {/* Transparent Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(50px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            {/* Liquid Glass Social Icons */}
            <div className="flex justify-center space-x-8">
              {['Twitter', 'Discord', 'YouTube', 'Instagram'].map((social, index) => (
                <motion.div
                  key={social}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -4,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(194, 159, 255, 0.15)',
                      boxShadow: '0 8px 32px rgba(194, 159, 255, 0.08)'
                    }}
                  >
                    <Star 
                      className="w-6 h-6 transition-all duration-300"
                      style={{ color: '#C29FFF' }}
                    />
                    
                    {/* Gradient outline on hover */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        filter: 'blur(1px)'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Glowing WIZ Brand Mark */}
            <motion.div
              className="inline-block relative"
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              animate={{ 
                y: [0, -2, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity
              }}
            >
              <div 
                className="px-8 py-4 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(194, 159, 255, 0.1)',
                  boxShadow: '0 12px 48px rgba(194, 159, 255, 0.08)'
                }}
              >
                <p 
                  className="text-lg font-medium relative z-10"
                  style={{
                    background: 'linear-gradient(135deg, #C29FFF 0%, #5A2D82 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    filter: 'drop-shadow(0 2px 8px rgba(194, 159, 255, 0.2))'
                  }}
                >
                  ✨ Powered by WIZ
                </p>
                
                {/* Subtle glow animation */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0"
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    scale: [0.8, 1.1, 0.8]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: 1
                  }}
                  style={{
                    background: 'radial-gradient(circle, rgba(194, 159, 255, 0.1) 0%, transparent 70%)',
                    filter: 'blur(10px)'
                  }}
                />
              </div>
          </motion.div>
          
          {/* Legal links */}
          <div className="pt-6 text-sm">
            <a
              href="/privacypolicy.html"
              className="underline hover:no-underline"
              style={{ color: '#5A2D82' }}
              target="_blank"
              rel="noopener"
            >
              Privacy Policy
            </a>
            <span className="mx-2" style={{ color: '#A78BFA' }}>•</span>
            <a
              href="/google-data-usage.html"
              className="underline hover:no-underline"
              style={{ color: '#5A2D82' }}
              target="_blank"
              rel="noopener"
            >
              Google Data Usage
            </a>
            <span className="mx-2" style={{ color: '#A78BFA' }}>•</span>
            <a
              href="/terms.html"
              className="underline hover:no-underline"
              style={{ color: '#5A2D82' }}
              target="_blank"
              rel="noopener"
            >
              Terms of Service
            </a>
          </div>
        </motion.div>
        </div>
      </footer>
    </div>
  );
};
