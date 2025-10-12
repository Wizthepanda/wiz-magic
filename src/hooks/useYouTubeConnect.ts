/**
 * useYouTubeConnect Hook
 *
 * Seamless popup-based YouTube OAuth flow with no routing redirects.
 * - Opens OAuth in centered popup (600x700)
 * - Main window stays on Create page
 * - Uses postMessage for popup → main window communication
 * - Integrates with React Query for instant video loading
 * - Handles popup blockers, timeouts, and errors gracefully
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_TIMEOUT_MS = 60000; // 60 seconds
const POPUP_CHECK_INTERVAL = 500; // Check every 500ms if popup closed

interface YouTubeConnectResult {
  type: 'YOUTUBE_CONNECTED';
  success: boolean;
  channelId?: string;
  channelTitle?: string;
  channelAvatar?: string;
  subscriberCount?: string;
  error?: string;
}

interface UseYouTubeConnectReturn {
  openPopup: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
}

/**
 * Hook to manage YouTube OAuth popup flow
 *
 * Usage:
 * ```tsx
 * const { openPopup, isConnecting, isConnected } = useYouTubeConnect();
 *
 * <button onClick={openPopup} disabled={isConnecting}>
 *   {isConnecting ? 'Connecting...' : 'Connect YouTube'}
 * </button>
 * ```
 */
export function useYouTubeConnect(): UseYouTubeConnectReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const popupRef = useRef<Window | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const timeoutTimerRef = useRef<number | null>(null);

  /**
   * Handle postMessage from OAuth popup
   * Validates origin and processes connection result
   */
  const handleMessage = useCallback((event: MessageEvent<YouTubeConnectResult>) => {
    // Security: Verify message origin
    if (event.origin !== window.location.origin) {
      console.warn('🚨 Received message from untrusted origin:', event.origin);
      return;
    }

    const data = event.data;

    // Verify message type
    if (!data?.type || data.type !== 'YOUTUBE_CONNECTED') {
      return;
    }

    console.log('📩 Received YouTube connection message:', data);

    // Clear timers
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      window.clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    setIsConnecting(false);

    if (data.success) {
      setIsConnected(true);

      // Show success toast
      toast({
        title: "YouTube Connected! 🎥",
        description: data.channelTitle
          ? `Connected to ${data.channelTitle}`
          : "Your YouTube channel is now linked",
        duration: 4000,
      });

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['youtubeVideos'] });
      queryClient.invalidateQueries({ queryKey: ['youtubeChannel'] });
      if (data.channelId) {
        queryClient.invalidateQueries({ queryKey: ['youtube', 'channel', data.channelId] });
      }

      console.log('✅ YouTube connection successful');
    } else {
      // Show error toast
      toast({
        title: "Connection Failed",
        description: data.error || "Failed to connect YouTube channel. Please try again.",
        variant: "destructive",
        duration: 5000,
      });

      console.error('❌ YouTube connection failed:', data.error);
    }
  }, [queryClient, toast]);

  /**
   * Setup message listener on mount
   */
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // Cleanup timers on unmount
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
      if (timeoutTimerRef.current) window.clearTimeout(timeoutTimerRef.current);
    };
  }, [handleMessage]);

  /**
   * Open YouTube OAuth popup
   * - Fetches OAuth URL from backend
   * - Opens centered popup
   * - Polls to detect if user closes popup
   * - Has timeout protection
   */
  const openPopup = useCallback(async () => {
    if (isConnecting) {
      console.warn('⚠️ Connection already in progress');
      return;
    }

    setIsConnecting(true);

    try {
      console.log('🚀 Initiating YouTube OAuth popup flow...');

      // Step 1: Get OAuth URL from backend (includes state + PKCE)
      // TODO: Get user ID from auth context
      const userId = 'anonymous';

      const response = await fetch('https://us-central1-wiz-magic-platform.cloudfunctions.net/initializeYouTubeOAuth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize OAuth: ${response.statusText}`);
      }

      const { url, state } = await response.json();

      if (!url) {
        throw new Error('No OAuth URL returned from server');
      }

      console.log('📋 OAuth URL received, state:', state);

      // Step 2: Calculate centered popup position
      const left = Math.max(0, window.screenX + (window.outerWidth - POPUP_WIDTH) / 2);
      const top = Math.max(0, window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2);

      // Step 3: Open popup
      popupRef.current = window.open(
        url,
        'youtube-oauth-popup',
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popupRef.current || popupRef.current.closed) {
        throw new Error('Popup was blocked by browser');
      }

      console.log('🪟 OAuth popup opened successfully');

      // Step 4: Poll to detect if user manually closes popup
      pollTimerRef.current = window.setInterval(() => {
        if (popupRef.current && popupRef.current.closed) {
          console.log('🚪 User closed popup');
          window.clearInterval(pollTimerRef.current!);
          pollTimerRef.current = null;

          setIsConnecting(false);

          toast({
            title: "Connection Cancelled",
            description: "YouTube connection was cancelled. Click 'Connect YouTube' to try again.",
            duration: 4000,
          });
        }
      }, POPUP_CHECK_INTERVAL);

      // Step 5: Set timeout (60 seconds)
      timeoutTimerRef.current = window.setTimeout(() => {
        if (popupRef.current && !popupRef.current.closed) {
          popupRef.current.close();
        }

        if (pollTimerRef.current) {
          window.clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }

        setIsConnecting(false);

        toast({
          title: "Connection Timeout",
          description: "YouTube connection took too long. Please try again.",
          variant: "destructive",
          duration: 5000,
        });

        console.error('⏱️ OAuth popup timeout');
      }, POPUP_TIMEOUT_MS);

    } catch (error) {
      console.error('❌ Error opening YouTube OAuth popup:', error);

      setIsConnecting(false);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('blocked')) {
          toast({
            title: "Popup Blocked",
            description: "Please allow popups for this site and try again.",
            variant: "destructive",
            duration: 5000,
          });
        } else {
          toast({
            title: "Connection Error",
            description: error.message,
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    }
  }, [isConnecting, toast]);

  return {
    openPopup,
    isConnecting,
    isConnected,
  };
}
