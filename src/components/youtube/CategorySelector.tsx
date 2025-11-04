/**
 * CategorySelector - World-Class Category & Subcategory Picker
 *
 * Features:
 * - Liquid-glass morphism design matching WIZUP aesthetic
 * - Horizontal scrollable chip-based main category selection
 * - Dynamic subcategory grid that appears on main selection
 * - Smooth Framer Motion transitions
 * - Full keyboard navigation & ARIA support
 * - Mobile-first responsive design
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES, Category } from '@/lib/categories';

interface CategorySelectorProps {
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onSelectCategory: (category: string) => void;
  onSelectSubcategory: (subcategory: string) => void;
  className?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  className,
}) => {
  const subcategoryPanelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to subcategory panel when category is selected
  useEffect(() => {
    if (selectedCategory && subcategoryPanelRef.current) {
      subcategoryPanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedCategory]);

  const selectedCategoryData = CATEGORIES.find(
    (cat) => cat.value === selectedCategory
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Category Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Select Category
          </h3>
          <span className="text-xs text-red-500">*</span>
        </div>

        {/* Horizontal Scrollable Chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          role="listbox"
          aria-label="Main categories"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.value;
            return (
              <CategoryChip
                key={category.value}
                category={category}
                isSelected={isSelected}
                onClick={() => onSelectCategory(category.value)}
              />
            );
          })}
        </div>
      </div>

      {/* Subcategory Selection (appears after main category selected) */}
      <AnimatePresence mode="wait">
        {selectedCategory && selectedCategoryData && (
          <motion.div
            ref={subcategoryPanelRef}
            key={selectedCategory}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700">
                Select Subcategory
              </h3>
              <span className="text-xs text-red-500">*</span>
              <ChevronRight className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-600 font-medium">
                {selectedCategoryData.label}
              </span>
            </div>

            {/* Subcategory Grid */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
              role="listbox"
              aria-label={`Subcategories for ${selectedCategoryData.label}`}
            >
              {selectedCategoryData.subcategories.map((subcategory) => {
                const isSelected = selectedSubcategory === subcategory;
                return (
                  <SubcategoryChip
                    key={subcategory}
                    subcategory={subcategory}
                    isSelected={isSelected}
                    onClick={() => onSelectSubcategory(subcategory)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ========================================
// CATEGORY CHIP COMPONENT
// ========================================
interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={cn(
        'relative px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap',
        'transition-all duration-300 flex items-center gap-2',
        'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2',
        isSelected
          ? 'bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] text-white shadow-lg'
          : 'bg-white/60 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
      )}
    >
      {/* Soft Glow for Selected */}
      {isSelected && (
        <motion.div
          layoutId="categoryGlow"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] blur-lg opacity-50"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      <span className="relative z-10">{category.label}</span>

      {isSelected && <Check className="w-4 h-4 relative z-10" />}
    </motion.button>
  );
};

// ========================================
// SUBCATEGORY CHIP COMPONENT
// ========================================
interface SubcategoryChipProps {
  subcategory: string;
  isSelected: boolean;
  onClick: () => void;
}

const SubcategoryChip: React.FC<SubcategoryChipProps> = ({
  subcategory,
  isSelected,
  onClick,
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={cn(
        'relative px-4 py-2.5 rounded-xl font-medium text-sm',
        'transition-all duration-200 flex items-center justify-center gap-2',
        'focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2',
        isSelected
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md border-2 border-purple-400'
          : 'bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
      )}
    >
      <span className="relative z-10 line-clamp-1">{subcategory}</span>
      {isSelected && <Check className="w-3.5 h-3.5 relative z-10 shrink-0" />}
    </motion.button>
  );
};

export default CategorySelector;
