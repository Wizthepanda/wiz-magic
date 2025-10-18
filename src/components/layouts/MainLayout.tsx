import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WizSidebarV2 } from '../wiz/WizSidebarV2';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

  // Determine active section based on current route
  const getActiveSection = () => {
    const path = location.pathname;

    if (path === '/' || path.startsWith('/discover')) return 'discover';
    if (path.startsWith('/community')) return 'community';
    if (path.startsWith('/leaderboard')) return 'leaderboard';
    if (path.startsWith('/premiere')) return 'premiere';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/create')) return 'create';
    if (path.startsWith('/creator') || path.startsWith('/c/')) return 'discover';
    if (path.startsWith('/rewards')) return 'rewards';

    return 'discover';
  };

  // Handle sidebar navigation
  const handleSectionChange = (section: string) => {
    console.log('🧭 Navigating to section:', section);

    switch (section) {
      case 'discover':
        navigate('/');
        break;
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
      case 'rewards':
        navigate('/rewards');
        break;
      default:
        navigate('/');
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
        <main className={cn(
          "flex-1 min-w-0 transition-all duration-300 ease-out",
          !isMobile && "ml-[280px]" // Account for expanded sidebar width
        )}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile bottom nav is now handled by WizSidebarV2 */}
    </motion.div>
  );
};
