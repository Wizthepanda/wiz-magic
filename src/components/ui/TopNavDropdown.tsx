import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
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
  onViewAll?: () => void;
  className?: string;
}

export function TopNavDropdown({
  type,
  items,
  onItemClick,
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
            "relative rounded-full p-2 transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-800",
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
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#4BC0FF] ring-2 ring-white dark:ring-gray-900" />
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-[9999] w-80 overflow-hidden rounded-2xl border bg-popover p-2 shadow-2xl backdrop-blur-xl",
            "border-white/15 dark:border-gray-800",
            "bg-[#1E202E]/90 dark:bg-[#1E202E]/90",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="mb-2 flex items-center justify-between px-3 py-2">
              <h4 className="text-sm font-semibold text-white">
                {type === "notifications" ? "Notifications" : "Messages"}
              </h4>
              <span className="text-xs text-gray-400">
                {items.length} {type === "notifications" ? "notification" : "message"}{items.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Items List */}
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {items.length === 0 ? (
                <div className="flex h-28 items-center justify-center text-sm text-gray-400">
                  No {type} yet
                </div>
              ) : (
                items.map((item, index) => (
                  <DropdownMenu.Item
                    key={item.id}
                    className={cn(
                      "flex cursor-pointer select-none flex-col rounded-xl px-3 py-2.5 text-sm transition-all",
                      "hover:bg-white/10 dark:hover:bg-white/10",
                      "focus:bg-white/10 focus:outline-none",
                      item.unread && "bg-gradient-to-r from-[#6B4EFF]/10 to-[#4BC0FF]/10 border-l-2 border-[#6B4EFF]"
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
                          <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.unread && (
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#4BC0FF] mt-1" />
                      )}
                    </div>
                    {item.time && (
                      <p className="mt-1 text-[11px] text-gray-500">
                        {item.time}
                      </p>
                    )}
                  </DropdownMenu.Item>
                ))
              )}
            </div>

            {/* Footer - View All */}
            {items.length > 0 && onViewAll && (
              <>
                <DropdownMenu.Separator className="my-2 h-px bg-white/10" />
                <DropdownMenu.Item
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    "hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                    "text-[#6B4EFF] hover:text-[#7C5FFF]"
                  )}
                  onClick={onViewAll}
                >
                  View All {type === "notifications" ? "Notifications" : "Messages"}
                </DropdownMenu.Item>
              </>
            )}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
