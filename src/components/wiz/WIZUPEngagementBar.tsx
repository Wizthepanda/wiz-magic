import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, MessageCircle, Share2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WIZUPEngagementBarProps {
  /** Current vote state */
  userVote: 'up' | 'down' | null;
  /** Total vote count */
  voteCount: number;
  /** Number of comments */
  commentCount: number;
  /** Number of ZAPs earned */
  zapsEarned: number;
  /** Callback for upvote action */
  onUpvote: () => void;
  /** Callback for downvote action */
  onDownvote: () => void;
  /** Callback for comment action */
  onComment: () => void;
  /** Callback for share action */
  onShare: () => void;
  /** Whether to show animations (for performance) */
  enableAnimations?: boolean;
  /** Custom CSS classes */
  className?: string;
}

export const WIZUPEngagementBar: React.FC<WIZUPEngagementBarProps> = ({
  userVote,
  voteCount,
  commentCount,
  zapsEarned,
  onUpvote,
  onDownvote,
  onComment,
  onShare,
  enableAnimations = true,
  className
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between mt-4 px-4 pb-3 border-t border-gray-100/50",
      className
    )}>
      {/* Left side: Engagement actions */}
      <div className="flex items-center gap-5 text-sm text-gray-500">
        {/* Upvote/Downvote/Vote Count Group */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onUpvote}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
              userVote === 'up'
                ? "text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-md"
                : "text-gray-500 hover:text-purple-500 hover:bg-purple-50"
            )}
            disabled={!enableAnimations}
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>

          <motion.span
            key={voteCount}
            initial={{ scale: 1 }}
            animate={{ scale: enableAnimations ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="font-semibold text-gray-700 min-w-[2rem] text-center"
          >
            {voteCount.toLocaleString()}
          </motion.span>

          <motion.button
            onClick={onDownvote}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
              userVote === 'down'
                ? "text-white bg-red-500 shadow-md"
                : "text-gray-500 hover:text-red-500 hover:bg-red-50"
            )}
            disabled={!enableAnimations}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Comment Group */}
        <motion.button
          onClick={onComment}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
          disabled={!enableAnimations}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{commentCount}</span>
        </motion.button>

        {/* Share Group */}
        <motion.button
          onClick={onShare}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
          disabled={!enableAnimations}
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </motion.button>
      </div>

      {/* Right side: ZAPs Earned Chip */}
      <motion.div
        animate={zapsEarned > 0 ? {
          scale: enableAnimations ? [1, 1.05, 1] : 1,
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 10 }
        } : {}}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg border border-yellow-300/50"
      >
        <motion.div
          animate={enableAnimations ? {
            rotate: [0, 10, -10, 0],
            transition: { duration: 2, repeat: Infinity, repeatDelay: 10 }
          } : {}}
        >
          <Zap className="w-3.5 h-3.5" />
        </motion.div>
        <span>+{zapsEarned} ZAPs</span>
      </motion.div>
    </div>
  );
};
