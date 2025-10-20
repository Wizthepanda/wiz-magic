import { motion } from 'framer-motion';
import { DynamicProfilePage } from '@/components/wiz/DynamicProfilePage';

/**
 * ProfilePage - User profile and settings
 *
 * Shows user profile, achievements, settings, and account management
 * Accessible via: /profile
 */
const ProfilePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <DynamicProfilePage />
    </motion.div>
  );
};

export default ProfilePage;
