import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, MessageSquare, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/dropdown-animations";

interface TopNavDropdownProps {
  type: "notifications" | "messages";
  items: {
    id: string;
    title: string;
    description?: string;
    time?: string;
    timestamp?: Date; // Alternative to time string
    unread?: boolean;
    avatar?: string; // For messages
    verified?: boolean; // For verified users in messages
  }[];
  onItemClick?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onViewAll?: () => void;
  className?: string;
}

export function TopNavDropdown({
  type,
  items,
  onItemClick,
  onMarkAllAsRead,
  onViewAll,
  className
}: TopNavDropdownProps) {
  const Icon = type === "notifications" ? Bell : MessageSquare;
  const unreadCount = items.filter(i => i.unread).length;

  // Empty state content
  const emptyState = type === "notifications"
    ? {
        icon: Bell,
        title: "No notifications yet",
        subtitle: "We'll notify you when something happens! 👀"
      }
    : {
        icon: MessageSquare,
        title: "No messages yet",
        subtitle: "Start a conversation with your friends ✨"
      };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "relative rounded-full p-2 transition-all duration-200",
            "w-10 h-10 flex items-center justify-center group",
            "hover:bg-white/10 dark:hover:bg-white/5",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50",
            "backdrop-blur-sm",
            className
          )}
          aria-label={type === "notifications" ? "Notifications" : "Messages"}
        >
          <Icon
            size={20}
            strokeWidth={2}
            className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors"
          />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-2 ring-white dark:ring-[#0f172a] shadow-lg shadow-indigo-500/50 animate-pulse"
              style={{ animationDuration: '2s' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          side="bottom"
          sideOffset={12}
          collisionPadding={10}
          className={cn(
            "z-[9999] w-80 rounded-2xl overflow-hidden",
            // Glassmorphic styling matching wallet/profile
            "backdrop-blur-xl saturate-150",
            "border border-white/15",
            // Dark theme support
            "bg-[rgba(30,32,46,0.9)] dark:bg-[rgba(30,32,46,0.95)]",
            // Shadows
            "shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]",
            // Animation classes with Radix states
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
          )}
          style={{
            animationDuration: '150ms',
            animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-white/70" strokeWidth={2} />
              <h4 className="text-white/90 font-semibold text-sm">
                {type === "notifications" ? "Notifications" : "Messages"}
              </h4>
            </div>
            {items.length > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  type === "notifications" ? onMarkAllAsRead?.() : onViewAll?.();
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer font-medium"
              >
                {type === "notifications" ? "Mark all read" : "View all"}
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
            {items.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center text-center px-6 py-12">
                <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center mb-3 border border-white/10">
                  <emptyState.icon className="w-6 h-6 text-white/30" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-white/60 font-medium mb-1">
                  {emptyState.title}
                </p>
                <p className="text-xs text-white/40">
                  {emptyState.subtitle}
                </p>
              </div>
            ) : (
              // Items
              <div className="divide-y divide-white/10">
                {items.map((item, index) => (
                  <DropdownMenu.Item
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 cursor-pointer select-none",
                      "transition-all duration-150",
                      "hover:bg-white/5",
                      "focus:bg-white/5 focus:outline-none",
                      item.unread && "bg-indigo-500/5"
                    )}
                    onClick={() => onItemClick?.(item.id)}
                  >
                    {/* Avatar (for messages) or Icon */}
                    {type === "messages" && item.avatar ? (
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.avatar}
                          alt={item.title}
                          className={cn(
                            "w-10 h-10 rounded-full object-cover",
                            item.unread && "ring-2 ring-indigo-500/70"
                          )}
                        />
                        {item.unread && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full ring-2 ring-[rgba(30,32,46,0.9)]" />
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-white/60" strokeWidth={2} />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className={cn(
                          "text-sm truncate",
                          item.unread ? "font-semibold text-white" : "font-medium text-white/80"
                        )}>
                          {item.title}
                        </p>
                        {type === "messages" && item.verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      {item.description && (
                        <p className={cn(
                          "text-xs line-clamp-2 leading-relaxed",
                          item.unread ? "text-zinc-300" : "text-zinc-400"
                        )}>
                          {item.description}
                        </p>
                      )}
                      {/* Timestamp */}
                      {(item.time || item.timestamp) && (
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {item.timestamp ? formatTimeAgo(item.timestamp) : item.time}
                        </p>
                      )}
                    </div>

                    {/* Unread indicator (for notifications) */}
                    {type === "notifications" && item.unread && (
                      <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mt-2 ring-2 ring-indigo-500/20" />
                    )}
                  </DropdownMenu.Item>
                ))}
              </div>
            )}
          </div>

          {/* Footer - View All Button */}
          {items.length > 0 && onViewAll && (
            <div className="px-4 py-3 border-t border-white/10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewAll();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #7F5AF0 0%, #4CC9F0 100%)",
                  boxShadow: "0 4px 12px rgba(127, 90, 240, 0.3)",
                }}
              >
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
                View All {type === "notifications" ? "Notifications" : "Messages"}
              </button>
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
