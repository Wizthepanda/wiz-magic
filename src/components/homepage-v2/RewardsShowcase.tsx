import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Check, Users, Video, Star, Sparkles, Lock, MessageCircle, Calendar, Flame, Play } from 'lucide-react';
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

function HeroPremiumCard({
  offer,
  onViewDetails,
}: {
  offer: PremiumOffer;
  onViewDetails: () => void;
}) {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[32px] bg-slate-900 text-white shadow-[0_25px_80px_rgba(0,0,0,0.2)]"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setSpotlight({ x, y });
      }}
    >
      <div className="absolute inset-0">
        <img
          src={offer.image}
          alt={offer.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-black/70" />
        <div
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-70"
          style={{
            background: `radial-gradient(480px at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.12), transparent 55%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/25 via-transparent to-indigo-500/25 mix-blend-screen" />
      </div>

      <div className="relative p-8 sm:p-10 lg:p-12 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/40">
            <img src={offer.creatorAvatarUrl} alt={offer.creatorName} className="h-full w-full object-cover" />
            <span className="absolute -inset-[2px] rounded-full bg-gradient-to-tr from-purple-500/30 to-indigo-500/30 blur-lg" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.22em] text-white/70">Premium</p>
            <p className="text-lg font-semibold text-white">{offer.creatorName}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold leading-tight">
            {offer.title}
          </h3>
          <p className="text-base sm:text-lg text-white/80 max-w-3xl">
            {offer.description || 'Discover a premium space crafted by the creator with cinematic sessions and hands-on mentorship.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="button"
            onClick={onViewDetails}
            className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-base font-semibold shadow-[0_15px_50px_rgba(129,140,248,0.45)] hover:scale-[1.01] transition-transform"
          >
            Join Community
          </Button>
          <div
            className="relative inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-lg"
            style={{ animation: 'pulse 8s ease-in-out infinite' }}
          >
            <span className="absolute inset-0 rounded-full blur-2xl bg-purple-400/30" />
            <Zap className="h-4 w-4" />
            <span>{offer.zapCost} ZAPs</span>
            <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
          </div>
          <div className="hidden sm:inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-lg">
            <Sparkles className="h-4 w-4" />
            <span>Includes live workshops + premium drops</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function FeaturedPremiumCard({
  offer,
  index,
  onViewDetails,
}: {
  offer: PremiumOffer;
  index: number;
  onViewDetails: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-white/80 shadow-[0_15px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl border border-white"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={offer.image}
          alt={offer.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Featured Creator
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/40 transition-transform duration-200 group-hover:scale-105">
              <img src={offer.creatorAvatarUrl} alt={offer.creatorName} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-white/70">Creator</p>
              <p className="text-sm font-semibold">{offer.creatorName}</p>
            </div>
          </div>
          <div className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold">
            {offer.zapCost} ZAPs
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{offer.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-2">{offer.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-100"
            style={{ animation: 'pulse 8s ease-in-out infinite' }}
          >
            <Zap className="h-4 w-4" />
            {offer.zapCost} ZAPs
          </div>
          <button
            type="button"
            onClick={onViewDetails}
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            View Community →
          </button>
        </div>
      </div>
    </motion.article>
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

  const handleUnlock = async (offerId: string) => {
    console.log('🎉 Unlocking content:', selectedOffer?.title);
    // TODO: Implement actual unlock logic
    // - Deduct ZAPs from user balance
    // - Grant access to content
    // - Navigate to content page
  };

  const handlePreview = (offerId: string) => {
    console.log('👀 Opening preview for:', selectedOffer?.title);
    // TODO: Implement preview logic
  };

  const heroOffer = premiumOffers[0];
  const featuredOffers = premiumOffers.slice(1, 5);

  return (
    <>
      <section
        id="rewards"
        className="relative py-20 sm:py-24 lg:py-28 overflow-hidden"
      >
        {/* Background - Soft, Elevated */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#FAFAFA] to-white" />
        <div className="absolute inset-x-0 top-12 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.14),transparent_48%)]" />

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
                Unlock Premium Communities
              </span>
            </h2>

            {/* Subtitle - Calm, reduced opacity for hierarchy */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 opacity-75 max-w-3xl mx-auto font-normal leading-relaxed">
              Discover creator-led communities where you can deepen your skills, connect with others, and unlock exclusive experiences — using the ZAPs you earn simply by showing up.
            </p>
          </motion.div>
        </div>

        {/* Modern Grid Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {heroOffer && (
              <div className="lg:col-span-7">
                <HeroPremiumCard offer={heroOffer} onViewDetails={() => handleViewDetails(heroOffer)} />
              </div>
            )}

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
              {featuredOffers.map((offer, index) => (
                <FeaturedPremiumCard
                  key={offer.id}
                  offer={offer}
                  index={index}
                  onViewDetails={() => handleViewDetails(offer)}
                />
              ))}
            </div>
          </div>

          {/* Micro Callouts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mt-10 grid gap-4 md:grid-cols-3 text-sm font-semibold text-slate-800"
          >
            {[
              { icon: '🔥', text: 'Top Communities This Week' },
              { icon: '🎥', text: '10,000+ hours of premium creator content' },
              { icon: '⚡', text: 'Earn ZAPs as you learn — no credit card needed' },
            ].map((item, i) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/80 px-4 py-3 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
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
      title: 'Premium Video Lessons',
      description: 'Cinematic lessons produced by the creator.',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Member-Only Conversations',
      description: 'Threaded discussions with no noise.',
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Live Workshops',
      description: 'Weekly sessions and Q&As.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Progression System',
      description: 'Earn XP, unlock ranks, and gain access to advanced rooms.',
    },
  ];

  const members = [
    { name: 'Aria', tag: 'Active now', color: 'from-indigo-500 via-purple-500 to-fuchsia-500' },
    { name: 'Milo', tag: 'Top learner', color: 'from-emerald-400 via-cyan-400 to-blue-500' },
    { name: 'Sia', tag: 'Level 12', color: 'from-amber-400 via-orange-400 to-rose-500' },
    { name: 'Nova', tag: 'Mentor', color: 'from-sky-400 via-blue-500 to-indigo-600' },
  ];

  const events = [
    { name: 'Creator AMA + Deep Dive', status: 'Live now', time: 'Happening now' },
    { name: 'Cinematic Editing Masterclass', status: 'Upcoming', time: 'Starts in 3h' },
    { name: 'Community Challenge Kickoff', status: 'Upcoming', time: 'Tomorrow 10am' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1.03 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 110, damping: 18 }}
      className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/50 backdrop-blur-2xl text-gray-800"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed right-6 top-6 z-50 rounded-full bg-white/70 p-2.5 shadow-xl backdrop-blur-xl hover:bg-white transition-all duration-200"
        aria-label="Close"
      >
        <X className="h-5 w-5 text-gray-700" />
      </button>

      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[28px] shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
          <img src={offer.image} alt={offer.title} className="h-[360px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-purple-400/10 to-indigo-300/15 mix-blend-screen" />

          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 lg:p-12 gap-4 text-white">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative inline-flex items-center gap-3 rounded-full bg-white/15 px-3 py-2 backdrop-blur-lg border border-white/20 hover:scale-[1.02] transition-transform">
                <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/40">
                  <img src={offer.creatorAvatarUrl} alt={offer.creatorName} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">Creator</span>
                  <span className="text-sm font-semibold">{offer.creatorName}</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold border border-white/20 backdrop-blur-lg">
                <Zap className="h-4 w-4" />
                {offer.zapCost} ZAPs
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold border border-white/20 backdrop-blur-lg">
                <Calendar className="h-4 w-4" />
                Weekly drops
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              {offer.title}
            </h1>
            <p className="max-w-3xl text-base sm:text-lg text-white/80">
              {offer.description || 'A premium creator-led space with live sessions, cinematic courses, and a progression system built for people who want to level up together.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: 'ZAP Cost', value: `${offer.zapCost} ZAPs`, icon: <Zap className="h-4 w-4" /> },
                { label: 'Members', value: '12,480', icon: <Users className="h-4 w-4" /> },
                { label: 'Upcoming events', value: '5 next', icon: <Calendar className="h-4 w-4" /> },
                { label: 'Avg rating', value: '4.9', icon: <Star className="h-4 w-4" /> },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-semibold backdrop-blur-lg border border-white/15"
                >
                  {stat.icon}
                  <span className="text-white/70">{stat.label}</span>
                  <span className="text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About + Modules */}
        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-slate-100/80 shadow-[0_20px_70px_rgba(15,23,42,0.08)] p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-3">What You Get Inside</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              A premium creator-led space where you can:
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700">
              {[
                'Join live sessions',
                'Access premium courses',
                'Participate in weekly discussions',
                'Unlock creator challenges',
                'Level up your profile with XP',
                'Connect with learners just like you',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            className="lg:col-span-3 grid gap-4 sm:grid-cols-2"
          >
            {unlockPerks.map((perk, i) => (
              <motion.div
                key={perk.title}
                whileHover={{ y: -3, scale: 1.01 }}
                className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-[0_10px_45px_rgba(15,23,42,0.06)] backdrop-blur"
                transition={{ duration: 0.2 }}
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                  {perk.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-900">{perk.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{perk.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Members + Events */}
        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="lg:col-span-3 rounded-2xl bg-white/80 p-6 sm:p-8 border border-slate-100 shadow-[0_15px_55px_rgba(15,23,42,0.07)] backdrop-blur"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Members</h3>
              <span className="text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 px-3 py-1">
                Live now
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {members.map((member) => (
                <div
                  key={member.name}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/70 p-3 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${member.color} blur-md opacity-80 transition duration-300 group-hover:scale-110 group-hover:opacity-100`} />
                    <div className={`p-[2px] rounded-full bg-gradient-to-tr ${member.color}`}>
                      <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-slate-800">
                        {member.name[0]}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                  <p className="text-[11px] font-medium text-indigo-700 bg-indigo-50 rounded-full px-2 py-1">
                    {member.tag}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24 }}
            className="lg:col-span-2 rounded-2xl border border-slate-100 bg-slate-900 text-white p-6 sm:p-8 shadow-[0_18px_65px_rgba(0,0,0,0.25)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/70">Upcoming Events</p>
                <h3 className="text-xl font-semibold">Stay in sync</h3>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold border border-white/15">
                Add to calendar
              </div>
            </div>

            <div className="space-y-3">
              {events.map((event, i) => (
                <motion.div
                  key={event.name}
                  whileHover={{ y: -2 }}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 border border-white/10"
                  transition={{ duration: 0.15 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                      {event.status === 'Live now' ? <Flame className="h-5 w-5 text-amber-300" /> : <Calendar className="h-5 w-5 text-white/80" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{event.name}</p>
                      <p className="text-xs text-white/70">{event.time}</p>
                    </div>
                  </div>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${event.status === 'Live now' ? 'bg-emerald-400/20 text-emerald-100 border-emerald-200/40' : 'bg-white/10 text-white border-white/20'}`}>
                    {event.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA Footer */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          className="rounded-[24px] border border-slate-100 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white p-8 sm:p-10 shadow-[0_25px_80px_rgba(129,140,248,0.45)]"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-white/80">Premium Access</p>
              <h3 className="text-2xl sm:text-3xl font-semibold">Ready to Join This Community?</h3>
              <p className="text-white/85 max-w-2xl">
                Use your earned ZAPs to unlock immediate access — no credit card required.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleUnlock}
                className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-3 text-sm font-semibold shadow-lg hover:scale-[1.02] transition-transform"
              >
                <Zap className="h-4 w-4 text-indigo-600" />
                Join Now
              </button>
              <button
                onClick={() => onPreview(offer.id)}
                className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <Play className="h-4 w-4" />
                Preview Community
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
