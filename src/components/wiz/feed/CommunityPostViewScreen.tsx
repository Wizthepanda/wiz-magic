import { motion, AnimatePresence } from "framer-motion";
import { usePostViewStore } from "@/store/postViewStore";
import { ArrowLeft, MessageSquare, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityRightPanel } from "../right/CommunityRightPanel";
import { useEffect, useRef } from "react";

export const CommunityPostViewScreen = () => {
  const { activePost, closePost } = usePostViewStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll-to-top helper (robust against media/layout shifts)
  useEffect(() => {
    let rafId: number | null = null;
    let attempts = 0;
    const maxAttempts = 6;

    const scrollToTop = () => {
      if (!scrollContainerRef.current) return;
      // Use instant (no animation) — user expects top-of-post showing immediately
      scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: "auto" });

      // If content still shifts (images loading), retry a few times spaced by RAF
      attempts += 1;
      if (attempts < maxAttempts) {
        rafId = requestAnimationFrame(() => {
          // small additional tick to ensure layout settled
          rafId = requestAnimationFrame(scrollToTop);
        });
      }
    };

    // Run on mount
    rafId = requestAnimationFrame(scrollToTop);

    // Also attach a one-time 'load' listener for images inside the container
    const imgs = scrollContainerRef.current?.querySelectorAll("img") ?? [];
    let imagesToLoad = Array.from(imgs).filter((img) => !img.complete).length;

    const onImgLoad = () => {
      imagesToLoad -= 1;
      // once images load, ensure we are at top
      if (imagesToLoad <= 0) {
        // run one final ensure
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    if (imagesToLoad > 0) {
      imgs.forEach((img) => img.addEventListener("load", onImgLoad, { once: true }));
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      imgs.forEach((img) => img.removeEventListener("load", onImgLoad));
    };
  }, [activePost]); // re-run when activePost changes (opening any post will scroll to top)

  return (
    <AnimatePresence>
      {activePost && (
        <motion.div
          key="post-view"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 flex z-40"
        >
          <div
            ref={scrollContainerRef}
            className="w-full h-full overflow-y-auto bg-[#FAFAFF]"
          >
            <div className="flex">
              {/* Main content area */}
              <div className="flex-1 px-8 py-6 border-r border-gray-200">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <Button variant="ghost" size="icon" onClick={closePost}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-lg font-semibold">Post by {activePost.authorName || activePost.author}</h2>
                </div>

                {/* Post content */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <h3 className="text-xl font-bold mb-3">{activePost.title}</h3>
                  <p className="text-gray-700 mb-4">{activePost.content || activePost.excerpt}</p>

                  {/* Media (optional) */}
                  {activePost.media?.thumbnail && (
                    <img
                      src={activePost.media.thumbnail}
                      alt=""
                      className="rounded-xl w-full object-cover max-h-[400px]"
                    />
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-4 text-gray-500">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition">
                      <ThumbsUp className="w-5 h-5" /> {activePost.upvotes ?? activePost.score ?? 0}
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-500 transition">
                      <ThumbsDown className="w-5 h-5" /> {activePost.downvotes ?? 0}
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-700 transition">
                      <MessageSquare className="w-5 h-5" /> {activePost.comments?.length ?? activePost.commentCount ?? 0}
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-700 transition">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800">Comments</h4>
                  {activePost.comments?.map((c: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 mb-2">
                      <p className="font-semibold text-sm">{c.authorName || c.user}</p>
                      <p className="text-gray-700 text-sm">{c.content || c.text}</p>
                    </div>
                  ))}
                  {(!activePost.comments || activePost.comments.length === 0) && (
                    <p className="text-gray-500 text-sm">No comments yet.</p>
                  )}
                </div>
              </div>

              {/* Right side panel */}
              <div className="w-[350px] shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-6">
                <CommunityRightPanel community={activePost.community || {
                  name: activePost.communityName || 'Community',
                  description: 'Community description',
                  members: activePost.communityMemberCount || 0
                }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
