import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { FeedItem } from '@/lib/feed-utils';
import { FeedCardFactory } from './FeedCardFactory';
import { Loader2 } from 'lucide-react';

interface FeedGridProps {
  items: FeedItem[];
  onVideoPlay?: (video: any) => void;
  onLike?: (itemId: string) => void;
  onClaim?: (rewardId: string) => void;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
}

export function FeedGrid({
  items,
  onVideoPlay,
  onLike,
  onClaim,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
}: FeedGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && onLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-white text-xl font-semibold mb-2">No items found</h3>
        <p className="text-neutral-400 text-sm">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Responsive Grid */}
      <motion.div
        layout
        className="grid gap-6 auto-rows-min"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {items.map((item) => (
          <motion.div key={item.id} layout>
            <FeedCardFactory
              item={item}
              onVideoPlay={onVideoPlay}
              onLike={onLike}
              onClaim={onClaim}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Load more trigger */}
      {hasNextPage && (
        <div
          ref={observerTarget}
          className="flex items-center justify-center py-8"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-neutral-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading more...</span>
            </div>
          )}
        </div>
      )}

      {/* End of feed message */}
      {!hasNextPage && items.length > 0 && (
        <div className="text-center py-8 text-neutral-500 text-sm">
          You've reached the end! 🎉
        </div>
      )}
    </div>
  );
}
