import { WizPremiumLeaderboard } from './WizPremiumLeaderboard';
import { FloatingParticles } from '@/components/ui/floating-particles';

export const WizLeaderboardPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Premium Leaderboard */}
        <WizPremiumLeaderboard />
      </div>
    </div>
  );
};