import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  UserPlus,
  UserCheck,
  Heart,
  Share2,
  Bookmark,
  Crown,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import type { CreatorProfileV2Data } from '../CreatorPublicProfileV2';

interface CreatorHeroProps {
  creator: CreatorProfileV2Data;
  isSubscribed: boolean;
  onSubscribe: () => void;
  onTip: () => void;
  onShare: () => void;
}

// Helper function to get level badge gradient
const getLevelBadgeGradient = (level: number) => {
  if (level >= 10) return 'from-purple-500 via-pink-500 to-orange-500'; // Platinum
  if (level >= 7) return 'from-yellow-400 to-orange-500'; // Gold
  if (level >= 4) return 'from-gray-300 to-gray-400'; // Silver
  return 'from-orange-400 to-orange-600'; // Bronze
};

const getLevelBadgeName = (level: number) => {
  if (level >= 10) return 'Platinum';
  if (level >= 7) return 'Gold';
  if (level >= 4) return 'Silver';
  return 'Bronze';
};

/**
 * CreatorHero Component
 *
 * Premium hero section with:
 * - Full-width glassmorphic banner
 * - Floating avatar with level ring
 * - Creator name, handle, bio
 * - Category and verified badges
 * - Action row: Subscribe, Tip, Share, Save
 */
export const CreatorHero = ({
  creator,
  isSubscribed,
  onSubscribe,
  onTip,
  onShare
}: CreatorHeroProps) => {
  return (
    <div className="w-full">
      {/* Banner Section with YouTube Auto-Fetch */}
      <div className="relative h-48 md:h-64 lg:h-72 overflow-hidden">
        {creator.banner ? (
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            src={creator.banner}
            alt={`${creator.name} banner`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient on banner load error
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className={`w-full h-full bg-gradient-to-br ${getLevelBadgeGradient(creator.level)}`}
          />
        )}

        {/* Hidden fallback gradient for error cases */}
        {creator.banner && (
          <motion.div
            initial={{ opacity: 0 }}
            style={{ display: 'none' }}
            className={`absolute inset-0 w-full h-full bg-gradient-to-br ${getLevelBadgeGradient(creator.level)}`}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Hero Card (overlapping banner) */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 -mt-20 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 md:p-8 border border-white/50"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar with Level Badge */}
            <div className="relative flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg ring-2 ring-offset-2 ring-indigo-500/20">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback className={`text-3xl font-bold text-white bg-gradient-to-br ${getLevelBadgeGradient(creator.level)}`}>
                    {creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Level Badge (ZAP ring style) */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getLevelBadgeGradient(creator.level)} shadow-lg flex items-center gap-1`}
              >
                <Crown className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-bold text-white">Lv.{creator.level}</span>
              </motion.div>
            </div>

            {/* Creator Info */}
            <div className="flex-1 space-y-3 min-w-0">
              {/* Name + Verified */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                  {creator.name}
                </h1>
                {creator.verified && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500" />
                  </motion.div>
                )}
              </div>

              {/* Handle */}
              <p className="text-sm md:text-base text-gray-600">{creator.handle}</p>

              {/* Bio */}
              <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl">
                {creator.bio}
              </p>

              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Level Badge */}
                <Badge
                  className={`bg-gradient-to-r ${getLevelBadgeGradient(creator.level)} text-white border-0 shadow-sm`}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {getLevelBadgeName(creator.level)} Creator
                </Badge>

                {/* Category Badge */}
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {creator.category}
                </Badge>

                {/* Follower Count */}
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {creator.stats.followers.toLocaleString()}
                  </span>{' '}
                  followers
                </span>
              </div>
            </div>

            {/* Action Buttons - Desktop: Right aligned, Mobile: Full width below */}
            <div className="w-full lg:w-auto flex flex-wrap items-center justify-center lg:justify-end gap-3 lg:gap-2">
              {/* Subscribe Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onSubscribe}
                  size="lg"
                  aria-label={isSubscribed ? 'Unsubscribe from creator' : 'Subscribe to creator'}
                  className={cn(
                    'w-full sm:w-auto min-w-[140px] h-[44px] rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg',
                    isSubscribed
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white'
                  )}
                >
                  {isSubscribed ? (
                    <>
                      <UserCheck className="w-5 h-5 mr-2" />
                      Subscribed
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Tip Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onTip}
                  size="lg"
                  aria-label="Tip creator"
                  className="w-full sm:w-auto min-w-[120px] h-[44px] rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Tip
                </Button>
              </motion.div>

              {/* Share Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onShare}
                  size="icon"
                  variant="outline"
                  aria-label="Share profile"
                  className="h-[44px] w-[44px] rounded-full bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-indigo-300 hover:shadow-md shadow-sm transition-all duration-300"
                >
                  <Share2 className="w-5 h-5 text-gray-700 hover:text-indigo-600 transition-colors" />
                </Button>
              </motion.div>

              {/* Save Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Save profile"
                  className="h-[44px] w-[44px] rounded-full bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-indigo-300 hover:shadow-md shadow-sm transition-all duration-300"
                >
                  <Bookmark className="w-5 h-5 text-gray-700 hover:text-indigo-600 transition-colors" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
