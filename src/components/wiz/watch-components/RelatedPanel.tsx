import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Clock, Eye, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import OptimizedImage from '@/components/ui/optimized-image';
import { WatchVideoData } from '../WatchDialogV4';

interface RelatedPanelProps {
  videos: WatchVideoData[];
  onVideoSelect: (video: WatchVideoData) => void;
  isMobile: boolean;
}

// Related video card component
const RelatedVideoCard = memo<{
  video: WatchVideoData;
  onSelect: () => void;
  index: number;
  isMobile: boolean;
}>(({ video, onSelect, index, isMobile }) => {
  return (
    <motion.div
      className={cn(
        "group cursor-pointer gpu-accelerated",
        isMobile ? "flex-shrink-0 w-72 mx-2" : "mb-3"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={onSelect}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
        {isMobile ? (
          /* Mobile: Vertical layout */
          <div>
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
              <OptimizedImage
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              />

              {/* Duration overlay */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {video.duration}
              </div>

              {/* ZAPs reward badge */}
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                +{video.xpReward} ⚡ ZAPs
              </div>
            </div>

            {/* Video info */}
            <div>
              <h4 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {video.title}
              </h4>

              <p className="text-xs text-gray-600 mb-2">{video.creator.name}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.views}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  {video.xpReward} ⚡
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop: Horizontal layout */
          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="relative w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0">
              <OptimizedImage
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
              />

              {/* Duration overlay */}
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                {video.duration}
              </div>
            </div>

            {/* Video info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                {video.title}
              </h4>

              <p className="text-xs text-gray-600 mb-2">{video.creator.name}</p>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.views}
                </span>
                <span className="flex items-center gap-1 text-purple-600 font-medium">
                  <Zap className="w-3 h-3" />
                  +{video.xpReward} ⚡
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

RelatedVideoCard.displayName = 'RelatedVideoCard';

export const RelatedPanel = memo<RelatedPanelProps>(({
  videos,
  onVideoSelect,
  isMobile
}) => {
  const [emblaRef] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const handleVideoSelect = useCallback((video: WatchVideoData) => {
    onVideoSelect(video);
  }, [onVideoSelect]);

  if (videos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-sm">No related videos available</p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "h-full",
        isMobile ? "px-4 py-6" : "py-4"
      )}
      initial={{ opacity: 0, x: isMobile ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between mb-4",
        isMobile && "px-2"
      )}>
        <h3 className="text-lg font-semibold text-gray-900">Up Next</h3>
        <span className="text-sm text-gray-500">{videos.length} videos</span>
      </div>

      {isMobile ? (
        /* Mobile: Embla carousel */
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {videos.map((video, index) => (
              <RelatedVideoCard
                key={video.id}
                video={video}
                onSelect={() => handleVideoSelect(video)}
                index={index}
                isMobile={true}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Desktop: Vertical scrollable list */
        <div className="space-y-0 overflow-y-auto smooth-scroll pr-2" style={{ maxHeight: '70vh' }}>
          {videos.map((video, index) => (
            <RelatedVideoCard
              key={video.id}
              video={video}
              onSelect={() => handleVideoSelect(video)}
              index={index}
              isMobile={false}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator for mobile */}
      {isMobile && videos.length > 1 && (
        <div className="flex justify-center mt-4 space-x-1">
          {videos.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className="w-1.5 h-1.5 rounded-full bg-gray-300"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
});

RelatedPanel.displayName = 'RelatedPanel';