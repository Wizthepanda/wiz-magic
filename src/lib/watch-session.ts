/**
 * WatchSession - Anti-cheat watch tracking system
 * Implements comprehensive telemetry collection and fraud prevention
 */

import { v4 as uuidv4 } from 'uuid';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface WatchEvent {
  type: 'playerReady' | 'play' | 'pause' | 'timeupdate' | 'ended' | 'seekStart' | 'seekEnd' | 
        'playbackRateChange' | 'visibilityChange' | 'focus' | 'blur' | 'heartbeat';
  timestamp: number;
  currentTime?: number;
  data?: any;
}

interface SessionConfig {
  videoId: string;
  videoDuration: number;
  userId: string;
  heartbeatInterval?: number; // Default 10s
  eventBatchInterval?: number; // Default 30s
}

interface DeviceFingerprint {
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  hash: string;
}

export class WatchSession {
  private sessionId: string;
  private config: SessionConfig;
  private events: WatchEvent[] = [];
  private sessionToken: string | null = null;
  private isActive: boolean = false;
  private startTimestamp: number = 0;
  private lastHeartbeat: number = 0;
  private lastTimeupdate: number = 0;
  private seekCount: number = 0;
  private hiddenTime: number = 0;
  private lastVisibilityChange: number = 0;
  
  // Intervals
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private batchInterval: NodeJS.Timeout | null = null;
  
  // Player reference
  private player: any = null;
  
  // Firebase Functions
  private startSessionFunction = httpsCallable(functions, 'startWatchSession');
  private sendEventsFunction = httpsCallable(functions, 'sendWatchEvents');
  private closeSessionFunction = httpsCallable(functions, 'closeWatchSession');

  constructor(config: SessionConfig) {
    this.sessionId = uuidv4();
    this.config = {
      heartbeatInterval: 10000,
      eventBatchInterval: 30000,
      ...config
    };
    
    console.log('🎬 WatchSession created:', this.sessionId);
    this.setupEventListeners();
  }

  /**
   * Start a new watch session
   */
  async start(player: any): Promise<boolean> {
    try {
      this.player = player;
      this.startTimestamp = Date.now();
      
      // Get signed session token from server
      const result = await this.startSessionFunction({
        sessionId: this.sessionId,
        videoId: this.config.videoId,
        videoDuration: this.config.videoDuration,
        deviceFingerprint: this.generateDeviceFingerprint(),
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        clientClockOffset: new Date().getTimezoneOffset()
      });
      
      const data = result.data as { sessionToken: string; success: boolean };
      if (!data.success) {
        console.error('❌ Failed to start watch session');
        return false;
      }
      
      this.sessionToken = data.sessionToken;
      this.isActive = true;
      
      // Record session start
      this.addEvent('playerReady', { sessionToken: this.sessionToken });
      
      // Start monitoring intervals
      this.startHeartbeat();
      this.startBatching();
      
      console.log('✅ WatchSession started with token');
      return true;
    } catch (error) {
      console.error('❌ Error starting watch session:', error);
      return false;
    }
  }

  /**
   * Player event handlers
   */
  onPlay(): void {
    if (!this.isActive) return;
    
    const currentTime = this.player?.getCurrentTime() || 0;
    this.addEvent('play', { currentTime });
    this.lastTimeupdate = Date.now();
    
    console.log('▶️ Play event recorded:', currentTime);
  }

  onPause(): void {
    if (!this.isActive) return;
    
    const currentTime = this.player?.getCurrentTime() || 0;
    this.addEvent('pause', { currentTime });
    
    console.log('⏸️ Pause event recorded:', currentTime);
  }

  onTimeUpdate(): void {
    if (!this.isActive) return;
    
    const now = Date.now();
    const currentTime = this.player?.getCurrentTime() || 0;
    
    // Sample every 5-10s to avoid spam
    if (now - this.lastTimeupdate >= 5000) {
      this.addEvent('timeupdate', { currentTime });
      this.lastTimeupdate = now;
    }
  }

  onSeek(fromTime: number, toTime: number): void {
    if (!this.isActive) return;
    
    this.seekCount++;
    const seekDistance = Math.abs(toTime - fromTime);
    const seekPercentage = (seekDistance / this.config.videoDuration) * 100;
    
    this.addEvent('seekStart', { fromTime, toTime, seekDistance, seekPercentage });
    
    // Flag large forward seeks
    if (toTime > fromTime && seekPercentage > 30) {
      console.warn('⚠️ Large forward seek detected:', seekPercentage.toFixed(1) + '%');
    }
    
    console.log('🔍 Seek event recorded:', fromTime, '→', toTime);
  }

  onEnded(): void {
    if (!this.isActive) return;
    
    const currentTime = this.player?.getCurrentTime() || 0;
    this.addEvent('ended', { currentTime });
    
    console.log('🏁 End event recorded:', currentTime);
    
    // Auto-close session on video end
    setTimeout(() => this.close(), 1000);
  }

  onPlaybackRateChange(rate: number): void {
    if (!this.isActive) return;
    
    this.addEvent('playbackRateChange', { rate });
    
    if (rate > 1.25) {
      console.warn('⚠️ High playback rate detected:', rate);
    }
  }

  /**
   * Generate device fingerprint for anti-fraud
   */
  private generateDeviceFingerprint(): DeviceFingerprint {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx?.fillText('fingerprint', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      hash: btoa(canvas.toDataURL()).slice(-8) // Simple hash
    };
    
    return fingerprint;
  }

  /**
   * Setup browser event listeners
   */
  private setupEventListeners(): void {
    // Visibility change detection
    document.addEventListener('visibilitychange', () => {
      const now = Date.now();
      const isHidden = document.visibilityState === 'hidden';
      
      if (isHidden) {
        this.lastVisibilityChange = now;
      } else if (this.lastVisibilityChange > 0) {
        this.hiddenTime += now - this.lastVisibilityChange;
      }
      
      this.addEvent('visibilityChange', { 
        visibilityState: document.visibilityState,
        hiddenTime: this.hiddenTime 
      });
    });

    // Focus/blur detection
    window.addEventListener('focus', () => {
      this.addEvent('focus');
    });

    window.addEventListener('blur', () => {
      this.addEvent('blur');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.close();
    });
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.isActive || !this.player) return;
      
      const currentTime = this.player.getCurrentTime() || 0;
      const isPlaying = this.player.getPlayerState() === 1; // YT.PlayerState.PLAYING
      
      this.addEvent('heartbeat', { 
        currentTime, 
        isPlaying,
        hiddenTime: this.hiddenTime,
        seekCount: this.seekCount
      });
      
      this.lastHeartbeat = Date.now();
    }, this.config.heartbeatInterval);
  }

  /**
   * Start event batching
   */
  private startBatching(): void {
    this.batchInterval = setInterval(() => {
      this.sendEventBatch();
    }, this.config.eventBatchInterval);
  }

  /**
   * Add event to buffer
   */
  private addEvent(type: WatchEvent['type'], data?: any): void {
    if (!this.isActive) return;
    
    const event: WatchEvent = {
      type,
      timestamp: Date.now(),
      currentTime: this.player?.getCurrentTime() || 0,
      data
    };
    
    this.events.push(event);
    
    // Send critical events immediately
    if (['ended', 'seekStart'].includes(type)) {
      this.sendEventBatch();
    }
  }

  /**
   * Send batched events to server
   */
  private async sendEventBatch(): Promise<void> {
    if (this.events.length === 0 || !this.sessionToken) return;
    
    const batch = [...this.events];
    this.events = []; // Clear buffer
    
    try {
      await this.sendEventsFunction({
        sessionId: this.sessionId,
        sessionToken: this.sessionToken,
        events: batch,
        batchTimestamp: Date.now()
      });
      
      console.log('📤 Sent event batch:', batch.length, 'events');
    } catch (error) {
      console.error('❌ Error sending event batch:', error);
      // Re-add events to buffer for retry
      this.events.unshift(...batch);
    }
  }

  /**
   * Close session and finalize XP calculation
   */
  async close(): Promise<void> {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
    
    // Send final batch
    await this.sendEventBatch();
    
    // Close session on server
    try {
      const result = await this.closeSessionFunction({
        sessionId: this.sessionId,
        sessionToken: this.sessionToken,
        endTimestamp: Date.now(),
        finalStats: {
          totalSeeks: this.seekCount,
          totalHiddenTime: this.hiddenTime,
          sessionDuration: Date.now() - this.startTimestamp
        }
      });
      
      const data = result.data as { 
        success: boolean; 
        xpAwarded: number; 
        validatedSeconds: number;
        fraudScore: number;
      };
      
      console.log('🏁 Session closed:', {
        xpAwarded: data.xpAwarded,
        validatedSeconds: data.validatedSeconds,
        fraudScore: data.fraudScore
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error closing session:', error);
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      sessionId: this.sessionId,
      isActive: this.isActive,
      duration: Date.now() - this.startTimestamp,
      eventCount: this.events.length,
      seekCount: this.seekCount,
      hiddenTime: this.hiddenTime,
      lastHeartbeat: this.lastHeartbeat
    };
  }
}