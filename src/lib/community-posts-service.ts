import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  content: string;
  imageUrl?: string; // Firebase Storage image URL
  embedUrl?: string;
  embedPreview?: {
    title: string;
    thumbnail: string;
    provider: string;
  };
  attachments?: Array<{
    type: 'image' | 'video';
    url: string;
    name?: string;
  }>;
  isPinned: boolean;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  reactions: Record<string, number>;
  userReactions: string[];
  commentCount: number;
  replies?: Reply[];
  createdAt: any;
  updatedAt?: any;
}

export interface Reply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  content: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  createdAt: any;
}

export interface CreatePostData {
  content: string;
  imageUrl?: string; // Firebase Storage image URL
  embedUrl?: string;
  embedPreview?: {
    title: string;
    thumbnail: string;
    provider: string;
  };
  attachments?: Array<{
    type: 'image' | 'video';
    url: string;
    name?: string;
  }>;
}

/**
 * Community Posts Service
 * Handles all Firebase operations for community posts
 */
class CommunityPostsService {
  private getPostsCollectionRef(communityId: string) {
    return collection(db, 'communities', communityId, 'posts');
  }

  /**
   * Create a new community post
   */
  async createPost(
    communityId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    userLevel: number,
    data: CreatePostData
  ): Promise<CommunityPost> {
    const postsRef = this.getPostsCollectionRef(communityId);

    const postData = {
      communityId,
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar,
      authorLevel: userLevel,
      content: data.content,
      imageUrl: data.imageUrl || null,
      embedUrl: data.embedUrl || null,
      embedPreview: data.embedPreview || null,
      attachments: data.attachments || [],
      isPinned: false,
      upvotes: 0,
      downvotes: 0,
      reactions: {},
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(postsRef, postData);

    return {
      id: docRef.id,
      ...postData,
      userVote: null,
      userReactions: [],
      replies: [],
    } as CommunityPost;
  }

  /**
   * Fetch all posts for a community (one-time fetch)
   */
  async getPosts(communityId: string, currentUserId?: string): Promise<CommunityPost[]> {
    const postsRef = this.getPostsCollectionRef(communityId);
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const posts: CommunityPost[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Fetch user's vote status if logged in
      let userVote: 'up' | 'down' | null = null;
      let userReactions: string[] = [];

      if (currentUserId) {
        // Check user's vote in votes subcollection
        const voteDoc = await getDoc(
          doc(db, 'communities', communityId, 'posts', docSnap.id, 'votes', currentUserId)
        );
        if (voteDoc.exists()) {
          userVote = voteDoc.data().vote as 'up' | 'down';
        }

        // Check user's reactions
        const reactionsDoc = await getDoc(
          doc(db, 'communities', communityId, 'posts', docSnap.id, 'userReactions', currentUserId)
        );
        if (reactionsDoc.exists()) {
          userReactions = reactionsDoc.data().reactions || [];
        }
      }

      // Fetch replies
      const repliesRef = collection(db, 'communities', communityId, 'posts', docSnap.id, 'replies');
      const repliesQuery = query(repliesRef, orderBy('createdAt', 'asc'));
      const repliesSnapshot = await getDocs(repliesQuery);

      const replies: Reply[] = repliesSnapshot.docs.map((replyDoc) => ({
        id: replyDoc.id,
        ...replyDoc.data(),
      })) as Reply[];

      posts.push({
        id: docSnap.id,
        ...data,
        userVote,
        userReactions,
        replies,
      } as CommunityPost);
    }

    return posts;
  }

  /**
   * Subscribe to real-time posts updates
   */
  subscribeToPosts(
    communityId: string,
    currentUserId: string | undefined,
    callback: (posts: CommunityPost[]) => void
  ): Unsubscribe {
    const postsRef = this.getPostsCollectionRef(communityId);
    const q = query(postsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, async (snapshot) => {
      const posts: CommunityPost[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Fetch user's vote status if logged in
        let userVote: 'up' | 'down' | null = null;
        let userReactions: string[] = [];

        if (currentUserId) {
          // Check user's vote in votes subcollection
          const voteDoc = await getDoc(
            doc(db, 'communities', communityId, 'posts', docSnap.id, 'votes', currentUserId)
          );
          if (voteDoc.exists()) {
            userVote = voteDoc.data().vote as 'up' | 'down';
          }

          // Check user's reactions
          const reactionsDoc = await getDoc(
            doc(db, 'communities', communityId, 'posts', docSnap.id, 'userReactions', currentUserId)
          );
          if (reactionsDoc.exists()) {
            userReactions = reactionsDoc.data().reactions || [];
          }
        }

        // Fetch replies
        const repliesRef = collection(db, 'communities', communityId, 'posts', docSnap.id, 'replies');
        const repliesQuery = query(repliesRef, orderBy('createdAt', 'asc'));
        const repliesSnapshot = await getDocs(repliesQuery);

        const replies: Reply[] = repliesSnapshot.docs.map((replyDoc) => ({
          id: replyDoc.id,
          ...replyDoc.data(),
        })) as Reply[];

        posts.push({
          id: docSnap.id,
          ...data,
          userVote,
          userReactions,
          replies,
        } as CommunityPost);
      }

      callback(posts);
    });
  }

  /**
   * Pin a post (with validation for max 3 pins)
   */
  async pinPost(communityId: string, postId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    const postsRef = this.getPostsCollectionRef(communityId);

    // Check current pinned posts count
    const pinnedQuery = query(postsRef, where('isPinned', '==', true));
    const pinnedSnapshot = await getDocs(pinnedQuery);

    // Check if post is already pinned
    const postDoc = await getDoc(doc(db, 'communities', communityId, 'posts', postId));
    if (!postDoc.exists()) {
      return { success: false, message: 'Post not found' };
    }

    const postData = postDoc.data();

    // Check authorization
    if (postData.authorId !== userId) {
      // Check if user is community creator/mod
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (!communityDoc.exists() || communityDoc.data().creatorId !== userId) {
        return { success: false, message: 'Unauthorized' };
      }
    }

    if (postData.isPinned) {
      // Unpin the post
      await updateDoc(doc(db, 'communities', communityId, 'posts', postId), {
        isPinned: false,
        updatedAt: serverTimestamp(),
      });
      return { success: true, message: 'Post unpinned' };
    }

    // Check pin limit
    if (pinnedSnapshot.size >= 3) {
      return { success: false, message: 'You can only pin up to 3 posts' };
    }

    // Pin the post
    await updateDoc(doc(db, 'communities', communityId, 'posts', postId), {
      isPinned: true,
      updatedAt: serverTimestamp(),
    });

    return { success: true, message: 'Post pinned successfully' };
  }

  /**
   * Vote on a post
   */
  async votePost(
    communityId: string,
    postId: string,
    userId: string,
    voteType: 'up' | 'down'
  ): Promise<void> {
    const postRef = doc(db, 'communities', communityId, 'posts', postId);
    const voteRef = doc(db, 'communities', communityId, 'posts', postId, 'votes', userId);

    // Get current vote
    const voteDoc = await getDoc(voteRef);
    const currentVote = voteDoc.exists() ? voteDoc.data().vote : null;

    if (currentVote === voteType) {
      // Remove vote
      await deleteDoc(voteRef);
      if (voteType === 'up') {
        await updateDoc(postRef, { upvotes: increment(-1) });
      } else {
        await updateDoc(postRef, { downvotes: increment(-1) });
      }
    } else if (currentVote) {
      // Switch vote
      await updateDoc(voteRef, { vote: voteType });
      if (currentVote === 'up') {
        await updateDoc(postRef, { upvotes: increment(-1), downvotes: increment(1) });
      } else {
        await updateDoc(postRef, { upvotes: increment(1), downvotes: increment(-1) });
      }
    } else {
      // New vote
      if (voteType === 'up') {
        await updateDoc(postRef, { upvotes: increment(1) });
      } else {
        await updateDoc(postRef, { downvotes: increment(1) });
      }
      // Create vote document
      const { setDoc } = await import('firebase/firestore');
      await setDoc(voteRef, { vote: voteType });
    }
  }

  /**
   * React to a post
   */
  async reactToPost(
    communityId: string,
    postId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    const postRef = doc(db, 'communities', communityId, 'posts', postId);
    const userReactionsRef = doc(db, 'communities', communityId, 'posts', postId, 'userReactions', userId);

    // Get current user reactions
    const userReactionsDoc = await getDoc(userReactionsRef);
    const currentReactions = userReactionsDoc.exists() ? userReactionsDoc.data().reactions || [] : [];

    const hasReacted = currentReactions.includes(emoji);

    const { setDoc } = await import('firebase/firestore');

    if (hasReacted) {
      // Remove reaction
      const newReactions = currentReactions.filter((r: string) => r !== emoji);
      await setDoc(userReactionsRef, { reactions: newReactions }, { merge: true });
      await updateDoc(postRef, {
        [`reactions.${emoji}`]: increment(-1),
      });
    } else {
      // Add reaction
      const newReactions = [...currentReactions, emoji];
      await setDoc(userReactionsRef, { reactions: newReactions }, { merge: true });
      await updateDoc(postRef, {
        [`reactions.${emoji}`]: increment(1),
      });
    }
  }

  /**
   * Add a reply to a post
   */
  async addReply(
    communityId: string,
    postId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    userLevel: number,
    content: string
  ): Promise<Reply> {
    const repliesRef = collection(db, 'communities', communityId, 'posts', postId, 'replies');
    const postRef = doc(db, 'communities', communityId, 'posts', postId);

    const replyData = {
      authorId: userId,
      authorName: userName,
      authorAvatar: userAvatar,
      authorLevel: userLevel,
      content,
      upvotes: 0,
      downvotes: 0,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(repliesRef, replyData);

    // Update comment count
    await updateDoc(postRef, {
      commentCount: increment(1),
    });

    return {
      id: docRef.id,
      ...replyData,
      userVote: null,
    } as Reply;
  }

  /**
   * Vote on a reply
   */
  async voteReply(
    communityId: string,
    postId: string,
    replyId: string,
    userId: string,
    voteType: 'up' | 'down'
  ): Promise<void> {
    const replyRef = doc(db, 'communities', communityId, 'posts', postId, 'replies', replyId);
    const voteRef = doc(db, 'communities', communityId, 'posts', postId, 'replies', replyId, 'votes', userId);

    // Get current vote
    const voteDoc = await getDoc(voteRef);
    const currentVote = voteDoc.exists() ? voteDoc.data().vote : null;

    const { setDoc } = await import('firebase/firestore');

    if (currentVote === voteType) {
      // Remove vote
      await deleteDoc(voteRef);
      if (voteType === 'up') {
        await updateDoc(replyRef, { upvotes: increment(-1) });
      } else {
        await updateDoc(replyRef, { downvotes: increment(-1) });
      }
    } else if (currentVote) {
      // Switch vote
      await setDoc(voteRef, { vote: voteType }, { merge: true });
      if (currentVote === 'up') {
        await updateDoc(replyRef, { upvotes: increment(-1), downvotes: increment(1) });
      } else {
        await updateDoc(replyRef, { upvotes: increment(1), downvotes: increment(-1) });
      }
    } else {
      // New vote
      if (voteType === 'up') {
        await updateDoc(replyRef, { upvotes: increment(1) });
      } else {
        await updateDoc(replyRef, { downvotes: increment(1) });
      }
      await setDoc(voteRef, { vote: voteType });
    }
  }

  /**
   * Delete a post
   */
  async deletePost(communityId: string, postId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    const postRef = doc(db, 'communities', communityId, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      return { success: false, message: 'Post not found' };
    }

    const postData = postDoc.data();

    // Check authorization
    if (postData.authorId !== userId) {
      // Check if user is community creator/mod
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (!communityDoc.exists() || communityDoc.data().creatorId !== userId) {
        return { success: false, message: 'Unauthorized' };
      }
    }

    await deleteDoc(postRef);
    return { success: true, message: 'Post deleted successfully' };
  }
}

export const communityPostsService = new CommunityPostsService();
