# Create Community Flow

A premium community creation experience that integrates seamlessly with the existing WIZUP Create page.

## Overview

The Create Community flow appears when users click "Community" under "What Do You Want to Create?" on the Create page. It provides a guided, step-by-step process for creators to build and monetize communities with ZAPS integration.

## Features

### 🎯 Core Functionality
- **4-Step Guided Process**: Details → Content → Monetize → Publish
- **Live Preview**: Real-time preview of community card in right column
- **Auto-Save Drafts**: Automatic draft saving every 30 seconds
- **ZAPS Integration**: Native ZAPs + USD co-pay pricing options
- **Existing Backend Integration**: Uses current routing logic for publishing

### 📱 Responsive Design
- **Desktop**: 2/3 form, 1/3 preview layout
- **Mobile**: Single column with stacked preview
- **Container Width**: Matches existing "What Do You Want to Create?" panel
- **Visual Consistency**: Glassmorphic surfaces, rounded-xl cards

### 🔧 Technical Implementation
- **React Hook Form + Zod**: Type-safe form validation
- **TanStack React Query**: Optimistic updates and caching
- **Framer Motion**: Smooth step transitions
- **Embla Carousel**: Banner image carousel (up to 5 images)

## User Flow

```
Create Page → Click "Community" → Create Community Page
├── Step 1: Details (Title, Category, Description, Tags, Privacy)
├── Step 2: Content (YouTube Connect, Modules, Downloads)
├── Step 3: Monetize (ZAPs, USD co-pay, Availability)
└── Step 4: Publish (Draft, Schedule, Publish Now)
```

## Step Breakdown

### Step 1 - Details
**Required Fields:**
- Community Title (5-120 characters)
- Category (dropdown selection)
- Short Description (10-300 characters)

**Optional Fields:**
- Tagline (140 characters)
- Long Description (markdown support coming soon)
- Tags (comma-separated)
- Cover Media (up to 5 images/videos)
- Privacy Settings (Public/Private/Invite-only)

### Step 2 - Content
**Features:**
- YouTube Channel Integration (reuses existing OAuth flow)
- Featured Content Modules (video/article links)
- Downloadable Resources (PDFs, files)
- Pinned Curriculum/Modules

### Step 3 - Monetize
**Pricing Options:**
- Free Community
- ZAPs Only
- USD Only
- ZAPs + USD Co-pay
- Split Payment (ZAPs OR USD)

**Access Control:**
- Member Limits (unlimited or specific number)
- Access Duration (lifetime, 30/90 days, 1 year)
- Subscription Options (monthly)

### Step 4 - Publish
**Publishing Options:**
- Save as Draft
- Schedule for Later
- Publish Immediately

**Routing Logic:**
- Free communities → Community Discovery
- Paid communities → XP Shop/Rewards (existing logic)

## API Integration

### Firestore Structure
```typescript
interface CommunityData {
  id: string;
  creatorId: string;
  title: string;
  tagline?: string;
  category: string;
  coverMedia: Array<{
    type: 'image' | 'youtube';
    url: string;
    thumbnail?: string;
  }>;
  shortDescription: string;
  longDescription?: string;
  tags: string[];
  privacy: 'public' | 'private' | 'invite';

  // Content
  youtubeChannelConnected: boolean;
  youtubeVideoIds: string[];
  modules: Array<{
    title: string;
    type: 'video' | 'article';
    link?: string;
    duration?: string;
  }>;
  downloads: Array<{
    name: string;
    url: string;
  }>;

  // Monetization
  zapsRequired: number;
  usdCoPay: number;
  slotsAvailable: number | null;
  subscriptionMonthly?: number;
  splitPayEnabled: boolean;
  accessWindow: string;

  // Publishing
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Timestamp;
  publishDate?: Date;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Backend Endpoints
**DO NOT CHANGE** - Uses existing routing logic:

```typescript
// Free communities
POST /api/communities/publish
{
  id: string,
  type: 'community',
  tier: 'free'
}

// Paid communities
POST /api/rewards/publish
{
  id: string,
  type: 'community',
  tier: 'paid',
  zapsRequired: number,
  usdPrice: number
}
```

## File Structure

```
src/
├── components/wiz/
│   ├── CreateCommunityPage.tsx      # Main stepper component
│   ├── CommunityPreview.tsx         # Right column preview
│   └── CreationHub.tsx              # Updated with routing
├── lib/schemas/
│   └── community.ts                 # Zod validation schemas
├── hooks/
│   └── useCommunity.ts              # React Query hooks
└── docs/
    └── CREATE_COMMUNITY_README.md   # This file
```

## Validation

### Client-Side (Zod)
- Real-time form validation
- Step-specific schemas
- Type-safe form data

### Server-Side (Firestore Rules)
```javascript
// Only creator can create/update their communities
match /communities/{communityId} {
  allow create, update: if request.auth != null &&
    request.auth.uid == resource.data.creatorId;
  allow read: if true; // Public communities readable by all
}
```

## Testing

### Unit Tests (Jest/RTL)
- Form validation logic
- Step navigation
- Draft save functionality

### Integration Tests
- Save Draft → Publish flow
- YouTube Connect integration
- Payment checkout flow

## Accessibility

### ARIA Support
- Labels for all form inputs
- Radio/checkbox groups
- Keyboard navigation
- Focus management
- Screen reader announcements

### Keyboard Navigation
- Tab order follows visual flow
- Enter/Space for button activation
- Escape to close modals
- Arrow keys for carousel navigation

## Performance

### Optimizations
- Lazy loading of preview media
- Debounced tag/slug generation
- Client-side validation before API calls
- Optimistic updates with React Query
- Auto-save throttling (30s intervals)

### Bundle Size
- Dynamic imports for step components
- Tree-shaking of unused utilities
- Compressed image placeholders

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

```bash
npm run build
firebase deploy --only hosting
```

**Live URL:** https://wiz-magic-platform.web.app

## Usage Instructions

1. **Navigate to Create Page**
2. **Click "Community"** under "What Do You Want to Create?"
3. **Follow 4-step process**:
   - Fill required details
   - Add content and resources
   - Configure pricing
   - Publish or save draft
4. **Community appears** in appropriate discovery section

## Support

For issues or feature requests:
- Create GitHub issue
- Check existing documentation
- Review Firestore security rules
- Verify API endpoint integration