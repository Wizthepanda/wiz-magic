import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * User Profile Data Structure
 * Consistent interface for user profile information
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string;
  level: number;
  totalXP: number;
  youtubeConnected: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * User Profile Service
 * Centralized service for fetching and caching user profile data
 * Ensures posts always display the latest profile picture
 */
class UserProfileService {
  private profileCache: Map<string, { data: UserProfile; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get user profile with caching
   * First checks cache, then Firestore, with fallback to defaults
   */
  async getUserProfile(uid: string, firebaseAuthData?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  }): Promise<UserProfile> {
    // Check cache first
    const cached = this.profileCache.get(uid);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('✅ Using cached user profile for:', uid);
      return cached.data;
    }

    try {
      // Fetch from Firestore
      console.log('📥 Fetching fresh user profile from Firestore for:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();

        const profile: UserProfile = {
          uid,
          displayName: data.displayName || firebaseAuthData?.displayName || 'Anonymous',
          email: data.email || firebaseAuthData?.email || null,
          photoURL: data.photoURL || firebaseAuthData?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
          level: data.level || 1,
          totalXP: data.totalXP || data.currentXP || 0,
          youtubeConnected: data.youtubeConnected || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
        };

        // Cache the profile
        this.profileCache.set(uid, {
          data: profile,
          timestamp: Date.now(),
        });

        console.log('✅ User profile fetched and cached:', {
          displayName: profile.displayName,
          hasPhotoURL: !!profile.photoURL,
        });

        return profile;
      }
    } catch (error) {
      console.warn('⚠️ Error fetching user profile from Firestore:', error);
    }

    // Fallback to Firebase Auth data if Firestore fails
    const fallbackProfile: UserProfile = {
      uid,
      displayName: firebaseAuthData?.displayName || 'Anonymous',
      email: firebaseAuthData?.email || null,
      photoURL: firebaseAuthData?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      level: 1,
      totalXP: 0,
      youtubeConnected: false,
      createdAt: new Date(),
    };

    console.log('⚠️ Using fallback profile data for:', uid);
    return fallbackProfile;
  }

  /**
   * Update user profile in Firestore and clear cache
   */
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), updates, { merge: true });

      // Clear cache to force fresh fetch next time
      this.profileCache.delete(uid);

      console.log('✅ User profile updated in Firestore');
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Clear profile cache for a specific user or all users
   */
  clearCache(uid?: string): void {
    if (uid) {
      this.profileCache.delete(uid);
      console.log('🗑️ Cleared profile cache for:', uid);
    } else {
      this.profileCache.clear();
      console.log('🗑️ Cleared all profile caches');
    }
  }

  /**
   * Preload user profile into cache (useful for optimization)
   */
  async preloadProfile(uid: string, firebaseAuthData?: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  }): Promise<void> {
    await this.getUserProfile(uid, firebaseAuthData);
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();
