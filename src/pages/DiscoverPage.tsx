import { motion } from 'framer-motion';
import { ApplePremiumDashboard } from '@/components/wiz/ApplePremiumDashboard';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * DiscoverPage - Main content discovery feed
 *
 * Shows trending content, courses, communities, and creators
 * Accessible via: /discover or / (when authenticated)
 */
const DiscoverPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSectionChange = useCallback((section: string) => {
    // Navigate to the appropriate route
    switch (section) {
      case 'community':
        navigate('/community');
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'premiere':
        navigate('/premiere');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'create':
        navigate('/create');
        break;
      default:
        break;
    }
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      {/* Gate ApplePremiumDashboard until auth is stable to prevent early mount loops */}
      {user?.uid ? (
        <ApplePremiumDashboard onSectionChange={handleSectionChange} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DiscoverPage;
