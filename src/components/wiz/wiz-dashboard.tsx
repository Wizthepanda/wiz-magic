import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WizSidebarV2 } from './WizSidebarV2';
import { WizMobileMenu } from './WizMobileMenu';
import { WizUserProfile } from './wiz-user-profile';
import { ApplePremiumDashboard } from './ApplePremiumDashboard';
import { WizDiscoverSection } from './wiz-discover-section';
import { WizLeaderboard } from './wiz-leaderboard';
import { WizPremierePage } from './wiz-premiere-page';
import { WizLeaderboardPage } from './wiz-leaderboard-page';
import { DynamicProfilePage } from './DynamicProfilePage';
import { WizCreatePageV3 } from './WizCreatePageV3';
import { WizCommunityPage } from './wiz-community-page';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { AdminTestPanel } from '@/components/admin/AdminTestPanel';
import { WizSearchBar } from './WizSearchBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WizDashboardProps {
  onBackToHomepage?: () => void;
}

export const WizDashboard = ({ onBackToHomepage }: WizDashboardProps) => {
  const [activeSection, setActiveSection] = useState('discover');
  const isMobile = useIsMobile();
  const location = useLocation();

  // Handle URL parameters for section navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    if (sectionParam && ['discover', 'create', 'community', 'premiere', 'leaderboard', 'profile', 'settings'].includes(sectionParam)) {
      setActiveSection(sectionParam);
      // Clean up the URL parameter after setting the section
      window.history.replaceState({}, '', '/');
    }
  }, [location.search]);

  const handleSearch = (query: string) => {
    console.log('🔍 Global search for:', query);
    // TODO: Navigate to search results page or filter current content
    // For now, we could filter the discover section content
  };

  const handleResultSelect = (result: any) => {
    console.log('✅ Selected search result:', result);
    
    if (result.type === 'video') {
      console.log('🎬 Opening video:', result.title);
      // TODO: Navigate to video or open video player
      // You could trigger video playback here
    } else if (result.type === 'creator') {
      console.log('👤 Opening creator profile:', result.title);
      // TODO: Navigate to creator profile
      // You could switch to profile view or open creator page
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'discover':
        return <ApplePremiumDashboard onSectionChange={setActiveSection} />;
      case 'create':
        return <WizCreatePageV3 />;
      case 'community':
        return <WizCommunityPage onSectionChange={setActiveSection} />;
      case 'leaderboard':
        return <WizLeaderboardPage />;
      case 'premiere':
        return <WizPremierePage />;
      case 'profile':
        return <DynamicProfilePage />;
      case 'settings':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Customize your WIZ experience.</p>
          </div>
        );
      default:
        return <ApplePremiumDashboard onSectionChange={setActiveSection} />;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-white via-[#f7f9fc] to-[#eef1f7] relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <FloatingParticles />

      <div className="flex h-full">
        {/* New WizSidebarV2 - Handles both desktop and mobile */}
        <WizSidebarV2 onNavigate={setActiveSection} />

        {/* Main Content - Seamless Expansion */}
        <main className={cn(
          "flex-1 transition-all duration-300 ease-out",
          !isMobile && "ml-[280px]" // Account for expanded sidebar width
        )}>
          {renderActiveSection()}
        </main>
      </div>
      
      {/* Admin Test Panel - Available on all dashboard pages */}
      <AdminTestPanel />
    </motion.div>
  );
};