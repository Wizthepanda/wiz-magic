import { motion } from 'framer-motion';
import { ApplePremiumDashboard } from '@/components/wiz/ApplePremiumDashboard';
import { useNavigate } from 'react-router-dom';

/**
 * DiscoverPage - Main content discovery feed
 *
 * Shows trending content, courses, communities, and creators
 * Accessible via: /discover or / (when authenticated)
 */
const DiscoverPage = () => {
  const navigate = useNavigate();

  const handleSectionChange = (section: string) => {
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
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <ApplePremiumDashboard onSectionChange={handleSectionChange} />
    </motion.div>
  );
};

export default DiscoverPage;
