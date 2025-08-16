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
        {/* Top Header */}
        <header className="p-6 border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="flex justify-between items-center max-w-full">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold capitalize truncate">
                {activeSection === 'discover' ? 'Discover Content' : 
                 activeSection === 'leaderboard' ? 'Leaderboards' :
                 activeSection === 'activate' ? 'Activate YouTube' :
                 activeSection === 'premiere' ? 'WIZ Premiere' :
                 activeSection === 'profile' ? 'Your Profile' :
                 'Settings'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {activeSection === 'discover' && 'Watch content and earn XP'}
                {activeSection === 'leaderboard' && 'Compete with top creators and wizards'}
                {activeSection === 'activate' && 'Connect your YouTube account to start earning'}
                {activeSection === 'premiere' && 'Unlock premium features and exclusive content'}
                {activeSection === 'profile' && 'Track your learning journey and achievements'}
                {activeSection === 'settings' && 'Customize your WIZ experience'}
              </p>
            </div>
            
            <div className="ml-4 flex-shrink-0">
              <WizUserProfile />
            </div>
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