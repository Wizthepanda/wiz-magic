import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Gem, Trophy, Star, Gift, ExternalLink, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedIconTrigger } from './enhanced-icon-trigger';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from './dropdown-menu';

interface Notification {
  id: string;
  type: 'xp' | 'achievement' | 'reward' | 'system';
  title: string;
  subtitle: string;
  xpAmount?: number;
  timestamp: Date;
  isRead: boolean;
  avatar?: string;
  icon?: React.ReactNode;
}

interface NotificationsDropdownProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Mock notifications if none provided
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'xp',
      title: 'XP Earned',
      subtitle: 'Completed "React Fundamentals" lesson',
      xpAmount: 50,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      avatar: '/api/placeholder/32/32'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Level Up!',
      subtitle: 'You reached Level 7 🎉',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      icon: <Trophy className="w-4 h-4 text-yellow-600" />
    },
    {
      id: '3',
      type: 'reward',
      title: 'Daily Bonus',
      subtitle: 'Your 7-day streak bonus is ready!',
      xpAmount: 120,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isRead: true,
      icon: <Gift className="w-4 h-4 text-purple-600" />
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;
  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;

    switch (notification.type) {
      case 'xp':
        return <Gem className="w-4 h-4 text-blue-600" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-600" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative hover:opacity-80 transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bell size={22} className="text-[#444]" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        variant="premium"
        className="w-80 max-w-[90vw]"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-1">
          {/* Header */}
          <div className="flex items-center justify-between px-1 py-2 border-b border-gray-200/50">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto space-y-1">
            <AnimatePresence>
              {displayNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative group cursor-pointer rounded-lg p-3 transition-all duration-200",
                    !notification.isRead && "bg-blue-50/50",
                    hoveredItem === notification.id && "bg-gradient-to-r from-blue-50/70 to-purple-50/70 shadow-md"
                  )}
                  onMouseEnter={() => setHoveredItem(notification.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => onMarkAsRead?.(notification.id)}
                >
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                  )}

                  <div className="flex items-start gap-3 ml-2">
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {notification.avatar ? (
                        <img
                          src={notification.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        getNotificationIcon(notification)
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {notification.subtitle}
                          </p>
                        </div>

                        {/* XP Badge */}
                        {notification.xpAmount && (
                          <motion.div
                            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full shrink-0"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Gem className="w-3 h-3" />
                            +{notification.xpAmount}
                          </motion.div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>

                    {/* Hover actions */}
                    <AnimatePresence>
                      {hoveredItem === notification.id && !notification.isRead && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead?.(notification.id);
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div className="border-t border-gray-200/50 pt-2">
              <button
                onClick={onViewAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg transition-all duration-200 hover:shadow-lg group"
              >
                View All Notifications
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Empty state */}
          {displayNotifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No notifications yet</p>
              <p className="text-xs text-gray-500 mt-1">We'll let you know when something happens!</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};