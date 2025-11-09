/**
 * JoinCommunityButton - Premium join button with full payment flow integration
 * Handles all access models: Free, Free ZAPs, Paid (USD), ZAPs Pay, ZAPs+USD, Waitlist
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, Loader2, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { trackCommunityJoinAttempt, trackCommunityJoinSuccess, trackCommunityJoinFailure } from '@/lib/analytics';
import confetti from 'canvas-confetti';
import { PaymentModal } from './PaymentModal';
import { WaitlistModal } from './WaitlistModal';

interface JoinCommunityButtonProps {
  creatorId: string;
  communityId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  className?: string;
}

interface CommunityAccess {
  type: 'free' | 'free_zaps' | 'zaps_pay' | 'usd' | 'zaps_usd' | 'waitlist';
  zapsRequired?: number;
  usdPrice?: number;
  zapReward?: number;
}

export const JoinCommunityButton: React.FC<JoinCommunityButtonProps> = ({
  creatorId,
  communityId,
  creatorName = 'Creator',
  creatorAvatar,
  className,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [communityTitle, setCommunityTitle] = useState('Community');

  // Check if user is already a member
  const { data: isMember, isLoading: checkingMembership } = useQuery({
    queryKey: ['community-membership', communityId, user?.uid],
    queryFn: async () => {
      if (!user || !communityId) return false;

      const memberDoc = await getDoc(
        doc(db, 'communities', communityId, 'members', user.uid)
      );

      return memberDoc.exists();
    },
    enabled: !!user && !!communityId,
  });

  // Get community access type
  const { data: communityAccess } = useQuery({
    queryKey: ['community-access', communityId],
    queryFn: async () => {
      if (!communityId) return null;

      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (!communityDoc.exists()) return null;

      const data = communityDoc.data();

      // Store community title for modals
      setCommunityTitle(data.title || 'Community');

      // Determine access type based on community settings
      if (data.waitlistOnly) {
        return { type: 'waitlist' } as CommunityAccess;
      }

      const zapsRequired = data.zapsRequired || 0;
      const usdPrice = data.usdCoPay || 0;

      if (zapsRequired === 0 && usdPrice === 0) {
        return { type: 'free', zapReward: data.zapReward || 0 } as CommunityAccess;
      }

      if (zapsRequired > 0 && usdPrice === 0) {
        return { type: data.rewardZaps ? 'free_zaps' : 'zaps_pay', zapsRequired, zapReward: data.zapReward || 0 } as CommunityAccess;
      }

      if (zapsRequired === 0 && usdPrice > 0) {
        return { type: 'usd', usdPrice } as CommunityAccess;
      }

      return { type: 'zaps_usd', zapsRequired, usdPrice } as CommunityAccess;
    },
    enabled: !!communityId,
  });

  // Join with cloud function (handles all ZAP transactions)
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !communityId || !communityAccess) throw new Error('Missing required data');

      await trackCommunityJoinAttempt(user.uid, communityId, communityAccess.type);

      // Get community title for transaction record
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      const communityTitle = communityDoc.data()?.title || 'Community';

      // Call cloud function for secure transaction
      const purchaseFn = httpsCallable(functions, 'purchaseCommunityAccess');
      const result = await purchaseFn({
        communityId,
        zapCost: communityAccess.zapsRequired || 0,
        communityTitle,
      });

      const data = result.data as { success: boolean; zapCost: number; zapReward: number; message: string };

      // Add user to members subcollection for query efficiency
      await setDoc(doc(db, 'communities', communityId, 'members', user.uid), {
        joinedAt: serverTimestamp(),
        role: 'member',
        displayName: user.displayName || 'Member',
        username: user.displayName || 'Member',
        profilePic: user.photoURL || '',
        photoURL: user.photoURL || '',
        avatarUrl: user.photoURL || '',
        level: 1,
        xp: 0,
      });

      // Add to user's memberships
      await setDoc(doc(db, 'users', user.uid, 'memberships', communityId), {
        communityId,
        joinedAt: serverTimestamp(),
      });

      await trackCommunityJoinSuccess(user.uid, communityId, communityAccess.type);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-membership', communityId, user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['community', communityId] });
      queryClient.invalidateQueries({ queryKey: ['joinedCommunities', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['userZAPs', user?.uid] });

      // Show confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a259ff', '#ec4899'],
      });

      toast({
        title: 'Welcome! 🎉',
        description: data.message || "You've successfully joined the community!",
      });
    },
    onError: (error) => {
      console.error('Failed to join community:', error);
      if (user && communityId) {
        trackCommunityJoinFailure(user.uid, communityId, error.message);
      }
      toast({
        title: 'Join failed',
        description: 'There was an error joining the community. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleJoinClick = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join this community',
        variant: 'destructive',
      });
      return;
    }

    if (!communityId || !communityAccess) {
      toast({
        title: 'Community not found',
        description: 'Unable to load community information',
        variant: 'destructive',
      });
      return;
    }

    // Handle different access types
    switch (communityAccess.type) {
      case 'free':
      case 'free_zaps':
      case 'zaps_pay':
        // Use cloud function for all ZAP-based access
        joinMutation.mutate();
        break;

      case 'usd':
      case 'zaps_usd':
        // Open payment modal
        setShowPaymentModal(true);
        break;

      case 'waitlist':
        // Open waitlist modal
        setShowWaitlistModal(true);
        break;
    }
  };

  // Don't render if no community
  if (!communityId) return null;

  // Show Enter Community if already a member
  if (isMember) {
    return (
      <Button
        className={cn(
          'h-11 px-5 rounded-full font-semibold',
          'bg-gradient-to-r from-indigo-600 to-violet-500',
          'text-white',
          'shadow-sm hover:shadow-md hover:scale-[1.02]',
          'transition-all duration-200',
          className
        )}
        aria-label="Enter community"
      >
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Enter Community
      </Button>
    );
  }

  // Show loading state while checking membership
  if (checkingMembership) {
    return (
      <Button
        disabled
        className={cn(
          'h-11 px-5 rounded-full font-semibold',
          'bg-gradient-to-r from-indigo-600 to-violet-500',
          'text-white opacity-50',
          className
        )}
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Get button text and icon based on access type
  const getButtonContent = () => {
    if (!communityAccess) return { text: 'Join', icon: Users };

    switch (communityAccess.type) {
      case 'free':
        return { text: 'Join Free', icon: Users };
      case 'free_zaps':
        return { text: `Join (+${communityAccess.zapReward} ZAPs)`, icon: Zap };
      case 'zaps_pay':
        return { text: `Join (${communityAccess.zapsRequired} ZAPs)`, icon: Lock };
      case 'usd':
        return { text: `Join ($${communityAccess.usdPrice})`, icon: Lock };
      case 'zaps_usd':
        return { text: `Join (${communityAccess.zapsRequired} ZAPs + $${communityAccess.usdPrice})`, icon: Lock };
      case 'waitlist':
        return { text: 'Join Waitlist', icon: Users };
      default:
        return { text: 'Join', icon: Users };
    }
  };

  const { text, icon: Icon } = getButtonContent();
  const isLoading = joinMutation.isPending;

  return (
    <AnimatePresence mode="wait">
      <Button
        onClick={handleJoinClick}
        disabled={isLoading}
        className={cn(
          'h-11 px-5 rounded-full font-semibold',
          'bg-gradient-to-r from-indigo-600 to-violet-500',
          'text-white',
          'shadow-sm hover:shadow-md hover:scale-[1.02]',
          'transition-all duration-200',
          isLoading && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={`Join community - ${text}`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center"
            >
              <Icon className="w-4 h-4 mr-2" />
              {text}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Payment Modal */}
      {communityAccess && (communityAccess.type === 'usd' || communityAccess.type === 'zaps_usd') && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          communityId={communityId || ''}
          communityTitle={communityTitle}
          creatorName={creatorName}
          zapsRequired={communityAccess.zapsRequired}
          usdPrice={communityAccess.usdPrice}
          onSuccess={() => {
            setShowPaymentModal(false);
            queryClient.invalidateQueries({ queryKey: ['community-membership', communityId, user?.uid] });
            queryClient.invalidateQueries({ queryKey: ['community', communityId] });
          }}
        />
      )}

      {/* Waitlist Modal */}
      {communityAccess?.type === 'waitlist' && (
        <WaitlistModal
          isOpen={showWaitlistModal}
          onClose={() => setShowWaitlistModal(false)}
          communityId={communityId || ''}
          communityTitle={communityTitle}
          creatorName={creatorName}
          creatorAvatar={creatorAvatar}
        />
      )}
    </AnimatePresence>
  );
};
