import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Creator } from '@/hooks/useCreatorsQuery';

interface CreatorCardProps {
  creator: Creator;
  onViewCreator: () => void;
  index?: number;
}

/**
 * Premium Creator Card Component
 * Features:
 * - Elevated liquid glass aesthetic
 * - Banner with gradient overlay
 * - Overlapping circular profile image
 * - Category badge on banner
 * - Stats row with icons
 * - Smooth hover interactions with Framer Motion
 * - Responsive design
 */
export const CreatorCard: React.FC<CreatorCardProps> = ({ 
  creator, 
  onViewCreator,
  index = 0 
}) => {
  const [bannerError, setBannerError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="group"
    >
      <div 
        className={cn(
          "relative rounded-2xl overflow-hidden cursor-pointer",
          "bg-white/70 backdrop-blur-xl border border-white/40",
          "shadow-lg hover:shadow-2xl transition-all duration-300",
          "flex flex-col h-full min-h-[380px]"
        )}
        onClick={onViewCreator}
      >
        {/* Banner Section */}
        <div className="relative w-full h-32 overflow-hidden flex-shrink-0">
          {creator.bannerImageURL && !bannerError ? (
            <>
              <img
                src={creator.bannerImageURL}
                alt={`${creator.displayName}'s banner`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={() => setBannerError(true)}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          
          {/* Category Badge */}
          {creator.category && (
            <Badge 
              className={cn(
                "absolute top-3 right-3 z-10",
                "bg-white/90 backdrop-blur-md text-gray-900",
                "border border-white/50 shadow-lg",
                "px-3 py-1 text-xs font-semibold"
              )}
            >
              {creator.category}
            </Badge>
          )}
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col items-center p-6 flex-grow">
          {/* Profile Image - Overlapping Banner */}
          <div className="relative -mt-12 mb-4 flex-shrink-0">
            <div className="relative">
              <img
                src={
                  !avatarError && creator.profileImageURL 
                    ? creator.profileImageURL 
                    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`
                }
                alt={creator.displayName}
                className={cn(
                  "w-20 h-20 rounded-full object-cover",
                  "border-4 border-white shadow-xl",
                  "bg-white",
                  "group-hover:scale-110 transition-transform duration-300"
                )}
                onError={() => setAvatarError(true)}
              />
              
              {/* Verified Badge */}
              {creator.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Creator Name */}
          <h3 className={cn(
            "text-lg font-bold text-gray-900 text-center mb-1",
            "line-clamp-1 w-full px-2"
          )}>
            {creator.displayName}
          </h3>
          
          {/* Bio */}
          {creator.bio && (
            <p className={cn(
              "text-sm text-gray-600 text-center mb-4",
              "line-clamp-2 w-full px-2 flex-grow min-h-[2.5rem]"
            )}>
              {creator.bio}
            </p>
          )}
          
          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-5 flex-shrink-0">
            {/* Subscribers */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-base font-bold text-gray-900">
                {formatCount(creator.subscribersCount)}
              </div>
              <div className="text-xs text-gray-600">Subscribers</div>
            </div>
            
            {/* Videos */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-1">
                <Video className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-base font-bold text-gray-900">
                {formatCount(creator.videosCount)}
              </div>
              <div className="text-xs text-gray-600">Videos</div>
            </div>
          </div>
          
          {/* View Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewCreator();
            }}
            className={cn(
              "w-full rounded-xl font-semibold flex-shrink-0 mt-auto",
              "bg-gradient-to-r from-indigo-600 to-violet-500",
              "hover:from-indigo-700 hover:to-violet-600",
              "shadow-md hover:shadow-xl",
              "transform hover:scale-[1.02] transition-all duration-200"
            )}
          >
            View Creator
          </Button>
        </div>
        
        {/* Soft Glow on Hover */}
        <div className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10"
        )} />
      </div>
    </motion.div>
  );
};

