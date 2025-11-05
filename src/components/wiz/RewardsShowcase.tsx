import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useRewards } from '@/hooks/useRewards';
import { Trophy, Zap, Gift, Crown } from 'lucide-react';

const iconMap: Record<string, any> = {
  trophy: Trophy,
  zap: Zap,
  gift: Gift,
  crown: Crown,
};

export const RewardsShowcase = () => {
  const { data: rewards, isLoading } = useRewards(3);

  if (isLoading) {
    return (
      <section className="py-20 px-8 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Unlock Amazing Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white/50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayRewards = rewards && rewards.length > 0 ? rewards : getDefaultRewards();

  return (
    <section className="py-20 px-8 bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-pink-500 rounded-full blur-3xl" />
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
            <Trophy className="w-8 h-8 text-purple-600" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Unlock Amazing Rewards
            </h2>
            <Trophy className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Earn ZAPs by watching, engaging, and leveling up to unlock exclusive benefits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayRewards.map((reward, index) => (
            <RewardCard key={reward.id} reward={reward} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const RewardCard = ({ reward, index }: { reward: any; index: number }) => {
  const Icon = reward.icon ? iconMap[reward.icon] || Trophy : Trophy;
  const gradient = reward.gradient || 'from-purple-500 to-purple-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -12, scale: 1.03 }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-white/80 backdrop-blur-md border-2 border-transparent hover:border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl h-full">
        {/* Gradient Border Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

        <CardContent className="p-8 relative z-10">
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>

          {/* Tier Name */}
          <h3 className={`text-2xl font-bold text-center mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {reward.tierName}
          </h3>

          {/* Required XP */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200">
              <Zap className="w-4 h-4 text-purple-600" fill="currentColor" />
              <span className="text-sm font-semibold text-purple-700">
                {reward.requiredXP.toLocaleString()} ZAPs
              </span>
            </div>
          </div>

          {/* Description */}
          {reward.description && (
            <p className="text-center text-gray-600 mb-6 text-sm leading-relaxed">
              {reward.description}
            </p>
          )}

          {/* Benefits */}
          {reward.benefits && reward.benefits.length > 0 && (
            <ul className="space-y-3">
              {reward.benefits.slice(0, 3).map((benefit: string, idx: number) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      </Card>
    </motion.div>
  );
};

// Default rewards to show when Firebase data is empty
const getDefaultRewards = () => [
  {
    id: 'bronze',
    tierName: 'Bronze Wizard',
    requiredXP: 1000,
    benefits: [
      'Access to exclusive content',
      'Profile badge',
      'Priority support'
    ],
    description: 'Start your journey with the Bronze tier and unlock basic perks',
    icon: 'trophy',
    gradient: 'from-orange-500 to-orange-700',
  },
  {
    id: 'silver',
    tierName: 'Silver Wizard',
    requiredXP: 5000,
    benefits: [
      'All Bronze benefits',
      'Early access to features',
      'Custom profile themes'
    ],
    description: 'Level up to Silver and enjoy enhanced rewards',
    icon: 'crown',
    gradient: 'from-gray-400 to-gray-600',
  },
  {
    id: 'gold',
    tierName: 'Gold Wizard',
    requiredXP: 10000,
    benefits: [
      'All Silver benefits',
      'VIP community access',
      'Monetization opportunities'
    ],
    description: 'Reach Gold status and unlock premium creator tools',
    icon: 'gift',
    gradient: 'from-yellow-500 to-yellow-700',
  },
];
