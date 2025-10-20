import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Community } from '@/types/community';

interface InviteModalProps {
  community: Community;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ community, isOpen, onClose }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate invite link
  const inviteLink = `${window.location.origin}/community/${community.id}?ref=invite`;

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Invite link has been copied to your clipboard.',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Social share handlers
  const shareVia = (platform: string) => {
    const text = `Join ${community.title} on WIZUP! ${inviteLink}`;
    const encodedText = encodeURIComponent(text);
    const encodedLink = encodeURIComponent(inviteLink);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
      email: `mailto:?subject=${encodeURIComponent(`Join ${community.title} on WIZUP`)}&body=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Native share API (for mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: community.title,
          text: `Join ${community.title} on WIZUP!`,
          url: inviteLink,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-zinc-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Header with Gradient */}
              <div className="relative p-6 pb-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-b border-white/10">
                {/* Close Button */}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg"
                >
                  <Share2 className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Invite to {community.title}
                </h2>
                <p className="text-white/60 text-sm text-center">
                  Share this link with people you want to join
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Copy Link Section */}
                <div>
                  <label className="text-sm font-medium text-white/70 mb-2 block">
                    Invite Link
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={inviteLink}
                      readOnly
                      className="bg-white/10 border-white/20 text-white rounded-xl flex-1 text-sm"
                    />
                    <Button
                      onClick={handleCopy}
                      className={cn(
                        "rounded-xl transition-all duration-300",
                        copied
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      )}
                    >
                      {copied ? (
                        <><Check className="w-4 h-4 mr-2" /> Copied</>
                      ) : (
                        <><Copy className="w-4 h-4 mr-2" /> Copy</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Share via Social */}
                <div>
                  <label className="text-sm font-medium text-white/70 mb-3 block">
                    Share via
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => shareVia('email')}
                      variant="outline"
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-xl justify-start"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>

                    <Button
                      onClick={() => shareVia('whatsapp')}
                      variant="outline"
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-xl justify-start"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>

                    <Button
                      onClick={() => shareVia('twitter')}
                      variant="outline"
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-xl justify-start"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>

                    <Button
                      onClick={() => shareVia('facebook')}
                      variant="outline"
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-xl justify-start"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>

                    <Button
                      onClick={() => shareVia('linkedin')}
                      variant="outline"
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-xl justify-start"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>

                    {/* Native Share (mobile) */}
                    {navigator.share && (
                      <Button
                        onClick={handleNativeShare}
                        variant="outline"
                        className="bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-xl justify-start"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        More...
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-400/20"
                >
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {community.membersCount || community.slotsClaimed || 0}
                    </div>
                    <div className="text-sm text-white/60">Current Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {community.slotsTotal || community.slotsAvailable || '∞'}
                    </div>
                    <div className="text-sm text-white/60">Total Slots</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
