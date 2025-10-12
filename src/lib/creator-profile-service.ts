import { db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { CreatorService } from './creator-service';

/**
 * Enhanced Creator Profile Service for Public Profile V2
 *
 * Supports username-based lookups and fetches comprehensive creator data
 * from both `users` and `creators` collections
 */

export interface CreatorPublicProfile {
  // Core Identity
  id: string;
  username: string; // with @ prefix
  displayName: string;
  avatar: string;
  banner?: string;
  bio: string;

  // Status & Level
  level: number;
  totalZaps: number;
  verified: boolean;
  role: 'user' | 'creator' | 'admin';

  // Category & Content
  category: string;

  // Social Links
  socials?: {
    website?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    discord?: string;
  };

  // Stats
  stats: {
    followers: number;
    totalVideos: number;
    communities: number;
    tipsReceived?: number;
  };

  // Creator-specific data (if user is a creator)
  creatorData?: {
    channelId: string;
    channelName: string;
    subscriberCount: string;
    onboardingComplete: boolean;
    primaryCategory: string;
  };
}

export interface FollowerRelation {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export class CreatorProfileService {
  /**
   * Get creator profile by username (e.g., '@facelessavatars')
   * If username doesn't start with @, assumes it's a UID and falls back to ID lookup
   */
  static async getProfileByUsername(username: string): Promise<CreatorPublicProfile | null> {
    try {
      console.log('🔍 Looking up creator by username:', username);

      // Check if this looks like a UID (no @ prefix and length > 15)
      // Firebase UIDs are 28 characters long
      if (!username.startsWith('@') && username.length > 15) {
        console.log('🔄 Username looks like a UID, falling back to ID lookup');
        return this.getProfileById(username);
      }

      // Normalize username (ensure @ prefix)
      const normalizedUsername = username.startsWith('@') ? username : `@${username}`;

      // Query users collection by username
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '==', normalizedUsername)
      );

      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        console.log('⚠️ No user found with username:', normalizedUsername);
        // Try as ID fallback
        console.log('🔄 Attempting ID lookup as fallback');
        return this.getProfileById(username);
      }

      // Get first matching user
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      console.log('✅ User found:', userId, userData);

      // Fetch additional creator data if user is a creator
      let creatorData = null;
      if (userData.role === 'creator' || userData.hasCreatedContent) {
        const creatorProfile = await CreatorService.getCreatorProfile(userId);
        if (creatorProfile) {
          creatorData = {
            channelId: creatorProfile.channelId,
            channelName: creatorProfile.channelName,
            subscriberCount: creatorProfile.subscriberCount || '0',
            onboardingComplete: creatorProfile.onboardingComplete,
            primaryCategory: creatorProfile.primaryCategory
          };
        }
      }

      // Count followers
      const followersCount = await this.getFollowerCount(userId);

      // Count videos
      const videosCount = await this.getCreatorVideoCount(userId);

      // Fetch YouTube banner if available
      let youtubeBanner = userData.bannerImage;
      if (creatorData?.channelId && userData.youtubeProfile?.thumbnailUrl) {
        // Try to fetch YouTube channel banner from stored profile data
        const youtubeProfile = userData.youtubeProfile;
        if (youtubeProfile.bannerImageUrl) {
          youtubeBanner = youtubeProfile.bannerImageUrl;
        } else if (youtubeProfile.thumbnailUrl) {
          // Use channel thumbnail as fallback
          youtubeBanner = youtubeProfile.thumbnailUrl;
        }
      }

      // Build profile
      const profile: CreatorPublicProfile = {
        id: userId,
        username: userData.username || normalizedUsername,
        displayName: userData.displayName || 'Creator',
        avatar: userData.photoURL || userData.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        banner: youtubeBanner,
        bio: userData.bio || '',
        level: userData.level || 1,
        totalZaps: userData.totalXP || 0,
        verified: userData.verified || false,
        role: userData.role || 'user',
        category: creatorData?.primaryCategory || userData.category || 'General',
        socials: {
          website: userData.website,
          twitter: userData.twitter || userData.twitterHandle,
          youtube: userData.youtubeChannel,
          instagram: userData.instagram,
          discord: userData.discord
        },
        stats: {
          followers: followersCount,
          totalVideos: videosCount,
          communities: userData.communitiesJoined?.length || 0,
          tipsReceived: userData.totalTipsReceived || 0
        },
        creatorData
      };

      console.log('📋 Built profile:', profile);
      return profile;

    } catch (error) {
      console.error('❌ Error getting profile by username:', error);
      return null;
    }
  }

  /**
   * Get creator profile by user ID
   */
  static async getProfileById(userId: string): Promise<CreatorPublicProfile | null> {
    try {
      console.log('🔍 Looking up creator by ID:', userId);

      const userDoc = await getDoc(doc(db, 'users', userId));

      if (!userDoc.exists()) {
        console.log('⚠️ No user found with ID:', userId);
        return null;
      }

      const userData = userDoc.data();

      // Fetch creator data if applicable
      let creatorData = null;
      if (userData.role === 'creator' || userData.hasCreatedContent) {
        const creatorProfile = await CreatorService.getCreatorProfile(userId);
        if (creatorProfile) {
          creatorData = {
            channelId: creatorProfile.channelId,
            channelName: creatorProfile.channelName,
            subscriberCount: creatorProfile.subscriberCount || '0',
            onboardingComplete: creatorProfile.onboardingComplete,
            primaryCategory: creatorProfile.primaryCategory
          };
        }
      }

      const followersCount = await this.getFollowerCount(userId);
      const videosCount = await this.getCreatorVideoCount(userId);

      // Fetch YouTube banner if available
      let youtubeBanner = userData.bannerImage;
      if (creatorData?.channelId && userData.youtubeProfile?.thumbnailUrl) {
        // Try to fetch YouTube channel banner from stored profile data
        const youtubeProfile = userData.youtubeProfile;
        if (youtubeProfile.bannerImageUrl) {
          youtubeBanner = youtubeProfile.bannerImageUrl;
        } else if (youtubeProfile.thumbnailUrl) {
          // Use channel thumbnail as fallback
          youtubeBanner = youtubeProfile.thumbnailUrl;
        }
      }

      const profile: CreatorPublicProfile = {
        id: userId,
        username: userData.username || `@user${userId.slice(0, 8)}`,
        displayName: userData.displayName || 'Creator',
        avatar: userData.photoURL || userData.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        banner: youtubeBanner,
        bio: userData.bio || '',
        level: userData.level || 1,
        totalZaps: userData.totalXP || 0,
        verified: userData.verified || false,
        role: userData.role || 'user',
        category: creatorData?.primaryCategory || userData.category || 'General',
        socials: {
          website: userData.website,
          twitter: userData.twitter || userData.twitterHandle,
          youtube: userData.youtubeChannel,
          instagram: userData.instagram,
          discord: userData.discord
        },
        stats: {
          followers: followersCount,
          totalVideos: videosCount,
          communities: userData.communitiesJoined?.length || 0,
          tipsReceived: userData.totalTipsReceived || 0
        },
        creatorData
      };

      return profile;

    } catch (error) {
      console.error('❌ Error getting profile by ID:', error);
      return null;
    }
  }

  /**
   * Get follower count for a user
   */
  static async getFollowerCount(userId: string): Promise<number> {
    try {
      const followersQuery = query(
        collection(db, 'followers'),
        where('followingId', '==', userId)
      );

      const snapshot = await getDocs(followersQuery);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error getting follower count:', error);
      return 0;
    }
  }

  /**
   * Get video count for a creator
   */
  static async getCreatorVideoCount(userId: string): Promise<number> {
    try {
      const videosQuery = query(
        collection(db, 'creatorVideos'),
        where('creatorId', '==', userId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(videosQuery);
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error getting video count:', error);
      return 0;
    }
  }

  /**
   * Check if user A is following user B
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const followQuery = query(
        collection(db, 'followers'),
        where('followerId', '==', followerId),
        where('followingId', '==', followingId)
      );

      const snapshot = await getDocs(followQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Follow a creator
   */
  static async followCreator(followerId: string, followingId: string): Promise<void> {
    try {
      console.log('➕ Following creator:', { followerId, followingId });

      // Create follower relation
      const followId = `${followerId}_${followingId}`;
      await setDoc(doc(db, 'followers', followId), {
        followerId,
        followingId,
        createdAt: serverTimestamp()
      });

      // Update follower counts
      await Promise.all([
        // Increment following count for follower
        setDoc(
          doc(db, 'users', followerId),
          { followingCount: increment(1) },
          { merge: true }
        ),
        // Increment followers count for creator
        setDoc(
          doc(db, 'users', followingId),
          { followersCount: increment(1) },
          { merge: true }
        )
      ]);

      console.log('✅ Successfully followed creator');
    } catch (error) {
      console.error('❌ Error following creator:', error);
      throw error;
    }
  }

  /**
   * Unfollow a creator
   */
  static async unfollowCreator(followerId: string, followingId: string): Promise<void> {
    try {
      console.log('➖ Unfollowing creator:', { followerId, followingId });

      // Remove follower relation
      const followId = `${followerId}_${followingId}`;
      const followRef = doc(db, 'followers', followId);
      const followDoc = await getDoc(followRef);

      if (followDoc.exists()) {
        await deleteDoc(followRef);

        // Update follower counts
        await Promise.all([
          setDoc(
            doc(db, 'users', followerId),
            { followingCount: increment(-1) },
            { merge: true }
          ),
          setDoc(
            doc(db, 'users', followingId),
            { followersCount: increment(-1) },
            { merge: true }
          )
        ]);
      }

      console.log('✅ Successfully unfollowed creator');
    } catch (error) {
      console.error('❌ Error unfollowing creator:', error);
      throw error;
    }
  }
}
