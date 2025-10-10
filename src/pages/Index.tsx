import { useState, useEffect } from 'react';
import { WizHomepage } from '@/components/wiz/wiz-homepage';
import { WizDashboard } from '@/components/wiz/wiz-dashboard';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  // Initialize showDashboard based on current auth state to avoid flicker
  const [showDashboard, setShowDashboard] = useState(!!user && !loading);

  // ChatGPT-style: Auto-navigate to dashboard when user is authenticated
  useEffect(() => {
    if (!loading) {
      const shouldShowDashboard = !!user;
      if (shouldShowDashboard !== showDashboard) {
        console.log(shouldShowDashboard ? '✅ User authenticated - auto-redirecting to dashboard' : '🏠 No user - showing homepage');
        setShowDashboard(shouldShowDashboard);
      }
    }
  }, [user, loading, showDashboard]);

  // Add keyboard listener for testing - press 'H' to go back to homepage
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if user is not typing in an input field, textarea, or any editable element
      const target = event.target as HTMLElement;
      const isTyping = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]') ||
        target.closest('input') ||
        target.closest('textarea')
      );

      if ((event.key === 'h' || event.key === 'H') && !isTyping) {
        console.log('🏠 Going back to homepage for testing...');
        setShowDashboard(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Premium loading state during initial auth check - ChatGPT style
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #F6F0FF 0%, #FFFFFF 100%)',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Premium Spinner */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: '#C29FFF',
                borderRightColor: '#A78BFA',
                borderBottomColor: '#8B5CF6',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-purple-600" />
              </motion.div>
            </div>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg font-medium text-gray-700"
          >
            Loading WIZUP...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Smooth transition between homepage and dashboard - no page reload */}
      <AnimatePresence mode="wait">
        {showDashboard ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <WizDashboard onBackToHomepage={() => setShowDashboard(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="homepage"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <WizHomepage onEnterPlatform={() => setShowDashboard(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
