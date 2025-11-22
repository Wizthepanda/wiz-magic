import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Handle scroll for glassmorphic effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Rewards', href: '#rewards' },
    { label: 'Creators', href: '#creators' },
    { label: 'Communities', href: '/communities' },
    { label: 'FAQ', href: '/faq' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer"
            aria-label="Navigate to homepage"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center text-xl font-bold uppercase tracking-[0.2em] text-violet-200"
            >
              WIZUP
            </motion.div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden flex-1 md:flex items-center justify-center gap-6">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-white font-medium tracking-wide transition hover:text-white/80"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                variant="outline"
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="rounded-full border-white/40 bg-transparent px-6 py-2 font-semibold text-white hover:bg-white/10"
              >
                {user ? 'Dashboard' : 'Sign In'}
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                onClick={handleGetStarted}
                disabled={isAuthenticating}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg hover:scale-105 transition-transform"
              >
                {isAuthenticating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : user ? (
                  'Go to Dashboard'
                ) : (
                  'Get Started'
                )}
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Nav Links */}
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-2 font-medium tracking-wide text-white hover:text-white/80 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile CTAs */}
              <div className="pt-4 space-y-3 border-t border-white/20">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleSignIn();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isAuthenticating}
                  className="w-full rounded-full border-white/40 bg-transparent font-semibold text-white hover:bg-white/10"
                >
                  {user ? 'Dashboard' : 'Sign In'}
                </Button>
                <Button
                  onClick={() => {
                    handleGetStarted();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isAuthenticating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full font-semibold shadow-lg"
                >
                  {isAuthenticating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : user ? (
                    'Go to Dashboard'
                  ) : (
                    'Get Started'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
