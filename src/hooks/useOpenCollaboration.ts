/**
 * useOpenCollaboration Hook - Opens collaboration request with creator
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from './use-toast';

export const useOpenCollaboration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const openCollaboration = async (creatorId: string, creatorName: string, message?: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to send collaboration requests',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a unique thread ID
      const threadId = `collab_${user.uid}_${creatorId}_${Date.now()}`;
      const threadRef = doc(db, 'messages', threadId);

      // Create the collaboration thread
      await setDoc(threadRef, {
        participants: [user.uid, creatorId],
        type: 'collaboration',
        subject: `Collaboration Request from ${user.displayName || 'User'}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: message || `Hi ${creatorName}, I'd like to collaborate with you!`,
        unreadCount: {
          [user.uid]: 0,
          [creatorId]: 1,
        },
      });

      // Create the initial message
      const messageRef = doc(collection(db, 'messages', threadId, 'messages'));
      await setDoc(messageRef, {
        senderId: user.uid,
        text: message || `Hi ${creatorName}, I'd like to collaborate with you on WIZUP! Looking forward to hearing from you.`,
        timestamp: serverTimestamp(),
        read: false,
      });

      toast({
        title: 'Collaboration request sent!',
        description: `Your message has been sent to ${creatorName}`,
      });

      // Navigate to messages with this thread
      navigate(`/messages?threadId=${threadId}`);
    } catch (error) {
      console.error('Failed to create collaboration request:', error);
      toast({
        title: 'Failed to send request',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { openCollaboration, isLoading };
};
