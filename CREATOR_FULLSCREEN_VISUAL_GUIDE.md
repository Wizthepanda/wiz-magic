# CreatorFullScreenView - Visual Structure Guide

Visual reference for understanding the component's layout and structure.

---

## 🎨 Component Hierarchy

```
CreatorFullScreenView
│
├── AnimatePresence (Framer Motion)
│   └── Dialog.Root (Radix UI)
│       └── Dialog.Portal
│           │
│           ├── Dialog.Overlay (motion.div)
│           │   └── Dim + Blur Background
│           │       └── bg-black/50 + backdrop-blur-md
│           │
│           └── Dialog.Content (motion.div)
│               └── Scrollable Container
│                   └── Content Panel (max-w-6xl)
│                       │
│                       ├── Close Button (X)
│                       │
│                       ├── Banner Section
│                       │   ├── Banner Image (h-60)
│                       │   ├── Gradient Overlay
│                       │   └── Avatar (overlapping)
│                       │       └── Gradient Ring
│                       │
│                       └── Main Content (px-12 pt-20 pb-12)
│                           │
│                           ├── Header Row
│                           │   ├── Name + Tagline
│                           │   └── Action Buttons
│                           │       ├── ZAP Balance Pill
│                           │       ├── Preview Button
│                           │       └── Unlock Button
│                           │
│                           ├── Content Grid (2-col on desktop)
│                           │   ├── Left: Features List
│                           │   │   └── Feature Items
│                           │   │       ├── Icon
│                           │   │       ├── Title
│                           │   │       └── Description
│                           │   │
│                           │   └── Right: Media Preview
│                           │       └── Video or Placeholder
│                           │
│                           └── Footer
│                               └── Legal Microcopy
```

---

## 📐 Layout Dimensions

### Desktop (> 1024px)
```
┌─────────────────────────────────────────────────────────────┐
│                        Full Screen                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Content Panel                       │  │
│  │                   (max-w-6xl)                        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │           Banner (h-60, full width)             │ │  │
│  │  │                                                 │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │    ┌─┐ Avatar (w-28 h-28, overlapping)              │  │
│  │    └─┘                                               │  │
│  │                                                       │  │
│  │  Name + Tagline              [ZAP] [Preview] [Unlock]│  │
│  │                                                       │  │
│  │  ┌──────────────────┐  ┌──────────────────┐         │  │
│  │  │   Features       │  │   Media Preview  │         │  │
│  │  │   (Left Col)     │  │   (Right Col)    │         │  │
│  │  │                  │  │                  │         │  │
│  │  │  ✓ Feature 1     │  │  ┌────────────┐ │         │  │
│  │  │  ✓ Feature 2     │  │  │   Video    │ │         │  │
│  │  │  ✓ Feature 3     │  │  │     or     │ │         │  │
│  │  │  ✓ Feature 4     │  │  │ Placeholder│ │         │  │
│  │  │                  │  │  └────────────┘ │         │  │
│  │  └──────────────────┘  └──────────────────┘         │  │
│  │                                                       │  │
│  │  Footer: Legal text...                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (< 640px)
```
┌─────────────────────────┐
│     Full Screen         │
│  ┌───────────────────┐  │
│  │  Content Panel    │  │
│  │  ┌─────────────┐  │  │
│  │  │   Banner    │  │  │
│  │  │   (h-48)    │  │  │
│  │  └─────────────┘  │  │
│  │   ┌─┐ Avatar     │  │
│  │   └─┘ (w-20)     │  │
│  │                   │  │
│  │  Name             │  │
│  │  Tagline          │  │
│  │                   │  │
│  │  [ZAP Balance]    │  │
│  │  [Preview]        │  │
│  │  [Unlock]         │  │
│  │                   │  │
│  │  Features:        │  │
│  │  ✓ Feature 1      │  │
│  │  ✓ Feature 2      │  │
│  │  ✓ Feature 3      │  │
│  │                   │  │
│  │  ┌─────────────┐  │  │
│  │  │   Media     │  │  │
│  │  │  Preview    │  │  │
│  │  └─────────────┘  │  │
│  │                   │  │
│  │  Footer text...   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 🎨 Color Zones

```
┌─────────────────────────────────────────────┐
│  Overlay: bg-black/50 + backdrop-blur-md    │
│  ┌───────────────────────────────────────┐  │
│  │  Panel: bg-white/95 + backdrop-blur   │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Banner: Gradient or Image      │  │  │
│  │  │  from-[#8A63FF] to-[#FF86C1]    │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │   ┌─┐ Avatar Ring: Gradient          │  │
│  │   │ │ from-[#8A63FF] to-[#FF86C1]   │  │
│  │   └─┘                                │  │
│  │                                       │  │
│  │  Name: text-[#0f1724]                │  │
│  │  Tagline: text-[#6b7280]             │  │
│  │                                       │  │
│  │  ┌──────────────────────────────┐    │  │
│  │  │ ZAP Pill: bg-gradient        │    │  │
│  │  │ from-[#f6f4ff] to-[#fff7fb]  │    │  │
│  │  └──────────────────────────────┘    │  │
│  │                                       │  │
│  │  ┌──────────────────────────────┐    │  │
│  │  │ Unlock Button: bg-gradient   │    │  │
│  │  │ from-[#8A63FF] to-[#A259FF]  │    │  │
│  │  └──────────────────────────────┘    │  │
│  │                                       │  │
│  │  ┌─┐ Feature Icon: bg-gradient   │  │
│  │  │✓│ from-[#f6f4ff] to-[#fff7fb] │  │
│  │  └─┘                              │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🎭 Animation Timeline

### Opening Sequence (360ms total)

```
0ms                    280ms                  360ms
│                        │                      │
├─ Overlay ─────────────┤                      │
│  opacity: 0 → 1       │                      │
│                       │                      │
├─ Panel ───────────────────────────────────────┤
│  y: 18 → 0                                   │
│  opacity: 0 → 1                              │
│  scale: 0.995 → 1                            │
│                                              │
└──────────────────────────────────────────────┘
```

### Closing Sequence (360ms total)

```
0ms                    280ms                  360ms
│                        │                      │
├─ Overlay ─────────────┤                      │
│  opacity: 1 → 0       │                      │
│                       │                      │
├─ Panel ───────────────────────────────────────┤
│  y: 0 → 18                                   │
│  opacity: 1 → 0                              │
│  scale: 1 → 0.995                            │
│                                              │
└──────────────────────────────────────────────┘
```

### Avatar Pulse (3000ms loop)

```
0ms        1000ms      2000ms      3000ms
│            │            │            │
├─ Scale ────┼────────────┼────────────┤
│  1.0    → 1.02  →    1.0   →    1.0 │
│            │            │            │
└────────────┴────────────┴────────────┘
```

---

## 📏 Spacing System

### Padding
```
Component Level:
├─ Container: py-16 px-6 (desktop)
├─ Container: py-8 px-4 (mobile)
├─ Panel: px-12 pt-20 pb-12 (desktop)
└─ Panel: px-6 pt-16 pb-8 (mobile)

Element Level:
├─ Header gap: gap-6
├─ Content grid gap: gap-8 sm:gap-12
├─ Feature list gap: space-y-4 sm:space-y-5
└─ Action buttons gap: gap-3 sm:gap-4
```

### Margins
```
├─ Avatar overlap: -bottom-12 sm:-bottom-14
├─ Content top: mt-8 sm:mt-12
├─ Footer top: mt-8 sm:mt-12
└─ Tagline top: mt-2
```

---

## 🔤 Typography Scale

```
Name (Heading):
├─ Desktop: text-[clamp(28px,4vw,48px)]
├─ Mobile: text-[28px]
├─ Weight: font-semibold
└─ Color: text-[#0f1724]

Tagline:
├─ Size: text-sm sm:text-base
├─ Weight: font-normal
└─ Color: text-[#6b7280]

Feature Title:
├─ Size: text-sm sm:text-base
├─ Weight: font-medium
└─ Color: text-[#0f1724]

Feature Description:
├─ Size: text-xs sm:text-sm
├─ Weight: font-normal
└─ Color: text-[#6b7280]

Button Text:
├─ Size: text-sm sm:text-base
├─ Weight: font-semibold
└─ Color: text-white
```

---

## 🎯 Interactive Elements

### Close Button
```
Position: absolute right-4 sm:right-6 top-4 sm:top-6
Size: w-10 h-10
Shape: rounded-full
Background: bg-white/80 backdrop-blur-sm
Hover: hover:bg-white
Icon: X (20px)
Z-index: z-50
```

### Unlock Button
```
Padding: px-5 py-2.5
Shape: rounded-full
Background: bg-gradient-to-r from-[#8A63FF] via-[#A259FF] to-[#FF86C1]
Shadow: shadow-lg
Hover: hover:shadow-xl hover:scale-[1.02]
Text: font-semibold text-white
```

### Preview Button
```
Padding: px-4 py-2.5
Shape: rounded-full
Background: bg-white
Border: border border-gray-200
Hover: hover:bg-gray-50
Text: font-medium text-[#0f1724]
```

### ZAP Balance Pill
```
Padding: px-4 py-2
Shape: rounded-full
Background: bg-gradient-to-r from-[#f6f4ff] to-[#fff7fb]
Border: border border-[#A259FF]/20
Icon: Zap (14px, filled)
Text: text-xs (label) + text-sm font-semibold (value)
```

---

## 🖼️ Image Specifications

### Avatar
```
Desktop:
├─ Size: w-28 h-28 (112px)
├─ Shape: rounded-full
├─ Ring: p-[3px] gradient
└─ Shadow: shadow-[0_12px_40px_rgba(162,89,255,0.18)]

Mobile:
├─ Size: w-20 h-20 (80px)
├─ Shape: rounded-full
├─ Ring: p-[3px] gradient
└─ Shadow: shadow-[0_12px_40px_rgba(162,89,255,0.18)]
```

### Banner
```
Desktop:
├─ Height: h-60 (240px)
├─ Width: full width
├─ Fit: object-cover
└─ Overlay: bg-gradient-to-t from-black/30

Mobile:
├─ Height: h-48 (192px)
├─ Width: full width
├─ Fit: object-cover
└─ Overlay: bg-gradient-to-t from-black/30
```

### Preview Media
```
Desktop:
├─ Aspect: aspect-video (16:9)
├─ Shape: rounded-xl sm:rounded-2xl
└─ Background: bg-black (for video)

Mobile:
├─ Aspect: aspect-video (16:9)
├─ Shape: rounded-xl
└─ Background: bg-black (for video)
```

---

## 🎨 Shadow System

```
Panel Shadow:
└─ shadow-[0_24px_80px_rgba(10,11,15,0.36)]

Avatar Shadow:
└─ shadow-[0_12px_40px_rgba(162,89,255,0.18)]

Button Shadow:
├─ Default: shadow-lg
└─ Hover: shadow-xl

Card Shadow:
└─ shadow-lg
```

---

## 🔄 State Variations

### Default State
```
┌─────────────────────────────┐
│  Creator Name               │
│  Tagline text               │
│                             │
│  [ZAP: 2,500] [Preview]     │
│  [Unlock — 500 ZAPs]        │
└─────────────────────────────┘
```

### Hover State (Unlock Button)
```
┌─────────────────────────────┐
│  Creator Name               │
│  Tagline text               │
│                             │
│  [ZAP: 2,500] [Preview]     │
│  [Unlock — 500 ZAPs] ← 1.02x│
│         ↑ shadow-xl         │
└─────────────────────────────┘
```

### Insufficient ZAPs
```
┌─────────────────────────────┐
│  Creator Name               │
│  Tagline text               │
│                             │
│  [ZAP: 200] [Preview]       │
│  [Unlock — 500 ZAPs]        │
│  ↑ Shows error toast        │
└─────────────────────────────┘
```

### Success State
```
┌─────────────────────────────┐
│  🎉 Confetti Animation      │
│  ✓ Success Toast            │
│  → Closes after 1.5s        │
└─────────────────────────────┘
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 640px
├─ Single column layout
├─ Stacked buttons
├─ Smaller avatar (80px)
├─ Reduced padding (px-6)
└─ Smaller banner (h-48)

Tablet:     640px - 1024px
├─ Transitional layout
├─ Adjusted spacing
├─ Medium avatar (96px)
├─ Medium padding (px-8)
└─ Medium banner (h-52)

Desktop:    > 1024px
├─ Two-column grid
├─ Horizontal buttons
├─ Large avatar (112px)
├─ Full padding (px-12)
└─ Full banner (h-60)
```

---

## 🎯 Z-Index Layers

```
Layer 5 (z-[101]): Dialog Content Panel
Layer 4 (z-[100]): Dialog Overlay
Layer 3 (z-50):    Close Button
Layer 2 (z-10):    Avatar (overlapping banner)
Layer 1 (z-0):     Base content
```

---

## 🎨 Gradient Definitions

### Primary Gradient (Unlock Button)
```css
background: linear-gradient(
  to right,
  #8A63FF 0%,
  #A259FF 50%,
  #FF86C1 100%
);
```

### Avatar Ring Gradient
```css
background: linear-gradient(
  to right,
  #8A63FF 0%,
  #A259FF 50%,
  #FF86C1 100%
);
```

### ZAP Pill Gradient
```css
background: linear-gradient(
  to right,
  #f6f4ff 0%,
  #fff7fb 100%
);
```

### Feature Icon Gradient
```css
background: linear-gradient(
  to bottom right,
  #f6f4ff 0%,
  #fff7fb 100%
);
```

---

## 🔍 Focus States

### Keyboard Navigation Order
```
1. Close Button (X)
2. Preview Button
3. Unlock Button
4. (Scrollable content)
5. Feature items (non-interactive)
6. Media preview (if interactive)
```

### Focus Styles
```
All interactive elements:
├─ outline: 2px solid #A259FF
├─ outline-offset: 2px
└─ rounded to match element
```

---

## 📐 Accessibility Zones

```
┌─────────────────────────────────────┐
│  [X] Close (aria-label)             │ ← Keyboard accessible
│  ┌───────────────────────────────┐  │
│  │  Banner (decorative)          │  │ ← alt=""
│  └───────────────────────────────┘  │
│   [Avatar] (alt=name)               │ ← Descriptive alt
│                                     │
│  Name (h1, aria-labelledby)         │ ← Dialog title
│  Tagline (aria-describedby)         │ ← Dialog description
│                                     │
│  [ZAP Balance] (aria-label)         │ ← Screen reader text
│  [Preview] (aria-label)             │ ← Action description
│  [Unlock] (aria-label)              │ ← Full context
│                                     │
│  Features (list)                    │ ← Semantic HTML
│  Media (iframe with title)          │ ← Descriptive title
└─────────────────────────────────────┘
```

---

**This visual guide helps developers and designers understand the component structure at a glance.** ✨

