/**
 * Shared Dropdown Animation Presets & Utilities
 * Consistent animations across Wallet, Profile, Messages, and Notifications dropdowns
 */

export const dropdownMotion = {
  initial: { opacity: 0, scale: 0.97, y: -8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -8 },
  transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const dropdownItemMotion = {
  initial: { opacity: 0, x: -4 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -4 },
  transition: { duration: 0.12 },
};

export const dropdownHoverMotion = {
  whileHover: { scale: 1.02, transition: { duration: 0.1 } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

/**
 * Glassmorphic Dropdown Base Styles
 * Matching the Wallet UI aesthetic
 */
export const glassDropdownClasses = {
  container: "rounded-2xl p-0 border-0 overflow-hidden z-[9999]",
  style: {
    background: "rgba(30, 32, 46, 0.9)",
    backdropFilter: "blur(10px) saturate(150%)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  },
};

/**
 * Dropdown Content Styles
 */
export const dropdownContentStyles = {
  header: "flex items-center justify-between px-4 py-3 border-b border-white/10",
  headerTitle: "text-white/90 font-semibold text-sm",
  headerAction: "text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer",
  divider: "border-t border-white/10",
  scrollArea: "max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
};

/**
 * Item Hover States
 */
export const dropdownItemHoverClasses = "hover:bg-white/5 transition-all duration-150 cursor-pointer";

/**
 * Notification/Activity Badge Styles
 */
export const notificationBadgeClasses = {
  unread: "absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-[#1E202E] shadow-lg shadow-indigo-500/50",
  pulse: "animate-pulse",
  glow: "shadow-[0_0_6px_rgba(139,92,246,0.6)]",
};

/**
 * Message/Notification Icon Container
 */
export const iconContainerClasses = "w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20";

/**
 * Avatar Styles
 */
export const avatarClasses = {
  base: "rounded-full object-cover",
  unreadBorder: "border-2 border-indigo-500/70 animate-pulse",
  sizes: {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  },
};

/**
 * Timestamp Styles
 */
export const timestampClasses = "text-[10px] text-zinc-500";

/**
 * Format time ago helper
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
  return `${Math.floor(diffInMinutes / 10080)}w`;
};
