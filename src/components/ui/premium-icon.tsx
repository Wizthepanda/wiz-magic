import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface PremiumIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'xp' | 'hot';
  glow?: boolean;
  pulse?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const getVariantStyles = (variant: string, theme: string) => {
  const styles = {
    default: {
      light: 'text-gray-600',
      dark: 'text-gray-300',
    },
    primary: {
      light: 'text-indigo-600',
      dark: 'text-cyan-400',
      gradient: 'from-indigo-600 to-purple-600 dark:from-cyan-400 dark:to-blue-400',
    },
    secondary: {
      light: 'text-purple-600',
      dark: 'text-purple-400',
      gradient: 'from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400',
    },
    accent: {
      light: 'text-amber-600',
      dark: 'text-amber-400',
      gradient: 'from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400',
    },
    xp: {
      light: 'text-violet-600',
      dark: 'text-violet-400',
      gradient: 'from-violet-600 via-purple-600 to-blue-600 dark:from-violet-400 dark:via-purple-400 dark:to-cyan-400',
    },
    hot: {
      light: 'text-red-600',
      dark: 'text-red-400',
      gradient: 'from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400',
    },
  };

  return styles[variant] || styles.default;
};

export const PremiumIcon: React.FC<PremiumIconProps> = ({
  icon: Icon,
  size = 'md',
  variant = 'default',
  glow = false,
  pulse = false,
  className,
}) => {
  const { theme } = useTheme();
  const variantStyles = getVariantStyles(variant, theme);

  const iconElement = (
    <Icon
      className={cn(
        sizeClasses[size],
        'transition-all duration-300',
        variantStyles.gradient
          ? 'bg-gradient-to-r bg-clip-text text-transparent'
          : variantStyles[theme] || variantStyles.light,
        pulse && 'animate-pulse',
        className
      )}
      style={variantStyles.gradient ? {
        backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      } : undefined}
    />
  );

  if (glow || variant === 'xp' || variant === 'hot') {
    return (
      <div className={cn(
        'relative flex items-center justify-center',
        glow && variant === 'primary' && 'drop-shadow-[0_0_8px_rgba(99,102,241,0.6)] dark:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]',
        glow && variant === 'secondary' && 'drop-shadow-[0_0_8px_rgba(147,51,234,0.6)] dark:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]',
        glow && variant === 'accent' && 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] dark:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]',
        glow && variant === 'xp' && 'drop-shadow-[0_0_12px_rgba(139,92,246,0.8)] dark:drop-shadow-[0_0_12px_rgba(139,92,246,0.8)]',
        glow && variant === 'hot' && 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] dark:drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]',
        pulse && 'animate-neon-pulse'
      )}>
        {iconElement}

        {/* Enhanced glow effect for XP and Hot variants */}
        {(variant === 'xp' || variant === 'hot') && (
          <div className="absolute inset-0 flex items-center justify-center opacity-60">
            <Icon
              className={cn(
                sizeClasses[size],
                'text-transparent',
                variant === 'xp' && 'drop-shadow-[0_0_16px_rgba(139,92,246,0.4)]',
                variant === 'hot' && 'drop-shadow-[0_0_16px_rgba(239,68,68,0.4)]',
                pulse && 'animate-float-up'
              )}
            />
          </div>
        )}
      </div>
    );
  }

  return iconElement;
};

// Preset icon components for common use cases
export const XPIcon: React.FC<Omit<PremiumIconProps, 'variant'>> = (props) => (
  <PremiumIcon {...props} variant="xp" glow pulse />
);

export const HotIcon: React.FC<Omit<PremiumIconProps, 'variant'>> = (props) => (
  <PremiumIcon {...props} variant="hot" glow pulse />
);

export const PrimaryIcon: React.FC<Omit<PremiumIconProps, 'variant'>> = (props) => (
  <PremiumIcon {...props} variant="primary" glow />
);

export const AccentIcon: React.FC<Omit<PremiumIconProps, 'variant'>> = (props) => (
  <PremiumIcon {...props} variant="accent" glow />
);