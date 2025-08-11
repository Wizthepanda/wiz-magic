import { useState } from 'react';
import { WizSidebar } from './wiz-sidebar';
import { WizUserProfile } from './wiz-user-profile';
import { WizDiscoverSection } from './wiz-discover-section';
import { WizLeaderboard } from './wiz-leaderboard';
import { FloatingParticles } from '@/components/ui/floating-particles';

export const WizDashboard = () => {
  const [activeSection, setActiveSection] = useState('discover');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'discover':
        return <WizDiscoverSection />;
      case 'leaderboard':
        return <WizLeaderboard />;
      case 'activate':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Link Your YouTube Content</h2>
            <p className="text-muted-foreground">Connect your YouTube account to start earning XP from your watch time.</p>
          </div>
        );
      case 'premiere':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">WIZ Premiere</h2>
            <p className="text-muted-foreground">Unlock premium features at Level 5+</p>
          </div>
        );
      case 'profile':
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
            <p className="text-muted-foreground">Manage your WIZ wizard profile and achievements.</p>
          </div>
        );
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
                 activeSection === 'leaderboard' ? 'Leaderboard' :
                 activeSection === 'activate' ? 'Activate YouTube' :
                 activeSection === 'premiere' ? 'WIZ Premiere' :
                 activeSection === 'profile' ? 'Your Profile' :
                 'Settings'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {activeSection === 'discover' && 'Watch content and earn XP'}
                {activeSection === 'leaderboard' && 'Top creators and wizards'}
                {activeSection === 'activate' && 'Connect your YouTube account'}
                {activeSection === 'premiere' && 'Premium features for Level 5+ wizards'}
                {activeSection === 'profile' && 'Your wizard journey and stats'}
                {activeSection === 'settings' && 'Customize your experience'}
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