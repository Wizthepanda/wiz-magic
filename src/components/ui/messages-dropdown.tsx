import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDropdown } from '@/contexts/DropdownContext';
import * as Portal from '@radix-ui/react-portal';
import {
  dropdownMotion,
  glassDropdownClasses,
  dropdownContentStyles,
  dropdownItemHoverClasses,
  avatarClasses,
  timestampClasses,
  formatTimeAgo
} from '@/lib/dropdown-animations';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  preview: string;
  timestamp: Date;
  unread: boolean;
  verified?: boolean;
}

interface MessagesDropdownProps {
  messages?: Message[];
  onViewAll?: () => void;
  onMessageClick?: (messageId: string) => void;
  className?: string;
}

export const MessagesDropdown: React.FC<MessagesDropdownProps> = ({
  messages = [],
  onViewAll,
  onMessageClick,
  className,
}) => {
  const { activeDropdown, setActiveDropdown } = useDropdown();
  const isOpen = activeDropdown === 'messages';
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Mock messages if none provided
  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: 'user1',
      senderName: 'Sarah Chen',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      preview: 'Hey! Just finished watching that React tutorial you recommended...',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      unread: true,
      verified: true,
    },
    {
      id: '2',
      senderId: 'user2',
      senderName: 'Alex Rivera',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      preview: 'Thanks for the ZAPs! Really appreciate it 🙏',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: true,
    },
    {
      id: '3',
      senderId: 'user3',
      senderName: 'Jordan Kim',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
      preview: 'Did you see the new features in the latest update?',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      unread: false,
    },
    {
      id: '4',
      senderId: 'user4',
      senderName: 'Taylor Morgan',
      senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
      preview: 'Let\'s collaborate on that new project idea!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: false,
    },
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;
  const unreadCount = displayMessages.filter(m => m.unread).length;

  const handleToggle = () => {
    setActiveDropdown(isOpen ? null : 'messages');
  };

  const handleMessageClick = (messageId: string) => {
    onMessageClick?.(messageId);
  };

  // Calculate dropdown position based on trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setActiveDropdown(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setActiveDropdown]);

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        aria-label="Messages"
        className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center group"
      >
        <MessageCircle
          size={20}
          strokeWidth={2}
          className="text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
        />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#1E202E] shadow-lg shadow-indigo-500/50"
          >
            {unreadCount}
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
                <MessageCircle className="w-4 h-4 text-white/70" strokeWidth={2} />
                <h4 className={dropdownContentStyles.headerTitle}>Messages</h4>
              </div>
              {onViewAll && (
                <button
                  onClick={onViewAll}
                  className={dropdownContentStyles.headerAction}
                >
                  View All
                </button>
              )}
            </div>

            {/* Messages List */}
            <div className="divide-y divide-white/10">
              {displayMessages.length > 0 ? (
                displayMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMessageClick(message.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      dropdownItemHoverClasses,
                      message.unread && "bg-indigo-500/5"
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className={cn(
                          avatarClasses.base,
                          avatarClasses.sizes.md,
                          message.unread && avatarClasses.unreadBorder
                        )}
                      />
                      {message.unread && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full ring-2 ring-[#1E202E]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={cn(
                          "text-sm truncate",
                          message.unread ? "font-semibold text-white" : "font-medium text-white/80"
                        )}>
                          {message.senderName}
                        </p>
                        {message.verified && (
                          <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate",
                        message.unread ? "text-zinc-300" : "text-zinc-400"
                      )}>
                        {message.preview}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className={timestampClasses}>
                      {formatTimeAgo(message.timestamp)}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-white/60 mb-1">No messages yet</p>
                  <p className="text-xs text-white/40">Start a conversation with your friends!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {displayMessages.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10">
                <button
                  onClick={onViewAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
                    boxShadow: "0 4px 12px rgba(127, 90, 240, 0.3)",
                  }}
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
                  Open Messages
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
