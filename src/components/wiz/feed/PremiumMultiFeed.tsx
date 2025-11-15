import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Zap, Users, Sparkles, TrendingUp, Clock, Flame, ChevronUp, ChevronDown } from 'lucide-react';
import { getAllTopPosts, getPostsBySort, type Post } from '@/lib/firestore/queries';
import { collection, getDocs, limit as fsLimit, orderBy, query as fsQuery, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { WIZUPEngagementBar } from '../WIZUPEngagementBar';
import { usePostViewStore } from '@/store/postViewStore';
import ReactPlayer from 'react-player/youtube';

interface Props {
  onVideoPlay?: (post: Post) => void;
  onPostClick?: (post: Post) => void;
  onZapEarned?: (amount: number) => void;
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

// Reddit-Style Post Card with Upvote/Downvote and ZAP System
const FeedCard: React.FC<{
  post: Post;
  onVideoPlay?: (p: Post) => void;
  onPostClick?: (p: Post) => void;
  onZapEarned?: (amount: number) => void;
  isFeatured?: boolean;
  index: number;
}> = ({ post, onVideoPlay, onPostClick, onZapEarned, isFeatured = false, index }) => {
  const postViewStore = usePostViewStore();
  const [isHovered, setIsHovered] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [voteCount, setVoteCount] = useState(post.score || 0);
  const [earnedZaps, setEarnedZaps] = useState(0);
  const [showZapReward, setShowZapReward] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const onCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // open post screen view
    postViewStore.openPost(post);
  };

  // Voting functions
  const handleUpvote = () => {
    if (userVote === 'up') {
      // Remove upvote
      setUserVote(null);
      setVoteCount(prev => prev - 1);
      setEarnedZaps(prev => Math.max(0, prev - 1));
    } else {
      // Add upvote (remove downvote if exists)
      const delta = userVote === 'down' ? 2 : 1;
      setUserVote('up');
      setVoteCount(prev => prev + delta);
      const zapsEarned = userVote === 'down' ? 3 : 2;
      setEarnedZaps(prev => prev + zapsEarned);
      setShowZapReward(true);
      setTimeout(() => setShowZapReward(false), 2000);
      onZapEarned?.(zapsEarned);
    }
  };

  const handleDownvote = () => {
    if (userVote === 'down') {
      // Remove downvote
      setUserVote(null);
      setVoteCount(prev => prev + 1);
      setEarnedZaps(prev => Math.max(0, prev - 1));
    } else {
      // Add downvote (remove upvote if exists)
      const delta = userVote === 'up' ? -2 : -1;
      setUserVote('down');
      setVoteCount(prev => prev + delta);
      setEarnedZaps(prev => Math.max(0, prev - 1));
    }
  };

  const handleVideoPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onVideoPlay?.(post);
    // Simulate ZAP earning after watching
    setTimeout(() => {
      setVideoWatched(true);
      const zapsEarned = post.zapsReward || 15;
      setEarnedZaps(prev => prev + zapsEarned);
      setShowZapReward(true);
      setTimeout(() => setShowZapReward(false), 3000);
      onZapEarned?.(zapsEarned);
    }, 2000);
  };

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
        y: -4,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-100/50 shadow-lg transition-all duration-500 hover:shadow-2xl"
      style={{
        boxShadow: isHovered
          ? '0 8px 32px rgba(138, 77, 255, 0.08), 0 0 12px rgba(255,77,243,0.15)'
          : '0 8px 32px rgba(138, 77, 255, 0.08)'
      }}
    >
      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(138,77,255,0.02) 0%, rgba(255,77,243,0.02) 100%)',
          boxShadow: 'inset 0 0 40px rgba(138,77,255,0.03)'
        }}
      />

      {/* Content */}
      <div className="relative p-6 cursor-pointer" onClick={onCardClick}>
        {/* Post Header */}
        <div className="flex items-center gap-3 mb-4">
          {(() => {
            const avatarSrc =
              post.author?.imageUrl ||
              post.author?.profilePic ||
              post.author?.avatar ||
              post.avatar ||
              '/images/default-avatar.png';

            return (
              <img
                src={avatarSrc}
            alt={post.authorName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                onError={(e) => (e.currentTarget.src = '/images/default-avatar.png')}
          />
            );
          })()}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900">{post.authorName}</span>
              <span className="text-gray-500">@{post.authorUsername || post.authorName}</span>
              <span className="text-purple-600">Lv.{post.authorLevel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>posted in {post.communityName} ⚡</span>
              <span>•</span>
              <span>{formatTime(post.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
            <Zap className="w-3 h-3" />
            {post.zapsReward || 0} ZAPs
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 mb-4" />

        {/* Post Title */}
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 leading-tight hover:text-blue-600 transition-colors">
          {post.title}
        </h2>

        {/* Post Description */}
        {post.excerpt && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Media */}
        {post.media?.thumbnail && (
          <motion.div
            className="rounded-2xl overflow-hidden mb-4 cursor-pointer relative group/media aspect-video"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={(e) => {
              e.stopPropagation();
              if (post.media?.type === 'video' && post.media.videoId) {
                setIsVideoPlaying(true);
              }
            }}
            style={{ pointerEvents: 'auto' }}
          >
            {isVideoPlaying && post.media?.videoId ? (
              // Inline video player
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${post.media.videoId}`}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                className="absolute top-0 left-0"
                onPlay={() => {
                  // Track video play for ZAP rewards
                  if (!videoWatched) {
                    setVideoWatched(true);
                    const zapsEarned = post.zapsReward || 15;
                    setEarnedZaps(prev => prev + zapsEarned);
                    setShowZapReward(true);
                    setTimeout(() => setShowZapReward(false), 3000);
                    onZapEarned?.(zapsEarned);
                  }
                }}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0,
                      fs: 0, // Disable fullscreen
                      iv_load_policy: 3, // Hide annotations
                    }
                  }
                }}
              />
            ) : (
              // Thumbnail with play button
            <img
              src={post.media.thumbnail}
              alt={post.title}
                className="w-full h-full object-cover"
            />
            )}

            {/* Video Overlay - only show when not playing */}
            {post.media?.type === 'video' && !isVideoPlaying && (
              <>
                {/* Duration Badge */}
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
                  {post.media.duration || '0:00'}
                </div>

                {/* ZAP Reward Badge */}
                <motion.div
                  className="absolute bottom-3 right-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1"
                  animate={{ scale: videoWatched ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Zap className="w-3 h-3" />
                  +{post.zapsReward || 15} ZAPs
                </motion.div>

                {/* Play Button */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1" />
                  </div>
                </motion.div>

                {/* Hover ZAP Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute top-3 left-3 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg"
                >
                  Watch to Earn +{post.zapsReward || 15} ZAPs ⚡
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {/* Unified Engagement Bar */}
        <WIZUPEngagementBar
          userVote={userVote}
          voteCount={voteCount}
          commentCount={post.commentsCount || 0}
          zapsEarned={earnedZaps}
          onUpvote={handleUpvote}
          onDownvote={handleDownvote}
          onComment={() => onPostClick?.(post)}
          onShare={() => console.log('Share post:', post.id)}
          enableAnimations={true}
        />

        {/* ZAP Reward Animation */}
        <AnimatePresence>
          {showZapReward && earnedZaps > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.8 }}
              className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-2 rounded-xl shadow-lg z-10"
            >
              +{earnedZaps} ZAPs Earned! ⚡
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const PremiumMultiFeed: React.FC<Props> = ({ onVideoPlay, onPostClick, onZapEarned }) => {
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

        {/* Feed Content - Single Column Reddit Style */}
        {!loading && safePosts.length > 0 && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {safePosts.filter(p => p && p.id).map((post, index) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onVideoPlay={onVideoPlay}
                  onPostClick={onPostClick}
                  onZapEarned={onZapEarned}
                  isFeatured={false}
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
