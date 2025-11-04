/**
 * TagPreviewPills - Live Tag Preview Component
 *
 * Shows the selected category and subcategory as animated pills.
 * Updates in real-time as user makes selections.
 * Features fly-in animations for new tags.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/categories';

interface TagPreviewPillsProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  className?: string;
}

export const TagPreviewPills: React.FC<TagPreviewPillsProps> = ({
  selectedCategory,
  selectedSubcategory,
  className,
}) => {
  const categoryData = CATEGORIES.find((cat) => cat.value === selectedCategory);
  const categoryLabel = categoryData?.label;

  const hasTags = selectedCategory && selectedSubcategory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-xl border-2 border-purple-200/50 p-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Tag className="w-5 h-5 text-purple-600" />
          {hasTags && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-3 h-3 text-pink-500 fill-pink-500" />
            </motion.div>
          )}
        </div>
        <h3 className="font-semibold text-gray-800">Discovery Tags</h3>
      </div>

      {/* Tag Pills Container */}
      <div className="min-h-[60px] flex flex-wrap gap-2 items-center">
        <AnimatePresence mode="popLayout">
          {!hasTags && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500 italic"
            >
              Select category and subcategory to preview tags
            </motion.div>
          )}

          {selectedCategory && categoryLabel && (
            <TagPill
              key={`category-${selectedCategory}`}
              label={categoryLabel}
              type="category"
            />
          )}

          {selectedSubcategory && (
            <TagPill
              key={`subcategory-${selectedSubcategory}`}
              label={selectedSubcategory}
              type="subcategory"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Info Text */}
      {hasTags && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-xs text-gray-600 flex items-center gap-1.5"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          Your video will appear in these filters on Discover
        </motion.p>
      )}
    </motion.div>
  );
};

// ========================================
// TAG PILL COMPONENT
// ========================================
interface TagPillProps {
  label: string;
  type: 'category' | 'subcategory';
}

const TagPill: React.FC<TagPillProps> = ({ label, type }) => {
  const isCategory = type === 'category';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      className={cn(
        'px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 shadow-md',
        isCategory
          ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white'
          : 'bg-gradient-to-r from-pink-600 to-pink-500 text-white'
      )}
    >
      <span className="inline-block w-2 h-2 rounded-full bg-white/80" />
      {label}
    </motion.div>
  );
};

export default TagPreviewPills;
