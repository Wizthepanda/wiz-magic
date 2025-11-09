/**
 * JoinCommunitiesModal - Modal to display and join multiple communities
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommunityList, CommunityItem } from './CommunityList';

interface JoinCommunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  communities: CommunityItem[];
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
}

export const JoinCommunitiesModal: React.FC<JoinCommunitiesModalProps> = ({
  isOpen,
  onClose,
  communities,
  creatorId,
  creatorName,
  creatorAvatar,
}) => {
  // Scroll lock effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
          />
        </Dialog.Overlay>

        {/* Content */}
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-full max-w-4xl max-h-[85vh] mx-4',
              'bg-white dark:bg-neutral-900',
              'rounded-2xl shadow-2xl',
              'overflow-hidden',
              'z-[2001]',
              'focus:outline-none',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <Dialog.Title className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Join Communities
                </Dialog.Title>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  by {creatorName}
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            {/* Communities List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <CommunityList
                communities={communities}
                creatorId={creatorId}
                creatorName={creatorName}
                creatorAvatar={creatorAvatar}
              />
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
