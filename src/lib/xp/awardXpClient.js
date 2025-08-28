/**
 * Client-side XP Award Wrapper
 * Handles UI events, toasts, offline queue, and retry logic
 */

import { awardXpOnce, awardVideoCompletionXp, awardShareXp, awardReferralXp } from './awardXpTransaction';
import authSingleton from '../authSingleton';

/**
 * Show user-friendly toast notification
 */
function showToast(message, type = 'info') {
  console.log(`🍞 Toast [${type}]: ${message}`);
  
  // Integrate with your toast system (e.g., react-hot-toast, or custom)
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    // Fallback to console for now
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${emoji} ${message}`);
  }
}

/**
 * Dispatch XP updated event to the browser
 */
function dispatchXpUpdatedEvent(data) {
  const event = new CustomEvent('xpUpdated', {
    detail: {
      earnedXp: data.awardedXp,
      totalXp: data.newTotalXp,
      prevXp: data.prevTotalXp,
      levelUp: data.levelUp,
      newLevel: data.newLevel,
      oldLevel: data.oldLevel
    }
  });
  
  window.dispatchEvent(event);
  console.log(`📡 window xpUpdated fired:`, event.detail);

  // Also dispatch level up event if applicable
  if (data.levelUp) {
    const levelUpEvent = new CustomEvent('levelUp', {
      detail: {
        oldLevel: data.oldLevel,
        newLevel: data.newLevel,
        totalXp: data.newTotalXp
      }
    });
    window.dispatchEvent(levelUpEvent);
    console.log(`🆙 levelUp event fired: old=${data.oldLevel} new=${data.newLevel}`);
  }
}

/**
 * Simple offline queue (localStorage-based)
 */
class OfflineXpQueue {
  constructor() {
    this.storageKey = 'wiz_xp_offline_queue';
    this.processing = false;
  }

  add(operation) {
    try {
      const queue = this.getQueue();
      const item = {
        ...operation,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        attempts: 0
      };
      queue.push(item);
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
      console.log(`💾 Added to offline queue:`, item);
    } catch (error) {
      console.error('❌ Failed to save to offline queue:', error);
    }
  }

  getQueue() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to read offline queue:', error);
      return [];
    }
  }

  async processQueue() {
    if (this.processing) return;
    
    this.processing = true;
    const queue = this.getQueue();
    
    if (queue.length === 0) {
      this.processing = false;
      return;
    }

    console.log(`🔄 Processing offline queue: ${queue.length} items`);
    
    const remaining = [];
    
    for (const item of queue) {
      try {
        item.attempts++;
        
        let result;
        switch (item.type) {
          case 'video_completion':
            result = await awardVideoCompletionXp(item.userId, item.videoId, item.baseXp, item.watchTimeSeconds);
            break;
          case 'share':
            result = await awardShareXp(item.userId, item.sharedVideoId);
            break;
          case 'referral':
            result = await awardReferralXp(item.userId, item.referredUserId);
            break;
          default:
            console.error('❌ Unknown offline queue item type:', item.type);
            continue;
        }

        if (result.success) {
          console.log(`✅ Offline queue item processed: ${item.id}`);
          dispatchXpUpdatedEvent(result);
          showToast(`Earned ${result.awardedXp} XP (offline sync)`, 'success');
        } else {
          // Keep in queue if not permanent failure and under retry limit
          if (item.attempts < 3 && result.reason !== 'already_completed') {
            remaining.push(item);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to process offline item ${item.id}:`, error);
        if (item.attempts < 3) {
          remaining.push(item);
        }
      }
    }

    // Update queue with remaining items
    localStorage.setItem(this.storageKey, JSON.stringify(remaining));
    this.processing = false;
  }

  clear() {
    localStorage.removeItem(this.storageKey);
    console.log('🗑️ Offline queue cleared');
  }
}

const offlineQueue = new OfflineXpQueue();

// Process queue when coming back online
window.addEventListener('online', () => {
  console.log('🌐 Back online - processing XP queue');
  offlineQueue.processQueue();
});

/**
 * Award XP for video completion with full client-side handling
 */
export async function awardVideoCompletion(videoId, baseXp = 10, watchTimeSeconds = 0) {
  const userId = authSingleton.getUserId();
  if (!userId) {
    console.warn('⚠️ No authenticated user for XP award');
    showToast('Please sign in to earn XP', 'error');
    return { success: false, reason: 'not_authenticated' };
  }

  console.log(`🎯 awardVideoCompletion: userId=${userId} videoId=${videoId} baseXp=${baseXp}`);

  // Check if offline
  if (!navigator.onLine) {
    console.log('📱 Offline - adding to queue');
    offlineQueue.add({
      type: 'video_completion',
      userId,
      videoId,
      baseXp,
      watchTimeSeconds
    });
    showToast('XP will be awarded when back online', 'info');
    return { success: false, reason: 'offline_queued' };
  }

  try {
    const result = await awardVideoCompletionXp(userId, videoId, baseXp, watchTimeSeconds);

    if (result.success) {
      dispatchXpUpdatedEvent(result);
      showToast(`+${result.awardedXp} XP earned!`, 'success');
      
      if (result.levelUp) {
        showToast(`🎉 Level up! You're now level ${result.newLevel}!`, 'success');
      }
    } else {
      // Handle specific failure reasons
      switch (result.reason) {
        case 'already_completed':
          showToast('You already completed this video', 'info');
          break;
        case 'daily_cap_reached':
          showToast('Daily XP limit reached! Come back tomorrow', 'warning');
          break;
        case 'transaction_failed':
          showToast('Failed to award XP - trying again later', 'error');
          // Add to offline queue for retry
          offlineQueue.add({
            type: 'video_completion',
            userId,
            videoId,
            baseXp,
            watchTimeSeconds
          });
          break;
        default:
          showToast('Could not award XP', 'error');
      }
    }

    return result;

  } catch (error) {
    console.error('❌ Client XP award error:', error);
    showToast('Error awarding XP', 'error');
    
    // Add to offline queue as fallback
    offlineQueue.add({
      type: 'video_completion',
      userId,
      videoId,
      baseXp,
      watchTimeSeconds
    });

    return { success: false, reason: 'client_error', error };
  }
}

/**
 * Award XP for sharing content
 */
export async function awardShare(sharedVideoId) {
  const userId = authSingleton.getUserId();
  if (!userId) {
    showToast('Please sign in to earn sharing XP', 'error');
    return { success: false, reason: 'not_authenticated' };
  }

  if (!navigator.onLine) {
    offlineQueue.add({
      type: 'share',
      userId,
      sharedVideoId
    });
    showToast('Sharing XP will be awarded when back online', 'info');
    return { success: false, reason: 'offline_queued' };
  }

  try {
    const result = await awardShareXp(userId, sharedVideoId);
    
    if (result.success) {
      dispatchXpUpdatedEvent(result);
      showToast(`+${result.awardedXp} XP for sharing!`, 'success');
    }

    return result;
  } catch (error) {
    console.error('❌ Share XP error:', error);
    showToast('Error awarding sharing XP', 'error');
    return { success: false, reason: 'client_error', error };
  }
}

/**
 * Award XP for successful referral
 */
export async function awardReferral(referredUserId) {
  const userId = authSingleton.getUserId();
  if (!userId) {
    showToast('Please sign in to earn referral XP', 'error');
    return { success: false, reason: 'not_authenticated' };
  }

  if (!navigator.onLine) {
    offlineQueue.add({
      type: 'referral',
      userId,
      referredUserId
    });
    showToast('Referral XP will be awarded when back online', 'info');
    return { success: false, reason: 'offline_queued' };
  }

  try {
    const result = await awardReferralXp(userId, referredUserId);
    
    if (result.success) {
      dispatchXpUpdatedEvent(result);
      showToast(`+${result.awardedXp} XP for referral!`, 'success');
    }

    return result;
  } catch (error) {
    console.error('❌ Referral XP error:', error);
    showToast('Error awarding referral XP', 'error');
    return { success: false, reason: 'client_error', error };
  }
}

/**
 * Get offline queue status
 */
export function getOfflineQueueStatus() {
  return {
    items: offlineQueue.getQueue(),
    count: offlineQueue.getQueue().length
  };
}

/**
 * Manually process offline queue
 */
export async function processOfflineQueue() {
  return offlineQueue.processQueue();
}

/**
 * Clear offline queue
 */
export function clearOfflineQueue() {
  return offlineQueue.clear();
}

export { offlineQueue };