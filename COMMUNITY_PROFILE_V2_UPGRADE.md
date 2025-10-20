# 🎨 Community Profile Page V2 - World-Class Redesign

## Overview
This upgrade transforms the community profile page into a world-class, elegant, and ultra-functional experience inspired by Discord, Notion, and Apple UI design principles.

---

## 🌟 Key Features

### 1. **Enhanced Hero Banner with Community Icon**
- ✅ Community profile icon (80px circular) positioned bottom-left, overlapping the banner
- ✅ 10% gradient overlay on banner for improved text readability
- ✅ Community title and privacy label next to the icon
- ✅ Last Updated timestamp beneath the title
- ✅ Creator card with glassmorphism at the bottom of the hero section
- ✅ Animated level ring around creator avatar
- ✅ Progress bar with smooth animations

### 2. **Enhanced Tab Bar**
- ✅ Glassmorphism design with backdrop blur
- ✅ Micro-interactions: glow, underline animation, scale on hover
- ✅ Horizontal scroll on mobile with smooth snapping
- ✅ Notification badges on tabs (e.g., "3 new posts")
- ✅ Icons for each tab (MessageSquare, GraduationCap, Trophy, etc.)

### 3. **Rich Composer for Posts**
- ✅ Auto-expand on focus with smooth transition
- ✅ Emoji picker with quick shortcuts
- ✅ File attachment support (images, videos, PDFs)
- ✅ @mentions support (ready for integration)
- ✅ Hashtag button for easy tagging
- ✅ Character count (5000 max)
- ✅ Glassmorphism and shadow effects

### 4. **Enhanced Creator Sidebar**
- ✅ Animated badge ring around creator avatar (level indicator)
- ✅ XP progress bar below creator details
- ✅ Quick action buttons: View Profile, Message, Report
- ✅ Community stats: Members, Engagement, Active Today
- ✅ Quick Links section with smooth hover animations

### 5. **Responsive Design**
- ✅ Mobile: Sidebar moves below content
- ✅ Tabs collapse into horizontal scroll with snap points
- ✅ Banner elements stack vertically on small screens

---

## 📦 New Components Created

| Component | File Path | Purpose |
|-----------|-----------|---------|
| `HeroBannerV2` | `src/components/wiz/community/HeroBannerV2.tsx` | Enhanced hero with community icon + creator card |
| `CommunityTabsV2` | `src/components/wiz/community/CommunityTabsV2.tsx` | Glassmorphic tabs with micro-interactions |
| `RichComposer` | `src/components/wiz/community/RichComposer.tsx` | Rich-text post composer with emojis & attachments |
| `EnhancedCreatorSidebar` | `src/components/wiz/community/EnhancedCreatorSidebar.tsx` | Creator card with animated level ring + stats |
| `CommunityDashboardV2` | `src/components/wiz/community/CommunityDashboardV2.tsx` | Main dashboard integrating all V2 components |

---

## 🔧 Integration Instructions

### Option 1: Replace Existing Dashboard (Recommended for Testing)

1. **Update your route** to use the new dashboard:

```tsx
// In your router file (e.g., App.tsx or routes.tsx)
import { CommunityDashboardV2 } from '@/components/wiz/community/CommunityDashboardV2';

// Replace the old route
<Route
  path="/community/:id"
  element={<CommunityDashboardV2 communityId={communityId} />}
/>
```

2. **That's it!** The new dashboard uses all existing hooks and data structures.

---

### Option 2: Side-by-Side Comparison

Keep both versions and use a feature flag or route parameter:

```tsx
// In your router
<Route path="/community/:id" element={<CommunityDashboard communityId={communityId} />} />
<Route path="/community/:id/v2" element={<CommunityDashboardV2 communityId={communityId} />} />
```

Test by navigating to `/community/{id}/v2`

---

### Option 3: Gradual Migration

Replace individual components one at a time:

```tsx
// In existing CommunityDashboard.tsx
import { HeroBannerV2 } from './HeroBannerV2';  // Replace HeroBanner
import { CommunityTabsV2 } from './CommunityTabsV2';  // Replace CommunityTabs
import { EnhancedCreatorSidebar } from './EnhancedCreatorSidebar';  // Replace AccessCardSidebar
```

---

## 🎨 Design System

### Colors
- **Primary Gradient**: `from-indigo-600 to-purple-600`
- **Background**: `from-slate-50 via-white to-indigo-50/30`
- **Glassmorphism**: `bg-white/90 backdrop-blur-2xl`
- **Borders**: `border-white/60`
- **Success**: `from-emerald-400 to-green-400`

### Typography
- **Headings**: `font-extrabold` with gradient clip
- **Body**: `text-slate-700` for readability
- **Subtle**: `text-slate-600` for secondary text

### Shadows
- **Cards**: `shadow-2xl`
- **Hover**: `shadow-[0_0_40px_rgba(99,102,241,0.6)]`
- **Buttons**: `shadow-xl`

### Border Radius
- **Cards**: `rounded-3xl` (24px)
- **Buttons**: `rounded-2xl` (16px)
- **Small elements**: `rounded-xl` (12px)

---

## ✨ New Features to Implement (Optional)

### 1. **Rich Text Editor (WYSIWYG)**
Replace the `RichComposer` textarea with a full editor:
- [Tiptap](https://tiptap.dev/) - Recommended
- [Slate](https://docs.slatejs.org/)
- [@atlaskit/editor](https://atlaskit.atlassian.com/packages/editor/editor-core)

### 2. **@Mentions**
Add mention detection and user search:
```tsx
import { useMentions } from '@/hooks/useMentions';

// In RichComposer
const { users, searchUsers } = useMentions();
```

### 3. **Pinned Posts with Glow**
Add distinct styling for pinned posts in the feed:
```tsx
className={cn(
  "rounded-2xl p-4",
  isPinned && "border-2 border-amber-200 bg-gradient-to-r from-amber-50/30 to-orange-50/30 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
)}
```

### 4. **Infinite Scroll for Posts**
Replace static posts with infinite loading:
```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts', communityId],
  queryFn: ({ pageParam = 0 }) => fetchPosts(communityId, pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### 5. **Real-time Notifications**
Add Firebase real-time listeners for new posts/messages:
```tsx
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'communities', communityId, 'posts'),
    (snapshot) => {
      // Update notification count
    }
  );
  return unsubscribe;
}, [communityId]);
```

---

## 🚀 Performance Optimizations

### 1. **Lazy Loading**
Components are already wrapped with `Suspense`:
```tsx
<Suspense fallback={<LoadingSpinner />}>
  <DiscussionFeed communityId={community.id} />
</Suspense>
```

### 2. **Image Optimization**
Add `loading="lazy"` to images:
```tsx
<img
  src={bannerUrl}
  alt={community.title}
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### 3. **Skeleton Loaders**
Replace `LoadingSpinner` with skeleton screens for better UX:
```tsx
function PostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-slate-200 rounded-lg mb-3" />
      <div className="h-32 bg-slate-200 rounded-lg" />
    </div>
  );
}
```

---

## 📱 Mobile Enhancements

### Horizontal Tab Scroll
The `CommunityTabsV2` component automatically:
- Enables horizontal scroll on mobile
- Adds left/right scroll buttons
- Implements snap points for smooth navigation

### Responsive Breakpoints
- `md:` - 768px and up
- `lg:` - 1024px and up (sidebar appears)

---

## 🐛 Troubleshooting

### Issue: Community icon not showing
**Solution**: Ensure your community schema includes `iconUrl` or `avatarUrl`:
```typescript
interface Community {
  iconUrl?: string;
  avatarUrl?: string;
  // ... other fields
}
```

### Issue: Tabs not animating
**Solution**: Ensure `layoutId` is unique across the page. Check for duplicate `layoutId` values.

### Issue: Creator level ring not animating
**Solution**: Verify the creator level is a number, not a string:
```typescript
const creatorLevel = Number(community.creator?.level) || 1;
```

---

## 📊 Type Additions (if needed)

Add these fields to your `Community` type if they don't exist:

```typescript
interface Community {
  // ... existing fields

  // New fields for V2
  iconUrl?: string;              // Community profile icon
  bannerUrl?: string;            // Hero banner image
  updatedAt?: string;            // Last updated timestamp
  progress?: number;             // User progress (0-100)
  category?: string;             // Community category
  privacy?: 'public' | 'private' | 'invite';

  // Creator fields
  creator?: {
    name: string;
    avatarUrl?: string;
    level?: number;
    displayName?: string;
    photoURL?: string;
  };
  creatorName?: string;
  creatorAvatar?: string;
  creatorLevel?: number;
}
```

---

## 🎯 Next Steps

1. **Test the V2 dashboard** on a staging environment
2. **Gather user feedback** on the new design
3. **Implement optional features** (mentions, infinite scroll, real-time updates)
4. **Monitor performance** and optimize as needed
5. **Deploy to production** after thorough testing

---

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Safari (latest)
- ✅ Firefox (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

**Note**: Requires CSS backdrop-filter support. Fallback to solid backgrounds on older browsers.

---

## 📝 Credits

Design inspired by:
- Discord (community interaction)
- Notion (clean, minimal aesthetic)
- Apple UI (premium glassmorphism)

Built with:
- React + TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI
- Lucide Icons

---

**Last Updated**: October 20, 2025
**Version**: 2.0.0
