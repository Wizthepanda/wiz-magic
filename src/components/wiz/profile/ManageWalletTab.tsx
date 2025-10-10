import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  ArrowUpRight, 
  Send,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Link2,
  Lock,
  Copy,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  type: 'earned' | 'sent' | 'topped_up';
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
    type: 'sent',
    amount: -50,
    status: 'success',
    description: 'Sent 50 ZAPs to @user',
  },
  {
    id: '3',
    date: 'Oct 4, 2024',
    type: 'topped_up',
    amount: 100,
    status: 'pending',
    description: 'Top Up (Coming Soon)',
  },
];

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
}

const mockUsers: User[] = [
  { id: '1', username: '@cr8r', displayName: 'Cr8r', avatar: '/Profile Pics/FERA.jpg' },
  { id: '2', username: '@techmaster', displayName: 'Tech Master', avatar: '/Profile Pics/Ale.jpg' },
  { id: '3', username: '@wizpanda', displayName: 'Wiz Panda', avatar: '/Profile Pics/Bogdan.jpg' },
];

export const ManageWalletTab = () => {
  const { toast } = useToast();
  const [sendAmount, setSendAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const totalZAPs = 924;

  const filteredUsers = mockUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('https://wizxp.com/ref/cr8r');
    toast({
      title: "Referral link copied! 🔗",
      description: "Share it with friends to earn bonus ZAPs",
    });
  };

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'earned':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-yellow-500" />;
    }
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
          <Card className="border-0 bg-gradient-to-br from-[#06B6D4]/10 to-[#0EA5E9]/10 backdrop-blur-xl shadow-lg relative overflow-hidden">
            {/* Subtle ZAP particle animation */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-[#06B6D4] rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#06B6D4] to-[#0EA5E9] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-slate-600">ZAP Balance</h3>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] bg-clip-text text-transparent">
                {totalZAPs} ZAPs
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
          {/* Top Up ZAPs - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg opacity-60">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-slate-400 opacity-50" />
                  Top Up ZAPs
                </h3>
                
                <Button 
                  className="w-full bg-slate-200 text-slate-500 cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </Button>
                
                <p className="text-xs text-slate-400 text-center mt-3">
                  Top Up ZAPs feature will be available soon.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Send ZAPs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#8B5CF6]" />
                  Send ZAPs
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Send ZAPs to another user on the platform.
                </p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Enter Username"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowUserDropdown(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowUserDropdown(searchQuery.length > 0)}
                      className="border-2 border-slate-200 focus:border-[#8B5CF6] transition-colors"
                    />
                    
                    {/* User Dropdown */}
                    {showUserDropdown && filteredUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                      >
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchQuery(user.username);
                              setShowUserDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                          >
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="text-left">
                              <div className="text-sm font-semibold text-slate-900">
                                {user.username}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.displayName}
                              </div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Selected User Preview */}
                  {selectedUser && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#8B5CF6]/10 to-[#06B6D4]/10 rounded-xl"
                    >
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Sending to {selectedUser.username}
                        </div>
                        <div className="text-xs text-slate-500">
                          {selectedUser.displayName}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Input
                    type="number"
                    placeholder="Amount"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="border-2 border-slate-200 focus:border-[#8B5CF6] transition-colors"
                  />
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:from-[#7C3AED] hover:to-[#0891B2] text-white shadow-lg hover:shadow-xl transition-all"
                      disabled={!selectedUser || !sendAmount}
                    >
                      Send ZAPs
                    </Button>
                  </motion.div>
                  
                  <p className="text-xs text-slate-500 text-center">
                    Transfers are instant and available to verified users only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ZAP Friends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-[#06B6D4]" />
                  ZAP Friends
                </h3>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleCopyReferral}
                    className="w-full bg-gradient-to-r from-[#06B6D4] to-[#0EA5E9] hover:from-[#0891B2] hover:to-[#0284C7] text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy My Referral Link
                  </Button>
                </motion.div>
                
                <p className="text-xs text-slate-500 text-center mt-3">
                  Invite friends and earn bonus ZAPs when they join your communities.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lock ZAPs - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-lg opacity-60 relative overflow-hidden">
              {/* Animated lock pulse */}
              <motion.div
                className="absolute top-4 right-4 opacity-20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Lock className="w-8 h-8 text-slate-400" />
              </motion.div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-slate-400 opacity-50" />
                  Lock ZAPs
                </h3>
                
                <Button 
                  className="w-full bg-slate-200 text-slate-500 cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </Button>
                
                <p className="text-xs text-slate-400 text-center mt-3">
                  Earn double ZAPs when you lock your points.
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
                          {getTransactionIcon(tx.type)}
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
                          tx.amount > 0 ? "text-emerald-600" : "text-blue-600"
                        )}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} ZAPs
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

