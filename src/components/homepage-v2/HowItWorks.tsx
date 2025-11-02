import { motion } from 'framer-motion';
import { Play, Zap, Gift, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Play,
    title: 'Watch Content',
    description: 'Watch educational videos from creators you love. No payment required.',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      'Free access to 10,000+ videos',
      'Learn at your own pace',
      'No ads interruptions',
    ],
  },
  {
    icon: Zap,
    title: 'Earn ZAPs',
    description: 'Automatically earn ZAP points as you watch. The more you learn, the more you earn.',
    gradient: 'from-indigo-500 to-violet-500',
    features: [
      'Real-time ZAP rewards',
      'Bonus for engagement',
      'Level up your profile',
    ],
    highlight: true, // This is the magic step
  },
  {
    icon: Gift,
    title: 'Claim Rewards',
    description: 'Redeem your ZAPs for premium courses, 1-on-1 coaching, or community access.',
    gradient: 'from-violet-500 to-purple-500',
    features: [
      'Premium courses unlocked',
      'Exclusive coaching sessions',
      'Private community access',
    ],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#eef1f7] via-white to-[#f7f9fc]" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to start earning rewards while you learn
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Connecting Arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-indigo-300" />
                  </div>
                )}

                {/* Card */}
                <div
                  className={`
                    relative h-full rounded-2xl p-8
                    ${step.highlight
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-2xl shadow-violet-500/30 transform scale-105'
                      : 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl'
                    }
                    transition-all duration-300 hover:shadow-2xl
                  `}
                >
                  {/* Highlight Badge */}
                  {step.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 rounded-full bg-yellow-400 text-gray-900 text-sm font-bold shadow-lg">
                        ⚡ Magic Happens Here
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6
                    ${step.highlight
                      ? 'bg-white/20 backdrop-blur-lg'
                      : `bg-gradient-to-br ${step.gradient}`
                    }
                    shadow-lg
                  `}>
                    <Icon className={`w-8 h-8 ${step.highlight ? 'text-white' : 'text-white'}`} />
                  </div>

                  {/* Step Number */}
                  <div className={`
                    text-sm font-bold mb-2
                    ${step.highlight ? 'text-white/80' : 'text-gray-500'}
                  `}>
                    STEP {index + 1}
                  </div>

                  {/* Title */}
                  <h3 className={`
                    text-2xl font-bold mb-3
                    ${step.highlight ? 'text-white' : 'text-gray-900'}
                  `}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className={`
                    mb-6 leading-relaxed
                    ${step.highlight ? 'text-white/90' : 'text-gray-600'}
                  `}>
                    {step.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className={`
                          flex items-center gap-2 text-sm
                          ${step.highlight ? 'text-white/90' : 'text-gray-700'}
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded-full flex items-center justify-center
                          ${step.highlight
                            ? 'bg-white/20'
                            : 'bg-green-100'
                          }
                        `}>
                          <div className={`
                            w-2 h-2 rounded-full
                            ${step.highlight ? 'bg-white' : 'bg-green-600'}
                          `} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Shimmer Effect for ZAP step */}
                  {step.highlight && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  )}

                  {/* Glowing Bottom Border */}
                  {!step.highlight && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient} rounded-b-2xl`} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of learners earning rewards today
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-full bg-white/70 backdrop-blur-lg border border-indigo-200 shadow-lg">
              <span className="text-sm font-semibold text-gray-700">
                ⚡ 2.5M+ ZAPs distributed
              </span>
            </div>
            <div className="px-6 py-3 rounded-full bg-white/70 backdrop-blur-lg border border-violet-200 shadow-lg">
              <span className="text-sm font-semibold text-gray-700">
                🎁 10,000+ rewards claimed
              </span>
            </div>
            <div className="px-6 py-3 rounded-full bg-white/70 backdrop-blur-lg border border-purple-200 shadow-lg">
              <span className="text-sm font-semibold text-gray-700">
                👥 50,000+ active learners
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
