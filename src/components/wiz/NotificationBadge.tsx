import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  pulse?: boolean;
}

/**
 * Discord-style notification badge
 * Shows unread count with pulsing animation
 */
export const NotificationBadge = ({ count, className, pulse = true }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={cn(
        'absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5',
        'flex items-center justify-center',
        'bg-gradient-to-r from-pink-500 to-rose-500',
        'text-white text-[10px] font-bold',
        'rounded-full shadow-lg',
        'border-2 border-white',
        pulse && 'animate-notification-pulse',
        className
      )}
    >
      {displayCount}
    </motion.div>
  );
};
