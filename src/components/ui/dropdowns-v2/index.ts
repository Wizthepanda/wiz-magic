/**
 * Dropdown System V2 - Unified Exports
 *
 * Features:
 * - Single active dropdown at a time (no overlaps)
 * - Consistent glassmorphic design
 * - Smooth animations and micro-interactions
 * - Shared DropdownContext for state management
 */

export { DropdownProvider, useDropdown } from '@/contexts/DropdownContext';
export { MessagesDropdown } from '../messages-dropdown';
export { NotificationsDropdownV2 as NotificationsDropdown } from '../notifications-dropdown-v2';
export { ZapWalletIcon as WalletDropdown } from '@/components/wiz/community/ZapWalletIcon';
export { XPProfileDropdown as ProfileDropdown } from '../xp-profile-dropdown';

// Animation utilities
export {
  dropdownMotion,
  dropdownItemMotion,
  dropdownHoverMotion,
  glassDropdownClasses,
  dropdownContentStyles,
  formatTimeAgo
} from '@/lib/dropdown-animations';
