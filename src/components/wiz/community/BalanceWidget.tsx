import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BalanceWidgetProps {
  zapBalance?: number;
  className?: string;
  onSendZaps?: () => void;
}

export const BalanceWidget: React.FC<BalanceWidgetProps> = ({
  zapBalance = 0,
  className = "",
  onSendZaps
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.button
          aria-label="Your balance"
          className={cn(
            "relative w-14 h-14 rounded-full bg-gradient-to-br from-[#a855f7]/40 to-[#6366f1]/40 backdrop-blur-xl border border-white/40 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105",
            className
          )}
          style={{
            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.4), 0 4px 20px rgba(168,85,247,0.15)'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated ZAP Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-6 h-6 text-white fill-current drop-shadow-md" />
          </motion.div>
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[280px] rounded-2xl p-4 bg-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl border border-white/40 z-50"
        align="end"
        sideOffset={16}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Balance Header */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-700 font-semibold text-sm">Your Balance</span>
              <motion.span
                key={zapBalance}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-violet-600 font-bold text-lg"
              >
                {zapBalance.toLocaleString()} ZAPs
              </motion.span>
            </div>

            {/* Earned / Spent with Send icons */}
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Earned</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">+{Math.floor(zapBalance * 0.6).toLocaleString()}</span>
                  <button
                    onClick={() => {
                      onSendZaps?.();
                      setIsOpen(false);
                    }}
                    className="p-1 hover:bg-violet-50 rounded transition-colors"
                    aria-label="Send earned ZAPs"
                  >
                    <Send className="w-4 h-4 text-violet-500 hover:text-violet-600" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Spent</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">-{Math.floor(zapBalance * 0.4).toLocaleString()}</span>
                  <button
                    onClick={() => {
                      onSendZaps?.();
                      setIsOpen(false);
                    }}
                    className="p-1 hover:bg-violet-50 rounded transition-colors"
                    aria-label="Send ZAPs"
                  >
                    <Send className="w-4 h-4 text-violet-500 hover:text-violet-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Recent activity updated just now</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};

export default BalanceWidget;
