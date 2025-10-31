import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeletePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/**
 * Delete Post Confirmation Modal
 * - Smooth animations with Framer Motion
 * - Clear warning about permanent deletion
 * - Disabled state during deletion
 * - Matches WIZUP glass morphism design
 */
export const DeletePostModal: React.FC<DeletePostModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'relative w-full max-w-md',
                'bg-white/90 backdrop-blur-xl rounded-2xl',
                'border border-white/20 shadow-2xl',
                'p-6'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isDeleting}
                className={cn(
                  'absolute top-4 right-4 p-2 rounded-full',
                  'text-gray-400 hover:text-gray-600',
                  'hover:bg-gray-100/50 transition-all',
                  isDeleting && 'opacity-50 cursor-not-allowed'
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Warning Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className={cn(
                  'w-16 h-16 rounded-full',
                  'bg-gradient-to-br from-red-500/20 to-orange-500/20',
                  'flex items-center justify-center',
                  'border-2 border-red-500/30'
                )}>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Delete Post?
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                Are you sure you want to delete this post?
                <br />
                <span className="font-semibold text-gray-800">
                  This action cannot be undone.
                </span>
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isDeleting}
                  className={cn(
                    'flex-1 border-gray-300 text-gray-700',
                    'hover:bg-gray-100 hover:border-gray-400',
                    'transition-all duration-200'
                  )}
                >
                  Cancel
                </Button>

                <Button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className={cn(
                    'flex-1',
                    'bg-gradient-to-r from-red-600 to-red-700',
                    'hover:from-red-700 hover:to-red-800',
                    'text-white shadow-lg shadow-red-500/30',
                    'transition-all duration-200',
                    isDeleting && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  {isDeleting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
