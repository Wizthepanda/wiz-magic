/**
 * CreatorHubModal - Small modal for when creator has both Community and Course
 * Shows options for user to choose between joining community or enrolling in course
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, GraduationCap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CreatorHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  communityId?: string;
  courseId?: string;
}

export const CreatorHubModal: React.FC<CreatorHubModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  creatorAvatar,
  communityId,
  courseId,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleJoinCommunity = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to continue',
        variant: 'destructive',
      });
      return;
    }

    if (!communityId) {
      toast({
        title: 'Error',
        description: 'Community not found',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const memberRef = doc(db, 'communityMembers', `${communityId}_${user.uid}`);
      await setDoc(memberRef, {
        communityId,
        userId: user.uid,
        joinedAt: serverTimestamp(),
        role: 'member',
      });

      setSuccess(true);
      toast({
        title: 'Joined! 🎉',
        description: 'You are now a member of this community',
      });

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to join community:', error);
      toast({
        title: 'Failed to join',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnrollCourse = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to continue',
        variant: 'destructive',
      });
      return;
    }

    if (!courseId) {
      toast({
        title: 'Error',
        description: 'Course not found',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const enrollmentRef = doc(db, 'courseEnrollments', `${user.uid}_${courseId}`);
      await setDoc(enrollmentRef, {
        userId: user.uid,
        courseId,
        creatorId,
        enrolledAt: serverTimestamp(),
        status: 'active',
      });

      setSuccess(true);
      toast({
        title: 'Enrolled! 🎓',
        description: 'You are now enrolled in this course',
      });

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      toast({
        title: 'Failed to enroll',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
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
              'w-full max-w-[500px] mx-4',
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
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20"
                />
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    {creatorName}'s Hub
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose how to connect
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
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Success!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome to {creatorName}'s hub
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* Community Option */}
                {communityId && (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={isProcessing}
                    className={cn(
                      'w-full p-5 rounded-xl',
                      'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
                      'border border-purple-200/50 dark:border-purple-800/50',
                      'hover:shadow-md hover:-translate-y-[2px]',
                      'transition-all duration-300',
                      'group',
                      isProcessing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                            Join Community
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Connect with other members
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                )}

                {/* Course Option */}
                {courseId && (
                  <button
                    onClick={handleEnrollCourse}
                    disabled={isProcessing}
                    className={cn(
                      'w-full p-5 rounded-xl',
                      'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
                      'border border-blue-200/50 dark:border-blue-800/50',
                      'hover:shadow-md hover:-translate-y-[2px]',
                      'transition-all duration-300',
                      'group',
                      isProcessing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                            Enroll in Course
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Start learning today
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Cancel Button */}
            {!success && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
              </div>
            )}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
