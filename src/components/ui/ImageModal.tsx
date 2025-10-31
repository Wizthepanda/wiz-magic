import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageModalProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

/**
 * ImageModal Component
 * Full-view image expansion modal with navigation
 * - Blurred background overlay
 * - Click outside or ESC to close
 * - Left/right arrow navigation (both UI and keyboard)
 * - Smooth animations and transitions
 * - Maintains image aspect ratio
 */
export const ImageModal: React.FC<ImageModalProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (onNavigate && currentIndex > 0) {
            onNavigate('prev');
          }
          break;
        case 'ArrowRight':
          if (onNavigate && currentIndex < images.length - 1) {
            onNavigate('next');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const currentImage = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Blurred Background Overlay */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.85)'
            }}
          />

          {/* Close Button - Top Right */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className={cn(
              'absolute top-6 right-6 z-[10001] p-3 rounded-full',
              'bg-white/10 backdrop-blur-sm border border-white/20',
              'text-white hover:text-[#A259FF] hover:bg-white/20',
              'transition-all duration-300 hover:scale-110',
              'hover:shadow-lg hover:shadow-purple-500/30'
            )}
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Image Counter - Top Left */}
          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'absolute top-6 left-6 z-[10001] px-4 py-2 rounded-full',
                'bg-white/10 backdrop-blur-sm border border-white/20',
                'text-white font-medium text-sm'
              )}
            >
              {currentIndex + 1} / {images.length}
            </motion.div>
          )}

          {/* Main Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-[10000] max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={`Image ${currentIndex + 1}`}
              className={cn(
                'max-w-full max-h-[85vh] object-contain rounded-2xl',
                'shadow-[0_8px_25px_rgba(0,0,0,0.3)]'
              )}
              style={{
                imageRendering: 'high-quality',
              }}
            />
          </motion.div>

          {/* Left Navigation Arrow */}
          {hasPrev && onNavigate && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.15 }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('prev');
              }}
              className={cn(
                'absolute left-6 top-1/2 -translate-y-1/2 z-[10001]',
                'p-3 rounded-full',
                'bg-white/10 backdrop-blur-sm border border-white/20',
                'text-white hover:text-[#A259FF] hover:bg-white/20',
                'transition-all duration-300 hover:scale-110',
                'hover:shadow-lg hover:shadow-purple-500/30'
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}

          {/* Right Navigation Arrow */}
          {hasNext && onNavigate && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.15 }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('next');
              }}
              className={cn(
                'absolute right-6 top-1/2 -translate-y-1/2 z-[10001]',
                'p-3 rounded-full',
                'bg-white/10 backdrop-blur-sm border border-white/20',
                'text-white hover:text-[#A259FF] hover:bg-white/20',
                'transition-all duration-300 hover:scale-110',
                'hover:shadow-lg hover:shadow-purple-500/30'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
