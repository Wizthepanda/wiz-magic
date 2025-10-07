import React from "react";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle, Share2, Crown } from "lucide-react";
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
    // Navigate back to community discovery page
    navigate('/community');
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }} 
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 sticky top-24"
    >
      {/* Creator Info */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-200">
        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
          <AvatarImage src={creatorAvatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white">
            {creatorName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 mb-0.5">Creator</div>
          <div className="font-semibold text-slate-900 truncate">
            {creatorName}
          </div>
          {creatorLevel && (
            <div className="flex items-center gap-1 mt-0.5">
              <Crown className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-slate-600">Level {creatorLevel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Access Details */}
      <div className="py-5 space-y-4 border-b border-slate-200">
        <div>
          <div className="text-sm font-medium text-slate-700 mb-3">Access Details</div>
          
          <div className="space-y-3">
            {/* Access Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Type</span>
              <Badge variant="outline" className="font-medium">
                {community.accessType}
              </Badge>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Duration</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                {community.duration || 'Lifetime'}
              </span>
            </div>

            {/* Members */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="w-4 h-4" />
                <span>Members</span>
              </div>
              <span className="text-sm font-medium text-slate-900">
                {community.slotsClaimed || community.membersCount || 0} / {community.slotsTotal || community.slotsAvailable || '∞'}
              </span>
            </div>

            {/* Status */}
            {isJoined && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Access Granted</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (if joined) */}
        {isJoined && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Your Progress</span>
              <span className="text-sm font-semibold text-[#8B5CF6]">
                {community.progress || 0}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="h-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]"
                initial={{ width: 0 }}
                animate={{ width: `${community.progress || 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-5 space-y-3">
        {isJoined ? (
          <>
            <Button
              onClick={handleGoToFeed}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:shadow-md text-white font-semibold"
            >
              Go to Feed
            </Button>
            <Button
              onClick={handleInvite}
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>
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

