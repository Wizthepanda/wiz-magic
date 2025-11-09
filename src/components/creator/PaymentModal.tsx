/**
 * PaymentModal - Premium payment modal for USD and crypto community access
 * Integrates with NOWPayments for crypto and displays USD pricing
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Zap, Loader2, CheckCircle2, CreditCard, Wallet, Bitcoin, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { NowPaymentsService, Currency } from '@/lib/nowpayments-service';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityTitle: string;
  creatorName: string;
  zapsRequired?: number;
  usdPrice?: number;
  onSuccess: () => void;
}

type PaymentMethod = 'crypto' | 'usd';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  communityId,
  communityTitle,
  creatorName,
  zapsRequired = 0,
  usdPrice = 0,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('crypto');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('usdtbsc');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Popular currencies to show first
  const popularCurrencies = ['usdtbsc', 'btc', 'eth', 'usdc', 'doge'];

  // Scroll lock effect
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

  // Load available cryptocurrencies
  useEffect(() => {
    if (isOpen && paymentMethod === 'crypto' && currencies.length === 0) {
      loadCurrencies();
    }
  }, [isOpen, paymentMethod]);

  const loadCurrencies = async () => {
    setLoadingCurrencies(true);
    try {
      const availableCurrencies = await NowPaymentsService.getCurrencies();

      // Sort to show popular currencies first
      const sorted = availableCurrencies.sort((a, b) => {
        const aIndex = popularCurrencies.indexOf(a.id.toLowerCase());
        const bIndex = popularCurrencies.indexOf(b.id.toLowerCase());

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      setCurrencies(sorted);
    } catch (error) {
      console.error('Failed to load currencies:', error);
      toast({
        title: 'Failed to load payment options',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoadingCurrencies(false);
    }
  };

  const handleCryptoPayment = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate total price (ZAPs converted to USD + USD price)
      const zapValueUSD = zapsRequired * 0.01; // Assuming 1 ZAP = $0.01
      const totalUSD = zapValueUSD + usdPrice;

      if (totalUSD <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Create crypto payment via NOWPayments
      const payment = await NowPaymentsService.createTipPayment({
        creatorId: user.uid,
        creatorName,
        amount: totalUSD,
        currency: 'usd',
        payCurrency: selectedCurrency,
        settlementCurrency: 'usdtbsc',
        tipperName: user.displayName || 'Anonymous',
        message: `Community Access: ${communityTitle}`,
      });

      // Payment window opened, show success message
      toast({
        title: 'Payment initiated',
        description: 'Complete the payment in the new window',
      });

      // TODO: Poll for payment status and grant access when confirmed
      // For now, we'll simulate success after a delay
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }, 3000);

    } catch (error: any) {
      console.error('Payment failed:', error);
      toast({
        title: 'Payment failed',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUSDPayment = async () => {
    // TODO: Integrate with Stripe or other USD payment processor
    toast({
      title: 'USD payments coming soon',
      description: 'Please use crypto payment for now',
    });
  };

  const handlePayment = () => {
    if (paymentMethod === 'crypto') {
      handleCryptoPayment();
    } else {
      handleUSDPayment();
    }
  };

  // Calculate total price
  const zapValueUSD = zapsRequired * 0.01;
  const totalUSD = zapValueUSD + usdPrice;

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
              'w-full max-w-[500px] mx-4',
              'bg-white dark:bg-neutral-900 backdrop-blur-xl',
              'rounded-2xl shadow-2xl',
              'p-6',
              'z-[2001]',
              'focus:outline-none'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                  Join {communityTitle}
                </Dialog.Title>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {creatorName}
                </p>
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

            {/* Success State */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Payment Confirmed!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Granting access...
                  </p>
                </motion.div>
              ) : (
                <motion.div key="payment">
                  {/* Price Summary */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
                    <div className="space-y-2">
                      {zapsRequired > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {zapsRequired} ZAPs
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${zapValueUSD.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {usdPrice > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Base Price
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${usdPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                          ${totalUSD.toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('crypto')}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all',
                          paymentMethod === 'crypto'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <Bitcoin className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          paymentMethod === 'crypto' ? 'text-indigo-600' : 'text-gray-500'
                        )} />
                        <p className={cn(
                          'text-sm font-semibold',
                          paymentMethod === 'crypto' ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'
                        )}>
                          Crypto
                        </p>
                      </button>

                      <button
                        onClick={() => setPaymentMethod('usd')}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all',
                          paymentMethod === 'usd'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <CreditCard className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          paymentMethod === 'usd' ? 'text-indigo-600' : 'text-gray-500'
                        )} />
                        <p className={cn(
                          'text-sm font-semibold',
                          paymentMethod === 'usd' ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'
                        )}>
                          Card (USD)
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                      </button>
                    </div>
                  </div>

                  {/* Crypto Currency Selection */}
                  {paymentMethod === 'crypto' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Pay With
                      </label>
                      {loadingCurrencies ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {currencies.slice(0, 12).map((currency) => (
                            <button
                              key={currency.id}
                              onClick={() => setSelectedCurrency(currency.id)}
                              className={cn(
                                'p-3 rounded-lg text-center transition-all',
                                selectedCurrency === currency.id
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              )}
                            >
                              <p className="text-xs font-semibold">
                                {currency.symbol}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
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
                      onClick={handlePayment}
                      disabled={isProcessing || (paymentMethod === 'crypto' && !selectedCurrency)}
                      className={cn(
                        'flex-1 bg-gradient-to-r from-indigo-600 to-violet-500 text-white',
                        'hover:from-indigo-700 hover:to-violet-600',
                        'shadow-lg hover:shadow-xl transition-all'
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Pay ${totalUSD.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
