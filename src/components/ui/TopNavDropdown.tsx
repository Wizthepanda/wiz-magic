import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Bell, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopNavDropdownProps {
  type: "notifications" | "messages";
  items: {
    id: string;
    title: string;
    description?: string;
    time?: string;
    unread?: boolean;
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

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "relative rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            "w-10 h-10 flex items-center justify-center group",
            className
          )}
          aria-label={type === "notifications" ? "Notifications" : "Messages"}
        >
          <Icon
            size={20}
            strokeWidth={2}
            className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors"
          />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#4BC0FF] ring-2 ring-white dark:ring-gray-900" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          side="bottom"
          sideOffset={10}
          collisionPadding={10}
          className={cn(
            "z-[9999] w-80 rounded-2xl border bg-popover shadow-2xl backdrop-blur-xl",
            "border-white/15 dark:border-gray-800",
            "bg-[#1E202E]/90 dark:bg-[#1E202E]/90",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/10">
            <h4 className="text-sm font-semibold text-white">
              {type === "notifications" ? "Notifications" : "Messages"}
            </h4>
            {items.length > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  type === "notifications" ? onMarkAllAsRead?.() : onViewAll?.();
                }}
                className="text-xs text-[#6B4EFF] hover:text-[#7C5FFF] hover:underline transition-colors"
              >
                {type === "notifications" ? "Mark all as read" : "View all"}
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="max-h-[320px] overflow-y-auto scrollbar-none p-2">
            {items.length === 0 ? (
              <div className="flex h-24 items-center justify-center text-sm text-gray-400">
                No {type} yet
              </div>
            ) : (
              items.map((item) => (
                <DropdownMenu.Item
                  key={item.id}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-xl px-3 py-2.5 text-sm cursor-pointer select-none transition-colors",
                    "hover:bg-white/10 dark:hover:bg-white/10",
                    "focus:bg-white/10 focus:outline-none",
                    item.unread && "bg-gradient-to-r from-[#6B4EFF]/10 to-[#4BC0FF]/10"
                  )}
                  onClick={() => onItemClick?.(item.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-medium text-white",
                        item.unread && "font-semibold"
                      )}>
                        {item.title}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.unread && (
                      <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#4BC0FF] mt-1" />
                    )}
                  </div>
                  {item.time && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {item.time}
                    </p>
                  )}
                </DropdownMenu.Item>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
