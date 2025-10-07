import React from "react";
import { motion } from "framer-motion";
import { Users, GraduationCap, Trophy, Package, Gift, Zap, DollarSign, Sparkles, Heart } from "lucide-react";
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
  { id: 'zaps-usd', label: 'ZAPs + USD', gradient: 'from-purple-500 via-yellow-500 to-cyan-500', glow: true },
  { id: 'my-communities', label: '💜 My Communities', gradient: 'from-[#8B5CF6] to-[#3B82F6]', glow: true, personal: true }
];

export const UnifiedFilterBar: React.FC<UnifiedFilterBarProps> = ({
  mainFilter,
  onMainFilterChange,
  subFilter,
  onSubFilterChange
}) => {
  return (
    <div className="space-y-4 mt-10">
      {/* Main Filters - Row 1 */}
      <div className="flex flex-wrap gap-3">
        {mainFilters.map((filter) => {
          const IconComponent = filter.icon;
          const isActive = mainFilter === filter.id;

          return (
            <motion.button
              key={filter.id}
              onClick={() => onMainFilterChange(filter.id)}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-lg border border-white/40 text-sm font-medium transition-all duration-300",
                isActive
                  ? "text-violet-600 shadow-[0_2px_12px_rgba(99,102,241,0.15)]"
                  : "text-gray-700 hover:text-violet-600 hover:shadow-[0_2px_12px_rgba(99,102,241,0.15)]"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isActive}
            >
              <span className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                {filter.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Sub Filters - Row 2 */}
      <div className="flex flex-wrap gap-2">
        {subFilters.map((filter) => {
          const isActive = subFilter === filter.id;
          const isPersonal = filter.id === 'my-communities';

          return (
            <motion.button
              key={filter.id}
              onClick={() => onSubFilterChange(filter.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-300",
                isActive && isPersonal
                  ? "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white border-transparent shadow-[0_0_16px_rgba(139,92,246,0.4)]"
                  : isActive
                  ? "bg-gradient-to-br from-[#ede9fe] to-[#e0e7ff] border-violet-200 text-violet-600"
                  : "bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border-gray-200 text-gray-500 hover:from-[#ede9fe] hover:to-[#e0e7ff] hover:text-violet-600"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              aria-pressed={isActive}
            >
              <span className="flex items-center gap-1.5">
                {/* Icon based on filter type */}
                {filter.id === 'free' && <Gift className="w-3.5 h-3.5" />}
                {filter.id === 'free-zaps' && <Zap className="w-3.5 h-3.5 fill-current" />}
                {filter.id === 'paid' && <DollarSign className="w-3.5 h-3.5" />}
                {filter.id === 'paid-zaps' && <Zap className="w-3.5 h-3.5 fill-current" />}
                {filter.id === 'zaps-usd' && (
                  <>
                    <Zap className="w-3 h-3 fill-current" />
                    <DollarSign className="w-3 h-3" />
                  </>
                )}
                {filter.id === 'my-communities' && <Heart className="w-3.5 h-3.5 fill-current" />}
                {filter.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedFilterBar;
