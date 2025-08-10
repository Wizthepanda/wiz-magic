import { useState } from 'react';
import { WizHomepage } from '@/components/wiz/wiz-homepage';
import { WizDashboard } from '@/components/wiz/wiz-dashboard';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div className="min-h-screen">
      {showDashboard ? (
        <WizDashboard />
      ) : (
        <WizHomepage onEnterPlatform={() => setShowDashboard(true)} />
      )}
    </div>
  );
};

export default Index;
