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
type TipCurrency = 'usd' | 'usdtbsc' | 'btc' | 'usdc' | 'doge';

interface CoinConfig {
  id: TipCurrency;
  name: string;
  symbol: string;
  network?: string;
  icon: React.ComponentType<any>;
  color: string;
  isStablecoin: boolean;
  quickAmounts: number[];
  decimals: number;
  prefix: string;
}

interface TipFormData {
  amount: number;
  currency: TipCurrency;
  payCurrency: TipCurrency;
  tipperName: string;
  message: string;
  settleInUsd: boolean;
}

// Coin configurations
const coinConfigs: CoinConfig[] = [
  {
    id: 'usd',
    name: 'US Dollar',
    symbol: 'USD',
    icon: DollarSign,
    color: 'text-green-600',
    isStablecoin: true,
    quickAmounts: [3, 5, 10, 25],
    decimals: 2,
    prefix: '$'
  },
  {
    id: 'usdtbsc',
    name: 'Tether USD',
    symbol: 'USDT',
    network: 'BSC',
    icon: Coins,
    color: 'text-orange-500',
    isStablecoin: true,
    quickAmounts: [3, 5, 10, 25],
    decimals: 2,
    prefix: '$'
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    icon: Bitcoin,
    color: 'text-orange-600',
    isStablecoin: false,
    quickAmounts: [0.0002, 0.0005, 0.001, 0.002],
    decimals: 8,
    prefix: '₿'
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    network: 'ERC20',
    icon: Coins,
    color: 'text-blue-600',
    isStablecoin: true,
    quickAmounts: [3, 5, 10, 25],
    decimals: 2,
    prefix: '$'
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    network: 'Dogecoin',
    icon: Heart,
    color: 'text-yellow-500',
    isStablecoin: false,
    quickAmounts: [10, 25, 50, 100],
    decimals: 2,
    prefix: 'Ð'
  }
];

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
  const [minAmounts, setMinAmounts] = useState<Record<string, number>>({});
  const [currentMinAmount, setCurrentMinAmount] = useState<number>(0);
  const [selectedCoin, setSelectedCoin] = useState<CoinConfig>(coinConfigs[1]); // Default to USDT
  const [estimate, setEstimate] = useState<PaymentEstimate | null>(null);
  const [payment, setPayment] = useState<CreatePaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Load minimum amounts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMinimumAmounts();
    }
  }, [isOpen]);

  // Update minimum amount and selected coin when currency changes
  useEffect(() => {
    const key = `${formData.currency}_to_usd`;
    const minAmount = minAmounts[key] || 0;
    setCurrentMinAmount(minAmount);
    
    // Update selected coin to match currency
    const coin = coinConfigs.find(c => c.id === formData.currency);
    if (coin) {
      setSelectedCoin(coin);
    }
    
    // Update amount if current amount is below minimum
    if (formData.amount < minAmount && minAmount > 0) {
      const newAmount = Math.max(minAmount * 1.1, coin?.quickAmounts[0] || minAmount);
      setFormData(prev => ({ ...prev, amount: newAmount }));
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
      
      // Load minimum amounts for all supported coins
      const promises = coinConfigs.map(async (coin) => {
        try {
          const response = await NowPaymentsService.getMinAmount(coin.id, 'usd');
          return { coin: coin.id, minAmount: response.min_amount };
        } catch (error) {
          console.error(`Error loading minimum for ${coin.id}:`, error);
          // Set reasonable defaults based on coin type
          const defaultMin = coin.isStablecoin ? 1.5 : (coin.id === 'btc' ? 0.0001 : 5);
          return { coin: coin.id, minAmount: defaultMin };
        }
      });

      const results = await Promise.all(promises);
      const newMinAmounts: Record<string, number> = {};
      
      results.forEach(({ coin, minAmount }) => {
        newMinAmounts[`${coin}_to_usd`] = minAmount;
      });

      setMinAmounts(newMinAmounts);
    } catch (error) {
      console.error('Error loading minimum amounts:', error);
      // Set reasonable defaults for all coins
      const defaultAmounts: Record<string, number> = {};
      coinConfigs.forEach(coin => {
        const defaultMin = coin.isStablecoin ? 1.5 : (coin.id === 'btc' ? 0.0001 : 5);
        defaultAmounts[`${coin.id}_to_usd`] = defaultMin;
      });
      setMinAmounts(defaultAmounts);
      
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

  const handleCoinSelection = (coin: CoinConfig) => {
    setSelectedCoin(coin);
    const minAmount = minAmounts[`${coin.id}_to_usd`] || 0;
    
    // Set appropriate default amount for the coin
    let defaultAmount = coin.quickAmounts[0];
    if (defaultAmount < minAmount) {
      defaultAmount = minAmount * 1.1; // 10% above minimum
    }

    setFormData(prev => ({
      ...prev,
      currency: coin.id,
      payCurrency: coin.id,
      amount: defaultAmount
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

  const renderAmountStepContent = () => (
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

      {/* Coin Selection Panel */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Choose Payment Method
        </label>
        
        {/* Coin Selection Grid */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {coinConfigs.map((coin) => {
            const IconComponent = coin.icon;
            const isSelected = selectedCoin.id === coin.id;
            
            return (
              <Button
                key={coin.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleCoinSelection(coin)}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-3 px-2",
                  isSelected && "bg-gradient-to-r from-purple-500 to-pink-500 border-transparent"
                )}
                title={`${coin.name}${coin.network ? ` (${coin.network})` : ''}`}
              >
                <IconComponent 
                  size={18} 
                  className={isSelected ? "text-white" : coin.color}
                />
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? "text-white" : "text-gray-700"
                )}>
                  {coin.symbol}
                  {coin.network && (
                    <span className="block text-[10px] opacity-70">
                      {coin.network}
                    </span>
                  )}
                </span>
              </Button>
            );
          })}
        </div>
        
        {/* Selected Coin Info */}
        <div className="text-xs text-gray-600 px-2 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <selectedCoin.icon size={14} className={selectedCoin.color} />
            <span className="font-medium">
              {selectedCoin.name} 
              {selectedCoin.network && ` (${selectedCoin.network})`}
            </span>
          </div>
          <p>
            {selectedCoin.id === 'usd' 
              ? "Tip in USD fiat equivalent via NOWPayments fiat settlements"
              : `${selectedCoin.name} converted to USD for creator payout`
            }
          </p>
        </div>
        
        {/* Minimum Amount Display */}
        {loadingMinAmount ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={14} className="animate-spin" />
            Loading minimum amounts...
          </div>
        ) : currentMinAmount > 0 && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <selectedCoin.icon size={16} className={selectedCoin.color} />
              <span className="font-medium">
                Minimum tip: {selectedCoin.prefix}{currentMinAmount.toFixed(selectedCoin.decimals)} {selectedCoin.symbol}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Amount selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tip Amount ({selectedCoin.symbol})
          </label>
          
          {/* Quick Select Amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {selectedCoin.quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant={formData.amount === amount ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, amount }))}
                className={formData.amount === amount ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                disabled={amount < currentMinAmount}
              >
                {selectedCoin.prefix}{amount.toFixed(selectedCoin.decimals === 8 ? 4 : selectedCoin.decimals)}
              </Button>
            ))}
          </div>
          
          {/* Custom Amount Input */}
          <div className="relative">
            <selectedCoin.icon 
              className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2", 
                selectedCoin.color
              )} 
              size={16} 
            />
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="pl-10"
              placeholder={`Custom amount (${selectedCoin.symbol})`}
              min={currentMinAmount}
              step={selectedCoin.id === 'btc' ? '0.00001' : '0.01'}
            />
          </div>
          
          {/* Validation Messages */}
          {formData.amount < currentMinAmount && formData.amount > 0 && (
            <p className="text-sm text-red-600 mt-1">
              Minimum tip is {selectedCoin.prefix}{currentMinAmount.toFixed(selectedCoin.decimals)} {selectedCoin.symbol}
            </p>
          )}
          
          {/* Fee Information */}
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-1">
              <AlertCircle size={12} />
              <span>Sender pays network + transaction fees</span>
            </div>
          </div>
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
                    <span className="flex items-center gap-1">
                      <selectedCoin.icon size={12} className={selectedCoin.color} />
                      {selectedCoin.prefix}{formData.amount.toFixed(selectedCoin.decimals)} {selectedCoin.symbol}
                    </span>
                  </div>
                  {estimate.fee_amount && (
                    <div className="flex justify-between">
                      <span>Network fee:</span>
                      <span className="flex items-center gap-1">
                        <selectedCoin.icon size={12} className={selectedCoin.color} />
                        {selectedCoin.prefix}{estimate.fee_amount.toFixed(selectedCoin.decimals)} {selectedCoin.symbol}
                      </span>
                    </div>
                  )}
                  <Separator className="bg-yellow-300" />
                  <div className="flex justify-between font-semibold">
                    <span>You Pay:</span>
                    <span className="flex items-center gap-1">
                      <selectedCoin.icon size={12} className={selectedCoin.color} />
                      {selectedCoin.prefix}{(formData.amount + (estimate.fee_amount || 0)).toFixed(selectedCoin.decimals)} {selectedCoin.symbol}
                    </span>
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
              Creator settlement: Converted to USD via NOWPayments
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1 ml-6 flex items-center gap-1">
            <selectedCoin.icon size={12} className={selectedCoin.color} />
            {selectedCoin.id === 'usd' 
              ? 'USD payments settled directly to creator'
              : `${selectedCoin.name} converted to USD for creator payout`
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
    </div>
  );

  const renderPaymentStepContent = () => (
    <div className="space-y-6">
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

  const renderConfirmationStepContent = () => (
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
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[95vh] mx-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl h-auto flex flex-col p-0 sm:max-w-lg sm:w-full sm:max-h-[90vh] md:max-w-xl">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Heart className="text-pink-500 fill-current" size={24} />
            </motion.div>
            Send a Tip (Multi-Coin)
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-0 pb-4"
            >
              {step === 'amount' && renderAmountStepContent()}
              {step === 'payment' && renderPaymentStepContent()}
              {step === 'confirmation' && renderConfirmationStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fixed Footer */}
        {step === 'amount' && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white/95">
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
        )}

        {step === 'payment' && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white/95">
            <Button
              variant="ghost"
              onClick={() => setStep('amount')}
              className="w-full"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Amount Selection
            </Button>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white/95">
            <Button
              variant="default"
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};