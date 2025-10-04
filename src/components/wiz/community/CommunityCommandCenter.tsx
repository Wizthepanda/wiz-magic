import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/context/XpContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { EnhancedBalanceWidget } from "./EnhancedBalanceWidget";
import { UnifiedFilterBar } from "./UnifiedFilterBar";
import { EnhancedCommunityCard } from "./EnhancedCommunityCard";
import { CinematicModal } from "./CinematicModal";
import { CreatorDashboard } from "./CreatorDashboard";

interface CommunityCommandCenterProps {
  onSectionChange?: (section: string) => void;
}

export const CommunityCommandCenter: React.FC<CommunityCommandCenterProps> = ({ onSectionChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mainFilter, setMainFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'discover' | 'creations'>('discover');

  const { user } = useAuth();
  const { xpData } = useXp();
  const isMobile = useIsMobile();

  // Fetch all communities and ZAP rewards
  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ['community-command-center', mainFilter, subFilter],
    queryFn: async () => {
      // Fetch published communities
      const communitiesQuery = query(
        collection(db, 'communities'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(communitiesQuery);
      const results: any[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Determine item type and reward model
        const zapRequired = data.zapsRequired || 0;
        const usdCoPay = data.usdCoPay || 0;
        const offerZaps = data.offerZAPsToNewMembers || false;
        const zapReward = data.newMemberZAPsReward || 0;

        let itemType = 'community';
        let rewardType = 'free';

        if (data.category?.toLowerCase().includes('course')) {
          itemType = 'course';
        } else if (data.category?.toLowerCase().includes('coaching')) {
          itemType = 'coaching';
        } else if (data.category?.toLowerCase().includes('product') || data.category?.toLowerCase().includes('digital')) {
          itemType = 'product';
        }

        // Determine reward type
        if (offerZaps && zapReward > 0) {
          rewardType = 'free-zaps';
        } else if (zapRequired > 0 && usdCoPay > 0) {
          rewardType = 'zaps-usd';
        } else if (zapRequired > 0) {
          rewardType = 'paid-zaps';
        } else if (usdCoPay > 0) {
          rewardType = 'paid';
        }

        results.push({
          id: doc.id,
          ...data,
          itemType,
          rewardType,
          zapRequired,
          usdCoPay,
          offerZaps,
          zapReward,
          coverMedia: data.coverMedia || [],
          tags: data.tags || [],
          modules: data.modules || [],
          creator: {
            name: data.creatorName || 'Unknown Creator',
            avatarUrl: data.creatorAvatar || '/Profile Pics/FERA.jpg',
            level: data.creatorLevel || 1
          }
        });
      });

      console.log(`✅ Loaded ${results.length} items for Community Command Center`);
      return results;
    }
  });

  // Filter items based on filters
  const filteredItems = allItems.filter(item => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Main filter (type)
    let matchesMainFilter = true;
    if (mainFilter !== 'all') {
      if (mainFilter === 'communities') matchesMainFilter = item.itemType === 'community';
      if (mainFilter === 'courses') matchesMainFilter = item.itemType === 'course';
      if (mainFilter === 'coaching') matchesMainFilter = item.itemType === 'coaching';
      if (mainFilter === 'products') matchesMainFilter = item.itemType === 'product';
    }

    // Sub filter (pricing/reward)
    let matchesSubFilter = true;
    if (subFilter !== 'all') {
      if (subFilter === 'free') matchesSubFilter = item.rewardType === 'free';
      if (subFilter === 'free-zaps') matchesSubFilter = item.rewardType === 'free-zaps';
      if (subFilter === 'paid') matchesSubFilter = item.rewardType === 'paid';
      if (subFilter === 'paid-zaps') matchesSubFilter = item.rewardType === 'paid-zaps';
      if (subFilter === 'zaps-usd') matchesSubFilter = item.rewardType === 'zaps-usd';
    }

    return matchesSearch && matchesMainFilter && matchesSubFilter;
  });

  // Get user's created communities
  const userCreations = allItems.filter(item =>
    item.creatorId === user?.uid || item.createdBy === user?.uid
  );

  const displayItems = viewMode === 'discover' ? filteredItems : userCreations;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium gradient background with floating particles */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0b2e] via-[#16213e] to-[#0f3460]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Left Section */}
            <div className="space-y-4">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                Community
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Discover lifetime rewards, join, or create communities
              </p>
              <Button
                onClick={() => onSectionChange?.('create')}
                className="group relative h-12 px-6 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-cyan-300 opacity-0 group-hover:opacity-20 blur-xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Plus className="w-5 h-5 mr-2" />
                Create Your Own
              </Button>
            </div>

            {/* Right Section - Search & Balance */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communities, courses, creators…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all",
                    isMobile ? "w-full" : "w-80"
                  )}
                />
              </div>

              {/* Balance Widget */}
              <EnhancedBalanceWidget
                zapBalance={xpData?.totalXP || 0}
                usdEquivalent={(xpData?.totalXP || 0) * 0.01} // Example conversion
              />
            </div>
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3"
          >
            <button
              onClick={() => setViewMode('discover')}
              className={cn(
                "px-6 py-2.5 rounded-full font-semibold transition-all duration-300",
                viewMode === 'discover'
                  ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              🔘 Discover
            </button>
            <button
              onClick={() => setViewMode('creations')}
              className={cn(
                "px-6 py-2.5 rounded-full font-semibold transition-all duration-300",
                viewMode === 'creations'
                  ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              )}
            >
              🔘 Your Creations
            </button>
          </motion.div>
        )}

        {/* Unified Filter Bar */}
        {viewMode === 'discover' && (
          <UnifiedFilterBar
            mainFilter={mainFilter}
            onMainFilterChange={setMainFilter}
            subFilter={subFilter}
            onSubFilterChange={setSubFilter}
          />
        )}

        {/* Community Grid */}
        <section className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-96 bg-white/5 backdrop-blur-sm rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : displayItems.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {displayItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <EnhancedCommunityCard
                    item={item}
                    onView={() => {
                      setSelectedCommunity(item);
                      setIsModalOpen(true);
                    }}
                    isCreatorView={viewMode === 'creations'}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {viewMode === 'creations' ? 'No creations yet' : 'No communities found'}
              </h3>
              <p className="text-gray-400 mb-6">
                {viewMode === 'creations'
                  ? 'Create your first community to get started'
                  : 'Try adjusting your filters or search query'}
              </p>
              {viewMode === 'creations' ? (
                <Button
                  onClick={() => onSectionChange?.('create')}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setMainFilter('all');
                    setSubFilter('all');
                  }}
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Cinematic Modal */}
      {selectedCommunity && (
        <CinematicModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          community={selectedCommunity}
          onJoin={(community) => {
            console.log('Joining:', community.title);
            // TODO: Implement join logic
          }}
        />
      )}
    </div>
  );
};

export default CommunityCommandCenter;
