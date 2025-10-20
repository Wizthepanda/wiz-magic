import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizHomepage } from '@/components/wiz/wiz-homepage';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect authenticated users to /discover
  useEffect(() => {
    if (!loading && user) {
      console.log('✅ User authenticated - redirecting to /discover');
      navigate('/discover', { replace: true });
    }
  }, [user, loading, navigate]);

  // Loading state while checking auth
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

  // Show homepage for non-authenticated users
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      <WizHomepage onEnterPlatform={() => navigate('/discover')} />
    </motion.div>
  );
};

export default Index;
