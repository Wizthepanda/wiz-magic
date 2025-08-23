import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Sparkles, Zap, DollarSign, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AboutWizSection = () => {
  const [xpProgress, setXpProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, threshold: 0.3 });

  // Animate XP progress when section comes into view
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setXpProgress(85); // Animate to 85%
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Floating particles data
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 4
  }));

  const highlightKeyword = (text: string, keywords: string[], className: string) => {
    let result = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      result = result.replace(regex, `<span class="${className}">$1</span>`);
    });
    return result;
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-24 overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, 
            #0D0D0D 0%, 
            #1A1A2E 50%, 
            #0D0D0D 100%
          )
        `
      }}
    >
      {/* Floating Particles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full opacity-60"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `
                radial-gradient(circle, 
                  rgba(155, 92, 255, 0.8) 0%, 
                  rgba(0, 247, 255, 0.4) 50%, 
                  transparent 100%
                )
              `,
              filter: 'blur(1px)'
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          
          {/* Left Column - Text Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Headline */}
            <motion.h2 
              className="text-5xl lg:text-6xl font-black leading-tight"
              style={{
                background: `
                  linear-gradient(135deg, 
                    #9B5CFF 0%, 
                    #00F7FF 50%, 
                    #9B5CFF 100%
                  )
                `,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(155, 92, 255, 0.5))'
              }}
              animate={isInView ? {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              } : {}}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear"
              }}
            >
              ⚡ About WIZ
            </motion.h2>

            {/* Main Description */}
            <motion.div 
              className="text-xl lg:text-2xl text-white leading-relaxed space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p 
                dangerouslySetInnerHTML={{
                  __html: highlightKeyword(
                    "WIZ is where your screen time finally pays you back. Turn the hours you spend watching YouTube into XP (experience points) you can cash out or use for rewards.",
                    ['XP', 'experience points'],
                    'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-bold hover:drop-shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer'
                  )
                }}
              />
              
              <p 
                dangerouslySetInnerHTML={{
                  __html: highlightKeyword(
                    "No boring rules. No weird hoops. Just keep watching videos you love—gaming, music, tutorials, cats—and WIZ rewards you with $WIZ tokens.",
                    ['$WIZ'],
                    'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-green-400 font-bold hover:drop-shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer'
                  )
                }}
              />

              <motion.div 
                className="flex items-center space-x-4 text-lg"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span>Watch</span>
                </div>
                <div className="text-purple-400">→</div>
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6 text-purple-400" />
                  <span>Earn XP</span>
                </div>
                <div className="text-cyan-400">→</div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <span>Get Paid</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column - Dynamic Visuals */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* XP Progress Card */}
            <motion.div 
              className="relative p-6 rounded-2xl border backdrop-blur-lg"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(155, 92, 255, 0.1) 0%, 
                    rgba(0, 247, 255, 0.1) 100%
                  )
                `,
                border: '1px solid rgba(155, 92, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(155, 92, 255, 0.2)'
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 12px 40px rgba(155, 92, 255, 0.3)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                  XP Progress
                </h3>
                <span className="text-2xl font-bold text-cyan-400">
                  {Math.round(xpProgress)}%
                </span>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    background: `
                      linear-gradient(90deg, 
                        #9B5CFF 0%, 
                        #00F7FF 50%, 
                        #9B5CFF 100%
                      )
                    `,
                    boxShadow: '0 0 20px rgba(155, 92, 255, 0.8)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                />
                
                {/* Glowing pulse effect */}
                <motion.div
                  className="absolute top-0 left-0 h-full w-8 rounded-full opacity-80"
                  style={{
                    background: `
                      linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(255, 255, 255, 0.8) 50%, 
                        transparent 100%
                      )
                    `
                  }}
                  animate={{
                    x: [0, 300, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 2
                  }}
                />
              </div>
              
              <p className="text-sm text-gray-300 mt-3">
                Keep watching to level up and unlock premium rewards!
              </p>
            </motion.div>

            {/* Video Preview Mockup */}
            <motion.div 
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="relative h-48 rounded-xl overflow-hidden border-2"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(0, 0, 0, 0.9) 0%, 
                      rgba(30, 30, 30, 0.9) 100%
                    )
                  `,
                  borderColor: 'rgba(155, 92, 255, 0.4)'
                }}
              >
                {/* Fake video thumbnail */}
                <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white font-semibold">WIZ Magic</p>
                    <p className="text-gray-300 text-sm">AI Tutorial Series</p>
                  </div>
                </div>

                {/* Play Button */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(155, 92, 255, 0.9) 0%, 
                          rgba(0, 247, 255, 0.9) 100%
                        )
                      `,
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(155, 92, 255, 0.5)',
                        '0 0 40px rgba(0, 247, 255, 0.8)',
                        '0 0 20px rgba(155, 92, 255, 0.5)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                  </motion.div>
                </motion.div>

                {/* XP Earnings Badge */}
                <div 
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
                    boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)'
                  }}
                >
                  +250 XP
                </div>
              </div>
            </motion.div>

            {/* Wizard Hat Animation */}
            <motion.div 
              className="flex justify-center"
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="text-8xl relative">
                🧙‍♂️
                {/* Magic sparkles around wizard */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      top: `${20 + i * 15}%`,
                      left: `${10 + i * 20}%`
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <Button
            size="lg"
            className="relative px-12 py-6 text-xl font-bold rounded-full overflow-hidden group transition-all duration-300"
            style={{
              background: `
                linear-gradient(135deg, 
                  #9B5CFF 0%, 
                  #00F7FF 50%, 
                  #9B5CFF 100%
                )
              `,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(155, 92, 255, 0.4)'
            }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 12px 40px rgba(155, 92, 255, 0.6)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {/* Button glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
              style={{
                background: `
                  radial-gradient(circle, 
                    rgba(255, 255, 255, 0.3) 0%, 
                    transparent 70%
                  )
                `
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <span className="relative z-10 flex items-center">
              Start Earning XP 
              <motion.span
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                →
              </motion.span>
            </span>
          </Button>

          <motion.p 
            className="mt-4 text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Your watch time just leveled up 🚀
          </motion.p>
        </motion.div>
      </div>

      {/* Subtle background glow */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at center, 
              rgba(155, 92, 255, 0.1) 0%, 
              transparent 70%
            )
          `
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </section>
  );
};