import { useRef } from 'react';
import { Users, Zap, Play } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreatorsQuery } from '@/hooks/useCreatorsQuery';

export function FeaturedCreators() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();
  const { data: creators = [], isLoading } = useCreatorsQuery();

  const handleCreatorClick = (creatorId: string) => {
    navigate(`/creator/${creatorId}`);
  };

  return (
    <section
      id="creators"
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #ffffff 0%, #f7f9fc 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Featured Creators
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover top creators and their amazing content
          </p>
        </motion.div>

        {/* Creators Carousel/Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No featured creators available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.slice(0, 6).map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleCreatorClick(creator.id)}
              >
                {/* Card */}
                <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Video Thumbnails Grid */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {creator.sampleVideos && creator.sampleVideos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1 h-full">
                        {creator.sampleVideos.slice(0, 3).map((video, vidIndex) => (
                          <div
                            key={video.id}
                            className={`${
                              vidIndex === 0 && creator.sampleVideos!.length === 1
                                ? 'col-span-2'
                                : creator.sampleVideos!.length === 2 && vidIndex === 0
                                ? 'col-span-2'
                                : ''
                            } overflow-hidden`}
                          >
                            {video.thumbnail ? (
                              <img
                                src={video.thumbnail}
                                alt={video.title || 'Video thumbnail'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900 flex items-center justify-center">
                                <Play className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900">
                        <Play className="w-16 h-16 text-indigo-600 dark:text-indigo-400 opacity-50" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-7 h-7 text-indigo-600 fill-indigo-600 ml-0.5" />
                      </div>
                    </div>

                    {/* Category badge */}
                    {creator.category && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
                          {creator.category}
                        </Badge>
                      </div>
                    )}

                    {/* Video count */}
                    {creator.sampleVideos && creator.sampleVideos.length > 0 && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                          <Play className="w-3 h-3" />
                          {creator.sampleVideos.length}+
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Creator Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12 ring-2 ring-violet-200 dark:ring-violet-800">
                        <AvatarImage src={creator.photoURL} alt={creator.displayName || 'Creator'} />
                        <AvatarFallback>
                          {creator.displayName?.[0] || creator.uid?.[0] || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {creator.displayName || 'Creator'}
                        </div>
                        {creator.bio && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {creator.bio}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    {creator.subscriberCount !== undefined && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <Users className="w-4 h-4" />
                        <span>{creator.subscriberCount.toLocaleString()} subscribers</span>
                      </div>
                    )}

                    {/* CTA */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      View Creator
                    </Button>
                  </div>

                  {/* Hover border effect */}
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Button
            onClick={() => navigate('/discover')}
            variant="outline"
            size="lg"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            Explore All Creators
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
