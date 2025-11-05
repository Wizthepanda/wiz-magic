import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFeaturedVideos } from '@/hooks/useFeaturedVideos';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Eye } from 'lucide-react';

export const DiscoverPreview = () => {
  const navigate = useNavigate();
  const { data: videos, isLoading } = useFeaturedVideos();

  if (isLoading) {
    return (
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Discover Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Discover Content
          </h2>
          <p className="text-gray-600">New content coming soon - check back later!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Discover Content
          </h2>
          <p className="text-xl text-gray-600">
            Explore the latest videos and start earning ZAPs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.slice(0, 6).map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/discover/${video.id}`)}
            >
              <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-purple-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
                      >
                        <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
                      </motion.div>
                    </div>

                    {/* Category badge */}
                    {video.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 text-xs font-semibold bg-purple-600/90 text-white rounded-full backdrop-blur-sm">
                          {video.category}
                        </span>
                      </div>
                    )}

                    {/* Views */}
                    {video.views !== undefined && (
                      <div className="absolute bottom-3 right-3">
                        <div className="flex items-center px-2 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
                          <Eye className="w-3 h-3 mr-1" />
                          {video.views}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Creator Info */}
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex-shrink-0">
                        {video.creatorAvatar ? (
                          <img
                            src={video.creatorAvatar}
                            alt={video.creatorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {video.creatorName?.charAt(0) || 'C'}
                          </div>
                        )}
                      </div>
                      <span className="ml-2 text-sm text-gray-600 font-medium">
                        {video.creatorName || 'Creator'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                      {video.title}
                    </h3>

                    {/* Subcategory */}
                    {video.subcategory && (
                      <span className="inline-block text-xs text-gray-500">
                        {video.subcategory}
                      </span>
                    )}
                  </div>

                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
