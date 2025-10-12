import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';

// Lazy load the Creator Profile V2 component for better performance
const CreatorPublicProfileV2 = lazy(() =>
  import('@/components/wiz/creator/CreatorPublicProfileV2').then(module => ({
    default: module.CreatorPublicProfileV2
  }))
);

/**
 * Creator Profile Page
 *
 * Routes to the premium V2 creator profile page
 * Preserves existing header, sidebar, and navigation
 * Uses lazy loading for optimal bundle size
 */
const CreatorProfile = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
          />
        </div>
      }
    >
      <CreatorPublicProfileV2 />
    </Suspense>
  );
};

export default CreatorProfile;