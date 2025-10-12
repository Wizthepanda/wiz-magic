import { motion } from 'framer-motion';
import { Play, Zap, Users, BookOpen, MessageCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CreatorVideo, CreatorOffer, CreatorProfileV2Data } from '../CreatorPublicProfileV2';

interface RightContextPanelProps {
  upNextVideos: CreatorVideo[];
  offers: CreatorOffer[];
  creator: CreatorProfileV2Data;
  onVideoClick: (video: CreatorVideo) => void;
}

/**
 * RightContextPanel Component
 *
 * Sticky right sidebar with:
 * - Up Next video list (vertical, scrollable up to 50 items)
 * - Creator Offers (Community, Course, Coaching, Products)
 */
export const RightContextPanel = ({
  upNextVideos,
  offers,
  creator,
  onVideoClick
}: RightContextPanelProps) => {
  // Get offer icon based on type
  const getOfferIcon = (type: CreatorOffer['type']) => {
    switch (type) {
      case 'community':
        return Users;
      case 'course':
        return BookOpen;
      case 'coaching':
        return MessageCircle;
      case 'product':
        return Package;
      default:
        return Package;
    }
  };

  // Get offer color based on type
  const getOfferColor = (type: CreatorOffer['type']) => {
    switch (type) {
      case 'community':
        return 'from-indigo-500 to-blue-500';
      case 'course':
        return 'from-purple-500 to-pink-500';
      case 'coaching':
        return 'from-green-500 to-emerald-500';
      case 'product':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Up Next Section */}
      {upNextVideos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-500" />
              Up Next
            </h3>
            <span className="text-xs text-gray-500">{upNextVideos.length} videos</span>
          </div>

          {/* Scrollable Video List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {upNextVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  onClick={() => onVideoClick(video)}
                  className="group flex gap-3 cursor-pointer hover:bg-white/60 -mx-2 px-2 py-2 rounded-xl transition-all"
                  role="button"
                  tabIndex={0}
                  aria-label={`Watch ${video.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onVideoClick(video);
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative w-32 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white text-[10px] font-medium">
                      {video.duration}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug mb-1">
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{video.views}</span>
                      <span className="flex items-center gap-0.5 text-indigo-600 font-medium">
                        <Zap className="w-3 h-3 fill-indigo-600" />
                        +{video.xpReward}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Creator Offers Section */}
      {offers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 px-1">From this Creator</h3>

          {offers.map((offer, index) => {
            const IconComponent = getOfferIcon(offer.type);
            const colorGradient = getOfferColor(offer.type);

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Offer Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br', colorGradient, 'flex items-center justify-center flex-shrink-0')}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-gray-900 truncate">
                        {offer.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium uppercase flex-shrink-0">
                        {offer.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>
                </div>

                {/* Offer Metadata */}
                <div className="flex items-center justify-between mb-4">
                  {offer.memberCount && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {offer.memberCount} members
                    </span>
                  )}

                  {/* Price */}
                  {offer.priceModel === 'free' && (
                    <span className="text-sm font-semibold text-green-600">Free</span>
                  )}
                  {offer.priceModel === 'paid' && offer.price && (
                    <span className="text-sm font-semibold text-gray-900">{offer.price}</span>
                  )}
                  {offer.priceModel === 'zaps' && offer.zaps && (
                    <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                      <Zap className="w-4 h-4 fill-indigo-600" />
                      +{offer.zaps} ZAPs
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className={cn(
                    'w-full h-10 rounded-full font-semibold text-white shadow-md hover:shadow-lg transition-all',
                    `bg-gradient-to-r ${colorGradient}`
                  )}
                  aria-label={`View ${offer.title}`}
                >
                  {offer.priceModel === 'free' ? 'Join Free' : offer.type === 'community' ? 'Join' : 'View'}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty State if no content */}
      {upNextVideos.length === 0 && offers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-100"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Play className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-sm text-gray-600">
            More content from {creator.name} coming soon!
          </p>
        </motion.div>
      )}
    </div>
  );
};
