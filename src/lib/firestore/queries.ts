import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Firestore Queries for Community Single-Post Feed
 * Fetches top posts by score (upvotes - downvotes) with pagination
 */

export interface TopPostQuery {
  communityIds?: string[];
  limitCount?: number;
  cursor?: QueryDocumentSnapshot<DocumentData>;
}

export interface Post {
  id: string;
  communityId: string;
  communityName: string;
  communityAvatar: string;
  communityVerified: boolean;
  communityMemberCount: number;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorLevel: number;
  title: string;
  excerpt?: string;
  content?: string;
  media: {
    type: 'video' | 'image' | 'none';
    url?: string;
    videoId?: string;
    thumbnail?: string;
    duration?: string;
  };
  score: number;
  upvotes: number;
  downvotes: number;
  votesCount: number;
  commentsCount: number;
  isPinned: boolean;
  zapsReward?: number;
  createdAt: any;
  updatedAt?: any;
}

/**
 * Fetch top posts by score (server-side ranking)
 * Supports filtering by community IDs and pagination
 */
export async function getTopCommunityPosts({
  communityIds,
  limitCount = 50,
  cursor,
}: TopPostQuery): Promise<{
  posts: Post[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  try {
    const constraints: QueryConstraint[] = [];

    // Filter by community IDs if provided
    if (communityIds && communityIds.length > 0) {
      constraints.push(where('communityId', 'in', communityIds.slice(0, 10))); // Firestore 'in' limit is 10
    }

    // Order by score (descending), pinned status, and recency
    constraints.push(orderBy('isPinned', 'desc'));
    constraints.push(orderBy('score', 'desc'));
    constraints.push(orderBy('createdAt', 'desc'));

    // Pagination cursor
    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    // Limit results
    constraints.push(limit(limitCount));

    // Query posts across all communities using a collection group
    const postsQuery = query(collectionGroup(db, 'posts'), ...constraints);
    let snapshot;
    try {
      snapshot = await getDocs(postsQuery);
    } catch (err: any) {
      // Fallback: if collection group rules/indexes are not deployed, try root collection
      try {
        const rootQuery = query(collection(db, 'posts'), ...constraints);
        snapshot = await getDocs(rootQuery);
      } catch (innerErr: any) {
        console.warn('Posts query failed on collectionGroup and root. Returning empty set.', innerErr?.message || innerErr);
        return { posts: [], lastDoc: null, hasMore: false };
      }
    }

    const posts: Post[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        communityId: data.communityId || '',
        communityName: data.communityName || 'Unknown Community',
        communityAvatar: data.communityAvatar || '',
        communityVerified: data.communityVerified || false,
        communityMemberCount: data.communityMemberCount || 0,
        authorId: data.authorId || '',
        authorName: data.authorName || 'Unknown',
        authorUsername: data.authorUsername || 'unknown',
        authorAvatar: data.authorAvatar || '',
        authorLevel: data.authorLevel || 1,
        title: data.title || 'Untitled Post',
        excerpt: data.excerpt || '',
        content: data.content || '',
        media: {
          type: data.media?.type || 'none',
          url: data.media?.url || '',
          videoId: data.media?.videoId || '',
          thumbnail: data.media?.thumbnail || '',
          duration: data.media?.duration || '',
        },
        score: data.score || 0,
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        votesCount: data.votesCount || 0,
        commentsCount: data.commentsCount || 0,
        isPinned: data.isPinned || false,
        zapsReward: data.zapsReward || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    const hasMore = snapshot.docs.length === limitCount;

    return { posts, lastDoc, hasMore };
  } catch (error: any) {
    console.error('Error fetching top community posts:', error?.message || error);
    // Graceful fallback: return empty to avoid UI hard-fail (permissions/index issues)
    return { posts: [], lastDoc: null, hasMore: false };
  }
}

/**
 * Fetch posts from all communities (for global feed)
 */
export async function getAllTopPosts(
  limitCount: number = 50,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  posts: Post[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  return getTopCommunityPosts({ limitCount, cursor });
}

export type FeedSort = 'hot' | 'new' | 'discussed' | 'xp';

/**
 * Generic sorted posts with pagination
 */
export async function getPostsBySort(
  sort: FeedSort,
  limitCount: number = 50,
  cursor?: QueryDocumentSnapshot<DocumentData>,
  communityIds?: string[],
): Promise<{ posts: Post[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null; hasMore: boolean }> {
  const constraints: QueryConstraint[] = [];

  if (communityIds && communityIds.length > 0) {
    constraints.push(where('communityId', 'in', communityIds.slice(0, 10)));
  }

  // Sorting strategies
  switch (sort) {
    case 'new':
      constraints.push(orderBy('createdAt', 'desc'));
      break;
    case 'discussed':
      constraints.push(orderBy('commentsCount', 'desc'));
      constraints.push(orderBy('createdAt', 'desc'));
      break;
    case 'xp':
      constraints.push(orderBy('zapsReward', 'desc'));
      constraints.push(orderBy('createdAt', 'desc'));
      break;
    case 'hot':
    default:
      constraints.push(orderBy('isPinned', 'desc'));
      constraints.push(orderBy('score', 'desc'));
      constraints.push(orderBy('createdAt', 'desc'));
      break;
  }

  if (cursor) constraints.push(startAfter(cursor));
  constraints.push(limit(limitCount));

  // Try collection group, then root, same as other helpers
  const q1 = query(collectionGroup(db, 'posts'), ...constraints);
  try {
    const snap = await getDocs(q1);
    const posts = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as Post[];
    const lastDoc = snap.docs[snap.docs.length - 1] || null;
    const hasMore = snap.docs.length === limitCount;
    return { posts, lastDoc, hasMore };
  } catch (_) {
    try {
      const q2 = query(collection(db, 'posts'), ...constraints);
      const snap = await getDocs(q2);
      const posts = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as Post[];
      const lastDoc = snap.docs[snap.docs.length - 1] || null;
      const hasMore = snap.docs.length === limitCount;
      return { posts, lastDoc, hasMore };
    } catch (err) {
      console.warn('getPostsBySort failed; returning empty', err);
      return { posts: [], lastDoc: null, hasMore: false };
    }
  }
}

/**
 * Fetch posts from specific communities
 */
export async function getTopPostsByCommunities(
  communityIds: string[],
  limitCount: number = 50,
  cursor?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  posts: Post[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  return getTopCommunityPosts({ communityIds, limitCount, cursor });
}
