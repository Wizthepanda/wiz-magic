import React, { useState, useEffect } from "react";
import { Users, CheckCircle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils";

interface HeroBannerV3Props {
  community: Community;
  onJoin?: () => void;
  isJoined?: boolean;
  isProcessing?: boolean;
}

export function HeroBannerV3({
  community,
  onJoin,
  isJoined = false,
  isProcessing = false
}: HeroBannerV3Props) {
  const [textColor, setTextColor] = useState('text-white');

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

  // Format last updated
  const lastUpdated = community.updatedAt
    ? new Date(community.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  // Auto-detect banner brightness for text contrast
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = bannerUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sample center region
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let r = 0, g = 0, b = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const pixelCount = data.length / 4;
      r = Math.floor(r / pixelCount);
      g = Math.floor(g / pixelCount);
      b = Math.floor(b / pixelCount);

      // Calculate brightness (perceived luminance)
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b);

      // If banner is bright (> 180), use dark text
      setTextColor(brightness > 180 ? 'text-gray-800' : 'text-white');
    };
  }, [bannerUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl overflow-hidden relative shadow-2xl"
    >
      {/* Banner Image with gradient overlay */}
      <div className="relative w-full h-56 md:h-72 overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={bannerUrl}
          alt={community.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&auto=format';
          }}
        />

        {/* Adaptive gradient overlay - Enhanced for better readability */}
        <div className={cn(
          "absolute inset-0 transition-all duration-500",
          textColor === 'text-white'
            ? "bg-gradient-to-b from-black/20 via-black/5 to-black/70"
            : "bg-gradient-to-b from-white/10 via-transparent to-black/50"
        )} />

        {/* Subtle glow effect for joined state */}
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
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <span className="text-2xl md:text-3xl font-bold text-white">
                      {community.title[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Glow effect on icon for joined state */}
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
                <h1 className={cn(
                  "text-2xl md:text-4xl font-extrabold mb-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition-colors duration-500",
                  textColor
                )}>
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
                  className={cn(
                    "flex items-center gap-2 mt-2 text-xs transition-colors duration-500",
                    textColor === 'text-white'
                      ? 'text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      : 'text-gray-800 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]'
                  )}
                  style={{ textShadow: textColor === 'text-white' ? '0 2px 8px rgba(0,0,0,0.6)' : '0 1px 4px rgba(255,255,255,0.8)' }}
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
              <div className={cn(
                "text-sm font-medium drop-shadow-md flex items-center gap-2 transition-colors duration-500",
                textColor === 'text-white' ? 'text-white/90' : 'text-gray-800'
              )}>
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
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors duration-500",
                      textColor === 'text-white' ? 'text-white/90' : 'text-gray-800'
                    )}
                    style={{ textShadow: textColor === 'text-white' ? '0 2px 8px rgba(0,0,0,0.6)' : '0 1px 4px rgba(255,255,255,0.8)' }}
                  >
                    Progress
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold transition-colors duration-500",
                      textColor === 'text-white' ? 'text-white' : 'text-gray-900'
                    )}
                    style={{ textShadow: textColor === 'text-white' ? '0 2px 8px rgba(0,0,0,0.6)' : '0 1px 4px rgba(255,255,255,0.8)' }}
                  >
                    {progress}%
                  </span>
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
      </div>
    </motion.div>
  );
}
