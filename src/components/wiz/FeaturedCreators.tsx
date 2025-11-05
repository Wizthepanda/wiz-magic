import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useFeaturedCreators } from '@/hooks/useFeaturedCreators';
import { useCreatorVideos } from '@/hooks/useFeaturedVideos';
import { Star, Sparkles } from 'lucide-react';

export const FeaturedCreators = () => {
  const { data: creators, isLoading } = useFeaturedCreators();

  if (isLoading) {
    return (
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Featured Creators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!creators || creators.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Featured Creators
            </h2>
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing creators sharing knowledge and earning rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creators.map((creator, index) => (
            <CreatorCard key={creator.id} creator={creator} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const CreatorCard = ({ creator, index }: { creator: any; index: number }) => {
  const { data: videos } = useCreatorVideos(creator.id, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-2 border-transparent hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl">
        <CardContent className="p-6">
          {/* Creator Avatar & Info */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-purple-200 group-hover:ring-purple-400 transition-all">
                {creator.photoURL ? (
                  <img
                    src={creator.photoURL}
                    alt={creator.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center ring-2 ring-white">
                <Star className="w-3 h-3 text-white" fill="white" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                {creator.displayName || 'Creator'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Level {creator.level || 1}</span>
                <span>•</span>
                <span>{(creator.totalXP || 0).toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {creator.bio && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {creator.bio}
            </p>
          )}

          {/* Video Thumbnails */}
          {videos && videos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {videos.map((video, idx) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.05 }}
                  className="aspect-video rounded-lg overflow-hidden bg-purple-100"
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  );
};
