import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WizSidebar } from '../wiz/wiz-sidebar';
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
        {/* Persistent Sidebar - Never unmounts */}
        {!isMobile && (
          <WizSidebar
            activeSection={getActiveSection()}
            onSectionChange={handleSectionChange}
          />
        )}

        {/* Main Content Area - Routes render here */}
        <main className="flex-1 min-w-0 transition-all duration-300 ease-out">
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

      {/* Mobile Floating Create Button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => navigate('/create')}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
              "bg-gradient-to-r from-green-500 to-teal-600",
              "hover:from-green-600 hover:to-teal-700",
              "hover:shadow-xl hover:scale-110",
              location.pathname === '/create' && "ring-4 ring-green-400/50"
            )}
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}
    </motion.div>
  );
};
