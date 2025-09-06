import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  NowPaymentsService, 
  type TipModalProps, 
  type Currency, 
  type CreatePaymentResponse,
  type PaymentStatusResponse,
  type MinAmountResponse,
  type PaymentEstimate
} from '@/lib/nowpayments-service';
import {
  Heart,
  Loader2,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  DollarSign,
  Bitcoin,
  Coins,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';

type TipStep = 'amount' | 'payment' | 'confirmation';
type TipCurrency = 'usd' | 'usdtbsc';

interface TipFormData {
  amount: number;
  currency: TipCurrency;
  payCurrency: TipCurrency;
  tipperName: string;
  message: string;
  settleInUsd: boolean;
}

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAvatar
}) => {
  const { toast } = useToast();
  
  // State management
  const [step, setStep] = useState<TipStep>('amount');
  const [loading, setLoading] = useState(false);
  const [loadingMinAmount, setLoadingMinAmount] = useState(false);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [formData, setFormData] = useState<TipFormData>({
    amount: 3,
    currency: 'usdtbsc',
    payCurrency: 'usdtbsc',
    tipperName: '',
    message: '',
    settleInUsd: true
  });
  const [minAmounts, setMinAmounts] = useState<{
    usd_to_usd?: number;
    usdtbsc_to_usd?: number;
  }>({});
  const [currentMinAmount, setCurrentMinAmount] = useState<number>(0);
  const [estimate, setEstimate] = useState<PaymentEstimate | null>(null);
  const [payment, setPayment] = useState<CreatePaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const quickAmounts = [3, 5, 10, 25];

  // Load minimum amounts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMinimumAmounts();
    }
  }, [isOpen]);

  // Update minimum amount when currency changes
  useEffect(() => {
    const key = `${formData.currency}_to_usd` as keyof typeof minAmounts;
    const minAmount = minAmounts[key] || 0;
    setCurrentMinAmount(minAmount);
    
    // Update amount if current amount is below minimum
    if (formData.amount < minAmount && minAmount > 0) {
      setFormData(prev => ({ ...prev, amount: Math.ceil(minAmount) }));
    }
  }, [formData.currency, minAmounts]);

  // Get estimate when amount or currency changes
  useEffect(() => {
    if (formData.amount >= currentMinAmount && currentMinAmount > 0) {
      getEstimateDebounced();
    }
  }, [formData.amount, formData.currency, currentMinAmount]);

  // Generate QR code when payment is created
  useEffect(() => {
    if (payment) {
      generateQRCode();
    }
  }, [payment]);

  // Poll payment status
  useEffect(() => {
    if (payment && step === 'payment') {
      const interval = setInterval(async () => {
        try {
          const status = await NowPaymentsService.getPaymentStatus(payment.payment_id);
          setPaymentStatus(status);
          
          if (status.payment_status === 'finished' || status.payment_status === 'confirmed') {
            setStep('confirmation');
            toast({
              title: "🎉 Tip Sent Successfully!",
              description: `Your tip has been sent to ${creatorName}`,
            });
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [payment, step, creatorName, toast]);

  const loadMinimumAmounts = async () => {
    try {
      setLoadingMinAmount(true);
      const [usdToUsd, usdtbscToUsd] = await Promise.all([
        NowPaymentsService.getMinAmount('usd', 'usd'),
        NowPaymentsService.getMinAmount('usdtbsc', 'usd')
      ]);
      
      setMinAmounts({
        usd_to_usd: usdToUsd.min_amount,
        usdtbsc_to_usd: usdtbscToUsd.min_amount
      });
    } catch (error) {
      console.error('Error loading minimum amounts:', error);
      // Set reasonable defaults
      setMinAmounts({
        usd_to_usd: 1,
        usdtbsc_to_usd: 1
      });
      toast({
        title: "Using default minimum amounts",
        description: "Could not fetch dynamic minimums from NOWPayments",
        variant: "destructive",
      });
    } finally {
      setLoadingMinAmount(false);
    }
  };

  const getEstimate = async () => {
    if (!formData.amount || formData.amount < currentMinAmount) {
      setEstimate(null);
      return;
    }

    try {
      setLoadingEstimate(true);
      const estimateResponse = await NowPaymentsService.getEstimate(
        formData.amount,
        formData.currency,
        formData.settleInUsd ? 'usd' : formData.currency
      );
      setEstimate(estimateResponse);
    } catch (error) {
      console.error('Error getting estimate:', error);
      setEstimate(null);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const getEstimateDebounced = (() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(getEstimate, 500);
    };
  })();

  const generateQRCode = async () => {
    if (!payment) return;
    
    try {
      const qrData = NowPaymentsService.generateQRData(
        payment.pay_address,
        payment.pay_amount,
        payment.pay_currency
      );
      const qrUrl = await QRCode.toDataURL(qrData);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      setLoading(true);
      
      // Determine the correct pay currency
      const payCurrency = formData.currency === 'usd' ? 'usd' : 'usdtbsc';
      
      // Debug logging
      console.log('🎯 Creating payment with:', {
        amount: formData.amount,
        currency: formData.currency,
        payCurrency,
        currentMinAmount,
        isAboveMin: formData.amount >= currentMinAmount
      });
      
      // Final validation
      if (formData.amount < currentMinAmount) {
        throw new Error(`Amount $${formData.amount} is below minimum of $${currentMinAmount.toFixed(2)} for ${formData.currency.toUpperCase()}`);
      }
      
      const paymentResponse = await NowPaymentsService.createTipPayment({
        creatorId,
        creatorName,
        amount: formData.amount,
        currency: formData.currency,
        payCurrency: payCurrency,
        tipperName: formData.tipperName || undefined,
        message: formData.message || undefined
      });
      
      setPayment(paymentResponse);
      setStep('payment');
      
      toast({
        title: "Payment Created",
        description: "Please complete the payment to send your tip",
      });
    } catch (error) {
      toast({
        title: "Error creating payment",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCurrencyToggle = (useUsdt: boolean) => {
    const newCurrency = useUsdt ? 'usdtbsc' : 'usd';
    setFormData(prev => ({
      ...prev,
      currency: newCurrency,
      payCurrency: newCurrency
    }));
  };

  const handleClose = () => {
    setStep('amount');
    setPayment(null);
    setPaymentStatus(null);
    setQrCodeUrl('');
    setEstimate(null);
    setFormData({
      amount: 3,
      currency: 'usdtbsc',
      payCurrency: 'usdtbsc',
      tipperName: '',
      message: '',
      settleInUsd: true
    });
    onClose();
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      {/* Creator info */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <Avatar className="w-12 h-12 border-2 border-white shadow-md">
          <AvatarImage src={creatorAvatar} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
            {creatorName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-gray-900">Tipping {creatorName}</h3>
          <p className="text-sm text-gray-600">All settlements finalized in USD</p>
        </div>
        <Sparkles className="ml-auto text-purple-500" size={24} />
      </div>

      {/* Currency Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign size={20} className={formData.currency === 'usd' ? 'text-green-600' : 'text-gray-400'} />
            <span className="text-sm font-medium">USD</span>
          </div>
          <Switch
            checked={formData.currency === 'usdtbsc'}
            onCheckedChange={handleCurrencyToggle}
            className="data-[state=checked]:bg-orange-500"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">USDT (BSC)</span>
            <Coins size={20} className={formData.currency === 'usdtbsc' ? 'text-orange-500' : 'text-gray-400'} />
          </div>
        </div>
        
        {/* Currency Info */}
        <div className="text-xs text-gray-600 px-2">
          {formData.currency === 'usd' 
            ? "Tip in USD fiat equivalent via NOWPayments fiat settlements"
            : "Tip in USDT on Binance Smart Chain network"
          }
        </div>
        
        {/* Minimum Amount Display */}
        {loadingMinAmount ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={14} className="animate-spin" />
            Loading minimum amount...
          </div>
        ) : currentMinAmount > 0 && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            Minimum tip: ${currentMinAmount.toFixed(2)} {formData.currency.toUpperCase()}
          </div>
        )}
      </div>

      {/* Amount selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tip Amount ({formData.currency.toUpperCase()})
          </label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant={formData.amount === amount ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, amount }))}
                className={formData.amount === amount ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                disabled={amount < currentMinAmount}
              >
                ${amount}
              </Button>
            ))}
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="pl-10"
              placeholder="Custom amount"
              min={currentMinAmount}
              step="0.01"
            />
          </div>
          {formData.amount < currentMinAmount && formData.amount > 0 && (
            <p className="text-sm text-red-600 mt-1">
              Minimum tip is ${currentMinAmount.toFixed(2)}
            </p>
          )}
        </div>

        {/* Fee Estimate Display */}
        {estimate && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
              <div className="space-y-2 text-sm">
                <div className="font-medium text-yellow-800">Transaction Fee Summary:</div>
                <div className="space-y-1 text-yellow-700">
                  <div className="flex justify-between">
                    <span>Tip amount:</span>
                    <span>${formData.amount} {formData.currency.toUpperCase()}</span>
                  </div>
                  {estimate.fee_amount && (
                    <div className="flex justify-between">
                      <span>Network fee:</span>
                      <span>${estimate.fee_amount.toFixed(6)} {formData.currency.toUpperCase()}</span>
                    </div>
                  )}
                  <Separator className="bg-yellow-300" />
                  <div className="flex justify-between font-semibold">
                    <span>You Pay:</span>
                    <span>${(formData.amount + (estimate.fee_amount || 0)).toFixed(2)} {formData.currency.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loadingEstimate && (
          <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
            <RefreshCw size={14} className="animate-spin" />
            Calculating fees...
          </div>
        )}

        {/* Settlement Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <Coins size={16} />
            <span className="text-sm font-medium">
              Creator settlement: {formData.currency === 'usd' ? 'USD fiat' : 'Converted to USD'} via NOWPayments
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1 ml-6">
            {formData.currency === 'usd' 
              ? 'Fiat USD payments settled directly to creator'
              : 'USDT (BSC) converted to USD for creator payout'
            }
          </p>
        </div>

        {/* Optional fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name (Optional)
            </label>
            <Input
              value={formData.tipperName}
              onChange={(e) => setFormData(prev => ({ ...prev, tipperName: e.target.value }))}
              placeholder="Anonymous"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Leave a nice message..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleCreatePayment}
        disabled={loading || formData.amount < currentMinAmount || loadingMinAmount}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        size="lg"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Heart className="w-4 h-4 mr-2" />
        )}
        Send Tip
      </Button>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setStep('amount')}
        className="mb-4"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>

      {/* Payment info */}
      {payment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={16} />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Amount info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount to pay:</span>
                <span className="font-semibold">
                  {NowPaymentsService.formatCurrencyAmount(payment.pay_amount, payment.pay_currency)} {payment.pay_currency}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Tip value:</span>
                <span className="text-sm">
                  ${payment.price_amount} {payment.price_currency}
                </span>
              </div>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="text-center">
                <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto w-48 h-48 rounded-lg shadow-md" />
                <p className="text-sm text-gray-600 mt-2">Scan with your crypto wallet</p>
              </div>
            )}

            <Separator />

            {/* Payment address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Address
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={payment.pay_address}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(payment.pay_address)}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 p-4 bg-yellow-50 rounded-lg">
              <Loader2 size={16} className="animate-spin text-yellow-600" />
              <span className="text-sm text-yellow-800">Waiting for payment...</span>
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">How to pay:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Send exactly {NowPaymentsService.formatCurrencyAmount(payment.pay_amount, payment.pay_currency)} {payment.pay_currency}</li>
                <li>Use the address above or scan the QR code</li>
                <li>Payment will be confirmed automatically</li>
                <li>Don't close this window until confirmed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
      >
        <Check size={32} className="text-white" />
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tip Sent Successfully! 🎉</h3>
        <p className="text-gray-600">
          Your {paymentStatus ? `${NowPaymentsService.formatCurrencyAmount(paymentStatus.actually_paid, paymentStatus.pay_currency)} ${paymentStatus.pay_currency}` : 'crypto'} tip has been sent to {creatorName}
        </p>
      </div>

      {formData.message && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-800">
            <strong>Your message:</strong> "{formData.message}"
          </p>
        </div>
      )}

      <Button
        onClick={handleClose}
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        size="lg"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Done
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Heart className="text-pink-500 fill-current" size={24} />
            </motion.div>
            Send a Tip (USD/USDT BSC)
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 'amount' && renderAmountStep()}
            {step === 'payment' && renderPaymentStep()}
            {step === 'confirmation' && renderConfirmationStep()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};