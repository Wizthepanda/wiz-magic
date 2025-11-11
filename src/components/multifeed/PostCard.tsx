import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { PostItem, formatNumber, formatTimestamp } from '@/lib/feed-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: PostItem;
  onLike?: (postId: string) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'bg-white/6 backdrop-blur-md border border-white/10',
        'shadow-lg hover:shadow-2xl hover:shadow-purple-500/20',
        'transition-all duration-300'
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-start gap-3">
        <img
          src={post.avatar}
          alt={post.author}
          className="w-10 h-10 rounded-full border-2 border-purple-500/50"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">
            {post.author}
          </h4>
          <p className="text-neutral-400 text-xs">
            {formatTimestamp(post.timestamp)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Image (if exists) */}
      {post.image && (
        <div className="px-4 pb-3">
          <div className="relative rounded-xl overflow-hidden bg-black/20">
            <img
              src={post.image}
              alt="Post attachment"
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pt-0 flex items-center gap-2 border-t border-white/10 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike?.(post.id)}
          className="flex-1 text-neutral-300 hover:text-pink-400 hover:bg-pink-500/10"
        >
          <Heart className="w-4 h-4 mr-1" />
          <span className="text-xs">{formatNumber(post.likes)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-neutral-300 hover:text-blue-400 hover:bg-blue-500/10"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="text-xs">{formatNumber(post.comments)}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-300 hover:text-purple-400 hover:bg-purple-500/10"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
