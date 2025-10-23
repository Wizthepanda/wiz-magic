import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Trophy, Zap, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    userId: string;
    name: string;
    avatar: string;
    bio?: string;
    xp: number;
    level: number;
    rank: number;
    badges: string[];
    postCount: number;
    commentCount: number;
    joinedDate?: string;
  };
}

/**
 * ProfileModal Component (Phase 9)
 * - Glassmorphic modal for leaderboard member profiles
 * - Shows bio, XP stats, and message button
 * - Background blur effect with smooth animations
 * - Framer Motion for enter/exit transitions
 */
export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const handleMessage = () => {
    console.log('Message user:', user.userId);
    // TODO: Integrate with messaging system
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Gradient */}
              <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-8 pb-16">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl hover:bg-white/30 transition-all flex items-center justify-center group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform" />
                </button>

                {/* Animated Background */}
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="absolute inset-0 opacity-20 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500"
                  style={{ backgroundSize: '200% 200%' }}
                />

                {/* Avatar */}
                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="relative"
                  >
                    {/* XP Ring */}
                    <div className="absolute -inset-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        className="w-full h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400"
                        style={{
                          maskImage: `conic-gradient(from 0deg, transparent ${360 - (user.level / 50) * 360}deg, black ${360 - (user.level / 50) * 360}deg)`,
                        }}
                      />
                    </div>

                    <Avatar className="w-24 h-24 border-4 border-white shadow-2xl">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold text-3xl">
                        {user.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Rank Badge */}
                    {user.rank <= 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                        transition={{
                          scale: { delay: 0.2, type: 'spring', stiffness: 300 },
                          rotate: { duration: 2, repeat: Infinity, repeatDelay: 3 },
                        }}
                        className="absolute -bottom-2 -right-2 text-4xl"
                      >
                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mt-4 mb-1"
                  >
                    {user.name}
                  </motion.h2>

                  {/* Badges */}
                  {user.badges.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-2 justify-center mt-2"
                    >
                      {user.badges.map((badge, index) => (
                        <Badge
                          key={index}
                          className="bg-white/20 backdrop-blur-xl text-white border-white/30"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="relative -mt-12 px-8 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-6"
                >
                  <div className="grid grid-cols-3 gap-4">
                    {/* XP */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-gray-600 font-medium">XP</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {user.xp.toLocaleString()}
                      </div>
                    </div>

                    {/* Level */}
                    <div className="text-center border-x border-gray-200">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-gray-600 font-medium">Level</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{user.level}</div>
                    </div>

                    {/* Rank */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Trophy className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs text-gray-600 font-medium">Rank</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">#{user.rank}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Bio */}
                {user.bio && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6"
                  >
                    <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{user.bio}</p>
                  </motion.div>
                )}

                {/* Activity Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900">Posts</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{user.postCount}</div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-medium text-indigo-900">Comments</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-900">{user.commentCount}</div>
                  </div>
                </motion.div>

                {/* Message Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    onClick={handleMessage}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
