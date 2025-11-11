import { motion } from 'framer-motion';
import { Play, Heart, MessageCircle, Share2, Award, Clock, Eye } from 'lucide-react';
import { VideoItem, formatNumber } from '@/lib/feed-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: VideoItem;
  onPlay?: (video: VideoItem) => void;
  onLike?: (videoId: string) => void;
}

export function VideoCard({ video, onPlay, onLike }: VideoCardProps) {
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
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden bg-black/20">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button overlay */}
        <motion.button
          onClick={() => onPlay?.(video)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Play ${video.title}`}
        >
          <div className="w-16 h-16 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center shadow-2xl">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </motion.button>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {video.isNew && (
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
              NEW
            </span>
          )}
          {video.watched && (
            <span className="px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
              ✓ WATCHED
            </span>
          )}
        </div>

        {/* Duration */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold rounded">
          {video.duration}
        </div>

        {/* Progress bar */}
        {video.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${video.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-white font-semibold text-base line-clamp-2 leading-snug">
          {video.title}
        </h3>

        {/* Creator */}
        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
            {video.creator.charAt(0)}
          </div>
          <span className="truncate">{video.creator}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{formatNumber(video.views)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{video.duration}</span>
          </div>
        </div>

        {/* XP Reward */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-300">
            +{video.xpReward} XP
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike?.(video.id)}
            className="flex-1 text-neutral-300 hover:text-pink-400 hover:bg-pink-500/10"
          >
            <Heart className="w-4 h-4 mr-1" />
            <span className="text-xs">{formatNumber(video.likes)}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-neutral-300 hover:text-blue-400 hover:bg-blue-500/10"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">{formatNumber(video.comments)}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-300 hover:text-purple-400 hover:bg-purple-500/10"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
