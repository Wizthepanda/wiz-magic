/**
 * Messages Dropdown - Matches Wallet/Profile Architecture
 * Uses Framer Motion + Portal + DropdownContext
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, CheckCircle2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropdown } from "@/contexts/DropdownContext";
import { useNavigate } from "react-router-dom";
import * as Portal from "@radix-ui/react-portal";
import {
  dropdownMotion,
  glassDropdownClasses,
  dropdownContentStyles,
  dropdownItemHoverClasses,
  formatTimeAgo
} from "@/lib/dropdown-animations";

interface Message {
  id: string;
  title: string; // Sender name
  description?: string; // Message preview
  timestamp?: Date;
  time?: string;
  unread?: boolean;
  avatar?: string;
  verified?: boolean;
}

interface MessagesDropdownProps {
  messages?: Message[];
  onMessageClick?: (message: Message) => void;
  onViewAll?: () => void;
  className?: string;
}

export const MessagesDropdown: React.FC<MessagesDropdownProps> = ({
  messages = [],
  onMessageClick,
  onViewAll,
  className,
}) => {
  const dropdownContext = useDropdown();
  const navigate = useNavigate();

  // Support both context-based and standalone state
  const [standaloneIsOpen, setStandaloneIsOpen] = useState(false);
  const isOpen = dropdownContext
    ? dropdownContext.activeDropdown === 'messages'
    : standaloneIsOpen;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  const unreadCount = messages.filter(m => m.unread).length;

  const handleToggle = () => {
    if (dropdownContext) {
      // Context-based mode
      dropdownContext.setActiveDropdown(isOpen ? null : 'messages');
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
        aria-label="Messages"
        className={cn(
          "relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center group",
          "hover:bg-white/10 dark:hover:bg-white/5",
          "backdrop-blur-sm",
          isOpen && "bg-white/10"
        )}
      >
        <MessageSquare
          size={20}
          strokeWidth={2}
          className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
        />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white ring-2 ring-white dark:ring-[#0f172a] shadow-lg shadow-green-500/50 animate-pulse"
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
                    <MessageSquare className="w-4 h-4 text-white/70" strokeWidth={2} />
                    <h4 className={dropdownContentStyles.headerTitle}>Messages</h4>
                  </div>
                  {messages.length > 0 && onViewAll && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onViewAll();
                        handleClose();
                      }}
                      className={dropdownContentStyles.headerAction}
                    >
                      View all
                    </button>
                  )}
                </div>

                {/* Messages List */}
                <div className="divide-y divide-white/10">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          onMessageClick?.(message);
                          handleClose();
                        }}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3",
                          dropdownItemHoverClasses,
                          message.unread && "bg-green-500/5"
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={message.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.title}`}
                            alt={message.title}
                            className={cn(
                              "w-10 h-10 rounded-full object-cover",
                              message.unread && "ring-2 ring-green-500/70"
                            )}
                          />
                          {message.unread && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-[rgba(30,32,46,0.9)]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className={cn(
                              "text-sm truncate",
                              message.unread ? "font-semibold text-white" : "font-medium text-white/80"
                            )}>
                              {message.title}
                            </p>
                            {message.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                          {message.description && (
                            <p className={cn(
                              "text-xs line-clamp-2 leading-relaxed",
                              message.unread ? "text-zinc-300" : "text-zinc-400"
                            )}>
                              {message.description}
                            </p>
                          )}
                          {/* Timestamp */}
                          {(message.time || message.timestamp) && (
                            <p className="text-[10px] text-zinc-500 mt-1">
                              {message.timestamp ? formatTimeAgo(message.timestamp) : message.time}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    // Empty State
                    <div className="text-center py-12 px-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/10 mx-auto">
                        <MessageSquare className="w-6 h-6 text-white/30" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm text-white/60 font-medium mb-1">
                        No messages yet
                      </p>
                      <p className="text-xs text-white/40">
                        Start a conversation with your friends ✨
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer - View All Button */}
                {messages.length > 0 && (
                  <div className="px-4 py-3 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleClose();
                        navigate("/messages");
                        onViewAll?.();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      <Send className="w-4 h-4" strokeWidth={2} />
                      View All Messages
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
