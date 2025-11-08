# CreatorFullScreenView Component

A production-ready, full-screen immersive Creator Experience component with **Calm Cosmic Luxury** theme.

## 🎨 Design System

### Visual Tokens
- **Accent Gradient**: `#8A63FF → #A259FF → #FF86C1`
- **Glass Background**: `bg-white/95` with `backdrop-blur-lg`
- **Overlay**: `bg-black/50` + `backdrop-blur-md`
- **Primary Text**: `#0f1724`
- **Muted Text**: `#6b7280`
- **Avatar Glow**: `box-shadow: 0 12px 40px rgba(162,89,255,0.18)`
- **Border Radius**: `rounded-3xl`
- **Max Width**: `max-w-6xl`

### Typography
- **Heading**: `clamp(28px, 4vw, 48px)` - responsive fluid sizing
- **Body**: Inter/Poppins pairing recommended
- **Font Weights**: Semibold for headings, Medium for labels, Regular for body

### Animations (Framer Motion)
- **Overlay**: `{ opacity: 0 → 1, duration: 0.28s, ease: easeOut }`
- **Panel**: `{ y: 18, opacity: 0, scale: 0.995 → y: 0, opacity: 1, scale: 1, duration: 0.36s }`
- **Avatar Pulse**: `scale: [1, 1.02, 1]` every 3 seconds

---

## 📦 Installation

### Dependencies Required

```bash
npm install @radix-ui/react-dialog framer-motion canvas-confetti sonner lucide-react
```

Or with yarn:

```bash
yarn add @radix-ui/react-dialog framer-motion canvas-confetti sonner lucide-react
```

### Versions Used
- React: 18.x
- TypeScript: 5.x
- Tailwind CSS: 3.x
- Framer Motion: 11.x
- Radix Dialog: 1.x
- Lucide React: latest

---

## 🚀 Basic Usage

### 1. Import the Component

```tsx
import { CreatorFullScreenView, Creator } from '@/components/homepage-v2/CreatorFullScreenView';
import { useState } from 'react';
```

### 2. Basic Implementation

```tsx
function CreatorCard({ creator }: { creator: Creator }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUnlock = async (creatorId: string) => {
    // Your unlock logic here
    // e.g., call Cloud Function, update Firestore, deduct ZAPs
    console.log('Unlocking creator:', creatorId);
    
    // Example API call:
    // await fetch('/api/unlock-creator', {
    //   method: 'POST',
    //   body: JSON.stringify({ creatorId }),
    // });
  };

  const handlePreview = (creatorId: string) => {
    console.log('Previewing creator:', creatorId);
    // Navigate to preview or show preview modal
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        {/* Your creator card UI */}
        <img src={creator.avatarUrl} alt={creator.name} />
        <h3>{creator.name}</h3>
      </div>

      <CreatorFullScreenView
        open={isOpen}
        setOpen={setIsOpen}
        creator={creator}
        onUnlock={handleUnlock}
        onPreview={handlePreview}
        userZapBalance={2500}
      />
    </>
  );
}
```

### 3. Example Creator Data

```tsx
const exampleCreator: Creator = {
  id: 'creator-123',
  name: 'Amara Wellness Coach',
  tagline: 'Transform your life with mindful practices and holistic wellness',
  avatarUrl: '/Amara Wellness Coach.png',
  bannerUrl: '/banners/amara-banner.jpg',
  zapCost: 500,
  features: [
    'Private Group Chat',
    'Weekly Live Sessions',
    'Premium Content Library',
    'Early Access to New Content',
  ],
  previewVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
};
```

---

## 🔗 React Router Integration

### Route-Based Opening

If you want the creator view to open based on a URL (e.g., `/creator/:id`):

```tsx
// In your router setup
import { useParams, useNavigate } from 'react-router-dom';

function CreatorRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);

  useEffect(() => {
    // Fetch creator data
    fetchCreator(id).then(setCreator);
  }, [id]);

  const handleClose = () => {
    navigate('/', { replace: true });
  };

  if (!creator) return <div>Loading...</div>;

  return (
    <CreatorFullScreenView
      open={true}
      setOpen={(open) => !open && handleClose()}
      creator={creator}
      onUnlock={handleUnlock}
      onPreview={handlePreview}
    />
  );
}

// Add to your routes:
<Route path="/creator/:id" element={<CreatorRoute />} />
```

### Programmatic Navigation

```tsx
// From any component
const navigate = useNavigate();

const openCreator = (creatorId: string) => {
  navigate(`/creator/${creatorId}`);
};
```

---

## 🔐 Authentication Integration

### Sign-In Gating

```tsx
import { signInWithGoogleAndRedirect } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

function CreatorCardWithAuth({ creator }: { creator: Creator }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleUnlock = async (creatorId: string) => {
    // Check if user is signed in
    if (!user) {
      // Redirect to sign in
      await signInWithGoogleAndRedirect();
      return;
    }

    // Check if user has enough ZAPs
    if (user.zapBalance < creator.zapCost) {
      toast.error('Insufficient ZAPs');
      return;
    }

    // Proceed with unlock
    try {
      await unlockCreator(creatorId, user.uid);
      toast.success('Creator unlocked!');
    } catch (error) {
      toast.error('Failed to unlock creator');
    }
  };

  return (
    <CreatorFullScreenView
      open={isOpen}
      setOpen={setIsOpen}
      creator={creator}
      onUnlock={handleUnlock}
      userZapBalance={user?.zapBalance ?? 0}
    />
  );
}
```

---

## 🎯 API Integration

### Cloud Function Example

```typescript
// functions/src/unlockCreator.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const unlockCreator = functions.https.onCall(async (data, context) => {
  const { creatorId } = data;
  const userId = context.auth?.uid;

  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const db = admin.firestore();
  
  // Get user and creator data
  const userDoc = await db.collection('users').doc(userId).get();
  const creatorDoc = await db.collection('creators').doc(creatorId).get();
  
  const user = userDoc.data();
  const creator = creatorDoc.data();

  if (!user || !creator) {
    throw new functions.https.HttpsError('not-found', 'User or creator not found');
  }

  // Check balance
  if (user.zapBalance < creator.zapCost) {
    throw new functions.https.HttpsError('failed-precondition', 'Insufficient ZAPs');
  }

  // Perform transaction
  await db.runTransaction(async (transaction) => {
    // Deduct ZAPs
    transaction.update(userDoc.ref, {
      zapBalance: admin.firestore.FieldValue.increment(-creator.zapCost),
    });

    // Add to unlocked creators
    transaction.set(
      db.collection('users').doc(userId).collection('unlockedCreators').doc(creatorId),
      {
        unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
        zapCost: creator.zapCost,
      }
    );

    // Increment creator unlock count
    transaction.update(creatorDoc.ref, {
      unlockCount: admin.firestore.FieldValue.increment(1),
    });
  });

  return { success: true };
});
```

### Client-Side Call

```tsx
import { getFunctions, httpsCallable } from 'firebase/functions';

const handleUnlock = async (creatorId: string) => {
  const functions = getFunctions();
  const unlockCreator = httpsCallable(functions, 'unlockCreator');

  try {
    const result = await unlockCreator({ creatorId });
    console.log('Unlock result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Unlock error:', error);
    throw error;
  }
};
```

---

## 🎨 Customization

### Custom Features

```tsx
const customCreator: Creator = {
  id: 'custom-1',
  name: 'Custom Creator',
  features: [
    'Custom Feature 1',
    'Custom Feature 2',
    'Custom Feature 3',
  ],
  // ... other props
};
```

### Custom Styling

The component uses Tailwind classes. To customize:

1. **Colors**: Update the gradient values in the component
2. **Spacing**: Modify `px-`, `py-`, `gap-` classes
3. **Border Radius**: Change `rounded-` classes
4. **Shadows**: Update `shadow-` classes

### Extending the Component

```tsx
// Create a wrapper component
function EnhancedCreatorView(props: CreatorFullScreenViewProps) {
  return (
    <div className="custom-wrapper">
      <CreatorFullScreenView {...props} />
      {/* Add custom overlays, analytics, etc. */}
    </div>
  );
}
```

---

## ♿ Accessibility Features

### Built-in Accessibility
- ✅ Focus trap (Radix Dialog handles this)
- ✅ ESC key to close
- ✅ ARIA labels on all interactive elements
- ✅ `role="dialog"` and `aria-modal="true"`
- ✅ `aria-labelledby` and `aria-describedby` for screen readers
- ✅ Keyboard navigation (Tab, Shift+Tab)
- ✅ Focus returns to trigger element on close

### Testing Accessibility

```bash
# Run with screen reader
# macOS: VoiceOver (Cmd+F5)
# Windows: NVDA or JAWS
# Linux: Orca

# Keyboard navigation test:
# 1. Tab through all interactive elements
# 2. Press ESC to close
# 3. Verify focus returns to trigger
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 640px` - Single column, stacked layout
- **Tablet**: `640px - 1024px` - Adjusted spacing
- **Desktop**: `> 1024px` - Two-column grid

### Mobile Optimizations
- Smaller avatar (80px vs 112px)
- Reduced padding
- Stacked action buttons
- Fluid typography with `clamp()`

---

## 🧪 Testing Checklist

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Functional Testing
- [ ] Open/close animation smooth
- [ ] ESC key closes dialog
- [ ] Click outside closes dialog (if enabled)
- [ ] Unlock button works
- [ ] Preview button works
- [ ] Confetti fires on unlock
- [ ] Toast notifications appear
- [ ] ZAP balance updates
- [ ] Focus trap works
- [ ] Keyboard navigation works

### Visual Testing
- [ ] Long creator names don't break layout
- [ ] Missing images show fallback
- [ ] Responsive on all screen sizes
- [ ] Avatar pulse animation smooth
- [ ] Gradient colors correct
- [ ] Shadows render properly
- [ ] Text is readable on all backgrounds

### Performance Testing
- [ ] Images lazy load
- [ ] No layout shift on open
- [ ] Smooth 60fps animations
- [ ] No memory leaks on repeated open/close

---

## 🚀 Performance Optimization

### Image Optimization

```tsx
// Lazy load banner images
<img 
  src={creator.bannerUrl} 
  alt={creator.name}
  loading="lazy"
  decoding="async"
/>

// Prefetch critical images
<link rel="prefetch" href={creator.avatarUrl} />
```

### Code Splitting

```tsx
// Lazy load the component
const CreatorFullScreenView = lazy(() => 
  import('@/components/homepage-v2/CreatorFullScreenView')
);

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <CreatorFullScreenView {...props} />
</Suspense>
```

---

## 🐛 Troubleshooting

### Dialog Not Appearing
- Ensure Radix Dialog is installed
- Check z-index conflicts (component uses `z-[100]` and `z-[101]`)
- Verify `open` prop is `true`

### Animations Stuttering
- Check for heavy renders during animation
- Use React DevTools Profiler
- Ensure Framer Motion is installed

### Focus Trap Not Working
- Radix Dialog handles this automatically
- Ensure no conflicting focus management
- Check for `tabIndex="-1"` on container elements

### Confetti Not Showing
- Verify `canvas-confetti` is installed
- Check browser console for errors
- Ensure confetti origin is within viewport

---

## 📚 Additional Resources

- [Radix UI Dialog Documentation](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🎉 Example Integration in Your App

```tsx
// pages/Creators.tsx
import { CreatorFullScreenView, Creator } from '@/components/homepage-v2/CreatorFullScreenView';
import { useState } from 'react';

export function CreatorsPage() {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const creators: Creator[] = [
    {
      id: '1',
      name: 'Amara Wellness Coach',
      tagline: 'Transform your life with mindful practices',
      avatarUrl: '/Amara Wellness Coach.png',
      zapCost: 500,
    },
    // ... more creators
  ];

  const openCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsOpen(true);
  };

  return (
    <div>
      <h1>Featured Creators</h1>
      <div className="grid grid-cols-3 gap-4">
        {creators.map((creator) => (
          <div 
            key={creator.id}
            onClick={() => openCreator(creator)}
            className="cursor-pointer"
          >
            <img src={creator.avatarUrl} alt={creator.name} />
            <h3>{creator.name}</h3>
          </div>
        ))}
      </div>

      {selectedCreator && (
        <CreatorFullScreenView
          open={isOpen}
          setOpen={setIsOpen}
          creator={selectedCreator}
          onUnlock={handleUnlock}
          onPreview={handlePreview}
        />
      )}
    </div>
  );
}
```

---

## 📝 License

This component is part of your project and follows your project's license.

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Framer Motion**

