import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePostViewStore } from "@/store/postViewStore";
import { ArrowLeft, MessageSquare, Share2, ThumbsUp, ThumbsDown, Bookmark, MoreHorizontal, User, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityRightPanel } from "../right/CommunityRightPanel";
import ReactPlayer from 'react-player/youtube';

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

function getAvatarSrc(post: any): string {
  return (
    post.author?.imageUrl ||
    post.author?.profilePic ||
    post.author?.avatar ||
    post.avatar ||
    '/images/default-avatar.png'
  );
}

// Seamless Avatar Component with fade-in
const SeamlessAvatar: React.FC<{ post: any; size?: string; className?: string; showOnline?: boolean }> = ({ 
  post, size = "w-10 h-10", className = "", showOnline = false 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const avatarSrc = post.author?.imageUrl || post.author?.profilePic || post.author?.avatar || 
                   post.avatar || post.authorAvatar || '/images/default-avatar.png';

  const handleLoad = () => setLoaded(true);
  const handleError = (e: any) => {
    setError(true);
    e.currentTarget.src = '/images/default-avatar.png';
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={error ? '/images/default-avatar.png' : avatarSrc}
        alt="avatar"
        className={`${size} rounded-full object-cover transition-opacity duration-300 ease-in-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        } shadow-sm ring-2 ring-white/50`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
      {!loaded && !error && (
        <div className={`${size} rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 animate-pulse`} />
      )}
      {showOnline && loaded && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

// Enhanced MediaItem component with seamless loading
const MediaItem: React.FC<{ media: any }> = ({ media }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!media) return null;

  // Detect video content
  const isVideo = media.type === 'video' || 
                  media.videoId || 
                  media.videoUrl ||
                  (typeof media === 'string' && (
                    media.includes('youtube.com') || 
                    media.includes('youtu.be') || 
                    media.includes('vimeo.com') ||
                    media.includes('.mp4') || 
                    media.includes('.mov') || 
                    media.includes('.webm')
                  )) ||
                  (media.url && (
                    media.url.includes('youtube.com') || 
                    media.url.includes('youtu.be') || 
                    media.url.includes('vimeo.com')
                  ));

  if (isVideo) {
    const videoUrl = media.videoUrl || media.url || media.videoId || media;
    
    return (
      <div className="rounded-xl overflow-hidden shadow-sm">
        <div
          className={`aspect-video transition-opacity duration-300 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            light={media.thumbnail || true}
            playing={false}
            onReady={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            onClick={(e: any) => e.stopPropagation()}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                  controls: 1
                }
              }
            }}
          />
        </div>
        {!isLoaded && !hasError && (
          <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
              <div className="w-6 h-6 border-l-2 border-slate-400 rounded-full animate-spin"></div>
            </div>
          </div>
        )}
        {hasError && (
          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-2 flex items-center justify-center">
                <span className="text-slate-500 text-lg">⚠</span>
              </div>
              <span className="text-slate-500 text-sm">Video unavailable</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle images
  const imageSrc = media.imageUrl || media.url || media.thumbnail || media;

  return (
    <div className="rounded-xl overflow-hidden shadow-sm">
      <img
        src={imageSrc}
        alt="Post media"
        className={`rounded-xl w-full object-cover max-h-[400px] transition-opacity duration-300 ease-in-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setHasError(true);
          e.currentTarget.src = '/images/default-placeholder.png';
        }}
        loading="lazy"
      />
      {!isLoaded && !hasError && (
        <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl animate-pulse" />
      )}
      {hasError && (
        <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-2 flex items-center justify-center">
              <span className="text-slate-500 text-lg">🖼</span>
            </div>
            <span className="text-slate-500 text-sm">Image unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced CommentItem component with seamless loading
const CommentItem: React.FC<{ comment: any }> = ({ comment }) => {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/20 p-5">
      <div className="flex gap-4">
        <SeamlessAvatar 
          post={comment} 
          size="w-8 h-8" 
          className="flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              {comment.authorName || comment.author?.name || comment.author?.username || comment.user || 'Anonymous'}
            </span>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(comment.createdAt || comment.timestamp)}
            </span>
          </div>
          
          <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-0">
              {comment.content || comment.text}
            </p>
          </div>
          
          {/* Comment media with seamless loading */}
          {comment.media && (
            <div className="mt-3">
              <MediaItem media={comment.media} />
            </div>
          )}
          
          {/* Enhanced comment actions */}
          <div className="flex items-center gap-4 mt-3">
            <button 
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200 rounded-lg px-2 py-1 flex items-center gap-1"
            >
              <ThumbsUp className="w-3 h-3" />
              Like
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all duration-200 rounded-lg px-2 py-1 flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              Reply
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-200 rounded-lg px-2 py-1 flex items-center gap-1"
            >
              <Share2 className="w-3 h-3" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CommunityPostViewScreen v8.0 - Premium redesign with enhanced layout and animations
export const CommunityPostViewScreen = () => {
  const { activePost, closePost } = usePostViewStore();
  const topRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Robust scroll to top on mount
  useEffect(() => {
    if (activePost && topRef.current) {
      // Immediate scroll
      topRef.current.scrollIntoView({ behavior: "instant", block: "start" });
      
      // Additional scroll attempts after render
      const timeouts = [50, 150, 300];
      timeouts.forEach(delay => {
        setTimeout(() => {
          topRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
        }, delay);
      });
    }
  }, [activePost?.id]);

  // Handle scroll events for header styling
  const handleScroll = useCallback((e: any) => {
    const scrollTop = e.target.scrollTop;
    setIsScrolled(scrollTop > 20);
  }, []);

  if (!activePost) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={activePost.id}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex bg-[#F9FAFF] dark:bg-[#0A0A10]"
        ref={topRef}
      >
        {/* Main content area with premium styling */}
        <div 
          className="flex-1 overflow-y-auto bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95"
          onScroll={handleScroll}
        >
          {/* Sticky premium header */}
          <div className={`sticky top-0 z-40 transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-200/50' 
              : 'bg-transparent'
          }`}>
            <div className="flex items-center justify-between px-8 py-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={closePost}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              {/* Enhanced author info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <SeamlessAvatar 
                    post={activePost} 
                    size="w-12 h-12" 
                    className="shadow-md" 
                    showOnline={true}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-slate-900 dark:text-white">
                        {activePost.authorName || activePost.author || 'Unknown'}
                      </span>
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatTime(activePost.createdAt || activePost.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>{activePost.communityName || 'Community'}</span>
                      {activePost.views && (
                        <>
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{activePost.views} views</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium content container */}
          <div className="max-w-5xl mx-auto px-8 pb-12">
            {/* Editorial post card */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/20 overflow-hidden mb-8"
            >
              {/* Post header */}
              <div className="px-8 py-8 border-b border-slate-100/50 dark:border-slate-700/50">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                  {activePost.title}
                </h1>
                {(activePost.content || activePost.excerpt) && (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 text-lg leading-8">
                      {activePost.content || activePost.excerpt}
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced media section */}
              {activePost.media && (
                <div className="px-8 py-6">
                  <div className="rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20">
                    {Array.isArray(activePost.media) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activePost.media.map((m: any, i: number) => (
                          <div key={i} className="rounded-xl overflow-hidden">
                            <MediaItem media={m} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <MediaItem media={activePost.media} />
                    )}
                  </div>
                </div>
              )}

              {/* Premium action bar */}
              <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl px-4 py-2.5 transition-all duration-200"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">{activePost.upvotes ?? activePost.score ?? 0}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl px-4 py-2.5 transition-all duration-200"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="font-medium">{activePost.downvotes ?? 0}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-xl px-4 py-2.5 transition-all duration-200"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{activePost.comments?.length ?? activePost.commentCount ?? 0}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-xl px-4 py-2.5 transition-all duration-200"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="font-medium">Share</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* ZAP rewards */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      ⚡ {activePost.zaps || 0} ZAPs
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-600 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 rounded-xl p-2.5 transition-all duration-200"
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Premium comments section */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Discussion ({activePost.comments?.length ?? activePost.commentCount ?? 0})
                </h2>
              </div>

              {/* Enhanced comment composer */}
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg transition-opacity duration-300">
                    U
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      placeholder="Share your thoughts on this post..."
                      className="w-full p-4 border border-slate-200 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 dark:bg-slate-700/90 text-slate-900 dark:text-white placeholder:text-slate-500 transition-all duration-200"
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium shadow-lg transition-all duration-200">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced comments list */}
              {activePost.comments && activePost.comments.length > 0 ? (
                <div className="space-y-4">
                  {activePost.comments.map((comment: any, index: number) => (
                    <motion.div
                      key={comment.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                    >
                      <CommentItem comment={comment} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                  <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No comments yet</h3>
                  <p className="text-slate-500">Be the first to start the conversation!</p>
                </div>
              )}
            </motion.section>
          </div>
        </div>

        {/* Enhanced right panel */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="w-[380px] shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-700/50 overflow-y-auto"
        >
          <div className="p-6">
            <CommunityRightPanel community={activePost.community || {
              name: activePost.communityName || 'Community',
              description: 'Community description',
              members: activePost.communityMemberCount || 0
            }} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
