import React, { useState } from "react";
import { User, Users, Clock, CheckCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Community } from "@/types/community";

interface HeroBannerProps {
  community: Community;
  onJoin?: () => void;
  onGoToCommunity?: () => void;
  isJoined?: boolean;
  isProcessing?: boolean;
}

export function HeroBanner({ 
  community, 
  onJoin, 
  onGoToCommunity,
  isJoined = false,
  isProcessing = false 
}: HeroBannerProps) {
  const [showCreatorPopup, setShowCreatorPopup] = useState(false);
  
  const bannerUrl = community.bannerUrl || 
    community.coverMedia?.[0]?.url || 
    community.coverMedia?.[0]?.thumbnail ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&auto=format";

  const slotsClaimed = community.slotsClaimed || community.limit?.claimed || community.membersCount || 0;
  const slotsTotal = community.slotsTotal || community.limit?.seats || community.slotsAvailable || '∞';
  const progress = community.progress || 0;

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl overflow-hidden relative bg-white/40 backdrop-blur-md shadow-xl"
    >
      {/* Banner Image with enhanced gradient */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={bannerUrl}
          alt={community.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&auto=format';
          }}
        />
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#8B5CF6]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Subtle particle effect */}
        {isJoined && (
          <div className="absolute top-4 left-4">
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6 text-white/60" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 -mt-20 md:-mt-24 relative">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left Side - Title & Creator */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-3xl md:text-4xl font-extrabold text-white mb-3"
              style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(139, 92, 246, 0.3)' }}
            >
              {community.title}
            </motion.h1>
            
            {community.subtitle && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-white/90 mb-4 text-base md:text-lg"
                style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}
              >
                {community.subtitle}
              </motion.p>
            )}

            {/* Creator Info with hover popup */}
            <motion.div 
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <div 
                className="flex items-center gap-3 relative"
                onMouseEnter={() => setShowCreatorPopup(true)}
                onMouseLeave={() => setShowCreatorPopup(false)}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="w-12 h-12 border-2 border-white shadow-lg ring-2 ring-white/20">
                    <AvatarImage src={creatorAvatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white">
                      {creatorName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div>
                  <div className="text-sm font-semibold text-white" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>
                    {creatorName}
                  </div>
                  <div className="text-xs text-white/80 flex items-center gap-1" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)' }}>
                    <User className="w-3 h-3" />
                    Creator {creatorLevel && `• Lv. ${creatorLevel}`}
                  </div>
                </div>

                {/* Mini creator popup */}
                <AnimatePresence>
                  {showCreatorPopup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 left-0 z-10 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white/20 min-w-[200px]"
                    >
                      <div className="text-xs text-slate-500 mb-1">About Creator</div>
                      <div className="text-sm font-semibold text-slate-900">{creatorName}</div>
                      {creatorLevel && (
                        <div className="text-xs text-slate-600 mt-1">Level {creatorLevel} Creator</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-slate-700 border-white/40">
                  {community.accessType}
                </Badge>
                {community.privacy && (
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-slate-700 border-white/40">
                    {community.privacy}
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Side - Stats & Actions */}
          <div className="flex-shrink-0">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col items-end gap-3"
            >
              {/* Members Count */}
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 text-sm text-white font-medium"
                  style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 1px 4px rgba(0, 0, 0, 0.7)' }}
                >
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold shadow-xl border border-white/30"
                >
                  <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                    {slotsClaimed} / {slotsTotal}
                  </span>
                </motion.div>
              </div>

              {/* Access Granted Badge */}
              {isJoined && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-md opacity-40" />
                  <div className="relative flex items-center gap-2 text-sm text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full px-4 py-1.5 border border-green-200/50 shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">Access Granted</span>
                  </div>
                </motion.div>
              )}

              {/* Join Button */}
              {!isJoined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Button
                    onClick={onJoin}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:shadow-[0_0_32px_rgba(139,92,246,0.6)] text-white font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {isProcessing ? 'Processing...' : community.claimCost ? `Claim for ${community.claimCost} ZAPs` : 'Join Community'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Progress Bar */}
        {isJoined && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-6 pt-6 border-t border-white/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-white" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}>
                Your Progress
              </div>
              <div className="text-sm font-bold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                {progress}%
              </div>
            </div>
            <div className="relative w-full bg-white/20 backdrop-blur-sm h-3 rounded-full overflow-hidden">
              <motion.div
                className="h-3 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {/* Animated pulse on progress bar */}
                {progress > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-white/30 rounded-full"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
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
    </motion.div>
  );
}

