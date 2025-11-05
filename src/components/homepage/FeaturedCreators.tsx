import { motion } from 'framer-motion';
import { useFeaturedCreators } from '@/hooks/useFeaturedCreators';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export const FeaturedCreators = () => {
  const { data: creators, isLoading } = useFeaturedCreators();

  if (isLoading) {
    return (
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Featured Creators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-12">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!creators || creators.length === 0) {
    return (
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Featured Creators
          </h2>
          <p className="text-gray-600">Coming soon - our amazing creators will be featured here!</p>
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
            Featured Creators
          </h2>
          <p className="text-xl text-gray-600">
            Learn from the best in the community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {creators.slice(0, 5).map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-2 border-transparent hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="relative mb-4"
                  >
                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-purple-200 shadow-lg">
                      {creator.photoURL ? (
                        <img
                          src={creator.photoURL}
                          alt={creator.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <Users className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    {/* Gradient glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  </motion.div>

                  {/* Name */}
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                    {creator.displayName}
                  </h3>

                  {/* Category */}
                  {creator.category && (
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
                      {creator.category}
                    </span>
                  )}

                  {/* Bio */}
                  {creator.bio && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
