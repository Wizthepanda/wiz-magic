import { motion } from 'framer-motion';
import { useRewards } from '@/hooks/useRewards';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Zap, Star } from 'lucide-react';

const iconMap = {
  trophy: Trophy,
  zap: Zap,
  star: Star,
};

export const RewardsShowcase = () => {
  const { data: rewards, isLoading } = useRewards();

  if (isLoading) {
    return (
      <section className="py-20 px-8 bg-gradient-to-br from-purple-50 via-lavender-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Reward Tiers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!rewards || rewards.length === 0) {
    return (
      <section className="py-20 px-8 bg-gradient-to-br from-purple-50 via-lavender-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Reward Tiers
          </h2>
          <p className="text-gray-600">Exciting rewards coming soon!</p>
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
            Reward Tiers
          </h2>
          <p className="text-xl text-gray-600">
            Unlock amazing benefits as you level up
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rewards.map((reward, index) => {
            const IconComponent = iconMap[reward.icon as keyof typeof iconMap] || Trophy;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group"
              >
                <Card className="relative overflow-hidden bg-white/70 backdrop-blur-lg border-2 border-transparent hover:border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl h-full">
                  {/* Gradient background overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardContent className="p-8 relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      className="mb-6"
                    >
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </motion.div>

                    {/* Tier Name */}
                    <h3 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                      {reward.tierName}
                    </h3>

                    {/* Required XP */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                        <Zap className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm font-bold text-purple-700">
                          {reward.requiredXP.toLocaleString()} ZAPs
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {reward.description && (
                      <p className="text-gray-600 text-center mb-6 text-sm">
                        {reward.description}
                      </p>
                    )}

                    {/* Benefits */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Benefits
                      </h4>
                      <ul className="space-y-2">
                        {reward.benefits?.map((benefit, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <Star className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Decorative gradient border */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ maskImage: 'linear-gradient(white, white) padding-box, linear-gradient(white, white)' }} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
