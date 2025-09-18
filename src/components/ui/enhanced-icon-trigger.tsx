import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EnhancedIconTriggerProps {
  icon: LucideIcon;
  isActive?: boolean;
  isHovered?: boolean;
  variant?: "minimal" | "glass" | "premium";
  size?: "sm" | "md" | "lg";
  hasNotification?: boolean;
  notificationCount?: number;
  onClick?: () => void;
  className?: string;
}

export const EnhancedIconTrigger: React.FC<EnhancedIconTriggerProps> = ({
  icon: Icon,
  isActive = false,
  isHovered = false,
  variant = "minimal",
  size = "md",
  hasNotification = false,
  notificationCount,
  onClick,
  className
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative rounded-full transition-all duration-300 ease-out",
        "flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      style={{
        // Neutral state (line-based minimalist icons, soft gray/neutral)
        background: !isActive && !isHovered ? (
          variant === "glass"
            ? "rgba(255, 255, 255, 0.1)"
            : variant === "premium"
            ? "rgba(248, 250, 252, 0.6)"
            : "transparent"
        ) : undefined,

        // Hover state (subtle gradient border ring, tiny lift shadow)
        ...(isHovered && !isActive && {
          background: variant === "glass"
            ? "rgba(255, 255, 255, 0.15)"
            : variant === "premium"
            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
            : "rgba(59, 130, 246, 0.05)",
          border: variant !== "minimal" ? "1px solid rgba(59, 130, 246, 0.3)" : undefined,
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)"
        }),

        // Active state (filled background pill, glowing effect)
        ...(isActive && {
          background: variant === "glass"
            ? "rgba(255, 255, 255, 0.25)"
            : variant === "premium"
            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          boxShadow: "0 4px 15px rgba(59, 130, 246, 0.25), 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(10px) saturate(150%)"
        })
      }}
      whileHover={{
        y: -1,
        scale: 1.02
      }}
      whileTap={{
        scale: 0.98,
        y: 0
      }}
      animate={{
        scale: isActive ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
    >
      {/* Icon with state-based styling */}
      <Icon
        className={cn(
          iconSizes[size],
          "transition-all duration-300",
          // Neutral state - soft gray
          !isActive && !isHovered && "text-gray-500",
          // Hover state - subtle blue
          isHovered && !isActive && "text-blue-600",
          // Active state - glowing blue/purple
          isActive && "text-blue-700"
        )}
        style={{
          filter: isActive
            ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))"
            : undefined
        }}
      />

      {/* Notification indicator */}
      {hasNotification && (
        <motion.div
          className="absolute -top-1 -right-1 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {notificationCount && notificationCount > 0 ? (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg">
              {notificationCount > 99 ? '99+' : notificationCount}
            </div>
          ) : (
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg animate-pulse" />
          )}
        </motion.div>
      )}

      {/* Subtle glow effect for active state */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
            filter: "blur(8px)",
            zIndex: -1
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  );
};