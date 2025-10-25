import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Zap,
  Bitcoin,
  Gift,
  Clock,
  Users,
  Lock,
  Globe,
  Shield,
  Crown,
  Sparkles
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useCommunityCreateStore } from '@/store/communityCreateStore';
import { toast } from 'sonner';

const pricingModels = [
  {
    value: 'free',
    label: 'Free',
    description: 'Open to everyone at no cost',
    icon: Gift,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50'
  },
  {
    value: 'free-zaps',
    label: 'Free + ZAPs Reward',
    description: 'Free access with ZAPs for new members',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50'
  },
  {
    value: 'usd',
    label: 'USD Pay',
    description: 'Charge in USD via Stripe',
    icon: DollarSign,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50'
  },
  {
    value: 'zaps',
    label: 'ZAPs Only',
    description: 'Charge in ZAPs only',
    icon: Zap,
    gradient: 'from-violet-500 to-purple-500',
    bgGradient: 'from-violet-50 to-purple-50'
  },
  {
    value: 'zaps-usd',
    label: 'ZAPs + USD',
    description: 'Mixed payment model',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50'
  },
  {
    value: 'crypto',
    label: 'Crypto',
    description: 'Accept USDT, BTC, USDC, DOGE',
    icon: Bitcoin,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50'
  },
  {
    value: 'waitlist',
    label: 'Join Waitlist',
    description: 'Collect emails, launch later',
    icon: Clock,
    gradient: 'from-gray-500 to-slate-500',
    bgGradient: 'from-gray-50 to-slate-50'
  }
];

const accessTypes = [
  {
    value: 'open',
    label: 'Open Access',
    description: 'Anyone can join immediately',
    icon: Globe
  },
  {
    value: 'request',
    label: 'Request to Join',
    description: 'Requires creator approval',
    icon: Lock
  },
  {
    value: 'token-gated',
    label: 'Token Gated',
    description: 'Connect wallet to verify',
    icon: Shield
  }
];

const cryptoOptions = [
  { value: 'usdt', label: 'USDT', icon: '₮' },
  { value: 'btc', label: 'BTC', icon: '₿' },
  { value: 'usdc', label: 'USDC', icon: '$' },
  { value: 'doge', label: 'DOGE', icon: 'Ð' }
];

export const StepMonetization: React.FC = () => {
  const store = useCommunityCreateStore();
  const [newMemberReward, setNewMemberReward] = useState(0);

  // Determine which pricing models support free trial
  const supportsFreeTrialModels = ['usd', 'zaps', 'zaps-usd', 'crypto'];
  const supportsFreeTrialPricing = supportsFreeTrialModels.includes(store.pricingModel);

  // Disable pricing & rewards when waitlist is active
  const isWaitlist = store.pricingModel === 'waitlist';
  const isFreeZaps = store.pricingModel === 'free-zaps';

  // Auto-disable free trial if pricing model doesn't support it
  useEffect(() => {
    if (!supportsFreeTrialPricing && store.freeTrialEnabled) {
      store.setFreeTrialEnabled(false);
    }
  }, [store.pricingModel]);

  const handlePricingModelChange = (model: string) => {
    store.setPricingModel(model as any);

    // Reset amounts when switching models
    if (model === 'free' || model === 'free-zaps' || model === 'waitlist') {
      store.setZapsRequired(0);
      store.setUsdAmount(0);
      store.setCryptoAmount('');
    }
  };

  const toggleCryptoType = (type: 'usdt' | 'btc' | 'usdc' | 'doge') => {
    const current = store.cryptoTypes;
    if (current.includes(type)) {
      store.setCryptoTypes(current.filter(t => t !== type));
    } else {
      store.setCryptoTypes([...current, type]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Pricing Model Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span>Pricing Model</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose how members will access your community
          </p>
        </div>

        <RadioGroup
          value={store.pricingModel}
          onValueChange={handlePricingModelChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {pricingModels.map((model) => {
            const Icon = model.icon;
            const isSelected = store.pricingModel === model.value;

            return (
              <motion.label
                key={model.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative cursor-pointer rounded-2xl border-2 transition-all duration-300",
                  isSelected
                    ? "border-purple-500 bg-gradient-to-br shadow-lg"
                    : "border-gray-200 hover:border-purple-300 bg-white",
                  isSelected && model.bgGradient
                )}
              >
                <RadioGroupItem value={model.value} className="sr-only" />

                {/* Glow Effect for Selected */}
                {isSelected && (
                  <motion.div
                    layoutId="selectedPricing"
                    className={cn(
                      "absolute -inset-1 rounded-2xl blur-lg opacity-30",
                      `bg-gradient-to-r ${model.gradient}`
                    )}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      `bg-gradient-to-br ${model.gradient}`
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className={cn(
                      "font-semibold text-sm",
                      isSelected ? "text-gray-900" : "text-gray-700"
                    )}>
                      {model.label}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                  </div>
                </div>
              </motion.label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Pricing Configuration */}
      {!isWaitlist && store.pricingModel !== 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6 space-y-6">
              {/* USD Amount */}
              {(store.pricingModel === 'usd' || store.pricingModel === 'zaps-usd') && (
                <div className="space-y-2">
                  <Label htmlFor="usdAmount" className="text-base font-semibold flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>USD Amount</span>
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <Input
                      id="usdAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={store.usdAmount || ''}
                      onChange={(e) => store.setUsdAmount(parseFloat(e.target.value) || 0)}
                      className="pl-7 text-lg font-semibold"
                    />
                  </div>
                  <p className="text-xs text-gray-600">One-time payment via Stripe</p>
                </div>
              )}

              {/* ZAPs Amount */}
              {(store.pricingModel === 'zaps' || store.pricingModel === 'zaps-usd' || store.pricingModel === 'free-zaps') && (
                <div className="space-y-2">
                  <Label htmlFor="zapsAmount" className="text-base font-semibold flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-600 fill-purple-600" />
                    <span>{isFreeZaps ? 'New Member ZAPs Reward' : 'ZAPs Required'}</span>
                    {!isFreeZaps && <Badge variant="secondary" className="text-xs">Required</Badge>}
                  </Label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600 fill-purple-600" />
                    <Input
                      id="zapsAmount"
                      type="number"
                      min="0"
                      step="10"
                      placeholder="0"
                      value={store.zapsRequired || ''}
                      onChange={(e) => store.setZapsRequired(parseInt(e.target.value) || 0)}
                      className="pl-10 text-lg font-semibold"
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {isFreeZaps ? 'Reward members with ZAPs when they join' : 'Amount of ZAPs members must pay'}
                  </p>
                </div>
              )}

              {/* Crypto Configuration */}
              {store.pricingModel === 'crypto' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Accepted Cryptocurrencies</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {cryptoOptions.map((crypto) => (
                        <label
                          key={crypto.value}
                          className={cn(
                            "flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                            store.cryptoTypes.includes(crypto.value as any)
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-orange-300"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={store.cryptoTypes.includes(crypto.value as any)}
                            onChange={() => toggleCryptoType(crypto.value as any)}
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-6 h-6 rounded border-2 flex items-center justify-center",
                            store.cryptoTypes.includes(crypto.value as any)
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300"
                          )}>
                            {store.cryptoTypes.includes(crypto.value as any) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3 h-3 bg-white rounded-sm"
                              />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{crypto.icon}</span>
                            <span className="font-medium">{crypto.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cryptoAmount">Crypto Amount</Label>
                    <Input
                      id="cryptoAmount"
                      placeholder="0.001"
                      value={store.cryptoAmount}
                      onChange={(e) => store.setCryptoAmount(e.target.value)}
                    />
                    <p className="text-xs text-gray-600">Amount to charge (will apply to all selected cryptos)</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Free Trial Toggle */}
      {supportsFreeTrialPricing && !isWaitlist && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Free Trial</h4>
                    <p className="text-xs text-gray-600">Let members try before they commit</p>
                  </div>
                </div>
                <Switch
                  checked={store.freeTrialEnabled}
                  onCheckedChange={store.setFreeTrialEnabled}
                  className={cn(
                    "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                  )}
                />
              </div>

              {store.freeTrialEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-purple-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Trial Duration (Days)</Label>
                      <Badge variant="secondary">{store.freeTrialDays} days</Badge>
                    </div>
                    <Slider
                      value={[store.freeTrialDays]}
                      onValueChange={(val) => store.setFreeTrialDays(val[0])}
                      min={1}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 day</span>
                      <span>30 days</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Access Type */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <span>Access Type</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Control how members can join your community
          </p>
        </div>

        <RadioGroup
          value={store.accessType}
          onValueChange={(val) => store.setAccessType(val as any)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {accessTypes.map((access) => {
            const Icon = access.icon;
            const isSelected = store.accessType === access.value;

            return (
              <motion.label
                key={access.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative cursor-pointer rounded-xl border-2 transition-all p-5",
                  isSelected
                    ? "border-purple-500 bg-purple-50 shadow-lg"
                    : "border-gray-200 hover:border-purple-300 bg-white"
                )}
              >
                <RadioGroupItem value={access.value} className="sr-only" />

                {isSelected && (
                  <motion.div
                    layoutId="selectedAccess"
                    className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-20"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className={cn(
                      "w-8 h-8",
                      isSelected ? "text-purple-600" : "text-gray-500"
                    )} />
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-semibold text-sm",
                      isSelected ? "text-purple-900" : "text-gray-700"
                    )}>
                      {access.label}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">{access.description}</p>
                  </div>
                </div>
              </motion.label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-900">Monetization Summary</h4>
              <div className="space-y-1 text-sm">
                <p className="text-purple-800">
                  <span className="font-medium">Model:</span>{' '}
                  {pricingModels.find(p => p.value === store.pricingModel)?.label}
                </p>
                {store.pricingModel === 'usd' && (
                  <p className="text-purple-800">
                    <span className="font-medium">Price:</span> ${store.usdAmount}
                  </p>
                )}
                {store.pricingModel === 'zaps' && (
                  <p className="text-purple-800">
                    <span className="font-medium">Price:</span> {store.zapsRequired} ZAPs
                  </p>
                )}
                {store.pricingModel === 'zaps-usd' && (
                  <p className="text-purple-800">
                    <span className="font-medium">Price:</span> {store.zapsRequired} ZAPs + ${store.usdAmount}
                  </p>
                )}
                {store.freeTrialEnabled && (
                  <p className="text-purple-800">
                    <span className="font-medium">Free Trial:</span> {store.freeTrialDays} days
                  </p>
                )}
                <p className="text-purple-800">
                  <span className="font-medium">Access:</span>{' '}
                  {accessTypes.find(a => a.value === store.accessType)?.label}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
