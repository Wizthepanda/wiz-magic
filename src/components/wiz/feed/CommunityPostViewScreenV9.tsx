import React, { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactPlayer from "react-player/lazy";
import { usePostViewStore } from "@/store/postViewStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Share2, User, Trophy } from "lucide-react";
import clsx from "clsx";

/**
 * Minimal, premium CommunityPostViewScreen V9
 * - solid background (no transparency)
 * - guaranteed scroll to top on open
 * - flawless media loading with fade-in
 * - minimal comments composer
 * - right panel with Join / members / active now / leaderboard
 *
 * NOTE: Do NOT modify outside files. This component relies on your existing Zustand store.
 */

// small helper for avatar source picking
const avatarSrcFrom = (post: any) =>
  post?.author?.imageUrl ||
  post?.author?.profilePic ||
  post?.author?.avatar ||
  post?.avatar ||
  "/images/default-avatar.png";

type MediaItem = { type: "image" | "video"; url: string; poster?: string };

// --- utility: find first scrollable ancestor ---
function findScrollableAncestor(el: HTMLElement | null) {
  if (!el) return document.scrollingElement || document.documentElement;
  let cur: HTMLElement | null = el;
  while (cur && cur !== document.body) {
    const s = window.getComputedStyle(cur);
    const overflowY = s.overflowY;
    const canScroll = (overflowY === "auto" || overflowY === "scroll") && cur.scrollHeight > cur.clientHeight;
    if (canScroll) return cur;
    cur = cur.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

// --- scroll helper: rAF loop to ensure layout settled ---
function scrollToTopOf(el: Element | null) {
  if (!el) return;
  const target = findScrollableAncestor(el as HTMLElement) as Element;
  let tries = 0;
  const maxTries = 10;
  const run = () => {
    tries++;
    try {
      // prefer instant behavior so the user lands at top immediately
      (target as any).scrollTo?.({ top: 0, behavior: "instant" });
      // fallback:
      if (target === document.scrollingElement || target === document.documentElement) {
        window.scrollTo?.({ top: 0, behavior: "instant" });
      }
    } catch (err) {
      // ignore
    }
    if (tries < maxTries) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}

export const CommunityPostViewScreenV9: React.FC = () => {
  const { activePost, closePost } = usePostViewStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [videosReady, setVideosReady] = useState<Record<string, boolean>>({});
  const [mediaLightMode, setMediaLightMode] = useState<Record<string, boolean>>({}); // for ReactPlayer light thumbnails

  const postId = activePost?.id;

  // ensure scroll to top whenever activePost changes - bulletproof fix with animation sync
  useEffect(() => {
    if (!postId) return;
    // small timeout guarded race-safe fallback if animationComplete didn't fire
    const fallback = setTimeout(() => scrollToTopOf(containerRef.current), 30);
    return () => clearTimeout(fallback);
  }, [postId]);

  // minimal optimistic comment post (replace with your API call)
  const postComment = async () => {
    if (!activePost || !commentText.trim()) return;
    setPosting(true);
    const optimistic = {
      id: `optimistic-${Date.now()}`,
      user: "You",
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    // optimistic update into the local object (mutate shallowly - adapt to your state flow)
    if (!activePost.comments) activePost.comments = [];
    activePost.comments.unshift(optimistic);
    setCommentText("");

    try {
      // call your comment API here
      // await api.postComment(activePost.id, optimistic.text)
      // on success: replace optimistic flag if needed
      setTimeout(() => {
        optimistic.optimistic = false;
      }, 600);
    } catch (err) {
      // rollback on error
      activePost.comments = activePost.comments.filter((c: any) => c.id !== optimistic.id);
      // show toast/error (not implemented here)
    } finally {
      setPosting(false);
    }
  };

  // media list normalized with defensive type checking
  const media: MediaItem[] = useMemo(() => {
    if (!activePost) return [];
    
    // Handle different media formats safely
    let mediaItems: any[] = [];
    
    if (activePost.media) {
      if (Array.isArray(activePost.media)) {
        mediaItems = activePost.media;
      } else if (typeof activePost.media === 'string') {
        mediaItems = [activePost.media];
      } else if (typeof activePost.media === 'object') {
        mediaItems = [activePost.media];
      }
    }
    
    // Also check for individual video/image fields as fallback
    if (mediaItems.length === 0) {
      if (activePost.videoUrl) {
        mediaItems.push({ type: 'video', url: activePost.videoUrl, poster: activePost.thumbnailUrl });
      }
      if (activePost.imageUrl) {
        mediaItems.push({ type: 'image', url: activePost.imageUrl });
      }
    }
    
    return mediaItems.map((u: any) => {
      if (!u) return null;
      
      const isVideo = typeof u === "object" ? 
        (u.type === "video" || u.videoUrl || /\.(mp4|webm|mov)$/i.test(u.url || '')) : 
        /\.(mp4|webm|mov|youtube|youtu\.be|vimeo)$/i.test(u);
        
      if (typeof u === "string") {
        return isVideo ? { type: "video", url: u } : { type: "image", url: u };
      }
      
      return { 
        type: u.type || (isVideo ? "video" : "image"), 
        url: u.url || u.videoUrl || u.imageUrl || u, 
        poster: u.poster || u.thumbnail || u.thumbnailUrl 
      };
    }).filter(Boolean); // Remove any null entries
  }, [activePost]);

  if (!activePost) return null;

  return (
    <AnimatePresence>
      {activePost && (
        <motion.div
          key={postId}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          onAnimationComplete={() => {
            // animation finished — now force scroll to top of the correct container
            scrollToTopOf(containerRef.current);
          }}
          ref={containerRef}
          className="fixed inset-0 z-50 flex bg-[#FAFBFF] dark:bg-[#060608] shadow-[0_12px_60px_rgba(2,6,23,0.35)]"
          aria-modal="true"
          role="dialog"
        >
          {/* Main column */}
          <div
            className="flex-1 max-w-[980px] mx-auto overflow-y-scroll py-8 px-6 md:px-10"
            tabIndex={-1}
          >
            {/* header row: back + avatar + meta (very minimal) */}
            <div className="flex items-center gap-3 mb-6">
              <Button variant="ghost" size="icon" onClick={closePost} aria-label="Close post view">
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <img
                src={avatarSrcFrom(activePost)}
                onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")}
                alt={activePost.author?.name || "author avatar"}
                className="w-9 h-9 rounded-full object-cover"
                loading="lazy"
              />

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ml-1">
                <span className="font-medium text-gray-800 dark:text-gray-100">{activePost.author?.name || activePost.author?.username || "Anonymous"}</span>
                <span className="opacity-40">•</span>
                <time className="opacity-60">{new Date(activePost.createdAt || Date.now()).toLocaleString()}</time>
              </div>
            </div>

            {/* core card */}
            <article
              onClick={(e) => e.stopPropagation()} // parent feed click is already handled upstream; defensively prevent further bubbling
              className="bg-white dark:bg-[#0B0B0D] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-[#111214]"
              role="article"
            >
              {/* Title (visual only — no extra heading text) */}
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-semibold leading-tight text-gray-900 dark:text-white">
                  {activePost.title}
                </h1>
              </div>

              {/* Body */}
              {activePost.content && (
                <p className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {activePost.content}
                </p>
              )}

              {/* Media gallery (minimal grid) */}
              {media.length > 0 && (
                <div className={clsx("grid gap-4", media.length === 1 ? "grid-cols-1" : media.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
                  {media.map((m, idx) => {
                    const id = `${activePost.id}-media-${idx}`;

                    if (m.type === "image") {
                      return (
                        <div key={id} className="rounded-xl overflow-hidden relative bg-gray-50 dark:bg-[#050506]">
                          <img
                            src={m.url}
                            alt=""
                            className={clsx(
                              "w-full h-full object-cover transition-opacity duration-300 ease-in-out",
                              imagesLoaded[m.url] ? "opacity-100" : "opacity-0"
                            )}
                            style={{ maxHeight: 520 }}
                            onLoad={() => setImagesLoaded((s) => ({ ...s, [m.url]: true }))}
                            onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/images/default-placeholder.png")}
                            loading="lazy"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {/* soft placeholder while loading */}
                          {!imagesLoaded[m.url] && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-gray-200/60 animate-pulse" />
                            </div>
                          )}
                        </div>
                      );
                    }

                    // video
                    return (
                      <div key={id} className="rounded-xl overflow-hidden bg-black/5 relative">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="w-full aspect-video"
                          aria-hidden={false}
                        >
                          <ReactPlayer
                            url={m.url}
                            className="react-player"
                            width="100%"
                            height="100%"
                            controls
                            light={m.poster ?? true}
                            onReady={() => setVideosReady((s) => ({ ...s, [m.url]: true }))}
                            onClickPreview={() => {}}
                            config={{
                              file: { attributes: { playsInline: true } },
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* action row (compact, minimal) */}
              <div className="flex items-center gap-4 mt-6 text-gray-600 dark:text-gray-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // implement upvote handler
                  }}
                  aria-label="Upvote"
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm">{activePost.upvotes ?? activePost.votes?.up ?? 0}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // implement downvote handler
                  }}
                  aria-label="Downvote"
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span className="text-sm">{activePost.downvotes ?? activePost.votes?.down ?? 0}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // focus composer
                    const el = document.getElementById("post-comment-input");
                    if (el) (el as HTMLInputElement).focus();
                  }}
                  aria-label="Comment"
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">{(activePost.comments?.length) ?? activePost.commentCount ?? 0}</span>
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); /* share */ }}
                    aria-label="Share"
                    className="p-2 rounded-md hover:bg-gray-50 dark:hover:bg-[#0F0F12] transition"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* comments composer */}
              <div className="mt-6">
                <div className="flex items-start gap-3">
                  <img
                    src={avatarSrcFrom(activePost)}
                    alt="your avatar"
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")}
                    loading="lazy"
                  />

                  <div className="flex-1">
                    <div className="relative">
                      <input
                        id="post-comment-input"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            postComment();
                          }
                        }}
                        placeholder="Add a comment…"
                        className="w-full bg-gray-50 dark:bg-[#08080A] border border-gray-100 dark:border-[#101114] rounded-lg px-4 py-3 text-sm placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        aria-label="Add a comment"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          postComment();
                        }}
                        disabled={posting || commentText.trim().length === 0}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md disabled:opacity-40"
                        aria-label="Send comment"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-3">
                      {(activePost.comments || []).map((c: any) => (
                        <div
                          key={c.id || c.createdAt}
                          className="flex items-start gap-3 bg-transparent"
                        >
                          <img
                            src={c.avatar || c.author?.avatar || "/images/default-avatar.png"}
                            alt={c.user || c.authorName || "commenter"}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")}
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{c.user || c.authorName || "Anonymous"}</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">{c.text || c.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* right fixed panel: minimal micro UI (no big titles) */}
          <aside className="w-[350px] shrink-0 bg-white dark:bg-[#060608] border-l border-gray-100 dark:border-[#111214] p-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={(e) => { e.stopPropagation(); /* join/leave logic */ }} className="w-full">
                  {/* subtle icon + action */}
                  <span className="flex items-center justify-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Join</span>
                  </span>
                </Button>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{activePost.community?.members ?? activePost.communityMemberCount ?? "—"}</span>
                    <span className="opacity-40">members</span>
                  </div>
                  <div className="mt-1 text-xs opacity-60">active now {activePost.community?.activeNow ?? "—"}</div>
                </div>
                <div className="w-10 h-10 rounded-md bg-gray-100 dark:bg-[#0B0B0D] flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                </div>
              </div>

              {/* compact leaderboard */}
              <div className="bg-gray-50 dark:bg-[#070708] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Leaderboard</div>
                </div>

                <ol className="space-y-2">
                  {(activePost.community?.leaderboard || []).slice(0, 5).map((u: any, i: number) => (
                    <li key={u.id || i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-6">{i + 1}</span>
                        <img src={u.avatar || "/images/default-avatar.png"} onError={(e) => (e.currentTarget.src = "/images/default-avatar.png")} className="w-6 h-6 rounded-full object-cover" />
                        <span className="truncate max-w-[150px]">{u.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">{u.points}</div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* related / trending small list */}
              <div className="space-y-2">
                {(activePost.community?.trending || []).slice(0, 4).map((t: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm hover:bg-gray-50 dark:hover:bg-[#0B0B0E] p-2 rounded-md cursor-pointer" onClick={(e) => { e.stopPropagation(); /* open related post */ }}>
                    <div className="w-2 h-2 bg-violet-400 rounded-full" />
                    <div className="truncate">{t.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommunityPostViewScreenV9;