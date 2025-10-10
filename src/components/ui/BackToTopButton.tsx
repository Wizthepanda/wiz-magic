import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToTopButtonProps {
  threshold?: number; // Scroll threshold in pixels (default: 2 screen heights)
  className?: string;
}

/**
 * Premium "Back to Top" floating button
 * - Appears after scrolling down 2 screen heights
 * - Smooth scroll to top animation
 * - Glassmorphic design matching WIZUP aesthetic
 */
export const BackToTopButton = ({ threshold, className }: BackToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollThreshold = threshold || (typeof window !== 'undefined' ? window.innerHeight * 2 : 1200);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollTop > scrollThreshold);
    };

    // Debounce scroll handler for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [scrollThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          whileHover={{
            scale: 1.1,
            y: -4,
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.95
          }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center",
            "shadow-lg hover:shadow-xl transition-shadow duration-300",
            className
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
          }}
          aria-label="Back to top"
        >
          {/* Icon with gradient */}
          <motion.div
            animate={{
              y: [0, -2, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <ArrowUp
              className="w-6 h-6"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              strokeWidth={2.5}
            />
          </motion.div>

          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.5, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
