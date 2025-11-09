/**
 * WaitlistModal - Email collection modal for waitlist-only communities
 * Adds users to Firestore waitlist with position tracking
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Mail, Loader2, CheckCircle2, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import confetti from 'canvas-confetti';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityTitle: string;
  creatorName: string;
  creatorAvatar?: string;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({
  isOpen,
  onClose,
  communityId,
  communityTitle,
  creatorName,
  creatorAvatar,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [notifyMe, setNotifyMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

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

  // Pre-fill user data if signed in
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email is already on waitlist
      const waitlistQuery = query(
        collection(db, 'waitlists', communityId, 'entries'),
        where('email', '==', email.toLowerCase())
      );
      const existingEntries = await getDocs(waitlistQuery);

      if (!existingEntries.empty) {
        toast({
          title: 'Already on waitlist',
          description: "You're already registered for this community",
        });
        setIsSubmitting(false);
        return;
      }

      // Get current waitlist size to determine position
      const allEntriesQuery = query(collection(db, 'waitlists', communityId, 'entries'));
      const allEntries = await getDocs(allEntriesQuery);
      const currentPosition = allEntries.size + 1;

      // Add to waitlist
      await addDoc(collection(db, 'waitlists', communityId, 'entries'), {
        email: email.toLowerCase(),
        displayName: displayName || 'Anonymous',
        userId: user?.uid || null,
        position: currentPosition,
        addedAt: serverTimestamp(),
        notifyWhenOpen: notifyMe,
        status: 'pending',
        communityTitle,
        creatorName,
      });

      // Also add to user's waitlists if signed in
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'waitlists'), {
          communityId,
          communityTitle,
          creatorName,
          position: currentPosition,
          joinedAt: serverTimestamp(),
        });
      }

      // Show success
      setPosition(currentPosition);
      setSuccess(true);

      // Confetti animation
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a259ff', '#ec4899'],
      });

      toast({
        title: 'Added to waitlist! 🎉',
        description: `You're #${currentPosition} in line`,
      });

      // Close after delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setEmail('');
        setDisplayName('');
        setPosition(null);
      }, 3000);

    } catch (error: any) {
      console.error('Failed to join waitlist:', error);
      toast({
        title: 'Failed to join waitlist',
        description: error.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              'w-full max-w-[480px] mx-4',
              'bg-white dark:bg-neutral-900 backdrop-blur-xl',
              'rounded-2xl shadow-2xl',
              'p-6',
              'z-[2001]',
              'focus:outline-none'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {creatorAvatar ? (
                  <img
                    src={creatorAvatar}
                    alt={creatorName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    Join Waitlist
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {communityTitle}
                  </p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            {/* Success State */}
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    You're on the list!
                  </p>
                  {position && (
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      #{position}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    We'll notify you when {communityTitle} opens
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form">
                  {/* Info Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-200/50 dark:border-indigo-800/50 mb-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      This community is currently invite-only. Join the waitlist to be notified when it opens.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-10"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Display Name Input */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name (Optional)
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Notification Preference */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <input
                        type="checkbox"
                        id="notify"
                        checked={notifyMe}
                        onChange={(e) => setNotifyMe(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="notify" className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Bell className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">Notify me when community opens</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          We'll send you an email when {communityTitle} becomes available
                        </p>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className={cn(
                          'flex-1 bg-gradient-to-r from-indigo-600 to-violet-500 text-white',
                          'hover:from-indigo-700 hover:to-violet-600',
                          'shadow-lg hover:shadow-xl transition-all'
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4 mr-2" />
                            Join Waitlist
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Privacy Notice */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    We respect your privacy. Your email will only be used to notify you about this community.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
