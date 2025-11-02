import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users, Video, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  category: string;
  followers: number;
  videos: number;
  zapsDistributed: number;
  verified: boolean;
}

const featuredCreators: Creator[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: '@sarahcodes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
    category: 'Web Development',
    followers: 125000,
    videos: 324,
    zapsDistributed: 1250000,
    verified: true,
  },
  {
    id: '2',
    name: 'Michael Torres',
    username: '@coachmikey',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    coverImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop',
    category: 'Career Coaching',
    followers: 87000,
    videos: 156,
    zapsDistributed: 875000,
    verified: true,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    username: '@designemma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
    category: 'UI/UX Design',
    followers: 203000,
    videos: 445,
    zapsDistributed: 2030000,
    verified: true,
  },
  {
    id: '4',
    name: 'David Kim',
    username: '@davidteaches',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
    category: 'Data Science',
    followers: 156000,
    videos: 267,
    zapsDistributed: 1560000,
    verified: true,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    username: '@lisacreates',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop',
    category: 'Content Creation',
    followers: 94000,
    videos: 189,
    zapsDistributed: 940000,
    verified: true,
  },
  {
    id: '6',
    name: 'James Martinez',
    username: '@jamescodes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    category: 'Mobile Development',
    followers: 178000,
    videos: 389,
    zapsDistributed: 1780000,
    verified: true,
  },
];

function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <div className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-3">
      <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
        {/* Cover Image */}
        <div className="relative h-32 overflow-hidden">
          <img
            src={creator.coverImage}
            alt={creator.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Category Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-lg text-xs font-semibold text-gray-900">
            {creator.category}
          </div>
        </div>

        {/* Avatar (overlapping cover) */}
        <div className="relative px-6 -mt-12 mb-4">
          <div className="relative inline-block">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white"
            />
            {creator.verified && (
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Name & Username */}
          <h3 className="text-lg font-bold text-gray-900 mb-0.5">{creator.name}</h3>
          <p className="text-sm text-gray-600 mb-4">{creator.username}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {creator.followers >= 1000
                  ? `${(creator.followers / 1000).toFixed(0)}K`
                  : creator.followers}
              </div>
              <div className="text-xs text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Video className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">{creator.videos}</div>
              <div className="text-xs text-gray-600">Videos</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />
              </div>
              <div className="text-lg font-bold text-gray-900">
                {creator.zapsDistributed >= 1000000
                  ? `${(creator.zapsDistributed / 1000000).toFixed(1)}M`
                  : `${(creator.zapsDistributed / 1000).toFixed(0)}K`}
              </div>
              <div className="text-xs text-gray-600">ZAPs</div>
            </div>
          </div>

          {/* Follow Button */}
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full font-semibold hover:scale-105 transition-transform">
            Follow
          </Button>
        </div>

        {/* Trending Badge (optional) */}
        <div className="absolute top-40 left-3 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Trending
        </div>
      </div>
    </div>
  );
}

export function FeaturedCreators() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section id="creators" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#eef1f7] via-white to-white" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-indigo-200 shadow-lg mb-6">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-gray-700">
              Featured Creators
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Learn From The Best
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join communities led by expert creators who share their knowledge and reward your engagement
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -mx-3">
              {featuredCreators.map((creator, index) => (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <CreatorCard creator={creator} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-10"
            aria-label="Previous creators"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white backdrop-blur-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-10"
            aria-label="Next creators"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
          >
            Explore All Creators
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
