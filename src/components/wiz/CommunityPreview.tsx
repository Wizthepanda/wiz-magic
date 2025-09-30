import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Users,
  Star,
  Trophy,
  Zap,
  Crown,
  CheckCircle,
  Clock,
  Globe,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Video,
  AlertCircle,
  Lightbulb,
  Target,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { CreateCommunityForm } from '@/lib/schemas/community';
import { useAuth } from '@/hooks/useAuth';

interface CommunityPreviewProps {
  data: Partial<CreateCommunityForm>;
  currentStep: number;
  isValid: boolean;
  className?: string;
}

// Placeholder data for preview
const placeholderBanners = [
  { type: 'image', url: '/api/placeholder/400/200', thumbnail: '/api/placeholder/400/200' },
  { type: 'image', url: '/api/placeholder/400/200', thumbnail: '/api/placeholder/400/200' },
  { type: 'youtube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: '/api/placeholder/400/200' }
];

const CommunityPreview: React.FC<CommunityPreviewProps> = ({
  data,
  currentStep,
  isValid,
  className
}) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { user } = useAuth();

  const banners = data.coverMedia && data.coverMedia.length > 0 ? data.coverMedia : placeholderBanners;
  const currentBanner = banners[currentBannerIndex];

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const getPrivacyIcon = () => {
    switch (data.privacy) {
      case 'private':
        return <Lock className="w-4 h-4" />;
      case 'invite':
        return <Eye className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getPricingDisplay = () => {
    const hasZaps = (data.zapsRequired || 0) > 0;
    const hasUsd = (data.usdCoPay || 0) > 0;

    if (!hasZaps && !hasUsd) {
      return { text: 'FREE', color: 'text-green-600', bg: 'bg-green-100' };
    }

    if (hasZaps && hasUsd) {
      return {
        text: `${data.zapsRequired} ZAPs + $${data.usdCoPay}`,
        color: 'text-purple-600',
        bg: 'bg-purple-100'
      };
    }

    if (hasZaps) {
      return {
        text: `${data.zapsRequired} ZAPs`,
        color: 'text-violet-600',
        bg: 'bg-violet-100'
      };
    }

    return {
      text: `$${data.usdCoPay}`,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    };
  };

  const pricing = getPricingDisplay();

  const completionSteps = [
    { step: 1, label: 'Details', required: ['title', 'category', 'shortDescription'] },
    { step: 2, label: 'Content', required: [] }, // Optional step
    { step: 3, label: 'Monetize', required: [] }, // Pricing is optional
    { step: 4, label: 'Publish', required: [] }
  ];

  const getStepCompletion = (step: number) => {
    const stepData = completionSteps.find(s => s.step === step);
    if (!stepData) return false;

    return stepData.required.every(field => {
      const value = data[field as keyof CreateCommunityForm];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const completedSteps = completionSteps.filter(step => getStepCompletion(step.step)).length;
  const progressPercentage = (completedSteps / completionSteps.length) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Live Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardContent className="p-0">
            {/* Banner Carousel */}
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {currentBanner?.type === 'youtube' ? (
                    <div className="relative w-full h-full">
                      {currentBanner.thumbnail ? (
                        <>
                          <img
                            src={currentBanner.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-purple-500/20" />
                          <div className="text-center text-white z-10">
                            <Video className="w-12 h-12 mx-auto mb-2 opacity-80" />
                            <p className="text-sm font-medium">Video</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {currentBanner?.url ? (
                        <img
                          src={currentBanner.url}
                          alt="Community banner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Add cover image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Carousel Controls */}
              {banners.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20 h-8 w-8 p-0"
                    onClick={prevBanner}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 h-8 w-8 p-0"
                    onClick={nextBanner}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {/* Dots indicator */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-200",
                          index === currentBannerIndex
                            ? "bg-white shadow-lg"
                            : "bg-white/50"
                        )}
                        onClick={() => setCurrentBannerIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Privacy Badge */}
              <div className="absolute top-3 left-3 z-20">
                <Badge variant="secondary" className="bg-black/20 text-white backdrop-blur-sm border-0">
                  {getPrivacyIcon()}
                  <span className="ml-1 capitalize">{data.privacy || 'Public'}</span>
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Creator Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{user?.displayName || 'Your Name'}</p>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">
                  {data.title || 'Your Community Title'}
                </h3>
                {data.tagline && (
                  <p className="text-gray-600 text-sm">{data.tagline}</p>
                )}
              </div>

              {/* Category & Tags */}
              <div className="flex flex-wrap gap-2">
                {data.category && (
                  <Badge variant="outline" className="text-xs">
                    {data.category.toUpperCase()}
                  </Badge>
                )}
                {data.tags?.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(data.tags?.length || 0) > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{(data.tags?.length || 0) - 3} more
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {data.shortDescription || 'Add a compelling description to attract members...'}
              </p>

              {/* Stats Row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>0 members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>New</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className={cn("px-3 py-1 rounded-full text-sm font-semibold", pricing.bg, pricing.color)}>
                  {pricing.text}
                </div>
              </div>

              {/* Join Button Preview */}
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold"
                disabled
              >
                {pricing.text === 'FREE' ? 'Join Free' : `Join for ${pricing.text}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress & Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Completion Progress</h4>
                <span className="text-sm text-gray-500">{completedSteps}/4 steps</span>
              </div>

              <Progress value={progressPercentage} className="h-2" />

              <div className="space-y-2">
                {completionSteps.map((step) => (
                  <div
                    key={step.step}
                    className={cn(
                      "flex items-center space-x-3 text-sm",
                      currentStep === step.step ? "text-violet-600" : "text-gray-500",
                      getStepCompletion(step.step) && "text-green-600"
                    )}
                  >
                    {getStepCompletion(step.step) ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : currentStep === step.step ? (
                      <div className="w-4 h-4 rounded-full bg-violet-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={getStepCompletion(step.step) ? "line-through" : ""}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h4 className="font-semibold text-sm">Quick Tips</h4>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                {currentStep === 1 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>Choose a clear, memorable title that explains your community's purpose</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>Add high-quality cover images to make your community stand out</p>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>Connect your YouTube channel to auto-import your best content</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>Upload valuable resources to give members immediate value</p>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>Free communities grow faster, but paid ones have more engaged members</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>ZAPS + co-pay gives members flexibility in how they join</p>
                    </div>
                  </>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>Preview your community before publishing to ensure everything looks perfect</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                      <p>Published communities appear in Discovery within 5 minutes</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Status */}
      {currentStep > 1 && !isValid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm font-medium">Complete required fields to continue</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CommunityPreview;