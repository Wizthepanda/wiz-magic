import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Sparkles, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

/**
 * Premium Unlock Modal v3.0
 *
 * Design Philosophy: Premium, airy, elegant, and friendly
 * - Luxury gradients, soft glass effects, subtle shadows
 * - Match homepage typography and "Creators Who Inspire Us" aesthetic
 * - Framer Motion transitions
 * - Radix Dialog for accessibility
 */

export interface PremiumItem {
  id: string;
  title: string;
  description: string;
  priceInZaps: number;
  priceInUsd?: number;
}

export interface Creator {
  name: string;
  avatarUrl: string;
  tagline: string;
}

interface PremiumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
  items: PremiumItem[];
  userZapBalance?: number;
}

function PremiumItemCard({
  item,
  userZapBalance = 0,
  onUnlock,
}: {
  item: PremiumItem;
  userZapBalance: number;
  onUnlock: (item: PremiumItem) => void;
}) {
  const hasEnoughZaps = userZapBalance >= item.priceInZaps;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <div className="relative h-full min-h-[240px] rounded-3xl overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/30 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all duration-500 border border-white/60">
        {/* Glass blur panel */}
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative p-6 flex flex-col items-center text-center h-full">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
            {item.description}
          </p>

          {/* Price */}
          <div className="mb-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300"
              style={{
                borderColor: isHovered ? '#8B5CF6' : '#E5E7EB',
                backgroundColor: isHovered ? 'rgba(139, 92, 246, 0.05)' : 'white',
              }}
            >
              <Zap
                className="w-5 h-5 transition-colors duration-300"
                style={{ color: isHovered ? '#8B5CF6' : '#6B7280' }}
                fill={isHovered ? '#8B5CF6' : 'none'}
              />
              <span className="text-lg font-bold text-gray-900">
                {item.priceInZaps.toLocaleString()} ZAPs
              </span>
            </div>
            {item.priceInUsd && (
              <p className="text-xs text-gray-500 mt-2">≈ ${item.priceInUsd} USD</p>
            )}
          </div>

          {/* Unlock Button */}
          {hasEnoughZaps ? (
            <Button
              onClick={() => onUnlock(item)}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-0 group/btn"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Unlock Now
              </span>
            </Button>
          ) : (
            <Button
              disabled
              className="w-full h-12 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed border-0"
            >
              <span className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Not Enough ZAPs
              </span>
            </Button>
          )}
        </div>

        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
}

export function PremiumUnlockModal({
  isOpen,
  onClose,
  creator,
  items,
  userZapBalance = 2500, // Default placeholder balance
}: PremiumUnlockModalProps) {
  const handleUnlock = (item: PremiumItem) => {
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#818CF8', '#A78BFA', '#C084FC', '#E879F9'],
    });

    // TODO: Implement actual unlock logic here
    console.log('Unlocking:', item);

    // Close modal after short delay
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Backdrop Overlay */}
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            {/* Modal Container - Centered Viewport */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <Dialog.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="
                    relative w-full max-w-2xl
                    bg-gradient-to-br from-purple-600/95 via-indigo-600/95 to-violet-700/95 backdrop-blur-2xl
                    shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                    border border-white/10
                    rounded-2xl sm:rounded-3xl
                    overflow-hidden
                    max-h-full sm:max-h-[90vh]
                    flex flex-col
                    pointer-events-auto
                  "
                >
                  {/* Accessible Title & Description (visually hidden, for screen readers) */}
                  <Dialog.Title className="sr-only">
                    {creator.name} - Premium Content
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    Unlock premium content from {creator.name}. {creator.tagline}
                  </Dialog.Description>

                  {/* Close Button */}
                  <Dialog.Close className="absolute right-4 top-4 z-10 rounded-full w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-200">
                    <X className="h-5 w-5 text-white" />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>

                  {/* Scrollable Content Area */}
                  <div className="overflow-y-auto flex-1 p-6 sm:p-10">
                    <div className="flex flex-col items-center text-center space-y-8">

                      {/* ZAP Balance Chip */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-[0_0_20px_-4px_rgba(255,255,255,0.5)]"
                      >
                        <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span className="text-sm font-medium text-white">You have</span>
                        <span className="text-sm font-semibold text-white">{userZapBalance.toLocaleString()} ZAPs</span>
                      </motion.div>

                      {/* Avatar & Creator / Content Title */}
                      <div className="flex flex-col items-center space-y-4">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.15, type: 'spring' }}
                          className="relative"
                        >
                          <div className="w-28 h-28 rounded-full overflow-hidden border-[3px] border-white/40 shadow-[0_0_30px_-8px_rgba(255,255,255,0.8)] animate-pulse-border">
                            <img
                              src={creator.avatarUrl}
                              alt={creator.name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.25 }}
                        >
                          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-1">
                            {creator.name}
                          </h1>
                          <p className="text-base text-white/70">
                            {creator.tagline}
                          </p>
                        </motion.div>
                      </div>

                      {/* Tier / Pricing / ZAP Claim Cards */}
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="w-full space-y-4"
                      >
                        {items.map((item, index) => {
                          const hasEnoughZaps = userZapBalance >= item.priceInZaps;

                          return (
                            <div
                              key={item.id}
                              className="
                                w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-5 space-y-4
                                shadow-[0_0_60px_-12px_rgba(255,255,255,0.25)]
                                hover:shadow-[0_0_70px_-8px_rgba(255,255,255,0.35)]
                                transition-all duration-300
                              "
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="text-left space-y-1 flex-1">
                                  <p className="text-lg font-medium text-white">{item.title}</p>
                                  <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <div className="flex items-center gap-1.5">
                                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                    <span className="text-xl font-semibold text-white">{item.priceInZaps.toLocaleString()}</span>
                                  </div>
                                  {item.priceInUsd && (
                                    <span className="text-xs text-white/50">≈ ${item.priceInUsd}</span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleUnlock(item)}
                                disabled={!hasEnoughZaps}
                                className={`
                                  w-full px-4 py-3 rounded-xl font-semibold text-white
                                  transition-all duration-200
                                  ${hasEnoughZaps
                                    ? 'bg-gradient-to-tr from-purple-500 to-pink-500 hover:scale-[1.015] active:scale-[0.985] shadow-[0_0_25px_-4px_rgba(236,72,153,0.7)] hover:shadow-[0_0_30px_-2px_rgba(236,72,153,0.9)]'
                                    : 'bg-white/10 cursor-not-allowed opacity-50'
                                  }
                                `}
                              >
                                {hasEnoughZaps ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Claim Access
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Not Enough ZAPs
                                  </span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </motion.div>

                      {/* Footer Note */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="text-sm text-white/60 text-center"
                      >
                        Need more ZAPs?{' '}
                        <button className="text-white font-semibold hover:text-white/90 transition-colors underline underline-offset-2">
                          Watch content to earn
                        </button>
                      </motion.p>

                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
