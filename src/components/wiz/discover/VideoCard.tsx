import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import type { Video } from '@/hooks/useCategoryInfinite';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  enablePreview?: boolean;
  className?: string;
}

/**
 * VideoCard Component
 *
 * Features:
 * - Cinematic thumbnail with hover effects
 * - 3s muted autoplay preview on hover (desktop only)
 * - ZAP pulse animation
 * - Creator chip
 * - Glass morphic styling
 * - Keyboard accessible
 */
export function VideoCard({
  video,
  onClick,
  enablePreview = true,
  className
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Handle hover preview (desktop only)
  const handleMouseEnter = () => {
    setIsHovering(true);

    // Only preview on desktop
    if (!enablePreview || !videoRef.current) return;

    // Start preview after 500ms hover
    timeoutRef.current = setTimeout(() => {
      if (videoRef.current && !previewError) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => {
          console.warn('Preview playback failed:', err);
          setPreviewError(true);
        });
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);

    // Clear timeout and stop preview
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Handle click
  const handleClick = () => {
    onClick(video);
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(video);
    }
  };

  return (
    <motion.article
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer",
        isDark
          ? "bg-dark-bg-secondary/95 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-purple-500/20"
          : "bg-white/60 backdrop-blur-sm shadow-md hover:shadow-xl",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Watch ${video.title}`}
    >
      {/* Thumbnail / Video Preview Container */}
      <div className="relative h-44 w-full bg-zinc-900 rounded-t-2xl overflow-hidden">
        {/* Thumbnail Image */}
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isHovering && !previewError ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Video Preview (hidden by default, shown on hover) */}
        {enablePreview && !previewError && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              isHovering ? "opacity-100" : "opacity-0"
            )}
            src={`https://www.youtube.com/watch?v=${video.videoId}`}
            poster={video.thumbnail}
            onError={() => setPreviewError(true)}
          />
        )}

        {/* Gradient Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          )}
        />

        {/* Play Button Overlay */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "opacity-0 group-hover:opacity-100 transition-all duration-300"
          )}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: isHovering ? 1 : 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              "bg-white/10 backdrop-blur-md rounded-full p-4",
              "border border-white/30 shadow-2xl"
            )}
          >
            <Play className="w-6 h-6 text-white fill-white" />
          </motion.div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {video.duration}
        </div>

        {/* ZAP Badge with Pulse Animation */}
        <motion.div
          animate={{
            scale: video.xpReward > 200 ? [1, 1.1, 1] : 1
          }}
          transition={{
            duration: 2,
            repeat: video.xpReward > 200 ? Infinity : 0,
            ease: 'easeInOut'
          }}
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg"
        >
          <Zap className="w-3 h-3 fill-white" />
          {video.xpReward}
        </motion.div>
      </div>

      {/* Card Content */}
      <div className={cn(
        "p-4 transition-colors duration-300",
        isDark ? "bg-dark-bg-secondary/95" : "bg-white/80 backdrop-blur-sm"
      )}>
        {/* Title */}
        <h3
          className={cn(
            "text-base font-semibold line-clamp-2 mb-2 transition-colors duration-200",
            isDark
              ? "text-dark-text-primary group-hover:text-purple-400"
              : "text-gray-900 group-hover:text-indigo-600"
          )}
        >
          {video.title}
        </h3>

        {/* Creator Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 ring-2 ring-white/30">
              <AvatarImage src={video.creator.avatar} alt={video.creator.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold">
                {video.creator.name[0]?.toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className={cn(
                "font-medium truncate max-w-[120px]",
                isDark ? "text-dark-text-primary" : "text-gray-900"
              )}>
                {video.creator.name}
              </span>
              {video.creator.level && (
                <span className={cn(
                  "text-[10px]",
                  isDark ? "text-dark-text-muted" : "text-gray-500"
                )}>
                  Lv. {video.creator.level}
                </span>
              )}
            </div>
          </div>

          {/* Views */}
          <div className={cn(
            "flex items-center gap-1",
            isDark ? "text-dark-text-muted" : "text-gray-500"
          )}>
            <Eye className="w-3 h-3" />
            <span className="text-[10px]">{video.views}</span>
          </div>
        </div>
      </div>

      {/* Verified Badge (if creator is verified) */}
      {video.creator.isVerified && (
        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center gap-1">
          ✓ Verified
        </div>
      )}
    </motion.article>
  );
}

/**
 * VideoCardSkeleton Component
 * Loading placeholder for video cards
 */
export function VideoCardSkeleton({ className }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden animate-pulse",
        isDark ? "bg-dark-bg-secondary/60" : "bg-white/60 backdrop-blur-sm",
        className
      )}
    >
      {/* Thumbnail Skeleton */}
      <div className={cn(
        "h-44 w-full",
        isDark ? "bg-dark-surface-300" : "bg-gray-200"
      )} />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        <div className={cn(
          "h-4 rounded",
          isDark ? "bg-dark-surface-300" : "bg-gray-200"
        )} />
        <div className={cn(
          "h-3 w-3/4 rounded",
          isDark ? "bg-dark-surface-300" : "bg-gray-200"
        )} />

        <div className="flex items-center gap-2">
          <div className={cn(
            "w-7 h-7 rounded-full",
            isDark ? "bg-dark-surface-300" : "bg-gray-200"
          )} />
          <div className="flex-1 space-y-1.5">
            <div className={cn(
              "h-2.5 w-24 rounded",
              isDark ? "bg-dark-surface-300" : "bg-gray-200"
            )} />
            <div className={cn(
              "h-2 w-16 rounded",
              isDark ? "bg-dark-surface-300" : "bg-gray-200"
            )} />
          </div>
        </div>
      </div>
    </div>
  );
}
