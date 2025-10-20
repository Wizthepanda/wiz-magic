import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface CommunityNotification {
  communityId: string;
  unreadCount: number;
}

/**
 * Custom hook to track unread message counts per community
 * Returns a map of communityId -> unread count
 */
export const useCommunityNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Subscribe to all chats where user is a participant
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const notifMap = new Map<string, number>();

      snapshot.docs.forEach((doc) => {
        const chatData = doc.data();

        // Only process community chats
        if (chatData.type === 'community' && chatData.communityId) {
          const communityId = chatData.communityId;
          const unreadCount = chatData.unreadCount?.[user.uid] || 0;

          // Add or accumulate unread count for this community
          const currentCount = notifMap.get(communityId) || 0;
          notifMap.set(communityId, currentCount + unreadCount);
        }
      });

      setNotifications(notifMap);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  /**
   * Get unread count for a specific community
   */
  const getUnreadCount = (communityId: string): number => {
    return notifications.get(communityId) || 0;
  };

  /**
   * Get total unread count across all communities
   */
  const getTotalUnreadCount = (): number => {
    let total = 0;
    notifications.forEach((count) => {
      total += count;
    });
    return total;
  };

  /**
   * Clear notifications for a specific community
   * (This would be called when user opens a community chat)
   */
  const clearCommunityNotifications = async (communityId: string) => {
    if (!user) return;

    try {
      // Find all community chats for this communityId
      const chatsQuery = query(
        collection(db, 'chats'),
        where('type', '==', 'community'),
        where('communityId', '==', communityId),
        where('participants', 'array-contains', user.uid)
      );

      const snapshot = await getDocs(chatsQuery);

      // Mark as read in message service
      const { MessageService } = await import('@/lib/message-service');
      const messageService = MessageService.getInstance();

      snapshot.docs.forEach((doc) => {
        messageService.markMessagesAsRead(doc.id, user.uid);
      });

      // Update local state immediately
      const newNotifications = new Map(notifications);
      newNotifications.set(communityId, 0);
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error clearing community notifications:', error);
    }
  };

  return {
    notifications,
    isLoading,
    getUnreadCount,
    getTotalUnreadCount,
    clearCommunityNotifications,
  };
};
