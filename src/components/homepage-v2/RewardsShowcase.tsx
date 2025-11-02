import { useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Zap, Users, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Reward {
  id: string;
  title: string;
  creator: string;
  zapCost: number;
  images: string[];
  claimed: number;
  total: number;
  rating: number;
  category: string;
  isSoldOut?: boolean;
}

const featuredRewards: Reward[] = [
  {
    id: '1',
    title: 'Full-Stack Web Development Bootcamp',
    creator: 'Sarah Chen',
    zapCost: 15000,
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
    ],
    claimed: 1247,
    total: 2000,
    rating: 4.9,
    category: 'Course',
  },
  {
    id: '2',
    title: '1-on-1 Career Coaching Session',
    creator: 'Michael Torres',
    zapCost: 8500,
    images: [
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    ],
    claimed: 89,
    total: 100,
    rating: 5.0,
    category: 'Coaching',
  },
  {
    id: '3',
    title: 'Premium Design Community Access',
    creator: 'Emma Wilson',
    zapCost: 5000,
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
    ],
    claimed: 2340,
    total: 5000,
    rating: 4.8,
    category: 'Community',
  },
];

function RewardCard({ reward }: { reward: Reward }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useState(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const availabilityPercent = (reward.claimed / reward.total) * 100;

  return (
    <div className="relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
      {/* Image Carousel */}
      <div className="relative overflow-hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {reward.images.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <div className="aspect-[4/3] relative">
                  <img
                    src={image}
                    alt={`${reward.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        {reward.images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-lg shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-lg shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-900" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {reward.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    selectedIndex === index
                      ? 'bg-white w-6'
                      : 'bg-white/50'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-lg text-xs font-semibold text-gray-900">
          {reward.category}
        </div>

        {/* SOLD OUT Badge */}
        {reward.isSoldOut && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg">
            SOLD OUT
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title & Creator */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
          {reward.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">by {reward.creator}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold text-gray-900">{reward.rating}</span>
          <span className="text-sm text-gray-500">
            ({reward.claimed.toLocaleString()} claimed)
          </span>
        </div>

        {/* Availability Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Availability</span>
            <span className="font-semibold text-gray-900">
              {reward.total - reward.claimed} left
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                availabilityPercent >= 80
                  ? 'bg-red-500'
                  : availabilityPercent >= 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              )}
              style={{ width: `${availabilityPercent}%` }}
            />
          </div>
        </div>

        {/* ZAP Cost & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Cost</div>
              <div className="text-lg font-bold text-gray-900">
                {reward.zapCost.toLocaleString()}
              </div>
            </div>
          </div>
          <Button
            disabled={reward.isSoldOut}
            className={cn(
              'rounded-full px-6 font-semibold',
              reward.isSoldOut
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-violet-500 text-white hover:scale-105 transition-transform'
            )}
          >
            {reward.isSoldOut ? 'Sold Out' : 'Claim Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RewardsShowcase() {
  return (
    <section id="rewards" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#f7f9fc] to-[#eef1f7]" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-violet-200 shadow-lg mb-6">
            <Zap className="w-4 h-4 text-violet-600 fill-violet-600" />
            <span className="text-sm font-semibold text-gray-700">
              Featured Rewards
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Unlock Premium Content
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use your ZAPs to claim courses, coaching sessions, and exclusive community access
          </p>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <RewardCard reward={reward} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-xl bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">1,000+</div>
              <div className="text-sm text-gray-600">Total Rewards</div>
            </div>
            <div className="p-6 rounded-xl bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-violet-600 fill-violet-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">5,000</div>
              <div className="text-sm text-gray-600">Avg. ZAP Cost</div>
            </div>
            <div className="p-6 rounded-xl bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">24h</div>
              <div className="text-sm text-gray-600">New Rewards Daily</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
