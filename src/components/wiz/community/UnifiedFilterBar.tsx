import React from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Trophy, Package, Gift, Zap, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedFilterBarProps {
  mainFilter: string;
  onMainFilterChange: (filter: string) => void;
  subFilter: string;
  onSubFilterChange: (filter: string) => void;
}

const mainFilters = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'courses', label: 'Courses', icon: GraduationCap },
  { id: 'coaching', label: 'Coaching', icon: Trophy },
  { id: 'products', label: 'Digital Products', icon: Package }
];

const subFilters = [
  { id: 'all', label: 'All', gradient: 'from-gray-500 to-gray-600' },
  { id: 'free', label: 'Free', gradient: 'from-green-500 to-emerald-600' },
  { id: 'free-zaps', label: 'Free ZAPs', gradient: 'from-blue-500 to-cyan-500', glow: true },
  { id: 'paid', label: 'Paid', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'paid-zaps', label: 'Paid ZAPs', gradient: 'from-purple-500 to-violet-600', glow: true },
  { id: 'zaps-usd', label: 'ZAPs + USD', gradient: 'from-purple-500 via-yellow-500 to-cyan-500', glow: true }
];

export const UnifiedFilterBar: React.FC<UnifiedFilterBarProps> = ({
  mainFilter,
  onMainFilterChange,
  subFilter,
  onSubFilterChange
}) => {
  return (
    <div className="space-y-4">
      {/* Main Filters - Row 1 */}
      <div>
        <label className="text-sm font-semibold text-gray-400 mb-3 block">Main Filters</label>
        <div className="flex gap-3 flex-wrap">
          {mainFilters.map((filter) => {
            const IconComponent = filter.icon;
            const isActive = mainFilter === filter.id;

            return (
              <motion.button
                key={filter.id}
                onClick={() => onMainFilterChange(filter.id)}
                className={cn(
                  "group relative flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all duration-300 overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                )}
                whileHover={{ scale: 1.05, rotateY: isActive ? 0 : 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow effect for active filter */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-50 blur-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <IconComponent className={cn(
                  "w-4 h-4 relative z-10",
                  isActive && "drop-shadow-lg"
                )} />
                <span className="relative z-10">{filter.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sub Filters - Row 2 */}
      <div>
        <label className="text-sm font-semibold text-gray-400 mb-3 block">Sub Filters</label>
        <div className="flex gap-3 flex-wrap">
          {subFilters.map((filter) => {
            const isActive = subFilter === filter.id;

            return (
              <motion.button
                key={filter.id}
                onClick={() => onSubFilterChange(filter.id)}
                className={cn(
                  "group relative flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all duration-300 overflow-hidden",
                  isActive
                    ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg`
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Electric glow for ZAP-related filters */}
                {isActive && filter.glow && (
                  <motion.div
                    className={cn(
                      "absolute inset-0 blur-xl opacity-50",
                      `bg-gradient-to-r ${filter.gradient}`
                    )}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Icon based on filter type */}
                {filter.id === 'free' && <Gift className="w-4 h-4 relative z-10" />}
                {filter.id === 'free-zaps' && (
                  <Zap className={cn(
                    "w-4 h-4 relative z-10",
                    isActive && "fill-current drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                  )} />
                )}
                {filter.id === 'paid' && <DollarSign className="w-4 h-4 relative z-10" />}
                {filter.id === 'paid-zaps' && (
                  <Zap className={cn(
                    "w-4 h-4 relative z-10",
                    isActive && "fill-current drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                  )} />
                )}
                {filter.id === 'zaps-usd' && (
                  <div className="flex items-center gap-0.5 relative z-10">
                    <Zap className={cn(
                      "w-3.5 h-3.5",
                      isActive && "fill-current drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                    )} />
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                )}

                <span className="relative z-10">{filter.label}</span>

                {/* Shimmer effect for split payment */}
                {isActive && filter.id === 'zaps-usd' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UnifiedFilterBar;
