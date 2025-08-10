import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface XPTransaction {
  userId: string;
  amount: number;
  source: 'video_watch' | 'video_like' | 'video_comment' | 'daily_bonus';
  videoId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface VideoEngagement {
  videoId: string;
  userId: string;
  watchTime: number;
  liked: boolean;
  commented: boolean;
  completed: boolean;
  xpEarned: number;
  timestamp: Date;
}

export class FirestoreService {
  // User Management
  static async updateUserXP(userId: string, xpAmount: number, source: XPTransaction['source'], metadata?: Record<string, any>) {
    const userRef = doc(db, 'users', userId);
    const xpTransactionRef = collection(db, 'xp_transactions');
    
    // Update user's total XP
    await updateDoc(userRef, {
      totalXP: increment(xpAmount),
      lastActivity: serverTimestamp(),
    });
    
    // Record XP transaction
    await addDoc(xpTransactionRef, {
      userId,
      amount: xpAmount,
      source,
      timestamp: serverTimestamp(),
      metadata: metadata || {},
    });
    
    // Check for level up
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    if (userData) {
      const newLevel = Math.floor(userData.totalXP / 1000) + 1;
      if (newLevel > userData.level) {
        await updateDoc(userRef, { level: newLevel });
        return { leveledUp: true, newLevel };
      }
    }
    
    return { leveledUp: false };
  }
  
  // Video Engagement
  static async recordVideoEngagement(engagement: VideoEngagement) {
    const engagementRef = collection(db, 'video_engagements');
    await addDoc(engagementRef, {
      ...engagement,
      timestamp: serverTimestamp(),
    });
    
    // Award XP based on engagement
    let xpAmount = 0;
    if (engagement.watchTime > 30) xpAmount += 10; // Base watch XP
    if (engagement.liked) xpAmount += 5;
    if (engagement.commented) xpAmount += 15;
    if (engagement.completed) xpAmount += 25;
    
    if (xpAmount > 0) {
      await this.updateUserXP(engagement.userId, xpAmount, 'video_watch', {
        videoId: engagement.videoId,
        watchTime: engagement.watchTime,
      });
    }
  }
  
  // Leaderboard
  static async getLeaderboard(limitCount: number = 50) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('totalXP', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      userId: doc.id,
      ...doc.data(),
    }));
  }
  
  // User Stats
  static async getUserStats(userId: string) {
    const xpTransactionsRef = collection(db, 'xp_transactions');
    const q = query(
      xpTransactionsRef, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => doc.data());
    
    return {
      totalTransactions: transactions.length,
      recentTransactions: transactions.slice(0, 10),
      xpSources: transactions.reduce((acc, transaction) => {
        acc[transaction.source] = (acc[transaction.source] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
