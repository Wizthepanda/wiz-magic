import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, useScroll } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onNavigate?: (section: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { theme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle scroll effect for glassmorphic header
  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const handleSignIn = async () => {
    if (user) {
      navigate('/discover');
      return;
    }

    setIsAuthenticating(true);
    try {
      await signInWithGoogleAndRedirect(navigate);
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    onNavigate?.(sectionId);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            onClick={() => scrollToSection('hero')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">W</span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                WIZUP
              </span>
            </div>
          </motion.div>

          {/* Center Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { id: 'how-it-works', label: 'How' },
              { id: 'rewards', label: 'Rewards' },
              { id: 'creators', label: 'Creators' },
              { id: 'pricing', label: 'Pricing' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full w-9 h-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Sign In */}
            {!user && (
              <Button
                variant="ghost"
                onClick={handleSignIn}
                disabled={isAuthenticating || loading}
                className="hidden sm:inline-flex"
              >
                {isAuthenticating ? 'Signing in...' : 'Sign In'}
              </Button>
            )}

            {/* Get Started / Go to Dashboard */}
            <Button
              onClick={handleGetStarted}
              disabled={isAuthenticating || loading}
              className="relative inline-flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticating && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <span className={isAuthenticating ? 'invisible' : ''}>
                {user ? 'Dashboard' : 'Get Started'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
