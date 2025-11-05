import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useFeaturedCommunities } from '@/hooks/useFeaturedCommunities';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Sparkles } from 'lucide-react';

export const CommunityHighlights = () => {
  const { data: communities, isLoading } = useFeaturedCommunities(3);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="py-20 px-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Top Communities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <section className="py-20 px-8 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Top Communities
          </h2>
          <p className="text-gray-600">Communities launching soon...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-8 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-purple-600" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Top Communities
            </h2>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thriving communities of learners and creators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communities.map((community, index) => (
            <CommunityCard
              key={community.id}
              community={community}
              index={index}
              onClick={() => navigate(`/communities/${community.id}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const CommunityCard = ({ community, index, onClick }: { community: any; index: number; onClick: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl h-full">
        <CardContent className="p-0">
          {/* Banner */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600">
            {community.bannerUrl ? (
              <img
                src={community.bannerUrl}
                alt={community.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white/50" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Category Badge */}
            {community.category && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-purple-700 text-xs font-semibold">
                {community.category}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Name */}
            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
              {community.name}
            </h3>

            {/* Description */}
            {community.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {community.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Members</p>
                  <p className="text-sm font-bold text-gray-900">
                    {(community.memberCount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"
              >
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </motion.div>
            </div>
          </div>
        </CardContent>

        {/* Gradient Border Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
      </Card>
    </motion.div>
  );
};
