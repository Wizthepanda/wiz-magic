import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EngagementRowProps {
  upvotes: number;
  downvotes: number;
  score: number;
  comments: number;
  shares: number;
  userVote?: 'up' | 'down' | null;
  saved: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}

export const EngagementRow: React.FC<EngagementRowProps> = ({
  upvotes,
  downvotes,
  score,
  comments,
  shares,
  userVote,
  saved,
  onUpvote,
  onDownvote,
  onComment,
  onShare,
  onSave
}) => {
  return (
    <div className={cn(
      "flex items-center justify-center gap-3",
      "py-4 px-6 rounded-[20px]",
      "bg-gradient-to-r from-gray-50/80 via-white/60 to-gray-50/80",
      "dark:from-gray-800/50 dark:via-gray-900/30 dark:to-gray-800/50",
      "backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
    )}>
      {/* Upvote/Downvote Group */}
      <div className="flex items-center gap-2">
        {/* Upvote Button */}
        <motion.button
          onClick={onUpvote}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "transition-all duration-300 relative group",
            userVote === 'up'
              ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"
              : "bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/30 dark:hover:to-orange-900/30",
            "border-2",
            userVote === 'up'
              ? "border-orange-400"
              : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-800"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp
            className={cn(
              "w-5 h-5 transition-colors",
              userVote === 'up'
                ? "text-white"
                : "text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400"
            )}
            strokeWidth={2.5}
          />
          {/* Glow Effect */}
          {userVote === 'up' && (
            <motion.div
              className="absolute inset-0 rounded-full bg-orange-500/40 blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Score Display */}
        <div className={cn(
          "px-4 py-2 rounded-full font-bold text-lg min-w-[64px] text-center",
          "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900",
          "border border-gray-200 dark:border-gray-700",
          score > 0 && "text-orange-600 dark:text-orange-400",
          score < 0 && "text-blue-600 dark:text-blue-400",
          score === 0 && "text-gray-600 dark:text-gray-400"
        )}>
          {score > 0 && '+'}{score.toLocaleString()}
        </div>

        {/* Downvote Button */}
        <motion.button
          onClick={onDownvote}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "transition-all duration-300 relative group",
            userVote === 'down'
              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
              : "bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-950/30 dark:hover:to-blue-900/30",
            "border-2",
            userVote === 'down'
              ? "border-blue-400"
              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDown
            className={cn(
              "w-5 h-5 transition-colors",
              userVote === 'down'
                ? "text-white"
                : "text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            )}
            strokeWidth={2.5}
          />
          {/* Glow Effect */}
          {userVote === 'down' && (
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500/40 blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

      {/* Comment Button */}
      <motion.button
        onClick={onComment}
        className={cn(
          "flex items-center gap-2.5 px-5 py-3 rounded-full",
          "bg-white dark:bg-gray-800",
          "border-2 border-gray-200 dark:border-gray-700",
          "hover:border-violet-300 dark:hover:border-violet-800",
          "hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50",
          "dark:hover:from-violet-950/30 dark:hover:to-purple-950/30",
          "transition-all duration-300 group"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" strokeWidth={2} />
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {comments.toLocaleString()}
        </span>
      </motion.button>

      {/* Share Button */}
      <motion.button
        onClick={onShare}
        className={cn(
          "flex items-center gap-2.5 px-5 py-3 rounded-full",
          "bg-white dark:bg-gray-800",
          "border-2 border-gray-200 dark:border-gray-700",
          "hover:border-green-300 dark:hover:border-green-800",
          "hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50",
          "dark:hover:from-green-950/30 dark:hover:to-emerald-950/30",
          "transition-all duration-300 group"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" strokeWidth={2} />
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {shares.toLocaleString()}
        </span>
      </motion.button>

      {/* Save Button */}
      <motion.button
        onClick={onSave}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full",
          "transition-all duration-300 relative group",
          saved
            ? "bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30"
            : "bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-950/30 dark:hover:to-amber-900/30",
          "border-2",
          saved
            ? "border-amber-400"
            : "border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-800"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bookmark
          className={cn(
            "w-5 h-5 transition-colors",
            saved
              ? "text-white fill-white"
              : "text-gray-600 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400"
          )}
          strokeWidth={2}
        />
        {/* Glow Effect */}
        {saved && (
          <motion.div
            className="absolute inset-0 rounded-full bg-amber-500/40 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  );
};
