import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreatorVideo } from '../CreatorPublicProfileV2';

interface VideoGridProps {
  videos: CreatorVideo[];
  onVideoClick: (video: CreatorVideo) => void;
}

/**
 * VideoGrid Component
 *
 * Responsive video grid with:
 * - 3 columns desktop, 2 tablet, 1 mobile
 * - Hover preview animations
 * - ZAPs reward display
 * - Infinite scroll support (placeholder for now)
 * - Hover prefetch for metadata
 */
export const VideoGrid = ({ videos, onVideoClick }: VideoGridProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll implementation (can be extended with React Query)
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // TODO: Load more videos here
          console.log('Load more videos...');
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Prefetch video metadata on hover (placeholder)
  const handleMouseEnter = useCallback((video: CreatorVideo) => {
    setHoveredId(video.id);
    // TODO: Prefetch video metadata
    // queryClient.prefetchQuery(['video', video.id], ...)
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  if (videos.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center"
        >
          <Play className="w-10 h-10 text-indigo-500" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Available Yet</h3>
        <p className="text-gray-600">Check back soon for amazing content!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured/Pinned Video (first video, larger) */}
      {videos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div
            onClick={() => onVideoClick(videos[0])}
            onMouseEnter={() => handleMouseEnter(videos[0])}
            onMouseLeave={handleMouseLeave}
            className="group cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Watch ${videos[0].title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onVideoClick(videos[0]);
              }
            }}
          >
            {/* Thumbnail Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              <motion.img
                src={videos[0].thumbnail}
                alt={videos[0].title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Play Button Overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
                animate={{ scale: hoveredId === videos[0].id ? 1 : 0.9 }}
              >
                <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <Play className="w-8 h-8 text-indigo-600 fill-indigo-600 ml-1" />
                </div>
              </motion.div>

              {/* Duration Badge */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {videos[0].duration}
              </div>

              {/* ZAPs Badge */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                <Zap className="w-3 h-3 fill-white" />
                +{videos[0].xpReward} ZAPs
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {videos[0].title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{videos[0].views}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Video Grid (remaining videos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {videos.slice(1).map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              layout
            >
              <div
                onClick={() => onVideoClick(video)}
                onMouseEnter={() => handleMouseEnter(video)}
                onMouseLeave={handleMouseLeave}
                className="group cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Watch ${video.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onVideoClick(video);
                  }
                }}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md bg-gray-100 transition-shadow hover:shadow-xl">
                  <motion.img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Play Button Overlay */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={{ scale: hoveredId === video.id ? 1 : 0.9 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-indigo-600 fill-indigo-600 ml-0.5" />
                    </div>
                  </motion.div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-white text-xs font-medium">
                    {video.duration}
                  </div>

                  {/* ZAPs Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold flex items-center gap-0.5">
                    <Zap className="w-3 h-3 fill-white" />
                    +{video.xpReward}
                  </div>
                </div>

                {/* Video Info */}
                <div className="mt-2.5">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {video.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">{video.views}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Trigger (for infinite scroll) */}
      <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
    </div>
  );
};
