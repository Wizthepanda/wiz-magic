/**
 * TipModal - Portal-based modal for tipping creators
 * Uses Radix Dialog with proper z-index, scroll lock, and positioning
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Zap, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
}

const TIP_AMOUNTS = [5, 10, 25, 50, 100, 250];

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAvatar,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const amount = customAmount ? parseFloat(customAmount) : selectedAmount;

  // Scroll lock effect when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTip = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please select or enter a valid tip amount',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to send tips',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Integrate with your payment provider (NOWPayments, Stripe, etc.)
      // For now, simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
      toast({
        title: 'Tip sent successfully!',
        description: `You sent ${amount} ZAPs to ${creatorName}`,
      });

      setTimeout(() => {
        setSuccess(false);
        onClose();
        setSelectedAmount(null);
        setCustomAmount('');
      }, 2000);
    } catch (error) {
      console.error('Failed to process tip:', error);
      toast({
        title: 'Payment failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
          />
        </Dialog.Overlay>

        {/* Content */}
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-[min(94vw,820px)] max-w-[820px]',
              'max-h-[90vh] overflow-y-auto',
              'bg-white dark:bg-neutral-900',
              'rounded-2xl shadow-2xl',
              'p-6',
              'z-[2001]',
              'focus:outline-none'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    Send a Tip
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Support {creatorName}
                  </p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            {/* Creator Info */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
              />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{creatorName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Creator</p>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Amount (ZAPs)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {TIP_AMOUNTS.map((tipAmount) => (
                  <button
                    key={tipAmount}
                    onClick={() => {
                      setSelectedAmount(tipAmount);
                      setCustomAmount('');
                    }}
                    className={cn(
                      'py-3 px-4 rounded-xl font-semibold transition-all',
                      selectedAmount === tipAmount && !customAmount
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {tipAmount}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="relative">
                <input
                  type="number"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-gray-100 dark:bg-gray-800',
                    'border border-gray-200 dark:border-gray-700',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-500 dark:placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500',
                    'transition-all'
                  )}
                  min="1"
                />
                <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Success State */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Tip Sent!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {amount} ZAPs sent to {creatorName}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {!success && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTip}
                  disabled={!amount || amount <= 0 || isProcessing}
                  className={cn(
                    'flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                    'hover:from-purple-600 hover:to-pink-600',
                    'shadow-lg hover:shadow-xl transition-all'
                  )}
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" fill="currentColor" />
                      Send {amount || 0} ZAPs
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
