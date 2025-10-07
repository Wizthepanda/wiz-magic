import React from "react";
import { User, Users, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="rounded-2xl overflow-hidden relative bg-white/30 backdrop-blur-md shadow-lg">
      {/* Banner Image */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <img
          src={bannerUrl}
          alt={community.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=400&fit=crop&auto=format';
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 -mt-20 md:-mt-24 relative">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left Side - Title & Creator */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="text-3xl md:text-4xl font-extrabold text-white mb-3"
              style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.5)' }}
            >
              {community.title}
            </motion.h1>
            
            {community.subtitle && (
              <p className="text-slate-600 mb-4 text-base md:text-lg">
                {community.subtitle}
              </p>
            )}

            {/* Creator Info */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                  <AvatarImage src={creatorAvatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white">
                    {creatorName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {creatorName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Creator {creatorLevel && `• Lv. ${creatorLevel}`}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white/60 text-slate-700">
                  {community.accessType}
                </Badge>
                {community.privacy && (
                  <Badge variant="outline" className="bg-white/60 text-slate-700">
                    {community.privacy}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex-shrink-0">
            <div className="flex flex-col items-end gap-3">
              {/* Slots Info */}
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 text-sm text-white font-medium"
                  style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.6)' }}
                >
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                </div>
                <div 
                  className="bg-white/90 rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg"
                  style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
                >
                  {slotsClaimed} / {slotsTotal}
                </div>
              </div>

              {/* Access Info */}
              {isJoined && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-full px-4 py-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Access Granted</span>
                </div>
              )}

              {/* Action Button - Hidden when already in community */}
              {!isJoined && (
                <div>
                  <Button
                    onClick={onJoin}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] text-white font-semibold transition-all"
                  >
                    {isProcessing ? 'Processing...' : community.claimCost ? `Claim for ${community.claimCost} ZAPs` : 'Join Community'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isJoined && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-700">Your Progress</div>
              <div className="text-sm font-semibold text-[#8B5CF6]">{progress}%</div>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <motion.div
                className="h-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

