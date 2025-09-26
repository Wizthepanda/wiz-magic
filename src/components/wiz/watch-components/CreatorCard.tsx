import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import OptimizedImage from '@/components/ui/optimized-image';

interface Creator {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
  isVerified: boolean;
  level?: number;
}

interface CreatorCardProps {
  creator: Creator;
  isSubscribed: boolean;
  className?: string;
}

export const CreatorCard = memo<CreatorCardProps>(({
  creator,
  isSubscribed,
  className
}) => {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/50",
        className
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      {/* Creator Avatar */}
      <div className="relative">
        <OptimizedImage
          src={creator.avatar}
          alt={creator.name}
          className="w-12 h-12 rounded-full ring-2 ring-white/50"
          lazy={false}
        />

        {/* Level badge */}
        {creator.level && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {creator.level}
          </div>
        )}
      </div>

      {/* Creator Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 truncate">
            {creator.name}
          </h3>

          {creator.isVerified && (
            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}

          {creator.level && creator.level >= 5 && (
            <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{creator.subscribers} subscribers</span>

          {isSubscribed && (
            <>
              <span>•</span>
              <span className="text-green-600 font-medium">Following</span>
            </>
          )}
        </div>
      </div>

      {/* Creator level indicator */}
      {creator.level && (
        <div className="flex flex-col items-center text-center">
          <div className="text-xs text-gray-500 mb-1">Level</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {creator.level}
          </div>
        </div>
      )}
    </motion.div>
  );
});

CreatorCard.displayName = 'CreatorCard';