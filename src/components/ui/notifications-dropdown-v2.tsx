import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, MessageCircle, UserPlus, Heart, Trophy, Gift, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDropdown } from '@/contexts/DropdownContext';
import {
  dropdownMotion,
  glassDropdownClasses,
  dropdownContentStyles,
  dropdownItemHoverClasses,
  iconContainerClasses,
  timestampClasses,
  formatTimeAgo
} from '@/lib/dropdown-animations';

type NotificationType = 'zap' | 'comment' | 'follow' | 'like' | 'achievement' | 'reward';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  unread: boolean;
  actorName?: string;
  actorAvatar?: string;
  metadata?: {
    zapAmount?: number;
    achievementName?: string;
    rewardType?: string;
  };
}

interface NotificationsDropdownV2Props {
  notifications?: Notification[];
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notificationId: string) => void;
  onViewAll?: () => void;
  className?: string;
}

export const NotificationsDropdownV2: React.FC<NotificationsDropdownV2Props> = ({
  notifications = [],
  onMarkAllAsRead,
  onNotificationClick,
  onViewAll,
  className,
}) => {
  const { activeDropdown, setActiveDropdown } = useDropdown();
  const isOpen = activeDropdown === 'notifications';
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Mock notifications if none provided
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'zap',
      message: 'You earned 50 ZAPs for completing "Advanced React Patterns"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      unread: true,
      metadata: { zapAmount: 50 },
    },
    {
      id: '2',
      type: 'follow',
      message: 'Sarah Chen started following you',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      unread: true,
      actorName: 'Sarah Chen',
      actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      id: '3',
      type: 'comment',
      message: 'Alex Rivera commented on your video',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: false,
      actorName: 'Alex Rivera',
      actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    {
      id: '4',
      type: 'achievement',
      message: 'Achievement unlocked: 7-day streak! 🔥',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      unread: false,
      metadata: { achievementName: '7-Day Streak' },
    },
    {
      id: '5',
      type: 'like',
      message: 'Jordan Kim liked your comment',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: false,
      actorName: 'Jordan Kim',
      actorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    },
  ];

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;
  const unreadCount = displayNotifications.filter(n => n.unread).length;

  const handleToggle = () => {
    setActiveDropdown(isOpen ? null : 'notifications');
  };

  const handleNotificationClick = (notificationId: string) => {
    onNotificationClick?.(notificationId);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'zap':
        return <Zap className="w-4 h-4 text-amber-400" strokeWidth={2} fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-400" strokeWidth={2} />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-400" strokeWidth={2} />;
      case 'like':
        return <Heart className="w-4 h-4 text-pink-400" strokeWidth={2} fill="currentColor" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-400" strokeWidth={2} />;
      case 'reward':
        return <Gift className="w-4 h-4 text-purple-400" strokeWidth={2} />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" strokeWidth={2} />;
    }
  };

  const getIconBgColor = (type: NotificationType) => {
    switch (type) {
      case 'zap':
        return 'bg-amber-500/20';
      case 'comment':
        return 'bg-blue-500/20';
      case 'follow':
        return 'bg-green-500/20';
      case 'like':
        return 'bg-pink-500/20';
      case 'achievement':
        return 'bg-yellow-500/20';
      case 'reward':
        return 'bg-purple-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center group"
      >
        <Bell
          size={20}
          strokeWidth={2}
          className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
        />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#1E202E] shadow-lg shadow-indigo-500/50 animate-pulse"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...dropdownMotion}
            className={cn(
              "absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)]",
              glassDropdownClasses.container
            )}
            style={glassDropdownClasses.style}
          >
            {/* Header */}
            <div className={dropdownContentStyles.header}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white/70" strokeWidth={2} />
                <h4 className={dropdownContentStyles.headerTitle}>Notifications</h4>
              </div>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  onClick={onMarkAllAsRead}
                  className={dropdownContentStyles.headerAction}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-white/10 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {displayNotifications.length > 0 ? (
                displayNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification.id)}
                    onMouseEnter={() => setHoveredId(notification.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 relative",
                      dropdownItemHoverClasses,
                      notification.unread && "bg-indigo-500/5"
                    )}
                  >
                    {/* Unread Indicator */}
                    {notification.unread && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
                    )}

                    {/* Icon or Avatar */}
                    <div className={cn(
                      "p-2 rounded-xl flex items-center justify-center flex-shrink-0",
                      iconContainerClasses,
                      getIconBgColor(notification.type)
                    )}>
                      {notification.actorAvatar ? (
                        <img
                          src={notification.actorAvatar}
                          alt={notification.actorName || ''}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm leading-snug mb-1",
                        notification.unread ? "text-white/90" : "text-white/70"
                      )}>
                        {notification.message}
                      </p>
                      <span className={timestampClasses}>
                        {formatTimeAgo(notification.timestamp)}
                      </span>

                      {/* ZAP Badge */}
                      {notification.metadata?.zapAmount && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 mt-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full"
                        >
                          <Zap className="w-3 h-3 fill-white" strokeWidth={0} />
                          +{notification.metadata.zapAmount}
                        </motion.div>
                      )}
                    </div>

                    {/* Mark as Read (on hover) */}
                    {notification.unread && hoveredId === notification.id && (
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle mark as read
                        }}
                        className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-white/60 mb-1">No notifications yet</p>
                  <p className="text-xs text-white/40">We'll let you know when something happens!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {displayNotifications.length > 0 && onViewAll && (
              <div className="px-4 py-3 border-t border-white/10">
                <button
                  onClick={onViewAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
                    boxShadow: "0 4px 12px rgba(127, 90, 240, 0.3)",
                  }}
                >
                  <Bell className="w-4 h-4" strokeWidth={2} />
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
