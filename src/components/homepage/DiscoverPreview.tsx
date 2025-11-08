import { useRef } from 'react';
import { Play, Eye } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedVideos } from '@/hooks/useFeaturedVideos';

export function DiscoverPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();
  const { data: videos = [], isLoading } = useFeaturedVideos();

  const handleVideoClick = (videoId: string) => {
    navigate(`/discover/${videoId}`);
  };

  return (
    <section
      id="discover"
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
              Discover Content
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the latest videos from our creator community
          </p>
        </motion.div>

        {/* Videos Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No videos available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(0, 6).map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleVideoClick(video.id)}
              >
                {/* Card */}
                <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title || 'Video thumbnail'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900">
                        <Play className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-7 h-7 text-indigo-600 fill-indigo-600 ml-0.5" />
                      </div>
                    </div>

                    {/* Category badge */}
                    {video.category && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
                          {video.category}
                        </Badge>
                      </div>
                    )}

                    {/* Views */}
                    {video.views !== undefined && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                          <Eye className="w-3 h-3" />
                          {video.views.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {video.title || 'Untitled Video'}
                    </h3>

                    {/* Creator */}
                    {(video.creatorName || video.creatorAvatar) && (
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-8 h-8 ring-2 ring-violet-200 dark:ring-violet-800">
                          <AvatarImage src={video.creatorAvatar} alt={video.creatorName} />
                          <AvatarFallback>
                            {video.creatorName?.[0] || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {video.creatorName || 'Creator'}
                        </span>
                      </div>
                    )}

                    {/* Subcategory */}
                    {video.subcategory && (
                      <Badge variant="outline" className="text-xs">
                        {video.subcategory}
                      </Badge>
                    )}
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
            Explore All Videos
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

