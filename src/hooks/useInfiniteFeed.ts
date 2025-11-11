import { useInfiniteQuery } from '@tanstack/react-query';
import { FeedItem, FeedFilters } from '@/lib/feed-utils';

interface FeedPage {
  items: FeedItem[];
  nextCursor?: string;
}

interface FetchFeedParams {
  cursor?: string;
  filters: FeedFilters;
}

// Mock feed data generator - replace with actual API call
async function fetchFeed({ cursor, filters }: FetchFeedParams): Promise<FeedPage> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const pageSize = 12;
  const startIndex = cursor ? parseInt(cursor) : 0;

  // Generate mock mixed feed items
  const items: FeedItem[] = [];

  for (let i = 0; i < pageSize; i++) {
    const index = startIndex + i;
    const types: Array<'video' | 'post' | 'reward'> = ['video', 'video', 'video', 'post', 'reward'];
    const type = types[index % types.length];

    if (type === 'video') {
      items.push({
        id: `video-${index}`,
        type: 'video',
        title: `Amazing ${filters.category !== 'all' ? filters.category.toUpperCase() : ''} Video ${index + 1}`,
        creator: `Creator ${(index % 5) + 1}`,
        thumbnail: `https://picsum.photos/seed/${index}/400/300`,
        duration: '12:34',
        xpReward: Math.floor(Math.random() * 500) + 100,
        category: filters.category !== 'all' ? filters.category : ['ai', 'tech', 'music', 'money', 'health'][index % 5],
        views: Math.floor(Math.random() * 10000) + 1000,
        watched: Math.random() > 0.7,
        progress: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : 0,
        videoId: `video-${index}`,
        isNew: Math.random() > 0.8,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 200),
      });
    } else if (type === 'post') {
      items.push({
        id: `post-${index}`,
        type: 'post',
        author: `Wizard ${(index % 5) + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
        content: `This is an amazing community post about ${filters.category !== 'all' ? filters.category : 'cool stuff'}! Check out what I learned today. #WIZUP #${filters.category || 'learning'}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 100),
        category: filters.category !== 'all' ? filters.category : ['ai', 'tech', 'music', 'money', 'health'][index % 5],
        image: Math.random() > 0.5 ? `https://picsum.photos/seed/post-${index}/600/400` : undefined,
      });
    } else {
      items.push({
        id: `reward-${index}`,
        type: 'reward',
        title: `${filters.category !== 'all' ? filters.category.toUpperCase() : ''} Master Badge`,
        description: `Complete 10 ${filters.category || 'category'} videos to unlock this exclusive reward!`,
        xpValue: Math.floor(Math.random() * 1000) + 500,
        icon: ['🏆', '⭐', '💎', '🔥', '👑'][index % 5],
        progress: Math.floor(Math.random() * 100),
        category: filters.category !== 'all' ? filters.category : ['ai', 'tech', 'music', 'money', 'health'][index % 5],
        unlocked: Math.random() > 0.7,
      });
    }
  }

  // Filter by category if not 'all'
  const filteredItems = filters.category === 'all'
    ? items
    : items.filter(item => item.category === filters.category);

  // Filter by search query if present
  const searchFiltered = filters.searchQuery
    ? filteredItems.filter(item => {
        const searchLower = filters.searchQuery!.toLowerCase();
        if (item.type === 'video') {
          return item.title.toLowerCase().includes(searchLower) ||
                 item.creator.toLowerCase().includes(searchLower);
        } else if (item.type === 'post') {
          return item.content.toLowerCase().includes(searchLower) ||
                 item.author.toLowerCase().includes(searchLower);
        } else {
          return item.title.toLowerCase().includes(searchLower) ||
                 item.description.toLowerCase().includes(searchLower);
        }
      })
    : filteredItems;

  return {
    items: searchFiltered,
    nextCursor: startIndex + pageSize < 100 ? String(startIndex + pageSize) : undefined,
  };
}

export function useInfiniteFeed(filters: FeedFilters) {
  return useInfiniteQuery({
    queryKey: ['feed', filters],
    queryFn: ({ pageParam }) => fetchFeed({ cursor: pageParam as string | undefined, filters }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
