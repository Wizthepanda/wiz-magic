import { useRef } from 'react';
import { Zap } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRewards } from '@/hooks/useRewards';

export function RewardsShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();
  const { data: rewards = [], isLoading } = useRewards();

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
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No rewards available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rewards.map((reward, index) => {

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative group"
                >
                  {/* Card */}
                  <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-transparent group-hover:border-indigo-200 dark:group-hover:border-indigo-800">
                    {/* Gradient Background */}
                    <div className="relative aspect-video bg-gradient-to-br from-indigo-100 via-violet-100 to-purple-100 dark:from-indigo-900 dark:via-violet-900 dark:to-purple-900 overflow-hidden">
                      {/* Icon/Visual */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl">
                          <Zap className="w-12 h-12 text-white fill-white" />
                        </div>
                      </div>

                      {/* Tier Badge */}
                      {index === 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 font-bold">
                            Premium
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Tier Name */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {reward.tierName || `Tier ${index + 1}`}
                      </h3>

                      {/* Required XP */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm">
                            <Zap className="w-4 h-4 fill-current" />
                            <span>{reward.requiredXP?.toLocaleString() || 0} ZAPs</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {reward.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {reward.description}
                        </p>
                      )}

                      {/* Benefits List */}
                      {reward.benefits && reward.benefits.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {reward.benefits.slice(0, 3).map((benefit: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* CTA */}
                      <Button
                        onClick={() => navigate('/rewards')}
                        variant="outline"
                        size="sm"
                        className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                      >
                        Learn More
                      </Button>
                    </div>

                    {/* Hover border effect */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              );
            })}
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
            onClick={() => navigate('/rewards')}
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
