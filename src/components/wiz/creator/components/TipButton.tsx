import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TipModal } from './TipModal';
import { 
  Heart,
  Coins,
  Sparkles
} from 'lucide-react';
import type { TipButtonProps } from '@/lib/nowpayments-service';

export const TipButton: React.FC<TipButtonProps> = ({
  creatorId,
  creatorName,
  creatorAvatar,
  size = 'md',
  variant = 'default',
  className
}) => {
  const [showTipModal, setShowTipModal] = useState(false);

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-12 px-4 text-sm',
    lg: 'h-14 px-6 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Button
          onClick={() => setShowTipModal(true)}
          variant={variant as any}
          size={size as any}
          className={cn(
            'relative overflow-hidden group',
            sizeClasses[size],
            variant === 'default' && [
              'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500',
              'hover:from-purple-600 hover:via-pink-600 hover:to-rose-600',
              'text-white border-0 shadow-lg hover:shadow-xl',
              'transition-all duration-300 ease-in-out'
            ],
            variant === 'outline' && [
              'border-2 border-gradient-to-r from-purple-500 to-pink-500',
              'bg-white/70 backdrop-blur-lg hover:bg-white/80',
              'text-purple-700 hover:text-purple-800',
              'transition-all duration-300'
            ],
            className
          )}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          {/* Content */}
          <div className="relative flex items-center gap-2">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            >
              <Heart size={iconSizes[size]} className="fill-current" />
            </motion.div>
            
            <div className="flex flex-col items-center">
              <span className="font-bold text-sm">
                💜 {size === 'lg' ? 'Tip Creator' : 'Tip'}
              </span>
              {size !== 'sm' && (
                <span className="text-xs opacity-90 font-medium -mt-0.5">
                  crypto
                </span>
              )}
            </div>
            
            {size !== 'sm' && (
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles size={iconSizes[size] - 2} />
              </motion.div>
            )}
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out" />
        </Button>

      </motion.div>

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={creatorId}
        creatorName={creatorName}
        creatorAvatar={creatorAvatar}
      />
    </>
  );
};