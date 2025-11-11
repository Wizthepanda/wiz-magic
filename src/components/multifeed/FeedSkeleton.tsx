import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  variant?: 'video' | 'post' | 'reward';
}

function SkeletonCard({ variant = 'video' }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl overflow-hidden',
        'bg-white/6 backdrop-blur-md border border-white/10',
        'animate-pulse'
      )}
    >
      {/* Video thumbnail skeleton */}
      {variant === 'video' && (
        <div className="aspect-video bg-white/10" />
      )}

      {/* Post image skeleton (optional) */}
      {variant === 'post' && Math.random() > 0.5 && (
        <div className="aspect-video bg-white/10" />
      )}

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Header for post */}
        {variant === 'post' && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        )}

        {/* Icon for reward */}
        {variant === 'reward' && (
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/10" />
          </div>
        )}

        {/* Title lines */}
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-full" />
          <div className="h-4 bg-white/10 rounded w-2/3" />
        </div>

        {/* Additional content */}
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-5/6" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 bg-white/10 rounded" />
          <div className="flex-1 h-8 bg-white/10 rounded" />
          <div className="w-12 h-8 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 6 }: { count?: number }) {
  const variants: Array<'video' | 'post' | 'reward'> = ['video', 'video', 'post', 'video', 'reward', 'video'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-6 auto-rows-min"
      style={{
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variants[i % variants.length]} />
      ))}
    </motion.div>
  );
}
