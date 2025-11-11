import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  communityId?: string;
  communityName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  likes: number;
  comments: number;
  imageUrl?: string;
  tags?: string[];
}

export interface FeedOptions {
  limitCount?: number;
  communityId?: string;
  userId?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
}

/**
 * Get top community posts from the Firestore /posts collection
 *
 * This function queries the root-level /posts collection which has public read access
 * as defined in firestore.rules. It supports filtering by community, user, and sorting.
 *
 * @param options - Options for filtering and sorting posts
 * @returns Promise resolving to an array of Post objects
 */
export async function getTopCommunityPosts(options: FeedOptions = {}): Promise<Post[]> {
  const {
    limitCount = 50,
    communityId,
    userId,
    sortBy = 'recent'
  } = options;

  try {
    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Filter by community if specified
    if (communityId) {
      constraints.push(where('communityId', '==', communityId));
    }

    // Filter by user if specified
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        constraints.push(orderBy('likes', 'desc'));
        break;
      case 'trending':
        // Trending could be based on a composite score
        // For now, use a combination of recent + popular
        constraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'recent':
      default:
        constraints.push(orderBy('createdAt', 'desc'));
        break;
    }

    // Add limit
    constraints.push(limit(limitCount));

    // Query the posts collection at the root of Firestore
    const postsQuery = query(collection(db, 'posts'), ...constraints);
    const snapshot = await getDocs(postsQuery);

    // Map the documents to Post objects
    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));

    return posts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
}

/**
 * Get posts from a specific community using collectionGroup
 * This is an alternative approach for nested posts structure
 */
export async function getCommunityPostsNested(communityId: string, limitCount: number = 50): Promise<Post[]> {
  try {
    const postsQuery = query(
      collection(db, 'communities', communityId, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(postsQuery);

    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));

    return posts;
  } catch (error) {
    console.error('Error fetching nested community posts:', error);
    throw error;
  }
}
