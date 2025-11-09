# Creator Profile - Tabbed Layout Redesign

Complete redesign of the Creator Public Profile page with a calm, premium aesthetic following Spotify Artist, YouTube Channel, and Patreon patterns.

## Overview

The new Creator Profile features a clean, organized tabbed layout that reduces UI noise and provides clear information hierarchy:

1. **Hierarchy first** - Identity (banner, avatar, name, stats)
2. **Context second** - About/social information
3. **Engagement third** - Subscribe, join, tip actions
4. **Content last** - Videos, communities

## Visual Language

### Design Principles
- **White + slate + subtle purple gradient** for premium feel
- **Glassmorphism accents** on buttons and community cards
- **Softer spacing** with breathable layout
- **Micro-interactions**: fade-in, scale, hover lift
- **Typography**: 2 weights maximum (Medium / Semibold), no heavy bold spam

### Color Palette
```css
/* Background */
bg-white dark:bg-neutral-900

/* Text */
text-zinc-900 dark:text-white        /* Primary */
text-zinc-600 dark:text-zinc-400     /* Secondary */
text-zinc-500 dark:text-zinc-400     /* Muted */

/* Borders */
border-zinc-200 dark:border-zinc-800

/* Accent */
from-indigo-600 to-violet-600        /* Primary gradient */
from-purple-600 to-pink-600          /* Secondary gradient */
```

## Layout Structure

### 1. Banner
```
Height:
  - Mobile: h-48 (192px)
  - Tablet: sm:h-56 (224px)
  - Desktop: lg:h-64 (256px)

Avatar overlap: ~1/3 of avatar height (-mt-10 sm:-mt-12)
Gradient overlay: from-black/20 to-transparent
```

### 2. Profile Block
```
Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
Content:
  - Avatar (w-20 h-20 sm:w-24 sm:h-24)
  - Avatar glow: purple → pink blur-2xl with gentle pulse
  - Display name (text-2xl sm:text-3xl font-semibold)
  - Handle (@username, text-sm text-zinc-500)
  - Stats (subscribers · videos · communities)
  - Verified badge (if applicable)
```

### 3. Action Row
```
Buttons (all h-11 px-6 rounded-full):
  [Subscribe]    - Gradient (indigo → violet) or glass outline
  [Tip]          - Glass with border
  [Collaborate]  - Glass with border
  [Join Community] - Gradient (purple → pink)

Hover: scale-[1.02] + shadow-md
Transition: duration-200
```

### 4. Social Links Row
```
Icon buttons (w-10 h-10 rounded-full):
  - Glass background with border
  - Icons: Twitter, YouTube, Globe, Link
  - Hover: scale-1.1 + indigo glow
  - Opens in new tab
```

### 5. Tabs
```
Tabs: Videos | Communities | About

Tab styling:
  - Active: text-indigo-600, bottom border (h-0.5)
  - Inactive: text-zinc-600
  - Hover: text-zinc-900
  - Border animation: scale-x-100 (active) / scale-x-0 (inactive)
```

## Components

### CreatorHeaderMinimal
**Purpose**: Banner, avatar, name, handle, stats only (no action buttons)

**Props**:
- `displayName: string`
- `username: string`
- `photoURL: string`
- `bannerURL?: string`
- `verified?: boolean`
- `subscriberCount?: number`
- `videoCount?: number`
- `communityCount?: number`

**Features**:
- Gentle pulse animation on avatar glow
- Verified badge positioning
- Responsive heights and sizing

### CreatorActionsBar
**Purpose**: Clean action row with pill-shaped buttons

**Props**:
- `creatorId: string`
- `creatorName: string`
- `hasCommunity?: boolean`
- `hasMultipleCommunities?: boolean`
- `onTipClick: () => void`
- `onJoinCommunityClick: () => void`

**Buttons**:
1. **Subscribe** - Toggles subscription state, uses `useSubscribe` hook
2. **Tip** - Opens tip modal
3. **Collaborate** - Opens DM with pre-filled message: "Hey! I'd love to open a collaboration. Here's what I have in mind…"
4. **Join Community** - Shows "Join Communities" if multiple, otherwise "Join Community"

### SocialLinksRow
**Purpose**: Icon buttons with hover glow for social media links

**Props**:
- `links?: SocialLink[]` - Array of social links with platform and URL

**Features**:
- Auto-detects platform icons (Twitter, YouTube, Globe, Link)
- Hover glow effect with indigo shadow
- Opens links in new tab

### CommunityList
**Purpose**: Grid of community cards with access badges and join buttons

**Props**:
- `communities: CommunityItem[]`
- `creatorId: string`
- `creatorName: string`
- `creatorAvatar?: string`

**Access Badges**:
| Access Type | Badge Style | Text |
|-------------|-------------|------|
| Free | Gray subtle pill | Free |
| Free (rewards ZAPs) | Purple pill w/ ⚡ | +{amount} ZAPs |
| Paid (ZAPs only) | Indigo pill w/ ⚡ | {amount} ZAPs |
| Paid (USD only) | Yellow pill w/ $ | ${amount} |
| Paid (ZAPs + USD) | Purple pill w/ 🔒 | {zaps} ZAPs + ${usd} |
| Course | Emerald pill w/ 🎓 | Course Access |
| Invite Only | Amber pill w/ 🔐 | Invite Required |

**Card Layout**:
```
┌─────────────────────────────┐
│   Thumbnail (if available)  │
├─────────────────────────────┤
│ Title + Access Badge        │
│ Description (2 lines max)   │
│                             │
│ Members count | [Join]      │
└─────────────────────────────┘
```

### AboutSection
**Purpose**: Bio, external links, and creator information

**Props**:
- `bio?: string`
- `socialLinks?: SocialLink[]`
- `email?: string`
- `website?: string`
- `joinedDate?: string`

**Layout**:
- Bio section with full text
- Links section with cards for each link
- Joined date at bottom

### JoinCommunitiesModal
**Purpose**: Modal to browse and join multiple communities

**Props**:
- `isOpen: boolean`
- `onClose: () => void`
- `communities: CommunityItem[]`
- `creatorId: string`
- `creatorName: string`
- `creatorAvatar?: string`

**Features**:
- Full-screen modal with header
- Scrollable community grid
- Uses same CommunityList component
- Scroll lock when open

## Hooks

### useCreatorCommunities
**Purpose**: Fetch ALL published communities by a creator

**Usage**:
```typescript
const { data: communities, isLoading } = useCreatorCommunities(creatorId);
```

**Query**:
- Collection: `communities`
- Filters: `creatorId == {id}` AND `status == 'published'`
- Order: `createdAt DESC`

**Returns**: Array of `CommunityItem` with:
- id, title, description, thumbnail
- memberCount
- zapsRequired, usdCoPay
- offerZAPsToNewMembers, newMemberZAPsReward
- waitlistOnly, hasCourse

## Tab Content

### Videos Tab (Default)
- Shows video grid (unchanged)
- Uses `CreatorVideoGrid` component
- Clicking video opens fullscreen player (unchanged)

### Communities Tab
- Only visible if creator has published communities
- Shows `CommunityList` with all communities
- Each card has:
  - Thumbnail
  - Title + access badge
  - Short description
  - Member count
  - Join button (integrated with existing join flows)

### About Tab
- Shows creator bio (full text, no truncation)
- External links (website, email, social media)
- Joined date
- Empty state if no information available

## Interactions

### Join Community Button Behavior
```typescript
if (communities.length === 1) {
  // Auto-navigate to Communities tab
  setActiveTab('communities');
} else {
  // Open modal with all communities
  setShowCommunitiesModal(true);
}
```

### Collaborate Button Behavior
Opens DM modal with pre-filled message:
```
"Hey! I'd love to open a collaboration. Here's what I have in mind…"
```
No friction, uses existing `useOpenCollaboration` hook.

## Responsive Breakpoints

```css
/* Mobile-first approach */
default: mobile (< 640px)
sm: 640px
md: 768px  /* Community grid: 2 columns */
lg: 1024px /* Banner height increase */
```

## Animations

All animations use Framer Motion with reduced-motion support:

```typescript
// Fade in + translate
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}

// Scale on hover
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.95 }}

// Pulse (avatar glow)
animate={{
  opacity: [0.2, 0.4, 0.2],
  scale: [1, 1.05, 1],
}}
transition={{
  duration: 4,
  repeat: Infinity,
  ease: 'easeInOut',
}}
```

## Accessibility

- All buttons have `aria-label` attributes
- Keyboard navigation supported via Radix UI Tabs
- Focus states on all interactive elements
- Tab indicators visible for keyboard users
- Color contrast meets WCAG AA standards
- Screen reader friendly tab announcements

## Performance

- React Query caching (5-minute stale time)
- Lazy loading of community data
- Optimistic UI updates
- No layout shifts during loading
- Efficient re-renders with proper memoization

## Integration with Existing Systems

### Join Flows
Uses existing `JoinCommunityButton` component which handles:
- Free communities (instant join)
- Free ZAPs (rewards on join)
- ZAPs Pay (deducts from balance)
- USD payments (opens PaymentModal)
- Hybrid payments (ZAPs + USD)
- Waitlist (opens WaitlistModal)

### Analytics
Tracks the following events:
- `creator_profile_view` - When profile loads
- `video_play_from_profile` - When video played from Videos tab
- `tab_change` - When user switches tabs (optional)

### Fullscreen Player
Completely unchanged. Clicking any video in the Videos tab opens the existing fullscreen player with queue management.

## File Structure

```
src/
├── components/creator/
│   ├── CreatorHeaderMinimal.tsx      ✅ New
│   ├── CreatorActionsBar.tsx         ✅ New
│   ├── SocialLinksRow.tsx            ✅ New
│   ├── CommunityList.tsx             ✅ New
│   ├── AboutSection.tsx              ✅ New
│   ├── JoinCommunitiesModal.tsx      ✅ New
│   ├── JoinCommunityButton.tsx       ✓ Existing
│   ├── CreatorVideoGrid.tsx          ✓ Existing
│   ├── FullscreenPlayer.tsx          ✓ Existing (unchanged)
│   ├── TipModal.tsx                  ✓ Existing
│   ├── PaymentModal.tsx              ✓ Existing
│   └── WaitlistModal.tsx             ✓ Existing
├── hooks/
│   ├── useCreatorCommunities.ts      ✅ New
│   ├── useCreatorProfile.ts          ✓ Existing
│   ├── useSubscribe.ts               ✓ Existing
│   └── useOpenCollaboration.ts       ✓ Existing
└── pages/
    └── CreatorFullScreen.tsx         🔄 Updated
```

## Testing Checklist

- [ ] Banner displays correctly on all breakpoints
- [ ] Avatar overlap is ~1/3 height
- [ ] Stats show proper counts
- [ ] Subscribe button toggles correctly
- [ ] Tip modal opens and closes
- [ ] Collaborate opens DM with pre-filled message
- [ ] Join Community button behavior (single vs. multiple)
- [ ] Social links open in new tab
- [ ] Tabs switch smoothly with animation
- [ ] Videos tab shows grid correctly
- [ ] Communities tab shows all communities
- [ ] About tab shows bio and links
- [ ] Community cards display access badges correctly
- [ ] Join buttons work for all access types
- [ ] Modal opens for multiple communities
- [ ] Fullscreen player opens from Videos tab
- [ ] Back button returns to profile correctly
- [ ] Dark mode styling works
- [ ] Mobile responsive design works
- [ ] Keyboard navigation works
- [ ] Screen reader announces tab changes

## Deployment

**Hosting URL**: https://wiz-magic-platform.web.app

**Build Command**: `npm run build`

**Deploy Command**: `firebase deploy --only hosting`

## Future Enhancements

- [ ] Course tab when creator has courses
- [ ] Playlists tab for video organization
- [ ] Community activity feed in Communities tab
- [ ] Creator highlights/featured content section
- [ ] Membership tiers with different access levels
- [ ] Live streaming integration
- [ ] Creator merchandise section
- [ ] Downloadable media library

---

**Version**: 2.0
**Last Updated**: 2025-11-09
**Maintainer**: Claude Code + Wiz Magic Team
