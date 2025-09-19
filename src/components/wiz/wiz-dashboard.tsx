import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { WizSidebar } from './wiz-sidebar';
import { WizMobileMenu } from './WizMobileMenu';
import { WizUserProfile } from './wiz-user-profile';
import { ApplePremiumDashboard } from './ApplePremiumDashboard';
import { WizLeaderboard } from './wiz-leaderboard';
import { WizPremierePage } from './wiz-premiere-page';
import { WizLeaderboardPage } from './wiz-leaderboard-page';
import { DynamicProfilePage } from './DynamicProfilePage';
import { WizCreatePage } from './WizCreatePage';
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
        return <ApplePremiumDashboard />;
      case 'create':
        return <WizCreatePage />;
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
        return <ApplePremiumDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-background to-muted/20 relative">
      <FloatingParticles />

      {/* Desktop Sidebar */}
      {!isMobile && (
        <WizSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Content Area - Mobile responsive */}
        <div className="flex-1 overflow-auto">
          <div className="w-full">
            {renderActiveSection()}
          </div>
        </div>
      </main>
      
      {/* Mobile Floating Create Button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setActiveSection('create')}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg transition-all duration-200",
              "bg-gradient-to-r from-green-500 to-teal-600",
              "hover:from-green-600 hover:to-teal-700",
              "hover:shadow-xl hover:scale-110",
              activeSection === 'create' && "ring-4 ring-green-400/50"
            )}
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>
      )}
      
      {/* Admin Test Panel - Available on all dashboard pages */}
      <AdminTestPanel />
    </div>
  );
};