import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CommunityData } from './Placeholders';

interface MemberData {
  id: string;
  profilePic?: string;
  photoURL?: string;
  avatar?: string;
  displayName?: string;
  username?: string;
}

interface CommunityHeaderProps {
  community: CommunityData;
  members?: MemberData[];
}

/**
 * Community Header Component
 * - Banner image with profile icon overlay
 * - Rating stars and access pill with readable text (purple gradient)
 * - Progress percentage
 * - Responsive container prevents overflow when sidebar expands
 */
export const CommunityHeader: React.FC<CommunityHeaderProps> = ({ community, members = [] }) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={cn(
              'w-4 h-4',
              index < fullStars
                ? 'fill-amber-400 text-amber-400'
                : index === fullStars && hasHalfStar
                ? 'fill-amber-400/50 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
    );
  };

  const getAccessBadgeColor = (accessType: string) => {
    switch (accessType) {
      case 'Free':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Free ZAPs':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ZAPs':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'ZAPs+USD':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'USD':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Banner Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={community.bannerUrl || community.coverMedia?.[0]?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop'}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Profile Icon - Positioned at bottom left */}
        <div className="absolute bottom-0 left-0 p-6 flex items-end gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl bg-white">
              <img
                src={community.profileIcon || community.profileIconUrl || community.icon || 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=200&h=200&fit=crop'}
                alt={`${community.name} icon`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Rating Stars - Below icon */}
            {community.rating !== undefined && community.ratingCount !== undefined && (
              <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                {renderStars(community.rating)}
                <span className="text-xs font-bold text-gray-700">
                  {community.rating}
                </span>
                <span className="text-xs text-gray-500">
                  ({community.ratingCount})
                </span>
              </div>
            )}
          </motion.div>

          {/* Community Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex-1 pb-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              {community.name}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {community.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm text-gray-700 border-0 shadow-md"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Right Meta - Access Type & Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="absolute top-6 right-6 flex flex-col items-end gap-3"
        >
          {/* Access Type Pill - Readable purple gradient text */}
          <Badge
            className={cn(
              'px-4 py-2 text-sm font-bold border shadow-lg backdrop-blur-sm',
              getAccessBadgeColor(community.accessType)
            )}
          >
            {community.accessType}
            {community.zapsCost && ` - ${community.zapsCost} ZAPs`}
            {community.usdCost && ` - $${community.usdCost}`}
          </Badge>

          {/* Progress - Purple gradient text (readable, no white-on-white) */}
          {community.progress !== undefined && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Progress {community.progress}%
              </span>
            </div>
          )}

          {/* Member Count with Avatars */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-3">
              {/* Member Avatars */}
              {members.length > 0 && (
                <div className="flex -space-x-2">
                  {members.slice(0, 3).map((member, idx) => (
                    <motion.img
                      key={member.id}
                      src={member.profilePic || member.photoURL || member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                      alt={member.displayName || member.username || 'Member'}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      title={member.displayName || member.username}
                    />
                  ))}
                  {members.length > 3 && (
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center shadow-md">
                      <span className="text-xs font-bold text-purple-600">+{members.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Member Count Text */}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-gray-700">
                  {members.length || community.memberCount || 0} {community.slots?.total ? `/ ${community.slots.total}` : 'members'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom spacer for rating stars */}
      <div className="h-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50" />
    </motion.div>
  );
};
