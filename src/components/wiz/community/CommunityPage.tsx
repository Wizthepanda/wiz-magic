import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CommunityCard } from "./CommunityCard";
import { HeroFeatured } from "./HeroFeatured";
import { FilterBar } from "./FilterBar";
import { BalanceWidget } from "./BalanceWidget";
import { CommunityModal } from "./CommunityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/context/XpContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CommunityPageProps {
  onSectionChange?: (section: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onSectionChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRewardType, setSelectedRewardType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user } = useAuth();
  const { xpData } = useXp();
  const isMobile = useIsMobile();

  // Fetch communities from Firestore
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities', 'published'],
    queryFn: async () => {
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
        results.push({
          id: doc.id,
          ...data,
          // Normalize fields
          zapsRequired: data.zapsRequired || 0,
          usdCoPay: data.usdCoPay || 0,
          membersCount: data.membersCount || 0,
          coverMedia: data.coverMedia || [],
          tags: data.tags || [],
          modules: data.modules || [],
          price: {
            zaps: data.zapsRequired || 0,
            usd: data.usdCoPay || 0
          },
          creator: {
            name: data.creatorName || 'Unknown Creator',
            avatarUrl: data.creatorAvatar || '/Profile Pics/FERA.jpg',
            level: data.creatorLevel || 1
          },
          creatorName: data.creatorName || 'Unknown Creator',
          creatorAvatar: data.creatorAvatar || '/Profile Pics/FERA.jpg',
          limit: {
            seats: data.slotsAvailable,
            claimed: 0
          }
        });
      });

      console.log(`✅ Loaded ${results.length} communities`);
      return results;
    }
  });

  // Filter communities
  const filteredCommunities = communities.filter(community => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      community.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Reward type filter
    let matchesRewardType = true;
    if (selectedRewardType === 'free') {
      matchesRewardType = community.zapsRequired === 0 && community.usdCoPay === 0;
    } else if (selectedRewardType === 'zaps') {
      matchesRewardType = community.zapsRequired > 0 && community.usdCoPay === 0;
    } else if (selectedRewardType === 'split') {
      matchesRewardType = community.zapsRequired > 0 && community.usdCoPay > 0;
    }

    // Category filter
    const matchesCategory = selectedCategory === 'all' ||
      community.category?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesRewardType && matchesCategory;
  });

  // Get featured community (first one for now)
  const featuredCommunity = communities[0];

  // Handle community modal open
  const handleOpenCommunity = (community: any) => {
    setSelectedCommunity(community);
    setIsModalOpen(true);
  };

  // Handle join community
  const handleJoinCommunity = async (community: any) => {
    console.log('Joining community:', community.title);
    // TODO: Implement join logic (ZAPs deduction, payment flow, etc.)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-1)] via-[var(--bg-2)] to-[var(--bg-3)]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h1 className={cn(
                "font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent",
                isMobile ? "text-4xl" : "text-5xl"
              )}>
                Community
              </h1>
              <p className={cn(
                "text-slate-600 leading-relaxed",
                isMobile ? "text-base" : "text-lg"
              )}>
                Discover, join, or create communities — unlocked with ZAPs or ZAPs + USD co-pay.{' '}
                <span
                  className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:underline"
                  onClick={() => onSectionChange?.('create')}
                >
                  Create your own
                </span>.
              </p>
            </motion.div>

            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRewardType={selectedRewardType}
              onRewardTypeChange={setSelectedRewardType}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Featured Hero */}
            {featuredCommunity && (
              <HeroFeatured
                community={featuredCommunity}
                onOpen={handleOpenCommunity}
              />
            )}

            {/* All Communities Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={cn(
                  "font-bold text-gray-800",
                  isMobile ? "text-2xl" : "text-3xl"
                )}>
                  All Communities
                </h2>
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  {filteredCommunities.length} found
                </Badge>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-96 bg-white/60 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredCommunities.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredCommunities.map((community, idx) => (
                    <motion.div
                      key={community.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <CommunityCard
                        community={community}
                        onOpen={() => handleOpenCommunity(community)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-gray-500 text-lg mb-4">No communities found</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRewardType('all');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar - Balance Widget (desktop only) */}
          {!isMobile && (
            <aside className="w-[320px] flex-shrink-0 sticky top-20">
              <BalanceWidget
                zapBalance={xpData?.totalXP || 0}
                onAddZaps={() => {
                  console.log('Add ZAPs clicked');
                  // TODO: Navigate to purchase flow
                }}
              />

              {/* Optional: Featured creator or quick access */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100">
                <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Browse free communities to start</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Earn ZAPs by watching videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Join premium communities with ZAPs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Create your own community</span>
                  </li>
                </ul>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Community Modal */}
      {selectedCommunity && (
        <CommunityModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          community={selectedCommunity}
          onJoin={handleJoinCommunity}
        />
      )}
    </div>
  );
};

export default CommunityPage;
