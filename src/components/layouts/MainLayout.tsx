import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WizSidebarV2 } from '../wiz/WizSidebarV2';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';

/**
 * MainLayout - Persistent layout wrapper with sidebar
 *
 * This component ensures the sidebar remains visible and functional
 * across all routes (Dashboard, Creator Profile, Communities, etc.)
 *
 * The sidebar never unmounts or re-renders when switching pages.
 */
export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { sidebarWidth } = useLayout();

  // Handle sidebar navigation
  const handleSectionChange = (section: string) => {
    console.log('🧭 Navigating to section:', section);

    switch (section) {
      case 'discover':
        navigate('/discover');
        break;
      case 'communities':
      case 'community':
        navigate('/community');
        break;
      case 'messages':
        navigate('/messages');
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
      case 'influencers':
        // Coming soon
        console.log('✨ Influencers coming soon!');
        break;
      case 'rewards':
        navigate('/rewards');
        break;
      default:
        navigate('/discover');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-[#f7f9fc] to-[#eef1f7] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <FloatingParticles />

      <div className="flex h-full min-h-screen">
        {/* Persistent Sidebar V2 - Never unmounts */}
        <WizSidebarV2 onNavigate={handleSectionChange} />

        {/* Main Content Area - Routes render here */}
        <motion.main
          className="flex-1 min-w-0"
          style={{
            marginLeft: !isMobile ? `${sidebarWidth}px` : 0
          }}
          animate={{
            marginLeft: !isMobile ? sidebarWidth : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.4
          }}
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </motion.main>
      </div>

      {/* Mobile bottom nav is now handled by WizSidebarV2 */}
    </motion.div>
  );
};
