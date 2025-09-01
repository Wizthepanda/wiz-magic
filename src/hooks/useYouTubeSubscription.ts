// React hook for YouTube subscription functionality
// Provides easy-to-use subscription methods for UI components

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { YouTubeSubscriptionService, SubscriptionStatus, SubscriptionResult } from '@/lib/youtube-subscription-service';

export interface UseYouTubeSubscriptionReturn {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  subscribe: () => Promise<SubscriptionResult>;
  unsubscribe: () => Promise<SubscriptionResult>;
  hasPermissions: boolean;
  refreshStatus: () => Promise<void>;
}

export const useYouTubeSubscription = (channelId: string): UseYouTubeSubscriptionReturn => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Check subscription status on mount and when user/channelId changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !channelId) {
        setSubscriptionStatus(null);
        setHasPermissions(false);
        return;
      }

      setIsLoading(true);
      try {
        // Check permissions
        const permissions = await YouTubeSubscriptionService.hasSubscriptionPermissions(user.uid);
        setHasPermissions(permissions);

        // Get subscription status
        const status = await YouTubeSubscriptionService.getSubscriptionStatus(user.uid, channelId);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setSubscriptionStatus({ isSubscribed: false });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user, channelId]);

  const subscribe = async (): Promise<SubscriptionResult> => {
    if (!user || !channelId) {
      return { success: false, error: 'User not authenticated or channel ID missing' };
    }

    setIsLoading(true);
    try {
      console.log(`🔔 Starting subscription to channel ${channelId}...`);
      
      const result = await YouTubeSubscriptionService.subscribeToChannel(user.uid, channelId);
      
      if (result.success) {
        // Update local state
        setSubscriptionStatus({
          isSubscribed: true,
          subscriptionId: `${user.uid}_${channelId}`,
          subscribedAt: new Date(),
        });
        
        console.log(`✅ Successfully subscribed to channel ${channelId}`);
      } else {
        console.error(`❌ Failed to subscribe to channel ${channelId}:`, result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error in subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (): Promise<SubscriptionResult> => {
    if (!user || !channelId) {
      return { success: false, error: 'User not authenticated or channel ID missing' };
    }

    setIsLoading(true);
    try {
      console.log(`🔕 Unsubscribing from channel ${channelId}...`);
      
      const result = await YouTubeSubscriptionService.unsubscribeFromChannel(user.uid, channelId);
      
      if (result.success) {
        // Update local state
        setSubscriptionStatus({ isSubscribed: false });
        console.log(`✅ Successfully unsubscribed from channel ${channelId}`);
      }
      
      return result;
    } catch (error) {
      console.error('Error in unsubscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async (): Promise<void> => {
    if (!user || !channelId) return;

    setIsLoading(true);
    try {
      const status = await YouTubeSubscriptionService.getSubscriptionStatus(user.uid, channelId);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscriptionStatus,
    isLoading,
    subscribe,
    unsubscribe,
    hasPermissions,
    refreshStatus,
  };
};

// Hook to get all user subscriptions
export const useUserSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setSubscriptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const userSubscriptions = await YouTubeSubscriptionService.getUserSubscriptions(user.uid);
        setSubscriptions(userSubscriptions);
      } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        setSubscriptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

  const refreshSubscriptions = async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userSubscriptions = await YouTubeSubscriptionService.getUserSubscriptions(user.uid);
      setSubscriptions(userSubscriptions);
    } catch (error) {
      console.error('Error refreshing subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscriptions,
    isLoading,
    refreshSubscriptions,
  };
};