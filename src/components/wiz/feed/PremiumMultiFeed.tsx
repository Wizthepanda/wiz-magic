import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Zap, Users, Sparkles, TrendingUp, Clock, Flame } from 'lucide-react';
import { getAllTopPosts, getPostsBySort, type Post } from '@/lib/firestore/queries';
import { collection, getDocs, limit as fsLimit, orderBy, query as fsQuery, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface Props {
  onVideoPlay?: (post: Post) => void;
}

function formatTime(ts: any): string {
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

// Enhanced Card Component with Featured Size Option
const FeedCard: React.FC<{
  post: Post;
  onVideoPlay?: (p: Post) => void;
  isFeatured?: boolean;
  index: number;
}> = ({ post, onVideoPlay, isFeatured = false, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-100/50 shadow-lg transition-all duration-500",
        isFeatured
          ? "col-span-full md:col-span-2"
          : "col-span-1",
        isHovered && "shadow-2xl shadow-purple-500/20 border-purple-200/50"
      )}
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,252,0.9) 100%)'
      }}
    >
      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(138,77,255,0.03) 0%, rgba(255,77,243,0.03) 100%)',
          boxShadow: 'inset 0 0 40px rgba(138,77,255,0.05)'
        }}
      />

      {/* Content */}
      <div className={cn("relative p-6", isFeatured && "md:p-8")}>
        {/* Community Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 mb-4 cursor-pointer"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                <img
                  src={post.communityAvatar || '/placeholder.svg'}
                  alt={post.communityName}
                  className="w-10 h-10 rounded-xl object-cover"
                />
              </div>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </motion.div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{post.communityName}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{post.communityMemberCount || 0} members</span>
            </div>
          </div>
        </motion.div>

        {/* Content Type Badge */}
        <div className="flex items-center gap-2 mb-3">
          {post.media?.type === 'video' && (
            <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Video
            </div>
          )}
          {post.score > 100 && (
            <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Hot
            </div>
          )}
          {post.zapsReward > 100 && (
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              High XP
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className={cn(
          "font-semibold text-gray-900 mb-4 leading-tight",
          isFeatured ? "text-xl md:text-2xl" : "text-lg"
        )}>
          {post.title}
        </h2>

        {/* Media */}
        {post.media?.thumbnail && (
          <motion.div
            className={cn(
              "rounded-2xl overflow-hidden mb-4 cursor-pointer relative group/media",
              isFeatured ? "aspect-video" : "aspect-video"
            )}
            whileHover={{ scale: 1.02 }}
            onClick={() => onVideoPlay?.(post)}
          >
            <img
              src={post.media.thumbnail}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/media:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {post.media?.type === 'video' && (
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 text-white text-sm font-medium rounded-full backdrop-blur-sm">
                {post.media.duration || '0:00'}
              </div>
            )}
          </motion.div>
        )}

        {/* Author & Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar || '/avatar-fallback.png'}
              alt={post.authorName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">@{post.authorUsername || post.authorName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatTime(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <motion.div
            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full flex items-center gap-1"
            whileHover={{ scale: 1.1 }}
            animate={{
              scale: [1, 1.05, 1],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Zap className="w-4 h-4" />
            +{post.zapsReward || 0} XP
          </motion.div>
        </div>

        {/* Engagement Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
            >
              <Heart className="w-5 h-5 group-hover:fill-current" />
              <span className="text-sm font-medium">{post.score || 0}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.commentsCount || 0}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors group"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </motion.button>
          </div>
          <div className="text-xs text-gray-400">
            {post.votesCount || 0} votes
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PremiumMultiFeed: React.FC<Props> = ({ onVideoPlay }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  // Ensure posts is always an array
  const safePosts = Array.isArray(posts) ? posts : [];
  const [cursor, setCursor] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'posts' | 'discover' | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const isDebug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Create a blended discovery feed algorithm
        // Priority: Hot/Trending → High XP → New → Everything else
        const blendedPosts: Post[] = [];

        // Step 1: Get hot/trending posts (high engagement)
        try {
          const { posts: hotPosts } = await getPostsBySort('hot', 8);
          if (Array.isArray(hotPosts)) {
            blendedPosts.push(...hotPosts.filter(p => p && p.score > 10));
          }
        } catch (e) {
          console.warn('Could not load hot posts:', e);
        }

        // Step 2: Get high XP reward posts
        try {
          const { posts: xpPosts } = await getPostsBySort('xp', 6);
          if (Array.isArray(xpPosts)) {
            // Filter out duplicates and add high-XP posts
            const existingIds = new Set(blendedPosts.map(p => p.id));
            const newXpPosts = xpPosts.filter(p => p && !existingIds.has(p.id) && (p.zapsReward || 0) > 50);
            blendedPosts.push(...newXpPosts);
          }
        } catch (e) {
          console.warn('Could not load XP posts:', e);
        }

        // Step 3: Fill with newest posts to reach target count
        const targetCount = 15;
        if (blendedPosts.length < targetCount) {
          try {
            const { posts: newPosts } = await getPostsBySort('new', targetCount - blendedPosts.length);
            if (Array.isArray(newPosts)) {
              // Filter out duplicates
              const existingIds = new Set(blendedPosts.map(p => p.id));
              const newUniquePosts = newPosts.filter(p => p && !existingIds.has(p.id));
              blendedPosts.push(...newUniquePosts);
            }
          } catch (e) {
            console.warn('Could not load new posts:', e);
          }
        }

        // Step 4: Final fallback to discover collection if we still don't have enough posts
        if (blendedPosts.length < 5) {
          try {
            const dq = fsQuery(collection(db, 'discover'), orderBy('createdAt', 'desc'), fsLimit(15));
            const dsnap = await getDocs(dq);
            const mapped = dsnap.docs.map((d) => {
              const x = d.data() as any;
              const p: Partial<Post> = {
                id: d.id,
                communityId: x.communityId || '',
                communityName: x.communityName || x.creatorName || 'Discover',
                communityAvatar: x.communityAvatar || x.creatorPhoto || '',
                communityVerified: !!x.isVerified,
                communityMemberCount: x.membersCount || 0,
                authorId: x.creatorId || '',
                authorName: x.creatorName || 'Creator',
                authorUsername: x.creatorHandle || x.creatorName || 'creator',
                authorAvatar: x.creatorPhoto || '',
                authorLevel: x.creatorLevel || 1,
                title: x.title || 'Untitled',
                excerpt: x.description || '',
                media: { type: 'video', thumbnail: x.thumbnail || '', videoId: x.videoId || '', duration: x.duration || '' } as any,
                score: x.score || 0,
                upvotes: x.upvotes || 0,
                downvotes: x.downvotes || 0,
                votesCount: x.votesCount || 0,
                commentsCount: x.commentsCount || 0,
                isPinned: x.isPinned || false,
                zapsReward: x.xpReward || x.zapsReward || 0,
                createdAt: x.createdAt,
              } as Post;
              return p as Post;
            });

            // Filter out duplicates and add to blended posts
            const existingIds = new Set(blendedPosts.map(p => p.id));
            const newDiscoverPosts = mapped.filter(p => p && !existingIds.has(p.id));
            blendedPosts.push(...newDiscoverPosts);
          } catch (e) {
            console.warn('Could not load discover posts:', e);
          }
        }

        // Step 5: Final filtering and sorting
        if (mounted && Array.isArray(blendedPosts) && blendedPosts.length > 0) {
          // Remove duplicates and invalid posts
          const uniquePosts = blendedPosts
            .filter(p => p && typeof p === 'object' && p.id && p.title)
            .filter((post, index, arr) => arr.findIndex(p => p.id === post.id) === index);

          // Sort by a blended algorithm: prioritize high engagement, then recency
          const sortedPosts = uniquePosts.sort((a, b) => {
            const aScore = (a.score || 0) + (a.zapsReward || 0) / 10 + (a.commentsCount || 0) / 5;
            const bScore = (b.score || 0) + (b.zapsReward || 0) / 10 + (b.commentsCount || 0) / 5;
            return bScore - aScore; // Higher score first
          });

          setPosts(sortedPosts);
          setCursor(null); // Reset cursor for blended feed
          setHasMore(true); // Allow infinite scroll
          setSource('blended');
        } else if (mounted) {
          setPosts([]);
          setCursor(null);
          setHasMore(false);
          setSource(null);
        }
      } catch (e: any) {
        console.error('Feed loading error:', e);
        if (mounted) setError(e?.message || 'Failed to load discovery feed');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []); // No dependencies - load once on mount

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && hasMore && safePosts.length > 0) {
          // Load more posts using the same blended algorithm but with offset
          const additionalPosts: Post[] = [];

          try {
            // Get more posts from discover collection as fallback for infinite scroll
            const lastPostTimestamp = safePosts[safePosts.length - 1]?.createdAt;
            let query = fsQuery(collection(db, 'discover'), orderBy('createdAt', 'desc'), fsLimit(10));

            if (lastPostTimestamp) {
              query = fsQuery(
                collection(db, 'discover'),
                orderBy('createdAt', 'desc'),
                where('createdAt', '<', lastPostTimestamp),
                fsLimit(10)
              );
            }

            const dsnap = await getDocs(query);
            const mapped = dsnap.docs.map((d) => {
              const x = d.data() as any;
              const p: Partial<Post> = {
                id: d.id,
                communityId: x.communityId || '',
                communityName: x.communityName || x.creatorName || 'Discover',
                communityAvatar: x.communityAvatar || x.creatorPhoto || '',
                communityVerified: !!x.isVerified,
                communityMemberCount: x.membersCount || 0,
                authorId: x.creatorId || '',
                authorName: x.creatorName || 'Creator',
                authorUsername: x.creatorHandle || x.creatorName || 'creator',
                authorAvatar: x.creatorPhoto || '',
                authorLevel: x.creatorLevel || 1,
                title: x.title || 'Untitled',
                excerpt: x.description || '',
                media: { type: 'video', thumbnail: x.thumbnail || '', videoId: x.videoId || '', duration: x.duration || '' } as any,
                score: x.score || 0,
                upvotes: x.upvotes || 0,
                downvotes: x.downvotes || 0,
                votesCount: x.votesCount || 0,
                commentsCount: x.commentsCount || 0,
                isPinned: x.isPinned || false,
                zapsReward: x.xpReward || x.zapsReward || 0,
                createdAt: x.createdAt,
              } as Post;
              return p as Post;
            });

            // Filter out duplicates
            const existingIds = new Set(safePosts.map(p => p.id));
            const newPosts = mapped.filter(p => p && !existingIds.has(p.id));

            if (newPosts.length > 0) {
              setPosts((prevPosts) => [...prevPosts, ...newPosts]);
              setHasMore(newPosts.length === 10); // If we got a full page, there might be more
            } else {
              setHasMore(false); // No more posts available
            }
          } catch (e) {
            console.warn('Could not load more posts:', e);
            setHasMore(false);
          }
        }
      }
    }, { rootMargin: '800px 0px 800px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, safePosts]);

  const totalItems = safePosts.length;

  return (
    <div className="w-full">
      {/* Main Feed Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-16">
        {/* Loading State */}
        {loading && safePosts.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 animate-pulse",
                  i === 0 && "md:col-span-2"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4" />
                <div className="aspect-video bg-gray-200 rounded-2xl mb-4" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Feed Content */}
        {!loading && safePosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {safePosts.filter(p => p && p.id).map((post, index) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onVideoPlay={onVideoPlay}
                  isFeatured={index === 0}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!loading && safePosts.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Discovery Journey Begins</h2>
              <p className="text-gray-600 text-lg">
                Communities are creating amazing content. Check back soon for the latest posts, videos, and discussions!
              </p>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md mx-auto">
              <div className="text-red-500 text-lg font-semibold mb-2">Unable to load feed</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </motion.div>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={sentinelRef} className="h-10" />
      </div>

      {/* Debug Info (only in development) */}
      {isDebug && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-xl border border-purple-200 rounded-2xl p-4 shadow-xl"
        >
          <div className="text-xs font-mono text-gray-600">
            <div>Items: <span className="font-semibold text-purple-600">{totalItems}</span></div>
            <div>Source: <span className="font-semibold text-pink-600">{source || 'none'}</span></div>
            <div>Loading: <span className={loading ? 'text-red-500' : 'text-green-500'}>{loading ? 'true' : 'false'}</span></div>
            <div>Has More: <span className={hasMore ? 'text-blue-500' : 'text-gray-500'}>{hasMore ? 'true' : 'false'}</span></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PremiumMultiFeed;
