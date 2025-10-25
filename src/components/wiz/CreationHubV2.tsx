import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, User, Package, Plus, ArrowRight, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CreateCommunityPage from './CreateCommunityPage';
import { CommunityCreateWizard } from './CommunityCreateWizard';

type CreationType = 'community' | 'course' | 'coaching' | 'product' | null;

interface CreationCard {
  id: CreationType;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  zapBoost: string;
  route: string;
}

const creationCards: CreationCard[] = [
  {
    id: 'community',
    title: 'Community',
    description: 'Build powerful spaces — from private hubs to public collabs.',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    zapBoost: '+10%',
    route: '/create-community',
  },
  {
    id: 'course',
    title: 'Courses',
    description: 'Publish structured learning experiences with modules & progress tracking.',
    icon: BookOpen,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    zapBoost: '+15%',
    route: '/create-course',
  },
  {
    id: 'coaching',
    title: 'Coaching',
    description: 'Host 1-on-1 or group mentorship sessions.',
    icon: User,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
    zapBoost: '+20%',
    route: '/create-coaching',
  },
  {
    id: 'product',
    title: 'Digital Products',
    description: 'Offer templates, guides, and exclusive resources.',
    icon: Package,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50',
    zapBoost: '+12%',
    route: '/create-product',
  },
];

/**
 * CreationHubV2 - World-Class Creation Grid
 *
 * Features:
 * - 3D glassmorphic cards with depth and shadows
 * - Animated gradient outlines on hover
 * - Floating ZAP boost badges
 * - Particle effects on hover
 * - Smooth transitions and micro-interactions
 */
export const CreationHubV2: React.FC = () => {
  const navigate = useNavigate();
  const [activeCreationType, setActiveCreationType] = useState<CreationType>(null);

  const handleCreateClick = (type: CreationType) => {
    setActiveCreationType(type);
  };

  const handleBackToGrid = () => {
    setActiveCreationType(null);
  };

  // Show Community creation flow (NEW WIZARD v2.0)
  if (activeCreationType === 'community') {
    return <CommunityCreateWizard onBack={handleBackToGrid} />;
  }

  // Show creation grid
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What do you want to create today?
        </h2>
        <p className="text-gray-600 text-lg">
          Choose a creation type to get started and earn ZAP rewards.
        </p>
      </motion.div>

      {/* 2x2 Grid of Creation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {creationCards.map((card, index) => (
          <CreationCardV2
            key={card.id}
            card={card}
            index={index}
            onClick={() => handleCreateClick(card.id as CreationType)}
          />
        ))}
      </div>
    </div>
  );
};

// ========================================
// CREATION CARD V2 COMPONENT
// ========================================
interface CreationCardV2Props {
  card: CreationCard;
  index: number;
  onClick: () => void;
}

const CreationCardV2: React.FC<CreationCardV2Props> = ({ card, index, onClick }) => {
  const Icon = card.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      whileHover={{
        y: -12,
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* 3D Card Container with Glassmorphism */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-white/70 backdrop-blur-xl",
          "border-2 border-transparent",
          "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
          "transition-all duration-500",
          "hover:shadow-[0_20px_60px_rgba(168,85,247,0.25)]"
        )}
        style={{
          transform: isHovered ? 'perspective(1000px) rotateX(2deg)' : 'none',
        }}
      >
        {/* Animated Gradient Border */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100",
            "transition-opacity duration-500",
            `bg-gradient-to-r ${card.gradient}`,
            "blur-sm"
          )}
          animate={isHovered ? {
            scale: [1, 1.02, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Background Gradient Overlay */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            `bg-gradient-to-br ${card.bgGradient}`
          )}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full",
                `bg-gradient-to-r ${card.gradient}`,
                "opacity-0 group-hover:opacity-40"
              )}
              animate={isHovered ? {
                y: [0, -120],
                x: [0, Math.random() * 60 - 30],
                opacity: [0, 0.4, 0],
                scale: [0.5, 1, 0.5],
              } : {}}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut'
              }}
              style={{
                left: `${15 + i * 20}%`,
                bottom: 0,
              }}
            />
          ))}
        </div>

        {/* ZAP Boost Badge */}
        <div className="absolute top-6 right-6 z-20">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Badge
              className={cn(
                "bg-gradient-to-r text-white border-0 px-3 py-1.5 shadow-lg",
                card.gradient,
                "flex items-center gap-1"
              )}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-xs">ZAP Boost {card.zapBoost}</span>
            </Badge>
          </motion.div>
        </div>

        {/* Card Content */}
        <div className="relative p-8 space-y-6 z-10">
          {/* Icon */}
          <motion.div
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br shadow-xl",
              card.gradient,
              "transform transition-all duration-500",
              "group-hover:scale-110 group-hover:rotate-6"
            )}
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>

          {/* Text Content */}
          <div className="space-y-3">
            <h3
              className={cn(
                "text-2xl font-bold text-gray-900",
                "transition-all duration-300",
                "group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent",
                `group-hover:${card.gradient}`
              )}
            >
              {card.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {card.description}
            </p>
          </div>

          {/* CTA Button */}
          <Button
            className={cn(
              "w-full mt-4 font-semibold transition-all duration-300",
              "border-2 border-gray-200",
              "group-hover:border-transparent",
              "group-hover:bg-gradient-to-r group-hover:text-white",
              `group-hover:${card.gradient}`,
              "group-hover:shadow-[0_8px_30px_rgba(168,85,247,0.4)]"
            )}
            variant="outline"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create {card.title}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Bottom Shine Effect */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1",
            "bg-gradient-to-r opacity-0 group-hover:opacity-100",
            card.gradient,
            "transition-opacity duration-500"
          )}
        />
      </div>

      {/* Outer Glow Ring */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100",
          "bg-gradient-to-r blur-2xl -z-10",
          card.gradient,
          "transition-opacity duration-500"
        )}
        animate={isHovered ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
};

export default CreationHubV2;
