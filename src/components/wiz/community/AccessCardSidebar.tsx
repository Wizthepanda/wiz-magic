import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, CheckCircle, Share2, Crown, BookOpen, MessageCircle, Gift } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Community } from "@/types/community";
import { useNavigate } from "react-router-dom";

interface AccessCardSidebarProps {
  community: Community;
  isJoined?: boolean;
}

export function AccessCardSidebar({ community, isJoined = false }: AccessCardSidebarProps) {
  const navigate = useNavigate();
  const [showCreatorInfo, setShowCreatorInfo] = useState(false);

  // Extract creator info with multiple fallback paths
  const creatorName = community.creator?.name || 
                      community.creatorName || 
                      community.creator?.displayName ||
                      'Unknown Creator';
  
  const creatorAvatar = community.creator?.avatarUrl || 
                        community.creatorAvatar || 
                        community.creator?.photoURL ||
                        null;
  
  const creatorLevel = community.creator?.level || 
                       community.creatorLevel ||
                       null;

  const handleGoToFeed = () => {
    // Navigate back to community discovery page within dashboard (preserves sidebar)
    navigate('/?section=community');
  };

  const handleInvite = () => {
    // TODO: Implement invite functionality
    if (navigator.share) {
      navigator.share({
        title: community.title,
        text: `Join me in ${community.title}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const progress = community.progress || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl shadow-xl border border-white/40 sticky top-24"
    >
      {/* Creator Info with hover effect */}
      <motion.div 
        className="flex items-center gap-3 pb-5 border-b border-gradient-to-r from-transparent via-slate-200 to-transparent relative"
        onHoverStart={() => setShowCreatorInfo(true)}
        onHoverEnd={() => setShowCreatorInfo(false)}
      >
        <motion.div whileHover={{ scale: 1.05, y: -2 }}>
          <Avatar className="w-14 h-14 border-2 border-white shadow-lg ring-2 ring-[#8B5CF6]/20">
            <AvatarImage src={creatorAvatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white text-lg">
              {creatorName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 mb-0.5 font-medium">Creator</div>
          <div className="font-bold text-slate-900 truncate bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
            {creatorName}
          </div>
          {creatorLevel && (
            <div className="flex items-center gap-1 mt-1">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Level {creatorLevel}
              </span>
            </div>
          )}
        </div>
        
        {/* Mini popup on hover */}
        <AnimatePresence>
          {showCreatorInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute -top-2 left-full ml-4 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/40 z-30 min-w-[180px]"
            >
              <div className="text-xs font-semibold text-slate-900">{creatorName}</div>
              <div className="text-xs text-slate-500 mt-0.5">Community Creator</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Access Details with gradient icons */}
      <div className="py-5 space-y-4 border-b border-slate-200/60">
        <div>
          <div className="text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Access Details
          </div>
          
          <div className="space-y-3">
            {/* Access Type */}
            <motion.div 
              whileHover={{ x: 2 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <span className="text-sm text-slate-600">Type</span>
              </div>
              <Badge variant="outline" className="font-semibold bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border-[#8B5CF6]/30">
                {community.accessType}
              </Badge>
            </motion.div>

            {/* Duration */}
            <motion.div 
              whileHover={{ x: 2 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-slate-600">Duration</span>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {community.duration || 'Lifetime'}
              </span>
            </motion.div>

            {/* Members */}
            <motion.div 
              whileHover={{ x: 2 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-600">Members</span>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {community.slotsClaimed || community.membersCount || 0} / {community.slotsTotal || community.slotsAvailable || '∞'}
              </span>
            </motion.div>

            {/* Status */}
            {isJoined && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative mt-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur-sm opacity-30" />
                <div className="relative flex items-center gap-2 text-sm text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200/50">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">Access Granted</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar (if joined) */}
        {isJoined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Your Progress</span>
              <span className="text-sm font-bold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                {progress}%
              </span>
            </div>
            <div className="relative w-full bg-slate-100/80 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="h-2.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {/* Animated ring on progress */}
                {progress > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-white/30 rounded-full"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Actions with premium styling */}
      <div className="pt-5 space-y-3">
        {isJoined ? (
          <>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGoToFeed}
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] text-white font-bold py-3 rounded-xl transition-all duration-300"
              >
                Go to Feed
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleInvite}
                variant="outline"
                className="w-full border-2 border-slate-300 hover:bg-gradient-to-r hover:from-white/80 hover:to-white/60 font-semibold py-3 rounded-xl"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500">
              Join this community to access exclusive content
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {community.modules && community.modules.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-700 mb-3">What's Inside</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Modules</span>
              <span className="font-semibold text-slate-900">{community.modules.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Total Lessons</span>
              <span className="font-semibold text-slate-900">
                {community.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

