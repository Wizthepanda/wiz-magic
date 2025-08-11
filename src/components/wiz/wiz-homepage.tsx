import { useState, useEffect, useRef } from 'react';
import { Play, Star, TrendingUp, Users, Sparkles, Zap, Award, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface WizHomepageProps {
  onEnterPlatform: () => void;
}

// Ultra Premium Background Component
const PremiumBackground = () => {
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

export const WizHomepage = ({ onEnterPlatform }: WizHomepageProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({ wizards: 0, xp: 0, creators: 0 });
  const carouselRef = useRef<HTMLDivElement>(null);
  const { user, signInWithGoogle } = useAuth();

  const handleEnterPlatform = () => {
    if (user) {
      onEnterPlatform();
    } else {
      signInWithGoogle().catch(() => {
        console.log('Authentication not configured, entering as demo user');
        onEnterPlatform();
      });
    }
  };

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
      icon: '🎯',
      title: 'Earn While You Learn',
      description: 'Turn your curiosity into rewards. Every second counts toward your XP journey.',
      gradient: 'from-purple-400 via-pink-400 to-rose-400'
    },
    {
      icon: '📈',
      title: 'Track Your Journey',
      description: 'Visualize your progress with beautiful, live XP dashboards.',
      gradient: 'from-blue-400 via-purple-400 to-indigo-400'
    },
    {
      icon: '🎁',
      title: 'Unlock Creator Perks',
      description: 'Exclusive drops, private streams, and community recognition await.',
      gradient: 'from-emerald-400 via-teal-400 to-cyan-400'
    },
    {
      icon: '⚡',
      title: 'Cash Out Instantly',
      description: 'From XP to currency — instant, seamless withdrawals.',
      gradient: 'from-yellow-400 via-orange-400 to-red-400'
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
      {/* Ultra Premium Background */}
      <PremiumBackground />

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

                  {/* Liquid Glassmorphism "Why WIZ is Different" Section */}
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
              Why WIZ is Different
            </h3>
            <p 
              className="text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ 
                color: '#2B2B2B',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            >
              Experience the future of content consumption with rewards
            </p>
          </motion.div>

          {/* Liquid Glass Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                {/* Liquid Glass Panel */}
                <div 
                  className="relative p-8 rounded-3xl overflow-hidden transition-all duration-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 80px rgba(194, 159, 255, 0.08), 0 8px 32px rgba(194, 159, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Prismatic Edge Lighting */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"
                    style={{
                      background: `linear-gradient(135deg, ${feature.gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').map(color => {
                        const colorMap: { [key: string]: string } = {
                          'purple-400': 'rgba(168, 85, 247, 0.1)',
                          'pink-400': 'rgba(244, 114, 182, 0.1)',
                          'rose-400': 'rgba(251, 113, 133, 0.1)',
                          'blue-400': 'rgba(96, 165, 250, 0.1)',
                          'indigo-400': 'rgba(129, 140, 248, 0.1)',
                          'emerald-400': 'rgba(52, 211, 153, 0.1)',
                          'teal-400': 'rgba(45, 212, 191, 0.1)',
                          'cyan-400': 'rgba(34, 211, 238, 0.1)',
                          'yellow-400': 'rgba(250, 204, 21, 0.1)',
                          'orange-400': 'rgba(251, 146, 60, 0.1)',
                          'red-400': 'rgba(248, 113, 113, 0.1)'
                        };
                        return colorMap[color] || 'rgba(168, 85, 247, 0.1)';
                      }).join(', ')})`,
                      filter: 'blur(1px)'
                    }}
                  />
                  
                  {/* Shimmer Animation */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    animate={{
                      background: [
                        'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                        'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
                      ],
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    style={{ transform: 'skewX(-20deg)' }}
                  />

                  {/* Floating 3D Icon */}
                  <motion.div
                    className="relative mb-6"
                    animate={{ 
                      y: [0, -3, 0],
                      rotateY: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <div 
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl relative"
                      style={{
                        background: `linear-gradient(135deg, ${feature.gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').map(color => {
                          const colorMap: { [key: string]: string } = {
                            'purple-400': '#A855F7',
                            'pink-400': '#F472B6',
                            'rose-400': '#FB7185',
                            'blue-400': '#60A5FA',
                            'indigo-400': '#818CF8',
                            'emerald-400': '#34D399',
                            'teal-400': '#2DD4BF',
                            'cyan-400': '#22D3EE',
                            'yellow-400': '#FACC15',
                            'orange-400': '#FB923C',
                            'red-400': '#F87171'
                          };
                          return colorMap[color] || '#A855F7';
                        }).join(', ')})`,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
                      }}
                    >
                      <span className="relative z-10 filter drop-shadow-sm">
                        {feature.icon}
                      </span>
                      
                      {/* Icon glow */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0, 0.3, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: index * 0.3
                        }}
                        style={{
                          background: `radial-gradient(circle, ${feature.gradient.replace('from-', '').split(' ')[0].replace('purple-400', '#A855F7').replace('blue-400', '#60A5FA').replace('emerald-400', '#34D399').replace('yellow-400', '#FACC15')} 0%, transparent 70%)`,
                          filter: 'blur(8px)'
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h4 
                      className="text-2xl font-bold mb-4"
                      style={{ 
                        color: '#2B2B2B',
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {feature.title}
                    </h4>
                    
                    <p 
                      className="text-base leading-relaxed"
                      style={{ 
                        color: '#2B2B2B',
                        opacity: 0.8,
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
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

      {/* Cinematic Video Showcase */}
      <section className="relative z-30 py-32 px-8 overflow-hidden">
        {/* Animated Background Streaks */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(40px)'
            }}
          />
          {/* Light Streaks */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  `linear-gradient(${45 + i * 30}deg, transparent 0%, rgba(194, 159, 255, 0.03) 50%, transparent 100%)`,
                  `linear-gradient(${45 + i * 30}deg, transparent 30%, rgba(194, 159, 255, 0.03) 70%, transparent 100%)`,
                  `linear-gradient(${45 + i * 30}deg, transparent 0%, rgba(194, 159, 255, 0.03) 50%, transparent 100%)`
                ]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 2
              }}
            />
          ))}
        </div>

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

          {/* Cinematic Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {showcaseItems.map((item, index) => (
              <motion.div
                key={index}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
              >
                {/* Liquid Glass Frame */}
                <div 
                  className="relative rounded-3xl overflow-hidden transition-all duration-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(25px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 100px rgba(194, 159, 255, 0.1), 0 12px 48px rgba(194, 159, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Video Thumbnail with Bloom Effect */}
                  <div className="relative aspect-video overflow-hidden">
                    <div 
                      className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center text-8xl relative"
                    >
                      <motion.span
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, 0]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      >
                        {item.thumbnail}
                      </motion.span>
                      
                      {/* Soft Light Bloom */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
                        }}
                      />
                      
                      {/* Play Icon on Hover */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
                        </div>
                      </motion.div>
                      
                      {/* Duration Pill */}
                      <div 
                        className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(10px)',
                          color: 'white'
                        }}
                      >
                        {item.duration}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 relative">
                    {/* Category & XP Pills */}
                    <div className="flex items-center justify-between mb-4">
                      <span 
                        className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${item.categoryColor} text-white`}
                        style={{
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {item.category}
                      </span>
                      <div 
                        className="px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          background: item.featured 
                            ? 'linear-gradient(135deg, #E6C87E 0%, #D4AF37 100%)' 
                            : 'rgba(194, 159, 255, 0.2)',
                          color: item.featured ? '#8B4513' : '#5A2D82',
                          boxShadow: item.featured 
                            ? '0 4px 16px rgba(230, 200, 126, 0.3)' 
                            : '0 4px 16px rgba(194, 159, 255, 0.2)'
                        }}
                      >
                        {item.xpValue}
                      </div>
                    </div>

                    {/* Title & Creator */}
                    <h4 
                      className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors"
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
                        color: '#2B2B2B',
                        opacity: 0.7,
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      by {item.creator}
                    </p>

                    <p 
                      className="text-sm leading-relaxed mb-4"
                      style={{ 
                        color: '#2B2B2B',
                        opacity: 0.8,
                        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                      }}
                    >
                      {item.description}
                    </p>

                    {/* Views & Status */}
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-sm font-medium"
                        style={{ color: '#2B2B2B', opacity: 0.6 }}
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

                  {/* Prismatic Edge Lighting on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(194, 159, 255, 0.1) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 100%)',
                      filter: 'blur(1px)'
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
          </motion.div>
        </div>
      </footer>
    </div>
  );
};
