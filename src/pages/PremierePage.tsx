import { motion } from 'framer-motion';
import { WizPremierePage } from '@/components/wiz/wiz-premiere-page';

/**
 * PremierePage - WIZ Premiere - Premium creators and launches
 *
 * Showcases top-tier creators, exclusive content, and trending launches
 * Accessible via: /premiere
 */
const PremierePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <WizPremierePage />
    </motion.div>
  );
};

export default PremierePage;
