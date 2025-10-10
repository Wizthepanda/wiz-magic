import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Heart,
  Share2,
  Zap,
  Eye,
  ThumbsUp,
  Video,
  Users,
  Calendar,
  MapPin,
  Globe,
  Twitter,
  Youtube,
  Instagram,
  ExternalLink,
  Sparkles,
  Crown,
  TrendingUp,
  MessageCircle,
  Play
} from 'lucide-react';
import { TipModal } from './components/TipModal';
import { BackToTopButton } from '@/components/ui/BackToTopButton';

// Mock data for development - replace with real API calls
interface CreatorData {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  banner?: string;
  bio: string;
  level: number;
  verified: boolean;
  joinedDate: string;
  stats: {
    followers: number;
    totalZAPs: number;
    videosPublished: number;
    tipsReceived: number;
    totalViews: number;
    totalEngagement: number;
  };
  socials: {
    website?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
  };
  about: {
    description: string;
    mission?: string;
    location?: string;
    communities: string[];
  };
  videos: any[];
  isPro: boolean;
  isSubscribed: boolean;
}

// Helper function to get level badge color
const getLevelBadgeGradient = (level: number) => {
  if (level >= 10) return 'from-purple-500 via-pink-500 to-orange-500'; // Platinum
  if (level >= 7) return 'from-yellow-400 to-orange-500'; // Gold
  if (level >= 4) return 'from-gray-300 to-gray-400'; // Silver
  return 'from-orange-400 to-orange-600'; // Bronze
};

const getLevelBadgeName = (level: number) => {
  if (level >= 10) return 'Platinum Creator';
  if (level >= 7) return 'Gold Creator';
  if (level >= 4) return 'Silver Creator';
  return 'Bronze Creator';
};

export const CreatorPublicProfile = () => {
  const { creatorId } = useParams<{ creatorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Load creator data
  useEffect(() => {
    loadCreatorProfile();
  }, [creatorId]);

  const loadCreatorProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Mock data for now
      const mockCreator: CreatorData = {
        id: creatorId || '1',
        name: 'FacelessAvatars',
        handle: '@FacelessAvatars',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faceless',
        banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=300&fit=crop',
        bio: 'Creating magical AI-powered content that inspires and transforms. Join me on this journey of innovation and creativity.',
        level: 8,
        verified: true,
        joinedDate: '2023-05-15',
        stats: {
          followers: 15420,
          totalZAPs: 89250,
          videosPublished: 156,
          tipsReceived: 2450,
          totalViews: 892000,
          totalEngagement: 45300
        },
        socials: {
          website: 'https://facelessavatars.com',
          twitter: 'facelessavatars',
          youtube: '@facelessavatars',
          instagram: 'facelessavatars'
        },
        about: {
          description: 'Passionate about leveraging AI and technology to create engaging educational content. Specializing in tech tutorials, productivity hacks, and creative workflows.',
          mission: 'Empower creators worldwide with cutting-edge AI tools and knowledge',
          location: 'San Francisco, CA',
          communities: ['AI Creators Hub', 'Tech Innovators', 'Content Wizards']
        },
        videos: [],
        isPro: true,
        isSubscribed: false
      };

      setCreator(mockCreator);
      setIsSubscribed(mockCreator.isSubscribed);
    } catch (error) {
      console.error('Error loading creator profile:', error);
      toast({
        title: 'Error loading profile',
        description: 'Failed to load creator profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
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

    try {
      setSubscribing(true);
      // TODO: Implement actual subscribe logic
      await new Promise(resolve => setTimeout(resolve, 800));

      setIsSubscribed(!isSubscribed);
      toast({
        title: isSubscribed ? 'Unsubscribed' : 'Subscribed!',
        description: isSubscribed
          ? `You've unsubscribed from ${creator?.name}`
          : `You're now subscribed to ${creator?.name}`,
      });
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubscribing(false);
    }
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

  if (loading || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative">
        {/* Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {creator.banner ? (
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              src={creator.banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`w-full h-full bg-gradient-to-br ${getLevelBadgeGradient(creator.level)}`}
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </motion.button>

          {/* Share button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleShare}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-all"
          >
            <Share2 className="w-5 h-5 text-gray-800" />
          </motion.button>
        </div>

        {/* Profile Info Card */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-20 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/50"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback className={`text-3xl font-bold text-white bg-gradient-to-br ${getLevelBadgeGradient(creator.level)}`}>
                    {creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Level badge */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${getLevelBadgeGradient(creator.level)} shadow-lg flex items-center gap-1`}
                >
                  <Crown className="w-3 h-3 text-white" />
                  <span className="text-xs font-bold text-white">Lv.{creator.level}</span>
                </motion.div>
              </motion.div>

              {/* Name and Bio */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{creator.name}</h1>
                    {creator.verified && (
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-sm font-bold">✓</span>
                      </motion.div>
                    )}
                    <Badge className={`bg-gradient-to-r ${getLevelBadgeGradient(creator.level)} text-white border-0`}>
                      {getLevelBadgeName(creator.level)}
                    </Badge>
                  </div>
                  <p className="text-gray-600">{creator.handle}</p>
                </div>

                <p className="text-gray-700 leading-relaxed">{creator.bio}</p>

                {/* Quick stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{creator.stats.followers.toLocaleString()}</span> followers
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(creator.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                  {creator.about.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{creator.about.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  size="lg"
                  className={cn(
                    "flex-1 sm:flex-none font-semibold transition-all duration-300",
                    isSubscribed
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl"
                  )}
                >
                  {subscribing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      {isSubscribed ? <UserCheck className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowTipModal(true)}
                  size="lg"
                  variant="outline"
                  className="flex-1 sm:flex-none border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Tip Creator
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Creator Metrics Bar */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total ZAPs', value: creator.stats.totalZAPs.toLocaleString(), icon: Zap, gradient: 'from-yellow-400 to-orange-500' },
            { label: 'Videos', value: creator.stats.videosPublished.toLocaleString(), icon: Video, gradient: 'from-blue-500 to-purple-600' },
            { label: 'Engagement', value: creator.stats.totalEngagement.toLocaleString(), icon: MessageCircle, gradient: 'from-pink-500 to-rose-500' },
            { label: 'Tips Received', value: `$${creator.stats.tipsReceived.toLocaleString()}`, icon: Heart, gradient: 'from-green-500 to-emerald-600' }
          ].map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

                  <CardContent className="relative p-6">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-sm font-medium text-gray-600">{metric.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8 pb-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Videos Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Video className="w-6 h-6 text-purple-500" />
                Content
              </h2>

              {/* Empty state */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"
                >
                  <Play className="w-10 h-10 text-purple-500" />
                </motion.div>
                <p className="text-gray-600 mb-2">No videos available yet</p>
                <p className="text-sm text-gray-500">Check back soon for amazing content!</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - About */}
          <div className="space-y-6">
            {/* About Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    About
                  </h3>

                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{creator.about.description}</p>

                    {creator.about.mission && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                            <span className="font-semibold text-gray-900">Mission</span>
                          </div>
                          <p className="text-gray-700">{creator.about.mission}</p>
                        </div>
                      </>
                    )}

                    {/* Social Links */}
                    {Object.keys(creator.socials).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          {creator.socials.website && (
                            <a
                              href={creator.socials.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                              <span className="text-sm">{creator.socials.website.replace('https://', '')}</span>
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </a>
                          )}
                          {creator.socials.youtube && (
                            <a
                              href={`https://youtube.com/${creator.socials.youtube}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
                            >
                              <Youtube className="w-4 h-4" />
                              <span className="text-sm">{creator.socials.youtube}</span>
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </a>
                          )}
                          {creator.socials.twitter && (
                            <a
                              href={`https://twitter.com/${creator.socials.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                            >
                              <Twitter className="w-4 h-4" />
                              <span className="text-sm">@{creator.socials.twitter}</span>
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </a>
                          )}
                          {creator.socials.instagram && (
                            <a
                              href={`https://instagram.com/${creator.socials.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
                            >
                              <Instagram className="w-4 h-4" />
                              <span className="text-sm">@{creator.socials.instagram}</span>
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </a>
                          )}
                        </div>
                      </>
                    )}

                    {/* Communities */}
                    {creator.about.communities.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="font-semibold text-gray-900">Communities</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {creator.about.communities.map((community, index) => (
                              <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                {community}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={creator.id}
        creatorName={creator.name}
        creatorAvatar={creator.avatar}
      />

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};
