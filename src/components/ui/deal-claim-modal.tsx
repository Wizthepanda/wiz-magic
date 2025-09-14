import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Crown, Zap, Star, Gem, BookOpen, Wrench, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface DealClaimModalProps {
  deal: any | null;
  isOpen: boolean;
  onClose: () => void;
  getRarityIcon: (rarity: string) => JSX.Element;
  getRarityGlow: (rarity: string) => string;
  getCategoryIcon: (category: string) => JSX.Element;
}

export const DealClaimModal: React.FC<DealClaimModalProps> = ({
  deal,
  isOpen,
  onClose,
  getRarityIcon,
  getRarityGlow,
  getCategoryIcon
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!deal) return null;

  const discountPercent = Math.round(((deal.originalPrice - deal.usdCost) / deal.originalPrice) * 100);
  const rarityGlow = getRarityGlow(deal.rarity);
  const savings = deal.originalPrice - deal.usdCost;

  const handleConfirmClaim = async () => {
    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899']
    });

    setIsProcessing(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Background Overlay */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px) saturate(120%)'
            }}
            onClick={handleClose}
          />

          {/* Modal Card */}
          <motion.div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-3xl"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 255, 255, 0.95) 0%,
                  rgba(248, 250, 252, 0.9) 100%
                )
              `,
              backdropFilter: 'blur(25px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: `
                0 25px 50px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.6)
              `
            }}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.4)'
              }}
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {!isSuccess ? (
              // Deal Information Layout
              <div className="flex flex-col md:flex-row">
                {/* Left Section - Image */}
                <div className="w-full md:w-1/2 h-64 md:h-80 relative">
                  {deal.image && deal.image !== '/api/placeholder/320/200' ? (
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Placeholder
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${rarityGlow.replace('0.3', '0.15')} 0%, ${rarityGlow.replace('0.3', '0.08')} 100%)`
                      }}
                    >
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto text-gray-400">
                          {getCategoryIcon(deal.category)}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Course Preview</p>
                      </div>
                    </div>
                  )}

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3">
                    <motion.div
                      className="px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center space-x-1"
                      style={{
                        background: `linear-gradient(135deg, ${rarityGlow.replace('0.3', '0.9')} 0%, ${rarityGlow.replace('0.3', '0.7')} 100%)`,
                        boxShadow: `0 4px 12px ${rarityGlow.replace('0.3', '0.3')}`,
                        backdropFilter: 'blur(10px)'
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {getRarityIcon(deal.rarity)}
                      {getCategoryIcon(deal.category)}
                      <span className="uppercase text-[10px] tracking-wide">{deal.rarity}</span>
                    </motion.div>
                  </div>

                  <div className="absolute top-3 right-3">
                    <motion.div
                      className="px-3 py-1 rounded-lg text-sm font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(168, 85, 247, 0.9) 100%)',
                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                        backdropFilter: 'blur(10px)'
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      -{discountPercent}%
                    </motion.div>
                  </div>
                </div>

                {/* Right Section - Deal Info */}
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                  {/* Title & Provider */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {deal.title}
                    </h2>
                    <p className="text-gray-600 font-medium">
                      {deal.provider}
                    </p>
                  </div>

                  {/* Pricing Section */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">XP Required:</span>
                      <div
                        className="px-3 py-1.5 rounded-lg text-sm font-bold text-white flex items-center space-x-1"
                        style={{
                          background: `linear-gradient(135deg, ${rarityGlow.replace('0.3', '0.8')} 0%, ${rarityGlow.replace('0.3', '0.6')} 100%)`
                        }}
                      >
                        <Gem className="w-4 h-4" />
                        <span>{deal.xpCost} XP</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Co-pay:</span>
                      <span className="text-xl font-bold text-gray-900">${deal.usdCost}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-400 line-through">Original: ${deal.originalPrice}</span>
                      <span className="text-lg font-bold text-green-600">Save ${savings}</span>
                    </div>
                  </div>

                  {/* Availability Bar */}
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Availability</span>
                      <span className="text-sm font-bold text-gray-800">{deal.availabilityLeft}% left</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${rarityGlow.replace('0.3', '0.7')} 0%, ${rarityGlow.replace('0.3', '0.5')} 100%)`,
                          width: `${deal.availabilityLeft}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${deal.availabilityLeft}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-3">
                    <motion.button
                      onClick={handleConfirmClaim}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-2xl font-bold text-white transition-all duration-300 relative overflow-hidden"
                      style={{
                        background: `
                          linear-gradient(135deg,
                            rgba(139, 92, 246, 0.9) 0%,
                            rgba(168, 85, 247, 0.9) 50%,
                            rgba(236, 72, 153, 0.9) 100%
                          )
                        `,
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: '0 12px 35px rgba(139, 92, 246, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.3)',
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <Crown className="w-5 h-5" />
                          <span>Confirm Claim</span>
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleClose}
                      className="w-full py-3 rounded-xl font-medium text-gray-600 transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)'
                      }}
                      whileHover={{
                        scale: 1.01,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              // Success State
              <motion.div
                className="p-8 text-center space-y-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                {/* Success Icon with Animation */}
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)',
                      boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Deal Claimed! 🎉
                  </h3>
                  <p className="text-gray-600 mb-4">
                    <strong>{deal.title}</strong> has been successfully claimed.
                  </p>
                  <p className="text-sm text-gray-500">
                    Check your email for access instructions.
                  </p>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl font-bold text-gray-700 transition-all duration-300"
                  style={{
                    background: `
                      linear-gradient(135deg,
                        rgba(255, 255, 255, 0.9) 0%,
                        rgba(248, 250, 252, 0.8) 100%
                      )
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Continue
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};