import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Posts Interaction Service
 * Handles voting, saving, and other interactions for general posts
 */
export class PostsInteractionService {
  /**
   * Vote on a post (upvote or downvote)
   */
  async votePost(
    postId: string,
    userId: string,
    voteType: 'up' | 'down'
  ): Promise<{ upvotes: number; downvotes: number; userVote: 'up' | 'down' | null }> {
    const postRef = doc(db, 'posts', postId);
    const voteRef = doc(db, 'posts', postId, 'votes', userId);

    // Get current vote
    const voteDoc = await getDoc(voteRef);
    const currentVote = voteDoc.exists() ? voteDoc.data().vote : null;

    // Get current post data
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const postData = postDoc.data();
    let newUpvotes = postData.upvotes || 0;
    let newDownvotes = postData.downvotes || 0;

    if (currentVote === voteType) {
      // Remove vote
      await deleteDoc(voteRef);
      if (voteType === 'up') {
        newUpvotes = Math.max(0, newUpvotes - 1);
        await updateDoc(postRef, { upvotes: newUpvotes });
      } else {
        newDownvotes = Math.max(0, newDownvotes - 1);
        await updateDoc(postRef, { downvotes: newDownvotes });
      }
      return { upvotes: newUpvotes, downvotes: newDownvotes, userVote: null };
    } else if (currentVote) {
      // Switch vote
      await setDoc(voteRef, { vote: voteType }, { merge: true });
      if (currentVote === 'up') {
        newUpvotes = Math.max(0, newUpvotes - 1);
        newDownvotes = newDownvotes + 1;
      } else {
        newUpvotes = newUpvotes + 1;
        newDownvotes = Math.max(0, newDownvotes - 1);
      }
      await updateDoc(postRef, { upvotes: newUpvotes, downvotes: newDownvotes });
      return { upvotes: newUpvotes, downvotes: newDownvotes, userVote: voteType };
    } else {
      // New vote
      await setDoc(voteRef, { vote: voteType });
      if (voteType === 'up') {
        newUpvotes = newUpvotes + 1;
        await updateDoc(postRef, { upvotes: newUpvotes });
      } else {
        newDownvotes = newDownvotes + 1;
        await updateDoc(postRef, { downvotes: newDownvotes });
      }
      return { upvotes: newUpvotes, downvotes: newDownvotes, userVote: voteType };
    }
  }

  /**
   * Get user's vote status for a post
   */
  async getUserVote(postId: string, userId: string): Promise<'up' | 'down' | null> {
    try {
      const voteRef = doc(db, 'posts', postId, 'votes', userId);
      const voteDoc = await getDoc(voteRef);
      return voteDoc.exists() ? (voteDoc.data().vote as 'up' | 'down') : null;
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  }

  /**
   * Save/unsave a post
   */
  async toggleSavePost(postId: string, userId: string): Promise<boolean> {
    const saveRef = doc(db, 'users', userId, 'savedPosts', postId);
    const saveDoc = await getDoc(saveRef);

    if (saveDoc.exists()) {
      // Unsave
      await deleteDoc(saveRef);
      return false;
    } else {
      // Save
      await setDoc(saveRef, {
        postId,
        savedAt: serverTimestamp(),
      });
      return true;
    }
  }

  /**
   * Check if user has saved a post
   */
  async isPostSaved(postId: string, userId: string): Promise<boolean> {
    try {
      const saveRef = doc(db, 'users', userId, 'savedPosts', postId);
      const saveDoc = await getDoc(saveRef);
      return saveDoc.exists();
    } catch (error) {
      console.error('Error checking saved status:', error);
      return false;
    }
  }

  /**
   * Add a comment to a post
   */
  async addComment(
    postId: string,
    userId: string,
    userDisplayName: string,
    userPhotoURL: string,
    content: string
  ): Promise<{ id: string; success: boolean }> {
    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const postRef = doc(db, 'posts', postId);

      const commentData = {
        userId,
        userDisplayName,
        userPhotoURL,
        content,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
      };

      const docRef = await addDoc(commentsRef, commentData);

      // Update comment count
      await updateDoc(postRef, {
        commentsCount: increment(1),
      });

      return { id: docRef.id, success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { id: '', success: false };
    }
  }

  /**
   * Share a post (creates a share record)
   */
  async sharePost(postId: string, userId: string, platform?: string): Promise<boolean> {
    try {
      const shareRef = collection(db, 'posts', postId, 'shares');
      await addDoc(shareRef, {
        userId,
        platform: platform || 'direct',
        sharedAt: serverTimestamp(),
      });

      // Update share count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        sharesCount: increment(1),
      });

      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      return false;
    }
  }
}

export const postsInteractionService = new PostsInteractionService();