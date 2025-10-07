import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Wallet, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  type: 'earned' | 'converted' | 'withdrawn' | 'topped_up';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  description: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: 'Oct 6, 2024',
    type: 'earned',
    amount: 12,
    status: 'success',
    description: 'Watched "Advanced React Patterns"',
  },
  {
    id: '2',
    date: 'Oct 5, 2024',
    type: 'converted',
    amount: -50,
    status: 'success',
    description: 'ZAPs → $5.00 USD',
  },
  {
    id: '3',
    date: 'Oct 4, 2024',
    type: 'topped_up',
    amount: 100,
    status: 'pending',
    description: 'Top Up Purchase',
  },
];

export const ManageWalletTab = () => {
  const [convertAmount, setConvertAmount] = useState([50]);
  const totalZAPs = 92;
  const walletBalance = 92.40;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-500/10 text-green-700 border-green-200',
      pending: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
      failed: 'bg-red-500/10 text-red-700 border-red-200',
    };

    return (
      <Badge className={cn('border', styles[status as keyof typeof styles])}>
        {status === 'pending' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mr-1"
          >
            ●
          </motion.div>
        )}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header - Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-gradient-to-br from-[#06B6D4]/10 to-[#0EA5E9]/10 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#0EA5E9] flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-slate-600">Wallet Balance</h3>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] bg-clip-text text-transparent">
                ${walletBalance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-slate-600">Total ZAPs</h3>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {totalZAPs}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-50 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-slate-600">This Month</h3>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                +24 ZAPs
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Actions */}
        <div className="space-y-6">
          {/* Top Up ZAPs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-[#06B6D4]" />
                  Top Up ZAPs
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[50, 100, 200].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className="border-2 border-slate-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5"
                      >
                        {amount} ZAPs
                      </Button>
                    ))}
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] hover:from-[#0891B2] hover:to-[#0284C7] text-white shadow-lg">
                    Purchase ZAPs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Convert ZAPs → USD */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Convert ZAPs → USD
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-600">Amount</span>
                      <span className="text-lg font-bold text-slate-900">
                        {convertAmount[0]} ZAPs → ${(convertAmount[0] * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={convertAmount}
                      onValueChange={setConvertAmount}
                      max={totalZAPs}
                      step={1}
                      className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[#06B6D4] [&_[role=slider]]:to-[#0EA5E9]"
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                    disabled={convertAmount[0] === 0}
                  >
                    Convert Now
                  </Button>
                  
                  <p className="text-xs text-slate-500 text-center">
                    Conversion rate: 1 ZAP = $0.10 USD
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Withdraw */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg opacity-60">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-slate-400" />
                  Withdraw Funds
                </h3>
                
                <Button 
                  className="w-full bg-slate-200 text-slate-500 cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </Button>
                
                <p className="text-xs text-slate-400 text-center mt-3">
                  Withdrawal feature will be available soon
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Transaction History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#06B6D4]" />
                Transaction History
              </h3>

              <div className="space-y-3">
                {mockTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 rounded-xl bg-white/60 hover:bg-white/80 transition-colors border border-slate-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(tx.status)}
                          <h4 className="font-semibold text-slate-900 text-sm">
                            {tx.description}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{tx.date}</span>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={cn(
                          "text-lg font-bold",
                          tx.amount > 0 ? "text-emerald-600" : "text-slate-900"
                        )}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} 
                          {tx.type === 'converted' ? '' : ' ZAPs'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 border-slate-300 hover:bg-slate-50"
              >
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Animated coin effect */}
      <motion.div
        className="fixed bottom-20 right-20 pointer-events-none"
        animate={{
          rotate: [0, 360],
          y: [0, -10, 0],
        }}
        transition={{
          rotate: { duration: 10, repeat: Infinity, ease: "linear" },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Zap className="w-12 h-12 text-yellow-400 fill-yellow-400 opacity-20" />
      </motion.div>
    </motion.div>
  );
};

