import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { WizSidebar } from '@/components/wiz/wiz-sidebar';
import { WizMobileMenu } from '@/components/wiz/WizMobileMenu';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import confetti from 'canvas-confetti';

// Import V9 Components
import {
  Header,
  FilterRow,
  MobileFilterRow,
  RewardCard,
  RewardDialog,
  type Reward as V9Reward,
  type MonetizationType,
  type RewardCategory,
  type ClaimRequest,
  type MediaSlot,
} from '@/components/zap-rewards-v9';

// ZAP Rewards Hub with V9 Components
export default function ZapRewardsHub() {
  const [monetizationFilter, setMonetizationFilter] = useState<'all' | MonetizationType>('all');
  const [selectedCategories, setSelectedCategories] = useState<RewardCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rewards, setRewards] = useState<V9Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<V9Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('rewards');

  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { zapData } = useZAPSystem();
  const navigate = useSafeNavigate();

  // Fetch rewards from Firestore and convert to V9 format
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const communitiesQuery = query(
          collection(db, 'communities'),
          where('status', '==', 'published'),
          firestoreLimit(50)
        );

        const snapshot = await getDocs(communitiesQuery);
        const fetchedRewards: V9Reward[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const zapsRequired = data.zapsRequired || 0;
          const usdCoPay = data.usdCoPay || 0;

          // Determine monetization type
          let monetizationType: MonetizationType = 'free';
          if (zapsRequired > 0 && usdCoPay > 0) {
            monetizationType = 'zaps-usd';
          } else if (zapsRequired > 0) {
            monetizationType = 'zaps-only';
          }

          // Convert coverMedia to V9 MediaSlot format
          const coverMedia: MediaSlot[] = (data.coverMedia || []).map((media: any, idx: number) => {
            console.log(`📸 Media ${idx} for ${data.title}:`, {
              type: media.type,
              url: media.url,
              thumbnail: media.thumbnail,
              videoId: media.videoId,
              fullObject: media
            });

            // Handle blob URLs - they need to be converted to Firebase Storage URLs
            let finalUrl = media.url || media.thumbnail || '/api/placeholder/400/300';
            let finalThumbnail = media.thumbnail || media.url;

            // If it's a blob URL, it means the image wasn't uploaded to Firebase Storage properly
            if (finalUrl?.startsWith('blob:')) {
              console.warn(`⚠️ Blob URL detected for ${data.title} media ${idx}, this won't persist`);
              finalUrl = '/api/placeholder/400/300';
            }

            return {
              id: `${doc.id}-media-${idx}`,
              type: media.type || 'image',
              url: finalUrl,
              thumbnail: finalThumbnail?.startsWith('blob:') ? finalUrl : finalThumbnail,
              videoId: media.videoId,
              alt: data.title || 'Media',
            };
          });

          // Ensure at least one media slot
          if (coverMedia.length === 0) {
            console.warn(`⚠️ No coverMedia found for ${data.title}, using placeholder`);
            coverMedia.push({
              id: `${doc.id}-media-0`,
              type: 'image',
              url: '/api/placeholder/400/300',
              alt: data.title || 'Placeholder',
            });
          }

          console.log(`✅ Final coverMedia for ${data.title}:`, coverMedia);

          const reward: V9Reward = {
            id: doc.id,
            title: data.title || 'Untitled Reward',
            subtitle: data.tagline || '',
            description: data.shortDescription || 'No description available',
            longDescription: data.longDescription || data.shortDescription || 'No description available',
            coverMedia,
            category: 'community' as RewardCategory,
            tags: data.tags || ['Community', 'Featured'],
            privacy: data.privacy || 'public',
            creator: {
              id: data.creatorId || 'unknown',
              name: data.creatorName || 'Creator',
              avatar: data.creatorAvatar || '/api/placeholder/60/60',
              verified: false,
            },
            pricing: {
              zapsCost: zapsRequired,
              usdCoPay: usdCoPay > 0 ? usdCoPay : undefined,
              monetizationType,
            },
            stats: {
              rating: 4.5 + Math.random() * 0.5,
              reviews: Math.floor(Math.random() * 200) + 20,
              members: Math.floor(Math.random() * 1000) + 100,
              claimed: Math.floor(Math.random() * 500),
              totalSlots: data.slotsAvailable || 1000,
              availableSlots: data.slotsAvailable ? Math.floor(data.slotsAvailable * 0.7) : 700,
            },
            status: 'available',
            benefits: data.benefits || [
              'Access to exclusive community',
              'Weekly live sessions',
              'Direct creator support',
              'Member-only resources',
            ],
            featured: Math.random() > 0.7,
            trending: Math.random() > 0.8,
            createdAt: data.createdAt?.toDate() || new Date(),
          };

          fetchedRewards.push(reward);
        });

        setRewards(fetchedRewards);
        console.log(`✅ Loaded ${fetchedRewards.length} V9 rewards`);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  // Filter rewards
  const filteredRewards = rewards.filter((reward) => {
    const matchesMonetization =
      monetizationFilter === 'all' || reward.pricing.monetizationType === monetizationFilter;
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(reward.category);
    const matchesSearch =
      !searchQuery ||
      reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonetization && matchesCategory && matchesSearch;
  });

  const handleSectionChange = (section: string) => {
    navigate(`/?section=${section}`);
  };

  const toggleCategory = (category: RewardCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleClaim = async (request: ClaimRequest) => {
    try {
      // Confetti burst on claim
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'],
      });

      console.log('Claiming reward:', request);
      // TODO: Implement actual claim logic
      setTimeout(() => setSelectedReward(null), 1000);
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ overflowX: 'hidden' }}>
      {/* Desktop Sidebar */}
      {!isMobile && <WizSidebar activeSection="rewards" onSectionChange={handleSectionChange} />}

      {/* Main Content with V9 Glassmorphic Background */}
      <main className="flex-1 min-w-0 overflow-y-auto relative">
        {/* V9 Glassmorphic Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-20" />

        {/* Animated Gradient Orbs */}
        <div className="fixed inset-0 opacity-30 pointer-events-none -z-15 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-30 border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-3">
              <WizMobileMenu activeSection={activeSection} onSectionChange={setActiveSection} />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">ZAPs Rewards</h1>
              <div className="w-10" />
            </div>
          </header>
        )}

        {/* V9 Header */}
        <Header
          balance={zapData?.totalZAPs || 0}
          level={zapData?.level || 1}
          onSearch={setSearchQuery}
          onEarnMore={() => navigate('/?section=earn')}
          showSearch={true}
        />

        {/* V9 Filter Row */}
        {isMobile ? (
          <MobileFilterRow
            selectedMonetization={monetizationFilter}
            selectedCategories={selectedCategories}
            onMonetizationChange={setMonetizationFilter}
            onCategoryToggle={toggleCategory}
          />
        ) : (
          <FilterRow
            selectedMonetization={monetizationFilter}
            selectedCategories={selectedCategories}
            onMonetizationChange={setMonetizationFilter}
            onCategoryToggle={toggleCategory}
          />
        )}

        {/* Content Container */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[500px] rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-lg animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Rewards Grid */}
          {!loading && filteredRewards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onClick={() => setSelectedReward(reward)}
                  onClaim={(id) => console.log('Quick claim:', id)}
                  size="md"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredRewards.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 mb-6">
                <svg
                  className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No rewards found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={() => {
                  setMonetizationFilter('all');
                  setSelectedCategories([]);
                  setSearchQuery('');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* V9 Reward Dialog Modal */}
      {selectedReward && (
        <RewardDialog
          reward={selectedReward}
          isOpen={!!selectedReward}
          onClose={() => setSelectedReward(null)}
          onClaim={handleClaim}
          userBalance={zapData?.totalZAPs || 0}
          userUSD={0} // TODO: Get from user data
        />
      )}
    </div>
  );
}
