import React, { useState } from "react";
import { User, Users, Clock, CheckCircle, Sparkles, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils";

interface HeroBannerV2Props {
  community: Community;
  onJoin?: () => void;
  onGoToCommunity?: () => void;
  isJoined?: boolean;
  isProcessing?: boolean;
}

export function HeroBannerV2({
  community,
  onJoin,
  onGoToCommunity,
  isJoined = false,
  isProcessing = false
}: HeroBannerV2Props) {
  const [showCreatorPopup, setShowCreatorPopup] = useState(false);

  const bannerUrl = community.bannerUrl ||
    community.coverMedia?.[0]?.url ||
    community.coverMedia?.[0]?.thumbnail ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&auto=format";

  const communityAvatar = community.iconUrl ||
    community.avatarUrl ||
    community.coverMedia?.[0]?.thumbnail ||
    null;

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

  // Format last updated
  const lastUpdated = community.updatedAt
    ? new Date(community.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl overflow-hidden relative shadow-2xl"
    >
      {/* Banner Image with 10% gradient overlay for readability */}
      <div className="relative w-full h-56 md:h-72 overflow-hidden">
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

        {/* 10% gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Subtle glow effect */}
        {isJoined && (
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.15, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
            />
          </div>
        )}
      </div>

      {/* Content Container - Overlapping Banner */}
      <div className="relative -mt-16 md:-mt-20 px-6 md:px-8 pb-8">
        <div className="flex items-end justify-between gap-6 flex-wrap md:flex-nowrap">
          {/* Left Side - Community Icon + Title */}
          <div className="flex items-end gap-4 flex-1 min-w-0">
            {/* Community Profile Icon (overlapping banner) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex-shrink-0"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl ring-4 ring-white shadow-2xl overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl">
                {communityAvatar ? (
                  <img
                    src={communityAvatar}
                    alt={`${community.title} icon`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {community.title[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Glow effect on icon */}
              {isJoined && (
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-green-400/20 blur-xl -z-10"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Title and Privacy Info */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                  {community.title}
                </h1>

                {/* Privacy Label & Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/90 backdrop-blur-sm text-slate-700 border-0 shadow-md">
                    {community.privacy || community.accessType || 'Public'}
                  </Badge>

                  {community.category && (
                    <Badge variant="outline" className="bg-white/70 backdrop-blur-sm text-slate-600 border-white/50">
                      {community.category}
                    </Badge>
                  )}
                </div>

                {/* Last Updated Timestamp */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2 mt-2 text-xs text-white/80 drop-shadow-md"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Last updated {lastUpdated}</span>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Stats & Actions */}
          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            {/* Members Count */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="text-sm font-medium text-white/90 drop-shadow-md flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 text-sm font-bold shadow-xl border border-white/30">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {slotsClaimed} / {slotsTotal}
                </span>
              </div>
            </motion.div>

            {/* Access Granted / Join Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {isJoined ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl blur-md opacity-50" />
                  <div className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl shadow-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">Access Granted</span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={onJoin}
                  disabled={isProcessing}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-bold text-white shadow-xl transition-all duration-300",
                    "bg-gradient-to-r from-indigo-600 to-purple-600",
                    "hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  )}
                >
                  {isProcessing ? 'Processing...' : community.claimCost ? `Claim for ${community.claimCost} ZAPs` : 'Join Community'}
                </Button>
              )}
            </motion.div>

            {/* Progress Bar */}
            {isJoined && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="w-48 mt-2"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white/90 drop-shadow-md">Progress</span>
                  <span className="text-xs font-bold text-white drop-shadow-md">{progress}%</span>
                </div>
                <div className="h-2 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/30"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Creator Card at Bottom (Glassmorphism) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6 rounded-2xl p-4 bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg"
          onMouseEnter={() => setShowCreatorPopup(true)}
          onMouseLeave={() => setShowCreatorPopup(false)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white/50 shadow-md ring-2 ring-white/20">
                <AvatarImage src={creatorAvatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                  {creatorName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="text-sm font-semibold text-slate-800">{creatorName}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Creator {creatorLevel && `• Level ${creatorLevel}`}
                </div>
              </div>
            </div>

            {/* Creator badge with glow */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-md opacity-40" />
              <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200/50">
                ⭐ Creator
              </div>
            </motion.div>
          </div>

          {/* XP Progress for Creator */}
          {creatorLevel && (
            <div className="mt-3 pt-3 border-t border-slate-200/50">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Creator XP</span>
                <span className="text-slate-700 font-bold">Level {creatorLevel}</span>
              </div>
              <div className="h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${(creatorLevel % 10) * 10 + 25}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
