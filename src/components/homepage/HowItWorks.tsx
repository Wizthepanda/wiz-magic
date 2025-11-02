import { Play, Zap, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    icon: Play,
    title: 'Watch',
    description: 'Enjoy premium content from top creators in your favorite topics',
    color: 'from-indigo-500 to-indigo-600',
    accentColor: 'text-indigo-600',
  },
  {
    icon: Zap,
    title: 'Earn ZAPs',
    description: 'Automatically earn ZAPs as you watch — no ads, just rewards',
    color: 'from-violet-500 to-violet-600',
    accentColor: 'text-violet-600',
    shimmer: true,
  },
  {
    icon: Gift,
    title: 'Claim Rewards',
    description: 'Unlock exclusive courses, coaching sessions, and premium communities',
    color: 'from-purple-500 to-purple-600',
    accentColor: 'text-purple-600',
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #eef1f7 0%, #f9fafb 100%)',
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
              How It Works
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start earning rewards for your watch time in three simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection lines - desktop only */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200" />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Card */}
                <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>

                    {/* Shimmer effect for ZAPs */}
                    {step.shimmer && (
                      <motion.div
                        className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-900 shadow-md"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={
                          isInView
                            ? {
                                opacity: [0, 1, 1, 1],
                                scale: [0, 1.2, 1, 1],
                              }
                            : {}
                        }
                        transition={{
                          duration: 2,
                          delay: 1 + index * 0.2,
                          times: [0, 0.3, 0.6, 1],
                        }}
                      >
                        <Zap className="w-3 h-3 text-yellow-600 fill-yellow-600" />
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                          +5
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-bold mb-3 ${step.accentColor}`}>{step.title}</h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Animated border on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-200 via-violet-200 to-purple-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Arrow indicator - desktop only */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-24 -right-6 lg:-right-12 w-12 lg:w-24 h-0.5">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                      className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 origin-left"
                    />
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 1 + index * 0.2 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2"
                    >
                      <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-violet-400" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Hint */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Join thousands of learners already earning rewards
          </p>
        </motion.div>
      </div>
    </section>
  );
}
