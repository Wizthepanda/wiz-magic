/**
 * Per-Video Category Selector
 *
 * Compact category/subcategory selector designed for individual video cards.
 * Features liquid-glass aesthetic with dropdown selectors.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';

interface PerVideoCategorySelectorProps {
  videoId: string;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (videoId: string, category: string) => void;
  onSelectSubcategory: (videoId: string, subcategory: string) => void;
  className?: string;
}

export const PerVideoCategorySelector: React.FC<PerVideoCategorySelectorProps> = ({
  videoId,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  className,
}) => {
  const selectedCategoryData = CATEGORIES.find(cat => cat.value === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-2', className)}
    >
      {/* Info Tooltip */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
        <Tag className="w-3 h-3" />
        <span className="font-medium">Category & Subcategory</span>
        <span className="text-red-500">*</span>
      </div>

      {/* Category & Subcategory Dropdowns */}
      <div className="flex gap-2">
        {/* Main Category Dropdown */}
        <div className="flex-1">
          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              onSelectCategory(videoId, e.target.value);
            }}
            className={cn(
              'w-full px-3 py-2 rounded-xl text-sm font-medium',
              'bg-white/10 backdrop-blur-md border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              selectedCategory
                ? 'text-purple-700 border-purple-300 bg-purple-50/50 focus:ring-purple-400/40'
                : 'text-gray-600 border-white/20 hover:border-purple-200 focus:ring-purple-300/30'
            )}
          >
            <option value="">Category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Dropdown (appears when category selected) */}
        <AnimatePresence mode="wait">
          {selectedCategory && selectedCategoryData && (
            <motion.div
              key={`${videoId}-subcategory`}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <select
                value={selectedSubcategory || ''}
                onChange={(e) => onSelectSubcategory(videoId, e.target.value)}
                className={cn(
                  'w-full px-3 py-2 rounded-xl text-sm font-medium',
                  'bg-white/10 backdrop-blur-md border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-1',
                  selectedSubcategory
                    ? 'text-pink-700 border-pink-300 bg-pink-50/50 focus:ring-pink-400/40'
                    : 'text-gray-600 border-white/20 hover:border-pink-200 focus:ring-pink-300/30'
                )}
              >
                <option value="">Subcategory...</option>
                {selectedCategoryData.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selection Preview Pills */}
      {selectedCategory && selectedSubcategory && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-1.5 flex-wrap"
        >
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
            {selectedCategoryData?.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-pink-100 to-pink-50 text-pink-700 text-xs font-semibold border border-pink-200">
            {selectedSubcategory}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PerVideoCategorySelector;
