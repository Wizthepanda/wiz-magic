/**
 * Messages Dropdown - Using HeaderDropdown with Floating UI
 * Enhanced UX with better visual hierarchy and interactions
 */

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle2, Send, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeaderDropdown } from "@/components/ui/HeaderDropdown";
import { useNavigate } from "react-router-dom";
import { dropdownItemHoverClasses, formatTimeAgo } from "@/lib/dropdown-animations";

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
  const navigate = useNavigate();
  const unreadCount = messages.filter(m => m.unread).length;
  const recentMessages = messages.slice(0, 5);

  // Trigger button
  const triggerButton = (
    <button
      type="button"
      aria-label="Messages"
      className={cn(
        "relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center group",
        "hover:bg-white/10 dark:hover:bg-white/5",
        "backdrop-blur-sm"
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
  );

  // Dropdown content
  const dropdownContent = (
    <div className="w-[400px] max-w-[calc(100vw-2rem)]">
      <div
        style={{
          background: "linear-gradient(180deg, rgba(30, 32, 46, 0.98) 0%, rgba(20, 22, 36, 0.98) 100%)",
          backdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.2)",
        }}
      >
        {/* Premium Header */}
        <div className="relative p-5 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-blue-500/20 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Messages</h4>
                {unreadCount > 0 && (
                  <p className="text-green-400 text-xs font-semibold mt-0.5">
                    {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                  </p>
                )}
              </div>
            </div>
            {messages.length > 0 && onViewAll && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("/messages");
                  onViewAll?.();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                View all
              </button>
            )}
          </div>
        </div>

        {/* Messages List */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
          {recentMessages.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recentMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => onMessageClick?.(message)}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 cursor-pointer group relative",
                    dropdownItemHoverClasses,
                    message.unread && "bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-transparent"
                  )}
                >
                  {/* Avatar with Status */}
                  <div className="relative flex-shrink-0">
                    <motion.img
                      src={message.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.title}`}
                      alt={message.title}
                      className={cn(
                        "w-12 h-12 rounded-full object-cover ring-2 transition-all",
                        message.unread
                          ? "ring-green-500/50 shadow-lg shadow-green-500/20"
                          : "ring-white/10"
                      )}
                      whileHover={{ scale: 1.05 }}
                    />
                    {message.unread && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full ring-2 ring-[rgba(30,32,46,0.9)] shadow-lg"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        message.unread ? "text-white" : "text-white/80"
                      )}>
                        {message.title}
                      </p>
                      {message.verified && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" fill="#60A5FA" />
                      )}
                      {message.unread && (
                        <Sparkles className="w-3 h-3 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    {message.description && (
                      <p className={cn(
                        "text-xs line-clamp-2 leading-relaxed mb-1.5",
                        message.unread ? "text-white/90" : "text-white/60"
                      )}>
                        {message.description}
                      </p>
                    )}
                    {(message.time || message.timestamp) && (
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-white/40">
                          {message.timestamp ? formatTimeAgo(message.timestamp) : message.time}
                        </p>
                        {message.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
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
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 border border-green-500/20 mx-auto"
              >
                <MessageSquare className="w-8 h-8 text-green-400/60" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-white font-semibold text-base mb-2">No messages yet</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Start a conversation with your friends and creators ✨
              </p>
              <motion.button
                onClick={() => navigate("/messages")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
                <span>Start Messaging</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Footer - View All Button */}
        {recentMessages.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 bg-gradient-to-r from-green-500/5 to-transparent">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate("/messages");
                onViewAll?.();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="w-4 h-4" strokeWidth={2.5} />
              <span>View All Messages</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <HeaderDropdown
      name="messages"
      trigger={triggerButton}
      className={className}
      pointerClassName="bg-gradient-to-br from-green-500 to-emerald-500"
    >
      {dropdownContent}
    </HeaderDropdown>
  );
};
