/**
 * WebSocket Client (Phase 6)
 * Manages realtime WebSocket connection and events for community updates
 */

import { queryClient } from '@/lib/queryClient';
import type { Community, Member } from '@/schemas/community';

// WebSocket event types
export type WSEvent =
  | { type: 'community:updated'; payload: { id: string; partial: Partial<Community> } }
  | { type: 'community:member_joined'; payload: { id: string; member: Member } }
  | { type: 'community:member_left'; payload: { id: string; userId: string } }
  | { type: 'community:reward_claimed'; payload: { id: string; userId: string; rewardId: string } };

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribedChannels: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        this.reconnectAttempts = 0;

        // Resubscribe to channels after reconnect
        this.subscribedChannels.forEach((channel) => {
          this.subscribe(channel);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };

      this.ws.onclose = () => {
        console.log('[WS] Disconnected');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[WS] Connection failed:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`[WS] Reconnecting in ${delay}ms...`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Subscribe to a specific channel (community)
   */
  subscribe(channel: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'subscribe', channel }));
      this.subscribedChannels.add(channel);
      console.log(`[WS] Subscribed to ${channel}`);
    }
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', channel }));
      this.subscribedChannels.delete(channel);
      console.log(`[WS] Unsubscribed from ${channel}`);
    }
  }

  /**
   * Handle incoming WebSocket events
   */
  private handleEvent(event: WSEvent) {
    switch (event.type) {
      case 'community:updated':
        this.handleCommunityUpdated(event.payload);
        break;

      case 'community:member_joined':
        this.handleMemberJoined(event.payload);
        break;

      case 'community:member_left':
        this.handleMemberLeft(event.payload);
        break;

      case 'community:reward_claimed':
        this.handleRewardClaimed(event.payload);
        break;

      default:
        console.warn('[WS] Unknown event type:', event);
    }
  }

  /**
   * Handle community update event
   */
  private handleCommunityUpdated(payload: { id: string; partial: Partial<Community> }) {
    const { id, partial } = payload;

    // Update community in cache
    queryClient.setQueryData<Community>(['community', id], (old) => {
      if (!old) return old;
      return { ...old, ...partial, updatedAt: new Date().toISOString() };
    });

    // Invalidate communities list
    queryClient.invalidateQueries({ queryKey: ['communities'] });

    console.log(`[WS] Community ${id} updated`);
  }

  /**
   * Handle member joined event
   */
  private handleMemberJoined(payload: { id: string; member: Member }) {
    const { id, member } = payload;

    // Update member count in community cache
    queryClient.setQueryData<Community>(['community', id], (old) => {
      if (!old) return old;
      return {
        ...old,
        stats: {
          ...old.stats,
          members: old.stats.members + 1,
          slotsAvailable: old.stats.slotsAvailable ? old.stats.slotsAvailable - 1 : null,
        },
      };
    });

    // Add member to members list
    queryClient.setQueryData<Member[]>(['members', id], (old) => {
      if (!old) return [member];
      return [...old, member];
    });

    console.log(`[WS] Member ${member.name} joined community ${id}`);
  }

  /**
   * Handle member left event
   */
  private handleMemberLeft(payload: { id: string; userId: string }) {
    const { id, userId } = payload;

    // Update member count
    queryClient.setQueryData<Community>(['community', id], (old) => {
      if (!old) return old;
      return {
        ...old,
        stats: {
          ...old.stats,
          members: Math.max(0, old.stats.members - 1),
          slotsAvailable: old.stats.slotsAvailable ? old.stats.slotsAvailable + 1 : null,
        },
      };
    });

    // Remove member from list
    queryClient.setQueryData<Member[]>(['members', id], (old) => {
      if (!old) return old;
      return old.filter((m) => m.userId !== userId);
    });

    console.log(`[WS] Member ${userId} left community ${id}`);
  }

  /**
   * Handle reward claimed event
   */
  private handleRewardClaimed(payload: { id: string; userId: string; rewardId: string }) {
    // Invalidate user rewards and community stats
    queryClient.invalidateQueries({ queryKey: ['community', payload.id] });
    queryClient.invalidateQueries({ queryKey: ['user', payload.userId, 'rewards'] });

    console.log(`[WS] User ${payload.userId} claimed reward ${payload.rewardId} in community ${payload.id}`);
  }

  /**
   * Close WebSocket connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.subscribedChannels.clear();
    }
  }

  /**
   * Get connection status
   */
  getStatus(): string {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
