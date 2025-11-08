import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DiscoverVideo } from '@/hooks/useDiscoverVideosQuery';

interface DiscoverCardProps {
  video: DiscoverVideo;
  onVideoClick: () => void;
  index?: number;
}

/**
 * Premium Discover Video Card Component
 * Features:
 * - Liquid glass aesthetic with gradient overlay
 * - Thumbnail with hover zoom
 * - Play icon on hover with Framer Motion
 * - Creator avatar + name
 * - Title truncated to 2 lines
 * - Category badge
 * - Duration and views
 * - Smooth hover interactions
 * - Responsive design
 */
export const DiscoverCard: React.FC<DiscoverCardProps> = ({ 
  video, 
  onVideoClick,
  index = 0 
}) => {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="group cursor-pointer"
      onClick={onVideoClick}
    >
      <div className={cn(
        "rounded-xl overflow-hidden",
        "bg-white/70 backdrop-blur-xl border border-white/40",
        "shadow-md hover:shadow-xl transition-all duration-300"
      )}>
        {/* Thumbnail Section */}
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          {video.thumbnailURL && !thumbnailError ? (
            <img
              src={video.thumbnailURL}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setThumbnailError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 flex items-center justify-center">
              <Play className="w-16 h-16 text-indigo-400 opacity-50" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play Icon on Hover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={cn(
              "w-16 h-16 rounded-full",
              "bg-white/90 backdrop-blur-md shadow-2xl",
              "flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )}>
              <Play className="w-8 h-8 text-indigo-600 ml-1" fill="currentColor" />
            </div>
          </motion.div>
          
          {/* Duration Badge */}
          {video.duration && (
            <div className={cn(
              "absolute bottom-2 right-2",
              "px-2 py-1 rounded-md",
              "bg-black/80 backdrop-blur-sm",
              "text-xs font-semibold text-white",
              "flex items-center gap-1"
            )}>
              <Clock className="w-3 h-3" />
              {video.duration}
            </div>
          )}
          
          {/* Category Badge */}
          <Badge 
            className={cn(
              "absolute top-2 left-2",
              "bg-white/90 backdrop-blur-md text-gray-900",
              "border border-white/50 shadow-lg",
              "px-2 py-0.5 text-xs font-semibold"
            )}
          >
            {video.category}
          </Badge>
        </div>
        
        {/* Content Section */}
        <div className="p-4">
          {/* Creator Info */}
          <div className="flex items-center gap-2 mb-2">
            <img
              src={
                !avatarError && video.creatorAvatar
                  ? video.creatorAvatar
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creatorId}`
              }
              alt={video.creatorName || 'Creator'}
              className="w-7 h-7 rounded-full object-cover border border-gray-200"
              onError={() => setAvatarError(true)}
            />
            <span className="text-sm font-medium text-gray-700 truncate">
              {video.creatorName || 'Unknown Creator'}
            </span>
          </div>
          
          {/* Video Title */}
          <h3 className={cn(
            "text-sm font-semibold text-gray-900 mb-2",
            "line-clamp-2 min-h-[2.5rem]"
          )}>
            {video.title}
          </h3>
          
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {video.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatViews(video.views)} views</span>
              </div>
            )}
            
            {video.subCategory && (
              <div className="flex items-center">
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {video.subCategory}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Soft Glow on Hover */}
        <div className={cn(
          "absolute inset-0 rounded-xl pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-purple-500/5"
        )} />
      </div>
    </motion.div>
  );
};

