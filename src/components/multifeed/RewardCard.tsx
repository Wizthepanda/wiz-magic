import { motion } from 'framer-motion';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { RewardItem } from '@/lib/feed-utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RewardCardProps {
  reward: RewardItem;
  onClaim?: (rewardId: string) => void;
}

export function RewardCard({ reward, onClaim }: RewardCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'bg-white/6 backdrop-blur-md border border-white/10',
        'shadow-lg hover:shadow-2xl',
        reward.unlocked ? 'hover:shadow-green-500/20' : 'hover:shadow-purple-500/20',
        'transition-all duration-300'
      )}
    >
      {/* Decorative gradient overlay */}
      <div className={cn(
        'absolute inset-0 opacity-10',
        reward.unlocked
          ? 'bg-gradient-to-br from-green-400 to-emerald-600'
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      )} />

      {/* Content */}
      <div className="relative p-6 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className={cn(
          'relative w-20 h-20 rounded-2xl flex items-center justify-center text-4xl',
          reward.unlocked
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'
            : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
        )}>
          <span className="relative z-10">{reward.icon}</span>
          {!reward.unlocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-tight">
          {reward.title}
        </h3>

        {/* Description */}
        <p className="text-neutral-300 text-sm leading-relaxed">
          {reward.description}
        </p>

        {/* XP Value */}
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg border',
          reward.unlocked
            ? 'bg-green-500/20 border-green-500/30'
            : 'bg-amber-500/20 border-amber-500/30'
        )}>
          <Award className={cn(
            'w-4 h-4',
            reward.unlocked ? 'text-green-400' : 'text-amber-400'
          )} />
          <span className={cn(
            'text-sm font-semibold',
            reward.unlocked ? 'text-green-300' : 'text-amber-300'
          )}>
            {reward.xpValue} XP
          </span>
        </div>

        {/* Progress */}
        {!reward.unlocked && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2 text-xs text-neutral-400">
              <span>Progress</span>
              <span className="font-semibold">{reward.progress}%</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reward.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>
        )}

        {/* Status badge */}
        {reward.unlocked && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold text-green-300">UNLOCKED</span>
          </div>
        )}

        {/* Action button */}
        {reward.unlocked && (
          <Button
            onClick={() => onClaim?.(reward.id)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
          >
            Claim Reward
          </Button>
        )}
      </div>
    </motion.div>
  );
}
