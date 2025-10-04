import React from "react";
import { motion } from "framer-motion";
import { Zap, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BalanceWidgetProps {
  zapBalance?: number;
  className?: string;
  onAddZaps?: () => void;
}

export const BalanceWidget: React.FC<BalanceWidgetProps> = ({
  zapBalance = 0,
  className = "",
  onAddZaps
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className={cn("cursor-pointer", className)}
        >
          <div className="px-6 py-3 rounded-2xl border border-white/30 shadow-lg backdrop-blur-md bg-gradient-to-br from-purple-50/90 to-indigo-50/90 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <div className="text-xs text-gray-600 font-medium">Your Balance</div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ⚡ {zapBalance.toLocaleString()} ZAPs
                </div>
              </div>
            </div>

            {/* Floating sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${10 + i * 20}%`,
                }}
                animate={{
                  y: [-10, -20, -10],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </div>
        </motion.div>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 bg-white/95 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl overflow-hidden"
        align="end"
      >
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <h3 className="font-bold text-gray-900">ZAP Wallet</h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage your balance</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
          </div>

          {/* Balance Display */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
            <div className="text-sm text-gray-600 mb-1">Available Balance</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ⚡ {zapBalance.toLocaleString()}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-green-50 border border-green-100">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Earned</span>
              </div>
              <div className="text-lg font-bold text-green-800">+{Math.floor(zapBalance * 0.3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Spent</span>
              </div>
              <div className="text-lg font-bold text-blue-800">{Math.floor(zapBalance * 0.1)}</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-700">Recent Activity</div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {[
                { type: 'earned', amount: 100, desc: 'Video completion' },
                { type: 'spent', amount: -50, desc: 'Community join' },
                { type: 'earned', amount: 25, desc: 'Daily bonus' }
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm py-1.5">
                  <span className="text-gray-600 text-xs">{activity.desc}</span>
                  <span className={cn(
                    "font-semibold",
                    activity.type === 'earned' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {activity.amount > 0 ? '+' : ''}{activity.amount} ⚡
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add ZAPs Button */}
          <Button
            onClick={() => {
              onAddZaps?.();
              setIsOpen(false);
            }}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add ZAPs
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BalanceWidget;
