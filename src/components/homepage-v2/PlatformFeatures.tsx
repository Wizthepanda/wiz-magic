import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  GraduationCap,
  BarChart3,
  DollarSign,
  MessageCircle,
} from 'lucide-react';

/**
 * Platform Features - Hero-level Super Section
 *
 * Design Philosophy: "One Platform. All The Features."
 * - Replaces Discover + Top Communities
 * - Unified premium showcase of WIZUP's complete ecosystem
 * - 3x2 feature grid with soft gradients and glass effects
 * - Matches WIZUP's luxury, modern, light aesthetic
 * - Airy like Notion, Premium like Apple, Warm like Duolingo
 */

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    id: '1',
    icon: Zap,
    title: 'ZAP Rewards Economy',
    description:
      'Earn while you learn. Use your ZAPs to unlock courses, coaching, and community access.',
    gradient: 'from-indigo-50 via-violet-50 to-purple-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: '2',
    icon: Users,
    title: 'Community Creation',
    description:
      'Build vibrant spaces for learners. Host live discussions, resources, and shared knowledge.',
    gradient: 'from-blue-50 via-cyan-50 to-teal-50',
    iconColor: 'text-blue-600',
  },
  {
    id: '3',
    icon: GraduationCap,
    title: 'Course Hosting',
    description:
      'Create structured learning paths with modules, lessons, progress tracking, and unlocking mechanics.',
    gradient: 'from-emerald-50 via-green-50 to-lime-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: '4',
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Understand your community growth, engagement, and learner progression at a glance.',
    gradient: 'from-orange-50 via-amber-50 to-yellow-50',
    iconColor: 'text-orange-600',
  },
  {
    id: '5',
    icon: DollarSign,
    title: 'USD & Crypto Payments',
    description:
      'Fully integrated secure payments. Global accessibility for your audience.',
    gradient: 'from-pink-50 via-rose-50 to-red-50',
    iconColor: 'text-pink-600',
  },
  {
    id: '6',
    icon: MessageCircle,
    title: 'Messaging & Influencer Hub',
    description:
      'Communicate directly, collaborate with creators, and unlock new growth pathways.',
    gradient: 'from-purple-50 via-fuchsia-50 to-pink-50',
    iconColor: 'text-purple-600',
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="group"
    >
      <div
        className={`relative h-full min-h-[280px] rounded-3xl overflow-hidden bg-gradient-to-br ${feature.gradient} shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all duration-500 border border-white/60`}
      >
        {/* Glass blur panel */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative p-8 flex flex-col items-center text-center h-full">
          {/* Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur-lg shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className={`w-8 h-8 ${feature.iconColor}`} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed font-normal">
            {feature.description}
          </p>
        </div>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

export function PlatformFeatures() {
  return (
    <section
      id="platform-features"
      className="relative py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background - Soft, Elevated */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#FAFAFA] to-white" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header - Matches homepage typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              One Platform. All The Features.
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 opacity-75 max-w-2xl mx-auto font-normal leading-relaxed">
            A complete creator and learner ecosystem powered by ZAPs
          </p>
        </motion.div>

        {/* Feature Grid - 3x2 responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
