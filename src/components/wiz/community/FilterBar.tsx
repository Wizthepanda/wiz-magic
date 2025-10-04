import React from "react";
import { motion } from "framer-motion";
import { Search, Zap, DollarSign, Gift, Users, BookOpen, GraduationCap, Trophy, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedRewardType?: string;
  onRewardTypeChange?: (type: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const rewardTypes = [
  { id: 'all', label: 'All', icon: Gift },
  { id: 'zaps', label: 'ZAPs Only', icon: Zap },
  { id: 'split', label: 'ZAPs + USD', icon: DollarSign },
  { id: 'free', label: 'Free', icon: Gift }
];

const categories = [
  { id: 'all', label: 'All', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { id: 'communities', label: 'Communities', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 'courses', label: 'Courses', icon: GraduationCap, color: 'from-indigo-500 to-purple-500' },
  { id: 'coaching', label: 'Coaching', icon: Trophy, color: 'from-orange-500 to-red-500' },
  { id: 'products', label: 'Digital Products', icon: Package, color: 'from-green-500 to-emerald-500' }
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  selectedRewardType = 'all',
  onRewardTypeChange,
  selectedCategory = 'all',
  onCategoryChange
}) => {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl"
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search communities, creators, skills..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-500 text-base shadow-sm"
        />
      </motion.div>

      {/* Reward Type Filters - Single select row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <label className="text-sm font-semibold text-gray-700">Reward Type</label>
        <div className="flex gap-3 flex-wrap">
          {rewardTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <motion.button
                key={type.id}
                onClick={() => onRewardTypeChange?.(type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border backdrop-blur-sm",
                  selectedRewardType === type.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-lg'
                    : 'bg-white/70 text-gray-700 border-white/60 hover:border-purple-300 hover:bg-white/90'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-4 h-4" />
                <span>{type.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Category Filters - Horizontal scroll row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <label className="text-sm font-semibold text-gray-700">Category</label>
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
          <div className="flex gap-3 pb-2 min-w-max">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => onCategoryChange?.(category.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 backdrop-blur-sm whitespace-nowrap",
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                      : 'bg-white/70 text-gray-700 border-white/60 hover:border-white/80 hover:bg-white/90'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow: selectedCategory === category.id
                      ? '0 8px 25px rgba(139, 92, 246, 0.3)'
                      : '0 2px 10px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterBar;
