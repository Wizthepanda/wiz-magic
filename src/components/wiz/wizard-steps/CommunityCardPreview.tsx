import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Star,
  Zap,
  Globe,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Crown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCommunityCreateStore } from '@/store/communityCreateStore';
import { useAuth } from '@/hooks/useAuth';

interface CommunityCardPreviewProps {
  currentStep: number;
}

const placeholderBanner = {
  type: 'image' as const,
  url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop',
  thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop'
};

export const CommunityCardPreview: React.FC<CommunityCardPreviewProps> = ({ currentStep }) => {
  const store = useCommunityCreateStore();
  const { user } = useAuth();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [zapPulse, setZapPulse] = useState(false);

  const banners = store.coverMedia.length > 0 ? store.coverMedia : [placeholderBanner];
  const currentBanner = banners[currentBannerIndex];

  // Trigger ZAP pulse animation when title or tagline changes
  useEffect(() => {
    if (store.title || store.tagline) {
      setZapPulse(true);
      const timeout = setTimeout(() => setZapPulse(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [store.title, store.tagline]);

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const getVisibilityIcon = () => {
    switch (store.visibility) {
      case 'private':
        return <Lock className="w-3.5 h-3.5" />;
      case 'token-gated':
        return <Eye className="w-3.5 h-3.5" />;
      default:
        return <Globe className="w-3.5 h-3.5" />;
    }
  };

  const getPricingDisplay = () => {
    switch (store.pricingModel) {
      case 'free':
        return { text: 'FREE', icon: <Sparkles className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-100' };
      case 'free-zaps':
        return { text: 'Free + ZAPs Reward', icon: <Zap className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'usd':
        return { text: `$${store.usdAmount}`, icon: null, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'zaps':
        return { text: `${store.zapsRequired} ZAPs`, icon: <Zap className="w-4 h-4" />, color: 'text-violet-600', bg: 'bg-violet-100' };
      case 'zaps-usd':
        return { text: `${store.zapsRequired} ZAPs + $${store.usdAmount}`, icon: <Zap className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'crypto':
        return { text: store.cryptoAmount ? `${store.cryptoAmount} Crypto` : 'Crypto', icon: <Crown className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'waitlist':
        return { text: 'Join Waitlist', icon: null, color: 'text-gray-600', bg: 'bg-gray-100' };
      default:
        return { text: 'FREE', icon: <Sparkles className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const pricing = getPricingDisplay();

  return (
    <div className="space-y-4">
      {/* Preview Label */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-600">Live Preview</span>
        </div>
        <Badge variant="outline" className="text-xs">
          Step {currentStep}/4
        </Badge>
      </div>

      {/* Main Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* ZAP Pulse Effect */}
        <AnimatePresence>
          {zapPulse && (
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-xl -z-10"
            />
          )}
        </AnimatePresence>

        <Card className="overflow-hidden border-2 border-gray-200/50 shadow-2xl rounded-2xl hover:shadow-purple-200/50 transition-all duration-500">
          <CardContent className="p-0">
            {/* Banner */}
            <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {currentBanner?.url ? (
                    <img
                      src={currentBanner.url}
                      alt="Community banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-100 via-purple-100 to-pink-100 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Add banner</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Banner Controls */}
              {banners.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 h-7 w-7 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={prevBanner}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 h-7 w-7 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={nextBanner}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>

                  {/* Dots */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-200",
                          index === currentBannerIndex
                            ? "bg-white w-4"
                            : "bg-white/50 hover:bg-white/80"
                        )}
                        onClick={() => setCurrentBannerIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Visibility Badge */}
              <div className="absolute top-2 left-2 z-20">
                <Badge variant="secondary" className="bg-black/30 text-white backdrop-blur-sm border-0 text-xs">
                  {getVisibilityIcon()}
                  <span className="ml-1 capitalize">{store.visibility || 'Public'}</span>
                </Badge>
              </div>

              {/* Profile Icon Overlay */}
              {store.profileIcon && (
                <div className="absolute -bottom-8 left-4 z-20">
                  <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                    <img
                      src={store.profileIcon}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className={cn("p-5 space-y-4", store.profileIcon && "pt-10")}>
              {/* Creator Info */}
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                    {user?.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-xs">{user?.displayName || 'Your Name'}</p>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <motion.h3
                  key={store.title}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="font-bold text-base leading-tight mb-1 line-clamp-2"
                >
                  {store.title || 'Your Community Title'}
                </motion.h3>
                {store.tagline && (
                  <motion.p
                    key={store.tagline}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-600 text-xs line-clamp-1"
                  >
                    {store.tagline}
                  </motion.p>
                )}
              </div>

              {/* Category & Tags */}
              <div className="flex flex-wrap gap-1.5">
                {store.category && (
                  <Badge variant="outline" className="text-xs">
                    {store.category.toUpperCase()}
                  </Badge>
                )}
                {store.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {store.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{store.tags.length - 2}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                {store.description || 'Add a compelling description to attract members...'}
              </p>

              {/* ZAP Reward Tiers Preview */}
              {store.zapRewardTiers.length > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">
                    {store.zapRewardTiers.length} Reward{store.zapRewardTiers.length > 1 ? 's' : ''} Available
                  </span>
                </div>
              )}

              {/* Stats Row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>0</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5" />
                    <span>New</span>
                  </div>
                </div>

                {/* Pricing Badge */}
                <div className={cn("px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1", pricing.bg, pricing.color)}>
                  {pricing.icon}
                  <span>{pricing.text}</span>
                </div>
              </div>

              {/* Join Button */}
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-violet-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                disabled
              >
                {store.pricingModel === 'waitlist'
                  ? 'Join Waitlist'
                  : pricing.text === 'FREE'
                  ? 'Join Free'
                  : `Join for ${pricing.text}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-xl border border-gray-200/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500">Completion</p>
              <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Math.round((currentStep / 4) * 100)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Step</p>
              <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentStep}/4
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-purple-900">Pro Tip</p>
              <p className="text-xs text-purple-700 leading-relaxed">
                {currentStep === 1 && "A great title and description helps members find your community!"}
                {currentStep === 2 && "Link courses and set reward tiers to engage your members."}
                {currentStep === 3 && "Free trials can help grow your community faster!"}
                {currentStep === 4 && "Preview everything before publishing to ensure it's perfect!"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
