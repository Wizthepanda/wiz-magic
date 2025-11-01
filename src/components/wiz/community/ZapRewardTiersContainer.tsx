/**
 * ZAP Reward Tiers Container - Firebase Integration
 * Fetches tier data from Firestore and passes to display component
 * Maintains the visual design from reference screenshot
 * Falls back to default tiers if none exist in Firebase
 */

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ZapRewardTiersDisplay, ZAPTier } from './ZapRewardTiersDisplay';
import { motion } from 'framer-motion';

interface ZapRewardTiersContainerProps {
  communityId: string;
  onAddTier?: () => void;
}

// Default fallback tiers matching the reference design
const defaultZapTiers: ZAPTier[] = [
  {
    id: 'bronze-tier',
    tier: 'Bronze',
    icon: '⚡',
    zapsRequired: 9,
    currentZAPs: 0,
    rewards: [
      { id: 'b1', name: 'Module 3', completed: false },
      { id: 'b2', name: 'Complete Module 2 Building', completed: false },
    ],
  },
  {
    id: 'silver-tier',
    tier: 'Silver',
    icon: '🔥',
    zapsRequired: 25,
    currentZAPs: 0,
    rewards: [
      { id: 's1', name: 'Welcome Bonus', description: '50 ZAPs for joining', completed: false },
      { id: 's2', name: 'VIP Discord Badge', description: 'Exclusive role in server', completed: false },
    ],
  },
  {
    id: 'gold-tier',
    tier: 'Gold',
    icon: '👑',
    zapsRequired: 50,
    currentZAPs: 0,
    rewards: [
      { id: 'g1', name: 'Premium Content Access', description: 'Unlock exclusive courses', completed: false },
      { id: 'g2', name: 'Monthly Bonus ZAPs', description: '100 ZAPs every month', completed: false },
      { id: 'g3', name: 'Creator Spotlight', description: 'Featured in newsletter', completed: false },
    ],
  },
  {
    id: 'diamond-tier',
    tier: 'Diamond',
    icon: '💎',
    zapsRequired: 100,
    currentZAPs: 0,
    rewards: [
      { id: 'd1', name: '1-on-1 Mentorship', description: 'Private session with creator', completed: false },
      { id: 'd2', name: 'Custom Profile Badge', description: 'Unique diamond status', completed: false },
      { id: 'd3', name: 'Early Access Features', description: 'Beta test new releases', completed: false },
    ],
  },
  {
    id: 'platinum-tier',
    tier: 'Platinum',
    icon: '🌟',
    zapsRequired: 250,
    currentZAPs: 0,
    rewards: [
      { id: 'p1', name: 'Lifetime Premium', description: 'Forever access to all content', completed: false },
      { id: 'p2', name: 'Co-Creation Rights', description: 'Help shape future content', completed: false },
      { id: 'p3', name: 'Revenue Share', description: '5% of community earnings', completed: false },
      { id: 'p4', name: 'Hall of Fame Entry', description: 'Permanent recognition', completed: false },
    ],
  },
];

export const ZapRewardTiersContainer: React.FC<ZapRewardTiersContainerProps> = ({
  communityId,
  onAddTier,
}) => {
  const [tiers, setTiers] = useState<ZAPTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZapTiers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tiers from Firebase
        const tiersRef = collection(db, 'communities', communityId, 'zapRewardTiers');
        const q = query(tiersRef, orderBy('zapsRequired', 'asc'));
        const querySnapshot = await getDocs(q);

        const tierData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ZAPTier[];

        // Use Firebase data if available, otherwise fall back to defaults
        setTiers(tierData.length > 0 ? tierData : defaultZapTiers);
      } catch (err) {
        console.error('Error fetching ZAP reward tiers:', err);
        // On error, use default tiers instead of showing error
        setTiers(defaultZapTiers);
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      fetchZapTiers();
    } else {
      // If no communityId, show defaults immediately
      setTiers(defaultZapTiers);
      setLoading(false);
    }
  }, [communityId]);

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2" />
          <div className="h-4 bg-gray-200 rounded-lg w-96" />
        </div>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Header */}
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
              {/* Content */}
              <div className="bg-white p-6 space-y-3">
                <div className="h-2 bg-gray-200 rounded-full w-full" />
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center border border-red-200 bg-red-50 rounded-2xl py-10 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-red-600 font-medium mb-2">Failed to load reward tiers</p>
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Pass data to display component
  return <ZapRewardTiersDisplay tiers={tiers} onAddTier={onAddTier} showEmptyState={true} />;
};

export default ZapRewardTiersContainer;
