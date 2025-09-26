import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2, Bookmark, UserPlus, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WatchVideoData } from '../WatchDialogV4';

interface ActionRowProps {
  isSubscribed: boolean;
  onSubscribe: () => void;
  video: WatchVideoData;
  className?: string;
}

export const ActionRow = memo<ActionRowProps>(({
  isSubscribed,
  onSubscribe,
  video,
  className
}) => {
  const handleTip = useCallback(() => {
    // Open tip modal - integrate with existing NowPayments flow
    console.log('Open tip modal for:', video.creator.name);
    // This would trigger the existing tip modal
  }, [video.creator.name]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Check out this video by ${video.creator.name}`,
        url: `${window.location.origin}/watch/${video.id}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/watch/${video.id}`);
      // You could show a toast here
    }
  }, [video]);

  const handleSave = useCallback(() => {
    // Save to user's watchlist/favorites
    console.log('Save video:', video.id);
    // This would integrate with user's saved videos
  }, [video.id]);

  return (
    <motion.div
      className={cn("grid grid-cols-4 gap-3", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {/* Subscribe Button */}
      <motion.button
        className="h-[44px] px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-medium rounded-xl shadow-sm hover:shadow-md gpu-accelerated"
        onClick={onSubscribe}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        aria-label={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
      >
        <UserPlus className="w-4 h-4" />
        <span className="text-sm">{isSubscribed ? 'Following' : 'Subscribe'}</span>
      </motion.button>

      {/* Tip Button */}
      <motion.button
        className="h-[44px] px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white font-medium rounded-xl shadow-sm hover:shadow-md gpu-accelerated"
        onClick={handleTip}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        aria-label="Tip creator"
      >
        <DollarSign className="w-4 h-4" />
        <span className="text-sm">Tip</span>
      </motion.button>

      {/* Share Button */}
      <motion.button
        className="h-[44px] w-auto px-3 flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md gpu-accelerated transition-colors"
        onClick={handleShare}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        aria-label="Share video"
      >
        <Share2 className="w-4 h-4 text-gray-600" />
      </motion.button>

      {/* Save Button */}
      <motion.button
        className="h-[44px] w-auto px-3 flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md gpu-accelerated transition-colors"
        onClick={handleSave}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        aria-label="Save video"
      >
        <Bookmark className="w-4 h-4 text-gray-600" />
      </motion.button>
    </motion.div>
  );
});

ActionRow.displayName = 'ActionRow';