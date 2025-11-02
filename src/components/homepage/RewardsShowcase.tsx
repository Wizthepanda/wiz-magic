import { useState, useRef } from 'react';
import { Zap, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Mock reward data
const featuredRewards = [
  {
    id: 1,
    title: 'Full Stack Web Development Masterclass',
    creator: {
      name: 'Alex Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    zapsPrice: 2500,
    images: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format',
    ],
    enrolled: 1240,
    duration: '42 hours',
    soldOut: false,
  },
  {
    id: 2,
    title: 'Advanced React & TypeScript Course',
    creator: {
      name: 'Maria Garcia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    },
    zapsPrice: 1800,
    images: [
      'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&auto=format',
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format',
      'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800&auto=format',
    ],
    enrolled: 890,
    duration: '28 hours',
    soldOut: false,
  },
  {
    id: 3,
    title: 'Machine Learning Fundamentals',
    creator: {
      name: 'Dr. James Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    },
    zapsPrice: 3200,
    images: [
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format',
    ],
    enrolled: 2150,
    duration: '56 hours',
    soldOut: true,
  },
];

export function RewardsShowcase() {
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({});
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const nextImage = (rewardId: number, maxIndex: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [rewardId]: ((prev[rewardId] || 0) + 1) % maxIndex,
    }));
  };

  const prevImage = (rewardId: number, maxIndex: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [rewardId]: ((prev[rewardId] || 0) - 1 + maxIndex) % maxIndex,
    }));
  };

  return (
    <section
      id="rewards"
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 50%, #f7f9fc 100%)',
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
              ZAPs Rewards
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unlock premium courses, 1-on-1 coaching, and exclusive communities with your ZAPs
          </p>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRewards.map((reward, index) => {
            const currentIndex = currentImageIndex[reward.id] || 0;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Card */}
                <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Image Carousel */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
                    {/* Images */}
                    <div className="relative w-full h-full">
                      {reward.images.map((image, imgIndex) => (
                        <motion.img
                          key={imgIndex}
                          src={image}
                          alt={`${reward.title} preview ${imgIndex + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: imgIndex === currentIndex ? 1 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      ))}
                    </div>

                    {/* Carousel Controls */}
                    {reward.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(reward.id, reward.images.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => nextImage(reward.id, reward.images.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>

                        {/* Dots indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {reward.images.map((_, dotIndex) => (
                            <div
                              key={dotIndex}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                dotIndex === currentIndex
                                  ? 'bg-white w-4'
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Sold Out Overlay */}
                    {reward.soldOut && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Badge className="bg-red-600 text-white px-6 py-2 text-lg font-bold">
                          SOLD OUT
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 min-h-[3.5rem]">
                      {reward.title}
                    </h3>

                    {/* Creator */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={reward.creator.avatar} alt={reward.creator.name} />
                        <AvatarFallback>{reward.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {reward.creator.name}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{reward.enrolled.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{reward.duration}</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold">
                          <Zap className="w-4 h-4 fill-current" />
                          <span>{reward.zapsPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reward.soldOut}
                        className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                      >
                        {reward.soldOut ? 'Unavailable' : 'View'}
                      </Button>
                    </div>

                    {/* Progress bar for availability */}
                    {!reward.soldOut && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{Math.floor(Math.random() * 30 + 10)} spots left</span>
                          <span>{Math.floor(Math.random() * 40 + 60)}% claimed</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={
                              isInView
                                ? { width: `${Math.floor(Math.random() * 40 + 60)}%` }
                                : {}
                            }
                            transition={{ duration: 1, delay: 0.5 + index * 0.15 }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
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
            View All Rewards
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
