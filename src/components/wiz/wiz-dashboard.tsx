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
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-background to-muted/20 relative">
      <FloatingParticles />
      
      {/* Sidebar - Mobile responsive */}
      <WizSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header with User Profile - Mobile responsive */}
        <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-lg">
          <div 
            className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4"
            style={{
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)
              `,
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                {activeSection === 'discover' && 'Discover'}
                {activeSection === 'leaderboard' && 'Leaderboard'}
                {activeSection === 'activate' && 'Activate'}
                {activeSection === 'premiere' && 'WIZ Premiere'}
                {activeSection === 'profile' && 'Profile'}
                {activeSection === 'settings' && 'Settings'}
              </h1>
              
              {/* Privacy Policy Link - Desktop only */}
              <div className="hidden lg:flex items-center space-x-2 text-xs">
                <a 
                  href="https://wizxp.com/privacypolicy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Privacy
                </a>
                <span className="text-gray-400">·</span>
                <a 
                  href="https://wizxp.com/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Terms
                </a>
              </div>
            </div>
            
            {/* User Profile Component */}
            <div className="flex-shrink-0">
              <WizUserProfile />
            </div>
          </div>
        </header>

        {/* Content Area - Mobile responsive */}
        <div className="flex-1 overflow-auto">
          <div className="w-full">
            {renderActiveSection()}
          </div>
        </div>
        
        {/* Mobile Footer with Privacy Links */}
        <footer className="lg:hidden border-t border-white/10 backdrop-blur-lg">
          <div 
            className="flex items-center justify-center px-4 py-2 space-x-4 text-xs"
            style={{
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)
              `,
              backdropFilter: 'blur(20px)'
            }}
          >
            <a 
              href="https://wizxp.com/privacypolicy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-gray-400">·</span>
            <a 
              href="https://wizxp.com/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};