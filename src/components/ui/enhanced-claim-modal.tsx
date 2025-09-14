import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gem, CheckCircle, CreditCard, ArrowRight, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { RewardData } from './reward-card';

interface EnhancedClaimModalProps {
  reward: RewardData | null;
  userXP: number;
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedClaimModal: React.FC<EnhancedClaimModalProps> = ({
  reward,
  userXP,
  isOpen,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redemptionLink, setRedemptionLink] = useState('');

  const canAfford = reward ? userXP >= reward.xpCost : false;
  const remainingXP = reward ? userXP - reward.xpCost : 0;

  // Aurora Confetti Animation
  const triggerAuroraConfetti = () => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);
      
      // Aurora colors - purples, blues, and golds
      const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6'];
      
      confetti({
        ...defaults,
        particleCount,
        colors,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        colors,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 200);
  };

  const handleClaim = async () => {
    if (!reward || !canAfford) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsSuccess(true);
    setRedemptionLink(`https://example.com/redeem/${reward.id}`);
    
    // Trigger aurora confetti and toast
    triggerAuroraConfetti();
    toast.success(`✨ Success! You've unlocked '${reward.title}'!`, {
      description: 'Your exclusive access is ready below.',
      duration: 6000,
    });
  };

  const resetModal = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    setRedemptionLink('');
    onClose();
  };

  if (!reward) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={resetModal}>
          {/* Aurora Glass Blur Background */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: `
                radial-gradient(circle at 50% 50%, 
                  rgba(139, 92, 246, 0.08) 0%, 
                  rgba(59, 130, 246, 0.05) 30%,
                  rgba(16, 185, 129, 0.03) 60%,
                  rgba(0, 0, 0, 0.4) 100%
                )
              `,
              backdropFilter: 'blur(10px) saturate(120%)'
            }}
          />
          
          <DialogContent
            className="max-w-2xl border-0 p-0 overflow-hidden z-50"
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 255, 255, 0.9) 0%,
                  rgba(248, 250, 252, 0.85) 100%
                )
              `,
              backdropFilter: 'blur(25px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: `
                0 25px 50px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.5)
              `,
              borderRadius: '24px'
            }}
          >
            {/* Cinematic Card Expansion Animation */}
            <motion.div
              initial={{ 
                scale: 0.8, 
                opacity: 0,
                y: 60
              }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: 0
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                y: 30
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.5 
              }}
            >
        {!isSuccess ? (
          // Cinematic Claim Flow
          <div className="relative">
            {/* Hero Image - Dominates Top Half */}
            <div className="relative">
              <motion.img
                src={reward.image}
                alt={reward.title}
                className="w-full h-64 lg:h-80 object-cover"
                style={{ borderRadius: '24px 24px 0 0' }}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
              
              {/* Gradient Overlay */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 70%, rgba(0, 0, 0, 0.6) 100%)',
                  borderRadius: '24px 24px 0 0'
                }}
              />
              
              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetModal}
                className="absolute top-4 right-4 h-10 w-10 p-0 rounded-full backdrop-blur-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <X className="w-5 h-5 text-white" />
              </Button>
              
              {/* Floating Crown Badge for Premium */}
              <motion.div
                className="absolute top-4 left-4"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div
                  className="px-3 py-2 rounded-2xl text-white font-bold text-sm flex items-center space-x-2"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(249, 115, 22, 0.9) 0%, 
                        rgba(245, 158, 11, 0.9) 100%
                      )
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 25px rgba(249, 115, 22, 0.25)'
                  }}
                >
                  <Crown className="w-4 h-4" />
                  <span>Premium</span>
                </div>
              </motion.div>
            </div>
            
            <div className="p-8">
              {/* Offer Details */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {reward.title}
                </h2>
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <img 
                    src="/api/placeholder/32/32" 
                    alt={reward.provider?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium">{reward.provider?.name}</span>
                </div>
                
                {/* Collapsible Description */}
                <motion.p 
                  className="text-gray-600 leading-relaxed"
                  initial={{ height: '3rem', overflow: 'hidden' }}
                  animate={{ height: 'auto' }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  Master the fundamentals of AI and machine learning in this comprehensive bootcamp. 
                  Learn from industry experts and gain hands-on experience with real-world projects.
                </motion.p>
              </motion.div>

              {/* Price Breakdown Glass Card */}
              <motion.div
                className="p-6 rounded-2xl mb-8"
                style={{
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.7) 0%,
                      rgba(248, 250, 252, 0.6) 100%
                    )
                  `,
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="space-y-4">
                  {/* Original Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Original Price →</span>
                    <span className="text-xl text-gray-400 line-through font-bold">
                      ${reward.originalPrice}
                    </span>
                  </div>

                  {/* Claim Price */}
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-gray-600">Claim Price →</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600 font-bold text-lg">
                        {reward.xpCost} XP
                      </span>
                      <span className="text-gray-400">+</span>
                      <span className="text-green-600 font-bold text-2xl">
                        ${reward.usdCost}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Warning if insufficient XP */}
              {!canAfford && (
                <motion.div 
                  className="mb-6 p-4 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.03) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-red-600 font-medium flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>You need {reward.xpCost - userXP} more XP to claim this exclusive deal.</span>
                  </p>
                </motion.div>
              )}

              {/* CTA Button - Capsule Glass Border */}
              <motion.button
                onClick={handleClaim}
                disabled={!canAfford || isProcessing}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  canAfford
                    ? 'text-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                style={canAfford ? {
                  background: `
                    linear-gradient(135deg,
                      rgba(255, 255, 255, 0.8) 0%,
                      rgba(248, 250, 252, 0.7) 100%
                    )
                  `,
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                } : {}}
                whileHover={canAfford ? {
                  scale: 1.02,
                  y: -2,
                  boxShadow: '0 12px 35px rgba(0, 0, 0, 0.12)'
                } : {}}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Your Claim...</span>
                  </div>
                ) : canAfford ? (
                  <span>Confirm Claim & Pay →</span>
                ) : (
                  `Locked: Need ${reward.xpCost - userXP} more XP`
                )}
              </motion.button>
            </div>
          </div>
        ) : (
          // Aurora Success State
          <motion.div
            className="p-8 text-center space-y-8 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          >
            {/* Aurora Swirl Animation Background */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)
                `
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Floating Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`
                }}
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}
            
            {/* Floating Glass Circle with Success Icon */}
            <motion.div
              className="flex justify-center relative z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(34, 197, 94, 0.9) 0%, 
                      rgba(22, 163, 74, 0.9) 100%
                    )
                  `,
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 20px 40px rgba(34, 197, 94, 0.3),
                    0 8px 20px rgba(0, 0, 0, 0.1),
                    inset 0 2px 0 rgba(255, 255, 255, 0.4)
                  `
                }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
                
                {/* Pulsing Ring Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-green-400"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              </div>
            </motion.div>
            
            {/* Success State with Toast Message */}
            <motion.div
              className="relative z-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <h3 className="text-3xl font-bold mb-2 text-green-600">
                  🎉 Claimed!
                </h3>
                <p className="text-lg text-gray-600 font-medium mb-2">
                  You've unlocked <strong>{reward.title}</strong>
                </p>
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-green-700"
                     style={{
                       background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.08) 100%)',
                       border: '1px solid rgba(34, 197, 94, 0.2)'
                     }}>
                  ✨ Reward unlocked
                </div>
              </motion.div>
            </motion.div>
            
            {/* Premium Redemption Card */}
            <motion.div 
              className="p-6 rounded-3xl relative z-10"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(139, 92, 246, 0.08) 0%, 
                    rgba(59, 130, 246, 0.05) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                boxShadow: '0 12px 30px rgba(139, 92, 246, 0.1)'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Crown className="w-5 h-5 text-purple-600" />
                <h4 className="font-bold text-gray-900">Your Exclusive Access</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Your premium access link is ready:
              </p>
              <motion.a 
                href={redemptionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.25)'
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 12px 30px rgba(139, 92, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Access Your Course</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
            
            {/* Close Button */}
            <motion.button
              onClick={resetModal}
              className="w-full py-4 rounded-2xl font-bold text-gray-700 transition-all duration-300"
              style={{
                background: `
                  linear-gradient(135deg,
                    rgba(255, 255, 255, 0.8) 0%,
                    rgba(248, 250, 252, 0.7) 100%
                  )
                `,
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)'
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Continue Exploring
            </motion.button>
          </motion.div>
        )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};