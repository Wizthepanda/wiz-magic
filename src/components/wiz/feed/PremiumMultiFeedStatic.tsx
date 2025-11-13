import React from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
} from "lucide-react";

// Sample data — replace with real data source in your app
const sampleFeed = [
  {
    id: "1",
    community: {
      name: "Faceless Avatars",
      members: 0,
      avatar: "/images/communities/faceless-avatar.png",
    },
    post: {
      title: "Faceless Concert Trailer",
      thumbnail: "/images/posts/faceless-concert-thumb.jpg",
      user: { handle: "facelessavatars7049", avatar: "/images/users/default-avatar.png" },
      timestamp: "4d ago",
      xp: 0,
      upvotes: 0,
      downvotes: 0,
      comments: 0,
    },
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function FeedCard({ item }: { item: any }) {
  const { community, post } = item;

  return (
    <motion.div
      variants={itemVariants}
      className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-violet-100/30 p-6 hover:translate-y-[-2px] hover:scale-[1.01] hover:ring-1 hover:ring-violet-100/60 transition-transform`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={community.avatar}
              alt={community.name}
              className="w-10 h-10 rounded-full ring-2 ring-violet-200"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{community.name}</h3>
            <p className="text-xs text-gray-500">{community.members} members</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="more">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Title + Media */}
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{post.title}</h2>
      <div className="rounded-2xl overflow-hidden shadow-md shadow-violet-100/40 mb-4">
        <img src={post.thumbnail} alt={post.title} className="w-full object-cover" />
      </div>

      {/* Meta Row */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <img src={post.user.avatar} alt={post.user.handle} className="w-6 h-6 rounded-full" />
          <span>@{post.user.handle}</span>
          <span>• {post.timestamp}</span>
        </div>
        <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          +{post.xp} XP
        </span>
      </div>

      {/* Engagement Bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 backdrop-blur-xl border border-violet-100 rounded-full">
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1 text-gray-500 hover:text-pink-500 transition-all" aria-label="upvote">
            <ArrowBigUp /> <span>{post.upvotes}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-all" aria-label="downvote">
            <ArrowBigDown /> <span>{post.downvotes}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-500 hover:text-violet-500 transition-all" aria-label="comments">
            <MessageSquare /> <span>{post.comments}</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-violet-500 transition-all" aria-label="share">
            <Share2 />
          </button>
          <button className="text-gray-500 hover:text-pink-500 transition-all" aria-label="bookmark">
            <Bookmark />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const PremiumMultiFeedStatic: React.FC = () => {
  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-violet-50">
      {/* Top bar remains untouched by this component */}
      <section className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {sampleFeed.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </motion.div>

        {/* Optional loading indicator */}
        <div className="flex justify-center mt-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-pink-500" />
        </div>
      </section>
    </main>
  );
};

export default PremiumMultiFeedStatic;
