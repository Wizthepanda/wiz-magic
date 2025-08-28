/**
 * Watch Time Tracker with Anti-Cheat Measures
 * Tracks video watch time and awards XP with fraud prevention
 */

import { XPSystem, XP_CONFIG } from './xp-system';
import { auth } from './firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface WatchSession {
  sessionId: string;
  userId: string;
  videoId: string;
  startTime: Date;
  endTime?: Date;
  lastHeartbeat: Date;
  totalWatchTime: number;
  validWatchTime: number; // Only time when tab was focused
  xpEarned: number;
  completionRate: number;
  isActive: boolean;
  tabFocused: boolean;
  isBoosted: boolean;
  heartbeatCount: number;
  videoDuration?: number;
  lastValidationPing: number;
}

export class WatchTimeTracker {
  private static activeSessions: Map<string, WatchSession> = new Map();
  private static heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private static focusListeners: Map<string, () => void> = new Map();
  private static blurListeners: Map<string, () => void> = new Map();

  /**
   * Start tracking a video watch session
   */
  static async startWatchSession(
    videoId: string, 
    videoDuration?: number,
    isBoosted: boolean = false
  ): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      console.warn('⚠️ Watch Tracker: No authenticated user');
      return null;
    }

    try {
      const sessionId = `${user.uid}_${videoId}_${Date.now()}`;
      const session: WatchSession = {
        sessionId,
        userId: user.uid,
        videoId,
        startTime: new Date(),
        lastHeartbeat: new Date(),
        totalWatchTime: 0,
        validWatchTime: 0,
        xpEarned: 0,
        completionRate: 0,
        isActive: true,
        tabFocused: document.hasFocus(),
        isBoosted,
        heartbeatCount: 0,
        videoDuration,
        lastValidationPing: Date.now()
      };

      // Store session in memory
      this.activeSessions.set(sessionId, session);

      // Store session in Firestore for server-side validation
      const sessionRef = doc(db, 'watchSessions', sessionId);
      await setDoc(sessionRef, {
        ...session,
        startTime: serverTimestamp(),
        lastHeartbeat: serverTimestamp()
      });

      // Set up heartbeat interval
      this.setupHeartbeat(sessionId);
      
      // Set up focus/blur listeners for anti-cheat
      this.setupFocusListeners(sessionId);

      console.log(`▶️ Watch Tracker: Started session ${sessionId} for video ${videoId}`);
      return sessionId;
    } catch (error) {
      console.error('Error starting watch session:', error);
      return null;
    }
  }

  /**
   * Update watch session with current progress
   */
  static async updateWatchProgress(
    sessionId: string,
    currentTime: number,
    videoDuration?: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) return;

    try {
      const now = new Date();
      const timeSinceLastUpdate = Math.min(
        (now.getTime() - session.lastHeartbeat.getTime()) / 1000,
        20 // Cap at 20 seconds to prevent cheating
      );

      // Only count time if tab is focused (anti-cheat)
      if (session.tabFocused && timeSinceLastUpdate > 0) {
        session.validWatchTime += timeSinceLastUpdate;
        session.totalWatchTime += timeSinceLastUpdate;
      } else {
        session.totalWatchTime += timeSinceLastUpdate;
      }

      // Update completion rate
      if (videoDuration && videoDuration > 0) {
        session.completionRate = Math.min(1, currentTime / videoDuration);
        session.videoDuration = videoDuration;
      }

      session.lastHeartbeat = now;

      // Award XP every 10 seconds of valid watch time
      const xpIntervals = Math.floor(session.validWatchTime / 10);
      const xpToAward = xpIntervals - Math.floor((session.validWatchTime - timeSinceLastUpdate) / 10);
      
      if (xpToAward > 0 && session.tabFocused) {
        const xpEarned = await XPSystem.awardWatchTimeXP(
          session.userId,
          session.videoId,
          xpToAward * 10, // Convert back to seconds
          session.completionRate,
          session.isBoosted
        );
        
        session.xpEarned += xpEarned;
      }

      // Update session in Firestore periodically
      if (session.heartbeatCount % 6 === 0) { // Every 6th heartbeat (1 minute)
        await this.syncSessionToFirestore(sessionId);
      }

    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  }

  /**
   * End watch session and award final XP
   */
  static async endWatchSession(sessionId: string): Promise<number> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return 0;

    try {
      session.isActive = false;
      session.endTime = new Date();

      // Award completion bonus if applicable
      let completionBonusXP = 0;
      if (session.completionRate >= XP_CONFIG.COMPLETION_THRESHOLD) {
        const baseXP = Math.floor(session.validWatchTime * XP_CONFIG.WATCH_TIME_XP_RATE);
        completionBonusXP = Math.floor(baseXP * XP_CONFIG.COMPLETION_BONUS_RATE);
        
        if (session.isBoosted) {
          completionBonusXP = Math.floor(completionBonusXP * XP_CONFIG.BOOSTED_MULTIPLIER);
        }

        // Award completion bonus
        const bonusAwarded = await XPSystem.awardWatchTimeXP(
          session.userId,
          session.videoId,
          0, // No additional watch time
          session.completionRate,
          session.isBoosted
        );
        
        session.xpEarned += bonusAwarded;
      }

      // Final sync to Firestore
      await this.syncSessionToFirestore(sessionId, true);

      // Check for streak bonus
      await XPSystem.checkStreakBonus(session.userId);

      // Clean up
      this.cleanup(sessionId);

      console.log(`⏹️ Watch Tracker: Ended session ${sessionId}, earned ${session.xpEarned} XP`);
      return session.xpEarned;
    } catch (error) {
      console.error('Error ending watch session:', error);
      this.cleanup(sessionId);
      return 0;
    }
  }

  /**
   * Pause watch session (when user pauses video or loses focus)
   */
  static pauseWatchSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      console.log(`⏸️ Watch Tracker: Paused session ${sessionId}`);
    }
  }

  /**
   * Resume watch session
   */
  static resumeWatchSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = true;
      session.lastHeartbeat = new Date();
      console.log(`▶️ Watch Tracker: Resumed session ${sessionId}`);
    }
  }

  /**
   * Set up heartbeat interval for anti-cheat validation
   */
  private static setupHeartbeat(sessionId: string): void {
    const heartbeatInterval = setInterval(async () => {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.isActive) {
        clearInterval(heartbeatInterval);
        return;
      }

      session.heartbeatCount++;
      
      // Randomized validation ping to prevent predictable cheating
      const shouldValidate = Math.random() < 0.1 || // 10% chance
        (Date.now() - session.lastValidationPing) > 60000; // or every minute

      if (shouldValidate) {
        await this.performValidationPing(sessionId);
        session.lastValidationPing = Date.now();
      }

    }, XP_CONFIG.ANTI_CHEAT_PING_INTERVAL);

    this.heartbeatIntervals.set(sessionId, heartbeatInterval);
  }

  /**
   * Set up focus/blur listeners for anti-cheat
   */
  private static setupFocusListeners(sessionId: string): void {
    const focusHandler = () => {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.tabFocused = true;
        console.log(`👁️ Watch Tracker: Tab focused for session ${sessionId}`);
      }
    };

    const blurHandler = () => {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.tabFocused = false;
        console.log(`👁️ Watch Tracker: Tab blurred for session ${sessionId}`);
      }
    };

    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);

    this.focusListeners.set(sessionId, focusHandler);
    this.blurListeners.set(sessionId, blurHandler);
  }

  /**
   * Perform validation ping to server
   */
  private static async performValidationPing(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      // Update session in Firestore with validation timestamp
      const sessionRef = doc(db, 'watchSessions', sessionId);
      await updateDoc(sessionRef, {
        lastValidationPing: serverTimestamp(),
        heartbeatCount: session.heartbeatCount,
        validWatchTime: session.validWatchTime,
        tabFocused: session.tabFocused,
        isActive: session.isActive
      });

      console.log(`🔍 Watch Tracker: Validation ping for session ${sessionId}`);
    } catch (error) {
      console.error('Error performing validation ping:', error);
    }
  }

  /**
   * Sync session data to Firestore
   */
  private static async syncSessionToFirestore(sessionId: string, final: boolean = false): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      const sessionRef = doc(db, 'watchSessions', sessionId);
      const updateData: any = {
        totalWatchTime: session.totalWatchTime,
        validWatchTime: session.validWatchTime,
        xpEarned: session.xpEarned,
        completionRate: session.completionRate,
        lastHeartbeat: serverTimestamp(),
        heartbeatCount: session.heartbeatCount,
        tabFocused: session.tabFocused,
        isActive: session.isActive
      };

      if (final) {
        updateData.endTime = serverTimestamp();
        updateData.isActive = false;
      }

      await updateDoc(sessionRef, updateData);
    } catch (error) {
      console.error('Error syncing session to Firestore:', error);
    }
  }

  /**
   * Clean up session resources
   */
  private static cleanup(sessionId: string): void {
    // Clear heartbeat interval
    const interval = this.heartbeatIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(sessionId);
    }

    // Remove event listeners
    const focusHandler = this.focusListeners.get(sessionId);
    const blurHandler = this.blurListeners.get(sessionId);
    
    if (focusHandler) {
      window.removeEventListener('focus', focusHandler);
      this.focusListeners.delete(sessionId);
    }
    
    if (blurHandler) {
      window.removeEventListener('blur', blurHandler);
      this.blurListeners.delete(sessionId);
    }

    // Remove session from memory
    this.activeSessions.delete(sessionId);
  }

  /**
   * Get active session by video ID
   */
  static getActiveSession(videoId: string): WatchSession | null {
    const user = auth.currentUser;
    if (!user) return null;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.videoId === videoId && session.userId === user.uid && session.isActive) {
        return session;
      }
    }
    return null;
  }

  /**
   * Clean up all sessions (call on app unmount)
   */
  static cleanupAll(): void {
    for (const sessionId of this.activeSessions.keys()) {
      this.cleanup(sessionId);
    }
    console.log('🧹 Watch Tracker: Cleaned up all sessions');
  }
}