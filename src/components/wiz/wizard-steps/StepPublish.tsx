import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Check,
  AlertCircle,
  Sparkles,
  Users,
  Zap,
  DollarSign,
  BookOpen,
  ArrowLeft,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useCommunityCreateStore } from '@/store/communityCreateStore';
import { useCreateCommunity, useUpdateCommunity } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface StepPublishProps {
  onBack: () => void;
}

export const StepPublish: React.FC<StepPublishProps> = ({ onBack }) => {
  const store = useCommunityCreateStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createCommunity = useCreateCommunity();
  const updateCommunity = useUpdateCommunity();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Validation checks
  const validationChecks = [
    {
      label: 'Community details',
      valid: !!(store.title && store.category && store.description),
      required: true
    },
    {
      label: 'Profile icon',
      valid: !!store.profileIcon,
      required: false
    },
    {
      label: 'Cover media',
      valid: store.coverMedia.length > 0,
      required: false
    },
    {
      label: 'Pricing configured',
      valid: store.pricingModel === 'free' ||
             (store.pricingModel === 'usd' && store.usdAmount > 0) ||
             (store.pricingModel === 'zaps' && store.zapsRequired > 0) ||
             (store.pricingModel === 'zaps-usd' && store.zapsRequired > 0 && store.usdAmount > 0) ||
             (store.pricingModel === 'crypto' && store.cryptoAmount) ||
             store.pricingModel === 'free-zaps' ||
             store.pricingModel === 'waitlist',
      required: true
    }
  ];

  const requiredChecks = validationChecks.filter(c => c.required);
  const allRequiredValid = requiredChecks.every(c => c.valid);
  const completedChecks = validationChecks.filter(c => c.valid).length;
  const totalChecks = validationChecks.length;

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // ZAP-themed confetti (purple and pink)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#a855f7', '#ec4899', '#8b5cf6', '#f472b6']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#a855f7', '#ec4899', '#8b5cf6', '#f472b6']
      });
    }, 250);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // Sanitize profileIcon - strip base64 data before saving
      let profileIconUrl = store.profileIcon || '';
      if (profileIconUrl && profileIconUrl.startsWith('data:')) {
        console.warn('⚠️ Stripping base64 profileIcon from draft');
        profileIconUrl = ''; // Don't save base64 data
      }

      // Convert store data to community format
      const communityData = {
        title: store.title,
        tagline: store.tagline,
        category: store.category,
        profileIcon: profileIconUrl,
        coverMedia: store.coverMedia,
        shortDescription: store.description,
        longDescription: store.longDescription || '',
        tags: store.tags,
        privacy: store.visibility === 'public' ? 'public' : store.visibility === 'private' ? 'private' : 'invite',

        // Content
        linkedCourseId: store.linkedCourses[0]?.id,
        linkedCourseName: store.linkedCourses[0]?.name,

        // Monetization
        pricingModel: store.pricingModel,
        zapsRequired: store.zapsRequired,
        usdCoPay: store.usdAmount,
        cryptoTypes: store.cryptoTypes,
        cryptoAmount: store.cryptoAmount,

        // Access
        waitlistEnabled: store.pricingModel === 'waitlist',

        // Status
        status: 'draft' as const,

        // Creator
        creatorId: user?.uid,
        creatorName: user?.displayName || '',
        creatorPhoto: user?.photoURL || ''
      };

      await createCommunity.mutateAsync(communityData as any);
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!allRequiredValid) {
      toast.error('Please complete all required fields before publishing');
      return;
    }

    setIsPublishing(true);

    try {
      // Sanitize profileIcon - prevent base64 data from being saved
      let profileIconUrl = store.profileIcon || '';
      if (profileIconUrl && profileIconUrl.startsWith('data:')) {
        console.error('❌ Cannot publish: profileIcon contains base64 data');
        toast.error('Please re-upload your profile icon before publishing');
        setIsPublishing(false);
        return;
      }

      // Convert store data to community format
      const communityData = {
        title: store.title,
        tagline: store.tagline,
        category: store.category,
        profileIcon: profileIconUrl,
        coverMedia: store.coverMedia,
        shortDescription: store.description,
        longDescription: store.longDescription || '',
        tags: store.tags,
        privacy: store.visibility === 'public' ? 'public' : store.visibility === 'private' ? 'private' : 'invite',

        // Content
        linkedCourseId: store.linkedCourses[0]?.id,
        linkedCourseName: store.linkedCourses[0]?.name,

        // Monetization
        pricingModel: store.pricingModel,
        zapsRequired: store.zapsRequired,
        usdCoPay: store.usdAmount,
        cryptoTypes: store.cryptoTypes,
        cryptoAmount: store.cryptoAmount,

        // Reward tiers (custom data)
        zapRewardTiers: store.zapRewardTiers,

        // Access
        waitlistEnabled: store.pricingModel === 'waitlist',
        accessWindow: 'lifetime',

        // Free trial
        freeTrialEnabled: store.freeTrialEnabled,
        freeTrialDays: store.freeTrialDays,

        // Status
        status: 'published' as const,
        publishDate: new Date(),

        // Creator
        creatorId: user?.uid,
        creatorName: user?.displayName || '',
        creatorPhoto: user?.photoURL || '',

        // Member count
        memberCount: 0
      };

      let resultId: string | undefined;

      // Check if updating existing draft or creating new
      if (store.communityId) {
        // Update existing community
        await updateCommunity.mutateAsync({
          id: store.communityId,
          data: communityData
        });
        resultId = store.communityId;
        console.log('✏️ Updated existing community:', store.communityId);
      } else {
        // Create new community
        const result = await createCommunity.mutateAsync(communityData as any);
        resultId = result?.id;
        console.log('✨ Created new community:', resultId);
      }

      // Trigger confetti
      triggerConfetti();

      // Show success message
      toast.success(store.communityId ? 'Community updated successfully! 🎉' : 'Community published successfully! 🎉');

      // Wait a bit for confetti then redirect
      setTimeout(() => {
        // Reset store
        store.resetStore();

        // Navigate to the community
        if (resultId) {
          navigate(`/community/${resultId}`);
        } else {
          onBack();
        }
      }, 2000);

    } catch (error) {
      console.error('Error publishing community:', error);
      toast.error('Failed to publish community. Please try again.');
      setIsPublishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto"
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Ready to Launch!
        </h2>
        <p className="text-gray-600">
          Review your community before publishing to the world
        </p>
      </div>

      {/* Validation Checklist */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Pre-Launch Checklist</h3>
            <Badge variant={allRequiredValid ? 'default' : 'secondary'} className="bg-gradient-to-r from-purple-500 to-pink-500">
              {completedChecks}/{totalChecks} Complete
            </Badge>
          </div>

          <div className="space-y-3">
            {validationChecks.map((check, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                  check.valid
                    ? "border-green-200 bg-green-50"
                    : check.required
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    check.valid
                      ? "bg-green-500"
                      : check.required
                      ? "bg-red-500"
                      : "bg-gray-400"
                  )}>
                    {check.valid ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={cn(
                    "font-medium text-sm",
                    check.valid ? "text-green-900" : "text-gray-700"
                  )}>
                    {check.label}
                  </span>
                </div>
                {check.required && !check.valid && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Preview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Details Summary */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center space-x-2 text-purple-700">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-semibold">Details</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Title:</span> {store.title || 'Not set'}</p>
              <p><span className="font-medium">Category:</span> {store.category || 'Not set'}</p>
              <p><span className="font-medium">Tags:</span> {store.tags.length} tag{store.tags.length !== 1 ? 's' : ''}</p>
              <p><span className="font-medium">Visibility:</span> {store.visibility}</p>
            </div>
          </CardContent>
        </Card>

        {/* Content Summary */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center space-x-2 text-blue-700">
              <BookOpen className="w-5 h-5" />
              <h4 className="font-semibold">Content</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Courses:</span> {store.linkedCourses.length} linked</p>
              <p><span className="font-medium">ZAP Rewards:</span> {store.zapRewardTiers.length} tier{store.zapRewardTiers.length !== 1 ? 's' : ''}</p>
            </div>
          </CardContent>
        </Card>

        {/* Monetization Summary */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center space-x-2 text-green-700">
              <DollarSign className="w-5 h-5" />
              <h4 className="font-semibold">Monetization</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Model:</span> {store.pricingModel}</p>
              {store.pricingModel === 'usd' && (
                <p><span className="font-medium">Price:</span> ${store.usdAmount}</p>
              )}
              {store.pricingModel === 'zaps' && (
                <p><span className="font-medium">Price:</span> {store.zapsRequired} ZAPs</p>
              )}
              {store.freeTrialEnabled && (
                <p><span className="font-medium">Trial:</span> {store.freeTrialDays} days</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Access Summary */}
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-700">
              <Users className="w-5 h-5" />
              <h4 className="font-semibold">Access</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Type:</span> {store.accessType}</p>
              <p><span className="font-medium">Members:</span> 0 (new community)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning if not all required checks pass */}
      {!allRequiredValid && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Please complete all required fields before publishing your community.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isPublishing}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
          </Button>

          <Button
            onClick={handlePublish}
            disabled={!allRequiredValid || isPublishing}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Rocket className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Community'}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
