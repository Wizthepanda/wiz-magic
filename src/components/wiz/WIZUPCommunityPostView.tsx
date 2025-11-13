// src/components/wiz/WIZUPCommunityPostView.tsx

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostViewStore } from '@/store/postViewStore';
import { usePost, useComments, useCommunity } from '@/hooks/usePostData';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, X, Share2, MessageCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import clsx from 'clsx';



// Small helpers

const backdrop = {

  hidden: { opacity: 0 },

  visible: { opacity: 1 },

};



const modal = {

  hidden: { opacity: 0, scale: 0.98, y: 12 },

  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 30 } },

  exit: { opacity: 0, scale: 0.98, y: 12, transition: { duration: 0.18 } },

};



export const WIZUPCommunityPostView: React.FC = () => {

  const { open, openPostId, closePost, setFeedScroll } = usePostViewStore();

  const qc = useQueryClient();

  const postQuery = usePost(openPostId ?? undefined);

  const post = postQuery.data;

  const communityId = post?.communityId;

  const commentsQuery = useComments(communityId, openPostId ?? undefined);

  const comments = commentsQuery.data ?? [];

  const communityQuery = useCommunity(communityId);

  const community = communityQuery.data;



  const innerRef = useRef<HTMLDivElement | null>(null);



  // No route navigation needed - this works as an overlay within the dashboard



  // restore feed scroll when closing

  useEffect(() => {

    return () => {

      // nothing extra for now

    };

  }, []);



  const handleClose = () => {

    closePost();

  };



  const onShare = async () => {

    try {

      // For now, share the current page URL since we don't have individual post routes

      const url = window.location.href;

      await navigator.clipboard.writeText(url);

      toast.success('Post link copied');

    } catch {

      toast.error('Could not copy link');

    }

  };



  // Layout: left and right panels are not removed; we only occupy the main feed column

  return (

    <AnimatePresence>

      {open && openPostId && (

        <motion.div

          initial="hidden"

          animate="visible"

          exit="hidden"

          variants={backdrop}

          className="fixed inset-0 z-[1200] pointer-events-none"

          aria-hidden

        >

          {/* overlay to dim feed (but keep left/top visible) */}

          <motion.div

            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            onClick={handleClose}

          />



          {/* centered main column modal — constrained to center feed column */}

          <div className="pointer-events-none flex justify-center">

            <motion.div

              ref={innerRef}

              variants={modal}

              initial="hidden"

              animate="visible"

              exit="exit"

              className="pointer-events-auto mt-20 w-[min(920px,90%)] max-h-[80vh] overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl shadow-[0_12px_48px_rgba(18,22,55,0.08)]"

              role="dialog"

              aria-modal="true"

            >

              {/* header row */}

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">

                <div className="flex items-center gap-3">

                  <button onClick={handleClose} aria-label="Close" className="p-2 rounded-full hover:bg-gray-100">

                    <ArrowLeft size={18} />

                  </button>

                  <div className="flex items-center gap-3">

                    <img src={post?.authorAvatar || '/placeholder-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full shadow" />

                    <div>

                      <div className="text-sm font-semibold text-slate-900">{post?.authorName ?? 'Unknown'}</div>

                      <div className="text-xs text-slate-500">

                        @{post?.authorHandle ?? 'unknown'} · {post?.createdAgo ?? '—'}

                        {post?.communityName ? <span className="ml-2 text-xs text-indigo-500">· {post.communityName}</span> : null}

                      </div>

                    </div>

                  </div>

                </div>



                <div className="flex items-center gap-2">

                  <button onClick={onShare} className="rounded-full px-3 py-2 bg-white border hover:shadow">

                    <Share2 size={16} />

                  </button>

                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">

                    <X size={18} />

                  </button>

                </div>

              </div>



              {/* content + engagement + comments */}

              <div className="flex gap-6">

                {/* left area: post content */}

                <div className="flex-1 overflow-auto max-h-[calc(80vh-140px)] p-6">

                  {/* media */}

                  <div className="rounded-xl overflow-hidden mb-4 bg-black">

                    {/* if video: use React Player or React YouTube — use preview */}

                    {post?.videoUrl ? (

                      <video

                        src={post.videoUrl}

                        controls

                        playsInline

                        className="w-full h-auto max-h-[52vh] object-cover"

                        preload="metadata"

                      />

                    ) : (

                      <img src={post?.imageUrl || '/placeholder.png'} alt="media" className="w-full h-auto object-cover" />

                    )}

                  </div>



                  {/* title & description */}

                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">{post?.title}</h2>

                  {post?.description && <p className="text-sm text-slate-600 mb-4">{post.description}</p>}



                  {/* engagement row */}

                  <div className="flex items-center gap-4 py-2 border-t border-b border-gray-100 mb-4">

                    <VoteControls postId={openPostId!} votes={post?.votes} />

                    <button className="flex items-center gap-2 text-sm text-slate-600" onClick={() => {

                      const el = document.getElementById('comments-scroll');

                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    }}>

                      <MessageCircle size={16} /> {comments?.length ?? 0} comments

                    </button>



                    <div className="ml-auto flex items-center gap-2">

                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-400 text-white text-sm">⚡ Watch +{post?.zaps ?? 0}</div>

                    </div>

                  </div>



                  {/* comments */}

                  <div id="comments-scroll" className="space-y-4">

                    <CommentComposer postId={openPostId!} />

                    {comments?.map((c) => (

                      <CommentCard key={c.id} comment={c} />

                    ))}

                  </div>

                </div>



                {/* right sidebar: community info */}

                <aside className="w-[320px] border-l border-gray-100 p-5 overflow-auto">

                  <div className="rounded-xl bg-white/70 p-4 shadow-sm">

                    <div className="flex items-center gap-3">

                      <img src={community?.avatarUrl || '/community-placeholder.png'} alt="community" className="w-14 h-14 rounded-lg" />

                      <div>

                        <div className="text-lg font-semibold text-slate-900">{community?.name ?? 'Community'}</div>

                        <div className="text-xs text-slate-500">{community?.memberCount ?? 0} members</div>

                      </div>

                    </div>



                    <p className="mt-3 text-sm text-slate-600">{community?.about ?? 'No description yet.'}</p>



                    <div className="mt-4">

                      <button className="w-full py-2 rounded-full bg-gradient-to-r from-indigo-600 to-pink-400 text-white font-medium shadow">Join community</button>

                    </div>



                    <div className="mt-4">

                      <h4 className="text-sm font-semibold text-slate-800 mb-2">Top contributors</h4>

                      {community?.topContributors?.map((c: any) => (

                        <div key={c.id} className="flex items-center justify-between py-2">

                          <div className="flex items-center gap-3">

                            <img src={c.avatar} className="w-8 h-8 rounded-full" alt="" />

                            <div className="text-sm">{c.username}</div>

                          </div>

                          <div className="text-sm text-indigo-500">{c.zaps} ZAPs</div>

                        </div>

                      ))}

                    </div>

                  </div>

                </aside>

              </div>

            </motion.div>

          </div>

        </motion.div>

      )}

    </AnimatePresence>

  );

};



// --- Subcomponents: VoteControls, CommentComposer, CommentCard

// (kept minimal here — full versions should validate auth & call cloud functions)



const VoteControls: React.FC<{ postId: string; votes?: number; }> = ({ postId, votes = 0 }) => {

  const onUp = async () => {

    // call cloud function or write to Firestore with optimistic update

    // show particle animation, increment count

    // TODO: integrate with cloud function / anti-cheat

  };

  const onDown = async () => {};

  return (

    <div className="flex items-center gap-2">

      <button onClick={onUp} className="px-3 py-2 rounded-md bg-white border hover:shadow">

        ⬆️

      </button>

      <div className="text-sm font-medium text-slate-700 w-12 text-center">{votes}</div>

      <button onClick={onDown} className="px-3 py-2 rounded-md bg-white border hover:shadow">

        ⬇️

      </button>

    </div>

  );

};



const CommentComposer: React.FC<{ postId: string }> = ({ postId }) => {

  const [v, setV] = React.useState('');

  const onPost = async () => {

    if (!v.trim()) return;

    // write to Firestore subcollection posts/{id}/comments

    setV('');

  };

  return (

    <div className="rounded-lg bg-white/60 p-3">

      <textarea value={v} onChange={(e) => setV(e.target.value)} className="w-full resize-none bg-transparent outline-none" placeholder="Add a comment..." />

      <div className="flex justify-end mt-2">

        <button onClick={onPost} className="px-4 py-2 rounded-full bg-indigo-600 text-white">Comment</button>

      </div>

    </div>

  );

};



const CommentCard: React.FC<{ comment: any }> = ({ comment }) => {

  return (

    <div className="rounded-lg bg-white p-3 border">

      <div className="flex items-start gap-3">

        <img src={comment.authorAvatar || '/placeholder-avatar.png'} className="w-9 h-9 rounded-full" alt="" />

        <div>

          <div className="flex items-center gap-2">

            <div className="text-sm font-semibold">{comment.authorName}</div>

            <div className="text-xs text-slate-500">{comment.createdAgo}</div>

          </div>

          <div className="text-sm text-slate-700 mt-1">{comment.text}</div>

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">

            <button>Upvote</button>

            <button>Reply</button>

            <button>Share</button>

          </div>

        </div>

      </div>

    </div>

  );

};