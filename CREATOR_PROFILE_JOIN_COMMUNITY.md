# Creator Profile - Join Community Integration

This document describes the luxury Creator Profile redesign with full Join Community functionality.

## Overview

The Creator Public Profile is a world-class, luxury UI that showcases creator content with prominent Join Community/Course actions. The design uses glassmorphism, soft gradients, and subtle animations for a premium feel while maintaining accessibility and performance.

## Architecture

### Components

1. **CreatorHeader** (`src/components/creator/CreatorHeader.tsx`)
   - YouTube-style luxury layout with banner, avatar, and action buttons
   - Glassmorphism effects with subtle pulse animations
   - Responsive design with proper mobile/desktop breakpoints
   - Integrates JoinCommunityButton when creator has a published community

2. **JoinCommunityButton** (`src/components/creator/JoinCommunityButton.tsx`)
   - Handles all community access models:
     - `free`: Free community access with optional ZAP rewards
     - `free_zaps`: Rewards users with ZAPs for joining
     - `zaps_pay`: Requires ZAP payment (deducted from user balance)
     - `usd`: Requires USD payment via crypto
     - `zaps_usd`: Hybrid payment (ZAPs + USD)
     - `waitlist`: Email collection for invite-only communities
   - Optimistic UI updates with loading states
   - Confetti celebration on successful join
   - Analytics event tracking

3. **PaymentModal** (`src/components/creator/PaymentModal.tsx`)
   - Premium payment modal for USD and crypto payments
   - Integrates with NOWPayments for cryptocurrency
   - Displays pricing breakdown (ZAPs → USD + base price)
   - Success animations and state management

4. **WaitlistModal** (`src/components/creator/WaitlistModal.tsx`)
   - Email collection with position tracking
   - Pre-fills user data when signed in
   - Notification preference toggle
   - Adds to Firestore waitlists collection

5. **CreatorFullScreen** (`src/pages/CreatorFullScreen.tsx`)
   - Main creator profile page
   - Fetches creator data, videos, and community
   - Passes data to child components
   - Analytics tracking (profile views, video plays)

### Hooks

1. **useCreatorProfile** (`src/hooks/useCreatorProfile.ts`)
   - Fetches creator public profile by ID or username
   - React Query caching (5-minute stale time)
   - Returns: displayName, avatar, banner, bio, stats, etc.

2. **useCreatorVideos** (`src/hooks/useCreatorProfile.ts`)
   - Fetches creator's published videos
   - Transforms to unified video format
   - React Query caching

3. **useCreatorCommunity** (`src/hooks/useCreatorCommunity.ts`)
   - Fetches creator's primary (published) community
   - Returns: id, title, pricing, access model, member count
   - Used to show Join Community button

### Cloud Functions

1. **purchaseCommunityAccess** (`functions/src/purchaseCommunityAccess.ts`)
   - Secure backend transaction for ZAP-based access
   - Handles: free, free_zaps, zaps_pay access types
   - Creates transaction records
   - Updates user ZAP balance and community membership
   - Returns: success, message, zapCost, zapReward

   **Endpoint**: `us-central1-wiz-magic-platform.cloudfunctions.net/purchaseCommunityAccess`

   **Request**:
   ```typescript
   {
     communityId: string;
     zapCost: number;
     communityTitle: string;
   }
   ```

   **Response**:
   ```typescript
   {
     success: boolean;
     message: string;
     zapCost: number;
     zapReward: number;
   }
   ```

## Environment Variables

Required environment variables (set in Firebase Hosting or Functions):

```bash
# NOWPayments API (for crypto payments)
VITE_NOWPAYMENTS_API_KEY=your_api_key_here
VITE_NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# Firebase Configuration (auto-provided by Firebase)
VITE_FIREBASE_API_KEY=auto
VITE_FIREBASE_AUTH_DOMAIN=auto
VITE_FIREBASE_PROJECT_ID=auto
VITE_FIREBASE_STORAGE_BUCKET=auto
VITE_FIREBASE_MESSAGING_SENDER_ID=auto
VITE_FIREBASE_APP_ID=auto
```

## Firestore Collections

### communities
```typescript
{
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  status: 'draft' | 'published' | 'scheduled';

  // Access model
  zapsRequired: number;          // 0 for free
  usdCoPay: number;              // 0 for ZAP-only
  offerZAPsToNewMembers: boolean; // true for free_zaps
  newMemberZAPsReward: number;    // reward amount
  waitlistOnly: boolean;          // true for waitlist

  // Stats
  memberCount: number;
  members: string[];  // array of member UIDs

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}
```

### communities/{id}/members
```typescript
{
  userId: string; // document ID
  joinedAt: Timestamp;
  role: 'creator' | 'member';
  displayName: string;
  username: string;
  profilePic: string;
  photoURL: string;
  avatarUrl: string;
  level: number;
  xp: number;
}
```

### waitlists/{communityId}/entries
```typescript
{
  email: string;
  displayName: string;
  userId?: string;
  position: number;
  addedAt: Timestamp;
  notifyWhenOpen: boolean;
  status: 'pending' | 'approved';
  communityTitle: string;
  creatorName: string;
}
```

### users/{uid}/memberships
```typescript
{
  communityId: string; // document ID
  joinedAt: Timestamp;
}
```

### transactions
```typescript
{
  userId: string;
  communityId: string;
  communityTitle: string;
  zapAmount: number;      // positive for rewards, negative for costs
  zapCost: number;        // original cost (always positive)
  zapReward: number;      // reward amount (always positive)
  type: 'community_purchase' | 'community_join_reward' | 'community_join_free';
  status: 'completed' | 'pending' | 'failed';
  timestamp: Timestamp;
}
```

### analytics_events
```typescript
{
  eventType: string;
  userId?: string;
  creatorId?: string;
  communityId?: string;
  courseId?: string;
  metadata?: Record<string, any>;
  timestamp: Timestamp;
  userAgent: string;
  url: string;
}
```

## Firestore Indexes Required

The following composite indexes are required (already in `firestore.indexes.json`):

```json
{
  "collectionGroup": "communities",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "creatorId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

```json
{
  "collectionGroup": "entries",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "email", "order": "ASCENDING" },
    { "fieldPath": "addedAt", "order": "DESCENDING" }
  ]
}
```

## Analytics Events

Tracked events:

1. `creator_profile_view` - User views creator profile
2. `video_play_from_profile` - User plays video from creator profile
3. `community_join_attempt` - User initiates join flow
4. `community_join_success` - Join completed successfully
5. `community_join_failure` - Join failed with error

## Join Flow Diagrams

### Free Community
```
User clicks "Join Free"
  → Call purchaseCommunityAccess(zapCost: 0)
  → Add user to members subcollection
  → Add to user's memberships
  → Show confetti + success toast
  → Button changes to "Enter Community"
```

### Free ZAPs Community (Rewards)
```
User clicks "Join (+50 ZAPs)"
  → Call purchaseCommunityAccess(zapCost: 0, zapReward: 50)
  → Add user to members
  → ADD 50 ZAPs to user balance
  → Create reward transaction
  → Show confetti + "Earned 50 ZAPs!" toast
  → Button changes to "Enter Community"
```

### ZAPs Pay Community
```
User clicks "Join (100 ZAPs)"
  → Call purchaseCommunityAccess(zapCost: 100)
  → Check user has ≥100 ZAPs
  → DEDUCT 100 ZAPs from balance
  → Add user to members
  → Create purchase transaction
  → Show confetti + success toast
  → Button changes to "Enter Community"
```

### USD / Crypto Community
```
User clicks "Join ($9.99)"
  → Open PaymentModal
  → User selects crypto (BTC, USDT, etc.)
  → Call NOWPayments API
  → Open payment window
  → Poll for payment confirmation
  → On success: add to members, show confetti
```

### Waitlist Community
```
User clicks "Join Waitlist"
  → Open WaitlistModal
  → User enters email (pre-filled if signed in)
  → Check if email already on waitlist
  → Get current waitlist size for position
  → Add to waitlists/{id}/entries
  → Show position: "You're #23 in line"
  → Confetti + success toast
```

## Styling Tokens

Custom Tailwind utilities used:

```css
/* Glassmorphism */
bg-white/60 backdrop-blur-md

/* Brand Gradient */
bg-gradient-to-r from-indigo-600 to-violet-500

/* Luxury Shadows */
shadow-2xl hover:shadow-xl

/* Rounded Corners */
rounded-2xl  /* modals, cards */
rounded-full /* buttons, avatars */

/* Spacing */
h-11 px-5    /* standard button */
max-w-7xl    /* content wrapper */
```

## Accessibility

- All buttons have `aria-label` attributes
- Keyboard navigation supported via Radix UI Dialog
- Focus trap inside modals
- Color contrast meets WCAG AA standards
- `prefers-reduced-motion` respected for animations

## Performance

- React Query caching reduces redundant API calls
- Optimistic UI updates for instant feedback
- Lazy loading for modals (only render when open)
- Firestore indexes for fast queries
- Stale-while-revalidate pattern (5-minute stale time)

## Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build:hosting
```

### 3. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 4. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### 5. Deploy Hosting
```bash
firebase deploy --only hosting
```

### All in One
```bash
npm run build:hosting && firebase deploy
```

## Testing Checklist

- [ ] Free community join flow works
- [ ] Free ZAPs rewards are credited correctly
- [ ] ZAPs pay deducts from balance
- [ ] Insufficient ZAPs shows error message
- [ ] Crypto payment opens NOWPayments
- [ ] Waitlist adds email and shows position
- [ ] Already-member shows "Enter Community"
- [ ] Confetti plays on success
- [ ] Analytics events are tracked
- [ ] Mobile responsive design works
- [ ] Dark mode styling correct
- [ ] Keyboard navigation works in modals

## Troubleshooting

### Join button not showing
- Check if creator has published community (status: 'published')
- Verify `useCreatorCommunity` hook is fetching data
- Check Firestore indexes are deployed

### ZAP transaction fails
- Ensure `purchaseCommunityAccess` cloud function is deployed
- Check user has `userZAPs/{uid}` document
- Verify transaction is running in Firestore (check logs)

### Payment modal empty
- Verify NOWPayments API key is set
- Check network tab for API errors
- Ensure currencies are loading

### Waitlist not recording
- Check Firestore rules allow writes to `waitlists/{id}/entries`
- Verify email uniqueness check is working
- Check position calculation logic

## Future Enhancements

- [ ] Course join button when creator has courses
- [ ] Multiple communities dropdown if creator has >1
- [ ] Member count live updates via Firestore listener
- [ ] Payment confirmation webhooks from NOWPayments
- [ ] Email notifications when waitlist opens
- [ ] Referral bonuses for community invites
- [ ] Community preview modal before joining
- [ ] Social proof: "23 people joined this week"

---

**Last Updated**: 2025-11-09
**Version**: 1.0
**Maintainer**: Claude Code + Wiz Magic Team
