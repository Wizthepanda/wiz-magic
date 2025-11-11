import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useInfiniteFeed } from '@/hooks/useInfiniteFeed';
import { FeedFilters, FeedItem } from '@/lib/feed-utils';
import { FilterRow } from './FilterRow';
import { FeedGrid } from './FeedGrid';
import { FeedSkeleton } from './FeedSkeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface MultiFeedLayoutProps {
  onVideoPlay?: (video: any) => void;
  sidebarOpen?: boolean;
}

export function MultiFeedLayout({ onVideoPlay, sidebarOpen = true }: MultiFeedLayoutProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const queryClient = useQueryClient();

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
    return () => clearTimeout(timer);
  };

  const filters: FeedFilters = {
    category: activeCategory,
    searchQuery: debouncedSearch,
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteFeed(filters);

  // Flatten all pages into single array
  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  // Optimistic like handler
  const handleLike = (itemId: string) => {
    // Optimistically update UI
    queryClient.setQueryData(['feed', filters], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: FeedItem) =>
            item.id === itemId && ('likes' in item)
              ? { ...item, likes: item.likes + 1 }
              : item
          ),
        })),
      };
    });

    // TODO: Call API to persist like
    console.log('Liked item:', itemId);
  };

  // Claim reward handler
  const handleClaim = (rewardId: string) => {
    // TODO: Call API to claim reward
    console.log('Claimed reward:', rewardId);
  };

  return (
    <div className="w-full min-h-screen">
      {/* Container with sidebar-aware width */}
      <motion.div
        animate={{
          marginLeft: sidebarOpen ? '0' : '0',
          paddingLeft: sidebarOpen ? '0' : '0',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full"
      >
        {/* Search Bar */}
        <div className="flex justify-center w-full mb-6">
          <div className="w-full max-w-2xl px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="search"
                placeholder="Search videos, posts, and rewards..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={cn(
                  'w-full pl-12 pr-4 py-3 rounded-2xl',
                  'bg-white/6 backdrop-blur-md border border-white/10',
                  'text-white placeholder:text-neutral-400',
                  'focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20',
                  'transition-all duration-300'
                )}
                aria-label="Search content"
              />
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="mb-8">
          <FilterRow
            activeCategory={activeCategory}
            onCategoryChange={(category) => {
              setActiveCategory(category);
            }}
          />
        </div>

        {/* Feed Grid */}
        <div className="px-4 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FeedSkeleton count={12} />
              </motion.div>
            ) : (
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FeedGrid
                  items={allItems}
                  onVideoPlay={onVideoPlay}
                  onLike={handleLike}
                  onClaim={handleClaim}
                  onLoadMore={() => fetchNextPage()}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
