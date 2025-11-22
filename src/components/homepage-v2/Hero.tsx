import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { Button } from '@/components/ui/button';

const HERO_BACKGROUND = '/W4.png';

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGetStarted = async () => {
    if (user) {
      navigate('/discover');
      return;
    }

    setIsAuthenticating(true);
    try {
      await signInWithGoogleAndRedirect(navigate);
    } catch (error) {
      console.error('Get started failed:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), {
    damping: 30,
    stiffness: 150,
    mass: 0.2,
  });
  const parallaxY = useSpring(useTransform(mouseY, [-1, 1], [-20, 20]), {
    damping: 30,
    stiffness: 150,
    mass: 0.2,
  });
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;
    mouseX.set(relativeX * 2 - 1);
    mouseY.set(relativeY * 2 - 1);
  };
  const handleScrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[90vh] items-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        style={{ x: parallaxX, y: parallaxY }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.02 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: `url(${HERO_BACKGROUND})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-black/70 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0, transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.4) 0, transparent 35%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 60%)' }} />
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      {[...Array(12)].map((_, index) => (
        <motion.div
          key={`shape-${index}`}
          className="pointer-events-none absolute h-32 w-16 rounded-full bg-white/10 blur-3xl"
          style={{
            top: `${(index * 70) % 100}%`,
            left: `${(index * 120) % 100}%`,
          }}
          animate={{
            y: ['0%', '-40%'],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20 + index,
            repeat: Infinity,
          }}
        />
      ))}

      <div className="relative z-10 w-full px-6 py-28 sm:px-10 lg:px-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
          }}
          className="max-w-3xl space-y-6 text-white"
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 0.9, y: 0 } }}
            className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60"
          >
            LEARN LIKE IT MATTERS.
          </motion.span>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 0.96, y: 0 } }}
            className="text-5xl font-extrabold leading-tight text-white/95 drop-shadow-[0_0_35px_rgba(255,255,255,0.35)] sm:text-6xl lg:text-7xl"
          >
            Redefining communities.
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 0.85, y: 0 } }}
            className="text-lg text-white/80 sm:text-xl"
          >
            WIZUP turns every minute you spend engaging into ZAP points you can use for courses,
            coaching, and community access — all without paying a cent.
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            className="relative flex flex-col gap-5 sm:flex-row"
          >
            <div className="pointer-events-none absolute inset-0 blur-3xl">
              <div className="mx-auto h-20 w-64 rounded-full bg-gradient-to-r from-indigo-500/40 to-violet-500/40" />
            </div>
            <Button
              onClick={handleGetStarted}
              disabled={isAuthenticating}
              size="lg"
              className="relative z-10 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-12 py-6 text-lg font-semibold shadow-[0_20px_40px_rgba(99,102,241,0.5)] transition duration-500 hover:scale-[1.02] hover:shadow-[0_25px_45px_rgba(99,102,241,0.6)] focus-visible:ring-white"
            >
              <span className="absolute inset-0 rounded-full border border-white/20" />
              {isAuthenticating ? 'Loading...' : user ? 'Go to Dashboard' : 'Start Earning Free'}
            </Button>
            <Button
              onClick={handleScrollToHowItWorks}
              variant="secondary"
              size="lg"
              className="relative z-10 w-full rounded-full border border-white/30 bg-white/10 px-12 py-6 text-lg font-semibold text-white backdrop-blur-lg transition duration-500 hover:bg-white/20 sm:w-auto"
            >
              See How It Works
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-xs font-semibold uppercase tracking-[0.4em] text-white/60"
        >
          ⚡ 50,000+ MEMBERS · 10,000+ REWARDS CLAIMED · 1M+ ZAPS DISTRIBUTED
        </motion.div>
      </div>
    </section>
  );
}
