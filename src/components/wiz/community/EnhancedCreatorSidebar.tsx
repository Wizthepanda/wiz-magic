import React from "react";
import { motion } from "framer-motion";
import { User, MessageCircle, Flag, ExternalLink, Users, TrendingUp, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Community } from "@/types/community";
import { cn } from "@/lib/utils";

interface EnhancedCreatorSidebarProps {
  community: Community;
  isJoined?: boolean;
}

export function EnhancedCreatorSidebar({ community, isJoined }: EnhancedCreatorSidebarProps) {
  const creatorName = community.creator?.name || community.creatorName || 'Unknown Creator';
  const creatorAvatar = community.creator?.avatarUrl || community.creatorAvatar || null;
  const creatorLevel = community.creator?.level || community.creatorLevel || 1;
  const memberCount = community.membersCount || community.slotsClaimed || 0;
  const capacity = community.slotsTotal || community.slotsAvailable;

  return (
    <div className="sticky top-24 space-y-6">
      {/* Creator Card with Animated Badge Ring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl p-6 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-2xl border border-white/60"
      >
        <div className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">
          Community Creator
        </div>

        {/* Creator Avatar with Level Ring */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {/* Animated ring around avatar */}
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

            <Avatar className="w-16 h-16 relative border-4 border-white shadow-lg">
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
            <div className="font-bold text-slate-900 text-lg">{creatorName}</div>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
        >
          <Flag className="w-4 h-4 mr-2" />
          Report
        </Button>
      </motion.div>

      {/* Community Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl p-6 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-2xl border border-white/60"
      >
        <div className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">
          Community Stats
        </div>

        <div className="space-y-4">
          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">Members</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {memberCount}
              </span>
            </div>
            {capacity && capacity !== '∞' && (
              <div className="h-2 bg-slate-200/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(memberCount / Number(capacity)) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
            )}
          </div>

          {/* Engagement */}
          <StatRow
            icon={TrendingUp}
            label="Engagement"
            value="High"
            color="text-green-600"
          />

          {/* Active Users */}
          <StatRow
            icon={Users}
            label="Active Today"
            value={Math.floor(memberCount * 0.3).toString()}
            color="text-blue-600"
          />
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-3xl p-6 bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-2xl shadow-2xl border border-white/60"
      >
        <div className="text-sm font-bold text-slate-600 mb-4 uppercase tracking-wider">
          Quick Links
        </div>

        <div className="space-y-2">
          <QuickLink href={`/community/${community.id}/members`} label="View Members" />
          <QuickLink href={`/community/${community.id}/leaderboard`} label="Leaderboard" />
          {isJoined && (
            <QuickLink href={`/community/${community.id}/settings`} label="Manage Community" />
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <Icon className={cn("w-4 h-4", color || "text-indigo-600")} />
        <span className="font-medium">{label}</span>
      </div>
      <span className={cn("text-sm font-bold", color || "text-slate-900")}>{value}</span>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <motion.a
      href={href}
      whileHover={{ x: 4 }}
      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-indigo-50/50 transition-all group"
    >
      <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
        {label}
      </span>
      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
    </motion.a>
  );
}
