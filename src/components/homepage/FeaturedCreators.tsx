import { useRef } from 'react';
import { Users, Zap, Play } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock featured communities/creators
const featuredCommunities = [
  {
    id: 1,
    name: 'Full Stack Academy',
    creator: 'Alex Chen',
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    members: 3240,
    zapsPrice: 2500,
    category: 'Web Development',
    videos: 127,
  },
  {
    id: 2,
    name: 'AI & Machine Learning Hub',
    creator: 'Dr. Sarah Johnson',
    cover: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&auto=format',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    members: 5120,
    zapsPrice: 3200,
    category: 'Machine Learning',
    videos: 89,
  },
  {
    id: 3,
    name: 'React Mastery',
    creator: 'Maria Garcia',
    cover: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&auto=format',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    members: 2890,
    zapsPrice: 1800,
    category: 'Frontend',
    videos: 156,
  },
  {
    id: 4,
    name: 'Cloud Architecture Pro',
    creator: 'Michael Lee',
    cover: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    members: 1950,
    zapsPrice: 2200,
    category: 'DevOps',
    videos: 72,
  },
  {
    id: 5,
    name: 'UI/UX Design Studio',
    creator: 'Emma Wilson',
    cover: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&auto=format',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    members: 4320,
    zapsPrice: 1500,
    category: 'Design',
    videos: 203,
  },
  {
    id: 6,
    name: 'Blockchain Fundamentals',
    creator: 'David Park',
    cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    members: 2670,
    zapsPrice: 2800,
    category: 'Web3',
    videos: 64,
  },
];

export function FeaturedCreators() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

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
              Featured Communities
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thriving communities of learners and unlock exclusive content
          </p>
        </motion.div>

        {/* Communities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCommunities.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              {/* Card */}
              <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Cover Image */}
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <img
                    src={community.cover}
                    alt={community.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-7 h-7 text-indigo-600 fill-indigo-600 ml-0.5" />
                    </div>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
                      {community.category}
                    </Badge>
                  </div>

                  {/* Videos count */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                      <Play className="w-3 h-3" />
                      {community.videos}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">
                    {community.name}
                  </h3>

                  {/* Creator */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10 ring-2 ring-violet-200 dark:ring-violet-800">
                      <AvatarImage src={community.avatar} alt={community.creator} />
                      <AvatarFallback>{community.creator[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {community.creator}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Creator</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{community.members.toLocaleString()} members</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm">
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{community.zapsPrice.toLocaleString()}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                    >
                      View Community
                    </Button>
                  </div>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Button
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
