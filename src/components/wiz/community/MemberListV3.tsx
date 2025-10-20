import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Crown, Shield, User as UserIcon, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import type { Community } from '@/types/community';

interface Member {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLevel?: number;
  role: 'creator' | 'moderator' | 'member';
  isOnline?: boolean;
  joinedAt: any;
}

interface MemberListV3Props {
  community: Community;
  onMessageClick: (memberId: string, memberName: string, memberAvatar?: string) => void;
}

export const MemberListV3: React.FC<MemberListV3Props> = ({ community, onMessageClick }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  // Load members in real-time
  useEffect(() => {
    if (!community.id) return;

    const membersQuery = query(
      collection(db, 'community_members'),
      where('communityId', '==', community.id)
    );

    const unsubscribe = onSnapshot(membersQuery, async (snapshot) => {
      const loadedMembers: Member[] = [];

      for (const docSnap of snapshot.docs) {
        const memberData = docSnap.data();

        // Fetch user profile data
        const userRef = doc(db, 'users', memberData.userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        loadedMembers.push({
          id: docSnap.id,
          userId: memberData.userId,
          userName: userData.displayName || memberData.userName || 'Unknown Member',
          userAvatar: userData.photoURL || memberData.userAvatar,
          userLevel: userData.level || 1,
          role: memberData.role || (memberData.userId === community.creatorId ? 'creator' : 'member'),
          isOnline: userData.isOnline || false,
          joinedAt: memberData.joinedAt,
        });
      }

      // Sort: Creator first, then moderators, then members
      loadedMembers.sort((a, b) => {
        const roleOrder = { creator: 0, moderator: 1, member: 2 };
        if (roleOrder[a.role] !== roleOrder[b.role]) {
          return roleOrder[a.role] - roleOrder[b.role];
        }
        return b.userLevel! - a.userLevel!;
      });

      setMembers(loadedMembers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [community.id, community.creatorId]);

  const getRoleBadge = (role: Member['role']) => {
    switch (role) {
      case 'creator':
        return (
          <Badge className="bg-gradient-to-r from-amber-400/20 to-orange-400/20 border-amber-400/30 text-amber-300 text-xs flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Creator
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border-blue-400/30 text-blue-300 text-xs flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Mod
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
              <div className="h-3 bg-white/10 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Members
          </h3>
        </div>
        <Badge variant="outline" className="bg-indigo-500/10 border-indigo-400/30 text-indigo-300">
          {members.length}
        </Badge>
      </div>

      {/* Member List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
        <AnimatePresence>
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 300
              }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
              className={cn(
                "relative group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer",
                "bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20",
                hoveredMember === member.id && "shadow-[0_0_20px_-5px_rgba(155,93,229,0.4)]"
              )}
            >
              {/* Online Status Ring */}
              <div className="relative flex-shrink-0">
                <Avatar className={cn(
                  "w-10 h-10 border-2 transition-all duration-300",
                  member.isOnline
                    ? "border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                    : "border-white/20"
                )}>
                  <AvatarImage src={member.userAvatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold">
                    {member.userName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Online Indicator */}
                {member.isOnline && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-900"
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-full h-full rounded-full bg-emerald-300"
                    />
                  </motion.div>
                )}

                {/* Level Ring (for high-level members) */}
                {member.userLevel && member.userLevel >= 5 && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, #8B5CF6 0%, #F15BB5 ${(member.userLevel / 100) * 360}deg, transparent ${(member.userLevel / 100) * 360}deg)`,
                      padding: '2px',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white truncate">
                    {member.userName}
                  </span>
                  {getRoleBadge(member.role)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">
                    Level {member.userLevel}
                  </span>

                  {member.isOnline && (
                    <span className="text-xs text-emerald-400 font-medium">
                      • Online
                    </span>
                  )}
                </div>
              </div>

              {/* Message Button (appears on hover) */}
              <AnimatePresence>
                {hoveredMember === member.id && member.role !== 'creator' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMessageClick(member.userId, member.userName, member.userAvatar);
                      }}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-8 h-8 p-0 shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Online Count Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20"
      >
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-medium">
            {members.filter(m => m.isOnline).length} online
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/60">
            {members.length} total members
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
