import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClaimDrawer } from '@/components/ui/claim-drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { RewardData } from '@/components/ui/reward-card';
import { cn } from '@/lib/utils';
import { Gift, Sparkles, ExternalLink, CheckCircle, CreditCard } from 'lucide-react';

interface ClaimModalProps {
  reward: RewardData;
  userXP: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  reward,
  userXP,
  isOpen,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const discountPercent = Math.round(((reward.originalPrice - reward.usdCost) / reward.originalPrice) * 100);
  const remainingXP = userXP - reward.xpCost;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClaim = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Show success toast with confetti effect
      toast.success('🎉 Claimed! You\'ve unlocked access to \'' + reward.title + '\'', {
        duration: 5000,
        action: {
          label: 'View Details',
          onClick: () => console.log('View reward details')
        }
      });

      // Auto-close after success animation
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      setIsProcessing(false);
      toast.error('Failed to claim reward. Please try again.');
    }
  };

  const SuccessAnimation = () => (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-50 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(22, 163, 74, 0.9) 100%)',
        backdropFilter: 'blur(20px)'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center text-white">
        <motion.div
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 1, 
            repeat: 2,
            ease: "easeInOut"
          }}
        >
          <CheckCircle className="w-10 h-10" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">Claimed Successfully!</h3>
        <p className="text-lg opacity-90">Check your email for redemption details</p>
      </div>

      {/* Confetti particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-yellow-400 rounded-full"
          style={{
            left: `${50 + (Math.random() - 0.5) * 20}%`,
            top: `${50 + (Math.random() - 0.5) * 20}%`
          }}
          animate={{
            y: [0, -100, -200],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, 180, 360],
            opacity: [1, 0.7, 0]
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );

  // Render mobile drawer on mobile, desktop dialog on desktop
  if (isMobile) {
    return (
      <ClaimDrawer
        reward={reward}
        userXP={userXP}
        isOpen={isOpen}
        onClose={onClose}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md mx-auto border-0 p-0 overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)
          `,
          backdropFilter: 'blur(40px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          borderRadius: '1.5rem'
        }}
      >
        <div className="relative">
          <AnimatePresence>
            {isSuccess && <SuccessAnimation />}
          </AnimatePresence>

          {/* Header Image */}
          <div className="relative h-48 overflow-hidden rounded-t-2xl">
            <img
              src={reward.image}
              alt={reward.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Discount Badge */}
            <div className="absolute top-4 left-4">
              <Badge 
                className="text-white font-bold px-3 py-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                }}
              >
                -{discountPercent}%
              </Badge>
            </div>

            {/* Sparkle Effect */}
            <motion.div
              className="absolute top-4 right-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>

          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                {reward.title}
              </DialogTitle>
              
              {/* Provider */}
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reward.provider.avatar} />
                  <AvatarFallback className="text-sm bg-indigo-100 text-indigo-700">
                    {reward.provider.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">
                  By {reward.provider.name}
                </span>
              </div>
            </DialogHeader>

            {/* Description */}
            {reward.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {reward.description}
              </p>
            )}

            <Separator className="my-4" />

            {/* Pricing Breakdown */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Claim Breakdown</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your XP Balance:</span>
                  <span className="font-medium">💎 {userXP} XP</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">This deal requires:</span>
                  <div className="flex items-center space-x-1">
                    <motion.span 
                      className="px-2 py-1 rounded-full text-xs font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                      }}
                    >
                      💎 {reward.xpCost} XP
                    </motion.span>
                    <span>+ ${reward.usdCost}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Remaining XP after claim:</span>
                  <span className={cn(
                    "font-medium",
                    remainingXP >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    💎 {remainingXP} XP
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-gray-400 line-through">Original Price:</span>
                  <span className="text-gray-400 line-through">${reward.originalPrice}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Action Button */}
            <motion.div 
              className="space-y-3"
              whileHover={!isProcessing ? { scale: 1.01 } : {}}
            >
              <Button
                onClick={handleClaim}
                disabled={isProcessing || userXP < reward.xpCost}
                className={cn(
                  "w-full h-12 font-semibold text-lg transition-all duration-300",
                  userXP >= reward.xpCost
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
                style={userXP >= reward.xpCost ? {
                  boxShadow: '0 4px 16px rgba(147, 51, 234, 0.3)',
                } : {}}
              >
                {isProcessing ? (
                  <motion.div
                    className="flex items-center space-x-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Processing...</span>
                  </motion.div>
                ) : userXP >= reward.xpCost ? (
                  <div className="flex items-center space-x-2">
                    <Gift className="w-5 h-5" />
                    <span>Confirm Claim & Pay ${reward.usdCost}</span>
                  </div>
                ) : (
                  <span>Need {reward.xpCost - userXP} more XP to unlock</span>
                )}
              </Button>

              {userXP >= reward.xpCost && (
                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to secure checkout to complete your ${reward.usdCost} payment
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};