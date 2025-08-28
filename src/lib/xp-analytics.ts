import { db, analytics } from './firebase';
import { doc, collection, updateDoc, serverTimestamp, addDoc, query, where, getDocs } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';

interface LevelUpEvent {
  userId: string;
  newLevel: number;
  previousLevel: number;
  totalXP: number;
  timestamp: Date;
  source?: 'watch_time' | 'share' | 'referral';
  triggerAirdrop?: boolean;
}

interface AirdropEligibility {
  level: number;
  eligible: boolean;
  reason?: string;
  amount?: number;
  currency?: string;
}

export class XPAnalytics {
  /**
   * Log level up event for analytics and airdrop triggers
   */
  static async logLevelUp(levelUpData: LevelUpEvent): Promise<void> {
    try {
      const { userId, newLevel, previousLevel, totalXP, source } = levelUpData;

      // Log to /users/{uid}/levelUps collection for analytics
      const levelUpRef = doc(db, `users/${userId}/levelUps`, `level_${newLevel}`);
      await updateDoc(levelUpRef, {
        level: newLevel,
        previousLevel,
        totalXP,
        timestamp: serverTimestamp(),
        source: source || 'unknown',
        xpEarned: totalXP,
        triggerAirdrop: [3, 5, 7, 10].includes(newLevel) // Trigger airdrops at milestone levels
      }, { merge: true });

      // Log to Firebase Analytics
      if (analytics) {
        logEvent(analytics, 'level_up', {
          level: newLevel,
          previous_level: previousLevel,
          total_xp: totalXP,
          source: source || 'unknown'
        });
      }

      // Check airdrop eligibility
      const airdropEligibility = await this.checkAirdropEligibility(userId, newLevel);
      if (airdropEligibility.eligible) {
        await this.triggerAirdrop(userId, newLevel, airdropEligibility);
      }

      console.log(`📊 Level up logged for user ${userId}: Level ${previousLevel} → ${newLevel}`);
    } catch (error) {
      console.error('Error logging level up:', error);
    }
  }

  /**
   * Check if user is eligible for airdrop at this level
   */
  static async checkAirdropEligibility(userId: string, level: number): Promise<AirdropEligibility> {
    try {
      // Airdrop levels: 3, 5, 7, 10
      const airdropLevels = [3, 5, 7, 10];
      
      if (!airdropLevels.includes(level)) {
        return { level, eligible: false, reason: 'Level not eligible for airdrop' };
      }

      // Check if airdrop already claimed for this level
      const airdropQuery = query(
        collection(db, `users/${userId}/airdrops`),
        where('level', '==', level),
        where('status', '==', 'completed')
      );
      
      const existingAirdrops = await getDocs(airdropQuery);
      if (!existingAirdrops.empty) {
        return { level, eligible: false, reason: 'Airdrop already claimed for this level' };
      }

      // Calculate airdrop amount based on level
      const airdropAmounts = {
        3: 10,    // $10 equivalent
        5: 25,    // $25 equivalent  
        7: 50,    // $50 equivalent
        10: 100   // $100 equivalent
      };

      const amount = airdropAmounts[level as keyof typeof airdropAmounts];
      
      return {
        level,
        eligible: true,
        amount,
        currency: 'USDC' // or whatever token you're using
      };
    } catch (error) {
      console.error('Error checking airdrop eligibility:', error);
      return { level, eligible: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Trigger airdrop for eligible user
   */
  static async triggerAirdrop(
    userId: string, 
    level: number, 
    eligibility: AirdropEligibility
  ): Promise<void> {
    try {
      if (!eligibility.eligible || !eligibility.amount) {
        console.log('User not eligible for airdrop');
        return;
      }

      // Create airdrop record
      const airdropRef = await addDoc(collection(db, `users/${userId}/airdrops`), {
        level,
        amount: eligibility.amount,
        currency: eligibility.currency,
        status: 'pending',
        triggeredAt: serverTimestamp(),
        processedAt: null,
        txHash: null,
        reason: `Level ${level} milestone reward`
      });

      // Log analytics event
      if (analytics) {
        logEvent(analytics, 'airdrop_triggered', {
          level,
          amount: eligibility.amount,
          currency: eligibility.currency,
          user_id: userId
        });
      }

      // Add to airdrop queue for processing
      await addDoc(collection(db, 'airdropQueue'), {
        userId,
        level,
        amount: eligibility.amount,
        currency: eligibility.currency,
        airdropId: airdropRef.id,
        status: 'queued',
        createdAt: serverTimestamp(),
        priority: this.getAirdropPriority(level)
      });

      // Dispatch event for UI notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('airdropTriggered', {
          detail: {
            userId,
            level,
            amount: eligibility.amount,
            currency: eligibility.currency
          }
        }));
      }

      console.log(`💰 Airdrop triggered for user ${userId}: ${eligibility.amount} ${eligibility.currency} for reaching level ${level}`);
    } catch (error) {
      console.error('Error triggering airdrop:', error);
    }
  }

  /**
   * Get airdrop processing priority (higher levels = higher priority)
   */
  private static getAirdropPriority(level: number): number {
    const priorityMap = {
      3: 1,   // Low priority
      5: 2,   // Medium priority
      7: 3,   // High priority
      10: 4   // Highest priority
    };
    return priorityMap[level as keyof typeof priorityMap] || 1;
  }

  /**
   * Log XP earning events for detailed analytics
   */
  static async logXPEarned(
    userId: string,
    source: 'watch_time' | 'completion_bonus' | 'share' | 'referral',
    amount: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Log to daily analytics
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = doc(db, `analytics/daily/${today}/users`, userId);
      
      await updateDoc(analyticsRef, {
        [`${source}XP`]: amount,
        [`${source}Count`]: 1,
        lastUpdated: serverTimestamp(),
        metadata: metadata || {}
      }, { merge: true });

      // Log to Firebase Analytics
      if (analytics) {
        logEvent(analytics, 'xp_earned', {
          source,
          amount,
          user_id: userId,
          ...metadata
        });
      }

      console.log(`📈 XP analytics logged: ${userId} earned ${amount} XP from ${source}`);
    } catch (error) {
      console.error('Error logging XP analytics:', error);
    }
  }

  /**
   * Get user's XP analytics summary
   */
  static async getUserAnalytics(userId: string, days: number = 7): Promise<any> {
    try {
      const analytics = {
        totalXPEarned: 0,
        watchTimeXP: 0,
        shareXP: 0,
        referralXP: 0,
        levelUps: 0,
        airdropsEarned: 0,
        dailyBreakdown: []
      };

      // Get daily analytics for the past N days
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        try {
          const dayRef = doc(db, `analytics/daily/${dateStr}/users`, userId);
          const dayDoc = await getDocs(query(collection(db, `analytics/daily/${dateStr}/users`), where('__name__', '==', userId)));
          
          if (!dayDoc.empty) {
            const data = dayDoc.docs[0].data();
            analytics.dailyBreakdown.push({
              date: dateStr,
              ...data
            });
          }
        } catch (dayError) {
          // Day might not exist, continue
        }
      }

      return analytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      // This would typically be a Cloud Function or server-side query
      // For now, return placeholder data
      return [
        { userId: 'user1', totalXP: 50000, level: 9, rank: 1 },
        { userId: 'user2', totalXP: 35000, level: 8, rank: 2 },
        // ... more users
      ];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }
}