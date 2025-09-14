import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, Sparkles, Gem, Crown, Zap, Star, BookOpen, Wrench, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { DealClaimModal } from '@/components/ui/deal-claim-modal';

// Premium deals data - expanded for luxury showcase
const topDeals = [
  {
    id: 'deal-1',
    title: 'AI Mastery Bootcamp',
    provider: 'Tech Academy Pro',
    image: '/api/placeholder/320/200',
    xpCost: 80,
    usdCost: 59,
    originalPrice: 299,
    discount: 80,
    claimedPercentage: 65,
    availabilityLeft: 35,
    featured: true,
    rarity: 'legendary',
    category: 'course'
  },
  {
    id: 'deal-2',
    title: 'Digital Marketing Pro',
    provider: 'Growth Masters',
    image: '/api/placeholder/320/200',
    xpCost: 120,
    usdCost: 49,
    originalPrice: 199,
    discount: 75,
    claimedPercentage: 42,
    availabilityLeft: 58,
    featured: false,
    rarity: 'epic',
    category: 'course'
  },
  {
    id: 'deal-3',
    title: 'Design Tools Bundle',
    provider: 'Creative Suite',
    image: '/api/placeholder/320/200',
    xpCost: 95,
    usdCost: 39,
    originalPrice: 259,
    discount: 85,
    claimedPercentage: 78,
    availabilityLeft: 22,
    featured: false,
    rarity: 'rare',
    category: 'tool'
  }
];

export const ClaimPreviewSection: React.FC = () => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewAllDeals = () => {
    window.location.href = '/claim';
  };

  const handleClaimDeal = (dealId: string) => {
    const deal = topDeals.find(d => d.id === dealId);
    if (deal) {
      setSelectedDeal(deal);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'epic': return <Zap className="w-3 h-3 text-purple-400" />;
      case 'rare': return <Star className="w-3 h-3 text-blue-400" />;
      default: return <Gem className="w-3 h-3 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course': return <BookOpen className="w-3 h-3" />;
      case 'tool': return <Wrench className="w-3 h-3" />;
      case 'coaching': return <Target className="w-3 h-3" />;
      default: return <BookOpen className="w-3 h-3" />;
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'rgba(251, 191, 36, 0.3)';
      case 'epic': return 'rgba(147, 51, 234, 0.3)';
      case 'rare': return 'rgba(59, 130, 246, 0.3)';
      default: return 'rgba(156, 163, 175, 0.2)';
    }
  };

  return (
    <>
      {/* XP Rewards Section */}
      <div className="relative mb-8 sm:mb-12">
        {/* Soft Blurred Gradient Header Strip */}
        <div
          className="absolute inset-0 rounded-3xl -m-4 opacity-30"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(255, 255, 255, 0.4) 0%,
                rgba(248, 250, 252, 0.3) 30%,
                rgba(139, 92, 246, 0.08) 70%,
                rgba(255, 255, 255, 0.2) 100%
              )
            `,
            backdropFilter: 'blur(25px) saturate(150%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)'
          }}
        />

        {/* Header Layout */}
        <div className="mb-6 sm:mb-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6">
            <div className="flex-1 mb-4 sm:mb-0">
              <motion.h3
                className="text-2xl sm:text-3xl font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 20%, #d946ef 40%, #8b5cf6 60%, #3b82f6 80%, #06d6a0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 6px 20px rgba(168, 85, 247, 0.5))'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                XP Rewards
              </motion.h3>
              <motion.p
                className="text-sm sm:text-base text-gray-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Unlock premium courses & tools with XP + deep discounts, only for insiders.
              </motion.p>
            </div>

            {/* View All Button */}
            <motion.div
              className="self-start sm:self-end"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                onClick={handleViewAllDeals}
                size="sm"
                className="px-6 py-3 text-sm font-bold rounded-full border-0 transition-all duration-300"
                style={{
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.9) 0%,
                      rgba(248, 250, 252, 0.8) 100%
                    )
                  `,
                  backdropFilter: 'blur(25px)',
                  color: '#4B5563',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(139, 92, 246, 0.1)'
                }}
              >
                View All →
              </Button>
            </motion.div>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topDeals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <DealCard
                deal={deal}
                index={index}
                onClaim={handleClaimDeal}
                isHovered={hoveredCard === deal.id}
                onHover={setHoveredCard}
                isMobile={isMobile}
                getRarityIcon={getRarityIcon}
                getRarityGlow={getRarityGlow}
                getCategoryIcon={getCategoryIcon}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Deal Claim Modal */}
      <DealClaimModal
        deal={selectedDeal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        getRarityIcon={getRarityIcon}
        getRarityGlow={getRarityGlow}
        getCategoryIcon={getCategoryIcon}
      />
    </>
  );
};

interface DealCardProps {
  deal: typeof topDeals[0];
  index: number;
  onClaim: (dealId: string) => void;
  isHovered: boolean;
  onHover: (dealId: string | null) => void;
  isMobile: boolean;
  getRarityIcon: (rarity: string) => JSX.Element;
  getRarityGlow: (rarity: string) => string;
  getCategoryIcon: (category: string) => JSX.Element;
}

const DealCard: React.FC<DealCardProps> = ({
  deal,
  index,
  onClaim,
  isHovered,
  onHover,
  isMobile,
  getRarityIcon,
  getRarityGlow,
  getCategoryIcon
}) => {
  const discountPercent = Math.round(((deal.originalPrice - deal.usdCost) / deal.originalPrice) * 100);
  const rarityGlow = getRarityGlow(deal.rarity);

  return (
    <motion.div
      className="group cursor-pointer w-full"
      whileHover={{
        scale: 1.03,
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => onHover(deal.id)}
      onHoverEnd={() => onHover(null)}
      onClick={() => onClaim(deal.id)}
    >
      {/* Glassmorphic Card */}
      <div
        className="overflow-hidden transition-all duration-300 rounded-2xl border-0 relative h-full"
        style={{
          background: `
            linear-gradient(135deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(248, 250, 252, 0.8) 100%
            )
          `,
          backdropFilter: 'blur(25px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: isHovered
            ? '0 12px 35px rgba(0, 0, 0, 0.12)'
            : '0 8px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
      >
        {/* Tier Badge */}
        <div className="absolute top-3 left-3 z-20">
          <motion.div
            className="px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
            style={{
              background: `linear-gradient(135deg, ${rarityGlow.replace('0.3', '0.9')} 0%, ${rarityGlow.replace('0.3', '0.7')} 100%)`,
              boxShadow: `0 2px 8px ${rarityGlow.replace('0.3', '0.2')}`,
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {getRarityIcon(deal.rarity)}
            {getCategoryIcon(deal.category)}
            <span className="uppercase text-[9px] tracking-wide">{deal.rarity}</span>
          </motion.div>
        </div>

        {/* Discount Tag */}
        <div className="absolute top-3 right-3 z-20">
          <motion.div
            className="px-2 py-1 rounded-lg text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
              boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            -{discountPercent}%
          </motion.div>
        </div>

        {/* Image */}
        <div className="relative overflow-hidden m-4 rounded-xl" style={{ height: '160px' }}>
          <div className="w-full h-full rounded-xl border border-gray-200 overflow-hidden">
            {deal.image && deal.image !== '/api/placeholder/320/200' ? (
              <motion.img
                src={deal.image}
                alt={deal.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${rarityGlow.replace('0.3', '0.1')} 0%, ${rarityGlow.replace('0.3', '0.05')} 100%)`
                }}
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto text-gray-400">
                    {getCategoryIcon(deal.category)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-2 space-y-4">
          {/* Title + Provider */}
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">
              {deal.title}
            </h4>
            <p className="text-sm text-gray-600 font-medium">
              {deal.provider}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
                style={{
                  background: `linear-gradient(135deg, ${rarityGlow.replace('0.3', '0.8')} 0%, ${rarityGlow.replace('0.3', '0.6')} 100%)`
                }}
              >
                <Gem className="w-3 h-3" />
                <span>{deal.xpCost}</span>
              </div>
              <span className="text-lg font-bold text-gray-900">+ ${deal.usdCost}</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 line-through">${deal.originalPrice}</div>
              <div className="text-xs text-green-600 font-bold">Save ${deal.originalPrice - deal.usdCost}</div>
            </div>
          </div>

          {/* Availability Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Availability</span>
              <span className="text-xs font-bold text-gray-800">{deal.availabilityLeft}% left</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${rarityGlow.replace('0.3', '0.7')} 0%, ${rarityGlow.replace('0.3', '0.5')} 100%)`,
                  width: `${deal.availabilityLeft}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${deal.availabilityLeft}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              className="w-full font-bold text-sm py-3 rounded-xl border-0 transition-all duration-300 relative"
              style={{
                background: `
                  linear-gradient(135deg,
                    rgba(255, 255, 255, 0.9) 0%,
                    rgba(248, 250, 252, 0.8) 100%
                  )
                `,
                backdropFilter: 'blur(25px)',
                color: '#4B5563',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: isHovered
                  ? '0 8px 25px rgba(139, 92, 246, 0.15)'
                  : '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
            >
              <span className="flex items-center justify-center space-x-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span>Claim</span>
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};