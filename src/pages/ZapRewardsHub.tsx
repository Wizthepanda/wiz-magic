import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Users,
  GraduationCap,
  MessageSquare,
  Package,
  Star,
  X,
  BadgeCheck,
  Play,
  ChevronRight,
  Eye,
  Gift,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WizSidebar } from '@/components/wiz/wiz-sidebar';
import { WizMobileMenu } from '@/components/wiz/WizMobileMenu';
import { collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import confetti from 'canvas-confetti';

// Reward Interface
interface Reward {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  type: 'community' | 'course' | 'coaching' | 'product';
  thumbnail: string;
  heroMedia?: string;
  zapsCost: number;
  usdCoPay?: number;
  monetizationType: 'zaps-only' | 'zaps-usd' | 'free';
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  stats: {
    members?: number;
    claimed?: number;
    rating: number;
    reviews: number;
    availableSlots?: number;
    totalSlots?: number;
  };
  benefits?: string[];
}

// Filter categories
const monetizationFilters = [
  { id: 'all', label: 'All Rewards' },
  { id: 'zaps-only', label: 'ZAPs Only' },
  { id: 'zaps-usd', label: 'ZAPs + USD' },
  { id: 'free', label: 'Free Rewards' }
];

const categoryFilters = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'community', label: 'Communities', icon: Users },
  { id: 'course', label: 'Courses', icon: GraduationCap },
  { id: 'coaching', label: 'Coaching', icon: MessageSquare },
  { id: 'product', label: 'Digital Products', icon: Package }
];

// V7 Premium ZAPs Rewards Hub
export default function ZapRewardsHub() {
  const [monetizationFilter, setMonetizationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('rewards');

  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { zapData } = useZAPSystem();
  const navigate = useSafeNavigate();

  // Fetch rewards from Firestore
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
        const fetchedRewards: Reward[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const zapsRequired = data.zapsRequired || 0;
          const usdCoPay = data.usdCoPay || 0;

          let monetizationType: 'zaps-only' | 'zaps-usd' | 'free' = 'free';
          if (zapsRequired > 0 && usdCoPay > 0) {
            monetizationType = 'zaps-usd';
          } else if (zapsRequired > 0) {
            monetizationType = 'zaps-only';
          }

          const reward: Reward = {
            id: doc.id,
            title: data.title || 'Untitled Reward',
            subtitle: data.tagline || '',
            description: data.shortDescription || '',
            longDescription: data.longDescription || data.shortDescription || '',
            type: 'community',
            thumbnail: data.coverMedia?.[0]?.thumbnail || data.coverMedia?.[0]?.url || '/api/placeholder/400/300',
            heroMedia: data.coverMedia?.[0]?.url || data.coverMedia?.[0]?.thumbnail,
            zapsCost: zapsRequired,
            usdCoPay: usdCoPay > 0 ? usdCoPay : undefined,
            monetizationType,
            creator: {
              name: data.creatorName || 'Creator',
              avatar: data.creatorAvatar || '/api/placeholder/60/60',
              verified: false
            },
            stats: {
              members: Math.floor(Math.random() * 1000) + 100,
              claimed: Math.floor(Math.random() * 500),
              rating: 4.5 + Math.random() * 0.5,
              reviews: Math.floor(Math.random() * 200) + 20,
              totalSlots: data.slotsAvailable || 1000,
              availableSlots: data.slotsAvailable ? Math.floor(data.slotsAvailable * 0.7) : 700
            },
            benefits: data.benefits || []
          };

          fetchedRewards.push(reward);
        });

        setRewards(fetchedRewards);
        console.log(`✅ Loaded ${fetchedRewards.length} rewards`);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  const filteredRewards = rewards.filter(reward => {
    const matchesMonetization = monetizationFilter === 'all' || reward.monetizationType === monetizationFilter;
    const matchesCategory = categoryFilter === 'all' || reward.type === categoryFilter;
    return matchesMonetization && matchesCategory;
  });

  const handleSectionChange = (section: string) => {
    navigate(`/?section=${section}`);
  };

  const handleClaimReward = (reward: Reward) => {
    // Confetti burst on claim
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b']
    });

    console.log('Claiming reward:', reward.id);
    setTimeout(() => setSelectedReward(null), 1000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ overflowX: 'hidden' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <WizSidebar
          activeSection="rewards"
          onSectionChange={handleSectionChange}
        />
      )}

      {/* Main Content - V7 Premium Pearl Gradient */}
      <main className="flex-1 min-w-0 overflow-y-auto relative">
        {/* Premium Pearl → Platinum Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#f8f7f4] via-[#fefefe] to-[#e8e8e8] -z-20" />

        {/* Radial Glow Behind Hero */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-100/30 via-transparent to-transparent blur-3xl -z-10 pointer-events-none" />

        {/* Faint Lightning Watermark */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none -z-10">
          <Zap className="absolute top-1/4 right-1/4 w-96 h-96 text-indigo-600" />
          <Zap className="absolute bottom-1/3 left-1/4 w-64 h-64 text-violet-600 rotate-45" />
        </div>

        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur-2xl border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              <WizMobileMenu
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />
              <h1 className="text-lg font-semibold text-gray-900">
                ZAPs Rewards Hub
              </h1>
              <div className="w-10" />
            </div>
          </header>
        )}

        {/* Content Container */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 relative">
          {/* Balance Widget - Top Right */}
          <BalanceWidget userZAPs={zapData?.totalZAPs || 0} />

          {/* Premium Header */}
          <PremiumHeader />

          {/* Filter Rows */}
          <div className="mb-10 space-y-4">
            {/* Monetization Filter Row */}
            <MonetizationFilterRow
              activeFilter={monetizationFilter}
              onFilterChange={setMonetizationFilter}
            />

            {/* Category Filter Row */}
            <CategoryFilterRow
              activeFilter={categoryFilter}
              onFilterChange={setCategoryFilter}
            />
          </div>

          {/* Rewards Grid */}
          <RewardsGrid
            rewards={filteredRewards}
            loading={loading}
            onCardClick={setSelectedReward}
          />
        </div>

        {/* Mobile Sticky CTA */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-2xl border-t border-gray-200 z-30">
            <Button className="w-full h-14 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white text-base font-bold rounded-2xl shadow-lg shadow-indigo-300">
              <Zap className="w-5 h-5 mr-2" fill="currentColor" />
              Claim / Contribute
            </Button>
          </div>
        )}
      </main>

      {/* Cinematic Watch Pop-Up Modal */}
      <AnimatePresence>
        {selectedReward && (
          <CinematicRewardModal
            reward={selectedReward}
            onClose={() => setSelectedReward(null)}
            onClaim={handleClaimReward}
            userZAPs={zapData?.totalZAPs || 0}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Balance Widget - Apple Wallet Style with Pulse Animation
const BalanceWidget: React.FC<{ userZAPs: number }> = ({ userZAPs }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-6 right-6 z-40 hidden lg:block"
    >
      <div className="px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-3xl border border-white/40 shadow-xl shadow-gray-300/30">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md"
            animate={{
              boxShadow: [
                '0 4px 12px rgba(99, 102, 241, 0.3)',
                '0 4px 20px rgba(139, 92, 246, 0.5)',
                '0 4px 12px rgba(99, 102, 241, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </motion.div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Your Balance</p>
            <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
              {userZAPs.toLocaleString()} <span className="text-lg text-indigo-600">⚡</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Premium Header with Shimmer Animation
const PremiumHeader: React.FC = () => {
  const navigate = useSafeNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-12"
    >
      <h1 className="text-5xl lg:text-7xl font-black mb-4 relative inline-block">
        <span
          className="bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-500 bg-clip-text text-transparent"
          style={{
            backgroundSize: '200% auto',
          }}
        >
          ⚡ ZAP Rewards Hub
        </span>
        {/* Animated Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            backgroundSize: '50% 100%',
            mixBlendMode: 'overlay',
          }}
        />
      </h1>
      <p className="text-lg lg:text-xl text-gray-600 max-w-4xl leading-relaxed">
        Discover exclusive communities, earn rewards, and unlock experiences with ZAPs or ZAPs + USD co-pay — or{' '}
        <button
          onClick={() => navigate('/create')}
          className="relative inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-200 group"
        >
          Create a Reward
          <Sparkles className="w-4 h-4 ml-1" />
          {/* Animated Underline */}
          <motion.span
            className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-400 to-violet-400 blur-sm"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </button>
      </p>
    </motion.div>
  );
};

// Monetization Filter Row - Glowing Pills
const MonetizationFilterRow: React.FC<{
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}> = ({ activeFilter, onFilterChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex justify-center"
    >
      <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-gray-200 shadow-lg">
        {monetizationFilters.map((filter) => {
          const isActive = activeFilter === filter.id;

          return (
            <motion.button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300",
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg"
                  : "text-gray-700 hover:text-gray-900 hover:bg-white/50"
              )}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Glow Effect on Active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 opacity-50 blur-lg -z-10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              {filter.label}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// Category Filter Row - Magnetic Snap Scroll
const CategoryFilterRow: React.FC<{
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}> = ({ activeFilter, onFilterChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="overflow-x-auto scrollbar-hide"
      style={{
        scrollSnapType: 'x mandatory',
      }}
    >
      <div className="flex items-center gap-3 min-w-max justify-center pb-2">
        {categoryFilters.map((category, index) => {
          const Icon = category.icon;
          const isActive = activeFilter === category.id;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => onFilterChange(category.id)}
              className={cn(
                "relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 border backdrop-blur-xl",
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-300"
                  : "bg-white/50 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
              )}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                scrollSnapAlign: 'center',
              }}
            >
              {/* Pulse on Active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-40 blur-md -z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <span className="flex items-center space-x-2 relative z-10">
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// Rewards Grid
const RewardsGrid: React.FC<{
  rewards: Reward[];
  loading: boolean;
  onCardClick: (reward: Reward) => void;
}> = ({ rewards, loading, onCardClick }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[420px] rounded-2xl bg-white/40 backdrop-blur-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="list"
    >
      {rewards.map((reward, index) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          index={index}
          onClick={() => onCardClick(reward)}
        />
      ))}
    </motion.div>
  );
};

// Premium Reward Card V7
const RewardCard: React.FC<{
  reward: Reward;
  index: number;
  onClick: () => void;
}> = ({ reward, index, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = {
    community: { icon: Users, color: 'from-blue-500 to-cyan-500', label: 'Community', badge: 'bg-blue-500' },
    course: { icon: GraduationCap, color: 'from-purple-500 to-pink-500', label: 'Course', badge: 'bg-purple-500' },
    coaching: { icon: MessageSquare, color: 'from-green-500 to-emerald-500', label: 'Coaching', badge: 'bg-green-500' },
    product: { icon: Package, color: 'from-orange-500 to-red-500', label: 'Product', badge: 'bg-orange-500' }
  };

  const config = typeConfig[reward.type];
  const TypeIcon = config.icon;

  // Monetization badge
  const monetizationBadge = {
    'zaps-only': { label: 'ZAPs Only', color: 'bg-gradient-to-r from-indigo-500 to-violet-600' },
    'zaps-usd': { label: 'ZAPs + USD', color: 'bg-gradient-to-r from-blue-500 to-green-500' },
    'free': { label: 'Free', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  };

  const badge = monetizationBadge[reward.monetizationType];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group relative cursor-pointer"
      role="listitem"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-label={`${reward.title} - ${reward.zapsCost} ZAPs`}
    >
      <motion.div
        className="relative h-[420px] rounded-2xl overflow-hidden bg-white/50 backdrop-blur-2xl border border-white/60 shadow-xl"
        whileHover={{
          scale: 1.03,
          y: -6,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        }}
        whileTap={{ scale: 0.98 }}
        style={{
          boxShadow: isHovered
            ? '0 20px 50px rgba(0, 0, 0, 0.12), 0 0 30px rgba(99, 102, 241, 0.15)'
            : '0 8px 20px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Thumbnail with Lightning Flicker on Hover */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={reward.thumbnail}
            alt={reward.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Monetization Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <div className={cn("px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg", badge.color)}>
              {badge.label}
            </div>
          </div>

          {/* Type Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/40", config.badge)}>
              <TypeIcon className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-semibold text-white">{config.label}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col justify-between h-[calc(100%-13rem)]">
          <div>
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {reward.title}
            </h3>

            {/* Creator */}
            <div className="flex items-center space-x-2 mb-3">
              <Avatar className="w-6 h-6 border border-gray-200">
                <AvatarImage src={reward.creator.avatar} />
                <AvatarFallback>{reward.creator.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                {reward.creator.name}
                {reward.creator.verified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                )}
              </span>
            </div>

            {/* Description Snippet */}
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {reward.description}
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-3">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {reward.stats.members && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {reward.stats.members.toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                {reward.stats.rating.toFixed(1)}
              </span>
            </div>

            {/* Cost & CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <motion.div
                      animate={isHovered ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="w-3.5 h-3.5" fill="currentColor" />
                    </motion.div>
                    {reward.zapsCost}
                  </span>
                </motion.div>
                {reward.usdCoPay && (
                  <div className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                    <span className="text-sm font-bold text-green-700">
                      +${reward.usdCoPay}
                    </span>
                  </div>
                )}
              </div>

              {/* View Button on Hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      size="sm"
                      className="h-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs shadow-md"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
};

// Cinematic Watch Pop-Up Modal V7
const CinematicRewardModal: React.FC<{
  reward: Reward;
  onClose: () => void;
  onClaim: (reward: Reward) => void;
  userZAPs: number;
}> = ({ reward, onClose, onClaim, userZAPs }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const canAfford = userZAPs >= reward.zapsCost;

  const typeConfig = {
    community: { icon: Users },
    course: { icon: GraduationCap },
    coaching: { icon: MessageSquare },
    product: { icon: Package }
  };

  const TypeIcon = typeConfig[reward.type].icon;

  // Progress calculation for slots
  const slotsProgress = reward.stats.totalSlots && reward.stats.availableSlots
    ? ((reward.stats.totalSlots - reward.stats.availableSlots) / reward.stats.totalSlots) * 100
    : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full p-0 bg-transparent border-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          {/* Fullscreen Frosted Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-3xl"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <div className="relative bg-white/80 backdrop-blur-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/60">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl flex items-center justify-center transition-all shadow-lg group"
            >
              <X className="w-6 h-6 text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Hero Media */}
              <div className="relative h-[500px] lg:h-[700px] bg-gradient-to-br from-gray-100 to-gray-200">
                <motion.img
                  src={reward.heroMedia || reward.thumbnail}
                  alt={reward.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                />

                {/* Soft Glow Edges */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)] pointer-events-none" />

                {/* Play Fullscreen Button for Video */}
                {reward.type === 'course' && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-24 h-24 rounded-full bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-2xl group"
                    >
                      <Play className="w-10 h-10 text-indigo-600 ml-2 group-hover:text-indigo-700 transition-colors" fill="currentColor" />
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Right: Details */}
              <div className="p-8 lg:p-12 flex flex-col justify-between max-h-[700px] overflow-y-auto">
                <div>
                  {/* Title & Creator */}
                  <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                    {reward.title}
                  </h2>

                  {reward.subtitle && (
                    <p className="text-lg text-gray-600 mb-6">{reward.subtitle}</p>
                  )}

                  {/* Creator Info */}
                  <div className="flex items-center space-x-3 mb-6 p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                      <AvatarImage src={reward.creator.avatar} />
                      <AvatarFallback>{reward.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-lg">{reward.creator.name}</span>
                        {reward.creator.verified && (
                          <BadgeCheck className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-500">Creator</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <p className={cn(
                      "text-gray-700 leading-relaxed text-base",
                      !showFullDescription && "line-clamp-4"
                    )}>
                      {reward.longDescription || reward.description}
                    </p>
                    {reward.longDescription && reward.longDescription.length > 250 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 mt-3 flex items-center gap-1 font-semibold"
                      >
                        {showFullDescription ? 'Show less' : 'Read more'}
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform",
                          showFullDescription && "rotate-90"
                        )} />
                      </button>
                    )}
                  </div>

                  {/* Stats Panel */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100">
                    {reward.stats.claimed !== undefined && (
                      <div className="text-center">
                        <p className="text-2xl font-black text-gray-900">{reward.stats.claimed.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 font-medium">Claimed</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900 flex items-center justify-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                        {reward.stats.rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">{reward.stats.reviews} Reviews</p>
                    </div>
                    {reward.stats.members && (
                      <div className="text-center">
                        <p className="text-2xl font-black text-gray-900">{reward.stats.members.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 font-medium">Members</p>
                      </div>
                    )}
                  </div>

                  {/* Slots Progress Bar */}
                  {reward.stats.totalSlots && reward.stats.availableSlots && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-700 mb-2 font-medium">
                        <span>Available Slots</span>
                        <span>{reward.stats.availableSlots} / {reward.stats.totalSlots}</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${slotsProgress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {reward.benefits && reward.benefits.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                        What's Included
                      </h4>
                      <div className="space-y-2">
                        {reward.benefits.slice(0, 5).map((benefit, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom: Price & CTAs */}
                <div className="pt-6 border-t border-gray-200 space-y-4">
                  {/* Price */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.div
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="text-2xl font-black text-white flex items-center gap-2">
                        <Zap className="w-6 h-6" fill="currentColor" />
                        {reward.zapsCost} ZAPs
                      </span>
                    </motion.div>
                    {reward.usdCoPay && (
                      <div className="px-6 py-3 rounded-2xl bg-green-50 border-2 border-green-300">
                        <span className="text-2xl font-black text-green-700">
                          + ${reward.usdCoPay}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onClaim(reward)}
                      disabled={!canAfford}
                      className={cn(
                        "flex-1 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300",
                        canAfford
                          ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white shadow-indigo-400"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {canAfford ? (
                        <>
                          <Zap className="w-5 h-5 inline mr-2" fill="currentColor" />
                          Claim Reward
                        </>
                      ) : (
                        'Insufficient ZAPs'
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-4 rounded-2xl border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                    >
                      <Gift className="w-6 h-6 text-gray-700" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
