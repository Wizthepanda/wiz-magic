/**
 * MediaCarousel - 5-slot Embla Carousel for images/videos
 * Supports images, YouTube embeds, and video files
 */

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseYouTubeId, getYouTubeThumbnail } from './utils';
import { CAROUSEL_CONFIG, GLASS_STYLES } from './constants';
import type { MediaSlot } from './types';

interface MediaCarouselProps {
  media: MediaSlot[];
  className?: string;
  autoplay?: boolean;
  onMediaClick?: (index: number) => void;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  media,
  className,
  autoplay = false,
  onMediaClick,
  showControls = true,
  size = 'md',
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: CAROUSEL_CONFIG.loop,
    align: CAROUSEL_CONFIG.align,
    dragFree: CAROUSEL_CONFIG.dragFree,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || !emblaApi) return;
    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, CAROUSEL_CONFIG.autoplayDelay);

    return () => clearInterval(interval);
  }, [autoplay, emblaApi]);

  const sizeClasses = {
    sm: 'h-48',
    md: 'h-64 sm:h-72',
    lg: 'h-80 sm:h-96',
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Carousel Container */}
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {media.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'flex-[0_0_100%] min-w-0 relative',
                sizeClasses[size]
              )}
            >
              <MediaSlotContent
                media={item}
                onClick={() => onMediaClick?.(index)}
                isActive={selectedIndex === index}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && media.length > 1 && (
        <>
          {/* Previous Button */}
          <AnimatePresence>
            {canScrollPrev && (
              <motion.button
                onClick={scrollPrev}
                className={cn(
                  GLASS_STYLES.pill,
                  'absolute left-4 top-1/2 -translate-y-1/2 z-10',
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-white/80 dark:hover:bg-gray-800/80'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Previous media"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Next Button */}
          <AnimatePresence>
            {canScrollNext && (
              <motion.button
                onClick={scrollNext}
                className={cn(
                  GLASS_STYLES.pill,
                  'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-white/80 dark:hover:bg-gray-800/80'
                )}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Next media"
              >
                <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  selectedIndex === index
                    ? 'bg-white w-8 shadow-md'
                    : 'bg-white/50 hover:bg-white/75'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Media Counter */}
      <div className={cn(GLASS_STYLES.pill, 'absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full')}>
        <span className="text-xs font-medium text-gray-900 dark:text-white">
          {selectedIndex + 1} / {media.length}
        </span>
      </div>
    </div>
  );
};

/**
 * MediaSlotContent - Individual media slot renderer
 */
interface MediaSlotContentProps {
  media: MediaSlot;
  onClick?: () => void;
  isActive?: boolean;
}

const MediaSlotContent: React.FC<MediaSlotContentProps> = ({
  media,
  onClick,
  isActive,
}) => {
  const [imageError, setImageError] = useState(false);

  if (media.type === 'youtube' && media.videoId) {
    const thumbnailUrl = media.thumbnail || getYouTubeThumbnail(media.videoId, 'maxres');

    return (
      <div
        className="relative w-full h-full cursor-pointer group"
        onClick={onClick}
      >
        <img
          src={thumbnailUrl}
          alt={media.alt || 'YouTube video'}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* YouTube Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
          <motion.div
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </motion.div>
        </div>

        {/* Duration Badge */}
        {media.duration && (
          <div className={cn(GLASS_STYLES.pill, 'absolute bottom-4 right-4 px-2 py-1 rounded')}>
            <span className="text-xs font-medium text-white">{media.duration}</span>
          </div>
        )}
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div
        className="relative w-full h-full cursor-pointer group"
        onClick={onClick}
      >
        <video
          src={media.url}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => e.currentTarget.pause()}
        />

        {/* Video Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
          <motion.div
            className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-8 h-8 text-gray-900 dark:text-white fill-current ml-1" />
          </motion.div>
        </div>

        {/* Duration Badge */}
        {media.duration && (
          <div className={cn(GLASS_STYLES.pill, 'absolute bottom-4 right-4 px-2 py-1 rounded')}>
            <span className="text-xs font-medium text-white">{media.duration}</span>
          </div>
        )}
      </div>
    );
  }

  // Image type (default)
  return (
    <div
      className="relative w-full h-full cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={imageError ? '/placeholder-image.svg' : media.url}
        alt={media.alt || 'Reward media'}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
        onError={() => setImageError(true)}
      />

      {/* Expand Icon on Hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
        <motion.div
          className="w-12 h-12 rounded-full bg-white/0 group-hover:bg-white/90 dark:group-hover:bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          whileHover={{ scale: 1.1 }}
        >
          <Maximize2 className="w-6 h-6 text-gray-900 dark:text-white" />
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Thumbnail Strip - For use in modals
 */
interface ThumbnailStripProps {
  media: MediaSlot[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  media,
  selectedIndex,
  onSelect,
  className,
}) => {
  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-hide', className)}>
      {media.map((item, index) => {
        const isActive = selectedIndex === index;
        const thumbnailUrl =
          item.type === 'youtube' && item.videoId
            ? item.thumbnail || getYouTubeThumbnail(item.videoId, 'default')
            : item.url;

        return (
          <button
            key={item.id}
            onClick={() => onSelect(index)}
            className={cn(
              'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
              isActive
                ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                : 'border-white/20 dark:border-gray-700/20 hover:border-white/40 dark:hover:border-gray-600/40'
            )}
          >
            <img
              src={thumbnailUrl}
              alt={item.alt || `Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Play icon for videos */}
            {(item.type === 'youtube' || item.type === 'video') && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            )}

            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
            )}
          </button>
        );
      })}
    </div>
  );
};
