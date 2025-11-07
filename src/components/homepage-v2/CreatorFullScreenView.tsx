import React, { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { Creator, CreatorFullScreenViewProps } from '@/types/creator';

// Re-export types for convenience
export type { Creator, CreatorFullScreenViewProps };

// ============================================================================
// Animation Variants (Calm Cosmic Luxury)
// ============================================================================

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  initial: { y: 18, opacity: 0, scale: 0.995 },
  animate: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 18, opacity: 0, scale: 0.995 },
};

const avatarPulseVariants = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// Main Component
// ============================================================================

// Extracted inner panel so it can be used inside an external Dialog too
export const CreatorPanel: React.FC<CreatorFullScreenViewProps & { onClose?: () => void }> = ({
  open,
  setOpen,
  creator,
  onUnlock,
  onPreview,
  userZapBalance = 2500,
}) => {
  const navigate = useNavigate();

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    // Optional: navigate back if using route-based opening
    // navigate(-1);
  };

  const handleUnlock = async () => {
    try {
      // Check if user has enough ZAPs
      const cost = creator.zapCost ?? 0;
      if (userZapBalance < cost) {
        toast.error('Insufficient ZAPs', {
          description: `You need ${cost - userZapBalance} more ZAPs to unlock this creator.`,
        });
        return;
      }

      if (onUnlock) {
        await onUnlock(creator.id);
        
        // Success feedback
        toast.success('Creator Unlocked! 🎉', {
          description: `You now have access to ${creator.name}'s exclusive content.`,
        });

        // Confetti celebration
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8A63FF', '#A259FF', '#FF86C1'],
        });

        // Close after brief delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Unlock error:', err);
      toast.error('Unlock Failed', {
        description: 'Something went wrong. Please try again.',
      });
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(creator.id);
    }
  };

  const defaultFeatures = [
    {
      title: 'Private Group Chat',
      description: 'Connect directly with the creator and community members in an exclusive chat.',
    },
    {
      title: 'Weekly Live Sessions',
      description: 'Join interactive live streams and Q&A sessions every week.',
    },
    {
      title: 'Premium Content Library',
      description: 'Access exclusive videos, guides, and downloadable resources.',
    },
    {
      title: 'Early Access',
      description: 'Be the first to see new content and special announcements.',
    },
  ];

  const features = creator.features
    ? creator.features.map((f) => ({
        title: f,
        description: 'Exclusive benefit that helps you get more value from this creator.',
      }))
    : defaultFeatures;

  return (
    <div className="min-h-screen w-full">
      <div className="min-h-screen flex items-start justify-center py-8 sm:py-16 px-4 sm:px-6">
                  <div className="w-full max-w-6xl bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-[0_24px_80px_rgba(10,11,15,0.36)] overflow-hidden relative">
                    {/* Close Button */}
                    <button
                      onClick={handleClose}
                      aria-label="Close creator view"
                      className="absolute right-4 sm:right-6 top-4 sm:top-6 z-50 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <X size={20} className="text-gray-700" />
                    </button>

                    {/* Banner Section */}
                    <div className="relative">
                      <div className="w-full h-48 sm:h-60 bg-gradient-to-br from-[#8A63FF] to-[#FF86C1] overflow-hidden">
                        {creator.bannerUrl ? (
                          <img
                            src={creator.bannerUrl}
                            alt={`${creator.name} banner`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-white/30 text-6xl font-bold">
                              {creator.name.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                      {/* Avatar (overlapping banner) */}
                      <div className="absolute left-6 sm:left-12 -bottom-12 sm:-bottom-14">
                        <motion.div
                          variants={avatarPulseVariants}
                          animate="animate"
                          className="rounded-full p-[3px] bg-gradient-to-r from-[#8A63FF] via-[#A259FF] to-[#FF86C1] shadow-[0_12px_40px_rgba(162,89,255,0.18)]"
                        >
                          <div className="rounded-full bg-white p-1">
                            {creator.avatarUrl ? (
                              <img
                                src={creator.avatarUrl}
                                alt={creator.name}
                                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#8A63FF] to-[#FF86C1] flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                                {creator.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-6 sm:px-12 pt-16 sm:pt-20 pb-8 sm:pb-12">
                      {/* Header: Name, Tagline & Actions */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        {/* Left: Name & Tagline */}
                        <div className="flex-1 max-w-full lg:max-w-[60%]">
                          <Dialog.Title className="text-[clamp(28px,4vw,48px)] leading-tight font-semibold text-[#0f1724]">
                            {creator.name}
                          </Dialog.Title>
                          <Dialog.Description className="mt-2 text-sm sm:text-base text-[#6b7280]">
                            {creator.tagline || 'Exclusive creator content and community access'}
                          </Dialog.Description>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                          {/* ZAP Balance Pill */}
                          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#f6f4ff] to-[#fff7fb] border border-[#A259FF]/20 px-4 py-2 rounded-full">
                            <Zap size={14} className="text-[#A259FF]" fill="#A259FF" />
                            <span className="text-xs text-[#6b7280]">You have</span>
                            <span className="text-sm font-semibold text-[#A259FF]">
                              {userZapBalance.toLocaleString()} ZAPs
                            </span>
                          </div>

                          {/* Preview Button */}
                          {onPreview && (
                            <button
                              onClick={handlePreview}
                              className="px-4 py-2.5 rounded-full border border-gray-200 text-[#0f1724] bg-white hover:bg-gray-50 transition-colors font-medium text-sm"
                              aria-label="Preview creator content"
                            >
                              Preview
                            </button>
                          )}

                          {/* Unlock Button */}
                          <button
                            onClick={handleUnlock}
                            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8A63FF] via-[#A259FF] to-[#FF86C1] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all text-sm sm:text-base whitespace-nowrap"
                            aria-label={`Unlock ${creator.name} for ${creator.zapCost ?? 0} ZAPs`}
                          >
                            Unlock — {(creator.zapCost ?? 0).toLocaleString()} ZAPs
                          </button>
                        </div>
                      </div>

                      {/* Content Grid: Features + Media */}
                      <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                        {/* Left: Features List */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-[#0f1724] mb-6">
                            What you'll get
                          </h3>
                          <ul className="space-y-4 sm:space-y-5">
                            {features.map((feature, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.3 }}
                                className="flex items-start gap-3 sm:gap-4"
                              >
                                <div className="mt-0.5 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#f6f4ff] to-[#fff7fb] border border-[#A259FF]/10 flex items-center justify-center flex-shrink-0">
                                  <Check size={18} className="text-[#A259FF]" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm sm:text-base font-medium text-[#0f1724] mb-1">
                                    {feature.title}
                                  </div>
                                  <div className="text-xs sm:text-sm text-[#6b7280] leading-relaxed">
                                    {feature.description}
                                  </div>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </div>

                        {/* Right: Media Preview */}
                        <div>
                          {creator.previewVideoUrl ? (
                            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-lg aspect-video">
                              <iframe
                                title={`${creator.name} preview video`}
                                src={creator.previewVideoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#f6f4ff] via-[#fff7fb] to-[#fef5ff] p-6 sm:p-8 shadow-lg">
                              <div className="aspect-video rounded-xl bg-gradient-to-br from-[#8A63FF]/10 to-[#FF86C1]/10 flex items-center justify-center border border-[#A259FF]/10">
                                <div className="text-center">
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#8A63FF] to-[#FF86C1] flex items-center justify-center">
                                    <Zap size={32} className="text-white" fill="white" />
                                  </div>
                                  <p className="text-sm sm:text-base text-[#6b7280] font-medium">
                                    Preview available after unlock
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Microcopy */}
                      <div className="mt-8 sm:mt-12 pt-6 border-t border-gray-200">
                        <p className="text-xs sm:text-sm text-[#6b7280] leading-relaxed">
                          By unlocking you agree to the community rules and terms. You may revoke
                          access from your account settings at any time. All transactions are
                          processed securely.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
      </div>
  );
};

export const CreatorFullScreenView: React.FC<CreatorFullScreenViewProps> = (props) => {
  const { open, setOpen } = props;
  return (
    <AnimatePresence>
      {open && (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed inset-0 z-[101] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <CreatorPanel {...props} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </AnimatePresence>
  );
};
