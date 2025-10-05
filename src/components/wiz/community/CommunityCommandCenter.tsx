import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, runTransaction, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/context/XpContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { CommunityWalletV4 } from "./CommunityWalletV4";
import { UnifiedFilterBar } from "./UnifiedFilterBar";
import { EnhancedCommunityCard } from "./EnhancedCommunityCard";
import { CinematicModal } from "./CinematicModal";
import { CreatorDashboard } from "./CreatorDashboard";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';
import { useZAPSystem } from "@/hooks/useZAPSystem";

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
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { xpData } = useXp();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { zapData, zapProgress } = useZAPSystem();

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

  // Handle community join/purchase with ZAPs
  const handleJoinCommunity = async (community: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to claim this community",
        variant: "destructive"
      });
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);

      const zapCost = community.zapRequired || community.zapsRequired || 0;
      const currentBalance = zapData?.totalZAPs || 0;

      // Check if user has sufficient balance
      if (zapCost > 0 && currentBalance < zapCost) {
        toast({
          title: "Insufficient ZAPs",
          description: `You need ${zapCost} ZAPs but only have ${currentBalance} ZAPs`,
          variant: "destructive"
        });
        return;
      }

      // Run transaction to deduct ZAPs and add user to community
      await runTransaction(db, async (transaction) => {
        const userDocRef = doc(db, 'users', user.uid);
        const communityDocRef = doc(db, 'communities', community.id);

        // Get current user data
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found");
        }

        const userData = userDoc.data();
        const currentZAPs = userData.totalZAPs || 0;

        // Double-check balance in transaction
        if (zapCost > 0 && currentZAPs < zapCost) {
          throw new Error("Insufficient ZAPs");
        }

        // Deduct ZAPs from user balance
        if (zapCost > 0) {
          transaction.update(userDocRef, {
            totalZAPs: currentZAPs - zapCost,
            lastUpdated: serverTimestamp()
          });
        }

        // Add user to community members
        transaction.update(communityDocRef, {
          members: arrayUnion(user.uid),
          memberCount: (community.memberCount || 0) + 1,
          lastUpdated: serverTimestamp()
        });

        // Log transaction
        const transactionRef = doc(collection(db, 'transactions'));
        transaction.set(transactionRef, {
          userId: user.uid,
          type: 'community_purchase',
          communityId: community.id,
          communityTitle: community.title,
          zapAmount: zapCost,
          timestamp: serverTimestamp(),
          status: 'completed'
        });
      });

      // Success feedback
      toast({
        title: "🎉 Success!",
        description: `You've joined ${community.title}!`,
      });

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Close modal
      setIsModalOpen(false);

      // Refresh user data (XP will update automatically via context)
      window.location.reload();

    } catch (error: any) {
      console.error("Error joining community:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Unable to complete purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 60%, #f5f5f7 100%)'
    }}>
      {/* Subtle depth layer */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10">
        {/* Hero Section - Ultra-Premium Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex justify-between items-center w-full">
            {/* Left - Title & Subtitle */}
            <div className="flex-shrink-0">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-4xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent"
                style={{ letterSpacing: '-0.02em', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif' }}
              >
                Community
              </motion.h1>
              <p className="text-[#666] font-medium text-base mt-1" style={{ letterSpacing: '-0.01em' }}>
                Discover awesome communities, premium rewards —{' '}
                <span
                  className="text-violet-600 cursor-pointer hover:text-violet-700 transition-colors"
                  onClick={() => onSectionChange?.('create')}
                >
                  or create your own
                </span>.
              </p>
            </div>

            {/* Center - Ultra-Premium Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative flex items-center h-12 rounded-2xl bg-white/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white/20 focus-within:border-violet-400 transition-all duration-300 group">
                <Search className="absolute left-4 w-5 h-5 text-violet-500 transition-colors" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search communities, creators, or rewards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-12 pr-4 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:text-gray-900"
                />
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileFocus={{ opacity: 1, boxShadow: '0 0 0 2px rgba(167,139,250,0.5)' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Right - Community Wallet V4 */}
            <CommunityWalletV4
              balance={zapData?.totalZAPs || 0}
              earned={Math.floor((zapData?.totalZAPs || 0) * 0.6)}
              spent={Math.floor((zapData?.totalZAPs || 0) * 0.4)}
              onEarnMore={() => {
                onSectionChange?.('earn');
              }}
              onSendZaps={() => {
                // TODO: Open SendZapsModal
                console.log('Send ZAPs clicked');
              }}
            />
          </div>
        </motion.div>


        {/* Unified Filter Bar */}
        <UnifiedFilterBar
          mainFilter={mainFilter}
          onMainFilterChange={setMainFilter}
          subFilter={subFilter}
          onSubFilterChange={setSubFilter}
        />

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
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: idx * 0.05
                  }}
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
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {viewMode === 'creations' ? 'No creations yet' : 'No communities found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {viewMode === 'creations'
                  ? 'Create your first community to get started'
                  : 'Try adjusting your filters or search query'}
              </p>
              {viewMode === 'creations' ? (
                <Button
                  onClick={() => onSectionChange?.('create')}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setMainFilter('all');
                    setSubFilter('all');
                  }}
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
          onJoin={handleJoinCommunity}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default CommunityCommandCenter;
