import { useRef } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedCommunities } from '@/hooks/useFeaturedCommunities';

export function CommunityHighlights() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();
  const { data: communities = [], isLoading } = useFeaturedCommunities();

  const handleCommunityClick = (communityId: string) => {
    navigate(`/communities/${communityId}`);
  };

  return (
    <section
      id="communities"
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)',
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
              Top Communities
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thriving communities of learners and creators
          </p>
        </motion.div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No communities available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {communities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group cursor-pointer"
                onClick={() => handleCommunityClick(community.id)}
              >
                {/* Card */}
                <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Banner */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    {community.banner ? (
                      <img
                        src={community.banner}
                        alt={community.name || 'Community banner'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 dark:from-indigo-900 dark:via-violet-900 dark:to-purple-900">
                        <Users className="w-16 h-16 text-indigo-600 dark:text-indigo-400 opacity-50" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Category badge */}
                    {community.category && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
                          {community.category}
                        </Badge>
                      </div>
                    )}

                    {/* Trending indicator */}
                    {index === 0 && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {community.name || 'Untitled Community'}
                    </h3>

                    {/* Description */}
                    {community.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {community.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>
                          {community.memberCount?.toLocaleString() || 0} members
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      View Community
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
            onClick={() => navigate('/communities')}
            variant="outline"
            size="lg"
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
          >
            Explore All Communities
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

