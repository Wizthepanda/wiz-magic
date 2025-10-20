import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for browser notifications and sound alerts
 */
export const useNotification = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Create audio element for notification sound
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  /**
   * Play notification sound
   */
  const playSound = useCallback(() => {
    try {
      audioRef.current?.play().catch((error) => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, []);

  /**
   * Show browser notification
   */
  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/logo.png',
          badge: '/logo.png',
          ...options,
        });
      }
    },
    []
  );

  /**
   * Show notification with sound
   */
  const notify = useCallback(
    (title: string, body?: string, playAudio = true) => {
      if (playAudio) {
        playSound();
      }
      showNotification(title, {
        body,
        tag: 'wiz-message',
        requireInteraction: false,
      });
    },
    [playSound, showNotification]
  );

  return {
    playSound,
    showNotification,
    notify,
  };
};

/**
 * Hook for message notifications with auto-detection of new messages
 */
export const useMessageNotification = (enabled = true) => {
  const { notify } = useNotification();
  const lastMessageIdRef = useRef<string | null>(null);

  const handleNewMessage = useCallback(
    (messageId: string, senderName: string, content: string, isCurrentUser: boolean) => {
      if (!enabled || isCurrentUser) return;

      // Only notify if it's a new message
      if (lastMessageIdRef.current !== messageId) {
        lastMessageIdRef.current = messageId;
        notify(`New message from ${senderName}`, content);
      }
    },
    [enabled, notify]
  );

  return { handleNewMessage };
};
