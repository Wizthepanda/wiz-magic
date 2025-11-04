# Category & Subcategory Selector - QA Test Checklist

## Pre-Testing Setup
- [ ] Ensure you're on the correct branch
- [ ] Run `npm install` to ensure all dependencies are up to date
- [ ] Start the dev server with `npm run dev`
- [ ] Clear browser cache and local storage
- [ ] Open browser DevTools Console to monitor logs

## 1. UI/UX Testing

### Category Selection
- [ ] Navigate to Creator Studio → YouTube → Select Videos → Publish Step
- [ ] Verify category selector renders with all 11 categories
- [ ] Click on each category chip and verify:
  - [ ] Chip shows gradient background (purple to pink)
  - [ ] Soft glow effect appears around selected chip
  - [ ] Check icon appears on selected chip
  - [ ] Previous selection is deselected
- [ ] Test horizontal scrolling on mobile viewport
- [ ] Test keyboard navigation:
  - [ ] Tab to focus on category chips
  - [ ] Arrow keys to move between chips
  - [ ] Enter/Space to select

### Subcategory Selection
- [ ] Select a main category (e.g., "Tech")
- [ ] Verify subcategory panel animates in smoothly (fade + slide up)
- [ ] Verify subcategory header shows:
  - [ ] "Select Subcategory" label with red asterisk
  - [ ] Chevron icon → Main category label
- [ ] Verify subcategories display in grid (2 cols mobile, 3 tablet, 4 desktop)
- [ ] Click on each subcategory and verify:
  - [ ] Selected state shows gradient background
  - [ ] Check icon appears
  - [ ] Previous subcategory selection is deselected
- [ ] Test keyboard navigation for subcategories

### Tag Preview Pills
- [ ] Verify "Discovery Tags" panel appears on the right (desktop) or below (mobile)
- [ ] Before selection:
  - [ ] Shows placeholder text: "Select category and subcategory to preview tags"
- [ ] After category selection:
  - [ ] Purple pill appears with category label
  - [ ] Pill has fly-in animation (scale + slide)
- [ ] After subcategory selection:
  - [ ] Pink pill appears with subcategory label
  - [ ] Green dot indicator shows "Your video will appear in these filters on Discover"
- [ ] Test pill animations are smooth and polished

### Responsive Design
- [ ] Test on mobile viewport (320px - 640px)
  - [ ] Categories scroll horizontally
  - [ ] Subcategories display in 2 columns
  - [ ] Tag preview appears below category selector
  - [ ] Layout stacks vertically
- [ ] Test on tablet viewport (641px - 1024px)
  - [ ] Subcategories display in 3 columns
- [ ] Test on desktop viewport (1025px+)
  - [ ] Two-column layout (2/3 selector, 1/3 preview)
  - [ ] Subcategories display in 4 columns

## 2. Functional Testing

### Category/Subcategory Selection Flow
- [ ] Select category "Tech" → verify subcategories show: AI, Programming, Web Dev, etc.
- [ ] Select subcategory "AI" → verify both pills appear
- [ ] Change category to "Money" → verify:
  - [ ] Subcategory resets to null
  - [ ] Subcategory panel re-animates with new options
  - [ ] Pink subcategory pill disappears
  - [ ] Purple category pill updates to "Money"
- [ ] Select new subcategory "Crypto" → verify pink pill updates

### Publish Button State
- [ ] Initial state (no selections):
  - [ ] Button is disabled
  - [ ] Button text: "Select Category & Subcategory"
  - [ ] Button has opacity-50 and cursor-not-allowed
- [ ] After category only:
  - [ ] Button remains disabled
- [ ] After both category & subcategory:
  - [ ] Button becomes enabled
  - [ ] Button text: "Publish to Discover"
  - [ ] Hover effect works (scale-105)
- [ ] During publishing:
  - [ ] Button is disabled
  - [ ] Shows spinner + "Publishing..." text

### Publishing Flow
- [ ] Select 1 video, choose Tech → AI, click Publish
- [ ] Monitor console logs:
  - [ ] Should see: "✅ Published video [videoId] to Discover with category: tech, subcategory: AI"
- [ ] Verify no errors in console
- [ ] Verify success step appears (Step 4)

## 3. Data Validation Testing

### Firestore Document Structure
- [ ] Open Firebase Console → Firestore → `/discover` collection
- [ ] Find the newly published video document
- [ ] Verify document contains:
  - [ ] `category: "tech"` (or selected category value)
  - [ ] `subcategory: "AI"` (or selected subcategory)
  - [ ] `tags: ["AI", "tech"]` (array with subcategory first, category second)
  - [ ] `type: "youtube_video"`
  - [ ] `status: "published"`
  - [ ] `visibility: "public"`
  - [ ] `creatorId: [user uid]`
  - [ ] `videoId: [youtube video id]`
  - [ ] `title`, `thumbnail`, `duration`
  - [ ] `publishedAt` and `createdAt` timestamps
  - [ ] `totalZAPsEarned: 0`, `totalViews: 0`, etc.

### Multiple Video Publishing
- [ ] Select 3 videos
- [ ] Choose Health → Fitness
- [ ] Click Publish
- [ ] Verify 3 documents created in Firestore
- [ ] Verify all 3 have same category/subcategory
- [ ] Verify all 3 have unique videoIds

### Category Taxonomy Validation
Test each main category has correct subcategories:
- [ ] Tech → AI, Programming, Web Dev, Web3, Data, Coding, Software, Robotics, AR
- [ ] Money → Crypto, Stocks, Real Estate, Trading, Startup, Crowdfunding, Marketing, E-commerce, Freelance
- [ ] Design → Graphic, UX/UI, Art, Animation, Video, Photography, 3D, NFTs
- [ ] Health → Fitness, Longevity, Nutrition, Wellness, Yoga, Mental Health, Meditation, Sleep
- [ ] Self-Improvement → Productivity, Motivation, Mindset, Public Speaking, Leadership, Creativity
- [ ] Education → Languages, Online Learning, Learning, Teaching, Research
- [ ] Gaming → Esports, Game Dev, Streaming, VR, Mobile
- [ ] Entertainment → Anime, Animations, Music, Movies, Sports, Comedy, Podcasting
- [ ] Lifestyle → Travel, Cooking, Fashion, Parenting, Home
- [ ] Social → Dating, Networking, Relationships, Communication, Social Skills, Social Media
- [ ] DIY → Crafts, Home Improvement, Gardening, Woodworking, Repair, 3D Printing

## 4. React Query Cache Invalidation

### Discover Feed Sync
- [ ] Before publishing, open Discover page in another tab
- [ ] Publish a video with Gaming → Esports
- [ ] Return to Discover tab
- [ ] Verify the new video appears in the feed (may need refresh)
- [ ] Verify React Query devtools shows invalidation (if installed)

### Filter Chips Sync
- [ ] Navigate to Discover page
- [ ] Verify filter chips show all main categories
- [ ] Click on "Gaming" filter
- [ ] Verify subcategory chips appear (Esports, Game Dev, Streaming, VR, Mobile)
- [ ] Click on "Esports" subcategory
- [ ] Verify newly published video appears in filtered results

## 5. Edge Cases & Error Handling

### Validation Errors
- [ ] Try to publish without selecting category → verify error message
- [ ] Try to publish with category but no subcategory → verify button stays disabled
- [ ] Verify error message appears: "Please select both category and subcategory"

### Network Errors
- [ ] Open DevTools → Network tab
- [ ] Throttle to Slow 3G
- [ ] Publish video
- [ ] Verify loading state shows correctly
- [ ] Verify publish completes or shows appropriate error

### Rate Limiting
- [ ] Publish video
- [ ] Immediately try to publish again
- [ ] Verify button is disabled during first publish

### Authentication Edge Cases
- [ ] Sign out during publish step
- [ ] Verify error: "User not authenticated"
- [ ] Sign back in and retry

## 6. Accessibility (A11y) Testing

### Keyboard Navigation
- [ ] Use only keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Navigate through entire category/subcategory flow
- [ ] Verify all interactive elements are reachable
- [ ] Verify focus indicators are visible

### Screen Reader Testing (Optional but Recommended)
- [ ] Enable screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Verify category chips announce as "option, [category name]"
- [ ] Verify selected state is announced
- [ ] Verify subcategory panel announces new options

### ARIA Attributes
- [ ] Inspect category container → verify `role="listbox"`, `aria-label="Main categories"`
- [ ] Inspect category chip → verify `role="option"`, `aria-selected="true/false"`
- [ ] Inspect subcategory container → verify appropriate ARIA labels

## 7. Visual Polish & Animations

### Animation Smoothness
- [ ] Verify all animations are smooth (60 FPS)
- [ ] No janky transitions
- [ ] Framer Motion layoutId transitions work correctly
- [ ] Glow effects render without performance issues

### Liquid-Glass Aesthetic
- [ ] Verify backdrop-blur effects on selector card
- [ ] Verify gradient borders and shadows
- [ ] Verify color palette matches WIZUP brand:
  - [ ] Purples: #9b5de5, #a65ff1
  - [ ] Pinks: #f15bb5, #ff6ec7
  - [ ] Gradients smooth and vibrant

### Mobile Touch Interactions
- [ ] Test on real mobile device (if possible)
- [ ] Verify chips have adequate touch targets (min 44x44px)
- [ ] Verify no accidental selections
- [ ] Verify smooth scrolling

## 8. Integration Testing

### End-to-End YouTube Publish Flow
- [ ] Start from Creator Studio → YouTube tab
- [ ] Connect YouTube account (if not already)
- [ ] Select videos (Step 2)
- [ ] Proceed to Publish step (Step 3)
- [ ] Select category & subcategory
- [ ] Publish
- [ ] Verify success screen (Step 4)
- [ ] Navigate to Discover
- [ ] Verify video appears with correct category filter

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Success Criteria

✅ All UI elements render correctly and match WIZUP liquid-glass design
✅ Category and subcategory selection works smoothly with animations
✅ Tag preview pills update in real-time
✅ Publish button validation works correctly
✅ Firestore documents contain correct category/subcategory fields
✅ React Query cache invalidation triggers Discover feed updates
✅ Full keyboard accessibility
✅ Mobile-responsive design
✅ No console errors or warnings
✅ All 11 categories and subcategories match exact taxonomy

## Notes

- If any test fails, document the issue with:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Browser/device info
  - Screenshots/screen recordings if applicable

- Check browser console for any warnings or errors throughout testing
- Monitor Network tab for failed requests or slow responses
- Use React DevTools to inspect component state during testing
