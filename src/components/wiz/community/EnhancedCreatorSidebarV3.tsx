import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Award, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Community } from "@/types/community";
import { InviteModal } from "./InviteModal";
import { MemberListV3 } from "./MemberListV3";
import { MessagePopIn } from "./MessagePopIn";
import { useNavigate } from "react-router-dom";

interface EnhancedCreatorSidebarV3Props {
  community: Community;
  isJoined?: boolean;
}

export function EnhancedCreatorSidebarV3({ community, isJoined }: EnhancedCreatorSidebarV3Props) {
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);

  const creatorName = community.creator?.name || community.creatorName || 'Unknown Creator';
  const creatorAvatar = community.creator?.avatarUrl || community.creatorAvatar || null;
  const creatorLevel = community.creator?.level || community.creatorLevel || 1;

  const handleMessageClick = (memberId: string, memberName: string, memberAvatar?: string) => {
    setMessageRecipient({ id: memberId, name: memberName, avatar: memberAvatar });
  };

  const handleCreatorClick = () => {
    navigate(`/creator/${community.creatorId}`);
  };

  return (
    <div className="sticky top-24 space-y-6">
      {/* Creator Card - Simplified & Decluttered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl p-6 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-2xl border border-white/60"
      >
        <div className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">
          Community Creator
        </div>

        {/* Creator Avatar with Level Ring - Clickable */}
        <div
          onClick={handleCreatorClick}
          className="flex items-center gap-4 mb-4 cursor-pointer group"
        >
          <div className="relative">
            {/* Animated level ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, #6366F1 0%, #8B5CF6 ${(creatorLevel / 100) * 360}deg, transparent ${(creatorLevel / 100) * 360}deg)`,
                padding: '3px',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full bg-white" />
            </motion.div>

            <Avatar className="w-16 h-16 relative border-4 border-white shadow-lg group-hover:scale-105 transition-transform">
              <AvatarImage src={creatorAvatar || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                {creatorName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Level Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white shadow-lg flex items-center justify-center"
            >
              <span className="text-xs font-bold text-white">{creatorLevel}</span>
            </motion.div>
          </div>

          <div className="flex-1">
            <div className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
              {creatorName}
            </div>
            <div className="text-sm text-slate-600 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Level {creatorLevel} Creator
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-600 font-medium">Creator XP</span>
            <span className="text-indigo-600 font-bold">{(creatorLevel % 10) * 250 + 150} / 1000</span>
          </div>
          <div className="relative h-2 bg-slate-200/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((creatorLevel % 10) * 25 + 15)}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            >
              <motion.div
                className="absolute inset-0 bg-white/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>

        {/* Action Buttons - Simplified to just Invite */}
        <Button
          onClick={() => setShowInviteModal(true)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-[0_0_25px_-5px_rgba(155,93,229,0.5)]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite People
        </Button>
      </motion.div>

      {/* Member List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl p-6 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-2xl border border-white/60"
      >
        <MemberListV3
          community={community}
          onMessageClick={handleMessageClick}
        />
      </motion.div>

      {/* Invite Modal */}
      <InviteModal
        community={community}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Message Pop-In */}
      {messageRecipient && (
        <MessagePopIn
          recipientId={messageRecipient.id}
          recipientName={messageRecipient.name}
          recipientAvatar={messageRecipient.avatar}
          onClose={() => setMessageRecipient(null)}
        />
      )}
    </div>
  );
}
