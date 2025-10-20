import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Pin,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Send
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorLevel?: number;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isPinned: boolean;
  createdAt: any;
  userVote?: 'up' | 'down' | null;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: any;
}

interface CommunityFeedV3Props {
  communityId: string;
  isCreator: boolean;
}

// Placeholder posts for empty communities
const placeholderPosts: Post[] = [
  {
    id: 'placeholder-1',
    communityId: 'placeholder',
    authorId: 'placeholder-user-1',
    authorName: 'Ava Lin',
    authorLevel: 8,
    content: 'Just dropped my new generative art course 🎨🔥 Check it out in the Courses tab!',
    upvotes: 42,
    downvotes: 2,
    commentCount: 5,
    isPinned: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'placeholder-2',
    communityId: 'placeholder',
    authorId: 'placeholder-user-2',
    authorName: 'Leo Mint',
    authorLevel: 5,
    content: 'Does anyone know the best prompt format for Midjourney v6? Been experimenting all week...',
    upvotes: 27,
    downvotes: 1,
    commentCount: 8,
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 'placeholder-3',
    communityId: 'placeholder',
    authorId: 'placeholder-user-3',
    authorName: 'Nora Dev',
    authorLevel: 12,
    content: 'Sharing my free resource pack for AI creators 💾✨ Link in bio!',
    upvotes: 68,
    downvotes: 0,
    commentCount: 12,
    isPinned: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export const CommunityFeedV3: React.FC<CommunityFeedV3Props> = ({ communityId, isCreator }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [isPosting, setIsPosting] = useState(false);

  // Use placeholder posts if no real posts exist
  const displayPosts = posts.length > 0 ? posts : (!loading ? placeholderPosts : []);

  // Load posts in real-time
  useEffect(() => {
    if (!communityId) return;

    const postsQuery = query(
      collection(db, 'community_posts'),
      where('communityId', '==', communityId),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const loadedPosts: Post[] = [];
      snapshot.forEach((doc) => {
        loadedPosts.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(loadedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [communityId]);

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'community_posts'), {
        communityId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || null,
        authorLevel: 1, // TODO: Get from user profile
        content: newPostContent,
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        isPinned: false,
        createdAt: serverTimestamp(),
      });

      setNewPostContent('');
      toast({
        title: 'Post created!',
        description: 'Your post has been published to the community.',
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  // Handle voting
  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user || postId.startsWith('placeholder')) return; // Disable voting on placeholder posts

    const postRef = doc(db, 'community_posts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      // If user already voted the same way, remove vote
      if (post.userVote === voteType) {
        await updateDoc(postRef, {
          [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(-1),
        });
        // Update local state
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, userVote: null, [voteType === 'up' ? 'upvotes' : 'downvotes']: p[voteType === 'up' ? 'upvotes' : 'downvotes'] - 1 }
            : p
        ));
      }
      // If user voted opposite way, switch vote
      else if (post.userVote && post.userVote !== voteType) {
        const oppositeVote = voteType === 'up' ? 'downvotes' : 'upvotes';
        await updateDoc(postRef, {
          [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1),
          [oppositeVote]: increment(-1),
        });
        // Update local state
        setPosts(posts.map(p =>
          p.id === postId
            ? {
                ...p,
                userVote: voteType,
                [voteType === 'up' ? 'upvotes' : 'downvotes']: p[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1,
                [oppositeVote]: p[oppositeVote] - 1
              }
            : p
        ));
      }
      // New vote
      else {
        await updateDoc(postRef, {
          [voteType === 'up' ? 'upvotes' : 'downvotes']: increment(1),
        });
        // Update local state
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, userVote: voteType, [voteType === 'up' ? 'upvotes' : 'downvotes']: p[voteType === 'up' ? 'upvotes' : 'downvotes'] + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: 'Failed to register vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Toggle pin status (creator only)
  const handleTogglePin = async (postId: string) => {
    if (!isCreator) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      await updateDoc(doc(db, 'community_posts', postId), {
        isPinned: !post.isPinned,
      });

      toast({
        title: post.isPinned ? 'Post unpinned' : 'Post pinned',
        description: post.isPinned ? 'Post has been unpinned.' : 'Post will stay at the top of the feed.',
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'community_posts', postId));
      toast({
        title: 'Post deleted',
        description: 'Your post has been removed.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Load comments for a post
  const loadComments = (postId: string) => {
    if (showComments[postId]) {
      setShowComments({ ...showComments, [postId]: false });
      return;
    }

    setShowComments({ ...showComments, [postId]: true });

    const commentsQuery = query(
      collection(db, 'community_comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    onSnapshot(commentsQuery, (snapshot) => {
      const loadedComments: Comment[] = [];
      snapshot.forEach((doc) => {
        loadedComments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments({ ...comments, [postId]: loadedComments });
    });
  };

  // Add comment
  const handleAddComment = async (postId: string) => {
    if (!newComment[postId]?.trim() || !user) return;

    try {
      await addDoc(collection(db, 'community_comments'), {
        postId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || null,
        content: newComment[postId],
        createdAt: serverTimestamp(),
      });

      // Increment comment count
      await updateDoc(doc(db, 'community_posts', postId), {
        commentCount: increment(1),
      });

      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Format time ago
  const timeAgo = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-1/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/6" />
              </div>
            </div>
            <div className="h-20 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_20px_-5px_rgba(0,0,0,0.4)] border border-white/10"
      >
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share something with the community..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl resize-none focus:ring-2 focus:ring-purple-500/50"
              rows={3}
            />

            <div className="flex items-center justify-end gap-2 mt-3">
              <Button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || isPosting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-[0_0_25px_-5px_rgba(155,93,229,0.5)]"
              >
                <Send className="w-4 h-4 mr-2" />
                {isPosting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts Feed */}
      <AnimatePresence mode="popLayout">
        {displayPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.5,
              delay: index * 0.05,
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            whileHover={{
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
            className={cn(
              "bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_20px_-5px_rgba(0,0,0,0.4)] border border-white/10",
              "transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(155,93,229,0.4)]",
              post.isPinned && "ring-2 ring-amber-400/50 bg-amber-400/5"
            )}
          >
            {/* Pinned Badge */}
            {post.isPinned && (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold mb-4"
              >
                <Pin className="w-3 h-3" />
                Pinned Post
              </motion.div>
            )}

            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/20">
                  <AvatarImage src={post.authorAvatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                    {post.authorName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{post.authorName}</span>
                    {post.authorLevel && (
                      <Badge variant="outline" className="bg-gradient-to-r from-amber-400/20 to-orange-400/20 border-amber-400/30 text-amber-300 text-xs">
                        Lvl {post.authorLevel}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-white/50">{timeAgo(post.createdAt)}</span>
                </div>
              </div>

              {/* Post Actions Dropdown */}
              {(isCreator || post.authorId === user?.uid) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-900/95 backdrop-blur-xl border-white/10">
                    {isCreator && (
                      <DropdownMenuItem
                        onClick={() => handleTogglePin(post.id)}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Pin className="w-4 h-4 mr-2" />
                        {post.isPinned ? 'Unpin' : 'Pin Post'}
                      </DropdownMenuItem>
                    )}
                    {post.authorId === user?.uid && (
                      <>
                        <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    {post.authorId !== user?.uid && (
                      <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Post Content */}
            <p className="text-white/90 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>

            {/* Media */}
            {post.mediaUrl && (
              <div className="mb-4 rounded-xl overflow-hidden">
                {post.mediaType === 'image' && (
                  <img src={post.mediaUrl} alt="Post media" className="w-full h-auto object-cover" />
                )}
                {post.mediaType === 'video' && (
                  <video src={post.mediaUrl} controls className="w-full h-auto" />
                )}
              </div>
            )}

            {/* Engagement Row */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              {/* Upvote */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote(post.id, 'up')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
                  post.userVote === 'up'
                    ? "bg-purple-500/20 text-purple-300"
                    : "text-white/60 hover:text-purple-300 hover:bg-purple-500/10"
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">{post.upvotes}</span>
              </motion.button>

              {/* Downvote */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote(post.id, 'down')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
                  post.userVote === 'down'
                    ? "bg-red-500/20 text-red-300"
                    : "text-white/60 hover:text-red-300 hover:bg-red-500/10"
                )}
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">{post.downvotes}</span>
              </motion.button>

              {/* Comments */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadComments(post.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white/60 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">{post.commentCount}</span>
              </motion.button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments[post.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/10 space-y-3"
                >
                  {/* Existing Comments */}
                  {comments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                      <Avatar className="w-8 h-8 border border-white/20">
                        <AvatarImage src={comment.authorAvatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                          {comment.authorName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{comment.authorName}</span>
                          <span className="text-xs text-white/40">{timeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-white/80">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex items-start gap-2">
                    <Avatar className="w-8 h-8 border border-white/20">
                      <AvatarImage src={user?.photoURL || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 flex items-center gap-2">
                      <Textarea
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        placeholder="Add a comment..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl resize-none text-sm focus:ring-2 focus:ring-purple-500/50"
                        rows={1}
                      />
                      <Button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Note: Placeholder posts will show when there's no real data */}
    </div>
  );
};
