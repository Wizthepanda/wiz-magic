import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageService } from '@/lib/message-service';
import type { Message, Conversation } from '@/pages/MessagesPage';
import { useAuth } from './useAuth';

/**
 * Custom hook for real-time messaging functionality
 */
export const useMessages = (chatId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messageService = MessageService.getInstance();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to messages
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = messageService.subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => {
      unsubscribe();
    };
  }, [chatId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!chatId || !user) return;

    const unsubscribe = messageService.subscribeToTyping(
      chatId,
      user.uid,
      (typing, userName) => {
        setIsTyping(typing);
        setTypingUserName(userName || '');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [chatId, user]);

  // Send message
  const sendMessage = useCallback(
    async (
      content: string,
      type: 'text' | 'image' | 'file' | 'course-link' | 'creation-link' = 'text',
      metadata?: Message['metadata']
    ) => {
      if (!chatId || !user || !content.trim()) return;

      setIsSending(true);
      setError(null);

      try {
        await messageService.sendMessage(
          chatId,
          user.uid,
          user.displayName || 'Anonymous',
          user.photoURL || '',
          content,
          type,
          metadata
        );

        // Remove typing indicator
        await messageService.removeTypingStatus(chatId, user.uid);
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      } finally {
        setIsSending(false);
      }
    },
    [chatId, user]
  );

  // Send file
  const sendFile = useCallback(
    async (file: File, type: 'image' | 'file') => {
      if (!chatId || !user) return;

      setIsSending(true);
      setError(null);

      try {
        await messageService.sendFileMessage(
          chatId,
          user.uid,
          user.displayName || 'Anonymous',
          user.photoURL || '',
          file,
          type
        );
      } catch (err) {
        console.error('Error sending file:', err);
        setError('Failed to send file');
      } finally {
        setIsSending(false);
      }
    },
    [chatId, user]
  );

  // Set typing status (with debounce)
  const setTypingStatus = useCallback(() => {
    if (!chatId || !user) return;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status
    messageService.setTypingStatus(chatId, user.uid, user.displayName || 'Anonymous');

    // Clear typing status after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      messageService.removeTypingStatus(chatId, user.uid);
    }, 3000);
  }, [chatId, user]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (!chatId || !user) return;
    messageService.markMessagesAsRead(chatId, user.uid);
  }, [chatId, user]);

  // Add emoji reaction
  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!user) return;

      try {
        await messageService.addEmojiReaction(
          messageId,
          emoji,
          user.uid,
          user.displayName || 'Anonymous'
        );
      } catch (err) {
        console.error('Error adding reaction:', err);
        setError('Failed to add reaction');
      }
    },
    [user]
  );

  return {
    messages,
    isTyping,
    typingUserName,
    isSending,
    error,
    sendMessage,
    sendFile,
    setTypingStatus,
    markAsRead,
    addReaction,
  };
};

/**
 * Custom hook for managing conversations/chats
 */
export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messageService = MessageService.getInstance();

  // Subscribe to conversations
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = messageService.subscribeToUserChats(user.uid, (chats) => {
      setConversations(chats);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Create DM chat
  const createDMChat = useCallback(
    async (
      partnerId: string,
      partnerName: string,
      partnerAvatar: string
    ): Promise<string | null> => {
      if (!user) return null;

      setError(null);

      try {
        const chatId = await messageService.getOrCreateDMChat(
          user.uid,
          user.displayName || 'Anonymous',
          user.photoURL || '',
          partnerId,
          partnerName,
          partnerAvatar
        );
        return chatId;
      } catch (err) {
        console.error('Error creating DM chat:', err);
        setError('Failed to create chat');
        return null;
      }
    },
    [user]
  );

  // Create community chat
  const createCommunityChat = useCallback(
    async (
      communityId: string,
      communityName: string,
      communityAvatar: string,
      participants: string[]
    ): Promise<string | null> => {
      if (!user) return null;

      setError(null);

      try {
        const chatId = await messageService.getOrCreateCommunityChat(
          communityId,
          communityName,
          communityAvatar,
          participants
        );
        return chatId;
      } catch (err) {
        console.error('Error creating community chat:', err);
        setError('Failed to create community chat');
        return null;
      }
    },
    [user]
  );

  // Get total unread count
  const totalUnreadCount = conversations.reduce((acc, conv) => acc + conv.unread, 0);

  return {
    conversations,
    isLoading,
    error,
    totalUnreadCount,
    createDMChat,
    createCommunityChat,
  };
};
