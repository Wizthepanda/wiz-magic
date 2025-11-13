// src/hooks/usePostData.ts

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post, Comment, Community } from '@/types/post';

// Helper function to format time ago
function formatTimeAgo(ts: any): string {
  try {
    if (!ts) return '';
    if (typeof ts === 'string') return ts;
    if (ts.toDate) {
      const d = ts.toDate() as Date;
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
      return `${Math.floor(diff/86400)}d ago`;
    }
  } catch {}
  return '';
}

// Get a post by ID - first try global posts collection, then search communities
export function usePost(postId?: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) throw new Error('No post id');

      // Try to get from global posts collection first (if it exists)
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const data = postSnap.data();
        return {
          id: postSnap.id,
          ...data,
          communityId: data.communityId || '',
          authorHandle: data.authorUsername || data.authorHandle || '',
          votes: data.score || data.upvotes || 0,
          zaps: data.zapsReward || data.zaps || 0,
          createdAgo: formatTimeAgo(data.createdAt),
        } as Post;
      }

      // If not found in global collection, we need communityId
      // For now, throw error - we'll need to modify the calling code to pass communityId
      throw new Error('Post not found - need communityId for community-specific posts');
    },
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  });
}

// Get comments for a post - need both communityId and postId
export function useComments(communityId?: string, postId?: string) {
  return useQuery({
    queryKey: ['comments', communityId, postId],
    queryFn: async () => {
      if (!communityId || !postId) return [];

      const commentsRef = collection(db, 'communities', communityId, 'posts', postId, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const commentsSnap = await getDocs(q);

      return commentsSnap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          text: data.content || data.text || '',
          authorHandle: data.authorUsername || data.authorHandle || '',
          createdAgo: formatTimeAgo(data.createdAt),
        } as Comment;
      });
    },
    enabled: !!communityId && !!postId,
  });
}

// Get community data
export function useCommunity(communityId?: string) {
  return useQuery({
    queryKey: ['community', communityId],
    queryFn: async () => {
      if (!communityId) throw new Error('No community id');

      const communityRef = doc(db, 'communities', communityId);
      const communitySnap = await getDoc(communityRef);

      if (communitySnap.exists()) {
        const data = communitySnap.data();
        return {
          id: communitySnap.id,
          name: data.title || data.name || 'Community',
          about: data.description || data.shortDescription || '',
          avatarUrl: data.coverMedia?.[0]?.url || data.bannerUrl || '',
          bannerUrl: data.bannerUrl || '',
          memberCount: data.membersCount || data.memberCount || 0,
          topContributors: [], // We'll need to implement this
        } as Community;
      }

      throw new Error('Community not found');
    },
    enabled: !!communityId,
  });
}
