# CreatorFullScreenView - Quick Integration Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install @radix-ui/react-dialog framer-motion canvas-confetti sonner
```

### Step 2: Import and Use

```tsx
import { CreatorFullScreenView, Creator } from '@/components/homepage-v2/CreatorFullScreenView';
import { useState } from 'react';

function YourComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  const creator: Creator = {
    id: 'creator-1',
    name: 'Amara Wellness Coach',
    tagline: 'Transform your life with mindful practices',
    avatarUrl: '/Amara Wellness Coach.png',
    zapCost: 500,
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>View Creator</button>
      
      <CreatorFullScreenView
        open={isOpen}
        setOpen={setIsOpen}
        creator={creator}
        onUnlock={async (id) => console.log('Unlock:', id)}
        userZapBalance={2500}
      />
    </>
  );
}
```

---

## 🔌 Integration with Your Existing Code

### 1. FeaturedCreators Component

Update your existing `FeaturedCreators.tsx` to open the full-screen view:

```tsx
// src/components/homepage-v2/FeaturedCreators.tsx
import { CreatorFullScreenView, Creator } from './CreatorFullScreenView';
import { useState } from 'react';

export function FeaturedCreators() {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsOpen(true);
  };

  return (
    <div>
      {/* Your existing creator cards */}
      {creators.map((creator) => (
        <div key={creator.id} onClick={() => openCreator(creator)}>
          {/* Card content */}
        </div>
      ))}

      {/* Add the full-screen view */}
      {selectedCreator && (
        <CreatorFullScreenView
          open={isOpen}
          setOpen={setIsOpen}
          creator={selectedCreator}
          onUnlock={handleUnlock}
          userZapBalance={userZapBalance}
        />
      )}
    </div>
  );
}
```

### 2. Wire to Firebase Auth

```tsx
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/firebase';

function YourComponent() {
  const { user } = useAuth();

  const handleUnlock = async (creatorId: string) => {
    // Check if user is signed in
    if (!user) {
      await signInWithGoogleAndRedirect();
      return;
    }

    // Your unlock logic here
    await unlockCreatorInFirestore(creatorId, user.uid);
  };

  return (
    <CreatorFullScreenView
      {...props}
      onUnlock={handleUnlock}
      userZapBalance={user?.zapBalance ?? 0}
    />
  );
}
```

### 3. Wire to Cloud Functions

```tsx
import { getFunctions, httpsCallable } from 'firebase/functions';

const handleUnlock = async (creatorId: string) => {
  const functions = getFunctions();
  const unlockCreator = httpsCallable(functions, 'unlockCreator');

  try {
    const result = await unlockCreator({ creatorId });
    // Success handled by component (confetti + toast)
    return result.data;
  } catch (error) {
    // Error handled by component (toast)
    throw error;
  }
};
```

---

## 🎯 Integration Points in Your Codebase

### Files to Update

1. **`src/components/homepage-v2/FeaturedCreators.tsx`**
   - Add state for selected creator
   - Add click handler to open full-screen view
   - Import and render `CreatorFullScreenView`

2. **`src/hooks/useAuth.ts`** (if not exists, create it)
   - Hook to get current user and ZAP balance
   - Example:
   ```tsx
   export function useAuth() {
     const [user, setUser] = useState(null);
     const [zapBalance, setZapBalance] = useState(0);
     
     useEffect(() => {
       // Listen to auth state
       const unsubscribe = onAuthStateChanged(auth, (user) => {
         setUser(user);
         if (user) {
           // Fetch ZAP balance from Firestore
           fetchZapBalance(user.uid).then(setZapBalance);
         }
       });
       return unsubscribe;
     }, []);

     return { user, zapBalance };
   }
   ```

3. **`src/lib/firebase.ts`**
   - Ensure `signInWithGoogleAndRedirect` is exported
   - Add Cloud Function callable if needed

4. **`functions/src/unlockCreator.ts`** (Cloud Function)
   - Create or update the unlock function
   - Handle ZAP deduction
   - Update user's unlocked creators list

---

## 🎨 Customization Examples

### Change Colors

```tsx
// In CreatorFullScreenView.tsx, replace gradient colors:
// from-[#8A63FF] via-[#A259FF] to-[#FF86C1]
// with your brand colors:
// from-[#YOUR_COLOR_1] via-[#YOUR_COLOR_2] to-[#YOUR_COLOR_3]
```

### Add Custom Features

```tsx
const creator: Creator = {
  id: 'creator-1',
  name: 'Your Creator',
  features: [
    'Your Custom Feature 1',
    'Your Custom Feature 2',
    'Your Custom Feature 3',
  ],
};
```

### Add Analytics

```tsx
const handleUnlock = async (creatorId: string) => {
  // Track unlock event
  analytics.logEvent('creator_unlock_attempted', { creatorId });

  try {
    await unlockCreator(creatorId);
    analytics.logEvent('creator_unlock_success', { creatorId });
  } catch (error) {
    analytics.logEvent('creator_unlock_failed', { creatorId, error });
  }
};
```

---

## 🧪 Testing Your Integration

### 1. Manual Testing

```bash
# Start your dev server
npm run dev

# Navigate to the page with creators
# Click a creator card
# Verify:
# - Full-screen view opens smoothly
# - ESC key closes the view
# - Unlock button works
# - Confetti appears on success
# - Toast notifications show
```

### 2. Browser Testing

Test in these browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### 3. Responsive Testing

Test at these breakpoints:
- 📱 Mobile: 375px, 414px
- 📱 Tablet: 768px, 1024px
- 💻 Desktop: 1280px, 1920px

---

## 🐛 Common Issues & Solutions

### Issue: Dialog doesn't open

**Solution:** Check that `open` prop is `true` and Radix Dialog is installed:
```bash
npm list @radix-ui/react-dialog
```

### Issue: Animations are janky

**Solution:** Ensure Framer Motion is installed and check for heavy renders:
```bash
npm list framer-motion
```

### Issue: Confetti doesn't show

**Solution:** Verify canvas-confetti is installed:
```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

### Issue: Images don't load

**Solution:** Check image paths are correct and files exist in `/public`:
```bash
ls -la public/*.png
ls -la public/*.jpg
```

### Issue: TypeScript errors

**Solution:** Ensure all types are imported:
```tsx
import type { Creator } from '@/components/homepage-v2/CreatorFullScreenView';
```

---

## 📦 Package.json Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "framer-motion": "^11.0.0",
    "canvas-confetti": "^1.9.2",
    "sonner": "^1.4.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.6.4"
  }
}
```

---

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] All dependencies installed
- [ ] Images uploaded to `/public` or CDN
- [ ] Cloud Functions deployed
- [ ] Firestore rules updated
- [ ] Auth flow tested
- [ ] Payment/ZAP deduction tested
- [ ] Cross-browser tested
- [ ] Mobile responsive tested
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] Analytics events wired up
- [ ] Error handling tested
- [ ] Loading states tested

---

## 📞 Support

If you encounter issues:

1. Check the main README: `CREATOR_FULLSCREEN_VIEW_README.md`
2. Review the example: `CreatorFullScreenViewExample.tsx`
3. Check browser console for errors
4. Verify all dependencies are installed
5. Test in incognito mode (to rule out extensions)

---

## 🎉 You're Ready!

Your CreatorFullScreenView component is now integrated and ready to use. Enjoy the Calm Cosmic Luxury experience! ✨

