import { motion } from 'framer-motion';
import { useFeaturedCommunities } from '@/hooks/useFeaturedCommunities';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp } from 'lucide-react';

export const CommunityHighlights = () => {
  const { data: communities, isLoading } = useFeaturedCommunities();

  if (isLoading) {
    return (
      <section className="py-20 px-8 bg-gradient-to-br from-purple-50 via-lavender-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Top Communities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <section className="py-20 px-8 bg-gradient-to-br from-purple-50 via-lavender-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Top Communities
          </h2>
          <p className="text-gray-600">Communities are forming - join us soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-8 bg-gradient-to-br from-purple-50 via-lavender-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Top Communities
          </h2>
          <p className="text-xl text-gray-600">
            Join thriving communities and connect with like-minded learners
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communities.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border border-purple-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl h-full">
                <CardContent className="p-0">
                  {/* Banner */}
                  <div className="relative h-32 overflow-hidden">
                    {community.banner ? (
                      <img
                        src={community.banner}
                        alt={community.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400" />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-xs font-semibold bg-white/90 text-purple-700 rounded-full backdrop-blur-sm">
                        {community.category}
                      </span>
                    </div>

                    {/* Trending indicator */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center px-2 py-1 bg-purple-600/90 text-white text-xs rounded-full backdrop-blur-sm">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Community Name */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {community.name}
                    </h3>

                    {/* Description */}
                    {community.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {community.description}
                      </p>
                    )}

                    {/* Member Count */}
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-2 text-purple-500" />
                      <span className="text-sm font-medium">
                        {community.memberCount.toLocaleString()} members
                      </span>
                    </div>
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
