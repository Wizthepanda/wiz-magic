import { useRef, useState } from 'react';
import { DollarSign, Zap, Lock, Users, TrendingUp, Heart } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

const monetizationModels = [
  {
    id: 'free',
    icon: Heart,
    title: 'Free',
    description: 'Build your audience with free content',
    features: ['Unlimited uploads', 'Community features', 'Basic analytics'],
    color: 'from-green-500 to-emerald-600',
    accentColor: 'text-green-600',
    popular: false,
  },
  {
    id: 'zaps',
    icon: Zap,
    title: 'ZAPs Only',
    description: 'Let viewers unlock with earned ZAPs',
    features: ['No credit card needed', '85% revenue share', 'Loyal community'],
    color: 'from-violet-500 to-purple-600',
    accentColor: 'text-violet-600',
    popular: true,
  },
  {
    id: 'hybrid',
    icon: DollarSign,
    title: 'ZAPs + USD',
    description: 'Offer both ZAPs and cash payments',
    features: ['Maximum flexibility', 'Dual revenue streams', 'Premium positioning'],
    color: 'from-indigo-500 to-blue-600',
    accentColor: 'text-indigo-600',
    popular: false,
  },
  {
    id: 'waitlist',
    icon: Lock,
    title: 'Waitlist',
    description: 'Create exclusivity and demand',
    features: ['Build anticipation', 'VIP access tiers', 'Pre-launch buzz'],
    color: 'from-orange-500 to-red-600',
    accentColor: 'text-orange-600',
    popular: false,
  },
];

const stats = [
  {
    value: '3.2x',
    label: 'Higher Conversion',
    description: 'vs traditional paywalls',
  },
  {
    value: '92%',
    label: 'Retention Rate',
    description: 'After first unlock',
  },
  {
    value: '$8.5k',
    label: 'Avg Monthly Revenue',
    description: 'For active creators',
  },
];

export function CreatorBenefits() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartMonetizing = async () => {
    if (user) {
      navigate('/create');
      return;
    }

    setIsAuthenticating(true);
    try {
      await signInWithGoogleAndRedirect(navigate);
      // After auth, navigate to create page
      navigate('/create', { replace: true });
    } catch (err) {
      console.error('Start monetizing failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <section
      id="creator-benefits"
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #f7f9fc 0%, #eef1f7 100%)',
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              For Creators
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Monetize your expertise with flexible models that work for your audience
          </p>
        </motion.div>

        {/* Monetization Models Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {monetizationModels.map((model, index) => {
            const Icon = model.icon;

            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Popular badge */}
                {model.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-xs font-bold text-white shadow-lg">
                      POPULAR
                    </div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-full ${
                    model.popular ? 'ring-2 ring-violet-400' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center shadow-lg mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-2 ${model.accentColor}`}>{model.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {model.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {model.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 sm:p-12 shadow-xl">
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleStartMonetizing}
            disabled={isAuthenticating}
            className="inline-flex items-center gap-3 px-8 py-6 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow-xl transform transition hover:scale-[1.02] text-lg"
          >
            {isAuthenticating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Users className="w-5 h-5" />
                Start Monetizing
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Join 2,300+ creators already earning
          </p>
        </motion.div>
      </div>
    </section>
  );
}
