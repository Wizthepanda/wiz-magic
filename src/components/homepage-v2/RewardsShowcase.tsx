import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Check, Users, Video, Star, Sparkles, Lock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PremiumUnlockModal, type PremiumItem, type Creator } from './PremiumUnlockModal';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PremiumOffer {
  id: string;
  title: string;
  creatorName: string;
  creatorId: string;
  creatorAvatarUrl: string;
  zapCost: number;
  image: string;
  description?: string;
}

// Fallback placeholder content
const FALLBACK_OFFERS: PremiumOffer[] = [
  {
    id: '1',
    creatorName: 'Creator Placeholder',
    creatorId: 'placeholder-1',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
    title: 'Master the Art of Personal Branding',
    zapCost: 120,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=1000&fit=crop&q=80',
    description: 'Learn how to build and maintain a powerful personal brand that attracts opportunities and grows your influence authentically.',
  },
  {
    id: '2',
    creatorName: 'Creator Placeholder',
    creatorId: 'placeholder-2',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
    title: 'Build a Loyal Community That Grows Itself',
    zapCost: 150,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop&q=80',
    description: 'Discover the strategies to create a self-sustaining community where members actively engage, contribute, and invite others.',
  },
  {
    id: '3',
    creatorName: 'Creator Placeholder',
    creatorId: 'placeholder-3',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
    title: 'Content Systems for Consistent Growth',
    zapCost: 90,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1000&fit=crop&q=80',
    description: 'Build repeatable content systems that drive consistent growth without burning out. Work smarter, not harder.',
  },
  {
    id: '4',
    creatorName: 'Creator Placeholder',
    creatorId: 'placeholder-4',
    creatorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
    title: 'Your First Digital Product Launch Strategy',
    zapCost: 200,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1000&fit=crop&q=80',
    description: 'Everything you need to successfully launch your first digital product, from planning to execution to post-launch momentum.',
  },
];

// Fetch premium communities from Firestore
async function fetchPremiumCommunities(): Promise<PremiumOffer[]> {
  try {
    console.log('🔍 Fetching premium communities from Firestore...');

    const communitiesRef = collection(db, 'communities');
    const q = query(
      communitiesRef,
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('📭 No communities found, using fallback');
      return FALLBACK_OFFERS;
    }

    const offers: PremiumOffer[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Fetch creator info
      let creatorName = 'Featured Creator';
      let creatorAvatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80';

      if (data.creatorId) {
        try {
          const creatorDoc = await getDocs(
            query(collection(db, 'creators'), where('userId', '==', data.creatorId), limit(1))
          );

          if (!creatorDoc.empty) {
            const creatorData = creatorDoc.docs[0].data();
            creatorName = creatorData.displayName || creatorData.name || creatorName;
            creatorAvatarUrl = creatorData.profileImageURL || creatorData.photoURL || creatorAvatarUrl;
          }
        } catch (err) {
          console.warn('Could not fetch creator:', err);
        }
      }

      offers.push({
        id: doc.id,
        title: data.title || data.name || 'Exclusive Community',
        creatorName,
        creatorId: data.creatorId || 'unknown',
        creatorAvatarUrl,
        zapCost: data.zapCost || data.community_access_cost || 100,
        image: data.bannerImageURL || data.banner_url || data.coverImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=1000&fit=crop&q=80',
        description: data.description || data.tagline || 'Exclusive community content and access',
      });
    }

    console.log(`✅ Fetched ${offers.length} premium communities`);
    return offers.length > 0 ? offers : FALLBACK_OFFERS;

  } catch (error) {
    console.error('❌ Error fetching premium communities:', error);
    return FALLBACK_OFFERS;
  }
}

// Mock creator data for modal
const mockCreator: Creator = {
  name: 'Creator Placeholder',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
  tagline: 'Helping you grow your personal brand and build thriving communities',
};

// Convert offers to premium items for modal
const getPremiumItems = (offers: PremiumOffer[]): PremiumItem[] => {
  return offers.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description || '',
    priceInZaps: offer.zapCost,
    priceInUsd: Math.round(offer.zapCost * 0.05), // Mock conversion: 1 ZAP ≈ $0.05
  }));
};

// Convert offer to full-screen creator view data
const convertOfferToCreator = (offer: PremiumOffer): FullScreenCreator => {
  return {
    id: offer.id,
    name: offer.creatorName,
    tagline: offer.description || 'Transform your skills and unlock your potential',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
    bannerUrl: offer.image,
    zapCost: offer.zapCost,
    features: [
      'Lifetime access to all course materials',
      'Weekly live Q&A sessions with the creator',
      'Private community access for networking',
      'Downloadable resources and templates',
      'Certificate of completion',
      'Priority support from the creator',
    ],
    previewVideoUrl: undefined,
  };
};

// Premium Offer Card - Editorial luxury magazine style
function PremiumOfferCard({
  offer,
  index,
  onViewDetails,
}: {
  offer: PremiumOffer;
  index: number;
  onViewDetails: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.32, delay: index * 0.08, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex-shrink-0 w-[340px] sm:w-[380px] snap-start"
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="h-full cursor-pointer"
        onClick={onViewDetails}
      >
        <div className="relative h-full min-h-[520px] rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-shadow duration-500">
          {/* Cover Image */}
          <div className="relative h-[320px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={offer.image}
              alt={offer.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60" />

            {/* Creator name - top left, subtle */}
            <div className="absolute top-6 left-6">
              <p className="text-xs font-medium text-white/90 tracking-wide uppercase">
                {offer.creatorName}
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 flex flex-col h-[200px]">
            {/* Title - Large, confident, breathing room */}
            <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight tracking-tight line-clamp-2">
              {offer.title}
            </h3>

            {/* Spacer */}
            <div className="flex-1" />

            {/* ZAP Cost Badge - Thin outline pill with soft gold hover */}
            <div className="mb-5">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300"
                style={{
                  borderColor: isHovered ? '#D4AF37' : '#E5E7EB',
                  backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                }}
              >
                <Zap
                  className="w-4 h-4 transition-colors duration-300"
                  style={{ color: isHovered ? '#D4AF37' : '#6B7280' }}
                />
                <span
                  className="text-sm font-semibold transition-colors duration-300"
                  style={{ color: isHovered ? '#D4AF37' : '#374151' }}
                >
                  {offer.zapCost} ZAPs
                </span>
              </div>
            </div>

            {/* Ghost Button CTA */}
            <Button
              variant="ghost"
              className="w-full h-11 text-base font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50/50 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-300 group/btn"
            >
              <span className="relative">
                View Details
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gray-900 transition-all duration-300 group-hover/btn:w-full" />
              </span>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Unlock Premium Content - Editorial Luxury Section
 *
 * Design Philosophy: Apple TV+ meets MasterClass meets Web3 XP progression
 * - Elevated, calm, confident, aspirational
 * - Same visual language as "Creators Who Inspire Us"
 * - Horizontally scrollable 3-column layout
 * - White & soft off-white foundation
 * - Ultra-soft wide shadows (Apple style)
 * - Minimalist, mature, not "gamified"
 * - Radix Dialog for premium offer details
 */
export function RewardsShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<PremiumOffer | null>(null);
  const [premiumOffers, setPremiumOffers] = useState<PremiumOffer[]>(FALLBACK_OFFERS);
  const [loading, setLoading] = useState(true);

  // Fetch premium communities on mount
  useEffect(() => {
    let isMounted = true;

    async function loadCommunities() {
      try {
        const offers = await fetchPremiumCommunities();
        if (isMounted) {
          setPremiumOffers(offers);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading communities:', error);
        if (isMounted) {
          setPremiumOffers(FALLBACK_OFFERS);
          setLoading(false);
        }
      }
    }

    loadCommunities();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewDetails = (offer: PremiumOffer) => {
    setSelectedOffer(offer);
    setIsFullScreenOpen(true);
  };

  const handleUnlock = () => {
    console.log('🎉 Unlocking content:', selectedOffer?.title);
    // TODO: Implement actual unlock logic
    // - Deduct ZAPs from user balance
    // - Grant access to content
    // - Navigate to content page
  };

  const handlePreview = () => {
    console.log('👀 Opening preview for:', selectedOffer?.title);
    // TODO: Implement preview logic
  };

  return (
    <>
      <section
        id="rewards"
        className="relative py-20 sm:py-24 lg:py-28 overflow-hidden"
      >
        {/* Background - Soft, Elevated */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#FAFAFA] to-white" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Matches homepage typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            {/* Title - Matches "How It Works" section */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Unlock Premium Content
              </span>
            </h2>

            {/* Subtitle - Calm, reduced opacity for hierarchy */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 opacity-75 max-w-2xl mx-auto font-normal leading-relaxed">
              Use your ZAPs to claim courses, coaching sessions, and exclusive community access
            </p>
          </motion.div>
        </div>

        {/* Horizontally Scrollable Premium Offers */}
        <div className="relative">
          <div className="overflow-x-auto scroll-smooth scrollbar-hide px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 pb-4 max-w-7xl mx-auto">
              {premiumOffers.map((offer, index) => (
                <PremiumOfferCard
                  key={offer.id}
                  offer={offer}
                  index={index}
                  onViewDetails={() => handleViewDetails(offer)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Unlock Modal v3.0 */}
      <PremiumUnlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        creator={mockCreator}
        items={getPremiumItems(premiumOffers)}
        userZapBalance={2500}
      />

      {/* Fullscreen Creator View - Simple Portal Approach */}
      <AnimatePresence>
        {isFullScreenOpen && selectedOffer && (
          <CreatorFullScreenOverlay
            offer={selectedOffer}
            onClose={() => {
              setIsFullScreenOpen(false);
              setSelectedOffer(null);
            }}
            onUnlock={handleUnlock}
            onPreview={handlePreview}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Simple Fullscreen Overlay Component (No Radix Dialog Nesting)
// ============================================================================

interface CreatorFullScreenOverlayProps {
  offer: PremiumOffer;
  onClose: () => void;
  onUnlock: (offerId: string) => Promise<void>;
  onPreview: (offerId: string) => void;
}

function CreatorFullScreenOverlay({
  offer,
  onClose,
  onUnlock,
  onPreview,
}: CreatorFullScreenOverlayProps) {
  const userZapBalance = 2500;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleUnlock = async () => {
    try {
      const cost = offer.zapCost;
      if (userZapBalance < cost) {
        toast.error('Insufficient ZAPs', {
          description: `You need ${cost - userZapBalance} more ZAPs to unlock this creator.`,
        });
        return;
      }

      await onUnlock(offer.id);
      
      toast.success('Creator Unlocked! 🎉', {
        description: `You now have access to ${offer.creatorName}'s exclusive content.`,
      });

      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#8A63FF', '#A259FF', '#FF86C1', '#818CF8'],
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Unlock error:', err);
      toast.error('Unlock Failed', {
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  // Luxury unlock perks with icons
  const unlockPerks = [
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Premium Course Library',
      description: 'Access 12+ deep-dive masterclasses and exclusive tutorials',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Private Community',
      description: 'Focused, positive, growth-driven culture with like-minded members',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Live Coaching Calls',
      description: 'Real-time support sessions and Q&A with the creator each week',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Direct Creator Access',
      description: 'Priority messaging and personalized feedback on your work',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Exclusive Resources',
      description: 'Downloadable templates, guides, and tools to accelerate your journey',
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Early Access',
      description: 'Be the first to see new content, features, and special announcements',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-[9999] overflow-y-auto bg-[radial-gradient(circle_at_top,#ffffff_0%,#f6f4ff_55%,#ece6ff_100%)] text-gray-800"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-50 rounded-full bg-white/60 p-2.5 shadow-lg backdrop-blur-xl hover:bg-white transition-all duration-200"
        aria-label="Close"
      >
        <X className="h-5 w-5 text-gray-700" />
      </button>

      {/* Hero Section - Large Creator Profile */}
      <div className="flex flex-col items-center pt-28 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative"
        >
          <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/50">
            <img
              src={offer.image}
              alt={offer.creatorName}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl -z-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 text-4xl md:text-5xl font-semibold text-gray-900"
        >
          {offer.creatorName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-3 text-lg md:text-xl max-w-2xl text-gray-600 leading-relaxed"
        >
          {offer.title}
        </motion.p>
      </div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="max-w-3xl mx-auto px-6 text-center pb-20"
      >
        <h2 className="text-xl font-medium mb-4 text-gray-900">About</h2>
        <p className="text-base md:text-lg leading-relaxed text-gray-600">
          {offer.description ||
            'A calm, world-class creator crafting educational experiences that feel like exploring a new universe. Learn storytelling, world-building & lore that captivates billions.'}
        </p>
      </motion.div>

      {/* What You Can Unlock */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-2xl md:text-3xl font-semibold mb-12 text-center text-gray-900"
        >
          What You Can Unlock
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockPerks.map((perk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
              className="rounded-2xl p-6 border border-black/5 bg-white/60 backdrop-blur-lg shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <div className="mb-4 text-indigo-600">{perk.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{perk.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{perk.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Claim CTA Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1 }}
        className="max-w-xl mx-auto px-6 pb-24"
      >
        <div className="rounded-3xl p-8 md:p-10 bg-white/70 backdrop-blur-xl border border-black/5 shadow-2xl text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">Claim Access</h3>
          <p className="text-gray-600 mt-3 text-sm md:text-base leading-relaxed">
            Use your ZAPs to unlock exclusive access instantly and join an elite community.
          </p>

          {/* ZAP Balance Display */}
          <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-4 py-2 rounded-full">
            <Zap size={16} className="text-indigo-600" fill="currentColor" />
            <span className="text-sm text-gray-600">You have</span>
            <span className="text-base font-semibold text-indigo-600">
              {userZapBalance.toLocaleString()} ZAPs
            </span>
          </div>

          {/* Unlock Button */}
          <button
            onClick={handleUnlock}
            className="mt-8 w-full py-4 rounded-2xl text-white text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            <Zap className="h-5 w-5" fill="currentColor" />
            Unlock with {offer.zapCost.toLocaleString()} ZAPs
          </button>

          {/* Preview Link */}
          <button
            onClick={() => onPreview(offer.id)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
          >
            Preview content first
          </button>
        </div>
      </motion.div>

      {/* Footer Note */}
      <div className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <p className="text-xs text-gray-500 leading-relaxed">
          By unlocking you agree to the community rules and terms. You may revoke access from
          your account settings at any time. All transactions are processed securely.
        </p>
      </div>
    </motion.div>
  );
}
