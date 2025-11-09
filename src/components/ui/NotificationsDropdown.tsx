/**
 * Notifications Dropdown - Using HeaderDropdown with Floating UI
 * Enhanced UX with better visual hierarchy and interactions
 */

import React from "react";
import { motion } from "framer-motion";
import { Bell, Sparkles, ArrowRight, Zap, Users, Trophy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderDropdown } from "@/components/ui/HeaderDropdown";
import { dropdownItemHoverClasses, formatTimeAgo } from "@/lib/dropdown-animations";

interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp?: Date;
  time?: string;
  unread?: boolean;
  type?: 'achievement' | 'message' | 'reward' | 'system';
}

interface NotificationsDropdownProps {
  notifications?: Notification[];
  onItemClick?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
  className?: string;
}

const getNotificationIcon = (type?: string) => {
  switch (type) {
    case 'achievement':
      return <Trophy className="w-4 h-4 text-yellow-400" />;
    case 'reward':
      return <Zap className="w-4 h-4 text-[#FFD84D]" fill="#FFD84D" />;
    case 'message':
      return <Users className="w-4 h-4 text-blue-400" />;
    default:
      return <Bell className="w-4 h-4 text-indigo-400" />;
  }
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications = [],
  onItemClick,
  onMarkAllAsRead,
  onViewAll,
  className,
}) => {
  const unreadCount = notifications.filter(n => n.unread).length;
  const recentNotifications = notifications.slice(0, 6);

  // Trigger button
  const triggerButton = (
    <button
      type="button"
      aria-label="Notifications"
      className={cn(
        "relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center group",
        "hover:bg-white/10 dark:hover:bg-white/5",
        "backdrop-blur-sm"
      )}
    >
      <Bell
        size={20}
        strokeWidth={2}
        className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
      />
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-2 ring-white dark:ring-[#0f172a] shadow-lg shadow-indigo-500/50 animate-pulse"
          style={{ animationDuration: '2s' }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </button>
  );

  // Dropdown content
  const dropdownContent = (
    <div className="w-[400px] max-w-[calc(100vw-2rem)]">
      <div
        style={{
          background: "linear-gradient(180deg, rgba(30, 32, 46, 0.98) 0%, rgba(20, 22, 36, 0.98) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)",
        }}
      >
        {/* Premium Header */}
        <div className="relative p-5 bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-pink-500/20 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Bell className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Notifications</h4>
                {unreadCount > 0 && (
                  <p className="text-indigo-400 text-xs font-semibold mt-0.5">
                    {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                  </p>
                )}
              </div>
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkAllAsRead?.();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
          {recentNotifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recentNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => onItemClick?.(notification.id)}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 cursor-pointer group relative",
                    dropdownItemHoverClasses,
                    notification.unread && "bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent"
                  )}
                >
                  {/* Icon Container */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                    notification.unread
                      ? "bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                      : "bg-white/10 border border-white/10"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn(
                        "text-sm font-semibold leading-snug",
                        notification.unread ? "text-white" : "text-white/80"
                      )}>
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    {notification.description && (
                      <p className={cn(
                        "text-xs line-clamp-2 leading-relaxed mb-1.5",
                        notification.unread ? "text-white/90" : "text-white/60"
                      )}>
                        {notification.description}
                      </p>
                    )}
                    {(notification.time || notification.timestamp) && (
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-white/40">
                          {notification.timestamp ? formatTimeAgo(notification.timestamp) : notification.time}
                        </p>
                        {notification.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -5 }}
                    whileHover={{ x: 0 }}
                  >
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-indigo-500/20 mx-auto"
              >
                <Bell className="w-8 h-8 text-indigo-400/60" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-white font-semibold text-base mb-2">All caught up!</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                You're all set. We'll notify you when something happens! 👀
              </p>
            </div>
          )}
        </div>

        {/* Footer - View All Button */}
        {recentNotifications.length > 0 && onViewAll && (
          <div className="px-5 py-4 border-t border-white/10 bg-gradient-to-r from-indigo-500/5 to-transparent">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewAll();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
              <span>View All Notifications</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <HeaderDropdown
      name="notifications"
      trigger={triggerButton}
      className={className}
      pointerClassName="bg-gradient-to-br from-indigo-500 to-purple-500"
    >
      {dropdownContent}
    </HeaderDropdown>
  );
};
