import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useFeaturedVideos } from '@/hooks/useFeaturedVideos';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const DiscoverPreview = () => {
  const { data: videos, isLoading } = useFeaturedVideos(6);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Discover Content
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-white/50 animate-pulse" />
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
          <p className="text-gray-600">New content coming soon...</p>
        </div>
      </section>
    );
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
            <Play className="w-8 h-8 text-purple-600" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Discover Fresh Content
            </h2>
            <Play className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch, learn, and earn ZAPs from our latest creator videos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              onClick={() => navigate(`/discover/${video.id}`)}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => navigate('/discover')}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="mr-2">View All Content</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

const VideoCard = ({ video, index, onClick }: { video: any; index: number; onClick: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-2 border-transparent hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl h-full">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-16 h-16 text-purple-400" />
              </div>
            )}

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.2 }}
                className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center"
              >
                <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Category Badge */}
            {video.category && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold">
                {video.category}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Creator Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-200">
                {video.creatorAvatar ? (
                  <img
                    src={video.creatorAvatar}
                    alt={video.creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {video.creatorName || 'Creator'}
                </p>
                {video.subcategory && (
                  <p className="text-xs text-gray-500 truncate">{video.subcategory}</p>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors min-h-[3.5rem]">
              {video.title}
            </h3>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {video.views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{video.views.toLocaleString()}</span>
                </div>
              )}
              {video.createdAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getRelativeTime(video.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Gradient Border Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
      </Card>
    </motion.div>
  );
};

const getRelativeTime = (timestamp: any) => {
  if (!timestamp) return 'Recently';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};
