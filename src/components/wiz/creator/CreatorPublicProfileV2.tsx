import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft } from 'lucide-react';
import { CreatorProfileService } from '@/lib/creator-profile-service';
import { useCreatorProfile, useCreatorVideos } from '@/hooks/useCreatorProfile';
import { CreatorHero } from './components-v2/CreatorHero';
import { CreatorTabs } from './components-v2/CreatorTabs';
import { RightContextPanel } from './components-v2/RightContextPanel';
import { CreatorProfileSkeleton } from './components-v2/CreatorProfileSkeleton';
import { BackToTopButton } from '@/components/ui/BackToTopButton';

// Lazy load heavy modals for better initial load performance
const TipModal = lazy(() =>
  import('./components/TipModal').then(module => ({ default: module.TipModal }))
);
const WatchPopupV5 = lazy(() =>
  import('@/components/wiz/WatchPopupV5').then(module => ({ default: module.WatchPopupV5 }))
);

// Data types for the V2 creator profile
export interface CreatorProfileV2Data {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner?: string;
  bio: string;
  level: number;
  verified: boolean;
  category: string;
  socials?: {
    website?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
  };
  stats: {
    followers: number;
  };
}

export interface CreatorVideo {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: string;
  views: string;
  xpReward: number;
  publishedAt?: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    level?: number;
    subscribers?: string;
  };
}

export interface CreatorOffer {
  id: string;
  type: 'community' | 'course' | 'coaching' | 'product';
  title: string;
  description: string;
  thumbnail?: string;
  priceModel: 'free' | 'paid' | 'zaps';
  price?: string;
  zaps?: number;
  memberCount?: number;
}

/**
 * Creator Public Profile — V2 (Premium)
 *
 * A next-level, cinematic profile page that:
 * - Features glassmorphic design on light gradient background
 * - Removes noisy stats (no tips received or engagement metrics displayed)
 * - Keeps Subscribe + Tip flows intact
 * - Does NOT modify header, top bar, or side panel
 * - Fully responsive (desktop 3-column → mobile single-column)
 * - Integrates with existing Watch Pop-Up and modals
 */
export const CreatorPublicProfileV2 = () => {
  const { creatorId, username } = useParams<{ creatorId?: string; username?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Get identifier (username or creatorId)
  const identifier = username || creatorId;

  // Fetch creator profile with React Query (cached, prefetched)
  const {
    data: creatorProfile,
    isLoading: profileLoading,
    error: profileError
  } = useCreatorProfile(identifier);

  // Fetch creator videos with React Query (cached)
  const {
    data: creatorVideos = [],
    isLoading: videosLoading
  } = useCreatorVideos(creatorProfile?.id);

  // State
  const [offers, setOffers] = useState<CreatorOffer[]>([]);
  const [upNextVideos, setUpNextVideos] = useState<CreatorVideo[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<CreatorVideo | null>(null);
  const [showWatchPopup, setShowWatchPopup] = useState(false);

  // Derived state
  const loading = profileLoading || videosLoading;

  // Transform creatorProfile to V2 format
  const creator: CreatorProfileV2Data | null = creatorProfile ? {
    id: creatorProfile.id,
    name: creatorProfile.displayName,
    handle: creatorProfile.username,
    avatar: creatorProfile.avatar,
    banner: creatorProfile.banner,
    bio: creatorProfile.bio,
    level: creatorProfile.level,
    verified: creatorProfile.verified,
    category: creatorProfile.category,
    socials: creatorProfile.socials,
    stats: {
      followers: creatorProfile.stats.followers
    }
  } : null;

  // Update "Up Next" videos when creator videos load
  useEffect(() => {
    if (creatorVideos.length > 0) {
      setUpNextVideos(creatorVideos.slice(0, 4));
    }
  }, [creatorVideos]);

  // Check if current user is following
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (user && creatorProfile) {
        const following = await CreatorProfileService.isFollowing(user.uid, creatorProfile.id);
        setIsSubscribed(following);
      }
    };
    checkFollowStatus();
  }, [user, creatorProfile]);

  // Create mock offers when profile loads
  useEffect(() => {
    if (creatorProfile) {
      setOffers([
        {
          id: '1',
          type: 'community',
          title: `${creatorProfile.displayName}'s Community`,
          description: 'Join our exclusive community for behind-the-scenes content and live discussions',
          priceModel: 'zaps',
          zaps: 50,
          memberCount: 234
        }
      ]);
    }
  }, [creatorProfile]);

  // Handle errors
  useEffect(() => {
    if (profileError) {
      toast({
        title: 'Creator Not Found',
        description: 'The requested creator profile could not be found',
        variant: 'destructive'
      });
    }
  }, [profileError, toast]);

  // Smooth scroll to top on mount/navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [identifier]);

  const loadMockData = () => {
    // Mock data for development
    const mockCreator: CreatorProfileV2Data = {
      id: creatorId || '1',
      name: 'FacelessAvatars',
      handle: '@FacelessAvatars',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faceless',
      banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=300&fit=crop',
      bio: 'Creating magical AI-powered content that inspires and transforms digital experiences.',
      level: 8,
      verified: true,
      category: 'Technology',
      stats: {
        followers: 15420
      }
    };

    setCreator(mockCreator);
    setVideos([]);
    setUpNextVideos([]);
    setOffers([
      {
        id: '1',
        type: 'community',
        title: 'Creator Community',
        description: 'Join our exclusive community',
        priceModel: 'zaps',
        zaps: 50,
        memberCount: 234
      }
    ]);
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to subscribe to creators',
        variant: 'destructive'
      });
      return;
    }

    if (!creator) return;

    try {
      setSubscribing(true);

      if (isSubscribed) {
        // Unfollow
        await CreatorProfileService.unfollowCreator(user.uid, creator.id);
        setIsSubscribed(false);

        toast({
          title: 'Unsubscribed',
          description: `You've unsubscribed from ${creator.name}`
        });
      } else {
        // Follow
        await CreatorProfileService.followCreator(user.uid, creator.id);
        setIsSubscribed(true);

        toast({
          title: 'Subscribed!',
          description: `You're now subscribed to ${creator.name}`,
        });
      }
    } catch (error) {
      console.error('❌ Error updating subscription:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleTipClick = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to tip creators',
        variant: 'destructive'
      });
      return;
    }
    setShowTipModal(true);
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: `${creator?.name} on WIZUP`,
        text: creator?.bio || '',
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Profile link copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleVideoClick = (video: CreatorVideo) => {
    setSelectedVideo(video);
    setShowWatchPopup(true);
  };

  if (loading) {
    return <CreatorProfileSkeleton />;
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl">😢</div>
          <h2 className="text-2xl font-bold text-gray-900">Creator Not Found</h2>
          <p className="text-gray-600">The creator profile you're looking for doesn't exist.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Back to Discover Button - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-6 left-6 z-50"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg hover:shadow-xl text-gray-700 hover:text-indigo-600 transition-all duration-300 group hover:border-indigo-300"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="text-sm font-semibold">Back to Discover</span>
        </button>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CreatorHero
          creator={creator}
          isSubscribed={isSubscribed}
          onSubscribe={handleSubscribe}
          onTip={handleTipClick}
          onShare={handleShare}
        />
      </motion.div>

        {/* Main Content Grid (2-column desktop, 1-column mobile) */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* Left Column: Tabs + Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CreatorTabs
                videos={creatorVideos}
                creator={creator}
                onVideoClick={handleVideoClick}
              />
            </motion.div>

            {/* Right Column: Context Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <RightContextPanel
                upNextVideos={upNextVideos}
                offers={offers}
                creator={creator}
                onVideoClick={handleVideoClick}
              />
            </motion.div>
          </div>
        </div>

        {/* Modals - Lazy Loaded */}
        <Suspense fallback={null}>
          <TipModal
            isOpen={showTipModal}
            onClose={() => setShowTipModal(false)}
            creatorId={creator.id}
            creatorName={creator.name}
            creatorAvatar={creator.avatar}
          />

          {selectedVideo && (
            <WatchPopupV5
              open={showWatchPopup}
              onClose={() => {
                setShowWatchPopup(false);
                setSelectedVideo(null);
              }}
              video={{
                id: selectedVideo.id,
                videoId: selectedVideo.videoId,
                title: selectedVideo.title,
                description: selectedVideo.description || '',
                creator: {
                  id: selectedVideo.creator.id,
                  name: selectedVideo.creator.name,
                  avatar: selectedVideo.creator.avatar,
                  subscribers: selectedVideo.creator.subscribers || '1K subscribers',
                  level: selectedVideo.creator.level || 7
                },
                creatorId: selectedVideo.creator.id,
                channelId: selectedVideo.creator.id,
                views: selectedVideo.views,
                duration: selectedVideo.duration,
                xpReward: selectedVideo.xpReward
              }}
            />
          )}
        </Suspense>

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};
