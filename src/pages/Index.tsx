import { useState, useEffect } from 'react';
import { WizHomepage } from '@/components/wiz/wiz-homepage';
import { WizDashboard } from '@/components/wiz/wiz-dashboard';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();
  // Initialize showDashboard based on current auth state to avoid flicker
  const [showDashboard, setShowDashboard] = useState(!!user && !loading);

  // Auto-navigate to dashboard when user is authenticated
  useEffect(() => {
    if (!loading) {
      const shouldShowDashboard = !!user;
      if (shouldShowDashboard !== showDashboard) {
        console.log(shouldShowDashboard ? '🎯 User authenticated, showing dashboard' : '🏠 No user found, showing homepage');
        setShowDashboard(shouldShowDashboard);
      }
    }
  }, [user, loading, showDashboard]);

  // Add keyboard listener for testing - press 'H' to go back to homepage
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'h' || event.key === 'H') {
        console.log('🏠 Going back to homepage for testing...');
        setShowDashboard(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Show loading state during initial auth check to prevent UI flicker
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-sm opacity-75">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {showDashboard ? (
        <WizDashboard onBackToHomepage={() => setShowDashboard(false)} />
      ) : (
        <WizHomepage onEnterPlatform={() => setShowDashboard(true)} />
      )}
    </div>
  );
};

export default Index;
