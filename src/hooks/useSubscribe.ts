/**
 * useSubscribe Hook - Manages creator subscriptions
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

export const useSubscribe = (creatorId: string | undefined) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !creatorId) {
        setIsSubscribed(false);
        return;
      }

      try {
        const subRef = doc(db, 'subscriptions', `${user.uid}_${creatorId}`);
        const subSnap = await getDoc(subRef);
        setIsSubscribed(subSnap.exists());
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    };

    checkSubscription();
  }, [user, creatorId]);

  const toggleSubscribe = async () => {
    if (!user || !creatorId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const subRef = doc(db, 'subscriptions', `${user.uid}_${creatorId}`);

      if (isSubscribed) {
        // Unsubscribe
        await deleteDoc(subRef);
        setIsSubscribed(false);
        toast({
          title: 'Unsubscribed',
          description: 'You will no longer receive updates from this creator',
        });
      } else {
        // Subscribe
        await setDoc(subRef, {
          userId: user.uid,
          creatorId,
          subscribedAt: new Date().toISOString(),
        });
        setIsSubscribed(true);
        toast({
          title: 'Subscribed!',
          description: 'You will now receive updates from this creator',
        });
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
      toast({
        title: 'Failed to update subscription',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isSubscribed, isLoading, toggleSubscribe };
};
