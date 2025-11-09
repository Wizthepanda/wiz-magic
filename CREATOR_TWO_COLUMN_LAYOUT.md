# Creator Profile - Two-Column Layout (Production Ready)

Complete production-ready implementation of the Creator Public Profile with a two-column workspace layout, inline action buttons, and fixed tip modal positioning.

## Overview

This redesign transforms the Creator Profile into a luxurious, minimal workspace with:

- **Left Column (30%)**: Communities filter + Posts feed
- **Right Column (70%)**: Vertical video panel (YouTube-style)
- **Inline Action Buttons**: Subscribe, Tip, Collaborate adjacent to creator name
- **Fixed Tip Modal**: Properly centered, never off-screen
- **Unchanged Fullscreen Player**: Preserves existing video player behavior

## Visual Style

### Liquid Glass Aesthetic
- **Primary gradient**: `from-indigo-600 to-violet-500` for Subscribe CTA and ZAP badges
- **Glassmorphism**: Subtle backdrop-blur on modals and overlays
- **Soft shadows**: `shadow-sm hover:shadow-md`
- **Micro-interactions**: `hover:scale-[1.02]` on buttons
- **Rounded corners**: `rounded-full` for buttons, `rounded-2xl` for cards

### Typography
- **Headlines**: Poppins
- **Body**: Inter
- **Weights**: Medium (500) and Semibold (600) only

### Dimensions
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Banner heights**: h-48 (mobile), h-56 (tablet), h-64 (desktop)
- **Avatar**: w-24 h-24 (mobile), w-28 h-28 (desktop)
- **Avatar overlap**: ~1/3 of avatar height (`-mt-12 sm:-mt-16`)

## Component Architecture

### 1. CreatorHeaderInline
**Location**: `/src/components/creator/CreatorHeaderInline.tsx`

**Purpose**: Banner, avatar, name with action buttons adjacent to name (not below)

**Props**:
```typescript
{
  creatorId: string;
  displayName: string;
  username: string;
  photoURL: string;
  bannerURL?: string;
  verified?: boolean;
  subscriberCount?: number;
  videoCount?: number;
  onTipClick: () => void;
}
```

**Features**:
- Avatar overlaps banner by ~1/3 height
- Action buttons (Subscribe, Tip, Collaborate) inline next to name
- Verified badge on avatar
- Stats row showing subscribers and video count
- Glassmorphic background with backdrop-blur
- Gentle pulse animation on avatar glow

**Layout**:
```
┌────────────────────────────────────────────────┐
│           Banner (full width, h-48/56/64)      │
│                                                 │
└────────────────────────────────────────────────┘
┌────────────────────────────────────────────────┐
│ [Avatar] Name                    [Subscribe]   │
│          @handle                 [Tip]         │
│          Stats                   [Collaborate] │
└────────────────────────────────────────────────┘
```

### 2. CommunitiesColumn
**Location**: `/src/components/creator/CommunitiesColumn.tsx`

**Purpose**: Left column (30%) with communities filter and posts feed

**Props**:
```typescript
{
  creatorId: string;
  className?: string;
}
```

**Features**:
- **Communities Filter Row**: Horizontal scrollable chips with access type badges
- **Access Type Badges**:
  - Free: Gray pill with Users icon
  - ZAPs: Purple pill with Zap icon + amount
  - USD: Yellow pill with Dollar icon + price
- **Posts Feed**: Shows posts from selected community
- **Join CTA**: If user not a member, shows "Join to participate" overlay
- **Post Composer**: Only visible to members
- **Empty State**: Friendly message when no posts exist
- **Deduplication**: Prevents duplicate communities by ID

**Data Fetching**:
- Queries `communities` collection filtered by `creatorId` and `status: 'published'`
- Queries `communities/{id}/posts` for selected community
- Checks membership in `communities/{id}/members`

### 3. VerticalVideoList
**Location**: `/src/components/creator/VerticalVideoList.tsx`

**Purpose**: Right column (70%) with vertical video cards (YouTube-style)

**Props**:
```typescript
{
  videos: Video[];
  onVideoClick: (video: Video, index: number) => void;
  className?: string;
}
```

**Video Card Layout**:
```
┌──────────────────────────────────────────────┐
│ [Thumbnail]  Title (2 lines max)            │
│ [Duration]   Views · Date                    │
│ [XP Badge]   Creator Avatar + Name           │
└──────────────────────────────────────────────┘
```

**Features**:
- Horizontal card layout (thumbnail left, info right)
- Hover overlay with play button
- XP reward badge (purple gradient)
- Duration badge
- Views and publish date
- Smooth hover effects and transitions
- Opens existing fullscreen player on click

### 4. TipModal (Fixed)
**Location**: `/src/components/creator/TipModal.tsx`

**Purpose**: Radix Dialog for tipping with proper centering

**Key Fix**:
```typescript
className={cn(
  'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  'w-[min(94vw,820px)] max-w-[820px]',
  'max-h-[90vh] overflow-y-auto',
  ...
)}
```

**Features**:
- Always centered on screen
- Responsive width: `min(94vw, 820px)`
- Max height with scroll: `max-h-[90vh] overflow-y-auto`
- Prevents off-screen rendering
- Portal to document.body
- Supports ZAPs, USD, and Crypto payments

### 5. CreatorProfileTwoColumn
**Location**: `/src/pages/CreatorProfileTwoColumn.tsx`

**Purpose**: Main page component with two-column layout

**Layout Structure**:
```
┌─────────────────────────────────────────────────┐
│  [Back] Header (Banner + Avatar + Actions)     │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  Communities     │  Vertical Video List         │
│  & Posts         │  (Primary column)            │
│  (30%)           │  (70%)                       │
│                  │                              │
│  [Sticky]        │  [Scrollable]                │
│                  │                              │
└──────────────────┴──────────────────────────────┘
```

**Responsive Behavior**:
- Desktop: Side-by-side columns (30% / 70%)
- Mobile: Stacked (Videos on top, Communities below)
- Communities column is sticky on desktop
- Max height: `h-[calc(100vh-200px)]`

## Data Contracts

### Firestore Collections

#### `creators/{creatorId}`
```typescript
{
  displayName: string;
  handle: string;
  photoURL: string;
  bannerURL?: string;
  about?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  verified: boolean;
  stats: {
    followers: number;
    totalVideos: number;
  };
}
```

#### `communities/{communityId}`
```typescript
{
  title: string;
  creatorId: string;
  status: 'draft' | 'published' | 'archived';
  accessType: 'free' | 'paid' | 'zaps';
  zapsRequired?: number;
  usdCoPay?: number;
  memberCount: number;
  description?: string;
  createdAt: Timestamp;
}
```

#### `communities/{communityId}/posts/{postId}`
```typescript
{
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  media?: string[];
  createdAt: Timestamp;
  pinned?: boolean;
}
```

#### `communities/{communityId}/members/{userId}`
```typescript
{
  userId: string;
  joinedAt: Timestamp;
  role: 'member' | 'moderator' | 'creator';
}
```

#### `videos` collection
```typescript
{
  id: string;
  videoId: string;
  creatorId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  xpReward: number;
  publishedAt: string;
  youtubeId: string;
  category: string;
  subcategory?: string;
}
```

## React Query Hooks

### useCreatorProfile
```typescript
const { data: creatorProfile, isLoading, error } = useCreatorProfile(identifier);
// identifier can be username or creatorId
```

**Query Key**: `['creator', 'profile', identifier]`
**Stale Time**: 60,000ms (1 minute)
**Cache Time**: 300,000ms (5 minutes)

### useCreatorVideos
```typescript
const { data: videos, isLoading } = useCreatorVideos(creatorId);
```

**Query Key**: `['creator', 'videos', creatorId]`
**Stale Time**: 60,000ms
**Cache Time**: 300,000ms

### Communities & Posts (Built-in)
```typescript
// In CommunitiesColumn.tsx
useQuery({
  queryKey: ['creator-communities-list', creatorId],
  queryFn: async () => {
    // Fetch communities where creatorId == {id} AND status == 'published'
    // Dedupe by ID using Map
  },
  staleTime: 60_000,
  gcTime: 5 * 60_000,
});

useQuery({
  queryKey: ['community-posts', communityId],
  queryFn: async () => {
    // Fetch posts for selected community
    // Order by createdAt DESC, limit 20
  },
  staleTime: 60_000,
  gcTime: 5 * 60_000,
});
```

## Action Button Wiring

### Subscribe Button
**Function**: `useSubscribe(creatorId)`

**Behavior**:
- Toggles subscription state
- Updates `users/{userId}/subscriptions` array
- Increments/decrements `creators/{creatorId}.stats.followers` via Cloud Function
- Shows confetti + toast on success: "Subscribed — new videos will appear in your feed"

**Cloud Function**: `subscribeCreator`

### Tip Button
**Function**: `onClick={() => setShowTipModal(true)}`

**Behavior**:
- Opens TipModal with proper centering
- Supports ZAPs, USD, and Crypto payments
- Calls Cloud Function `createTip` on confirm
- Updates user and creator balances atomically
- Shows toast on success with updated ZAP balance

**Cloud Function**: `createTip`

### Collaborate Button
**Function**: `useOpenCollaboration()`

**Behavior**:
- Opens pre-filled message composer in Messages panel
- Creates new message with `type: 'collab_request'`
- Pre-filled subject: "Collab Request — [YourName] → [CreatorName]"
- Template message: "I'd love to collaborate with you on WIZUP. Here's what I have in mind..."
- If user not signed in, triggers sign-in popup first

**Cloud Function**: `createCollabRequest` (optional)

## Fullscreen Player Integration

### Current Behavior (Preserved)
The existing fullscreen player is completely unchanged. The integration works as follows:

**Player Context**:
```typescript
const { currentVideo, play, setQueue } = usePlayer();
```

**Video Click Handler**:
```typescript
const handleVideoClick = (video: Video, index: number) => {
  // Set Up Next queue (next 10 videos)
  const upNext = videos.slice(index + 1, index + 11);
  setQueue(upNext);

  // Open fullscreen player
  play(video);
};
```

**Important**:
- No nested modals
- No secondary popup
- Uses centralized player manager
- Up Next populates inside main player panel
- Same fullscreen player component as existing implementation

## Accessibility

### Keyboard Navigation
- **Tab Order**: Back → Avatar → Name → Subscribe → Tip → Collaborate → Videos → Communities
- **Focus Ring**: Visible on all interactive elements
- **Esc Key**: Closes tip modal
- **Arrow Keys**: Navigate video list (optional enhancement)

### ARIA Attributes
```typescript
// All buttons
aria-label="Subscribe"
aria-label="Send tip"
aria-label="Open collaboration"

// All images
alt={displayName}
alt={`${displayName} banner`}
alt={video.title}

// Modal
role="dialog"
aria-modal="true"
aria-labelledby="tip-modal-title"
```

### Screen Reader Support
- Descriptive labels on all actions
- Status announcements for subscribe/unsubscribe
- Post count announced in communities
- Loading states announced

## Performance Optimizations

### React Query Caching
```typescript
staleTime: 60_000,      // 1 minute
gcTime: 5 * 60_000,     // 5 minutes
```

### Lazy Loading
```typescript
loading="lazy"  // on all images
```

### Server-Side Indexes
```firestore
// communities
creatorId ASC + status ASC + createdAt DESC

// posts
communityId ASC + createdAt DESC

// videos
creatorId ASC + publishedAt DESC
```

### Deduplication
```typescript
const uniqueCommunities = new Map();
snapshot.forEach((doc) => {
  if (!uniqueCommunities.has(doc.id)) {
    uniqueCommunities.set(doc.id, ...);
  }
});
return Array.from(uniqueCommunities.values());
```

## Edge Cases & Error Handling

### Empty States
✅ No communities: "No communities yet"
✅ No posts: "This community has no posts yet — be first to start the discussion"
✅ No videos: Play icon with "No videos yet"

### Loading States
✅ Creator profile loading: Centered spinner
✅ Videos loading: Spinner in right column
✅ Posts loading: Spinner in communities column
✅ Button loading: Disabled with spinner icon

### Error States
✅ Creator not found: Friendly message with "Go Back" button
✅ Network error: Toast notification with retry option
✅ Insufficient funds (tips): Clear error message

### Authentication
✅ Not signed in + Collaborate: Triggers `signInWithPopup` first
✅ Not signed in + Tip: Shows sign-in prompt in modal
✅ Not signed in + Post: Shows "Sign in to post" message

## QA Checklist

- [ ] Avatar overlaps banner by ~1/3 on all breakpoints
- [ ] Action buttons appear adjacent to name, aligned vertically center
- [ ] Tip modal opens centered and never off-screen (desktop & mobile)
- [ ] Tip modal uses `w-[min(94vw,820px)]` for responsive width
- [ ] Clicking video opens existing fullscreen player (no nested modals)
- [ ] Up Next populates inside fullscreen player panel
- [ ] Communities column shows only unique communities (no duplicates)
- [ ] Access type badges display correctly (Free / ZAPs / USD)
- [ ] Member count shows in community filter chips
- [ ] Posts require membership to comment (Join CTA shows if not member)
- [ ] Subscribe button shows confetti + toast on success
- [ ] Collaborate opens DM with pre-filled message
- [ ] Two-column layout: 30% / 70% on desktop
- [ ] Responsive: Stacked on mobile (videos top, communities bottom)
- [ ] Communities column is sticky on desktop
- [ ] All images lazy load
- [ ] React Query caching works (check Network tab)
- [ ] Keyboard navigation works (Tab through all elements)
- [ ] Focus ring visible on all interactive elements
- [ ] Esc closes tip modal
- [ ] Back button returns to previous page
- [ ] Dark mode styling correct

## File Structure

```
src/
├── components/creator/
│   ├── CreatorHeaderInline.tsx       ✅ New
│   ├── CommunitiesColumn.tsx         ✅ New
│   ├── VerticalVideoList.tsx         ✅ New
│   ├── TipModal.tsx                  🔄 Fixed (centered, responsive)
│   ├── JoinCommunityButton.tsx       ✓ Existing (reused)
│   ├── FullscreenPlayer.tsx          ✓ Existing (unchanged)
│   └── ...
├── pages/
│   ├── CreatorProfileTwoColumn.tsx   ✅ New (main implementation)
│   └── CreatorFullScreen.tsx         ✓ Existing (can be deprecated)
├── hooks/
│   ├── useCreatorProfile.ts          ✓ Existing
│   ├── useCreatorVideos.ts           ✓ Existing
│   ├── useSubscribe.ts               ✓ Existing
│   └── useOpenCollaboration.ts       ✓ Existing
└── lib/
    ├── analytics.ts                   ✓ Existing
    └── firebase.ts                    ✓ Existing
```

## Migration Path

To switch to the new two-column layout:

1. **Option A: Replace existing route**
```typescript
// In App.tsx
const CreatorProfile = lazy(() => import("./pages/CreatorProfileTwoColumn"));

// Routes
<Route path="/creator/:username" element={<PageWrapper><CreatorProfile /></PageWrapper>} />
```

2. **Option B: A/B test with feature flag**
```typescript
const useNewLayout = getFeatureFlag('creator_two_column');
const Component = useNewLayout ? CreatorProfileTwoColumn : CreatorFullScreen;
```

3. **Option C: New route for testing**
```typescript
<Route path="/creator-v2/:username" element={<PageWrapper><CreatorProfileTwoColumn /></PageWrapper>} />
```

## Deployment

### Build
```bash
npm run build
```

### Deploy to Firebase
```bash
firebase deploy --only hosting
```

### Environment Variables
Ensure these are set in Firebase config:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Firestore Indexes
Deploy indexes before enabling:
```bash
firebase deploy --only firestore:indexes
```

Required indexes (add to `firestore.indexes.json`):
```json
[
  {
    "collectionGroup": "communities",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "creatorId", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  },
  {
    "collectionGroup": "posts",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  }
]
```

## Future Enhancements

- [ ] Real-time posts updates with Firestore listeners
- [ ] Infinite scroll for video list
- [ ] Community search/filter
- [ ] Pin posts (moderator feature)
- [ ] Post reactions (likes, comments)
- [ ] Video preview on hover
- [ ] Keyboard shortcuts (j/k for next/previous video)
- [ ] Share button for videos
- [ ] Playlist creation from video list
- [ ] Community analytics for creators

---

**Version**: 1.0
**Last Updated**: 2025-11-09
**Maintainer**: Claude Code + Wiz Magic Team
**Status**: Production Ready ✅
