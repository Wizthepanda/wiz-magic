import { useState } from 'react';
import { WizSidebar } from './wiz-sidebar';
import { WizMobileMenu } from './WizMobileMenu';
import { WizUserProfile } from './wiz-user-profile';
import { WizDiscoverSection } from './wiz-discover-section';
import { WizLeaderboard } from './wiz-leaderboard';
import { WizPremierePage } from './wiz-premiere-page';
import { WizLeaderboardPage } from './wiz-leaderboard-page';
import { WizProfilePage } from './wiz-profile-page';
import { WizCreatePage } from './WizCreatePage';
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
        return <WizDiscoverSection />;
      case 'create':
        return <WizCreatePage />;
      case 'leaderboard':
        return <WizLeaderboardPage />;
      case 'premiere':
        return <WizPremierePage />;
      case 'profile':
        return <WizProfilePage />;
      case 'settings':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Customize your WIZ experience.</p>
          </div>
        );
      default:
        return <WizDiscoverSection />;
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
        {/* Header - Mobile responsive */}
        <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-lg">
          <div 
            className={cn(
              "flex items-center px-3 sm:px-6 py-3 sm:py-4",
              isMobile ? "justify-between" : "justify-between"
            )}
            style={{
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)
              `,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            {isMobile ? (
              <>
                {/* Mobile Layout */}
                {/* Left: Hamburger Menu */}
                <div className="flex-shrink-0">
                  <WizMobileMenu 
                    activeSection={activeSection} 
                    onSectionChange={setActiveSection} 
                  />
                </div>
                
                {/* Center: Search Bar */}
                <div className="flex-1 px-4 max-w-md mx-auto">
                  <WizSearchBar 
                    onSearch={handleSearch}
                    onResultSelect={handleResultSelect}
                    placeholder="Search videos, creators..."
                  />
                </div>
                
                {/* Right: Compact Profile */}
                <div className="flex-shrink-0">
                  <WizUserProfile />
                </div>
              </>
            ) : (
              <>
                {/* Desktop Layout */}
                {/* Left Section - Page Title */}
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                    {activeSection === 'discover' && 'Discover'}
                    {activeSection === 'create' && 'Create'}
                    {activeSection === 'leaderboard' && 'Leaderboard'}
                    {activeSection === 'premiere' && 'WIZ Premiere'}
                    {activeSection === 'profile' && 'Profile'}
                    {activeSection === 'settings' && 'Settings'}
                  </h1>
                </div>
                
                {/* Center Section - Search Bar */}
                <div className="flex-1 flex justify-center px-4 sm:px-8 min-w-0">
                  <WizSearchBar 
                    onSearch={handleSearch}
                    onResultSelect={handleResultSelect}
                    placeholder="Search videos, creators..."
                  />
                </div>
                
                {/* Right Section - User Profile */}
                <div className="flex-shrink-0">
                  <WizUserProfile />
                </div>
              </>
            )}
          </div>
        </header>

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