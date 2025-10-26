import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CommunityJoinModal, AccessType } from './CommunityJoinModal';
import { Button } from './button';
import { cn } from '@/lib/utils';

/**
 * Demo Component for CommunityJoinModal
 *
 * Showcases all 6 access types:
 * 1. Free
 * 2. Free ZAPs
 * 3. Paid (USD)
 * 4. Paid ZAPs
 * 5. Hybrid (ZAPs + USD)
 * 6. Waitlist
 */

interface DemoScenario {
  accessType: AccessType;
  title: string;
  description: string;
  rewardInfo?: any;
  transactionId?: string;
}

const scenarios: DemoScenario[] = [
  {
    accessType: 'free',
    title: '🆓 Free Join',
    description: 'No payment required',
    rewardInfo: { zapsEarned: 50 },
  },
  {
    accessType: 'free-zaps',
    title: '⚡ Free ZAPs',
    description: 'Join using ZAP balance',
    rewardInfo: { zapsSpent: 25, xpEarned: 10 },
  },
  {
    accessType: 'paid-usd',
    title: '💸 Paid (USD)',
    description: 'Premium USD subscription',
    rewardInfo: { usdAmount: 9.99, xpEarned: 50 },
    transactionId: 'TXN-2025-001234',
  },
  {
    accessType: 'paid-zaps',
    title: '⚡💎 Paid ZAPs',
    description: 'Premium ZAP payment',
    rewardInfo: { zapsSpent: 100, xpEarned: 75 },
  },
  {
    accessType: 'hybrid',
    title: '💱 Hybrid',
    description: 'ZAPs + USD combination',
    rewardInfo: { zapsSpent: 10, usdAmount: 5, xpEarned: 100 },
    transactionId: 'HYB-2025-567890',
  },
  {
    accessType: 'waitlist',
    title: '⏳ Waitlist',
    description: 'Join the waiting list',
  },
];

export const CommunityJoinModalDemo: React.FC = () => {
  const [activeModal, setActiveModal] = useState<AccessType | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);

  const openModal = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setActiveModal(scenario.accessType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedScenario(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
            Community Join Modal Demo
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Click any card below to preview how the modal adapts to different access types
          </p>
        </motion.div>

        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={scenario.accessType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => openModal(scenario)}
            >
              <div
                className={cn(
                  "relative p-6 rounded-3xl backdrop-blur-xl border shadow-lg transition-all duration-300",
                  "bg-white/60 hover:bg-white/80 border-gray-200 hover:border-violet-300",
                  "hover:shadow-2xl hover:shadow-violet-500/20"
                )}
              >
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {scenario.title}
                    </h3>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>

                  {/* Reward Preview */}
                  {scenario.rewardInfo && (
                    <div className="space-y-1 text-xs text-gray-500">
                      {scenario.rewardInfo.zapsEarned && (
                        <p>✨ Earns: +{scenario.rewardInfo.zapsEarned} ZAPs</p>
                      )}
                      {scenario.rewardInfo.zapsSpent && (
                        <p>⚡ Costs: {scenario.rewardInfo.zapsSpent} ZAPs</p>
                      )}
                      {scenario.rewardInfo.usdAmount && (
                        <p>💵 Price: ${scenario.rewardInfo.usdAmount}</p>
                      )}
                      {scenario.rewardInfo.xpEarned && (
                        <p>🎯 XP: +{scenario.rewardInfo.xpEarned}</p>
                      )}
                    </div>
                  )}

                  {/* Click Indicator */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Click to preview</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:scale-110 transition-transform">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Code Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 p-8 rounded-3xl bg-gray-900 text-white shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-4">Usage Example</h2>
          <pre className="text-sm overflow-x-auto">
            <code>{`import { CommunityJoinModal } from '@/components/ui/CommunityJoinModal';

<CommunityJoinModal
  open={isOpen}
  onOpenChange={setIsOpen}
  accessType="hybrid" // 'free' | 'free-zaps' | 'paid-usd' | 'paid-zaps' | 'hybrid' | 'waitlist'
  communityName="Cyberpunk Wolf Forge"
  communityAvatar="https://example.com/avatar.png"
  rewardInfo={{
    zapsSpent: 10,
    usdAmount: 5,
    xpEarned: 100
  }}
  transactionId="HYB-2025-567890"
  onEnterCommunity={() => navigate('/community/123')}
  onSecondaryAction={() => navigate('/wallet')}
/>`}</code>
          </pre>
        </motion.div>
      </div>

      {/* Active Modal */}
      {selectedScenario && (
        <CommunityJoinModal
          open={activeModal !== null}
          onOpenChange={(open) => !open && closeModal()}
          accessType={selectedScenario.accessType}
          communityName="Cyberpunk Wolf Forge"
          communityAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=cyberpunk"
          rewardInfo={selectedScenario.rewardInfo}
          transactionId={selectedScenario.transactionId}
          onEnterCommunity={() => {
            console.log('Enter community clicked');
            closeModal();
          }}
          onSecondaryAction={() => {
            console.log('Secondary action clicked');
            closeModal();
          }}
        />
      )}
    </div>
  );
};

export default CommunityJoinModalDemo;
