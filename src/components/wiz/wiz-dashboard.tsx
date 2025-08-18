import { useState } from 'react';
import { WizSidebar } from './wiz-sidebar';
import { WizUserProfile } from './wiz-user-profile';
import { WizDiscoverSection } from './wiz-discover-section';
import { WizLeaderboard } from './wiz-leaderboard';
import { WizActivatePage } from './wiz-activate-page';
import { WizPremierePage } from './wiz-premiere-page';
import { WizLeaderboardPage } from './wiz-leaderboard-page';
import { WizProfilePage } from './wiz-profile-page';
import { FloatingParticles } from '@/components/ui/floating-particles';

interface WizDashboardProps {
  onBackToHomepage?: () => void;
}

export const WizDashboard = ({ onBackToHomepage }: WizDashboardProps) => {
  const [activeSection, setActiveSection] = useState('discover');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'discover':
        return <WizDiscoverSection />;
      case 'leaderboard':
        return <WizLeaderboardPage />;
      case 'activate':
        return <WizActivatePage />;
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
    <div className="min-h-screen flex bg-gradient-to-br from-background to-muted/20 relative">
      <FloatingParticles />
      
      
      {/* Sidebar */}
      <WizSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header with User Profile */}
        <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-lg">
          <div 
            className="flex items-center justify-between px-6 py-4"
            style={{
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)
              `,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeSection === 'discover' && 'Discover'}
                {activeSection === 'leaderboard' && 'Leaderboard'}
                {activeSection === 'activate' && 'Activate'}
                {activeSection === 'premiere' && 'WIZ Premiere'}
                {activeSection === 'profile' && 'Profile'}
                {activeSection === 'settings' && 'Settings'}
              </h1>
            </div>
            
            {/* User Profile Component */}
            <WizUserProfile />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-full">
            {renderActiveSection()}
          </div>
        </div>
      </main>
    </div>
  );
};