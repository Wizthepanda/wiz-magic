# Dropdown System Debug Guide

## ✅ Verified Working Components

All four top-bar dropdowns are properly implemented:

1. **NotificationsDropdown** (`/src/components/ui/NotificationsDropdown.tsx`)
2. **MessagesDropdown** (`/src/components/ui/MessagesDropdown.tsx`)
3. **ZapWalletIcon** (`/src/components/wiz/community/ZapWalletIcon.tsx`)
4. **XPProfileDropdown** (`/src/components/ui/xp-profile-dropdown.tsx`)

## 🔧 Implementation Details

### DropdownContext (`/src/contexts/DropdownContext.tsx`)
```typescript
type DropdownType = 'wallet' | 'profile' | 'notifications' | 'messages' | null;
```
✅ Properly manages which dropdown is active
✅ Ensures only one dropdown open at a time
✅ Wrapped around App in `/src/App.tsx` (line 146)

### Usage in ApplePremiumDashboard
Located at `/src/components/wiz/ApplePremiumDashboard.tsx` lines 719-789

All dropdowns:
- ✅ Use `useDropdown()` context hook
- ✅ Have `onClick` handlers with `preventDefault()` and `stopPropagation()`
- ✅ Render in `Portal.Root` (positioned absolutely)
- ✅ Use Framer Motion animations
- ✅ Handle outside clicks
- ✅ Handle ESC key to close

## 🐛 If Dropdowns Still Don't Open

### Test 1: Check Console
Open browser DevTools and check for:
- Any JavaScript errors preventing clicks
- React warnings about state updates
- Portal rendering issues

### Test 2: Verify DropdownContext
Add to `/src/contexts/DropdownContext.tsx` line 16:
```typescript
const setActiveDropdown = (dropdown: DropdownType) => {
  console.log('🔔 Setting active dropdown:', dropdown);
  _setActiveDropdown(dropdown);
};
```

### Test 3: Check z-index Conflicts
Ensure no overlays are blocking clicks. The dropdowns use `z-index: 9999`.

### Test 4: Verify Click Events
In each dropdown component's `handleToggle`, the click event should:
1. Call `e.preventDefault()`
2. Call `e.stopPropagation()`
3. Toggle the dropdown state

## 🎯 Expected Behavior

1. Click Notifications bell → Opens notifications dropdown, closes others
2. Click Messages bubble → Opens messages dropdown, closes others
3. Click Wallet icon → Opens wallet dropdown, closes others
4. Click Profile XP Ring → Opens profile dropdown, closes others
5. Click outside any dropdown → Closes all dropdowns
6. Press ESC → Closes active dropdown

## 📍 Where Dropdowns Are Used

- **Main Page**: `/discover` (DiscoverPage.tsx)
- **Dashboard Component**: ApplePremiumDashboard.tsx
- **Layout**: Wrapped by MainLayout.tsx with persistent sidebar

All components are connected correctly via the DropdownContext.
