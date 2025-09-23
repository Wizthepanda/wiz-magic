import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface LuxuryCircularIconProps {
  icon: LucideIcon;
  isActive?: boolean;
  hasNotification?: boolean;
  notificationCount?: number;
  progressPercent?: number; // For micro progress ring
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "premium" | "aurora";
  onClick?: () => void;
  className?: string;
}

export const LuxuryCircularIcon: React.FC<LuxuryCircularIconProps> = ({
  icon: Icon,
  isActive = false,
  hasNotification = false,
  notificationCount,
  progressPercent = 0,
  size = "md",
  variant = "premium",
  onClick,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: { container: "w-10 h-10", icon: "w-4 h-4", ring: "r-16" },
    md: { container: "w-12 h-12", icon: "w-5 h-5", ring: "r-20" },
    lg: { container: "w-14 h-14", icon: "w-6 h-6", ring: "r-24" },
    xl: { container: "w-16 h-16", icon: "w-7 h-7", ring: "r-28" }
  };

  const { container, icon: iconSize, ring } = sizeClasses[size];

  // Get gradient styles based on variant and state
  const getGradientStyle = () => {
    if (variant === "aurora" && (isActive || isHovered)) {
      return {
        background: `
          conic-gradient(
            from 0deg,
            #3B82F6 0deg,
            #8B5CF6 72deg,
            #F59E0B 144deg,
            #EF4444 216deg,
            #10B981 288deg,
            #3B82F6 360deg
          )
        `,
        filter: "blur(1px)",
      };
    }

    if (isActive) {
      return {
        background: `
          linear-gradient(135deg,
            rgba(59, 130, 246, 0.2) 0%,
            rgba(139, 92, 246, 0.3) 50%,
            rgba(244, 114, 182, 0.2) 100%
          )
        `,
      };
    }

    if (isHovered) {
      return {
        background: `
          linear-gradient(135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(139, 92, 246, 0.15) 100%
          )
        `,
      };
    }

    return {
      background: `
        rgba(255, 255, 255, 0.1)
      `,
    };
  };

  return (
    <motion.button
      className={cn(
        "relative rounded-full transition-all duration-300 ease-out flex items-center justify-center",
        "backdrop-blur-xl backdrop-saturate-150",
        "border border-white/20",
        container,
        className
      )}
      style={{
        ...getGradientStyle(),
        boxShadow: isActive
          ? `
            0 8px 32px rgba(59, 130, 246, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
          `
          : isHovered
          ? `
            0 4px 16px rgba(59, 130, 246, 0.2),
            0 1px 4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2)
          `
          : `
            0 2px 8px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        y: -2
      }}
      whileTap={{
        scale: 0.95,
        y: 0
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
    >
      {/* Micro Progress Ring */}
      {(progressPercent > 0 || hasNotification) && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          style={{ overflow: 'visible' }}
        >
          {/* Background ring */}
          <circle
            cx="50%"
            cy="50%"
            r={ring.replace('r-', '')}
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
            fill="none"
          />

          {/* Progress ring */}
          {progressPercent > 0 && (
            <motion.circle
              cx="50%"
              cy="50%"
              r={ring.replace('r-', '')}
              stroke="url(#progressGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progressPercent / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))'
              }}
            />
          )}

          {/* Notification pulse ring */}
          {hasNotification && !progressPercent && (
            <motion.circle
              cx="50%"
              cy="50%"
              r={ring.replace('r-', '')}
              stroke="rgba(239, 68, 68, 0.8)"
              strokeWidth="2"
              fill="none"
              animate={{
                opacity: [0.5, 1, 0.5],
                strokeWidth: [2, 3, 2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Icon with gradient fill animation */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: isActive ? 1.1 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Icon
          className={cn(
            iconSize,
            "transition-all duration-300",
            // Default state - minimal line
            !isHovered && !isActive && "text-gray-400 stroke-2",
            // Hover state - gradient fill reveal
            isHovered && !isActive && "text-blue-500 stroke-2",
            // Active state - full gradient
            isActive && "text-blue-600 stroke-2"
          )}
          style={{
            fill: isHovered || isActive
              ? "url(#iconGradient)"
              : "none",
            filter: isActive
              ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))"
              : isHovered
              ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.4))"
              : "none"
          }}
        />

        {/* Icon gradient definition */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Notification Badge */}
      {hasNotification && (
        <motion.div
          className="absolute -top-1 -right-1 z-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {notificationCount && notificationCount > 0 ? (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-lg border-2 border-white">
              {notificationCount > 99 ? '99+' : notificationCount}
            </div>
          ) : (
            <motion.div
              className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg border-2 border-white"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      )}

      {/* Aurora Halo Effect for special states */}
      {variant === "aurora" && isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              conic-gradient(
                from 0deg,
                transparent 0deg,
                rgba(59, 130, 246, 0.3) 90deg,
                rgba(139, 92, 246, 0.4) 180deg,
                rgba(244, 114, 182, 0.3) 270deg,
                transparent 360deg
              )
            `,
            filter: "blur(20px)",
            zIndex: -1,
            scale: 1.5
          }}
          animate={{
            rotate: [0, 360],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      )}
    </motion.button>
  );
};