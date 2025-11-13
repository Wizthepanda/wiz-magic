# Community Single-Post Feed - Integration Guide

## Overview
This document provides instructions for integrating the new community-centric single-post feed into the WIZUP dashboard.

## File Structure

```
src/
├── components/
│   └── CommunitySingleFeed/
│       ├── CommunityFeedContainer.tsx  # Main container
│       ├── PostCard.tsx                # Single post card UI
│       ├── FeedControls.tsx            # Navigation controls
│       ├── FilterRow.tsx               # Filter/sort controls
│       └── index.ts                    # Exports
├── hooks/
│   └── useTopCommunityPosts.ts        # React Query hook
└── lib/
    └── firestore/
        └── queries.ts                  # Firestore queries
```

## Components

### 1. CommunityFeedContainer
Main container component that orchestrates the feed.

**Props:**
- `communityIds?: string[]` - Filter posts by community IDs
- `className?: string` - Custom CSS classes
- `onVideoPlay?: (post: Post) => void` - Video play handler

**Features:**
- Single-post display (one card at a time)
- Keyboard navigation (←/→ arrows)
- Auto-prefetching of next posts
- Vote, save, share, comment actions
- Optimistic UI updates
- LocalStorage caching

### 2. PostCard
Individual post card with full community context.

**Features:**
- Community badge (avatar, name, verified status)
- Video thumbnail with play button
- Post title and excerpt
- Creator info (avatar, name, level)
- Engagement row (upvote, downvote, comment, share, save)
- ZAPs reward badge
- Animations with Framer Motion
- Confetti on upvote

### 3. FeedControls
Navigation controls for switching posts.

**Features:**
- Previous/Next buttons
- Position indicator (X of Y)
- Keyboard hints
- Disabled states

### 4. FilterRow
Sorting/filtering controls (optional).

**Options:**
- Hot
- Top
- New
- Rising

## Data Model

### Post Interface
```typescript
interface Post {
  id: string;
  communityId: string;
  communityName: string;
  communityAvatar: string;
  communityVerified: boolean;
  communityMemberCount: number;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorLevel: number;
  title: string;
  excerpt?: string;
  content?: string;
  media: {
    type: 'video' | 'image' | 'none';
    url?: string;
    videoId?: string;
    thumbnail?: string;
    duration?: string;
  };
  score: number;
  upvotes: number;
  downvotes: number;
  votesCount: number;
  commentsCount: number;
  isPinned: boolean;
  zapsReward?: number;
  createdAt: any;
  updatedAt?: any;
}
```

## Firestore Structure

### Required Collections

1. **posts** (root collection)
   ```
   posts/
   ├── {postId}/
   │   ├── communityId: string
   │   ├── communityName: string
   │   ├── communityAvatar: string
   │   ├── communityVerified: boolean
   │   ├── communityMemberCount: number
   │   ├── authorId: string
   │   ├── authorName: string
   │   ├── authorUsername: string
   │   ├── authorAvatar: string
   │   ├── authorLevel: number
   │   ├── title: string
   │   ├── excerpt: string
   │   ├── content: string
   │   ├── media: object
   │   ├── score: number (upvotes - downvotes)
   │   ├── upvotes: number
   │   ├── downvotes: number
   │   ├── votesCount: number
   │   ├── commentsCount: number
   │   ├── isPinned: boolean
   │   ├── zapsReward: number
   │   ├── createdAt: timestamp
   │   └── updatedAt: timestamp
   │   └── votes/
   │       └── {userId}/
   │           ├── vote: 'up' | 'down'
   │           └── timestamp: timestamp
   ```

2. **users/{userId}/saves** (user saves)
   ```
   users/
   └── {userId}/
       └── saves/
           └── {postId}/
               ├── postId: string
               └── savedAt: timestamp
   ```

### Required Firestore Indexes

Create these composite indexes in Firebase Console:

1. **posts collection**
   - isPinned (Descending) + score (Descending) + createdAt (Descending)
   - communityId (Ascending) + isPinned (Descending) + score (Descending) + createdAt (Descending)

## Integration Steps

### Step 1: Install Dependencies

Ensure these packages are installed:
```bash
npm install @tanstack/react-query framer-motion canvas-confetti
npm install -D @types/canvas-confetti
```

### Step 2: Integrate into Dashboard

Option A: Replace existing feed in WIZUPDashboardV13

```typescript
// src/components/wiz/WIZUPDashboardV13.tsx
import { CommunityFeedContainer } from '@/components/CommunitySingleFeed';

// Inside your component
<CommunityFeedContainer
  className="px-6"
  onVideoPlay={handleFeedVideoPlay}
/>
```

Option B: Add as new view mode

```typescript
// Add to existing view modes
const [viewMode, setViewMode] = useState<'grid' | 'feed' | 'single'>('single');

// In render
{viewMode === 'single' && (
  <CommunityFeedContainer
    className="px-6"
    onVideoPlay={handleFeedVideoPlay}
  />
)}
```

### Step 3: Position Below Search

The feed should sit directly below the search bar and above any filter row.

```tsx
<ApplePremiumDashboard>
  {/* Top Bar with Search */}
  <header>
    <SearchBar />
  </header>

  {/* Main Content Area */}
  <main>
    {/* Community Feed Container - positioned first */}
    <CommunityFeedContainer
      className="mb-8"
      onVideoPlay={handleVideoPlay}
    />

    {/* Filter Row (optional) - positioned below feed */}
    <FilterRow />
  </main>
</ApplePremiumDashboard>
```

### Step 4: Setup Video Player Handler

```typescript
const handleVideoPlay = (post: Post) => {
  // Convert Post to your WatchVideoData format
  const videoData = {
    id: post.id,
    videoId: post.media.videoId,
    title: post.title,
    description: post.excerpt || post.content,
    thumbnail: post.media.thumbnail,
    duration: post.media.duration,
    xpReward: post.zapsReward || 0,
    creator: {
      id: post.authorId,
      name: post.authorName,
      avatar: post.authorAvatar,
      level: post.authorLevel,
    },
    // ... other fields
  };

  // Open your existing full-screen player
  setSelectedVideo(videoData);
  setShowVideoPlayer(true);
};
```

## Configuration

### Environment Variables
No additional env vars needed - uses existing Firebase config.

### React Query Setup
Ensure React Query is configured in your app:

```typescript
// src/main.tsx or App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## Customization

### Styling
All components use Tailwind CSS with your existing design tokens:
- Colors: violet/purple gradients for primary actions
- Dark mode: Full dark mode support via `dark:` classes
- Glass morphism: backdrop-blur effects
- Animations: Framer Motion with smooth transitions

### Behavior

**Keyboard Navigation:**
- `←` Previous post
- `→` Next post

**Auto-prefetch:**
- Prefetches next 3 posts when viewing current post
- Auto-fetches more when approaching end (5 posts remaining)

**Caching:**
- React Query caches for 5 minutes
- LocalStorage for user votes and saves

## Testing Checklist

- [ ] Firestore composite index created
- [ ] Cloud Function publishes score updates (if using anti-cheat)
- [ ] Prefetch next posts to keep transitions instant
- [ ] Full-screen player invoked via existing player entrypoint
- [ ] Keyboard swipe & arrow support tested on desktop & mobile
- [ ] Accessibility audit (aria roles, alt text, keyboard navigation)
- [ ] Performance: lazy-load media, use low-res placeholders
- [ ] Vote/save/share actions work correctly
- [ ] Optimistic updates revert on error
- [ ] Dark mode works correctly

## Monitoring & Metrics

Track these events in Firebase Analytics:
- `post_viewed` - User views a post
- `post_upvoted` - User upvotes
- `post_downvoted` - User downvotes
- `post_saved` - User saves
- `post_shared` - User shares
- `post_video_clicked` - User clicks play on video
- `post_community_clicked` - User clicks community badge
- `post_creator_clicked` - User clicks creator info

## Troubleshooting

### Posts not loading
- Check Firestore indexes are created
- Verify `posts` collection exists with correct schema
- Check browser console for errors

### Votes not saving
- Verify user is authenticated
- Check Firestore security rules allow writes to `posts/{postId}/votes/{userId}`
- Check `users/{userId}/saves` permissions

### Navigation not working
- Ensure keyboard events aren't blocked by other components
- Check z-index conflicts
- Verify posts array has data

### Performance issues
- Reduce prefetch count if needed
- Increase React Query stale time
- Check for memory leaks in useEffect cleanup

## Future Enhancements

- [ ] Comment composer inline/slide-up
- [ ] Real-time score updates via Firestore listeners
- [ ] Server-side score computation (Cloud Functions)
- [ ] Advanced filtering (by community, by date range)
- [ ] Infinite scroll fallback option
- [ ] Swipe gestures for mobile
- [ ] Post reporting/moderation
- [ ] Rich text editor for comments

## Support

For questions or issues:
1. Check browser console for errors
2. Verify Firestore indexes
3. Review integration steps
4. Check existing community posts service for reference

---

**Generated with Claude Code** 🤖
