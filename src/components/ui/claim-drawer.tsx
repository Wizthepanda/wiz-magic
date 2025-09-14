import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter,
  DrawerDescription 
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { RewardData } from '@/components/ui/reward-card';
import { cn } from '@/lib/utils';
import { Gift, Sparkles, CheckCircle, CreditCard, ChevronDown, Users, Clock } from 'lucide-react';

interface ClaimDrawerProps {
  reward: RewardData;
  userXP: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimDrawer: React.FC<ClaimDrawerProps> = ({
  reward,
  userXP,
  isOpen,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const discountPercent = Math.round(((reward.originalPrice - reward.usdCost) / reward.originalPrice) * 100);
  const remainingXP = userXP - reward.xpCost;

  const handleClaim = async () => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsProcessing(false);
      setIsSuccess(true);
      
      toast.success('🎉 Claimed! You\'ve unlocked access to \'' + reward.title + '\'', {
        duration: 5000,
        action: {
          label: 'View Details',
          onClick: () => console.log('View reward details')
        }
      });

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 3000);
      
    } catch (error) {
      setIsProcessing(false);
      toast.error('Failed to claim reward. Please try again.');
    }
  };

  const SuccessOverlay = () => (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-50 rounded-t-[10px]"
      style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)',
        backdropFilter: 'blur(20px)'
      }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="text-center text-white px-6">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
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
          <CheckCircle className="w-8 h-8" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">Successfully Claimed!</h3>
        <p className="text-sm opacity-90">Check your email for redemption details</p>
      </div>

      {/* Confetti particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            left: `${50 + (Math.random() - 0.5) * 30}%`,
            top: `${60 + (Math.random() - 0.5) * 20}%`
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, (Math.random() - 0.5) * 100],
            rotate: [0, 180, 360],
            opacity: [1, 0.7, 0]
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent 
        className="border-0"
        style={{
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)
          `,
          backdropFilter: 'blur(40px)',
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="relative max-h-[85vh] overflow-y-auto">
          <AnimatePresence>
            {isSuccess && <SuccessOverlay />}
          </AnimatePresence>

          {/* Header with Image */}
          <div className="relative">
            <div className="h-48 relative overflow-hidden">
              <motion.img
                src={reward.image}
                alt={reward.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Badges on image */}
              <div className="absolute top-4 left-4 flex space-x-2">
                <Badge 
                  className="text-white font-bold px-2 py-1"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  -{discountPercent}%
                </Badge>
                
                {reward.availability && (
                  <Badge 
                    className="text-white font-bold px-2 py-1"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)',
                      boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
                    }}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {reward.availability.remaining} left
                  </Badge>
                )}
              </div>

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
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>

            {/* Overlapping content */}
            <div className="relative -mt-6 mx-4 mb-4">
              <motion.div
                className="rounded-2xl p-4"
                style={{
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)
                  `,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <DrawerHeader className="p-0 text-left">
                  <DrawerTitle className="text-lg font-bold text-gray-900 mb-2">
                    {reward.title}
                  </DrawerTitle>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reward.provider.avatar} />
                      <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                        {reward.provider.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <DrawerDescription className="text-sm text-gray-600 m-0">
                      By {reward.provider.name}
                    </DrawerDescription>
                  </div>

                  {/* Pricing - Prominent display */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <motion.div 
                        className="px-3 py-1.5 rounded-full text-sm font-bold"
                        style={{
                          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                          color: 'white',
                          boxShadow: '0 4px 16px rgba(147, 51, 234, 0.3)'
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        💎 {reward.xpCost} XP
                      </motion.div>
                      <span className="text-xl font-bold text-gray-900">
                        + ${reward.usdCost}
                      </span>
                    </div>
                    <span className="text-gray-400 line-through text-lg">
                      ${reward.originalPrice}
                    </span>
                  </div>
                </DrawerHeader>
              </motion.div>
            </div>
          </div>

          <div className="px-4 space-y-4">
            {/* Expandable Description */}
            {reward.description && (
              <Accordion type="single" collapsible>
                <AccordionItem value="description" className="border-0">
                  <AccordionTrigger 
                    className="text-left py-3 px-4 rounded-xl hover:no-underline"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.6) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <span className="font-medium text-gray-900">Course Details</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-3 pb-0">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {reward.description}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* XP Breakdown */}
            <motion.div 
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.6) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">XP Breakdown</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your XP Balance:</span>
                  <span className="font-medium">💎 {userXP} XP</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Required for this deal:</span>
                  <span className="font-medium text-indigo-600">💎 {reward.xpCost} XP</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-600">Remaining after claim:</span>
                  <span className={cn(
                    remainingXP >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    💎 {remainingXP} XP
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Fixed Footer */}
          <DrawerFooter className="border-t border-gray-100 bg-white/80 backdrop-blur-sm sticky bottom-0">
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                onClick={handleClaim}
                disabled={isProcessing || userXP < reward.xpCost}
                size="lg"
                className={cn(
                  "w-full h-12 font-semibold text-base transition-all duration-300",
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
                  Secure checkout • Instant access after payment
                </p>
              )}
            </motion.div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};