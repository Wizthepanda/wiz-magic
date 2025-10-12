import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Share2,
  Zap,
  DollarSign,
  Gift,
  Users,
  BookOpen,
  MessageCircle
} from 'lucide-react';

interface CommunityWelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: {
    id: string;
    name: string;
    coverImage?: string;
    creator: {
      name: string;
      avatar: string;
    };
    category: 'community' | 'course' | 'coaching';
    joinType: 'free' | 'free-zaps' | 'paid' | 'paid-zaps' | 'zaps-usd';
    priceAmount?: number;
    zapAmount?: number;
  };
  onEnterCommunity: () => void;
  onExploreCommunities?: () => void;
}

// Floating particle component for background animation
const FloatingParticle = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      className="absolute"
      initial={{
        x: Math.random() * 600 - 300,
        y: 600,
        opacity: 0,
        rotate: 0,
        scale: 0.5
      }}
      animate={{
        y: -100,
        opacity: [0, 0.15, 0.15, 0],
        rotate: 360,
        scale: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500/30" />
    </motion.div>
  );
};

// Confetti particle for celebration effect
const ConfettiParticle = ({ index }: { index: number }) => {
  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f59e0b'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = (Math.random() - 0.5) * 400;
  const randomRotate = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute top-1/4 left-1/2"
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
      animate={{
        x: randomX,
        y: 400,
        opacity: 0,
        rotate: randomRotate
      }}
      transition={{
        duration: 2,
        delay: index * 0.05,
        ease: 'easeOut'
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: randomColor }}
      />
    </motion.div>
  );
};

/**
 * CommunityWelcomeModal
 *
 * Premium, cinematic modal that appears after joining a community.
 * Features:
 * - Glassmorphic design with gradient border
 * - Floating ZAP particle background
 * - Confetti celebration on open
 * - Smooth Framer Motion animations
 * - Responsive layout (2-col desktop → 1-col mobile)
 */
export const CommunityWelcomeModal = ({
  open,
  onOpenChange,
  community,
  onEnterCommunity,
  onExploreCommunities
}: CommunityWelcomeModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Trigger confetti on modal open
  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Get join type display text
  const getJoinTypeText = () => {
    switch (community.joinType) {
      case 'free':
        return 'Free Access';
      case 'free-zaps':
        return `Joined with ${community.zapAmount} ⚡ ZAPs Reward`;
      case 'paid':
        return `Joined via $${community.priceAmount} USD`;
      case 'paid-zaps':
        return `Joined via ${community.zapAmount} ⚡ ZAPs`;
      case 'zaps-usd':
        return `Joined via ${community.zapAmount} ⚡ + $${community.priceAmount}`;
      default:
        return 'Joined Successfully';
    }
  };

  // Get join type icon
  const getJoinTypeIcon = () => {
    switch (community.joinType) {
      case 'free':
        return <Gift className="w-4 h-4" />;
      case 'free-zaps':
      case 'paid-zaps':
        return <Zap className="w-4 h-4 fill-current" />;
      case 'paid':
      case 'zaps-usd':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (community.category) {
      case 'community':
        return <Users className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'coaching':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // Get category color
  const getCategoryColor = () => {
    switch (community.category) {
      case 'community':
        return 'from-indigo-500 to-blue-500';
      case 'course':
        return 'from-purple-500 to-pink-500';
      case 'coaching':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-indigo-500 to-violet-500';
    }
  };

  const handleEnterCommunity = () => {
    setIsExiting(true);
    // Brief animation before callback
    setTimeout(() => {
      onEnterCommunity();
      onOpenChange(false);
      setIsExiting(false);
    }, 400);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community/${community.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${community.name}`,
          text: `Check out ${community.name} on WIZUP!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // Could add toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="bg-black/40 backdrop-blur-xl" />
      <DialogContent
        className="max-w-[640px] w-[90vw] p-0 border-0 bg-transparent shadow-none overflow-visible"
        aria-describedby="welcome-modal-description"
      >
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
                duration: 0.7
              }}
              className="relative"
            >
              {/* Floating Particle Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                {[...Array(8)].map((_, i) => (
                  <FloatingParticle key={i} delay={i * 0.8} />
                ))}
              </div>

              {/* Confetti Effect */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                  {[...Array(30)].map((_, i) => (
                    <ConfettiParticle key={i} index={i} />
                  ))}
                </div>
              )}

              {/* Main Card */}
              <div
                className={cn(
                  'relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 md:p-10 shadow-2xl',
                  'border-2 border-transparent',
                  'before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:p-[2px]',
                  'before:bg-gradient-to-r before:from-indigo-500 before:via-violet-500 before:to-fuchsia-500',
                  'before:opacity-50 before:blur-sm'
                )}
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-4 shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Headline */}
                  <h2
                    className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600"
                    id="welcome-modal-description"
                  >
                    Welcome to {community.name} ✨
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    You've just joined an inspiring new space. Let's get you started!
                  </p>
                </motion.div>

                {/* Body - Community Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                    {/* Cover Image */}
                    <div className="relative aspect-square md:aspect-auto rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {community.coverImage ? (
                        <img
                          src={community.coverImage}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={cn('w-full h-full bg-gradient-to-br', getCategoryColor(), 'flex items-center justify-center')}>
                          {getCategoryIcon()}
                        </div>
                      )}
                    </div>

                    {/* Community Details */}
                    <div className="flex flex-col justify-center space-y-3">
                      <h3 className="text-xl font-bold text-gray-900">{community.name}</h3>

                      {/* Creator */}
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                          <AvatarImage src={community.creator.avatar} alt={community.creator.name} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs">
                            {community.creator.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700 font-medium">{community.creator.name}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Category Badge */}
                        <Badge className={cn('bg-gradient-to-r', getCategoryColor(), 'text-white border-0')}>
                          {getCategoryIcon()}
                          <span className="ml-1.5 capitalize">{community.category}</span>
                        </Badge>

                        {/* Join Type Badge */}
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                          {getJoinTypeIcon()}
                          <span className="ml-1.5">{getJoinTypeText()}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Divider */}
                <div className="border-t border-gray-200/50 my-6" />

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {/* Enter Community - Primary */}
                  <Button
                    onClick={handleEnterCommunity}
                    disabled={isExiting}
                    className={cn(
                      'flex-1 h-12 rounded-full font-semibold text-white shadow-lg',
                      'bg-gradient-to-r from-indigo-600 to-violet-600',
                      'hover:from-indigo-700 hover:to-violet-700',
                      'hover:shadow-xl hover:scale-[1.03]',
                      'transition-all duration-300',
                      'group'
                    )}
                  >
                    {isExiting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Enter Community
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  {/* Explore Communities - Secondary */}
                  <Button
                    onClick={onExploreCommunities}
                    variant="outline"
                    className="flex-1 h-12 rounded-full font-semibold border-2 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                  >
                    <Compass className="w-5 h-5 mr-2" />
                    Explore Communities
                  </Button>

                  {/* Share - Ghost */}
                  <Button
                    onClick={handleShare}
                    variant="ghost"
                    className="sm:w-12 h-12 rounded-full hover:bg-gray-100 transition-all"
                    aria-label="Share invite link"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </motion.div>

                {/* Footer Tip */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-gray-500 text-center mt-6 italic"
                >
                  💡 Tip: You can find all your joined spaces under <strong>My Communities</strong> in your dashboard.
                </motion.p>
              </div>

              {/* Exit Gradient Sweep Effect */}
              <AnimatePresence>
                {isExiting && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0.8 }}
                    animate={{ scaleX: 1, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-3xl origin-left"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
