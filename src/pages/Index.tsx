import { useState, useEffect } from 'react';
import { WizHomepage } from '@/components/wiz/wiz-homepage';
import { WizDashboard } from '@/components/wiz/wiz-dashboard';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

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
