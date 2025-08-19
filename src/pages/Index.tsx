import { useState, useEffect } from 'react';
import { WizHomepage } from '@/components/wiz/wiz-homepage';
import { WizDashboard } from '@/components/wiz/wiz-dashboard';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const { user, loading } = useAuth();

  // Auto-navigate to dashboard when user is authenticated
  useEffect(() => {
    console.log('🔍 Index page - Auth state check:', { loading, user: user ? `${user.email} (uid: ${user.uid})` : null });
    
    if (!loading && user) {
      console.log('🎯 User authenticated, showing dashboard');
      setShowDashboard(true);
    } else if (!loading && !user) {
      console.log('🏠 No user found, showing homepage');
      setShowDashboard(false);
    } else if (loading) {
      console.log('⏳ Auth still loading...');
    }
  }, [user, loading]);

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
