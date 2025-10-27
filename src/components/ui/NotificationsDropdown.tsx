/**
 * Notifications Dropdown - Matches Wallet/Profile Architecture
 * Uses Framer Motion + Portal + DropdownContext
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropdown } from "@/contexts/DropdownContext";
import * as Portal from "@radix-ui/react-portal";
import {
  dropdownMotion,
  glassDropdownClasses,
  dropdownContentStyles,
  dropdownItemHoverClasses,
  formatTimeAgo
} from "@/lib/dropdown-animations";

interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp?: Date;
  time?: string;
  unread?: boolean;
}

interface NotificationsDropdownProps {
  notifications?: Notification[];
  onItemClick?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
  className?: string;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications = [],
  onItemClick,
  onMarkAllAsRead,
  onViewAll,
  className,
}) => {
  const dropdownContext = useDropdown();

  // Support both context-based and standalone state
  const [standaloneIsOpen, setStandaloneIsOpen] = useState(false);
  const isOpen = dropdownContext
    ? dropdownContext.activeDropdown === 'notifications'
    : standaloneIsOpen;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleToggle = () => {
    if (dropdownContext) {
      // Context-based mode
      dropdownContext.setActiveDropdown(isOpen ? null : 'notifications');
    } else {
      // Standalone mode
      setStandaloneIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    if (dropdownContext) {
      dropdownContext.setActiveDropdown(null);
    } else {
      setStandaloneIsOpen(false);
    }
  };

  // Calculate dropdown position based on trigger
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Handle clicks outside dropdown and Esc key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        aria-label="Notifications"
        className={cn(
          "relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center group",
          "hover:bg-white/10 dark:hover:bg-white/5",
          "backdrop-blur-sm",
          isOpen && "bg-white/10"
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

      {/* Dropdown - Portal Rendered */}
      <Portal.Root>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Pointer Triangle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed w-3 h-3 bg-[#1E202E]/90 rotate-45 border-t border-l border-white/15"
                style={{
                  top: position.top - 6,
                  right: position.right + 12,
                  zIndex: 9998,
                }}
              />

              {/* Dropdown Content */}
              <motion.div
                ref={dropdownRef}
                {...dropdownMotion}
                className={cn(
                  "fixed w-80 max-w-[calc(100vw-2rem)]",
                  glassDropdownClasses.container
                )}
                style={{
                  ...glassDropdownClasses.style,
                  top: position.top,
                  right: position.right,
                  zIndex: 9999,
                }}
              >
                {/* Header */}
                <div className={dropdownContentStyles.header}>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-white/70" strokeWidth={2} />
                    <h4 className={dropdownContentStyles.headerTitle}>Notifications</h4>
                  </div>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkAllAsRead?.();
                      }}
                      className={dropdownContentStyles.headerAction}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-white/10">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          onItemClick?.(notification.id);
                          handleClose();
                        }}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3",
                          dropdownItemHoverClasses,
                          notification.unread && "bg-indigo-500/5"
                        )}
                      >
                        {/* Icon */}
                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0 mt-0.5">
                          <Bell className="w-4 h-4 text-white/60" strokeWidth={2} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm",
                            notification.unread ? "font-semibold text-white" : "font-medium text-white/80"
                          )}>
                            {notification.title}
                          </p>
                          {notification.description && (
                            <p className={cn(
                              "text-xs line-clamp-2 leading-relaxed mt-0.5",
                              notification.unread ? "text-zinc-300" : "text-zinc-400"
                            )}>
                              {notification.description}
                            </p>
                          )}
                          {/* Timestamp */}
                          {(notification.time || notification.timestamp) && (
                            <p className="text-[10px] text-zinc-500 mt-1">
                              {notification.timestamp ? formatTimeAgo(notification.timestamp) : notification.time}
                            </p>
                          )}
                        </div>

                        {/* Unread indicator */}
                        {notification.unread && (
                          <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mt-2 ring-2 ring-indigo-500/20" />
                        )}
                      </motion.div>
                    ))
                  ) : (
                    // Empty State
                    <div className="text-center py-12 px-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/10 mx-auto">
                        <Bell className="w-6 h-6 text-white/30" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm text-white/60 font-medium mb-1">
                        No notifications yet
                      </p>
                      <p className="text-xs text-white/40">
                        We'll notify you when something happens! 👀
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer - View All Button */}
                {notifications.length > 0 && onViewAll && (
                  <div className="px-4 py-3 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onViewAll();
                        handleClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
                        boxShadow: "0 4px 12px rgba(127, 90, 240, 0.3)",
                      }}
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={2} />
                      View All Notifications
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal.Root>
    </div>
  );
};
